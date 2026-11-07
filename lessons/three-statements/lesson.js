// Unit 12, Lesson 3: How the three statements connect
(function () {
  const LESSON = "u12-three-statements";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
  const sgn = (n) => (n > 0 ? "+" : "") + usd(n);

  // ---------- See it: linked statements ----------
  const NI = 2800, DEP = 600, AP = 1000, CAPEX = 3000, OWNER = 1200, KIT = 3000;
  const arEl = $("#ts-ar"), invEl = $("#ts-inv"), loanEl = $("#ts-loan");
  const card = (title, rows) => `<div class="ts-card"><b class="ts-h">${title}</b><dl>${rows.map(([k, v, cls]) => `<div class="${cls || ""}"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div>`;
  const drawTs = () => {
    const AR = +arEl.value, INV = +invEl.value, LOAN = +loanEl.value;
    $("#ts-ar-v").textContent = usd(AR);
    $("#ts-inv-v").textContent = usd(INV);
    $("#ts-loan-v").textContent = usd(LOAN);
    const cfo = NI + DEP - AR - INV + AP, cff = OWNER + LOAN, cash = cfo - CAPEX + cff;
    const assets = cash + AR + INV + (KIT - DEP), liab = AP + LOAN, eq = OWNER + NI;
    $("#ts-out").innerHTML =
      card(T("Income statement", "Estado de resultados"), [
        [T("Revenue", "Ingresos"), "$20,000"],
        [T("Costs before depreciation", "Costos sin depreciación"), "−$16,600"],
        [T("Depreciation", "Depreciación"), usd(-DEP), "lk-dep"],
        [T("Net income", "Utilidad neta"), usd(NI), "lk-ni ts-tot"],
      ]) +
      card(T("Cash flow statement", "Estado de flujo de efectivo"), [
        [T("Net income", "Utilidad neta"), usd(NI), "lk-ni"],
        [T("Add back depreciation", "Más depreciación"), sgn(DEP), "lk-dep"],
        [T("Receivables and inventory", "Por cobrar e inventario"), sgn(-AR - INV)],
        [T("Payables", "Por pagar"), sgn(AP)],
        [T("Operating", "Operación"), sgn(cfo), "ts-sub"],
        [T("Investing (tool kit)", "Inversión (herramientas)"), sgn(-CAPEX), "ts-sub"],
        [T("Financing (you + loan)", "Financiamiento (tú + préstamo)"), sgn(cff), "ts-sub"],
        [T("Ending cash", "Efectivo final"), usd(cash), "lk-cash ts-tot"],
      ]) +
      card(T("Balance sheet, Dec. 31", "Balance general, 31 dic."), [
        [T("Cash", "Efectivo"), usd(cash), "lk-cash"],
        [T("Receivables + inventory", "Por cobrar + inventario"), usd(AR + INV)],
        [T("Tool kit, book value", "Herramientas, valor en libros"), usd(KIT - DEP), "lk-dep"],
        [T("Total assets", "Activos totales"), usd(assets), "ts-sub"],
        [T("Payable + loan", "Por pagar + préstamo"), usd(liab)],
        [T("Put in", "Aportado"), usd(OWNER)],
        [T("Retained earnings", "Utilidades retenidas"), usd(NI), "lk-ni"],
        [T("Liabilities + equity", "Pasivos + capital"), usd(liab + eq), "ts-tot"],
      ]);
    const m = $("#ts-msg");
    if (cash < 0) { m.textContent = T(`Cash would be ${usd(cash)}: overdrawn, even with ${usd(NI)} of net income. Collect faster, hold fewer parts, or borrow more.`, `El efectivo sería ${usd(cash)}: sobregirado, aun con ${usd(NI)} de utilidad neta. Cobra más rápido, ten menos piezas o pide más prestado.`); m.dataset.tone = "warn"; }
    else { m.textContent = T(`Net income ${usd(NI)}, ending cash ${usd(cash)}. Both sides of the balance sheet: ${usd(assets)}.`, `Utilidad neta ${usd(NI)}, efectivo final ${usd(cash)}. Los dos lados del balance: ${usd(assets)}.`); m.dataset.tone = "good"; }
    fillRange(arEl); fillRange(invEl); fillRange(loanEl);
  };
  [arEl, invEl, loanEl].forEach((el) => el.addEventListener("input", drawTs));
  drawTs();

  // ---------- Play it: connect the dots ----------
  const ROUNDS = [
    { facts: [T("Retained earnings at the start of the year: $100,000", "Utilidades retenidas al inicio del año: $100,000"), T("Net income this year: $50,000", "Utilidad neta este año: $50,000"), T("No dividends paid", "No se pagaron dividendos")], q: T("What are retained earnings at year end?", "¿Cuánto son las utilidades retenidas al final del año?"),
      opts: ["$150,000", "$50,000", "$100,000", "$200,000"], a: 0,
      why: T("Net income adds to retained earnings: $100,000 + $50,000 = $150,000.", "La utilidad neta se suma a las utilidades retenidas: $100,000 + $50,000 = $150,000.") },
    { facts: [T("A company had $8,000 of depreciation this year", "Una empresa tuvo $8,000 de depreciación este año")], q: T("Why is it added back in operating cash flow?", "¿Por qué se suma en el flujo de operación?"),
      opts: [T("No cash left for it this year", "No salió efectivo por ella este año"), T("It's a kind of revenue", "Es un tipo de ingreso"), T("It's a loan", "Es un préstamo"), T("The IRS pays it back", "El IRS la devuelve")], a: 0,
      why: T("Depreciation lowered net income, but the cash left when the equipment was bought. So it's added back.", "La depreciación bajó la utilidad neta, pero el efectivo salió cuando se compró el equipo. Por eso se suma.") },
    { facts: [T("A bakery buys a $25,000 oven with cash", "Una panadería compra un horno de $25,000 en efectivo")], q: T("Where does it show up on the cash flow statement?", "¿Dónde aparece en el estado de flujo de efectivo?"),
      opts: [T("Investing activities", "Actividades de inversión"), T("Operating activities", "Actividades de operación"), T("Financing activities", "Actividades de financiamiento"), T("It doesn't", "No aparece")], a: 0,
      why: T("Buying long-lasting equipment is capex, an investing activity.", "Comprar equipo que dura años es una inversión de capital, una actividad de inversión.") },
    { facts: [T("A gym borrows $40,000 from a bank", "Un gimnasio pide prestados $40,000 a un banco")], q: T("Where does the $40,000 show up?", "¿Dónde aparecen los $40,000?"),
      opts: [T("Financing activities", "Actividades de financiamiento"), T("Investing activities", "Actividades de inversión"), T("Operating activities", "Actividades de operación"), T("Revenue", "Ingresos")], a: 0,
      why: T("Cash from lenders or owners is a financing activity. It's not revenue.", "El efectivo de prestamistas o dueños es financiamiento. No es un ingreso.") },
    { facts: [T("Net income: $20,000", "Utilidad neta: $20,000"), T("Depreciation: $5,000", "Depreciación: $5,000"), T("Receivables went up $8,000", "Las cuentas por cobrar subieron $8,000"), T("Nothing else changed", "Nada más cambió")], q: T("What's the cash from operations?", "¿Cuál es el efectivo de operación?"),
      opts: ["$17,000", "$33,000", "$25,000", "$12,000"], a: 0,
      why: T("$20,000 + $5,000 − $8,000 = $17,000. The $8,000 is still owed by customers.", "$20,000 + $5,000 − $8,000 = $17,000. Los $8,000 todavía los deben los clientes.") },
    { facts: [T("Cash from operations: $30,000", "Efectivo de operación: $30,000"), T("Capital expenditures: $12,000", "Inversiones de capital: $12,000")], q: T("What's the free cash flow?", "¿Cuál es el flujo de efectivo libre?"),
      opts: ["$18,000", "$42,000", "$12,000", "$2.50"], a: 0,
      why: T("$30,000 − $12,000 = $18,000.", "$30,000 − $12,000 = $18,000.") },
    { facts: [T("A store's cash flow statement ends with $64,000 of cash", "El estado de flujo de efectivo de una tienda termina con $64,000")], q: T("Where else must $64,000 appear?", "¿Dónde más deben aparecer los $64,000?"),
      opts: [T("Cash on the year-end balance sheet", "El efectivo del balance de fin de año"), T("Net income", "La utilidad neta"), T("Revenue", "Los ingresos"), T("Retained earnings", "Las utilidades retenidas")], a: 0,
      why: T("Ending cash on the cash flow statement is the cash line on the balance sheet.", "El efectivo final del estado de flujo es la línea de efectivo del balance.") },
    { facts: [T("A corporation pays its shareholders a $10,000 dividend", "Una corporación paga a sus accionistas un dividendo de $10,000")], q: T("What does the dividend change?", "¿Qué cambia el dividendo?"),
      opts: [T("Financing cash −$10,000 and retained earnings −$10,000", "Financiamiento −$10,000 y utilidades retenidas −$10,000"), T("Net income −$10,000", "Utilidad neta −$10,000"), T("Operating cash −$10,000", "Operación −$10,000"), T("Nothing", "Nada")], a: 0,
      why: T("A dividend isn't an expense. It's cash paid to owners (financing) and comes straight out of retained earnings.", "Un dividendo no es un gasto. Es efectivo pagado a los dueños (financiamiento) y sale directo de las utilidades retenidas.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#cd-why"), nextB = $("#cd-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#cd-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#cd-q").textContent = r.q;
    $("#cd-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#cd-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#cd-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#cd-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#cd-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#cd-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#cd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Dot connector", "Conectas los puntos") : G.score >= 6 ? T("Almost tied out", "Casi cuadra todo") : T("Review the links", "Repasa las conexiones")}</b><p>${T("Net income feeds cash flow and retained earnings. Ending cash is balance sheet cash.", "La utilidad neta alimenta el flujo de efectivo y las utilidades retenidas. El efectivo final es el efectivo del balance.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="cd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#cd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#cd-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#cd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Tied three statements together", "Uniste los tres estados"));
    if (G.score === N) FH.badge("dot-connector");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What are the three sections of a cash flow statement?", opts: ["Operating, investing and financing", "Revenue, expenses and profit", "Assets, liabilities and equity", "Current, long-term and equity"], a: 0, why: "Cash from running the business, from buying or selling long-lasting assets, and from lenders and owners." },
    { q: "How does net income reach the balance sheet?", opts: ["It adds to retained earnings", "It becomes accounts receivable", "It's added to the loan", "It doesn't"], a: 0, why: "Each year's net income, minus dividends or draws, adds to retained earnings, part of equity." },
    { q: "A company has $40,000 of net income and $10,000 of depreciation. Working capital didn't change. What is its cash from operations?", opts: ["$50,000", "$30,000", "$40,000", "$10,000"], a: 0, why: "$40,000 + $10,000 depreciation added back = $50,000." },
    { q: "If accounts receivable go up during the year, what happens to cash from operations?", opts: ["It's lower than net income suggests", "It's higher than net income", "Nothing", "It doubles"], a: 0, why: "Sales were counted in net income, but customers haven't paid yet, so that cash hasn't arrived." },
    { q: "What is free cash flow?", opts: ["Cash from operations minus capital expenditures", "Net income plus revenue", "Cash in the bank", "Revenue minus cost of goods sold"], a: 0, why: "It's the cash left after paying for the equipment the business needs." },
    { q: "A company has $100,000 of cash from operations and $30,000 of capital expenditures. What is its free cash flow?", opts: ["$70,000", "$130,000", "$30,000", "$3.33"], a: 0, why: "$100,000 − $30,000 = $70,000." },
    { q: "Where does repaying a loan's principal show up?", opts: ["Financing activities", "Operating activities", "Investing activities", "As an expense on the income statement"], a: 0, why: "Paying back lenders is financing. Only the interest is an expense on the income statement." },
    { q: "A company reports positive net income but negative cash from operations. What's a likely reason?", opts: ["Its receivables and inventory grew a lot", "It had too much depreciation", "It paid a dividend", "It bought equipment"], a: 0, why: "Profit counted sales and parts that are still owed by customers or sitting on shelves, so the cash hasn't come in yet." },
  ];
  const QUIZ_ES = [
    { q: "¿Cuáles son las tres secciones del estado de flujo de efectivo?", opts: ["Operación, inversión y financiamiento", "Ingresos, gastos y ganancia", "Activos, pasivos y capital", "Circulante, largo plazo y capital"], a: 0, why: "Efectivo de operar el negocio, de comprar o vender activos que duran años, y de prestamistas y dueños." },
    { q: "¿Cómo llega la utilidad neta al balance general?", opts: ["Se suma a las utilidades retenidas", "Se convierte en cuentas por cobrar", "Se suma al préstamo", "No llega"], a: 0, why: "La utilidad neta de cada año, menos dividendos o retiros, se suma a las utilidades retenidas, parte del capital." },
    { q: "Una empresa tiene $40,000 de utilidad neta y $10,000 de depreciación. El capital de trabajo no cambió. ¿Cuál es su efectivo de operación?", opts: ["$50,000", "$30,000", "$40,000", "$10,000"], a: 0, why: "$40,000 + $10,000 de depreciación sumada = $50,000." },
    { q: "Si las cuentas por cobrar suben durante el año, ¿qué pasa con el efectivo de operación?", opts: ["Es menor de lo que sugiere la utilidad neta", "Es mayor que la utilidad neta", "Nada", "Se duplica"], a: 0, why: "Las ventas se contaron en la utilidad neta, pero los clientes todavía no pagan, así que ese efectivo no ha llegado." },
    { q: "¿Qué es el flujo de efectivo libre?", opts: ["El efectivo de operación menos las inversiones de capital", "La utilidad neta más los ingresos", "El efectivo en el banco", "Los ingresos menos el costo de ventas"], a: 0, why: "Es el efectivo que queda después de pagar el equipo que necesita el negocio." },
    { q: "Una empresa tiene $100,000 de efectivo de operación y $30,000 de inversiones de capital. ¿Cuál es su flujo de efectivo libre?", opts: ["$70,000", "$130,000", "$30,000", "$3.33"], a: 0, why: "$100,000 − $30,000 = $70,000." },
    { q: "¿Dónde aparece el pago del capital de un préstamo?", opts: ["Actividades de financiamiento", "Actividades de operación", "Actividades de inversión", "Como gasto en el estado de resultados"], a: 0, why: "Pagarles a los prestamistas es financiamiento. Solo los intereses son gasto en el estado de resultados." },
    { q: "Una empresa reporta utilidad neta positiva pero efectivo de operación negativo. ¿Cuál es una razón probable?", opts: ["Sus cuentas por cobrar y su inventario crecieron mucho", "Tuvo demasiada depreciación", "Pagó un dividendo", "Compró equipo"], a: 0, why: "La ganancia contó ventas y piezas que los clientes todavía deben o que siguen en los estantes, así que el efectivo no ha entrado." },
  ];

  FHLesson.init({ id: LESSON, short: "three-statements", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
