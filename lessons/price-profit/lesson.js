// Unit 11, Lesson 1: Price, costs and profit
(function () {
  const LESSON = "u11-price-profit";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

  // ---------- See it: break-even chart ----------
  const FIXED = 300, VAR = 10, QMAX = 40;
  const pEl = $("#pp-p"), qEl = $("#pp-q"), svg = $("#pp-chart");
  const X0 = 64, X1 = 584, Y0 = 262, Y1 = 18;
  const drawPp = () => {
    const P = +pEl.value, Q = +qEl.value, cm = P - VAR;
    $("#pp-p-v").textContent = "$" + P;
    $("#pp-q-v").textContent = Q;
    const top = Math.max(P * QMAX, FIXED + VAR * QMAX) * 1.08;
    const x = (q) => X0 + ((X1 - X0) * q) / QMAX, y = (v) => Y0 - ((Y0 - Y1) * v) / top;
    const be = FIXED / cm, beUp = Math.ceil(be - 1e-9);
    const step = top > 2000 ? 1000 : 500;
    let g = "";
    for (let v = 0; v <= top; v += step) g += `<line x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}" class="pp-grid"/><text x="${X0 - 8}" y="${y(v) + 5}" text-anchor="end" class="pp-ax">${usd(v)}</text>`;
    for (let q = 0; q <= QMAX; q += 10) g += `<text x="${x(q)}" y="${Y0 + 24}" text-anchor="middle" class="pp-ax">${q}</text>`;
    g += `<line x1="${X0}" x2="${X1}" y1="${y(FIXED)}" y2="${y(FIXED)}" class="pp-fixed"/>`;
    g += `<line x1="${x(0)}" y1="${y(FIXED)}" x2="${x(QMAX)}" y2="${y(FIXED + VAR * QMAX)}" class="pp-cost"/>`;
    g += `<line x1="${x(0)}" y1="${y(0)}" x2="${x(QMAX)}" y2="${y(P * QMAX)}" class="pp-rev"/>`;
    g += `<line x1="${x(Q)}" x2="${x(Q)}" y1="${Y1}" y2="${Y0}" class="pp-now"/>`;
    if (be <= QMAX) g += `<circle cx="${x(be)}" cy="${y(FIXED + VAR * be)}" r="7" class="pp-be"/>`;
    svg.innerHTML = g;
    const rev = P * Q, cost = FIXED + VAR * Q, prof = rev - cost;
    $("#pp-out").innerHTML = [
      [T("Revenue", "Ingresos"), `${Q} × $${P} = <b>${usd(rev)}</b>`],
      [T("Total costs", "Costos totales"), `$300 + ${Q} × $10 = <b>${usd(cost)}</b>`],
      [T("Profit", "Ganancia"), `<b class="${prof >= 0 ? "ok" : "no"}">${usd(prof)}</b>`],
      [T("Break-even", "Punto de equilibrio"), `${fr("$300", "$" + cm)} = ${Number.isInteger(be) ? be : be.toFixed(1)} → <b>${beUp} ${T("tune-ups", "afinaciones")}</b>`],
    ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    const m = $("#pp-msg");
    if (prof > 0) { m.textContent = T(`Profit: ${Q} tune-ups is ${Q - beUp} above break-even.`, `Ganancia: ${Q} afinaciones son ${Q - beUp} más que el punto de equilibrio.`); m.dataset.tone = "good"; }
    else if (prof === 0) { m.textContent = T("Exactly break-even: no profit, no loss.", "Justo en el punto de equilibrio: ni ganas ni pierdes."); m.dataset.tone = ""; }
    else { m.textContent = T(`Loss: you need ${beUp - Q} more tune-up${beUp - Q === 1 ? "" : "s"} to break even.`, `Pérdida: te falta${beUp - Q === 1 ? "" : "n"} ${beUp - Q} afinaci${beUp - Q === 1 ? "ón" : "ones"} para llegar al punto de equilibrio.`); m.dataset.tone = "warn"; }
    fillRange(pEl); fillRange(qEl);
  };
  pEl.addEventListener("input", drawPp);
  qEl.addEventListener("input", drawPp);
  drawPp();

  // ---------- Play it: break-even or bust ----------
  const ROUNDS = [
    { facts: [T("Coffee cart fixed costs: $600 a month", "Costos fijos del carrito de café: $600 al mes"), T("Price: $5 a coffee", "Precio: $5 por café"), T("Cup, beans and milk: $2 a coffee", "Vaso, café y leche: $2 por café")], q: T("How many coffees a month to break even?", "¿Cuántos cafés al mes para llegar al punto de equilibrio?"),
      opts: ["200", "120", "300", "150"], a: 0,
      why: `${T("Each coffee adds $5 − $2 = $3.", "Cada café deja $5 − $2 = $3.")} ${fr("$600", "$3")} = 200.` },
    { facts: [T("A T-shirt printing business", "Un negocio de estampar camisetas"), T("Costs: blank shirts, website fee, booth rent, insurance", "Costos: camisetas lisas, cuota del sitio web, renta del puesto, seguro")], q: T("Which one is a variable cost?", "¿Cuál es un costo variable?"),
      opts: [T("Blank shirts", "Camisetas lisas"), T("Website fee", "Cuota del sitio web"), T("Booth rent", "Renta del puesto"), T("Insurance", "Seguro")], a: 0,
      why: T("Each shirt you sell needs one more blank shirt. The others cost the same no matter how many you sell.", "Cada camiseta que vendes necesita otra camiseta lisa. Los demás cuestan lo mismo sin importar cuántas vendas.") },
    { facts: [T("Cookies sold: 120", "Galletas vendidas: 120"), T("Price: $3 each", "Precio: $3 cada una")], q: T("What's the revenue?", "¿Cuáles son los ingresos?"),
      opts: ["$360", "$123", "$40", "$300"], a: 0,
      why: T("Revenue = price × number sold: 120 × $3 = $360.", "Ingresos = precio × cantidad vendida: 120 × $3 = $360.") },
    { facts: [T("Revenue: $2,000", "Ingresos: $2,000"), T("Variable costs: $600", "Costos variables: $600"), T("Fixed costs: $900", "Costos fijos: $900")], q: T("What's the profit?", "¿Cuál es la ganancia?"),
      opts: ["$500", "$1,400", "$1,100", "$2,000"], a: 0,
      why: T("$2,000 − $900 − $600 = $500.", "$2,000 − $900 − $600 = $500.") },
    { facts: [T("Candle price: $15", "Precio de la vela: $15"), T("Wax, wick and jar: $6 a candle", "Cera, mecha y frasco: $6 por vela")], q: T("What's the contribution margin per candle?", "¿Cuál es el margen de contribución por vela?"),
      opts: ["$9", "$21", "$6", "$15"], a: 0,
      why: T("Price − variable cost: $15 − $6 = $9 toward fixed costs and profit.", "Precio − costo variable: $15 − $6 = $9 para los costos fijos y la ganancia.") },
    { facts: [T("Revenue: $1,200", "Ingresos: $1,200"), T("Profit: $300", "Ganancia: $300")], q: T("What's the profit margin?", "¿Cuál es el margen de ganancia?"),
      opts: ["25%", "40%", "300%", "75%"], a: 0,
      why: `${fr("$300", "$1,200")} = 0.25, ${T("so 25%.", "o sea 25%.")}` },
    { facts: [T("Lawn mowing fixed costs: $200 a month", "Costos fijos de cortar pasto: $200 al mes"), T("Gas: $5 a lawn", "Gasolina: $5 por jardín"), T("At $30 a lawn: 20 customers", "A $30 por jardín: 20 clientes"), T("At $40 a lawn: 12 customers", "A $40 por jardín: 12 clientes")], q: T("Which price earns more profit?", "¿Qué precio deja más ganancia?"),
      opts: ["$30", "$40", T("They're the same", "Dan lo mismo")], a: 0,
      why: T("At $30: 20 × $25 − $200 = $300. At $40: 12 × $35 − $200 = $220.", "A $30: 20 × $25 − $200 = $300. A $40: 12 × $35 − $200 = $220.") },
    { facts: [T("Fixed costs: $500 a month", "Costos fijos: $500 al mes"), T("Contribution margin: $30 a sale", "Margen de contribución: $30 por venta")], q: T("How many sales to break even?", "¿Cuántas ventas para llegar al punto de equilibrio?"),
      opts: ["17", "16", "15", "20"], a: 0,
      why: `${fr("$500", "$30")} = 16.7. ${T("You can't make part of a sale, so round up to 17.", "No puedes hacer parte de una venta, así que redondea hacia arriba: 17.")}` },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#bb-why"), nextB = $("#bb-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#bb-round").textContent = T(`Business ${G.i + 1} of ${N}`, `Negocio ${G.i + 1} de ${N}`);
    $("#bb-q").textContent = r.q;
    $("#bb-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#bb-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#bb-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next business", "Siguiente negocio")} <span class="arrow">→</span>`;
  };
  $("#bb-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#bb-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#bb-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#bb-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("In the black", "Números negros") : G.score >= 6 ? T("Ready to open", "Listo para abrir") : T("Review the three steps", "Repasa los tres pasos")}</b><p>${T("Sort the costs, find what each sale adds, then divide and round up.", "Separa los costos, encuentra lo que deja cada venta, luego divide y redondea hacia arriba.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="bb-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#bb-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#bb-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#bb").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Ran the numbers on eight businesses", "Sacaste las cuentas de ocho negocios"));
    if (G.score === N) FH.badge("in-the-black");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Which of these is a fixed cost for a small bakery?", opts: ["Monthly rent for the shop", "Flour for each loaf", "Boxes for each cake", "Card fees on each sale"], a: 0, why: "Rent stays the same no matter how many loaves you sell. The others rise with each sale." },
    { q: "A business has $1,200 of monthly fixed costs. It sells each item for $50, and each item costs $20 to make. What is its break-even point?", opts: ["40 items", "24 items", "60 items", "17 items"], a: 0, why: `Each item adds $50 − $20 = $30. ${fr("$1,200", "$30")} = 40 items.` },
    { q: "What is the contribution margin?", opts: ["Price minus variable cost per unit", "Revenue minus fixed costs", "Profit divided by revenue", "Fixed costs divided by price"], a: 0, why: "It's what each sale leaves over to cover fixed costs, then to become profit." },
    { q: "A shop has $5,000 of revenue and $4,000 of total costs. What is its profit margin?", opts: ["20%", "25%", "80%", "10%"], a: 0, why: `Profit is $5,000 − $4,000 = $1,000. ${fr("$1,000", "$5,000")} = 0.20, so 20%.` },
    { q: "If a business's fixed costs go up and nothing else changes, what happens to its break-even point?", opts: ["It goes up", "It goes down", "It stays the same", "It disappears"], a: 0, why: "A bigger number on top of the fraction means more sales are needed to cover it." },
    { q: "Each unit has $8 of variable cost. What is the total variable cost of 100 units?", opts: ["$800", "$108", "$8", "$80"], a: 0, why: "100 × $8 = $800." },
    { q: "A business sells 50 units at $20 each. Variable cost is $6 a unit and fixed costs are $400. What is its profit?", opts: ["$300", "$700", "$1,000", "$600"], a: 0, why: "Each unit adds $20 − $6 = $14. 50 × $14 = $700, minus $400 of fixed costs = $300." },
    { q: "Why might raising a price lower a business's profit?", opts: ["Fewer customers may buy", "Fixed costs always rise with price", "Variable costs always double", "Revenue can't go up"], a: 0, why: "Each sale adds more, but if enough customers leave, total profit falls." },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál de estos es un costo fijo para una panadería pequeña?", opts: ["La renta mensual del local", "La harina de cada pan", "Las cajas de cada pastel", "Las comisiones de tarjeta de cada venta"], a: 0, why: "La renta es la misma sin importar cuántos panes vendas. Los otros suben con cada venta." },
    { q: "Un negocio tiene $1,200 de costos fijos al mes. Vende cada producto a $50, y hacer cada uno cuesta $20. ¿Cuál es su punto de equilibrio?", opts: ["40 productos", "24 productos", "60 productos", "17 productos"], a: 0, why: `Cada producto deja $50 − $20 = $30. ${fr("$1,200", "$30")} = 40 productos.` },
    { q: "¿Qué es el margen de contribución?", opts: ["El precio menos el costo variable por unidad", "Los ingresos menos los costos fijos", "La ganancia dividida entre los ingresos", "Los costos fijos divididos entre el precio"], a: 0, why: "Es lo que deja cada venta para cubrir los costos fijos y luego convertirse en ganancia." },
    { q: "Una tienda tiene $5,000 de ingresos y $4,000 de costos totales. ¿Cuál es su margen de ganancia?", opts: ["20%", "25%", "80%", "10%"], a: 0, why: `La ganancia es $5,000 − $4,000 = $1,000. ${fr("$1,000", "$5,000")} = 0.20, o sea 20%.` },
    { q: "Si suben los costos fijos de un negocio y nada más cambia, ¿qué pasa con su punto de equilibrio?", opts: ["Sube", "Baja", "Se queda igual", "Desaparece"], a: 0, why: "Un número más grande arriba de la fracción significa que se necesitan más ventas para cubrirlo." },
    { q: "Cada unidad tiene $8 de costo variable. ¿Cuál es el costo variable total de 100 unidades?", opts: ["$800", "$108", "$8", "$80"], a: 0, why: "100 × $8 = $800." },
    { q: "Un negocio vende 50 unidades a $20 cada una. El costo variable es $6 por unidad y los costos fijos son $400. ¿Cuál es su ganancia?", opts: ["$300", "$700", "$1,000", "$600"], a: 0, why: "Cada unidad deja $20 − $6 = $14. 50 × $14 = $700, menos $400 de costos fijos = $300." },
    { q: "¿Por qué subir un precio podría bajar la ganancia de un negocio?", opts: ["Menos clientes podrían comprar", "Los costos fijos siempre suben con el precio", "Los costos variables siempre se duplican", "Los ingresos no pueden subir"], a: 0, why: "Cada venta deja más, pero si se van suficientes clientes, la ganancia total baja." },
  ];

  FHLesson.init({ id: LESSON, short: "price-profit", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
