// Unit 16, Lesson 3: Options and futures
(function () {
  const LESSON = "u16-derivatives";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const sgn = (n) => (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US");

  // ---------- See it: payoff chart ----------
  const pEl = $("#op-p");
  const share = (p) => (p - 26) * 100, call = (p) => Math.max(p - 30, 0) * 100 - 200;
  const X = (p) => 70 + ((p - 20) / 20) * 500, Y = (v) => 210 - ((v + 700) / 2200) * 190;
  const line = (f) => { const pts = []; for (let p = 20; p <= 40; p += 0.5) pts.push(`${X(p).toFixed(1)},${Y(f(p)).toFixed(1)}`); return pts.join(" "); };
  const drawOp = () => {
    const p = +pEl.value, s = share(p), c = call(p);
    $("#op-p-v").textContent = `$${p}`;
    let g = `<line x1="70" x2="570" y1="${Y(0)}" y2="${Y(0)}" class="op-zero"/>`;
    [[-500, "−$500"], [0, "$0"], [1000, "$1,000"]].forEach(([v, l]) => { g += `<text x="60" y="${Y(v) + 5}" text-anchor="end" class="op-tick">${l}</text>`; });
    [20, 30, 40].forEach((x) => { g += `<text x="${X(x)}" y="238" text-anchor="middle" class="op-tick">$${x}</text>`; });
    g += `<polyline points="${line(share)}" class="op-s"/><polyline points="${line(call)}" class="op-c"/>`;
    g += `<line x1="${X(p)}" x2="${X(p)}" y1="14" y2="214" class="op-now"/><circle cx="${X(p)}" cy="${Y(s)}" r="9" class="op-ds"/><circle cx="${X(p)}" cy="${Y(c)}" r="9" class="op-dc"/>`;
    $("#op-out").innerHTML = `<svg viewBox="0 0 600 248" class="op-chart">${g}</svg>`;
    const m = $("#op-msg");
    m.innerHTML = T(`At $${p}: 100 shares ${s >= 0 ? "gain" : "lose"} <b>${sgn(Math.abs(s))}</b>. The $30 call ${p > 30 ? `is worth ($${p} − $30) × 100 = ${sgn((p - 30) * 100)}, minus $200:` : "expires unused:"} <b>${sgn(c)}</b>.`,
      `A $${p}: 100 acciones ${s >= 0 ? "ganan" : "pierden"} <b>${sgn(Math.abs(s))}</b>. La call de $30 ${p > 30 ? `vale ($${p} − $30) × 100 = ${sgn((p - 30) * 100)}, menos $200:` : "vence sin usarse:"} <b>${sgn(c)}</b>.`);
    m.dataset.tone = c >= 0 ? "good" : "warn";
    fillRange(pEl);
  };
  pEl.addEventListener("input", drawOp);
  drawOp();

  // ---------- Play it: derivatives desk ----------
  const ROUNDS = [
    { facts: [T("Call: strike $20, premium $1", "Call: precio de ejercicio $20, prima $1"), T("Stock at expiration: $25", "Acción al vencimiento: $25")], q: T("Profit on one contract?", "¿Ganancia de un contrato?"),
      opts: ["$400", "$500", "$100", "$2,500"], a: 0,
      why: T("($25 − $20) × 100 = $500, minus the $100 premium = $400.", "($25 − $20) × 100 = $500, menos la prima de $100 = $400.") },
    { facts: [T("Call: strike $20, premium $1", "Call: precio de ejercicio $20, prima $1"), T("Stock at expiration: $18", "Acción al vencimiento: $18")], q: T("Result on one contract?", "¿Resultado de un contrato?"),
      opts: [T("Lose $100", "Pierdes $100"), T("Lose $200", "Pierdes $200"), T("Lose $1,800", "Pierdes $1,800"), T("Gain $200", "Ganas $200")], a: 0,
      why: T("Below the strike, you don't use it. You lose only the $1 × 100 = $100 premium.", "Por debajo del precio de ejercicio no la usas. Solo pierdes la prima de $1 × 100 = $100.") },
    { facts: [T("Put: strike $50, premium $2", "Put: precio de ejercicio $50, prima $2"), T("Stock at expiration: $40", "Acción al vencimiento: $40")], q: T("Profit on one contract?", "¿Ganancia de un contrato?"),
      opts: ["$800", "$1,000", "$200", "$4,000"], a: 0,
      why: T("($50 − $40) × 100 = $1,000, minus the $200 premium = $800.", "($50 − $40) × 100 = $1,000, menos la prima de $200 = $800.") },
    { facts: [T("Contract A: both sides must trade at the set price", "Contrato A: los dos lados deben operar al precio fijado"), T("Contract B: the buyer can choose", "Contrato B: quien compra puede elegir")], q: T("Which one is a futures contract?", "¿Cuál es un contrato de futuros?"),
      opts: [T("Contract A", "El contrato A"), T("Contract B", "El contrato B"), T("Both", "Los dos")], a: 0,
      why: T("Futures bind both sides. An option is a right, not a duty.", "Los futuros obligan a los dos lados. Una opción es un derecho, no una obligación.") },
    { facts: [T("A wheat farmer will harvest in 4 months", "Una granja de trigo cosechará en 4 meses"), T("It sells wheat futures now to lock in a price", "Vende futuros de trigo ahora para fijar un precio")], q: T("Hedging or speculating?", "¿Cobertura o especulación?"),
      opts: [T("Hedging", "Cobertura"), T("Speculating", "Especulación"), T("Neither", "Ninguna")], a: 0,
      why: T("The farm already has wheat price risk and is reducing it.", "La granja ya tiene riesgo por el precio del trigo y lo está reduciendo.") },
    { facts: [T("You buy oil futures: 1,000 barrels at $70", "Compras futuros de petróleo: 1,000 barriles a $70"), T("Oil rises to $80", "El petróleo sube a $80")], q: T("Your gain?", "¿Cuánto ganas?"),
      opts: ["$10,000", "$80,000", "$1,000", "$70,000"], a: 0,
      why: "($80 − $70) × 1,000 = $10,000." },
    { facts: [T("Put: strike $30, premium $3", "Put: precio de ejercicio $30, prima $3")], q: T("Break-even stock price?", "¿Precio de equilibrio de la acción?"),
      opts: ["$27", "$33", "$30", "$3"], a: 0,
      why: T("A put gains as the price falls, so subtract: $30 − $3 = $27.", "Una put gana cuando el precio baja, así que se resta: $30 − $3 = $27.") },
    { facts: [T("You buy a call for a $300 premium", "Compras una call con una prima de $300")], q: T("What's the most you can lose?", "¿Qué es lo máximo que puedes perder?"),
      opts: ["$300", T("No limit", "Sin límite"), "$30,000", "$0"], a: 0,
      why: T("An option buyer can lose only the premium paid.", "Quien compra una opción solo puede perder la prima que pagó.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#dv-why"), nextB = $("#dv-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#dv-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#dv-q").textContent = r.q;
    $("#dv-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#dv-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#dv-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#dv-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#dv-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#dv-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#dv-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Hedge master", "Domina las coberturas") : G.score >= 6 ? T("Ready for the derivatives desk", "Ya puedes con los derivados") : T("Review calls and puts", "Repasa las opciones call y put")}</b><p>${T("Futures lock in a price. Options are a right, not a duty: you risk only the premium.", "Los futuros fijan un precio. Las opciones son un derecho, no una obligación: solo arriesgas la prima.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="dv-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#dv-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#dv-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#dv").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Priced eight derivatives", "Le pusiste precio a ocho derivados"));
    if (G.score === N) FH.badge("hedge-master");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is a derivative?", opts: ["A contract whose value depends on something else, like a stock or a commodity", "A share of a company", "A loan to a government", "A type of savings account"], a: 0, why: "Its value comes from the underlying." },
    { q: "What does a call option give its buyer?", opts: ["The right, but not the duty, to buy at the strike price", "The duty to buy at the strike price", "The right to sell at the strike price", "A share of the company's profits"], a: 0, why: "A call is the right to buy; a put is the right to sell." },
    { q: "You buy a call with a $50 strike for a $3 premium per share. At expiration the stock is $60. What is your profit on one contract?", opts: ["$700", "$1,000", "$300", "$6,000"], a: 0, why: "($60 − $50) × 100 = $1,000, minus the $300 premium = $700." },
    { q: "What is the most an option buyer can lose?", opts: ["The premium paid", "There is no limit", "The strike price × 100", "Twice the premium"], a: 0, why: "If the option isn't worth using, the buyer just lets it expire." },
    { q: "You own shares and fear a crash. Which trade protects you?", opts: ["Buying a put", "Buying a call", "Buying more shares", "Buying futures on the stock"], a: 0, why: "A put pays you when the price falls below the strike, like insurance." },
    { q: "How is a futures contract different from buying an option?", opts: ["Both sides of a futures contract must trade; an option buyer can choose", "Futures can only be used for stocks", "Futures have no set price", "Options must always be used"], a: 0, why: "Futures bind both sides; an option is a right, not a duty." },
    { q: "An airline buys jet fuel futures to lock in next year's fuel price. What is it doing?", opts: ["Hedging", "Speculating", "Selling short", "Making a market"], a: 0, why: "It reduces a risk it already has: rising fuel costs." },
    { q: "A call has a $40 strike and a $2 premium per share. What is its break-even stock price?", opts: ["$42", "$38", "$40", "$2"], a: 0, why: "Strike + premium: $40 + $2 = $42." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es un derivado?", opts: ["Un contrato cuyo valor depende de otra cosa, como una acción o una materia prima", "Una acción de una empresa", "Un préstamo a un gobierno", "Un tipo de cuenta de ahorros"], a: 0, why: "Su valor viene del activo subyacente." },
    { q: "¿Qué le da una opción call a quien la compra?", opts: ["El derecho, pero no la obligación, de comprar al precio de ejercicio", "La obligación de comprar al precio de ejercicio", "El derecho de vender al precio de ejercicio", "Una parte de las ganancias de la empresa"], a: 0, why: "Una call es el derecho a comprar; una put es el derecho a vender." },
    { q: "Compras una call con precio de ejercicio de $50 y prima de $3 por acción. Al vencimiento la acción vale $60. ¿Cuánto ganas con un contrato?", opts: ["$700", "$1,000", "$300", "$6,000"], a: 0, why: "($60 − $50) × 100 = $1,000, menos la prima de $300 = $700." },
    { q: "¿Qué es lo máximo que puede perder quien compra una opción?", opts: ["La prima pagada", "No hay límite", "El precio de ejercicio × 100", "El doble de la prima"], a: 0, why: "Si no conviene usar la opción, simplemente se deja vencer." },
    { q: "Tienes acciones y temes una caída fuerte. ¿Qué operación te protege?", opts: ["Comprar una put", "Comprar una call", "Comprar más acciones", "Comprar futuros sobre la acción"], a: 0, why: "Una put te paga cuando el precio baja del precio de ejercicio, como un seguro." },
    { q: "¿En qué se diferencia un contrato de futuros de comprar una opción?", opts: ["En los futuros, los dos lados deben operar; quien compra una opción puede elegir", "Los futuros solo sirven para acciones", "Los futuros no tienen un precio fijado", "Las opciones siempre se tienen que usar"], a: 0, why: "Los futuros obligan a los dos lados; una opción es un derecho, no una obligación." },
    { q: "Una aerolínea compra futuros de combustible para fijar el precio del próximo año. ¿Qué está haciendo?", opts: ["Una cobertura", "Especulación", "Una venta en corto", "Creación de mercado"], a: 0, why: "Reduce un riesgo que ya tiene: que suba el costo del combustible." },
    { q: "Una call tiene un precio de ejercicio de $40 y una prima de $2 por acción. ¿Cuál es su precio de equilibrio?", opts: ["$42", "$38", "$40", "$2"], a: 0, why: "Precio de ejercicio + prima: $40 + $2 = $42." },
  ];

  FHLesson.init({ id: LESSON, short: "derivatives", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
