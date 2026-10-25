// Unit 1, Lesson 2: Supply and demand
(function () {
  const LESSON = "u1-supply-demand";
  const { $, $$, fillRange, wait, shuffle } = FHLesson;
  const money = FH.money;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // ---------- See it: the bike market ----------
  // Price 0..200 on y (380..60), quantity 0..100 on x (70..570).
  const X = (q) => 70 + q * 5, Y = (p) => 380 - p * 1.6;
  const BASE = { a: 100, s0: 0 };
  let mk = { ...BASE };
  const qd = (p, m = mk) => Math.max(0, m.a - p / 2);
  const qs = (p, m = mk) => Math.max(0, (p - 20) / 2 + m.s0);
  const eq = (m = mk) => { const p = (2 * m.a + 20 - 2 * m.s0) / 2; return { p, q: qd(p, m) }; };
  const curve = (f, m) => {
    let d = "";
    for (let p = 0; p <= 200; p += 5) { const q = f(p, m); if (q <= 0 || q > 100) continue; d += `${d ? "L" : "M"}${X(q).toFixed(1)} ${Y(p).toFixed(1)} `; }
    return d;
  };
  const ticks = $("#sd-ticks");
  for (let p = 50; p <= 200; p += 50) el("text", { x: 60, y: Y(p) + 4, "text-anchor": "end" }, ticks).textContent = `$${p}`;
  for (let q = 0; q <= 100; q += 20) el("text", { x: X(q), y: 398, "text-anchor": "middle" }, ticks).textContent = q;

  const slider = $("#sd-slider");
  const renderSD = () => {
    fillRange(slider);
    const p = +slider.value;
    $("#sd-price").textContent = money(p);
    $("#sd-d").setAttribute("d", curve(qd, mk));
    $("#sd-s").setAttribute("d", curve(qs, mk));
    const e = eq();
    $("#sd-eq").setAttribute("cx", X(e.q)); $("#sd-eq").setAttribute("cy", Y(e.p));
    const d = qd(p), s = qs(p);
    $("#sd-pline").setAttribute("d", `M70 ${Y(p)} H570`);
    $("#sd-qd").setAttribute("cx", X(Math.min(100, d))); $("#sd-qd").setAttribute("cy", Y(p));
    $("#sd-qs").setAttribute("cx", X(Math.min(100, s))); $("#sd-qs").setAttribute("cy", Y(p));
    $("#sd-qd-n").textContent = Math.round(d);
    $("#sd-qs-n").textContent = Math.round(s);
    const gap = $("#sd-gap");
    gap.setAttribute("d", `M${X(Math.min(100, d))} ${Y(p)} H${X(Math.min(100, s))}`);
    const m = $("#sd-msg");
    if (Math.abs(d - s) < 2) {
      gap.setAttribute("stroke", "var(--accent)");
      m.innerHTML = `<b class="c-good">Equilibrium.</b> At ${money(p)}, about ${Math.round(d)} bikes are wanted and ${Math.round(s)} are for sale. Nobody's left waiting and nothing's left over.`;
      FH.badge("found-equilibrium", "Found the Equilibrium");
    } else if (d > s) {
      gap.setAttribute("stroke", "var(--needs)");
      m.innerHTML = `<b>Shortage of ${Math.round(d - s)}.</b> At ${money(p)}, more people want bikes than sellers bring. Lines form, bikes sell out, and sellers raise prices.`;
    } else {
      gap.setAttribute("stroke", "var(--wants)");
      m.innerHTML = `<b>Surplus of ${Math.round(s - d)}.</b> At ${money(p)}, sellers bring more bikes than people want. Bikes sit unsold, so sellers cut prices.`;
    }
  };
  slider.addEventListener("input", renderSD);
  const SHOCKS = {
    school: { f: (m) => { m.a += 20; }, msg: "<b>Demand shifted right.</b> Students need bikes to get to class, so more people want one at every price. The new equilibrium has a higher price and more bikes sold." },
    bigbox: { f: (m) => { m.a -= 25; }, msg: "<b>Demand shifted left.</b> New bikes at a big-box store are a substitute, so fewer people want used ones. Price and quantity both fall." },
    parts: { f: (m) => { m.s0 += 15; }, msg: "<b>Supply shifted right.</b> Cheaper parts make fixing bikes more profitable, so sellers bring more at every price. Price falls, quantity rises." },
  };
  $$("[data-shock]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.shock;
    const oldD = $("#sd-d-old"), oldS = $("#sd-s-old");
    if (k === "reset") { mk = { ...BASE }; oldD.setAttribute("opacity", 0); oldS.setAttribute("opacity", 0); $$("[data-shock]").forEach((x) => x.classList.remove("on")); renderSD(); return; }
    oldD.setAttribute("d", curve(qd, mk)); oldS.setAttribute("d", curve(qs, mk));
    oldD.setAttribute("opacity", k === "parts" ? 0 : 1); oldS.setAttribute("opacity", k === "parts" ? 1 : 0);
    SHOCKS[k].f(mk);
    b.classList.add("on");
    const e = eq();
    slider.value = Math.round(e.p / 5) * 5;
    renderSD();
    $("#sd-msg").innerHTML = SHOCKS[k].msg + ` New equilibrium: about <b>${money(e.p)}</b> and <b>${Math.round(e.q)}</b> bikes.`;
  }));
  renderSD();

  // ---------- Play it: Market Stall ----------
  const COST = 30, WEEKS = 6;
  const EVENTS = [
    { id: "school", news: "School starts Monday. Lots of students are shopping for bikes.", n: 16, lo: 60, hi: 190 },
    { id: "rain", news: "Rain all morning. Only a few shoppers will show up.", n: 5, lo: 50, hi: 170 },
    { id: "bigbox", news: "A big-box store opened nearby selling new bikes for $120. Nobody will pay more than that for a used one.", n: 10, lo: 50, hi: 170, cap: 120 },
    { id: "news", news: "The local news ran a story on biking to work. Shoppers will pay about $30 more than usual.", n: 11, lo: 80, hi: 200 },
  ];
  const NORMAL = { news: "A normal Saturday. About 10 shoppers expected.", n: 10, lo: 50, hi: 170 };
  const G = { week: 0, stock: 4, rev: 0, opt: 0, sold: 0, fixed: 4, busy: false };
  let deck, wk;
  const newDeck = () => [NORMAL, ...shuffle([...EVENTS]), { ...NORMAL, news: "Last Saturday of the summer. A normal crowd of about 10." }];
  deck = newDeck();

  const priceIn = $("#m-price");
  const renderPrice = () => { fillRange(priceIn); $("#m-price-v").textContent = money(+priceIn.value); $("#stall-price").textContent = money(+priceIn.value); };
  priceIn.addEventListener("input", renderPrice);

  const bikesG = $("#stall-bikes");
  const drawBikes = () => {
    bikesG.innerHTML = "";
    const n = Math.min(G.stock, 10);
    for (let i = 0; i < n; i++) {
      const g = el("g", { transform: `translate(${8 + (i % 5) * 36} ${i < 5 ? 84 : 66}) scale(.42)`, class: "mini-bike" }, bikesG);
      el("circle", { cx: 0, cy: 18, r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 4 }, g);
      el("circle", { cx: 52, cy: 18, r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 4 }, g);
      el("path", { d: "M0 18 L16 -6 H42 L52 18 M16 -6 L28 18 L42 -6 M10 -14 H22", fill: "none", stroke: ["var(--needs)", "var(--savings)", "var(--wants)", "var(--accent)"][i % 4], "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    }
  };
  const startWeek = () => {
    wk = deck[G.week];
    $("#m-week").textContent = `Saturday ${G.week + 1} of ${WEEKS}`;
    $("#m-stock").textContent = `${G.stock} bike${G.stock === 1 ? "" : "s"} ready`;
    $("#m-news").innerHTML = `<b>${wk.news}</b>`;
    $("#m-open").disabled = false;
    $("#crowd").innerHTML = "";
    drawBikes();
  };
  const makeBuyers = () => Array.from({ length: wk.n + Math.round(Math.random() * 2 - 1) }, () => {
    let r = wk.lo + Math.random() * (wk.hi - wk.lo);
    if (wk.cap) r = Math.min(r, wk.cap);
    return Math.round(r);
  });
  const bestRevenue = (buyers, stock) => {
    let best = 0, bestP = 0;
    for (const p of new Set(buyers)) { const r = Math.min(stock, buyers.filter((b) => b >= p).length) * p; if (r > best) { best = r; bestP = p; } }
    return { best, bestP };
  };
  const person = (i) => {
    const g = el("g", { class: "buyer" }, $("#crowd"));
    const hue = ["var(--needs)", "var(--wants)", "var(--savings)", "#7a5bb5", "var(--accent)"][i % 5];
    el("circle", { cx: 0, cy: -38, r: 9, fill: "#f2c9a5", stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    el("path", { d: "M-10 0 C-11 -24 11 -24 10 0 Z", fill: hue, stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    const tag = el("text", { y: -54, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: "var(--ink)", opacity: 0 }, g);
    return { g, tag };
  };
  const move = (g, from, to, ms, delay = 0) => g.animate([{ transform: `translate(${from[0]}px, ${from[1]}px)` }, { transform: `translate(${to[0]}px, ${to[1]}px)` }], { duration: ms, delay, easing: "ease-in-out", fill: "forwards" }).finished;

  $("#m-open").addEventListener("click", async () => {
    if (G.busy) return;
    G.busy = true;
    $("#m-open").disabled = true;
    priceIn.disabled = true;
    const p = +priceIn.value;
    const buyers = makeBuyers();
    const willing = buyers.filter((b) => b >= p).length;
    const sold = Math.min(G.stock, willing);
    const { best, bestP } = bestRevenue(buyers, G.stock);
    // Walk the crowd in.
    const people = buyers.map((r, i) => ({ r, i, ...person(i) }));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let left = sold;
    await Promise.all(people.map((pp, i) => {
      pp.spot = [270 + (i % 9) * 30 + (Math.floor(i / 9) % 2) * 15, 284 + (Math.floor(i / 9) % 2) * 14];
      return move(pp.g, [-30 - i * 20, pp.spot[1]], pp.spot, reduce ? 1 : 900 + i * 60);
    }));
    for (const pp of shuffle(people)) {
      const buys = pp.r >= p && left > 0;
      pp.tag.textContent = buys ? "Sold!" : pp.r >= p ? "Sold out" : "Too much";
      pp.tag.setAttribute("fill", buys ? "var(--good)" : "var(--danger)");
      pp.tag.setAttribute("opacity", 1);
      pp.tag.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 1400, fill: "forwards" });
      if (buys) {
        left--;
        G.stock--;
        drawBikes();
        move(pp.g, pp.spot, [600 + Math.random() * 120, 288], reduce ? 1 : 500).then(() => move(pp.g, [660, 288], [860, 288], reduce ? 1 : 700));
      } else move(pp.g, pp.spot, [-60, pp.spot[1]], reduce ? 1 : 1100, 200);
      await wait(reduce ? 20 : 160);
    }
    await wait(reduce ? 50 : 900);

    const rev = sold * p;
    G.rev += rev; G.opt += best; G.sold += sold;
    const shortBy = willing - sold;
    const unsold = G.stock;
    let verdict, cls = "";
    if (shortBy > 0) { verdict = `${shortBy} shopper${shortBy === 1 ? "" : "s"} who'd pay your price left empty-handed. That's a <b>shortage</b>: you could have charged more.`; cls = "bad"; }
    else if (unsold > 0 && sold < buyers.length) { verdict = `${unsold} bike${unsold === 1 ? "" : "s"} didn't sell while ${buyers.length - sold} shoppers walked away. That's a <b>surplus</b>: a lower price would have moved more.`; }
    else { verdict = "You priced it right on the edge."; cls = "good"; }
    const li = document.createElement("li");
    li.className = cls || (rev >= best * 0.9 ? "good" : "");
    li.innerHTML = `Saturday ${G.week + 1}: sold <b>${sold}</b> at ${money(p)} for <b>${money(rev)}</b>. ${verdict} Best price in hindsight: ${money(bestP)} (${money(best)}).`;
    $("#m-log").prepend(li);
    $("#m-profit").textContent = money(G.rev - G.fixed * COST);
    $("#m-sold").textContent = G.sold;
    $("#m-score").textContent = `${Math.round((G.rev / G.opt) * 100)}%`;

    G.week++;
    G.busy = false;
    priceIn.disabled = false;
    if (G.week < WEEKS) { G.stock += 3; G.fixed += 3; startWeek(); }
    else finish();
  });

  const finish = () => {
    const score = Math.round((G.rev / G.opt) * 100);
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
    const profit = G.rev - G.fixed * COST;
    $("#m-open").classList.add("hidden");
    $("#m-news").textContent = "";
    $("#m-stock").textContent = "Season's over";
    $("#m-week").textContent = "Final results";
    const r = $("#m-result");
    r.classList.remove("hidden");
    r.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score}% of the best possible revenue</b><p>${score >= 90 ? "You read the crowd like a pricing analyst. Every week you found the price where your bikes and your buyers matched up." : "The weeks you missed were the ones where the crowd changed. Prices aren't fixed: when demand shifts, the right price shifts with it."}</p></div></div>
      <p class="small muted">Profit after parts: ${money(profit)}. ${profit > 0 ? "It goes into your savings for the rest of the course." : ""}</p>
      <button class="btn line" id="m-again">Play again</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    if (first && profit > 0) FH.updateCharacter({ checking: FH.state.character.checking + profit });
    FH.addXP(first ? 50 : 15, first ? "Finished Market Stall" : "Another season at the market");
    if (grade === "A") FH.badge("market-stall-a", "Market Stall: A");
    $("#m-again").addEventListener("click", () => {
      Object.assign(G, { week: 0, stock: 4, rev: 0, opt: 0, sold: 0, fixed: 4 });
      deck = newDeck();
      $("#m-log").innerHTML = "";
      ["#m-profit", "#m-sold"].forEach((s) => ($(s).textContent = s === "#m-profit" ? "$0" : "0"));
      $("#m-score").textContent = "–";
      r.classList.add("hidden");
      $("#m-open").classList.remove("hidden");
      startWeek();
    });
  };
  renderPrice();
  startWeek();

  // ---------- Check ----------
  const QUIZ = [
    { q: "Demand for coffee is Q = 120 − 10P and supply is Q = 20P − 30. What is the equilibrium price?",
      opts: ["$3", "$5", "$7.50", "$15"], a: 1,
      why: "Set them equal: 120 − 10P = 20P − 30, so 150 = 30P and P = $5. Quantity is 120 − 50 = 70." },
    { q: "The price of gasoline rises sharply. What happens in the market for electric cars?",
      opts: ["Supply of electric cars shifts left", "Demand for electric cars shifts right", "Demand for electric cars shifts left", "Movement down along the demand curve"], a: 1,
      why: "Gas cars and electric cars are substitutes. Pricier gas makes electric cars more attractive at every price, so demand shifts right." },
    { q: "Which of these causes a movement along the demand curve for pizza, rather than a shift?",
      opts: ["A fall in the price of pizza", "A rise in consumer incomes", "A fall in the price of soda, a complement", "A news report that pizza is healthy"], a: 0,
      why: "Only a change in the good's own price moves you along its demand curve. Everything else shifts the curve." },
    { q: "A city caps apartment rents below the equilibrium rent. The most likely result is:",
      opts: ["A surplus of apartments", "A shortage of apartments", "No change in the market", "Higher rents"], a: 1,
      why: "A binding price ceiling raises quantity demanded and lowers quantity supplied, so more people want apartments than are available." },
    { q: "A new machine cuts the cost of producing smartphones. What happens to price and quantity?",
      opts: ["Price up, quantity up", "Price down, quantity up", "Price down, quantity down", "Price up, quantity down"], a: 1,
      why: "Lower costs shift supply right. Along a downward-sloping demand curve, that means a lower price and a higher quantity." },
    { q: "At a price of $50, quantity demanded is 300 and quantity supplied is 180. The market has:",
      opts: ["A surplus of 120, so price will fall", "A shortage of 120, so price will rise", "A shortage of 480", "Reached equilibrium"], a: 1,
      why: "Demand exceeds supply by 300 − 180 = 120. In a shortage, buyers compete and push the price up toward equilibrium." },
    { q: "Raising the price of a good from $10 to $11 cuts quantity demanded from 100 to 80. Demand for this good is:",
      opts: ["Inelastic, since buyers barely react", "Elastic, since quantity falls 20% on a 10% price rise", "Perfectly inelastic", "Upward sloping"], a: 1,
      why: "Elasticity = −20% ÷ 10% = −2. A magnitude above 1 means elastic: buyers react strongly, so the price rise lowers total revenue." },
  ];

  FHLesson.init({ id: LESSON, short: "supply-demand", quiz: QUIZ });
})();
