// Unit 13, Lesson 3: The cost of capital
(function () {
  const LESSON = "u13-cost-of-capital";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const pct = (n) => `${+n.toFixed(1)}%`;

  // ---------- See it: the debt/equity mix ----------
  const KD = 6, KE = 15, VAN = 15.2, BOOTH = 13.6;
  const dEl = $("#wc-d");
  const drawWc = () => {
    const d = +dEl.value, e = 100 - d, wacc = (d * KD + e * KE) / 100;
    $("#wc-d-v").textContent = `${d}%`;
    const W = 600, dw = (W * d) / 100;
    let g = "";
    if (d) g += `<rect x="0" y="10" width="${dw}" height="56" rx="8" class="wc-debt"/>${d >= 20 ? `<text x="${dw / 2}" y="45" text-anchor="middle" class="wc-in">${T("Debt", "Deuda")} ${d}%</text>` : ""}`;
    g += `<rect x="${dw}" y="10" width="${W - dw}" height="56" rx="8" class="wc-eq"/><text x="${dw + (W - dw) / 2}" y="45" text-anchor="middle" class="wc-in">${T("Equity", "Capital propio")} ${e}%</text>`;
    g += `<text x="0" y="104" class="wc-sum">${d ? `${(d / 100).toFixed(2)} × 6% + ` : ""}${(e / 100).toFixed(2)} × 15% = </text><text x="${W}" y="104" text-anchor="end" class="wc-big">WACC ${pct(wacc)}</text>`;
    $("#wc-out").innerHTML = `<svg viewBox="0 0 600 120" class="wc-chart">${g}</svg>`;
    const clear = (irr) => irr > wacc;
    const m = $("#wc-msg");
    const v = clear(VAN) ? T(`The van (15.2%) clears ${pct(wacc)}.`, `La camioneta (15.2%) supera ${pct(wacc)}.`) : T(`The van (15.2%) misses ${pct(wacc)}.`, `La camioneta (15.2%) no llega a ${pct(wacc)}.`);
    const b = clear(BOOTH) ? T(`The booth (13.6%) clears it too.`, `El puesto (13.6%) también la supera.`) : T(`The booth (13.6%) doesn't: skip it.`, `El puesto (13.6%) no: no lo hagas.`);
    m.textContent = `${v} ${b}`;
    m.dataset.tone = clear(BOOTH) ? "good" : "warn";
    fillRange(dEl);
  };
  dEl.addEventListener("input", drawWc);
  drawWc();

  // ---------- Play it: clear the hurdle ----------
  const BUILD = T("Build it", "Hazlo"), SKIP = T("Skip it", "No lo hagas");
  const ROUNDS = [
    { facts: [T("A loan charges 10% interest", "Un préstamo cobra 10% de interés"), T("The tax rate is 30%", "La tasa de impuestos es 30%")], q: T("What's the after-tax cost of debt?", "¿Cuál es el costo de la deuda después de impuestos?"),
      opts: ["7%", "10%", "3%", "13%"], a: 0,
      why: T("10% × (1 − 0.30) = 10% × 0.70 = 7%.", "10% × (1 − 0.30) = 10% × 0.70 = 7%.") },
    { facts: [T("Risk-free rate: 5%", "Tasa libre de riesgo: 5%"), T("Beta: 1", "Beta: 1"), T("Market risk premium: 6%", "Prima de riesgo del mercado: 6%")], q: T("What's the cost of equity?", "¿Cuál es el costo del capital propio?"),
      opts: ["11%", "6%", "5%", "30%"], a: 0,
      why: "5% + 1 × 6% = 11%." },
    { facts: [T("30% debt at 5% after taxes", "30% deuda al 5% después de impuestos"), T("70% equity at 10%", "70% capital propio al 10%")], q: T("What's the WACC?", "¿Cuál es el WACC?"),
      opts: ["8.5%", "7.5%", "15%", "10%"], a: 0,
      why: T("0.30 × 5% + 0.70 × 10% = 1.5% + 7% = 8.5%.", "0.30 × 5% + 0.70 × 10% = 1.5% + 7% = 8.5%.") },
    { facts: [T("A company's WACC is 9%", "El WACC de una empresa es 9%"), T("A new store has an IRR of 12%", "Una tienda nueva tiene una TIR de 12%")], q: T("Build it or skip it?", "¿La haces o no?"),
      opts: [BUILD, SKIP], a: 0,
      why: T("12% beats the 9% hurdle, so the NPV at the WACC is above zero.", "12% supera la tasa mínima de 9%, así que el VPN al WACC está arriba de cero.") },
    { facts: [T("A company's WACC is 9%", "El WACC de una empresa es 9%"), T("A new machine has an IRR of 7%", "Una máquina nueva tiene una TIR de 7%")], q: T("Build it or skip it?", "¿La haces o no?"),
      opts: [BUILD, SKIP], a: 1,
      why: T("7% misses the 9% hurdle. It would earn less than the money costs.", "7% no llega a la tasa mínima de 9%. Rendiría menos de lo que cuesta el dinero.") },
    { facts: [T("A company uses both debt and equity", "Una empresa usa deuda y capital propio")], q: T("Which usually costs more?", "¿Cuál suele costar más?"),
      opts: [T("Equity", "El capital propio"), T("Debt", "La deuda"), T("They cost the same", "Cuestan lo mismo")], a: 0,
      why: T("Owners are paid last and take more risk, so they expect a higher return than lenders.", "Los dueños cobran al final y toman más riesgo, así que esperan más rendimiento que los prestamistas.") },
    { facts: [T("Stock A has a beta of 0.5", "La acción A tiene una beta de 0.5"), T("Stock B has a beta of 2", "La acción B tiene una beta de 2")], q: T("Whose owners expect a higher return?", "¿Quiénes esperan más rendimiento?"),
      opts: [T("Stock B's", "Los de la acción B"), T("Stock A's", "Los de la acción A"), T("The same", "Lo mismo")], a: 0,
      why: T("A beta of 2 swings twice as much as the market. More risk means a higher cost of equity.", "Una beta de 2 se mueve el doble que el mercado. Más riesgo significa un costo del capital propio más alto.") },
    { facts: [T("Debt: $30,000", "Deuda: $30,000"), T("Equity: $70,000", "Capital propio: $70,000")], q: T("What's the debt weight?", "¿Cuál es el peso de la deuda?"),
      opts: ["30%", "43%", "70%", "3%"], a: 0,
      why: `${fr("$30,000", "$100,000")} = 0.30, ${T("so 30%.", "o sea 30%.")}` },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#hr-why"), nextB = $("#hr-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#hr-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#hr-q").textContent = r.q;
    $("#hr-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#hr-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#hr-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#hr-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#hr-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#hr-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#hr-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Hurdle setter", "Fijas la tasa mínima") : G.score >= 6 ? T("Treasury ready", "Listo para tesorería") : T("Review the WACC steps", "Repasa los pasos del WACC")}</b><p>${T("Debt after taxes, equity with the CAPM, weight them, and make every project clear the blend.", "Deuda después de impuestos, capital propio con el CAPM, ponderarlos, y que cada proyecto supere la mezcla.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="hr-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#hr-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#hr-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#hr").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Priced eight kinds of money", "Pusiste precio a ocho tipos de dinero"));
    if (G.score === N) FH.badge("hurdle-setter");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is a company's weighted average cost of capital (WACC)?", opts: ["The average cost of its debt and equity, weighted by how much of each it uses", "The interest rate on its biggest loan", "Its profit divided by its revenue", "The return on government bonds"], a: 0, why: "WACC multiplies each source's cost by its share of the total and adds them up." },
    { q: "A company borrows at 10% and pays a 20% tax rate. What is its after-tax cost of debt?", opts: ["8%", "10%", "2%", "12%"], a: 0, why: "10% × (1 − 0.20) = 10% × 0.80 = 8%." },
    { q: "Using the CAPM, what is the cost of equity if the risk-free rate is 3%, beta is 1.5 and the market risk premium is 6%?", opts: ["12%", "9%", "10.5%", "4.5%"], a: 0, why: "3% + 1.5 × 6% = 3% + 9% = 12%." },
    { q: "Why is the cost of equity usually higher than the cost of debt?", opts: ["Owners are paid after lenders and take more risk", "Equity is taxed less", "Banks are required to lend cheaply", "Shares never lose value"], a: 0, why: "Lenders get their interest first, even in bad years. Owners get what's left, so they demand more." },
    { q: "A company is 50% debt at an after-tax cost of 4% and 50% equity at 12%. What is its WACC?", opts: ["8%", "16%", "6%", "4%"], a: 0, why: "0.50 × 4% + 0.50 × 12% = 2% + 6% = 8%." },
    { q: "What does a beta of 1 mean?", opts: ["The stock tends to move with the market", "The stock never changes price", "The stock has no risk", "The stock swings twice as much as the market"], a: 0, why: "Beta compares a stock's swings with the market's. A beta of 1 moves about the same as the market." },
    { q: "A company's WACC is 11%. A project has an IRR of 9%. What should it do?", opts: ["Reject it", "Accept it", "Borrow more to make it work", "Accept it only if payback is short"], a: 0, why: "The project earns less than the money costs, so its NPV at the WACC is below zero." },
    { q: "Why does the after-tax cost of debt come out lower than the interest rate?", opts: ["Interest is a deductible expense, so it lowers taxes", "Banks give refunds", "Debt never has to be repaid", "Taxes are paid by the lender"], a: 0, why: "Interest reduces taxable income, so part of each interest payment comes back as lower taxes." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es el costo promedio ponderado de capital (WACC) de una empresa?", opts: ["El costo promedio de su deuda y su capital propio, ponderado por cuánto usa de cada uno", "La tasa de interés de su préstamo más grande", "Su ganancia dividida entre sus ingresos", "El rendimiento de los bonos del gobierno"], a: 0, why: "El WACC multiplica el costo de cada fuente por su parte del total y los suma." },
    { q: "Una empresa pide prestado al 10% y paga una tasa de impuestos de 20%. ¿Cuál es su costo de la deuda después de impuestos?", opts: ["8%", "10%", "2%", "12%"], a: 0, why: "10% × (1 − 0.20) = 10% × 0.80 = 8%." },
    { q: "Con el CAPM, ¿cuál es el costo del capital propio si la tasa libre de riesgo es 3%, la beta es 1.5 y la prima de riesgo del mercado es 6%?", opts: ["12%", "9%", "10.5%", "4.5%"], a: 0, why: "3% + 1.5 × 6% = 3% + 9% = 12%." },
    { q: "¿Por qué el costo del capital propio suele ser más alto que el de la deuda?", opts: ["Los dueños cobran después de los prestamistas y toman más riesgo", "El capital propio paga menos impuestos", "Los bancos están obligados a prestar barato", "Las acciones nunca pierden valor"], a: 0, why: "Los prestamistas cobran sus intereses primero, aun en años malos. Los dueños se quedan con lo que sobra, así que piden más." },
    { q: "Una empresa tiene 50% de deuda con un costo después de impuestos de 4% y 50% de capital propio al 12%. ¿Cuál es su WACC?", opts: ["8%", "16%", "6%", "4%"], a: 0, why: "0.50 × 4% + 0.50 × 12% = 2% + 6% = 8%." },
    { q: "¿Qué significa una beta de 1?", opts: ["La acción suele moverse igual que el mercado", "La acción nunca cambia de precio", "La acción no tiene riesgo", "La acción se mueve el doble que el mercado"], a: 0, why: "La beta compara los movimientos de una acción con los del mercado. Una beta de 1 se mueve más o menos igual que el mercado." },
    { q: "El WACC de una empresa es 11%. Un proyecto tiene una TIR de 9%. ¿Qué debe hacer?", opts: ["Rechazarlo", "Aceptarlo", "Pedir más prestado para que funcione", "Aceptarlo solo si se recupera rápido"], a: 0, why: "El proyecto rinde menos de lo que cuesta el dinero, así que su VPN al WACC está abajo de cero." },
    { q: "¿Por qué el costo de la deuda después de impuestos es menor que la tasa de interés?", opts: ["Los intereses son un gasto deducible, así que bajan los impuestos", "Los bancos dan reembolsos", "La deuda nunca se paga", "Los impuestos los paga el prestamista"], a: 0, why: "Los intereses reducen la ganancia que paga impuestos, así que parte de cada pago de intereses regresa como menos impuestos." },
  ];

  FHLesson.init({ id: LESSON, short: "cost-of-capital", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
