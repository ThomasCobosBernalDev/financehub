// Unit 7, Lesson 3: Rent or buy a home?
(function () {
  const LESSON = "u7-home";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");

  // ---------- See it: rent vs. buy over time ----------
  const PRICE = 300000, LOAN = 270000, R = 0.0625 / 12, PAY = 1662.44, RENT = 1800, G = 1.03;
  const costs = (Y) => {
    let bal = LOAN, interest = 0, rent = 0, carry = 0;
    for (let y = 0; y < Y; y++) {
      rent += RENT * 12 * Math.pow(G, y);
      carry += PRICE * Math.pow(G, y) * (0.011 + 0.01) + (150 + 135) * 12;
      for (let m = 0; m < 12; m++) { const it = bal * R; interest += it; bal -= PAY - it; }
    }
    const val = PRICE * Math.pow(G, Y);
    return { rent, own: interest + carry + 9000 + val * 0.06 - (val - PRICE), equity: val - bal, principal: LOAN - bal };
  };
  const yrsEl = $("#rb-yrs");
  const drawRb = () => {
    const Y = +yrsEl.value, c = costs(Y), top = Math.max(costs(15).rent, costs(15).own);
    $("#rb-yrs-v").textContent = Y === 1 ? T("1 year", "1 año") : T(`${Y} years`, `${Y} años`);
    const row = (k, n, v) => `<div class="rb-row rb-${k}"><span>${n}</span><div class="rb-bar"><i style="width:${(100 * v) / top}%"></i></div><b>${usd(v)}</b></div>`;
    $("#rb-bars").innerHTML = row("rent", T("Gone renting", "Perdido rentando"), c.rent) + row("own", T("Gone owning", "Perdido siendo dueño"), c.own);
    const d = Math.abs(c.rent - c.own);
    $("#rb-msg").innerHTML = (d < 2000
      ? T(`<b>About a tie</b> (${usd(d)} apart). This is the break-even point: stay longer and owning pulls ahead.`, `<b>Casi un empate</b> (${usd(d)} de diferencia). Este es el punto de equilibrio: si te quedas más, ser dueño se adelanta.`)
      : c.rent < c.own
      ? T(`<b>Renting wins by ${usd(d)}.</b> Over ${Y} ${Y === 1 ? "year" : "years"}, closing and selling costs outweigh what you'd build.`, `<b>Rentar gana por ${usd(d)}.</b> En ${Y} ${Y === 1 ? "año" : "años"}, los gastos de cierre y de venta pesan más que lo que construirías.`)
      : T(`<b>Owning wins by ${usd(d)}.</b> You stayed long enough for equity and rising value to cover the extra costs.`, `<b>Ser dueño gana por ${usd(d)}.</b> Te quedaste lo suficiente para que el patrimonio y el aumento de valor cubran los costos extra.`))
      + " " + T(`Principal paid so far: ${usd(c.principal)}.`, `Capital pagado hasta ahora: ${usd(c.principal)}.`);
    fillRange(yrsEl);
  };
  yrsEl.addEventListener("input", drawRb);
  drawRb();

  // ---------- Play it: house hunt ----------
  const ROUNDS = [
    { facts: [T("Home price: $250,000", "Precio de la casa: $250,000"), T("You want to put 20% down", "Quieres dar 20% de pago inicial")],
      q: T("How much is the down payment?", "¿De cuánto es el pago inicial?"), opts: ["$50,000", "$20,000", "$25,000"], a: 0,
      why: T("$250,000 × 0.20 = $50,000. Putting down 20% also means no PMI.", "$250,000 × 0.20 = $50,000. Dar 20% también significa que no pagas PMI.") },
    { facts: [T("Home price: $250,000", "Precio de la casa: $250,000"), T("Down payment: 5%", "Pago inicial: 5%")],
      q: T("What extra monthly cost will the lender likely add?", "¿Qué costo mensual extra probablemente agregará el prestamista?"), opts: [T("PMI", "PMI"), T("Nothing extra", "Nada extra"), T("A late fee", "Un cargo por atraso")], a: 0,
      why: T("Under 20% down, most lenders charge private mortgage insurance. It protects the lender, not you.", "Con menos de 20% de pago inicial, casi todos los prestamistas cobran seguro hipotecario privado. Protege al prestamista, no a ti.") },
    { facts: [T("Income: $6,000 a month before taxes", "Ingreso: $6,000 al mes antes de impuestos"), T("The 28% rule", "La regla del 28%")],
      q: T("What's the most for your housing payment?", "¿Cuánto es lo máximo para tu pago de vivienda?"), opts: ["$1,680", "$1,800", "$2,000"], a: 0,
      why: T("$6,000 × 0.28 = $1,680 for mortgage, tax, insurance and PMI together.", "$6,000 × 0.28 = $1,680 para hipoteca, impuesto, seguro y PMI juntos.") },
    { facts: [T("Home price: $250,000", "Precio de la casa: $250,000"), T("Closing costs: 3% of the price", "Gastos de cierre: 3% del precio")],
      q: T("How much are the closing costs?", "¿Cuánto son los gastos de cierre?"), opts: ["$7,500", "$3,000", "$750"], a: 0,
      why: T("$250,000 × 0.03 = $7,500, paid once, on top of the down payment.", "$250,000 × 0.03 = $7,500, que se pagan una vez, además del pago inicial.") },
    { facts: [T("Mortgage payment: $1,500", "Pago de la hipoteca: $1,500"), T("$1,200 of it is interest", "$1,200 son de interés"), T("$300 of it is principal", "$300 son de capital")],
      q: T("How much of this payment builds your equity?", "¿Cuánto de este pago construye tu patrimonio?"), opts: ["$300", "$1,500", "$1,200"], a: 0,
      why: T("Only principal pays down what you owe. The $1,200 of interest goes to the lender.", "Solo el capital baja lo que debes. Los $1,200 de interés se van al prestamista.") },
    { facts: [T("Your home is worth $320,000", "Tu casa vale $320,000"), T("You still owe $250,000", "Todavía debes $250,000")],
      q: T("How much equity do you have?", "¿Cuánto patrimonio tienes?"), opts: ["$70,000", "$320,000", "$250,000"], a: 0,
      why: T("$320,000 − $250,000 = $70,000.", "$320,000 − $250,000 = $70,000.") },
    { facts: [T("Your job will likely move you in 2 years", "Tu trabajo probablemente te mudará en 2 años"), T("Rent: $1,800. Owning: $2,472 a month", "Renta: $1,800. Ser dueño: $2,472 al mes")],
      q: T("Rent or buy?", "¿Rentar o comprar?"), opts: [T("Rent", "Rentar"), T("Buy", "Comprar"), T("Buy with 0% down", "Comprar sin pago inicial")], a: 0,
      why: T("In 2 years, closing costs (about 3%) and selling costs (about 6%) eat more than the equity you'd build. Buying usually pays after about 5 years.", "En 2 años, los gastos de cierre (cerca de 3%) y de venta (cerca de 6%) se comen más que el patrimonio que construirías. Comprar suele convenir después de unos 5 años.") },
    { facts: [T("Home value: $400,000", "Valor de la casa: $400,000"), T("Rule of thumb: upkeep is 1% of value a year", "Regla práctica: el mantenimiento es 1% del valor al año")],
      q: T("How much should you budget for repairs each year?", "¿Cuánto deberías apartar para reparaciones cada año?"), opts: ["$4,000", "$400", "$40,000"], a: 0,
      why: T(`$400,000 × 0.01 = $4,000 a year, about $333 a month.`, `$400,000 × 0.01 = $4,000 al año, unos $333 al mes.`) },
  ];
  const N = ROUNDS.length;
  const S = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#hh-why"), nextB = $("#hh-next");
  const start = () => {
    const r = ROUNDS[S.i];
    S.done = false;
    $("#hh-round").textContent = T(`Question ${S.i + 1} of ${N}`, `Pregunta ${S.i + 1} de ${N}`);
    $("#hh-q").textContent = r.q;
    $("#hh-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#hh-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#hh-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || S.done) return;
    S.done = true;
    const r = ROUNDS[S.i], ok = +b.dataset.k === r.a;
    S.n++; if (ok) S.score++;
    $$("#hh-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#hh-score").textContent = T(`${S.score} of ${S.n}`, `${S.score} de ${S.n}`);
    nextB.disabled = false;
    if (S.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!S.done) return;
    if (S.i < N - 1) { S.i++; start(); return; }
    const res = $("#hh-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${S.score}/${N}</span><div><b>${S.score === N ? T("Home smart", "Experto en vivienda") : S.score >= 6 ? T("Almost ready to buy", "Casi listo para comprar") : T("Review the four checks", "Repasa las cuatro revisiones")}</b><p>${T("Cash to start, the 28% check, the full monthly cost, and how long you'll stay.", "Efectivo para empezar, la revisión del 28%, el costo mensual completo y cuánto tiempo te vas a quedar.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="hh-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#hh-again").addEventListener("click", () => {
      Object.assign(S, { i: 0, score: 0, n: 0 });
      $("#hh-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#hh").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((S.score / N) * 100));
    if (first) FH.addXP(50, T("Went house hunting", "Saliste a buscar casa"));
    if (S.score === N) FH.badge("home-smart");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Early in a 30-year mortgage, where does most of each payment go?", opts: ["Interest", "Principal", "Property tax", "Your savings"], a: 0, why: "At the start you owe the most, so most of the payment is interest. On $270,000 at 6.25%, the first payment is $1,406.25 interest and $256.19 principal." },
    { q: "A home costs $200,000. You put 10% down and closing costs are 3%. How much cash do you need to start?", opts: ["$26,000", "$20,000", "$6,000", "$23,000"], a: 0, why: "$200,000 × 0.10 = $20,000 down. $200,000 × 0.03 = $6,000 closing. $20,000 + $6,000 = $26,000." },
    { q: "What is PMI?", opts: ["Insurance most lenders charge when you put down less than 20%; it protects the lender", "Insurance that pays for your repairs", "Your monthly property tax", "A discount for a good credit score"], a: 0, why: "Private mortgage insurance protects the lender if you stop paying. It can be dropped once you owe 80% or less of the home's value." },
    { q: "You earn $7,000 a month before taxes. By the 28% rule, what's the most for your housing payment?", opts: ["$1,960", "$2,100", "$1,750", "$2,800"], a: 0, why: "$7,000 × 0.28 = $1,960." },
    { q: "Your home is worth $350,000 and you owe $290,000. What's your equity?", opts: ["$60,000", "$350,000", "$290,000", "$640,000"], a: 0, why: "Equity = value − what you owe: $350,000 − $290,000 = $60,000." },
    { q: "Which cost do owners pay that renters usually don't?", opts: ["Property tax and repairs", "Monthly housing payments", "Utilities", "Moving costs"], a: 0, why: "Owners pay property tax, homeowners insurance and every repair. For renters, those are the landlord's job." },
    { q: "You might move for work in 2 years. Why is renting usually cheaper?", opts: ["Closing and selling costs eat more than the equity you'd build in 2 years", "Rent always costs less than a mortgage", "You can't sell a home within 5 years", "Mortgages can't be paid off early"], a: 0, why: "Buying has big one-time costs at both ends. A common rule of thumb is to stay about 5 years or more for buying to win." },
    { q: "Using the 1% rule, how much should the owner of a $250,000 home budget for upkeep each year?", opts: ["$2,500", "$250", "$25,000", "$1,000"], a: 0, why: "$250,000 × 0.01 = $2,500 a year." },
  ];
  const QUIZ_ES = [
    { q: "Al inicio de una hipoteca a 30 años, ¿a dónde va la mayor parte de cada pago?", opts: ["Al interés", "Al capital", "Al impuesto sobre la propiedad", "A tus ahorros"], a: 0, why: "Al inicio debes más, así que casi todo el pago es interés. En $270,000 al 6.25%, el primer pago es $1,406.25 de interés y $256.19 de capital." },
    { q: "Una casa cuesta $200,000. Das 10% de pago inicial y los gastos de cierre son 3%. ¿Cuánto efectivo necesitas para empezar?", opts: ["$26,000", "$20,000", "$6,000", "$23,000"], a: 0, why: "$200,000 × 0.10 = $20,000 de pago inicial. $200,000 × 0.03 = $6,000 de cierre. $20,000 + $6,000 = $26,000." },
    { q: "¿Qué es el PMI?", opts: ["Un seguro que cobran casi todos los prestamistas si das menos de 20% de pago inicial; protege al prestamista", "Un seguro que paga tus reparaciones", "Tu impuesto mensual sobre la propiedad", "Un descuento por buen puntaje de crédito"], a: 0, why: "El seguro hipotecario privado protege al prestamista si dejas de pagar. Se puede quitar cuando debes 80% o menos del valor de la casa." },
    { q: "Ganas $7,000 al mes antes de impuestos. Según la regla del 28%, ¿cuánto es lo máximo para tu pago de vivienda?", opts: ["$1,960", "$2,100", "$1,750", "$2,800"], a: 0, why: "$7,000 × 0.28 = $1,960." },
    { q: "Tu casa vale $350,000 y debes $290,000. ¿Cuál es tu patrimonio en la casa?", opts: ["$60,000", "$350,000", "$290,000", "$640,000"], a: 0, why: "Patrimonio = valor − lo que debes: $350,000 − $290,000 = $60,000." },
    { q: "¿Qué costo pagan los dueños que los inquilinos casi nunca pagan?", opts: ["Impuesto sobre la propiedad y reparaciones", "Pagos mensuales de vivienda", "Servicios", "Gastos de mudanza"], a: 0, why: "Los dueños pagan el impuesto sobre la propiedad, el seguro de hogar y cada reparación. Para los inquilinos, eso le toca al casero." },
    { q: "Quizá te mudes por trabajo en 2 años. ¿Por qué rentar suele salir más barato?", opts: ["Los gastos de cierre y de venta se comen más que el patrimonio que construirías en 2 años", "La renta siempre cuesta menos que una hipoteca", "No puedes vender una casa antes de 5 años", "Las hipotecas no se pueden pagar antes"], a: 0, why: "Comprar tiene costos grandes de una sola vez al principio y al final. Una regla práctica es quedarte unos 5 años o más para que comprar convenga." },
    { q: "Con la regla del 1%, ¿cuánto debería apartar al año para mantenimiento el dueño de una casa de $250,000?", opts: ["$2,500", "$250", "$25,000", "$1,000"], a: 0, why: "$250,000 × 0.01 = $2,500 al año." },
  ];

  FHLesson.init({ id: LESSON, short: "rent-vs-buy", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
