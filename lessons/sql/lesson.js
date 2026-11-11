// Unit 17, Lesson 3: SQL for finance
(function () {
  const LESSON = "u17-sql";
  const { $, $$, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: query picker ----------
  const DATA = [["Austin", "Jan", 1200], ["Denver", "Jan", 900], ["Miami", "Jan", 1500], ["Austin", "Feb", 1400], ["Denver", "Feb", 700], ["Miami", "Feb", 1600], ["Austin", "Mar", 1300], ["Denver", "Mar", 1100], ["Miami", "Mar", 1700]];
  const QS = [
    { sql: "SELECT month, amount\nFROM sales\nWHERE store = 'Austin';", cols: ["month", "amount"],
      rows: () => DATA.filter((r) => r[0] === "Austin").map((r) => [r[1], r[2]]),
      msg: T("3 of the 9 rows match. Add them up and Austin sold <b>3,900</b>.", "3 de las 9 filas cumplen. Súmalas y Austin vendió <b>3,900</b>.") },
    { sql: "SELECT store, month, amount\nFROM sales\nORDER BY amount DESC\nLIMIT 3;", cols: ["store", "month", "amount"],
      rows: () => DATA.slice().sort((a, b) => b[2] - a[2]).slice(0, 3),
      msg: T("Sorted biggest first, then cut to 3 rows: all <b>Miami</b>.", "Ordenadas de mayor a menor y recortadas a 3 filas: todas de <b>Miami</b>.") },
    { sql: "SELECT store, SUM(amount)\nFROM sales\nGROUP BY store;", cols: ["store", "SUM(amount)"],
      rows: () => ["Austin", "Denver", "Miami"].map((s) => [s, DATA.filter((r) => r[0] === s).reduce((t, r) => t + r[2], 0)]),
      msg: T("9 rows become 3 groups, one total each. Miami leads with <b>4,800</b>.", "9 filas se vuelven 3 grupos, con un total cada uno. Miami va adelante con <b>4,800</b>.") },
    { sql: "SELECT store, month, amount\nFROM sales\nWHERE amount > 1250;", cols: ["store", "month", "amount"],
      rows: () => DATA.filter((r) => r[2] > 1250),
      msg: T("<b>5</b> rows pass the test. Denver has none.", "<b>5</b> filas pasan la prueba. Denver no tiene ninguna.") },
  ];
  const showQ = (i) => {
    const q = QS[i];
    $$("#sq .sq-picks .sm-btn").forEach((b) => b.classList.toggle("on", +b.dataset.q === i));
    $("#sq-code").textContent = q.sql;
    $("#sq-out").innerHTML = `<tr>${q.cols.map((c) => `<th>${c}</th>`).join("")}</tr>` + q.rows().map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("");
    const m = $("#sq-msg"); m.innerHTML = q.msg; m.dataset.tone = "good";
  };
  $("#sq .sq-picks").addEventListener("click", (e) => { const b = e.target.closest(".sm-btn"); if (b) showQ(+b.dataset.q); });
  showQ(0);

  // ---------- Play it: query check ----------
  const ROUNDS = [
    { code: "SELECT COUNT(*)\nFROM sales;", q: T("What does it return?", "¿Qué devuelve?"),
      opts: ["9", "3", "11,400", "1"], a: 0,
      why: T("COUNT(*) counts rows: 3 stores × 3 months = 9.", "COUNT(*) cuenta filas: 3 tiendas × 3 meses = 9.") },
    { code: "SELECT SUM(amount)\nFROM sales\nWHERE store = 'Denver';", q: T("What does it return?", "¿Qué devuelve?"),
      opts: ["2700", "900", "3900", "1100"], a: 0,
      why: "900 + 700 + 1100 = 2700." },
    { code: "SELECT month\nFROM sales\nWHERE store = 'Austin'\nORDER BY amount DESC\nLIMIT 1;", q: T("Which month comes back?", "¿Qué mes devuelve?"),
      opts: ["Feb", "Jan", "Mar"], a: 0,
      why: T("Austin's biggest month is Feb (1400). DESC puts it first; LIMIT 1 keeps it.", "El mes más grande de Austin es febrero (1400). DESC lo pone primero; LIMIT 1 lo deja solo.") },
    { code: "SELECT store, AVG(amount)\nFROM sales\nGROUP BY store;", q: T("What is Miami's average?", "¿Cuál es el promedio de Miami?"),
      opts: ["1600", "4800", "1500", "1700"], a: 0,
      why: `${fr("1500 + 1600 + 1700", 3)} = ${fr(4800, 3)} = 1600.` },
    { code: "SELECT COUNT(*)\nFROM sales\nWHERE amount > 1200;", q: T("What does it return?", "¿Qué devuelve?"),
      opts: ["5", "6", "4", "9"], a: 0,
      why: T("1400, 1300, 1500, 1600, 1700. Austin's 1200 isn't more than 1200.", "1400, 1300, 1500, 1600, 1700. Los 1200 de Austin no son mayores que 1200.") },
    { code: "SELECT month, amount\nFROM sales\nWHERE store = 'Miami' AND amount < 1600;", q: T("How many rows come back?", "¿Cuántas filas devuelve?"),
      opts: ["1", "2", "3", "0"], a: 0,
      why: T("Only Miami's Jan (1500) passes both tests.", "Solo enero de Miami (1500) pasa las dos pruebas.") },
    { code: "-- " + T("Which line keeps only Austin's rows?", "¿Qué línea deja solo las filas de Austin?"), q: T("Pick the right clause.", "Elige la cláusula correcta."),
      opts: ["WHERE store = 'Austin'", "SELECT 'Austin'", "FROM Austin", "LIMIT Austin"], a: 0,
      why: T("WHERE filters rows, and text goes in single quotes.", "WHERE filtra filas, y el texto va entre comillas simples.") },
    { code: "SELECT stores.manager, SUM(sales.amount)\nFROM sales\nJOIN stores ON sales.store = stores.store\nGROUP BY stores.manager;", q: T("Rivera manages Austin. What is Rivera's total?", "Rivera dirige Austin. ¿Cuál es el total de Rivera?"),
      opts: ["3900", "4800", "2700", "1300"], a: 0,
      why: T("JOIN gives each Austin sale its manager: 1200 + 1400 + 1300 = 3900.", "JOIN le da a cada venta de Austin su gerente: 1200 + 1400 + 1300 = 3900.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#qy-why"), nextB = $("#qy-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#qy-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#qy-q").textContent = r.q;
    $("#qy-code").textContent = r.code;
    $("#qy-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#qy-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#qy-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#qy-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#qy-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#qy-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Query pro", "Domina las consultas") : G.score >= 6 ? T("Ready for a real database", "Ya puedes con una base de datos real") : T("Review WHERE and GROUP BY", "Repasa WHERE y GROUP BY")}</b><p>${T("Pick the table, filter the rows, summarize, then sort and trim.", "Elige la tabla, filtra las filas, resume, y luego ordena y recorta.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="qy-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#qy-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#qy-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#qy").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Ran eight queries", "Corriste ocho consultas"));
    if (G.score === N) FH.badge("query-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is SQL used for?", opts: ["Asking a database for data and summarizing it", "Drawing charts", "Building websites only", "Sending payments"], a: 0, why: "SQL pulls, filters and summarizes data stored in databases." },
    { q: "Which clause keeps only the rows that pass a test?", opts: ["WHERE", "SELECT", "FROM", "LIMIT"], a: 0, why: "WHERE filters rows; SELECT picks columns." },
    { q: "What does SELECT store, SUM(amount) FROM sales GROUP BY store return?", opts: ["One total for each store", "One total for the whole table", "Every row, unchanged", "The number of stores"], a: 0, why: "GROUP BY makes one group per store, and SUM adds each group." },
    { q: "ORDER BY amount DESC sorts the results how?", opts: ["Biggest amount first", "Smallest amount first", "Alphabetically", "In the order they were saved"], a: 0, why: "DESC means descending: biggest first." },
    { q: "What does COUNT(*) return?", opts: ["The number of rows", "The sum of every column", "The biggest value", "The number of columns"], a: 0, why: "COUNT(*) counts rows." },
    { q: "Which order is correct for a query?", opts: ["SELECT, FROM, WHERE, GROUP BY, ORDER BY", "FROM, SELECT, ORDER BY, WHERE", "WHERE, SELECT, FROM, GROUP BY", "SELECT, WHERE, FROM, ORDER BY"], a: 0, why: "SELECT → FROM → JOIN → WHERE → GROUP BY → ORDER BY → LIMIT." },
    { q: "What does a JOIN do?", opts: ["Combines rows from two tables that share a value in a column", "Adds up a column", "Deletes duplicate rows", "Sorts the results"], a: 0, why: "It matches rows on a shared column, like the store name." },
    { q: "Why do analysts use SQL instead of emailing spreadsheets?", opts: ["Company data lives in databases too big for a spreadsheet, and SQL fetches just what's needed", "SQL is the only way to do math", "Spreadsheets can't show text", "SQL makes data more accurate"], a: 0, why: "Databases can hold millions of rows; a query pulls the slice you need." },
  ];
  const QUIZ_ES = [
    { q: "¿Para qué se usa SQL?", opts: ["Para pedirle datos a una base de datos y resumirlos", "Para dibujar gráficas", "Solo para hacer páginas web", "Para enviar pagos"], a: 0, why: "SQL saca, filtra y resume datos guardados en bases de datos." },
    { q: "¿Qué cláusula deja solo las filas que pasan una prueba?", opts: ["WHERE", "SELECT", "FROM", "LIMIT"], a: 0, why: "WHERE filtra filas; SELECT elige columnas." },
    { q: "¿Qué devuelve SELECT store, SUM(amount) FROM sales GROUP BY store?", opts: ["Un total por cada tienda", "Un total de toda la tabla", "Todas las filas, sin cambios", "El número de tiendas"], a: 0, why: "GROUP BY hace un grupo por tienda, y SUM suma cada grupo." },
    { q: "¿Cómo ordena los resultados ORDER BY amount DESC?", opts: ["Del monto más grande al más chico", "Del monto más chico al más grande", "En orden alfabético", "En el orden en que se guardaron"], a: 0, why: "DESC significa descendente: el más grande primero." },
    { q: "¿Qué devuelve COUNT(*)?", opts: ["El número de filas", "La suma de cada columna", "El valor más grande", "El número de columnas"], a: 0, why: "COUNT(*) cuenta filas." },
    { q: "¿Cuál es el orden correcto de una consulta?", opts: ["SELECT, FROM, WHERE, GROUP BY, ORDER BY", "FROM, SELECT, ORDER BY, WHERE", "WHERE, SELECT, FROM, GROUP BY", "SELECT, WHERE, FROM, ORDER BY"], a: 0, why: "SELECT → FROM → JOIN → WHERE → GROUP BY → ORDER BY → LIMIT." },
    { q: "¿Qué hace un JOIN?", opts: ["Combina filas de dos tablas que comparten un valor en una columna", "Suma una columna", "Borra filas repetidas", "Ordena los resultados"], a: 0, why: "Une filas por una columna en común, como el nombre de la tienda." },
    { q: "¿Por qué quienes hacen análisis usan SQL en vez de enviarse hojas de cálculo?", opts: ["Los datos de la empresa viven en bases de datos demasiado grandes para una hoja de cálculo, y SQL trae solo lo necesario", "SQL es la única forma de hacer cuentas", "Las hojas de cálculo no muestran texto", "SQL hace que los datos sean más exactos"], a: 0, why: "Las bases de datos pueden tener millones de filas; una consulta trae la parte que necesitas." },
  ];

  FHLesson.init({ id: LESSON, short: "sql", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
