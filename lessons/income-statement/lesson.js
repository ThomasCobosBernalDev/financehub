// Unit 12, Lesson 1: The income statement
(function () {
  const LESSON = "u12-income-statement";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
  const pct = (n) => (Math.round(n * 1000) / 10).toString().replace(/\.0$/, "").replace("-", "−") + "%";

  // ---------- See it: income statement ----------
  const PARTS = 10, OPEX = 11400, DEP = 600, INTEREST = 200;
  const qEl = $("#is-q"), pEl = $("#is-p");
  let corp = false;
  const drawIs = () => {
    const Q = +qEl.value, P = +pEl.value;
    $("#is-q-v").textContent = Q;
    $("#is-p-v").textContent = "$" + P;
    const rev = Q * P, cogs = Q * PARTS, gp = rev - cogs, op = gp - OPEX - DEP, pre = op - INTEREST;
    const tax = corp && pre > 0 ? pre * 0.21 : 0, net = pre - tax;
    const rows = [
      [T("Revenue", "Ingresos"), `${Q} × $${P}`, rev, "rev"],
      [T("Cost of goods sold", "Costo de ventas"), `${Q} × $10`, -cogs, "cost"],
      [T("Gross profit", "Utilidad bruta"), pct(gp / rev), gp, "sub"],
      [T("Rent, insurance, ads", "Renta, seguro, anuncios"), "", -OPEX, "cost"],
      [T("Depreciation", "Depreciación"), "", -DEP, "cost"],
      [T("Operating income", "Utilidad de operación"), pct(op / rev), op, "sub"],
      [T("Interest", "Intereses"), "", -INTEREST, "cost"],
      [T("Income tax", "Impuesto sobre la renta"), corp ? (pre > 0 ? "21%" : T("no tax on a loss", "sin impuesto si hay pérdida")) : T("pass-through", "de transferencia"), -tax, "cost"],
      [T("Net income", "Utilidad neta"), pct(net / rev), net, "net"],
    ];
    $("#is-tbl").innerHTML = rows.map(([name, note, v, k]) => {
      const w = Math.min(100, (Math.abs(v) / rev) * 100);
      const cls = k === "rev" ? "is-rev" : k === "cost" || v < 0 ? "is-cost" : "is-prof";
      return `<tr class="${k === "sub" || k === "net" ? "is-sum" : ""}"><th scope="row">${name}${note ? `<small>${note}</small>` : ""}</th><td class="is-v">${usd(v)}</td><td class="is-b"><i class="${cls}" style="width:${w.toFixed(1)}%"></i></td></tr>`;
    }).join("");
    const m = $("#is-msg");
    if (net > 0) { m.textContent = T(`Net income ${usd(net)}: about ${Math.round((net / rev) * 100)} cents of every sales dollar is profit.`, `Utilidad neta de ${usd(net)}: unos ${Math.round((net / rev) * 100)} centavos de cada dólar de ventas son ganancia.`); m.dataset.tone = "good"; }
    else if (net === 0) { m.textContent = T("Exactly zero: the costs ate the whole top line.", "Justo cero: los costos se comieron todos los ingresos."); m.dataset.tone = ""; }
    else { m.textContent = T(`A net loss of ${usd(-net)}: $${(OPEX + DEP + INTEREST).toLocaleString("en-US")} of fixed costs is more than the gross profit.`, `Una pérdida neta de ${usd(-net)}: los $${(OPEX + DEP + INTEREST).toLocaleString("en-US")} de costos fijos superan la utilidad bruta.`); m.dataset.tone = "warn"; }
    fillRange(qEl); fillRange(pEl);
  };
  qEl.addEventListener("input", drawIs);
  pEl.addEventListener("input", drawIs);
  $(".is-type").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    corp = b.dataset.c === "corp";
    $$(".is-type [data-c]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    drawIs();
  });
  $$(".is-type [data-c]").forEach((x) => x.setAttribute("aria-pressed", x.classList.contains("on")));
  drawIs();

  // ---------- Play it: line it up ----------
  const ROUNDS = [
    { facts: [T("A coffee shop's costs this year", "Los costos de una cafetería este año"), T("Coffee beans, milk and cups for the drinks it sold", "Café, leche y vasos de las bebidas que vendió")], q: T("Where do the beans, milk and cups go?", "¿Dónde van el café, la leche y los vasos?"),
      opts: [T("Cost of goods sold", "Costo de ventas"), T("Operating expenses", "Gastos de operación"), T("Revenue", "Ingresos"), T("Interest", "Intereses")], a: 0,
      why: T("They're the direct cost of each drink sold, so they're COGS.", "Son el costo directo de cada bebida vendida, así que son costo de ventas.") },
    { facts: [T("A bakery pays $2,000 a month for its shop", "Una panadería paga $2,000 al mes por su local"), T("It pays the same no matter how much bread it sells", "Paga lo mismo sin importar cuánto pan venda")], q: T("Where does the rent go?", "¿Dónde va la renta?"),
      opts: [T("Operating expenses", "Gastos de operación"), T("Cost of goods sold", "Costo de ventas"), T("Revenue", "Ingresos"), T("Taxes", "Impuestos")], a: 0,
      why: T("Rent is a cost of running the business, not of each sale: an operating expense.", "La renta es un costo de operar el negocio, no de cada venta: un gasto de operación.") },
    { facts: [T("Revenue: $50,000", "Ingresos: $50,000"), T("Cost of goods sold: $20,000", "Costo de ventas: $20,000")], q: T("What's the gross profit?", "¿Cuál es la utilidad bruta?"),
      opts: ["$30,000", "$70,000", "$20,000", "$2,500"], a: 0,
      why: T("$50,000 − $20,000 = $30,000.", "$50,000 − $20,000 = $30,000.") },
    { facts: [T("Gross profit: $30,000", "Utilidad bruta: $30,000"), T("Operating expenses: $22,000", "Gastos de operación: $22,000")], q: T("What's the operating income?", "¿Cuál es la utilidad de operación?"),
      opts: ["$8,000", "$52,000", "$22,000", "$30,000"], a: 0,
      why: T("$30,000 − $22,000 = $8,000, before interest and taxes.", "$30,000 − $22,000 = $8,000, antes de intereses e impuestos.") },
    { facts: [T("A shop's revenue: $40,000", "Ingresos de una tienda: $40,000"), T("Net income: $6,000", "Utilidad neta: $6,000")], q: T("What's the net margin?", "¿Cuál es el margen neto?"),
      opts: ["15%", "6%", "34%", "85%"], a: 0,
      why: `${fr("$6,000", "$40,000")} = 0.15, ${T("so 15%.", "o sea 15%.")}` },
    { facts: [T("A pizza place buys a $10,000 oven", "Una pizzería compra un horno de $10,000"), T("It should last 5 years", "Debería durar 5 años")], q: T("How much depreciation goes on each year's income statement?", "¿Cuánta depreciación va en el estado de resultados de cada año?"),
      opts: ["$2,000", "$10,000", "$5,000", "$50,000"], a: 0,
      why: `${fr("$10,000", "5")} = ${T("$2,000 a year, for 5 years.", "$2,000 al año, durante 5 años.")}` },
    { facts: [T("A C corporation's pre-tax income: $100,000", "Utilidad antes de impuestos de una corporación C: $100,000"), T("Tax rate: 21%", "Tasa de impuestos: 21%")], q: T("What's its net income?", "¿Cuál es su utilidad neta?"),
      opts: ["$79,000", "$21,000", "$100,000", "$121,000"], a: 0,
      why: T("Tax is $100,000 × 0.21 = $21,000, so $100,000 − $21,000 = $79,000.", "El impuesto es $100,000 × 0.21 = $21,000, así que $100,000 − $21,000 = $79,000.") },
    { facts: [T("A landscaping company made two loan payments this year", "Una empresa de jardinería hizo dos pagos de préstamo este año"), T("$5,000 paid back the amount borrowed", "$5,000 pagaron lo que pidió prestado"), T("$400 was interest", "$400 fueron intereses")], q: T("How much is an expense on the income statement?", "¿Cuánto es gasto en el estado de resultados?"),
      opts: ["$400", "$5,400", "$5,000", "$0"], a: 0,
      why: T("Only the interest is an expense. Paying back the principal just returns borrowed money.", "Solo los intereses son gasto. Pagar el capital del préstamo solo devuelve dinero prestado.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#li-why"), nextB = $("#li-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#li-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#li-q").textContent = r.q;
    $("#li-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#li-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#li-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#li-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#li-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#li-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#li-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Bottom liner", "Experto en utilidades") : G.score >= 6 ? T("Almost balanced", "Casi cuadra") : T("Review the four steps", "Repasa los cuatro pasos")}</b><p>${T("Revenue, minus COGS, minus operating expenses, minus interest and taxes.", "Ingresos, menos costo de ventas, menos gastos de operación, menos intereses e impuestos.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="li-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#li-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#li-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#li").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Read eight income statements", "Leíste ocho estados de resultados"));
    if (G.score === N) FH.badge("bottom-liner");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "On an income statement, what is revenue minus cost of goods sold?", opts: ["Gross profit", "Net income", "Operating income", "Operating expenses"], a: 0, why: "It's the first subtraction: what's left after the direct cost of what was sold." },
    { q: "What does EBIT stand for?", opts: ["Earnings before interest and taxes", "Expenses before income taxes", "Earnings beyond inventory totals", "Equity before interest and trade"], a: 0, why: "EBIT is another name for operating income: profit before interest and taxes." },
    { q: "A company has $200,000 of revenue and $80,000 of cost of goods sold. What is its gross margin?", opts: ["60%", "40%", "80%", "250%"], a: 0, why: `Gross profit is $200,000 − $80,000 = $120,000. ${fr("$120,000", "$200,000")} = 0.60, so 60%.` },
    { q: "What is depreciation?", opts: ["Spreading the cost of a long-lasting item over the years it's used", "A drop in a company's stock price", "Interest paid on a loan", "Money customers still owe"], a: 0, why: "Each year gets a slice of the price, like $600 a year for a $3,000 tool kit used 5 years." },
    { q: "Which line is called the bottom line?", opts: ["Net income", "Revenue", "Gross profit", "Cost of goods sold"], a: 0, why: "Net income sits at the bottom, after every cost, interest and tax." },
    { q: "A company earns $50,000 of net income on $1,000,000 of revenue. What is its net margin?", opts: ["5%", "50%", "20%", "0.5%"], a: 0, why: `${fr("$50,000", "$1,000,000")} = 0.05, so 5%.` },
    { q: "A business finishes a $4,000 job in June and gets paid in August. When does the $4,000 count as revenue?", opts: ["June, when the work was done", "August, when the cash arrives", "Half in June, half in August", "Never, until the year ends"], a: 0, why: "Revenue counts when it's earned, even if the cash comes later, just like the bike club order in Lesson 11.2." },
    { q: "A company buys a $20,000 truck it will use for 4 years. How much of it is an expense on this year's income statement?", opts: ["$5,000", "$20,000", "$0", "$80,000"], a: 0, why: `${fr("$20,000", "4")} = $5,000 of depreciation a year.` },
  ];
  const QUIZ_ES = [
    { q: "En un estado de resultados, ¿qué son los ingresos menos el costo de ventas?", opts: ["La utilidad bruta", "La utilidad neta", "La utilidad de operación", "Los gastos de operación"], a: 0, why: "Es la primera resta: lo que queda después del costo directo de lo que se vendió." },
    { q: "¿Qué significa EBIT?", opts: ["Utilidad antes de intereses e impuestos", "Gastos antes de impuestos", "Utilidad más allá del inventario", "Capital antes de intereses y comercio"], a: 0, why: "EBIT, por sus siglas en inglés, es otro nombre de la utilidad de operación: la ganancia antes de intereses e impuestos." },
    { q: "Una empresa tiene $200,000 de ingresos y $80,000 de costo de ventas. ¿Cuál es su margen bruto?", opts: ["60%", "40%", "80%", "250%"], a: 0, why: `La utilidad bruta es $200,000 − $80,000 = $120,000. ${fr("$120,000", "$200,000")} = 0.60, o sea 60%.` },
    { q: "¿Qué es la depreciación?", opts: ["Repartir el costo de algo que dura años entre los años que se usa", "Una baja en el precio de la acción", "Los intereses de un préstamo", "El dinero que todavía deben los clientes"], a: 0, why: "Cada año recibe una parte del precio, como $600 al año por herramientas de $3,000 que se usan 5 años." },
    { q: "¿Qué línea se llama la última línea?", opts: ["La utilidad neta", "Los ingresos", "La utilidad bruta", "El costo de ventas"], a: 0, why: "La utilidad neta está hasta abajo, después de todos los costos, intereses e impuestos." },
    { q: "Una empresa gana $50,000 de utilidad neta sobre $1,000,000 de ingresos. ¿Cuál es su margen neto?", opts: ["5%", "50%", "20%", "0.5%"], a: 0, why: `${fr("$50,000", "$1,000,000")} = 0.05, o sea 5%.` },
    { q: "Un negocio termina un trabajo de $4,000 en junio y le pagan en agosto. ¿Cuándo cuentan los $4,000 como ingresos?", opts: ["En junio, cuando se hizo el trabajo", "En agosto, cuando llega el efectivo", "La mitad en junio y la mitad en agosto", "Nunca, hasta que termine el año"], a: 0, why: "Los ingresos cuentan cuando se ganan, aunque el efectivo llegue después, como el pedido del club de ciclismo en la Lección 11.2." },
    { q: "Una empresa compra una camioneta de $20,000 que usará 4 años. ¿Cuánto es gasto en el estado de resultados de este año?", opts: ["$5,000", "$20,000", "$0", "$80,000"], a: 0, why: `${fr("$20,000", "4")} = $5,000 de depreciación al año.` },
  ];

  FHLesson.init({ id: LESSON, short: "income-statement", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
