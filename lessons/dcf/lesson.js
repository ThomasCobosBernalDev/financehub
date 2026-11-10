// Unit 15, Lesson 1: Valuing a company with DCF
(function () {
  const LESSON = "u15-dcf";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const k = (n) => "$" + Math.round(n / 1000) + "k";

  // ---------- See it: value vs. discount rate ----------
  const CF = [40000, 45000, 50000, 55000, 60000], GR = 0.02, OFFER = 500000;
  const value = (r) => {
    const pv = CF.reduce((s, c, t) => s + c / Math.pow(1 + r, t + 1), 0);
    const tv = (CF[4] * (1 + GR)) / (r - GR) / Math.pow(1 + r, 5);
    return { pv, tv, ev: pv + tv };
  };
  const rEl = $("#dc-r");
  const X = (v) => 30 + (v / 1000000) * 540;
  const drawDc = () => {
    const r = +rEl.value, v = value(r / 100);
    $("#dc-r-v").textContent = `${r}%`;
    let g = `<rect x="${X(0)}" y="44" width="${X(v.pv) - X(0)}" height="62" rx="8" class="dc-a"/>`;
    g += `<rect x="${X(v.pv)}" y="44" width="${X(v.ev) - X(v.pv)}" height="62" rx="8" class="dc-b"/>`;
    g += `<text x="${(X(0) + X(v.pv)) / 2}" y="82" text-anchor="middle" class="dc-in">${k(v.pv)}</text>`;
    g += `<text x="${(X(v.pv) + X(v.ev)) / 2}" y="82" text-anchor="middle" class="dc-in">${k(v.tv)}</text>`;
    g += `<line x1="${X(OFFER)}" x2="${X(OFFER)}" y1="30" y2="120" class="dc-offer"/>`;
    g += `<text x="${X(OFFER)}" y="20" text-anchor="middle" class="dc-tick">${T("Offer $500k", "Oferta $500k")}</text>`;
    [[0, "$0"], [1000000, "$1M"]].forEach(([x, l]) => { g += `<text x="${X(x)}" y="146" text-anchor="middle" class="dc-tick">${l}</text>`; });
    $("#dc-out").innerHTML = `<svg viewBox="0 0 600 156" class="dc-chart">${g}</svg>`;
    const gap = v.ev - OFFER, share = Math.round((v.tv / v.ev) * 100);
    const m = $("#dc-msg");
    m.innerHTML = gap >= 0
      ? T(`At ${r}%: worth about <b>${usd(v.ev)}</b>, ${usd(gap)} more than the offer. ${share}% comes from after year 5.`, `Al ${r}%: vale unos <b>${usd(v.ev)}</b>, ${usd(gap)} más que la oferta. El ${share}% viene de después del año 5.`)
      : T(`At ${r}%: worth about <b>${usd(v.ev)}</b>, ${usd(-gap)} less than the offer. At this rate, $500,000 is a good price.`, `Al ${r}%: vale unos <b>${usd(v.ev)}</b>, ${usd(-gap)} menos que la oferta. Con esta tasa, $500,000 es un buen precio.`);
    m.dataset.tone = gap >= 0 ? "good" : "warn";
    fillRange(rEl);
  };
  rEl.addEventListener("input", drawDc);
  drawDc();

  // ---------- Play it: valuation desk ----------
  const ROUNDS = [
    { facts: [T("Cash from operations: $70,000", "Efectivo de operaciones: $70,000"), T("Capital spending: $20,000", "Gasto de capital: $20,000")], q: T("What's the free cash flow?", "¿Cuál es el flujo de caja libre?"),
      opts: ["$50,000", "$90,000", "$70,000", "$20,000"], a: 0,
      why: "$70,000 − $20,000 = $50,000." },
    { facts: [T("Free cash flow: $55,000 in 1 year", "Flujo de caja libre: $55,000 en 1 año"), T("Discount rate: 10%", "Tasa de descuento: 10%")], q: T("What's it worth today?", "¿Cuánto vale hoy?"),
      opts: ["$50,000", "$55,000", "$60,500", "$49,500"], a: 0,
      why: `${fr("$55,000", "1.1")} = $50,000.` },
    { facts: [T("Free cash flow: $121,000 in 2 years", "Flujo de caja libre: $121,000 en 2 años"), T("Discount rate: 10%", "Tasa de descuento: 10%")], q: T("What's it worth today?", "¿Cuánto vale hoy?"),
      opts: ["$100,000", "$110,000", "$121,000", "$96,800"], a: 0,
      why: `${fr("$121,000", "1.1<sup>2</sup>")} = ${fr("$121,000", "1.21")} = $100,000.` },
    { facts: [T("Next year's free cash flow: $9,000", "Flujo de caja libre del próximo año: $9,000"), T("Discount rate: 12%", "Tasa de descuento: 12%"), T("Growth forever: 3%", "Crecimiento para siempre: 3%")], q: T("What's the terminal value?", "¿Cuál es el valor terminal?"),
      opts: ["$100,000", "$75,000", "$60,000", "$300,000"], a: 0,
      why: `${fr("$9,000", "12% − 3%")} = ${fr("$9,000", "0.09")} = $100,000.` },
    { facts: [T("A company's DCF uses a 10% discount rate", "El DCF de una empresa usa una tasa de descuento de 10%"), T("The rate changes to 12%", "La tasa cambia a 12%")], q: T("What happens to its value?", "¿Qué pasa con su valor?"),
      opts: [T("It falls", "Baja"), T("It rises", "Sube"), T("It stays the same", "Se queda igual")], a: 0,
      why: T("A higher rate shrinks every future dollar more, so the value falls.", "Una tasa más alta achica más cada dólar futuro, así que el valor baja.") },
    { facts: [T("Enterprise value: $900,000", "Valor de empresa: $900,000"), T("Debt: $200,000", "Deuda: $200,000"), T("Cash: $50,000", "Efectivo: $50,000")], q: T("What's the equity value?", "¿Cuál es el valor del capital?"),
      opts: ["$750,000", "$650,000", "$1,050,000", "$1,150,000"], a: 0,
      why: "$900,000 − $200,000 + $50,000 = $750,000." },
    { facts: [T("Equity value: $750,000", "Valor del capital: $750,000"), T("Shares: 50,000", "Acciones: 50,000")], q: T("What's the value per share?", "¿Cuál es el valor por acción?"),
      opts: ["$15", "$1.50", "$150", "$7.50"], a: 0,
      why: `${fr("$750,000", "50,000")} = $15.` },
    { facts: [T("You need a growth rate that lasts forever", "Necesitas una tasa de crecimiento que dure para siempre"), T("The economy grows about 2% to 4% a year", "La economía crece entre 2% y 4% al año")], q: T("Which rate makes sense?", "¿Qué tasa tiene sentido?"),
      opts: ["2%", "12%", "25%"], a: 0,
      why: T("No company can grow faster than the whole economy forever.", "Ninguna empresa puede crecer más rápido que toda la economía para siempre.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#vd-why"), nextB = $("#vd-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#vd-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#vd-q").textContent = r.q;
    $("#vd-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#vd-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#vd-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#vd-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#vd-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#vd-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#vd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("DCF builder", "Arma un DCF") : G.score >= 6 ? T("Ready for the valuation desk", "Listo para la mesa de valuación") : T("Review the five steps", "Repasa los cinco pasos")}</b><p>${T("A company is worth its future free cash flow, brought back to today at the cost of capital.", "Una empresa vale su flujo de caja libre futuro, traído a hoy con el costo de capital.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="vd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#vd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#vd-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#vd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Valued eight companies", "Valuaste ocho empresas"));
    if (G.score === N) FH.badge("dcf-builder");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "A business has $90,000 of cash from operations and spends $25,000 on equipment. What is its free cash flow?", opts: ["$65,000", "$115,000", "$90,000", "$25,000"], a: 0, why: "$90,000 − $25,000 = $65,000." },
    { q: "In a DCF, what is a company worth?", opts: ["The present value of its future free cash flow", "This year's profit", "The total of its future cash, not discounted", "What it paid for its equipment"], a: 0, why: "Each year's free cash flow, plus the terminal value, is brought back to today and added up." },
    { q: "An analyst raises the discount rate in a DCF. What happens to the value?", opts: ["It falls", "It rises", "It doesn't change", "It doubles"], a: 0, why: "A higher rate makes future cash worth less today." },
    { q: "Next year's free cash flow is $20,000, the discount rate is 10% and long-term growth is 2%. What is the terminal value?", opts: ["$250,000", "$200,000", "$166,667", "$1,000,000"], a: 0, why: `${fr("$20,000", "10% − 2%")} = ${fr("$20,000", "0.08")} = $250,000.` },
    { q: "Enterprise value is $2,000,000, debt is $500,000 and cash is $100,000. What is the equity value?", opts: ["$1,600,000", "$1,400,000", "$2,400,000", "$2,600,000"], a: 0, why: "$2,000,000 − $500,000 + $100,000 = $1,600,000." },
    { q: "Equity value is $1,600,000 and there are 200,000 shares. What is the value per share?", opts: ["$8", "$80", "$0.80", "$12.50"], a: 0, why: `${fr("$1,600,000", "200,000")} = $8.` },
    { q: "Why should the long-term growth rate in a DCF stay around 2% to 3%?", opts: ["No company can grow faster than the whole economy forever", "Higher growth is against the law", "Growth doesn't affect the value", "Analysts must always pick 2%"], a: 0, why: "If it grew faster than the economy forever, it would someday be bigger than the whole economy." },
    { q: "In a typical DCF, which part usually makes up most of the value?", opts: ["The terminal value", "Year 1's free cash flow", "The company's cash", "Its debt"], a: 0, why: "In the bike shop example, the terminal value was about 72% of the total." },
  ];
  const QUIZ_ES = [
    { q: "Un negocio tiene $90,000 de efectivo de operaciones y gasta $25,000 en equipo. ¿Cuál es su flujo de caja libre?", opts: ["$65,000", "$115,000", "$90,000", "$25,000"], a: 0, why: "$90,000 − $25,000 = $65,000." },
    { q: "En un DCF, ¿cuánto vale una empresa?", opts: ["El valor presente de su flujo de caja libre futuro", "La ganancia de este año", "La suma de su efectivo futuro, sin descontar", "Lo que pagó por su equipo"], a: 0, why: "El flujo de caja libre de cada año, más el valor terminal, se trae a hoy y se suma." },
    { q: "Un analista sube la tasa de descuento de un DCF. ¿Qué pasa con el valor?", opts: ["Baja", "Sube", "No cambia", "Se duplica"], a: 0, why: "Una tasa más alta hace que el efectivo futuro valga menos hoy." },
    { q: "El flujo de caja libre del próximo año es $20,000, la tasa de descuento es 10% y el crecimiento a largo plazo es 2%. ¿Cuál es el valor terminal?", opts: ["$250,000", "$200,000", "$166,667", "$1,000,000"], a: 0, why: `${fr("$20,000", "10% − 2%")} = ${fr("$20,000", "0.08")} = $250,000.` },
    { q: "El valor de empresa es $2,000,000, la deuda es $500,000 y el efectivo es $100,000. ¿Cuál es el valor del capital?", opts: ["$1,600,000", "$1,400,000", "$2,400,000", "$2,600,000"], a: 0, why: "$2,000,000 − $500,000 + $100,000 = $1,600,000." },
    { q: "El valor del capital es $1,600,000 y hay 200,000 acciones. ¿Cuál es el valor por acción?", opts: ["$8", "$80", "$0.80", "$12.50"], a: 0, why: `${fr("$1,600,000", "200,000")} = $8.` },
    { q: "¿Por qué la tasa de crecimiento a largo plazo de un DCF debe quedarse cerca de 2% a 3%?", opts: ["Ninguna empresa puede crecer más rápido que toda la economía para siempre", "Crecer más está prohibido por la ley", "El crecimiento no afecta el valor", "Los analistas siempre tienen que usar 2%"], a: 0, why: "Si creciera más rápido que la economía para siempre, algún día sería más grande que toda la economía." },
    { q: "En un DCF típico, ¿qué parte suele ser la mayor parte del valor?", opts: ["El valor terminal", "El flujo de caja libre del año 1", "El efectivo de la empresa", "Su deuda"], a: 0, why: "En el ejemplo de las tiendas de bicicletas, el valor terminal era como el 72% del total." },
  ];

  FHLesson.init({ id: LESSON, short: "dcf", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
