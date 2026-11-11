// Unit 15, Lesson 3: Mergers and buyouts
(function () {
  const LESSON = "u15-mergers";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const x2 = (n) => n.toFixed(2) + "x";

  // ---------- See it: debt vs. returns ----------
  const PRICE = 660000, CASH = 200000, GOOD = 840000, BAD = 420000;
  const dEl = $("#lb-d");
  const X = (m) => 150 + (m / 7) * 420;
  const drawLb = () => {
    const s = +dEl.value, D = (PRICE * s) / 100, E = PRICE - D;
    const g1 = (GOOD + CASH - D) / E, b1 = Math.max(0, (BAD + CASH - D) / E), irr = (Math.pow(g1, 0.2) - 1) * 100;
    $("#lb-d-v").textContent = `${s}%`;
    let g = `<text x="138" y="62" text-anchor="end" class="lb-lab">${T("Good case", "Caso bueno")}</text><text x="138" y="122" text-anchor="end" class="lb-lab">${T("Bad case", "Caso malo")}</text>`;
    g += `<rect x="150" y="36" width="${X(g1) - 150}" height="38" rx="8" class="lb-g"/><rect x="150" y="96" width="${Math.max(4, X(b1) - 150)}" height="38" rx="8" class="lb-b"/>`;
    g += `<line x1="${X(1)}" x2="${X(1)}" y1="26" y2="148" class="lb-one"/><text x="${X(1)}" y="16" text-anchor="middle" class="lb-tick">1x</text>`;
    [[0, "0x"], [3, "3x"], [6, "6x"]].forEach(([m, l]) => { g += `<text x="${X(m)}" y="176" text-anchor="middle" class="lb-tick">${l}</text>`; });
    $("#lb-out").innerHTML = `<svg viewBox="0 0 600 186" class="lb-chart">${g}</svg>`;
    const m = $("#lb-msg");
    m.innerHTML = T(`Debt ${usd(D)}, the firm's money ${usd(E)}. Good case: <b>${x2(g1)}</b>, an IRR of about ${irr.toFixed(1)}%. Bad case: <b>${x2(b1)}</b>${b1 < 1 ? `, losing ${Math.round((1 - b1) * 100)}% of its money` : ""}.`,
      `Deuda ${usd(D)}, dinero de la firma ${usd(E)}. Caso bueno: <b>${x2(g1)}</b>, una TIR de unos ${irr.toFixed(1)}%. Caso malo: <b>${x2(b1)}</b>${b1 < 1 ? `, pierde el ${Math.round((1 - b1) * 100)}% de su dinero` : ""}.`);
    m.dataset.tone = b1 < 0.8 ? "warn" : "good";
    fillRange(dEl);
  };
  dEl.addEventListener("input", drawLb);
  drawLb();

  // ---------- Play it: deal room ----------
  const ROUNDS = [
    { facts: [T("Target's share price: $20", "Precio de la acción del objetivo: $20"), T("Offer: $26 a share", "Oferta: $26 por acción")], q: T("What's the control premium?", "¿Cuál es la prima de control?"),
      opts: ["30%", "6%", "26%", "23%"], a: 0,
      why: `${fr("$26 − $20", "$20")} = ${fr("$6", "$20")} = 30%.` },
    { facts: [T("Combining saves $50,000 a year", "Combinarse ahorra $50,000 al año"), T("Multiple for this industry: 8x", "Múltiplo de esta industria: 8x")], q: T("What are the synergies worth?", "¿Cuánto valen las sinergias?"),
      opts: ["$400,000", "$50,000", "$58,000", "$6,250"], a: 0,
      why: "8 × $50,000 = $400,000." },
    { facts: [T("Target's value on its own: $500,000", "Valor del objetivo por sí solo: $500,000"), T("Synergies: $100,000", "Sinergias: $100,000")], q: T("What's the most the buyer should pay?", "¿Qué es lo máximo que debería pagar quien compra?"),
      opts: ["$600,000", "$500,000", "$400,000", "$1,000,000"], a: 0,
      why: "$500,000 + $100,000 = $600,000. Any more and the buyer loses value." },
    { facts: [T("A PE firm buys a company for $1,000,000", "Una firma de capital privado compra una empresa en $1,000,000"), T("70% is paid with debt", "El 70% se paga con deuda")], q: T("How much of its own money does the firm put in?", "¿Cuánto dinero propio pone la firma?"),
      opts: ["$300,000", "$700,000", "$1,000,000", "$70,000"], a: 0,
      why: T("Debt: 70% × $1,000,000 = $700,000. The firm puts in $1,000,000 − $700,000 = $300,000.", "Deuda: 70% × $1,000,000 = $700,000. La firma pone $1,000,000 − $700,000 = $300,000.") },
    { facts: [T("Money in: $300,000", "Dinero que entra: $300,000"), T("Money out after 5 years: $900,000", "Dinero que sale a los 5 años: $900,000")], q: T("What's the MOIC?", "¿Cuál es el MOIC?"),
      opts: ["3x", "2x", "0.33x", "6x"], a: 0,
      why: `${fr("$900,000", "$300,000")} = 3x.` },
    { facts: [T("A deal doubles the money: 2x", "Una operación duplica el dinero: 2x"), T("It takes 5 years", "Tarda 5 años")], q: T("About what IRR is that?", "¿Más o menos qué TIR es?"),
      opts: ["15%", "40%", "2%", "100%"], a: 0,
      why: T("Doubling your money in 5 years is about 15% a year.", "Duplicar tu dinero en 5 años es como 15% al año.") },
    { facts: [T("Buyer 1: a rival company", "Comprador 1: una empresa rival"), T("Buyer 2: a private equity firm", "Comprador 2: una firma de capital privado")], q: T("Which is the strategic buyer?", "¿Cuál es el comprador estratégico?"),
      opts: [T("The rival company", "La empresa rival"), T("The private equity firm", "La firma de capital privado"), T("Both", "Las dos")], a: 0,
      why: T("A strategic buyer is in the same or a related business and can get synergies.", "Un comprador estratégico está en el mismo negocio o en uno relacionado y puede lograr sinergias.") },
    { facts: [T("Two LBOs of the same company", "Dos LBO de la misma empresa"), T("Deal A: 30% debt. Deal B: 80% debt", "Operación A: 30% deuda. Operación B: 80% deuda"), T("Profits fall sharply", "Las ganancias caen mucho")], q: T("Which owners lose more?", "¿En cuál pierden más los dueños?"),
      opts: [T("Deal B, with 80% debt", "La operación B, con 80% de deuda"), T("Deal A, with 30% debt", "La operación A, con 30% de deuda"), T("The same", "Igual")], a: 0,
      why: T("Lenders still get their fixed amount back, so more debt leaves less for the owners when things go badly.", "A los prestamistas igual se les paga su monto fijo, así que con más deuda queda menos para los dueños cuando las cosas van mal.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#dr-why"), nextB = $("#dr-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#dr-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#dr-q").textContent = r.q;
    $("#dr-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#dr-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#dr-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#dr-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#dr-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#dr-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#dr-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Deal closer", "Cierra tratos") : G.score >= 6 ? T("Ready for the deal room", "Ya puedes negociar") : T("Review the four checks", "Repasa las cuatro revisiones")}</b><p>${T("Pay no more than value plus synergies, and remember that debt makes wins and losses bigger.", "No pagues más que el valor más las sinergias, y recuerda que la deuda agranda las ganancias y las pérdidas.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="dr-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#dr-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#dr-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#dr").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Worked eight deals", "Trabajaste ocho operaciones"));
    if (G.score === N) FH.badge("deal-closer");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "A company's stock trades at $40. A buyer offers $50 a share. What is the control premium?", opts: ["25%", "20%", "10%", "125%"], a: 0, why: `${fr("$50 − $40", "$40")} = ${fr("$10", "$40")} = 25%.` },
    { q: "What are synergies in a merger?", opts: ["Extra value from combining, like cost savings or more sales", "The fees paid to bankers", "The premium paid to the seller", "The target's debt"], a: 0, why: "Together the companies make more than apart: shared costs, bulk buying or new sales." },
    { q: "A target is worth $1,000,000 on its own, and the buyer expects $300,000 of synergies. What is the most the buyer should pay?", opts: ["$1,300,000", "$1,000,000", "$700,000", "$300,000"], a: 0, why: "$1,000,000 + $300,000 = $1,300,000. Paying more destroys value for the buyer." },
    { q: "What is a leveraged buyout (LBO)?", opts: ["Buying a company with mostly borrowed money", "A merger of two equal companies", "Selling shares to the public for the first time", "Buying a company with only cash on hand"], a: 0, why: "The debt sits on the company bought, and its own cash pays it down." },
    { q: "A private equity firm invests $2 million and sells its stake for $6 million. What is the MOIC?", opts: ["3x", "4x", "2x", "0.33x"], a: 0, why: `${fr("$6 million", "$2 million")} = 3x.` },
    { q: "Why does using more debt raise a buyout's return when things go well?", opts: ["The buyer puts in less of its own money, but keeps all the gain above the fixed debt", "Debt has no interest", "Lenders share the losses", "Debt raises the company's EBITDA"], a: 0, why: "Lenders only get back their fixed amount, so the owners' smaller stake captures all the growth." },
    { q: "What is the biggest risk of an LBO?", opts: ["If profits fall, the heavy debt can wipe out the owners", "The company pays too little tax", "The buyer owns too few shares", "Interest rates can't change"], a: 0, why: "Debt makes losses bigger too. Toys \"R\" Us went bankrupt under its LBO debt." },
    { q: "A rival company in the same industry buys a competitor. What kind of buyer is it?", opts: ["A strategic buyer", "A financial buyer", "A private equity firm", "A lender"], a: 0, why: "Strategic buyers are in the same or a related business and can get synergies." },
  ];
  const QUIZ_ES = [
    { q: "La acción de una empresa cotiza a $40. Un comprador ofrece $50 por acción. ¿Cuál es la prima de control?", opts: ["25%", "20%", "10%", "125%"], a: 0, why: `${fr("$50 − $40", "$40")} = ${fr("$10", "$40")} = 25%.` },
    { q: "¿Qué son las sinergias en una fusión?", opts: ["Valor extra por combinarse, como ahorros de costos o más ventas", "Las comisiones pagadas a los bancos", "La prima pagada a quien vende", "La deuda del objetivo"], a: 0, why: "Juntas, las empresas generan más que separadas: costos compartidos, compras al por mayor o ventas nuevas." },
    { q: "Un objetivo vale $1,000,000 por sí solo, y el comprador espera $300,000 de sinergias. ¿Qué es lo máximo que debería pagar?", opts: ["$1,300,000", "$1,000,000", "$700,000", "$300,000"], a: 0, why: "$1,000,000 + $300,000 = $1,300,000. Pagar más destruye valor para quien compra." },
    { q: "¿Qué es una compra apalancada (LBO)?", opts: ["Comprar una empresa con dinero prestado en su mayoría", "Una fusión de dos empresas iguales", "Vender acciones al público por primera vez", "Comprar una empresa solo con el efectivo que se tiene"], a: 0, why: "La deuda queda en la empresa comprada, y su propio efectivo la va pagando." },
    { q: "Una firma de capital privado invierte $2 millones y vende su parte en $6 millones. ¿Cuál es el MOIC?", opts: ["3x", "4x", "2x", "0.33x"], a: 0, why: `${fr("$6 millones", "$2 millones")} = 3x.` },
    { q: "¿Por qué usar más deuda sube el rendimiento de una compra cuando todo sale bien?", opts: ["Quien compra pone menos dinero propio, pero se queda con toda la ganancia por encima de la deuda fija", "La deuda no cobra intereses", "Los prestamistas comparten las pérdidas", "La deuda sube el EBITDA de la empresa"], a: 0, why: "A los prestamistas solo se les devuelve su monto fijo, así que la parte más chica de los dueños se queda con todo el crecimiento." },
    { q: "¿Cuál es el mayor riesgo de una LBO?", opts: ["Si las ganancias caen, la deuda tan grande puede dejar sin nada a los dueños", "La empresa paga muy pocos impuestos", "Quien compra tiene muy pocas acciones", "Las tasas de interés no pueden cambiar"], a: 0, why: "La deuda también agranda las pérdidas. Toys \"R\" Us quebró bajo la deuda de su LBO." },
    { q: "Una empresa rival de la misma industria compra a una competidora. ¿Qué tipo de comprador es?", opts: ["Un comprador estratégico", "Un comprador financiero", "Una firma de capital privado", "Un prestamista"], a: 0, why: "Los compradores estratégicos están en el mismo negocio o en uno relacionado y pueden lograr sinergias." },
  ];

  FHLesson.init({ id: LESSON, short: "mergers", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
