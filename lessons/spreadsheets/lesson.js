// Unit 17, Lesson 1: Spreadsheets for finance
(function () {
  const LESSON = "u17-excel";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + n.toLocaleString("en-US");

  // ---------- See it: the tune-up model ----------
  const gEl = $("#sh-g");
  const MONTHS = T("Jan Feb Mar Apr May Jun", "Ene Feb Mar Abr May Jun").split(" ");
  let sel = "D13";
  const drawSh = () => {
    const g = +gEl.value;
    $("#sh-g-v").textContent = g;
    const cells = {}; // address -> [shown, formula, kind]
    const put = (a, v, f, k) => { cells[a] = [v, f, k || ""]; };
    put("A1", T("Price", "Precio"), T("Price", "Precio"), "lab"); put("B1", "$40", "40", "in");
    put("A2", T("Parts", "Piezas"), T("Parts", "Piezas"), "lab"); put("B2", "$10", "10", "in");
    put("A3", T("Fixed costs", "Costos fijos"), T("Fixed costs", "Costos fijos"), "lab"); put("B3", "$300", "300", "in");
    put("A4", T("Added a month", "Extra al mes"), T("Added a month", "Extra al mes"), "lab"); put("B4", String(g), String(g), "in");
    [T("Month", "Mes"), T("Tune-ups", "Afinaciones"), T("Revenue", "Ingresos"), T("Profit", "Ganancia")].forEach((h, j) => put("ABCD"[j] + 6, h, h, "hd"));
    let tu = 20, sb = 0, sc = 0, sd = 0; const list = [];
    for (let i = 0; i < 6; i++) {
      const r = 7 + i, rev = tu * 40, pro = tu * 30 - 300;
      list.push(tu); sb += tu; sc += rev; sd += pro;
      put("A" + r, MONTHS[i], MONTHS[i], "lab");
      put("B" + r, String(tu), i ? `=B${r - 1}+$B$4` : "20", i ? "" : "in");
      put("C" + r, usd(rev), `=B${r}*$B$1`);
      put("D" + r, usd(pro), `=B${r}*($B$1-$B$2)-$B$3`);
      tu += g;
    }
    put("A13", T("Total", "Total"), T("Total", "Total"), "lab hd");
    put("B13", String(sb), "=SUM(B7:B12)", "tot"); put("C13", usd(sc), "=SUM(C7:C12)", "tot"); put("D13", usd(sd), "=SUM(D7:D12)", "tot");
    let h = `<tr><th></th>${"ABCD".split("").map((c) => `<th>${c}</th>`).join("")}</tr>`;
    for (let r = 1; r <= 13; r++) {
      h += `<tr><th>${r}</th>`;
      "ABCD".split("").forEach((c) => { const a = c + r, x = cells[a]; h += x ? `<td data-a="${a}" tabindex="0" class="${x[2]}${a === sel ? " sel" : ""}">${x[0]}</td>` : `<td data-a="${a}"></td>`; });
      h += "</tr>";
    }
    $("#sh-out").innerHTML = h;
    $("#sh-out").cells = cells;
    showF();
    const m = $("#sh-msg");
    m.innerHTML = T(`With ${g} added each month, tune-ups go ${list.join(", ")}. All 18 formulas update, and six-month profit is <b>${usd(sd)}</b>.`,
      `Con ${g} más cada mes, las afinaciones van ${list.join(", ")}. Las 18 fórmulas se actualizan, y la ganancia de seis meses es <b>${usd(sd)}</b>.`);
    m.dataset.tone = "good";
    fillRange(gEl);
  };
  const showF = () => { const x = $("#sh-out").cells[sel]; $("#sh-f").innerHTML = `<span class="sh-addr">${sel}</span>${x ? x[1] : ""}`; };
  const pick = (e) => {
    const td = e.target.closest("td[data-a]"); if (!td) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.type === "keydown") e.preventDefault();
    sel = td.dataset.a;
    $$("#sh-out td.sel").forEach((x) => x.classList.remove("sel"));
    td.classList.add("sel");
    showF();
  };
  $("#sh-out").addEventListener("click", pick);
  $("#sh-out").addEventListener("keydown", pick);
  gEl.addEventListener("input", drawSh);
  drawSh();

  // ---------- Play it: formula check ----------
  const ROUNDS = [
    { facts: ["B1: 40", "B2: 25"], q: T("What does =B1*B2 show?", "¿Qué muestra =B1*B2?"),
      opts: ["1,000", "65", "15", "4,025"], a: 0,
      why: T("* means times: 40 × 25 = 1,000.", "* significa por: 40 × 25 = 1,000.") },
    { facts: ["B2: 20", "B3: 25", "B4: 30"], q: T("What does =SUM(B2:B4) show?", "¿Qué muestra =SUM(B2:B4)?"),
      opts: ["75", "50", "30", "25"], a: 0,
      why: T("B2:B4 is B2, B3 and B4: 20 + 25 + 30 = 75.", "B2:B4 es B2, B3 y B4: 20 + 25 + 30 = 75.") },
    { facts: ["B2: 20", "B3: 25", "B4: 30"], q: T("What does =AVERAGE(B2:B4) show?", "¿Qué muestra =AVERAGE(B2:B4)?"),
      opts: ["25", "75", "30", "20"], a: 0,
      why: `${fr(75, 3)} = 25.` },
    { facts: [T("C4 holds =B4*$B$1", "C4 tiene =B4*$B$1"), T("You copy it one row down, to C5", "La copias una fila abajo, a C5")], q: T("What formula is in C5?", "¿Qué fórmula queda en C5?"),
      opts: ["=B5*$B$1", "=B4*$B$1", "=B5*$B$2", "=C5*$B$1"], a: 0,
      why: T("B4 moves down to B5; the $ keeps $B$1 locked.", "B4 baja a B5; el $ deja fijo $B$1.") },
    { facts: [T("B1: 40 (price); B2 is empty", "B1: 40 (precio); B2 está vacía"), T("B5: 25", "B5: 25"), T("C4 holds =B4*B1, copied down to C5", "C4 tiene =B4*B1, copiada abajo a C5")], q: T("What does C5 show?", "¿Qué muestra C5?"),
      opts: ["0", "1,000", "800"], a: 0,
      why: T("With no $, B1 moved to B2. C5 is =B5*B2, and B2 is empty: 0.", "Sin $, B1 se movió a B2. C5 es =B5*B2, y B2 está vacía: 0.") },
    { facts: [T("B1: 40, typed in", "B1: 40, escrito a mano"), T("C4: =B4*$B$1", "C4: =B4*$B$1")], q: T("In a bank's model, which one should be blue?", "En el modelo de un banco, ¿cuál va en azul?"),
      opts: [T("B1, the typed-in price", "B1, el precio escrito"), T("C4, the formula", "C4, la fórmula"), T("Both", "Las dos")], a: 0,
      why: T("Blue marks typed-in inputs; formulas stay black.", "El azul marca los datos escritos a mano; las fórmulas van en negro.") },
    { facts: ["=NPV(10%, 3000, 3000, 3000, 3000, 3000): $11,372", T("The machine costs $10,000 today", "La máquina cuesta $10,000 hoy")], q: T("What is the project's NPV?", "¿Cuál es el VPN del proyecto?"),
      opts: ["$1,372", "$11,372", "$21,372", "$5,000"], a: 0,
      why: T("NPV() covers future years only. Subtract today's cost: $11,372 − $10,000 = $1,372.", "NPV() solo cubre los años futuros. Resta el costo de hoy: $11,372 − $10,000 = $1,372.") },
    { facts: [T("January tune-ups (B7): 20", "Afinaciones de enero (B7): 20"), T("Each next month: =B7+$B$4, copied down", "Cada mes siguiente: =B7+$B$4, copiada abajo"), T("B4 is changed to 10", "B4 cambia a 10")], q: T("How many tune-ups in March?", "¿Cuántas afinaciones hay en marzo?"),
      opts: ["40", "30", "25", "60"], a: 0,
      why: T("January 20, February 20 + 10 = 30, March 30 + 10 = 40.", "Enero 20, febrero 20 + 10 = 30, marzo 30 + 10 = 40.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#fx-why"), nextB = $("#fx-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#fx-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#fx-q").textContent = r.q;
    $("#fx-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#fx-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#fx-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#fx-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#fx-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#fx-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#fx-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Formula pro", "Domina las fórmulas") : G.score >= 6 ? T("Ready for a real model", "Ya puedes con un modelo real") : T("Review the $ sign and SUM", "Repasa el signo $ y SUM")}</b><p>${T("Point formulas at input cells, lock what shouldn't move with $, and check one row by hand.", "Haz que las fórmulas apunten a las celdas de datos, fija con $ lo que no debe moverse y revisa una fila a mano.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="fx-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#fx-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#fx-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#fx").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Checked eight formulas", "Revisaste ocho fórmulas"));
    if (G.score === N) FH.badge("formula-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "In a spreadsheet, what does the cell address C4 mean?", opts: ["Column C, row 4", "Row C, column 4", "The 4th formula in the sheet", "Cell number 34"], a: 0, why: "The column letter comes first, then the row number." },
    { q: "What does =AVERAGE(10, 20, 30, 40) return?", opts: ["25", "100", "40", "10"], a: 0, why: `${fr(100, 4)} = 25.` },
    { q: "Why would an analyst write $B$1 instead of B1 in a formula?", opts: ["So the reference stays on B1 when the formula is copied", "To show the cell holds dollars", "To make the cell blue", "To round the answer"], a: 0, why: "The $ signs make it an absolute reference that doesn't move." },
    { q: "Why is =B7*40 worse than =B7*$B$1 when B1 holds the price of 40?", opts: ["If the price changes, the hard-coded 40 stays wrong", "It calculates a different answer today", "Spreadsheets can't multiply by numbers", "It's slower to calculate"], a: 0, why: "Hard-coded numbers don't update when the input changes." },
    { q: "In a financial model, what are inputs?", opts: ["The assumptions you type in, which the formulas use", "The totals at the bottom", "Every cell with a formula", "The chart titles"], a: 0, why: "Inputs are typed-in assumptions; outputs come from formulas." },
    { q: "A project costs $5,000 today and pays $2,000 a year for 3 years. Which Excel formula gives its NPV at 8%?", opts: ["=NPV(8%, 2000, 2000, 2000)-5000", "=NPV(8%, -5000, 2000, 2000, 2000)", "=NPV(8%, 2000, 2000, 2000)", "=SUM(2000, 2000, 2000)-5000"], a: 0, why: "NPV() discounts every value as a future year, so today's cost goes outside it." },
    { q: "C4 holds =B4*$B$1. You copy it one column to the right, to D4. What formula is in D4?", opts: ["=C4*$B$1", "=B4*$B$1", "=C4*$C$1", "=B5*$B$1"], a: 0, why: "B4 moves one column right to C4; $B$1 stays locked." },
    { q: "How many cells are in the range B7:B12?", opts: ["6", "5", "2", "19"], a: 0, why: "B7, B8, B9, B10, B11 and B12." },
  ];
  const QUIZ_ES = [
    { q: "En una hoja de cálculo, ¿qué significa la dirección de celda C4?", opts: ["Columna C, fila 4", "Fila C, columna 4", "La cuarta fórmula de la hoja", "La celda número 34"], a: 0, why: "Primero va la letra de la columna y luego el número de la fila." },
    { q: "¿Qué devuelve =AVERAGE(10, 20, 30, 40)?", opts: ["25", "100", "40", "10"], a: 0, why: `${fr(100, 4)} = 25.` },
    { q: "¿Por qué alguien que hace análisis escribiría $B$1 en vez de B1 en una fórmula?", opts: ["Para que la referencia siga en B1 al copiar la fórmula", "Para mostrar que la celda tiene dólares", "Para poner la celda en azul", "Para redondear el resultado"], a: 0, why: "Los signos $ la vuelven una referencia absoluta que no se mueve." },
    { q: "¿Por qué =B7*40 es peor que =B7*$B$1 si B1 tiene el precio de 40?", opts: ["Si el precio cambia, el 40 escrito a mano queda mal", "Hoy calcula un resultado distinto", "Las hojas de cálculo no pueden multiplicar por números", "Tarda más en calcular"], a: 0, why: "Los números escritos dentro de la fórmula no se actualizan cuando cambia el dato." },
    { q: "En un modelo financiero, ¿qué son los datos de entrada?", opts: ["Los supuestos que escribes a mano y que usan las fórmulas", "Los totales de abajo", "Cada celda con una fórmula", "Los títulos de las gráficas"], a: 0, why: "Los datos de entrada son supuestos escritos a mano; los resultados salen de las fórmulas." },
    { q: "Un proyecto cuesta $5,000 hoy y paga $2,000 al año durante 3 años. ¿Qué fórmula de Excel da su VPN al 8%?", opts: ["=NPV(8%, 2000, 2000, 2000)-5000", "=NPV(8%, -5000, 2000, 2000, 2000)", "=NPV(8%, 2000, 2000, 2000)", "=SUM(2000, 2000, 2000)-5000"], a: 0, why: "NPV() descuenta cada valor como un año futuro, así que el costo de hoy va afuera." },
    { q: "C4 tiene =B4*$B$1. La copias una columna a la derecha, a D4. ¿Qué fórmula queda en D4?", opts: ["=C4*$B$1", "=B4*$B$1", "=C4*$C$1", "=B5*$B$1"], a: 0, why: "B4 se mueve una columna a la derecha, a C4; $B$1 sigue fijo." },
    { q: "¿Cuántas celdas hay en el rango B7:B12?", opts: ["6", "5", "2", "19"], a: 0, why: "B7, B8, B9, B10, B11 y B12." },
  ];

  FHLesson.init({ id: LESSON, short: "spreadsheets", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
