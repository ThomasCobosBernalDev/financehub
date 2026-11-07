// Unit 7, Lesson 2: Buy a car without overpaying
(function () {
  const LESSON = "u7-car";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
  const usd2 = (x) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: car cost checker ----------
  const INCOME = 3000, DOWN = 2000, INS = 150, RATE = 0.07;
  const pmt = (p, n) => { const i = RATE / 12; return p * i / (1 - Math.pow(1 + i, -n)); };
  const priceEl = $("#ct-price");
  let yrs = 4;
  const drawCt = () => {
    const price = +priceEl.value, loan = price - DOWN, n = yrs * 12;
    const pay = Math.round(pmt(loan, n) * 100) / 100, ten = pay + INS, all = ten + 120 + 50;
    const downPct = Math.round((DOWN / price) * 100), interest = pay * n - loan;
    $("#ct-price-v").textContent = usd(price);
    const tag = (ok) => `<b class="${ok ? "ok" : "no"}">${ok ? T("pass", "pasa") : T("miss", "no pasa")}</b>`;
    $("#ct-out").innerHTML = [
      [T("20% down?", "¿20% de pago inicial?"), `${fr(usd(DOWN), usd(price))} = ${downPct}% ${tag(downPct >= 20)}`],
      [T("Monthly payment", "Pago mensual"), `${usd(loan)} ${T("for", "a")} ${n} ${T("months", "meses")}: <b>${usd2(pay)}</b> ${tag(yrs <= 4)}`],
      [T("Payment + insurance", "Pago + seguro"), `${usd2(pay)} + $150 = <b>${usd2(ten)}</b> ${tag(ten <= 300)}`],
      [T("Total interest", "Interés total"), `<b>${usd2(interest)}</b>`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    const fill = $("#ct-fill");
    fill.style.width = `${Math.min(100, (ten / 600) * 100)}%`;
    fill.dataset.tone = ten <= 300 ? "good" : "warn";
    const passes = (downPct >= 20) + (yrs <= 4) + (ten <= 300);
    $("#ct-msg").innerHTML = passes === 3
      ? T(`<b>Fits all three.</b> With gas and upkeep, it costs about ${usd(all)} a month.`, `<b>Pasa las tres.</b> Con gasolina y mantenimiento, cuesta unos ${usd(all)} al mes.`)
      : T(`<b>Passes ${passes} of 3.</b> With gas and upkeep, it costs about ${usd(all)} a month, ${Math.round((all / INCOME) * 100)}% of your income.`, `<b>Pasa ${passes} de 3.</b> Con gasolina y mantenimiento, cuesta unos ${usd(all)} al mes, el ${Math.round((all / INCOME) * 100)}% de tu ingreso.`);
    fillRange(priceEl);
  };
  priceEl.addEventListener("input", drawCt);
  $$("#ct .ct-yrs .sm-btn").forEach((b) => b.addEventListener("click", () => {
    yrs = +b.dataset.y;
    $$("#ct .ct-yrs .sm-btn").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    drawCt();
  }));
  drawCt();

  // ---------- Play it: car lot ----------
  const ROUNDS = [
    { facts: [T("Sticker price: $15,000", "Precio de etiqueta: $15,000"), T("Sales tax: 6%", "Impuesto sobre la venta: 6%"), T("Title, registration and dealer fees: $350", "Título, registro y cuotas del concesionario: $350")],
      q: T("What's the out-the-door price?", "¿Cuál es el precio final?"), opts: ["$16,250", "$15,350", "$15,900"], a: 0,
      why: T("$15,000 × 0.06 = $900 of tax. $15,000 + $900 + $350 = $16,250.", "$15,000 × 0.06 = $900 de impuesto. $15,000 + $900 + $350 = $16,250.") },
    { facts: [T("New car: $30,000", "Carro nuevo: $30,000"), T("It loses 20% of its value in the first year", "Pierde 20% de su valor el primer año")],
      q: T("What's it worth after one year?", "¿Cuánto vale después de un año?"), opts: ["$24,000", "$6,000", "$29,400"], a: 0,
      why: T("$30,000 × 0.80 = $24,000. That's $6,000 gone in a year.", "$30,000 × 0.80 = $24,000. Son $6,000 perdidos en un año.") },
    { facts: [T("The salesperson asks: \"What monthly payment are you looking for?\"", "El vendedor pregunta: \"¿Qué pago mensual buscas?\"")],
      q: T("What's your best answer?", "¿Cuál es tu mejor respuesta?"), opts: [T("Let's agree on the out-the-door price first", "Primero acordemos el precio final"), T("About $300 a month", "Unos $300 al mes"), T("As low as possible", "Lo más bajo posible")], a: 0,
      why: T("A payment target lets the dealer stretch the loan to 6 or 7 years. Settle the full price first, then talk about the loan.", "Un pago objetivo deja que el concesionario alargue el préstamo a 6 o 7 años. Primero acuerda el precio total y luego habla del préstamo.") },
    { facts: [T("Your credit union preapproved you at 7%", "Tu cooperativa de crédito te preaprobó al 7%"), T("The dealer offers 9% for the same 4 years", "El concesionario ofrece 9% por los mismos 4 años"), T("Loan: $10,000", "Préstamo: $10,000")],
      q: T("What do you do?", "¿Qué haces?"), opts: [T("Use the 7% preapproval", "Usas la preaprobación al 7%"), T("Take the 9%, it's easier", "Tomas el 9%, es más fácil"), T("Ask for 6 years at 9%", "Pides 6 años al 9%")], a: 0,
      why: T("At 7% you pay $1,494.08 of interest; at 9%, $1,944.80. The preapproval saves $450.72.", "Al 7% pagas $1,494.08 de interés; al 9%, $1,944.80. La preaprobación te ahorra $450.72.") },
    { facts: [T("Loan payment: $240", "Pago del préstamo: $240"), T("Insurance: $150", "Seguro: $150"), T("Gas: $120", "Gasolina: $120"), T("Upkeep: $50", "Mantenimiento: $50")],
      q: T("What does the car really cost each month?", "¿Cuánto cuesta de verdad el carro cada mes?"), opts: ["$560", "$240", "$390"], a: 0,
      why: T("$240 + $150 + $120 + $50 = $560. The payment is less than half of it.", "$240 + $150 + $120 + $50 = $560. El pago es menos de la mitad.") },
    { facts: [T("Your income: $4,000 a month before taxes", "Tu ingreso: $4,000 al mes antes de impuestos"), T("The 20/4/10 rule", "La regla 20/4/10")],
      q: T("What's the most for payment + insurance?", "¿Cuánto es lo máximo para pago + seguro?"), opts: ["$400", "$800", "$1,000"], a: 0,
      why: T("$4,000 × 0.10 = $400 for the loan payment and insurance together.", "$4,000 × 0.10 = $400 para el pago del préstamo y el seguro juntos.") },
    { facts: [T("Used car price: $9,000", "Precio del carro usado: $9,000"), T("The 20/4/10 rule", "La regla 20/4/10")],
      q: T("How much should you put down?", "¿Cuánto deberías dar de pago inicial?"), opts: ["$1,800", "$900", "$3,600"], a: 0,
      why: T("$9,000 × 0.20 = $1,800.", "$9,000 × 0.20 = $1,800.") },
    { facts: [T("A private seller's used car looks perfect", "El carro usado de un vendedor particular se ve perfecto"), T("The seller says: \"No need for a mechanic, it runs great\"", "El vendedor dice: \"No hace falta mecánico, funciona perfecto\"")],
      q: T("What do you do?", "¿Qué haces?"), opts: [T("Pay your own mechanic to inspect it", "Le pagas a tu propio mecánico para que lo revise"), T("Trust the seller and buy it", "Le crees al vendedor y lo compras"), T("Just take it for a short drive", "Solo das una vuelta corta")], a: 0,
      why: T("An inspection costs about $100 to $200 and can catch a problem that costs thousands. A seller who refuses one is a red flag.", "Una inspección cuesta de $100 a $200 y puede encontrar un problema que cuesta miles. Un vendedor que no la permite es una señal de alerta.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#cl-why"), nextB = $("#cl-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#cl-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#cl-q").textContent = r.q;
    $("#cl-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#cl-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#cl-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#cl-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#cl-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#cl-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Car smart", "Experto en carros") : G.score >= 6 ? T("Ready to shop", "Listo para comprar") : T("Review the four checks", "Repasa las cuatro revisiones")}</b><p>${T("Out-the-door price, 20% down, 4 years or less, payment plus insurance under 10%. And get it inspected.", "Precio final, 20% de pago inicial, 4 años o menos, pago más seguro bajo el 10%. Y que lo revise un mecánico.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="cl-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#cl-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#cl-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#cl").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Shopped the car lot", "Recorriste el lote de carros"));
    if (G.score === N) FH.badge("car-smart");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is depreciation?", opts: ["The drop in a car's value as it gets older", "The interest on a car loan", "The sales tax on a car", "The cost of gas and repairs"], a: 0, why: "Depreciation is lost value. A new car often loses about 20% in its first year." },
    { q: "A new car costs $25,000 and loses 20% in the first year. What's it worth after one year?", opts: ["$20,000", "$5,000", "$24,800", "$22,500"], a: 0, why: "$25,000 × 0.80 = $20,000." },
    { q: "A car's price is $10,000. Sales tax is 6%, and title, registration and fees are $300. What's the out-the-door price?", opts: ["$10,900", "$10,300", "$10,600", "$16,300"], a: 0, why: "$10,000 × 0.06 = $600. $10,000 + $600 + $300 = $10,900." },
    { q: "Under the 20/4/10 rule, what's the longest car loan you should take?", opts: ["4 years", "6 years", "10 years", "20 years"], a: 0, why: "20% down, at most 4 years, payment plus insurance at most 10% of income before taxes." },
    { q: "You earn $3,200 a month before taxes. By the 20/4/10 rule, what's the most for payment plus insurance?", opts: ["$320", "$640", "$800", "$1,000"], a: 0, why: "$3,200 × 0.10 = $320." },
    { q: "A dealer asks what monthly payment you want. Why is it smart to talk about the out-the-door price instead?", opts: ["A payment target lets them stretch the loan so you pay more in total", "Dealers can't legally discuss payments", "The monthly payment includes your insurance", "It lowers your credit score"], a: 0, why: "A longer loan makes the payment smaller but the total interest bigger. Agree on the full price first." },
    { q: "Why get preapproved for a car loan before you shop?", opts: ["You know your rate, and the dealer has to beat it", "It's required by law", "It makes the car cheaper", "It removes sales tax"], a: 0, why: "A preapproval from a bank or credit union is an offer in hand. At 7% instead of 9% on $10,000 for 4 years, you'd save $450.72." },
    { q: "A car's payment is $250, insurance $140, gas $110 and upkeep $50. What's the monthly cost of ownership?", opts: ["$550", "$250", "$390", "$500"], a: 0, why: "$250 + $140 + $110 + $50 = $550." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es la depreciación?", opts: ["La baja en el valor de un carro conforme envejece", "El interés de un préstamo de carro", "El impuesto sobre la venta de un carro", "El costo de la gasolina y las reparaciones"], a: 0, why: "La depreciación es valor perdido. Un carro nuevo muchas veces pierde cerca del 20% en su primer año." },
    { q: "Un carro nuevo cuesta $25,000 y pierde 20% el primer año. ¿Cuánto vale después de un año?", opts: ["$20,000", "$5,000", "$24,800", "$22,500"], a: 0, why: "$25,000 × 0.80 = $20,000." },
    { q: "El precio de un carro es $10,000. El impuesto sobre la venta es 6%, y título, registro y cuotas suman $300. ¿Cuál es el precio final?", opts: ["$10,900", "$10,300", "$10,600", "$16,300"], a: 0, why: "$10,000 × 0.06 = $600. $10,000 + $600 + $300 = $10,900." },
    { q: "Según la regla 20/4/10, ¿cuál es el plazo más largo que deberías tomar para un préstamo de carro?", opts: ["4 años", "6 años", "10 años", "20 años"], a: 0, why: "20% de pago inicial, máximo 4 años, y pago más seguro de máximo el 10% del ingreso antes de impuestos." },
    { q: "Ganas $3,200 al mes antes de impuestos. Según la regla 20/4/10, ¿cuánto es lo máximo para pago más seguro?", opts: ["$320", "$640", "$800", "$1,000"], a: 0, why: "$3,200 × 0.10 = $320." },
    { q: "Un vendedor te pregunta qué pago mensual quieres. ¿Por qué conviene hablar del precio final?", opts: ["Un pago objetivo les deja alargar el préstamo y pagas más en total", "Por ley no pueden hablar de pagos", "El pago mensual incluye tu seguro", "Baja tu puntaje de crédito"], a: 0, why: "Un préstamo más largo hace el pago más chico pero el interés total más grande. Primero acuerda el precio completo." },
    { q: "¿Por qué conviene tener una preaprobación antes de buscar carro?", opts: ["Sabes tu tasa, y el concesionario tiene que mejorarla", "Lo exige la ley", "Hace el carro más barato", "Quita el impuesto sobre la venta"], a: 0, why: "Una preaprobación de un banco o cooperativa es una oferta en mano. Al 7% en vez del 9% por $10,000 a 4 años, ahorrarías $450.72." },
    { q: "El pago de un carro es $250, el seguro $140, la gasolina $110 y el mantenimiento $50. ¿Cuál es el costo mensual de tenerlo?", opts: ["$550", "$250", "$390", "$500"], a: 0, why: "$250 + $140 + $110 + $50 = $550." },
  ];

  FHLesson.init({ id: LESSON, short: "buying-car", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
