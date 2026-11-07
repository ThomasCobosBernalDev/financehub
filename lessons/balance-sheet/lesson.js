// Unit 12, Lesson 2: The balance sheet
(function () {
  const LESSON = "u12-balance-sheet";
  const { $, $$, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

  // ---------- See it: keep it balanced ----------
  const START = { cash: 2600, ar: 1000, inv: 1000, equip: 2400, ap: 1000, loan: 2000, own: 1200, re: 2800 };
  let S = { ...START };
  const LEFT = [["cash", T("Cash", "Efectivo"), "bs-a1"], ["ar", T("Receivable", "Por cobrar"), "bs-a2"], ["inv", T("Inventory", "Inventario"), "bs-a3"], ["equip", T("Equipment", "Equipo"), "bs-a4"]];
  const RIGHT = [["ap", T("Payable", "Por pagar"), "bs-l1"], ["loan", T("Loan", "Préstamo"), "bs-l2"], ["own", T("Put in", "Aportado"), "bs-e1"], ["re", T("Retained", "Retenido"), "bs-e2"]];
  const ACTS = {
    borrow: { can: () => true, go: () => { S.cash += 1000; S.loan += 1000; }, say: T("Cash +$1,000 (asset) and loan +$1,000 (liability).", "Efectivo +$1,000 (activo) y préstamo +$1,000 (pasivo).") },
    cashparts: { can: () => S.cash >= 500, go: () => { S.cash -= 500; S.inv += 500; }, say: T("Cash −$500, inventory +$500. One asset swapped for another, so the total doesn't move.", "Efectivo −$500, inventario +$500. Un activo cambió por otro, así que el total no se mueve.") },
    creditparts: { can: () => true, go: () => { S.inv += 500; S.ap += 500; }, say: T("Inventory +$500 (asset) and accounts payable +$500 (liability).", "Inventario +$500 (activo) y cuentas por pagar +$500 (pasivo).") },
    paybill: { can: () => S.cash >= 500 && S.ap >= 500, go: () => { S.cash -= 500; S.ap -= 500; }, say: T("Cash −$500 (asset) and accounts payable −$500 (liability). Both sides shrink.", "Efectivo −$500 (activo) y cuentas por pagar −$500 (pasivo). Los dos lados bajan.") },
    collect: { can: () => S.ar >= 500, go: () => { S.cash += 500; S.ar -= 500; }, say: T("Cash +$500, receivable −$500. Another swap: the total stays the same.", "Efectivo +$500, por cobrar −$500. Otro cambio: el total queda igual.") },
    invest: { can: () => true, go: () => { S.cash += 1000; S.own += 1000; }, say: T("Cash +$1,000 (asset) and money put in +$1,000 (equity).", "Efectivo +$1,000 (activo) y dinero aportado +$1,000 (capital).") },
  };
  const sum = (keys) => keys.reduce((a, [k]) => a + S[k], 0);
  const drawBs = (said) => {
    const A = sum(LEFT), L = S.ap + S.loan, E = S.own + S.re;
    const W = 600, Hmax = 300, top = 30, bw = 240, scale = Hmax / Math.max(A, 10000);
    const col = (items, x, title) => {
      let y = top + Hmax, g = `<text x="${x + bw / 2}" y="${top + Hmax + 30}" text-anchor="middle" class="bs-t">${title}</text>`;
      items.forEach(([k, name, cls]) => {
        const h = S[k] * scale; if (h <= 0) return;
        y -= h;
        g += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" class="${cls}"/>`;
        if (h >= 26) g += `<text x="${x + 12}" y="${y + h / 2 + 6}" class="bs-lab">${name} ${usd(S[k])}</text>`;
      });
      return g;
    };
    $("#bs-chart").innerHTML = `<svg viewBox="0 0 ${W} ${top + Hmax + 44}" class="bs-svg">${col(LEFT, 30, T(`Assets ${usd(A)}`, `Activos ${usd(A)}`))}${col(RIGHT, W - 30 - bw, T(`Liabilities + equity ${usd(L + E)}`, `Pasivos + capital ${usd(L + E)}`))}</svg>`;
    const ca = S.cash + S.ar + S.inv, cr = S.ap ? (ca / S.ap).toFixed(1) : "—";
    const bal = T(`Still balanced: ${usd(A)} = ${usd(L)} + ${usd(E)}. Current ratio ${cr}.`, `Sigue cuadrando: ${usd(A)} = ${usd(L)} + ${usd(E)}. Razón circulante ${cr}.`);
    $("#bs-msg").textContent = said ? `${said} ${bal}` : T(`December 31: ${usd(A)} = ${usd(L)} + ${usd(E)}. Pick a transaction.`, `31 de diciembre: ${usd(A)} = ${usd(L)} + ${usd(E)}. Elige una operación.`);
    $$(".bs-acts [data-a]").forEach((b) => { b.disabled = !ACTS[b.dataset.a].can(); });
  };
  $(".bs-acts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b || b.disabled) return;
    const a = ACTS[b.dataset.a]; a.go(); drawBs(a.say);
  });
  $("#bs-reset").addEventListener("click", () => { S = { ...START }; drawBs(); });
  drawBs();

  // ---------- Play it: keep it balanced ----------
  const ROUNDS = [
    { facts: [T("A flower shop's assets: $50,000", "Activos de una florería: $50,000"), T("Its liabilities: $20,000", "Sus pasivos: $20,000")], q: T("What's the owner's equity?", "¿Cuál es el capital del dueño?"),
      opts: ["$30,000", "$70,000", "$20,000", "$2.50"], a: 0,
      why: T("Equity = assets − liabilities: $50,000 − $20,000 = $30,000.", "Capital = activos − pasivos: $50,000 − $20,000 = $30,000.") },
    { facts: [T("A food truck's balance sheet has four items", "El balance de un food truck tiene cuatro partidas"), T("The truck, cash, a bank loan, and retained earnings", "El camión, efectivo, un préstamo bancario y utilidades retenidas")], q: T("Which one is a liability?", "¿Cuál es un pasivo?"),
      opts: [T("The bank loan", "El préstamo bancario"), T("The truck", "El camión"), T("The cash", "El efectivo"), T("Retained earnings", "Utilidades retenidas")], a: 0,
      why: T("A loan is money the business owes. The truck and cash are assets; retained earnings are equity.", "Un préstamo es dinero que el negocio debe. El camión y el efectivo son activos; las utilidades retenidas son capital.") },
    { facts: [T("A bookstore has boxes of books waiting to be sold", "Una librería tiene cajas de libros esperando venderse")], q: T("What are the books on its balance sheet?", "¿Qué son los libros en su balance?"),
      opts: [T("Inventory, a current asset", "Inventario, un activo circulante"), T("A liability", "Un pasivo"), T("Equity", "Capital"), T("Revenue", "Ingresos")], a: 0,
      why: T("Goods waiting to be sold are inventory, a current asset: they should turn into cash within a year.", "Los productos que esperan venderse son inventario, un activo circulante: deberían convertirse en efectivo en menos de un año.") },
    { facts: [T("A gym borrows $10,000 from a bank", "Un gimnasio pide prestados $10,000 a un banco"), T("The cash goes into its bank account", "El efectivo entra a su cuenta de banco")], q: T("What happens to its balance sheet?", "¿Qué pasa con su balance?"),
      opts: [T("Assets and liabilities both rise $10,000", "Activos y pasivos suben $10,000"), T("Assets rise, nothing else changes", "Suben los activos y nada más"), T("Equity rises $10,000", "El capital sube $10,000"), T("Liabilities rise, assets fall", "Suben los pasivos y bajan los activos")], a: 0,
      why: T("Cash (an asset) goes up $10,000 and the loan (a liability) goes up $10,000. It stays balanced.", "El efectivo (activo) sube $10,000 y el préstamo (pasivo) sube $10,000. Sigue cuadrando.") },
    { facts: [T("Current assets: $30,000", "Activos circulantes: $30,000"), T("Current liabilities: $15,000", "Pasivos circulantes: $15,000")], q: T("What's the current ratio?", "¿Cuál es la razón circulante?"),
      opts: ["2", "0.5", "45", "15"], a: 0,
      why: `${fr("$30,000", "$15,000")} = 2. ${T("Twice as much coming in soon as going out soon.", "El doble de lo que entra pronto que de lo que sale pronto.")}` },
    { facts: [T("Retained earnings at the start of the year: $8,000", "Utilidades retenidas al inicio del año: $8,000"), T("Net income this year: $5,000", "Utilidad neta este año: $5,000"), T("Nothing paid out to the owners", "Nada se les pagó a los dueños")], q: T("What are retained earnings at year end?", "¿Cuánto son las utilidades retenidas al final del año?"),
      opts: ["$13,000", "$5,000", "$3,000", "$8,000"], a: 0,
      why: T("Kept profit adds up: $8,000 + $5,000 = $13,000.", "La ganancia que se queda se acumula: $8,000 + $5,000 = $13,000.") },
    { facts: [T("Total liabilities: $40,000", "Pasivos totales: $40,000"), T("Equity: $50,000", "Capital: $50,000")], q: T("What's the debt-to-equity ratio?", "¿Cuál es la razón de deuda a capital?"),
      opts: ["0.8", "1.25", "90", "10"], a: 0,
      why: `${fr("$40,000", "$50,000")} = 0.8.` },
    { facts: [T("A café pays a $2,000 supplier bill with cash", "Un café paga con efectivo una factura de $2,000 a un proveedor")], q: T("What happens to the café's equity?", "¿Qué pasa con el capital del café?"),
      opts: [T("Nothing", "Nada"), T("It falls $2,000", "Baja $2,000"), T("It rises $2,000", "Sube $2,000"), T("It falls $4,000", "Baja $4,000")], a: 0,
      why: T("Cash (an asset) and accounts payable (a liability) both fall $2,000. Equity doesn't change.", "El efectivo (activo) y las cuentas por pagar (pasivo) bajan $2,000. El capital no cambia.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#bk-why"), nextB = $("#bk-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#bk-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#bk-q").textContent = r.q;
    $("#bk-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#bk-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#bk-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#bk-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#bk-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#bk-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#bk-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Balanced books", "Cuentas cuadradas") : G.score >= 6 ? T("Nearly balanced", "Casi cuadra") : T("Review the equation", "Repasa la ecuación")}</b><p>${T("Assets = liabilities + equity. Every transaction moves two things.", "Activos = pasivos + capital. Cada operación mueve dos cosas.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="bk-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#bk-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#bk-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#bk").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Balanced eight balance sheets", "Cuadraste ocho balances"));
    if (G.score === N) FH.badge("balanced-books");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Which equation is true for every balance sheet?", opts: ["Assets = liabilities + equity", "Assets = revenue − expenses", "Equity = assets + liabilities", "Liabilities = assets + equity"], a: 0, why: "Everything a business owns was paid for by lenders (liabilities) or owners (equity)." },
    { q: "On a balance sheet, accounts receivable is:", opts: ["An asset", "A liability", "Equity", "An expense"], a: 0, why: "Money customers owe the business is something it owns: a current asset." },
    { q: "A company has $500,000 of assets and $300,000 of liabilities. What is its equity?", opts: ["$200,000", "$800,000", "$300,000", "$1.67"], a: 0, why: "Equity = assets − liabilities: $500,000 − $300,000 = $200,000." },
    { q: "What makes an asset a current asset?", opts: ["It's expected to turn into cash or be used up within a year", "It was bought this year", "It's worth more than $1,000", "It's owned by the owners personally"], a: 0, why: "Cash, receivables and inventory are current; equipment that lasts years is long-term." },
    { q: "What are retained earnings?", opts: ["Net income the business has earned and kept over time", "Cash in the bank", "Money owed to suppliers", "This year's revenue"], a: 0, why: "Each year's net income that isn't paid out to owners adds to retained earnings, a part of equity." },
    { q: "A business has $80,000 of current assets and $40,000 of current liabilities. What is its current ratio?", opts: ["2", "0.5", "40,000", "120,000"], a: 0, why: `${fr("$80,000", "$40,000")} = 2.` },
    { q: "A business buys equipment and pays with cash. What happens to total assets?", opts: ["They stay the same", "They go up", "They go down", "They double"], a: 0, why: "Cash goes down and equipment goes up by the same amount: one asset swapped for another." },
    { q: "A $10,000 machine has been depreciated $2,000 a year for 2 years. What is its book value?", opts: ["$6,000", "$8,000", "$10,000", "$4,000"], a: 0, why: "Accumulated depreciation is 2 × $2,000 = $4,000. $10,000 − $4,000 = $6,000." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué ecuación se cumple en todo balance general?", opts: ["Activos = pasivos + capital", "Activos = ingresos − gastos", "Capital = activos + pasivos", "Pasivos = activos + capital"], a: 0, why: "Todo lo que tiene un negocio lo pagaron los prestamistas (pasivos) o los dueños (capital)." },
    { q: "En un balance general, las cuentas por cobrar son:", opts: ["Un activo", "Un pasivo", "Capital", "Un gasto"], a: 0, why: "El dinero que los clientes le deben al negocio es algo que tiene: un activo circulante." },
    { q: "Una empresa tiene $500,000 de activos y $300,000 de pasivos. ¿Cuál es su capital?", opts: ["$200,000", "$800,000", "$300,000", "$1.67"], a: 0, why: "Capital = activos − pasivos: $500,000 − $300,000 = $200,000." },
    { q: "¿Qué hace que un activo sea circulante?", opts: ["Se espera que se convierta en efectivo o se use en menos de un año", "Se compró este año", "Vale más de $1,000", "Es de los dueños en persona"], a: 0, why: "El efectivo, las cuentas por cobrar y el inventario son circulantes; el equipo que dura años es de largo plazo." },
    { q: "¿Qué son las utilidades retenidas?", opts: ["La utilidad neta que el negocio ha ganado y conservado con el tiempo", "El efectivo en el banco", "El dinero que se debe a proveedores", "Los ingresos de este año"], a: 0, why: "La utilidad neta de cada año que no se paga a los dueños se suma a las utilidades retenidas, parte del capital." },
    { q: "Un negocio tiene $80,000 de activos circulantes y $40,000 de pasivos circulantes. ¿Cuál es su razón circulante?", opts: ["2", "0.5", "40,000", "120,000"], a: 0, why: `${fr("$80,000", "$40,000")} = 2.` },
    { q: "Un negocio compra equipo y paga en efectivo. ¿Qué pasa con los activos totales?", opts: ["Quedan igual", "Suben", "Bajan", "Se duplican"], a: 0, why: "El efectivo baja y el equipo sube en la misma cantidad: un activo cambia por otro." },
    { q: "Una máquina de $10,000 se ha depreciado $2,000 al año durante 2 años. ¿Cuál es su valor en libros?", opts: ["$6,000", "$8,000", "$10,000", "$4,000"], a: 0, why: "La depreciación acumulada es 2 × $2,000 = $4,000. $10,000 − $4,000 = $6,000." },
  ];

  FHLesson.init({ id: LESSON, short: "balance-sheet", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
