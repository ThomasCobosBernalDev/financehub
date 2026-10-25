// Unit 1, Lesson 3: Inflation and GDP
(function () {
  const LESSON = "u1-inflation";
  const { $, $$, fillRange, wait } = FHLesson;
  const money = FH.money;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const pct = (x, d = 1) => `${x > 0 ? "+" : ""}${x.toFixed(d)}%`;

  // ---------- See it: price time machine ----------
  // Annual average CPI-U (BLS, 1982–84 = 100).
  const YEARS = [1970, 1980, 1990, 2000, 2010, 2020, 2024];
  const CPI = [38.8, 82.4, 130.7, 172.2, 218.1, 258.8, 313.7];
  const ITEMS = [
    ["Movie ticket", 11], ["Gallon of milk", 4], ["Burger", 6], ["Gallon of gas", 3.3], ["Month of rent", 1500], ["Year of tuition", 11000],
  ];
  const basket = $("#tm-basket");
  ITEMS.forEach(([name]) => { const d = document.createElement("div"); d.className = "item"; d.innerHTML = `<small>${name}</small><b>$0</b>`; basket.appendChild(d); });
  const tmSlider = $("#tm-slider");
  const billBox = $(".bill-box");
  billBox.innerHTML = `<figure><div class="bill then" id="bill-then"><span>$100</span></div><figcaption id="bill-then-cap">then</figcaption></figure><figure><div class="bill now"><span>$100</span></div><figcaption>2024</figcaption></figure>`;
  const fmt = (v) => v >= 100 ? money(v) : `$${v.toFixed(2)}`;
  const renderTM = () => {
    fillRange(tmSlider);
    const i = +tmSlider.value, k = CPI[i] / CPI[6];
    $("#tm-year").textContent = YEARS[i];
    $("#tm-sub").textContent = i === 6 ? "today's prices" : `$100 then buys what ${money(100 / k)} buys today`;
    $$(".item b", basket).forEach((b, j) => { b.textContent = fmt(ITEMS[j][1] * k); });
    $$(".tm-years span").forEach((s, j) => s.classList.toggle("on", j === i));
    const scale = Math.sqrt(1 / k);
    const bill = $("#bill-then");
    bill.style.width = `${92 * scale}px`; bill.style.height = `${46 * scale}px`; bill.style.fontSize = `${18 * scale}px`;
    $("#bill-then-cap").textContent = i === 6 ? "2024" : `in ${YEARS[i]}`;
    $("#tm-bill-note").innerHTML = i === 6
      ? "Drag back in time to compare a $100 bill from then with one from today."
      : `A $100 bill in ${YEARS[i]} had the buying power of <b>${money(100 / k)}</b> today, so it's drawn ${(1 / k).toFixed(1)} times bigger. Prices for rent and tuition actually rose faster than the CPI average.`;
    if (i === 0) FH.badge("time-traveler", "Time Traveler");
  };
  tmSlider.addEventListener("input", renderTM);
  renderTM();

  const GDP = {
    c: "<b>C, consumption: about 68%.</b> Everything households buy: groceries, rent, haircuts, phones, and the bikes people bought from your stall. It's the biggest engine of the US economy.",
    i: "<b>I, investment: about 18%.</b> Businesses buying equipment and buildings, plus new homes. Not stocks: buying a share just moves ownership. A new repair stand for your stall counts.",
    g: "<b>G, government: about 17%.</b> Government purchases: roads, teachers' salaries, the military. Not Social Security checks, since those are transfers, not purchases of goods.",
  };
  $$("#gdp-bar button").forEach((b) => b.addEventListener("click", () => {
    $$("#gdp-bar button").forEach((x) => x.classList.toggle("on", x === b));
    $("#gdp-msg").innerHTML = GDP[b.dataset.g];
  }));

  // ---------- Play it: Beat Inflation ----------
  // Annual CPI inflation (BLS). Bank and TIPS rates are simplified, rounded era averages.
  const ERAS = {
    "70s": { name: "The 1970s", years: [1974, 1975, 1976, 1977, 1978], infl: [11.0, 9.1, 5.8, 6.5, 7.6], prev: 6.2, bank: [5, 5, 5, 5, 5], tips: null,
      intro: "Oil shocks and rising prices. Banks were capped by law at about 5% on savings." },
    "10s": { name: "The 2010s", years: [2015, 2016, 2017, 2018, 2019], infl: [0.1, 1.3, 2.1, 2.4, 1.8], prev: 1.6, bank: [1, 1, 1, 1.5, 1.8], tips: [0.4, 0.3, 0.4, 0.8, 0.6],
      intro: "Calm years. Prices barely moved and rates stayed low." },
    "20s": { name: "The 2020s", years: [2020, 2021, 2022, 2023, 2024], infl: [1.2, 4.7, 8.0, 4.1, 2.9], prev: 1.8, bank: [0.5, 0.5, 1.5, 4.5, 4.5], tips: [-0.5, -1.0, -0.5, 1.5, 2.0],
      intro: "A pandemic, stimulus checks and supply chain chaos." },
  };
  const BEST_PROFIT = 500; // at r = 1.15, where demand 20(1.4 − r)/0.25 meets a real cost of $90
  let E, G;
  const reset = () => { G = { y: 0, price: 115, idx: 1, nominal: 1000, real: 1000, bestReal: 1000, profit: 0, save: "cash", hist: [{ n: 1000, r: 1000 }], busy: false }; };
  reset();

  const raise = $("#b-raise");
  const renderRaise = () => {
    fillRange(raise);
    $("#b-raise-v").textContent = `+${(+raise.value).toFixed(1).replace(".0", "")}%`;
    $("#b-price-hint").textContent = `New bike price: ${money(G.price * (1 + raise.value / 100))}`;
  };
  raise.addEventListener("input", renderRaise);
  $$("#b-save button").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    G.save = b.dataset.s;
    $$("#b-save button").forEach((x) => x.classList.toggle("on", x === b));
  }));

  $$("#b-eras button").forEach((b) => b.addEventListener("click", () => {
    let k = b.dataset.era;
    if (k === "mystery") k = ["70s", "10s", "20s"][Math.floor(Math.random() * 3)];
    E = ERAS[k];
    reset();
    $("#b-eras").classList.add("hidden");
    $("#b-play").classList.remove("hidden");
    $("#b-chart").classList.remove("hidden");
    $("#b-go").disabled = false;
    $("#b-log").innerHTML = "";
    const li = document.createElement("li");
    li.innerHTML = `<b>${E.name}.</b> ${E.intro} You start with $1,000 in savings and sell bikes for $115.`;
    $("#b-log").prepend(li);
    startYear();
  }));

  const startYear = () => {
    const y = G.y;
    $("#b-era").textContent = `${E.name} · year ${y + 1} of 5`;
    $("#b-year").textContent = E.years[y];
    const last = y ? E.infl[y - 1] : E.prev;
    $("#b-hint").innerHTML = `Last year, prices rose <b>${last.toFixed(1)}%</b>. Nobody knows this year's number yet.`;
    const tipsBtn = $('[data-s="tips"]');
    tipsBtn.disabled = !E.tips;
    if (!E.tips && G.save === "tips") { G.save = "cash"; }
    $$("#b-save button").forEach((x) => x.classList.toggle("on", x.dataset.s === G.save));
    $("#b-save-hint").innerHTML = `Cash pays 0%. Bank savings pay <b>${E.bank[y]}%</b>. ` + (E.tips ? `The inflation-protected bond pays inflation <b>${pct(E.tips[y])}</b>.` : "Inflation-protected bonds (TIPS) didn't exist until 1997.");
    renderRaise();
    drawChart();
  };

  const drawChart = () => {
    const h = G.hist;
    const vals = h.flatMap((p) => [p.n, p.r]);
    const lo = Math.min(800, ...vals) - 20, hi = Math.max(1200, ...vals) + 20;
    const X = (i) => 60 + i * 124, Y = (v) => 190 - ((v - lo) / (hi - lo)) * 170;
    const ticks = $("#b-ticks");
    ticks.innerHTML = "";
    [lo + 20, 1000, hi - 20].forEach((v) => { el("text", { x: 52, y: Y(v) + 4, "text-anchor": "end" }, ticks).textContent = money(v); });
    E.years.forEach((yr, i) => { el("text", { x: X(i + 1), y: 208, "text-anchor": "middle" }, ticks).textContent = yr; });
    el("text", { x: X(0), y: 208, "text-anchor": "middle" }, ticks).textContent = "start";
    const line = (k) => h.map((p, i) => `${i ? "L" : "M"}${X(i)} ${Y(p[k]).toFixed(1)}`).join(" ");
    $("#b-nom").setAttribute("d", line("n"));
    $("#b-real").setAttribute("d", line("r"));
    const dots = $("#b-dots");
    dots.innerHTML = "";
    h.forEach((p, i) => el("circle", { cx: X(i), cy: Y(p.r), r: 5, fill: "var(--savings)", stroke: "var(--card)", "stroke-width": 2 }, dots));
  };

  $("#b-go").addEventListener("click", async () => {
    if (G.busy || !E) return;
    G.busy = true;
    $("#b-go").disabled = true;
    const y = G.y, inf = E.infl[y] / 100;
    // Your stall: competitors' prices rise with inflation.
    G.price *= 1 + raise.value / 100;
    G.idx *= 1 + inf;
    const r = G.price / (100 * G.idx);
    const q = Math.max(0, (20 * (1.4 - r)) / 0.25);
    const units = Math.round(q);
    const realProfit = (q * (G.price - 90 * G.idx)) / G.idx;
    G.profit += realProfit;
    // Your savings.
    const rate = { cash: 0, bank: E.bank[y] / 100, tips: E.tips ? inf + E.tips[y] / 100 : 0 }[G.save];
    const before = G.real;
    G.nominal *= 1 + rate;
    G.real = G.nominal / G.idx;
    const bestRate = Math.max(0, E.bank[y] / 100, E.tips ? inf + E.tips[y] / 100 : 0);
    G.bestReal *= (1 + bestRate) / (1 + inf);
    G.hist.push({ n: G.nominal, r: G.real });

    $("#b-year").innerHTML = `${E.years[y]}: <span style="color:var(--danger)">prices ${pct(E.infl[y])}</span>`;
    await wait(400);
    $("#b-nominal").textContent = money(G.nominal);
    $("#b-realv").textContent = money(G.real);
    $("#b-realv").style.color = G.real < 1000 ? "var(--danger)" : "var(--good)";
    $("#b-profit").textContent = money(G.profit);
    drawChart();

    const realChange = ((1 + raise.value / 100) / (1 + inf) - 1) * 100;
    const priceNote = Math.abs(realChange) < 0.6
      ? "You kept your bike price in step with inflation, which is the sweet spot."
      : realChange < 0 ? `Your price fell ${Math.abs(realChange).toFixed(1)}% in real terms, so you sold more but earned less on each bike.`
      : `Your price rose ${realChange.toFixed(1)}% faster than everyone else's, so shoppers went elsewhere.`;
    const saveName = { cash: "the cash drawer", bank: "bank savings", tips: "the protected bond" }[G.save];
    const li = document.createElement("li");
    li.className = G.real >= before ? "good" : "bad";
    li.innerHTML = `<b>${E.years[y]}</b>: inflation ${E.infl[y].toFixed(1)}%. ${priceNote} You sold ${units} bikes for ${money(realProfit)} of real profit (best possible ${money(BEST_PROFIT)}). Savings in ${saveName} ${G.real >= before ? "gained" : "lost"} <b>${money(Math.abs(G.real - before))}</b> of buying power.`;
    $("#b-log").prepend(li);
    G.y++;
    G.busy = false;
    if (G.y < 5) { $("#b-go").disabled = false; startYear(); }
    else finish();
  });

  const finish = () => {
    $("#b-play").classList.add("hidden");
    $("#b-go").disabled = true;
    $("#b-era").textContent = `${E.name} · done`;
    const pPart = Math.min(1, G.profit / (BEST_PROFIT * 5)) * 60;
    const sPart = Math.min(1, G.real / G.bestReal) * 40;
    const score = Math.round(pPart + sPart);
    const grade = score >= 92 ? "A" : score >= 82 ? "B" : score >= 70 ? "C" : "D";
    const res = $("#b-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score} / 100</b><p>Your savings show <b>${money(G.nominal)}</b>, but in starting-year dollars they're worth <b>${money(G.real)}</b>. ${G.real < 1000 ? "More dollars, less stuff. That gap is inflation." : "You kept your buying power growing. That's what beating inflation means."}</p></div></div>
      <button class="btn line" id="b-again">Try another era</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    FH.addXP(first ? 50 : 15, first ? "Finished Beat Inflation" : "Another trip through time");
    if (grade === "A") FH.badge("beat-inflation-a", "Beat Inflation: A");
    FH.save();
    $("#b-again").addEventListener("click", () => {
      res.classList.add("hidden");
      $("#b-chart").classList.add("hidden");
      $("#b-eras").classList.remove("hidden");
      $("#b-year").textContent = "Where to?";
      $("#b-era").textContent = "Choose an era";
      ["#b-nominal", "#b-realv"].forEach((s) => { $(s).textContent = "$1,000"; $(s).style.color = ""; });
      $("#b-profit").textContent = "$0";
    });
  };

  // ---------- Check ----------
  const QUIZ = [
    { q: "The CPI rises from 250 to 265 over a year. What was the inflation rate?",
      opts: ["5%", "6%", "15%", "2.65%"], a: 1,
      why: "(265 − 250) ÷ 250 = 15 ÷ 250 = 0.06, or 6%." },
    { q: "Your savings account pays 2% while inflation is 5%. Your approximate real return is:",
      opts: ["+7%", "+3%", "−3%", "−2.5%"], a: 2,
      why: "Real ≈ nominal − inflation = 2% − 5% = −3%. Your balance grows, but its buying power shrinks." },
    { q: "Which of these is counted in GDP?",
      opts: ["A used car sold by a dealer this year", "A new laptop made and sold this year", "Shares of stock bought on an exchange", "A Social Security check"], a: 1,
      why: "GDP counts final goods and services produced this year. Used goods were counted when made, stocks are just ownership, and Social Security is a transfer payment." },
    { q: "Nominal GDP grew 6% last year while the GDP price index rose 4%. Real GDP grew about:",
      opts: ["10%", "6%", "4%", "2%"], a: 3,
      why: "Real growth ≈ nominal growth − price growth = 6% − 4% = 2%." },
    { q: "A movie ticket cost $4 when the CPI was 130. The CPI is now 310. What's that ticket in today's dollars?",
      opts: ["$5.20", "$7.75", "$9.54", "$12.40"], a: 2,
      why: "Today's price = 4 × (310 ÷ 130) = 4 × 2.385 ≈ $9.54." },
    { q: "Who is hurt most by unexpectedly high inflation?",
      opts: ["Borrowers with fixed-rate loans", "Savers holding cash and lenders at fixed rates", "Homeowners with fixed-rate mortgages", "Companies that can raise prices easily"], a: 1,
      why: "Inflation shrinks the real value of money owed and money held. Lenders and cash savers get paid back in cheaper dollars; fixed-rate borrowers benefit." },
    { q: "Using the rule of 70, if inflation runs at 3.5% a year, how long until prices double?",
      opts: ["About 10 years", "About 20 years", "About 35 years", "About 70 years"], a: 1,
      why: "70 ÷ 3.5 = 20 years. The rule of 70 works for anything growing at a steady percentage." },
  ];

  FHLesson.init({ id: LESSON, short: "inflation", quiz: QUIZ });
})();
