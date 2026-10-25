// Unit 1, Lesson 4: Interest rates and central banks
(function () {
  const LESSON = "u1-interest-rates";
  const { $, $$, fillRange, wait } = FHLesson;
  const money = FH.money;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const pmt = (principal, annualRate, months) => { const r = annualRate / 1200; return r ? (principal * r) / (1 - (1 + r) ** -months) : principal / months; };
  const p1 = (x) => `${x.toFixed(1)}%`;

  // Simplified spreads over the fed funds rate.
  const rates = (ff) => ({
    savings: Math.max(0.01, ff - 0.4),
    car: ff + 4,
    card: ff + 16,
    mortgage: 3 + ff * 0.55,
  });

  // ---------- See it: one dial, every rate ----------
  const grid = $("#rp-grid");
  const CARDS = [
    { k: "savings", name: "High-yield savings", sub: (r) => `$1,000 earns <b>${money(10 * r)}</b> a year`, color: "var(--savings)" },
    { k: "car", name: "Car loan, 5 years", sub: (r) => `$8,000 costs <b>${money(pmt(8000, r, 60))}</b> a month`, color: "var(--wants)" },
    { k: "mortgage", name: "30-year mortgage", sub: (r) => `$250,000 costs <b>${money(pmt(250000, r, 360))}</b> a month`, color: "var(--needs)" },
    { k: "card", name: "Credit card", sub: (r) => `$1,000 balance costs <b>${money(10 * r)}</b> a year`, color: "var(--danger)" },
  ];
  CARDS.forEach((c) => { const d = document.createElement("div"); d.className = "rate-card"; d.style.setProperty("--c", c.color); d.innerHTML = `<small>${c.name}</small><b>0%</b><p></p>`; grid.appendChild(d); });
  const slider = $("#rp-slider");
  const renderRP = () => {
    fillRange(slider);
    const ff = +slider.value, r = rates(ff);
    $("#rp-rate").textContent = `${ff.toFixed(2).replace(/0$/, "")}%`;
    $$(".rate-card", grid).forEach((d, i) => {
      const c = CARDS[i];
      $("b", d).textContent = p1(r[c.k]);
      $("p", d).innerHTML = c.sub(r[c.k]);
      d.classList.remove("bump"); void d.offsetWidth; d.classList.add("bump");
    });
    if (ff >= 9) FH.badge("volcker", "Channeling Volcker");
  };
  slider.addEventListener("input", renderRP);
  renderRP();

  // ---------- Play it: Rate Dial ----------
  // A tiny textbook economy: output gap g, inflation pi, unemployment u (Okun's law).
  // best = lowest possible loss over every rate path (searched offline); hold = loss if you never move.
  const SC = {
    1979: { label: "1979", start: 1979, best: 201.8, hold: 232.6, i: 10, pi: 11, g: 1, shocks: { 1: { pi: 1.0, news: "Oil prices spike again after the Iranian revolution." } },
      intro: "Inflation is 11% and climbing. People expect prices to keep rising, so they demand raises, which pushes prices up again." },
    2008: { label: "2008", start: 2008, best: 14.0, hold: 85.4, i: 3, pi: 3, g: -0.5, shocks: { 1: { g: -2.5, news: "Lehman Brothers collapses. Banks stop lending to each other." }, 2: { g: -1.5, news: "Layoffs spread. Consumers stop spending." } },
      intro: "Housing prices are falling and banks are nervous. Things are about to get much worse." },
    2021: { label: "2021", start: 2021, best: 332.4, hold: 403.4, i: 0.25, pi: 4.5, g: 1.5, shocks: { 1: { pi: 1.2, news: "Supply chains are jammed. Used car prices jump 40%." }, 3: { pi: 1.0, news: "War in Ukraine sends energy and food prices soaring." } },
      intro: "The economy is reopening fast with stimulus money in people's pockets. Rates are near zero." },
  };
  let S, F;
  const MEETINGS = 8;
  const quarter = (n) => `Q${(n % 4) + 1} ${S.start + Math.floor(n / 4)}`;
  const unemp = (g) => 4 - 0.5 * g;
  // One quarter of the economy. Rates work with a lag: this quarter's real rate moves next quarter's output gap.
  const step = (st, i, qe, sh) => ({
    g: Math.max(-8, Math.min(5, 0.8 * st.g - 0.3 * (i - st.pi - 0.5) + (qe ? 0.6 : 0) + (sh.g || 0))),
    pi: Math.max(-2, 0.8 * st.pi + 0.2 * 2 + 0.4 * st.g + (sh.pi || 0)),
  });

  $$("#f-eras button").forEach((b) => b.addEventListener("click", () => {
    S = SC[b.dataset.sc];
    F = { n: 0, i: S.i, pi: S.pi, g: S.g, d: 0, qe: 0, loss: 0, hist: [{ pi: S.pi, u: unemp(S.g), i: S.i }], busy: false };
    $("#f-eras").classList.add("hidden");
    $("#f-play").classList.remove("hidden");
    $("#f-chart").classList.remove("hidden");
    $("#f-go").disabled = false;
    $("#f-log").innerHTML = `<li>${S.intro}</li>`;
    meeting();
  }));
  $$(".dial-row [data-d]").forEach((b) => b.addEventListener("click", () => {
    F.d = +b.dataset.d;
    $$(".dial-row [data-d]").forEach((x) => x.classList.toggle("on", x === b));
    renderRate();
  }));
  $("#f-qe").addEventListener("click", () => {
    F.qe = F.qe ? 0 : 3;
    $("#f-qe").classList.toggle("on", !!F.qe);
    $("#f-qe").textContent = F.qe ? "QE on: buying bonds" : "Start buying bonds (QE)";
  });
  const renderRate = () => {
    const next = Math.max(0, F.i + F.d);
    $("#f-rate").innerHTML = F.d ? `${p1(F.i)} → <span style="color:var(--accent)">${p1(next)}</span>` : p1(F.i);
  };
  const renderGauges = () => {
    const u = unemp(F.g), r = rates(F.i);
    $("#f-pi-v").textContent = p1(F.pi);
    $("#f-pi-v").style.color = Math.abs(F.pi - 2) <= 1 ? "var(--good)" : F.pi > 4 ? "var(--danger)" : "";
    $("#f-u-v").textContent = p1(u);
    $("#f-u-v").style.color = Math.abs(u - 4) <= 1 ? "var(--good)" : u > 6 ? "var(--danger)" : "";
    $("#f-car").textContent = p1(r.car);
    $("#f-sav").textContent = p1(r.savings);
  };
  const meeting = () => {
    $("#f-when").textContent = `Meeting ${F.n + 1} of ${MEETINGS} · ${quarter(F.n)}`;
    F.d = 0;
    $$(".dial-row [data-d]").forEach((x) => x.classList.toggle("on", x.dataset.d === "0"));
    const sh = S.shocks[F.n];
    $("#f-news").innerHTML = sh ? `<b>Breaking:</b> ${sh.news}` : `Inflation is <b>${p1(F.pi)}</b> and unemployment is <b>${p1(unemp(F.g))}</b>. Real rate: <b>${p1(F.i - F.pi)}</b>.`;
    $("#f-qe").hidden = F.i > 0.25;
    renderRate();
    renderGauges();
    drawChart();
  };
  const drawChart = () => {
    const X = (n) => 60 + n * (620 / MEETINGS);
    const vals = F.hist.flatMap((h) => [h.pi, h.u, h.i]);
    const hi = Math.max(12, ...vals) + 1, lo = Math.min(0, ...vals);
    const Y = (v) => 230 - ((v - lo) / (hi - lo)) * 205;
    $("#f-band-i").setAttribute("y", Y(3)); $("#f-band-i").setAttribute("height", Y(1) - Y(3));
    $("#f-band-u").setAttribute("y", Y(5)); $("#f-band-u").setAttribute("height", Y(3) - Y(5));
    const t = $("#f-ticks"); t.innerHTML = "";
    for (let v = 0; v <= hi; v += hi > 14 ? 5 : 2) el("text", { x: 52, y: Y(v) + 4, "text-anchor": "end" }, t).textContent = `${v}%`;
    for (let n = 0; n <= MEETINGS; n += 2) el("text", { x: X(n), y: 248, "text-anchor": "middle" }, t).textContent = n ? quarter(n) : "start";
    const line = (k) => F.hist.map((h, n) => `${n ? "L" : "M"}${X(n).toFixed(1)} ${Y(h[k]).toFixed(1)}`).join(" ");
    $("#f-pi").setAttribute("d", line("pi"));
    $("#f-u").setAttribute("d", line("u"));
    $("#f-i").setAttribute("d", line("i"));
  };

  $("#f-go").addEventListener("click", async () => {
    if (F.busy) return;
    F.busy = true;
    $("#f-go").disabled = true;
    const old = F.i;
    F.i = Math.max(0, F.i + F.d);
    const next = step(F, F.i, !!F.qe, S.shocks[F.n] || {});
    if (F.qe) F.qe--;
    F.g = next.g; F.pi = next.pi;
    const u = unemp(F.g);
    F.hist.push({ pi: F.pi, u, i: F.i });
    F.loss += (F.pi - 2) ** 2 + (u - 4) ** 2;
    const move = F.i === old ? "held at" : F.i > old ? "raised rates to" : "cut rates to";
    const li = document.createElement("li");
    const ok = Math.abs(F.pi - 2) <= 1.5 && Math.abs(u - 4) <= 1.5;
    li.className = ok ? "good" : (F.pi > 6 || u > 7) ? "bad" : "";
    li.innerHTML = `<b>${quarter(F.n)}</b>: you ${move} <b>${p1(F.i)}</b>${F.qe ? " with bond buying" : ""}. Inflation now <b>${p1(F.pi)}</b>, unemployment <b>${p1(u)}</b>.`;
    $("#f-log").prepend(li);
    F.n++;
    await wait(300);
    F.busy = false;
    if (F.n < MEETINGS) { $("#f-go").disabled = false; meeting(); }
    else finish();
  });

  const finish = () => {
    renderGauges();
    drawChart();
    $("#f-play").classList.add("hidden");
    $("#f-when").textContent = `${S.label} · your term is over`;
    $("#f-rate").textContent = p1(F.i);
    // Never moving scores 40; the best possible path scores 100. Hard moments like 1979 are scored fairly.
    const score = Math.max(0, Math.min(100, Math.round(40 + (60 * (S.hold - F.loss)) / (S.hold - S.best))));
    const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D";
    const last = F.hist[F.hist.length - 1];
    const note = last.pi > 4 ? "Inflation was still running hot when you left. Voters are paying more for everything."
      : last.u > 6.5 ? "You beat inflation, but a lot of people lost their jobs along the way."
      : "You landed close to both targets. Economists call that a soft landing, and it's rare.";
    const r = $("#f-result");
    r.classList.remove("hidden");
    r.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score} / 100</b><p>${note} Your score compares your path to the best one possible in this economy. Sitting on your hands scores 40.</p></div></div>
      <button class="btn line" id="f-again">Try another moment</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    FH.addXP(first ? 50 : 15, first ? "Finished Rate Dial" : "Another term at the Fed");
    if (grade === "A") FH.badge("rate-dial-a", "Rate Dial: A");
    FH.save();
    $("#f-again").addEventListener("click", () => {
      r.classList.add("hidden");
      $("#f-chart").classList.add("hidden");
      $("#f-eras").classList.remove("hidden");
      $("#f-when").textContent = "Pick a moment";
      $("#f-rate").textContent = "–";
      $("#f-go").disabled = true;
      ["#f-pi-v", "#f-u-v", "#f-car", "#f-sav"].forEach((s) => { $(s).textContent = "–"; $(s).style.color = ""; });
    });
  };

  // ---------- Check ----------
  const QUIZ = [
    { q: "Inflation is well above the Fed's 2% target and unemployment is low. What is the Fed most likely to do?",
      opts: ["Cut the federal funds rate", "Raise the federal funds rate", "Print money to buy stocks", "Lower taxes"], a: 1,
      why: "Raising rates makes borrowing costlier and saving more rewarding, which cools spending and, with a lag, inflation. Taxes are set by Congress, not the Fed." },
    { q: "What is the federal funds rate?",
      opts: ["The rate the government pays on 30-year bonds", "The rate banks charge each other for overnight loans", "The average credit card rate", "The rate on a 30-year mortgage"], a: 1,
      why: "It's the overnight rate between banks. The Fed sets a target range for it, and other rates are priced off it." },
    { q: "A loan charges 6% interest while inflation is 8%. The real interest rate is about:",
      opts: ["14%", "6%", "2%", "−2%"], a: 3,
      why: "Real ≈ nominal − inflation = 6% − 8% = −2%. The borrower pays back dollars that buy less than the ones they borrowed, so the loan is actually cheap." },
    { q: "Why does the Fed often start raising rates before inflation has peaked?",
      opts: ["Because the law requires it", "Because rate changes take a year or more to fully affect prices", "Because banks ask it to", "Because higher rates lower unemployment"], a: 1,
      why: "Rate changes take roughly a year or more to fully affect spending and prices. Waiting for proof means acting too late." },
    { q: "With the federal funds rate already near zero in a deep recession, which tool can the Fed still use to lower long-term interest rates?",
      opts: ["Raise reserve requirements", "Quantitative easing: buying long-term bonds", "Cut income taxes", "Sell Treasury bonds"], a: 1,
      why: "When the Fed buys lots of long-term bonds, the interest rates on them fall. Mortgages and business loans are priced off those rates, so they get cheaper even though the Fed's own rate can't go below zero." },
    { q: "Simple interest on a $5,000 loan at 7% for 3 years is:",
      opts: ["$350", "$1,050", "$1,500", "$3,500"], a: 1,
      why: "Interest = principal × rate × time = 5,000 × 0.07 × 3 = $1,050." },
    { q: "The Fed raises rates sharply. All else equal, what happens to the price of existing bonds that pay a fixed 3%?",
      opts: ["They rise", "They fall", "They don't change", "They stop trading"], a: 1,
      why: "New bonds now pay more, so nobody pays full price for an old 3% bond. Its price falls until a buyer of the old bond earns about what a new one pays. You'll go deep on this in Unit 12." },
  ];

  FHLesson.init({ id: LESSON, short: "interest-rates", quiz: QUIZ });
})();
