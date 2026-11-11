// Unit 17, Lesson 2: Python for finance
(function () {
  const LESSON = "u17-python";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // ---------- See it: the savings loop ----------
  const rEl = $("#py-r");
  const grow = (r, years) => { let b = 0; for (let y = 0; y < years; y++) b = b * (1 + r) + 2400; return b; };
  const drawPy = () => {
    const p = +rEl.value, r = p / 100, end = grow(r, 30);
    $("#py-r-v").textContent = `${p}%`;
    $("#py-code").textContent = `rate = ${p ? r.toFixed(2) : "0"}\nbalance = 0\nfor year in range(30):\n    balance = balance * (1 + rate) + 2400\nprint(round(balance))`;
    $("#py-out").textContent = String(Math.round(end));
    const H = 170, MAX = 600000, Y = (v) => 190 - (v / MAX) * H;
    let g = "";
    [5, 10, 15, 20, 25, 30].forEach((yr, i) => {
      const x = 40 + i * 92, tot = grow(r, yr), inn = 2400 * yr;
      g += `<rect x="${x}" y="${Y(inn)}" width="56" height="${190 - Y(inn)}" class="py-in"/>`;
      if (tot > inn + 1) g += `<rect x="${x}" y="${Y(tot)}" width="56" height="${Y(inn) - Y(tot)}" class="py-gr"/>`;
      g += `<text x="${x + 28}" y="${Y(tot) - 8}" text-anchor="middle" class="py-val">$${Math.round(tot / 1000)}k</text>`;
      g += `<text x="${x + 28}" y="214" text-anchor="middle" class="py-tick">${T("Yr", "Año")} ${yr}</text>`;
    });
    g += `<line x1="30" x2="580" y1="190" y2="190" class="py-base"/>`;
    $("#py-chart").innerHTML = `<svg viewBox="0 0 600 222" class="py-svg">${g}</svg>`;
    const m = $("#py-msg");
    m.innerHTML = T(`At ${p}%: you put in $72,000 yourself, growth adds ${usd(end - 72000)}, and you end with <b>${usd(end)}</b>.`,
      `Al ${p}%: tú pones $72,000, el crecimiento suma ${usd(end - 72000)} y terminas con <b>${usd(end)}</b>.`);
    m.dataset.tone = "good";
    fillRange(rEl);
  };
  rEl.addEventListener("input", drawPy);
  drawPy();

  // ---------- Play it: code check ----------
  const Q = T("What does it print?", "¿Qué imprime?");
  const ROUNDS = [
    { code: "price = 40\ntune_ups = 25\nprint(price * tune_ups)", q: Q,
      opts: ["1000", "65", "15", "price * tune_ups"], a: 0,
      why: T("* means times: 40 × 25 = 1000.", "* significa por: 40 × 25 = 1000.") },
    { code: "months = [20, 25, 30]\nprint(sum(months))", q: Q,
      opts: ["75", "3", "30", "20"], a: 0,
      why: T("sum() adds the list: 20 + 25 + 30 = 75.", "sum() suma la lista: 20 + 25 + 30 = 75.") },
    { code: "months = [20, 25, 30, 35]\nprint(len(months))", q: Q,
      opts: ["4", "110", "35", "3"], a: 0,
      why: T("len() counts the items: there are 4.", "len() cuenta los elementos: hay 4.") },
    { code: "balance = 1000\nfor year in range(3):\n    balance = balance * 1.10\nprint(round(balance))", q: Q,
      opts: ["1331", "1300", "1100", "3300"], a: 0,
      why: T("3 passes: 1000 → 1100 → 1210 → 1331.", "3 vueltas: 1000 → 1100 → 1210 → 1331.") },
    { code: "def profit(tune_ups):\n    return tune_ups * 30 - 300\n\nprint(profit(40))", q: Q,
      opts: ["900", "1200", "300", "1500"], a: 0,
      why: "40 × 30 − 300 = 900." },
    { code: 'npv = -500\nif npv > 0:\n    print("Build it")\nelse:\n    print("Skip it")', q: Q,
      opts: ["Skip it", "Build it", T("Both lines", "Las dos líneas"), T("Nothing", "Nada")], a: 0,
      why: T("−500 is not more than 0, so the else line runs.", "−500 no es mayor que 0, así que corre la línea de else.") },
    { code: "for n in range(3):\n    print(n)", q: T("Which numbers does it print?", "¿Qué números imprime?"),
      opts: ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"], a: 0,
      why: T("range(3) starts at 0 and gives 3 numbers: 0, 1 and 2.", "range(3) empieza en 0 y da 3 números: 0, 1 y 2.") },
    { code: T("# 300 million rows of trades to add up", "# 300 millones de filas de operaciones para sumar"), q: T("Which tool fits best?", "¿Qué herramienta conviene más?"),
      opts: [T("Python with pandas", "Python con pandas"), T("One Excel sheet", "Una hoja de Excel"), T("A calculator", "Una calculadora")], a: 0,
      why: T("An Excel sheet stops at 1,048,576 rows. pandas handles hundreds of millions.", "Una hoja de Excel llega solo a 1,048,576 filas. pandas maneja cientos de millones.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#pc-why"), nextB = $("#pc-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#pc-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#pc-q").textContent = r.q;
    $("#pc-code").textContent = r.code;
    $("#pc-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#pc-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#pc-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#pc-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#pc-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#pc-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Python pro", "Domina Python") : G.score >= 6 ? T("Ready to write your own", "Ya puedes escribir tu propio código") : T("Review loops and lists", "Repasa los bucles y las listas")}</b><p>${T("Read top to bottom, track every variable, count the loop, and check the first pass by hand.", "Lee de arriba abajo, sigue cada variable, cuenta las vueltas del bucle y revisa la primera a mano.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="pc-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#pc-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#pc-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#pc").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Read eight programs", "Leíste ocho programas"));
    if (G.score === N) FH.badge("python-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "In Python, what does price = 40 do?", opts: ["Stores the value 40 under the name price", "Checks whether price equals 40", "Prints 40", "Makes a list"], a: 0, why: "= stores a value; it doesn't test for equality." },
    { q: "What does this print? total = 0, then for n in [10, 20, 30]: total = total + n, then print(total).", opts: ["60", "30", "0", "3"], a: 0, why: "Each pass adds one item: 0 + 10 + 20 + 30 = 60." },
    { q: "In a for loop, which lines repeat?", opts: ["The lines indented under it", "Every line in the file", "Only the first line after it", "The lines above it"], a: 0, why: "Indentation marks what's inside the loop." },
    { q: "What does len([4, 8, 15]) return?", opts: ["3", "27", "15", "4"], a: 0, why: "len() counts items, not their sum." },
    { q: "Why do banks use Python as well as Excel?", opts: ["It repeats steps automatically and handles far more rows than a spreadsheet", "It never makes mistakes", "Excel can't do math", "Python is only for websites"], a: 0, why: "An Excel sheet stops at 1,048,576 rows; code can rerun on millions." },
    { q: "What does def do in Python?", opts: ["Starts a function: a named set of steps you can reuse", "Deletes a variable", "Defines a list", "Ends the program"], a: 0, why: "def names a function; return sends back its answer." },
    { q: "You save $2,400 a year for 30 years at 7%. About how much do you end with?", opts: ["$226,706", "$72,000", "$154,706", "$2,400,000"], a: 0, why: "$72,000 of your own money plus $154,706 of growth." },
    { q: "What is a pandas DataFrame?", opts: ["A table of rows and columns you work with in code", "A chart type", "A kind of loop", "An Excel formula"], a: 0, why: "It's like a spreadsheet you control with Python." },
  ];
  const QUIZ_ES = [
    { q: "En Python, ¿qué hace price = 40?", opts: ["Guarda el valor 40 con el nombre price", "Revisa si price es igual a 40", "Imprime 40", "Crea una lista"], a: 0, why: "= guarda un valor; no compara si son iguales." },
    { q: "¿Qué imprime esto? total = 0, luego for n in [10, 20, 30]: total = total + n, y luego print(total).", opts: ["60", "30", "0", "3"], a: 0, why: "Cada vuelta suma un elemento: 0 + 10 + 20 + 30 = 60." },
    { q: "En un bucle for, ¿qué líneas se repiten?", opts: ["Las líneas con sangría debajo de él", "Todas las líneas del archivo", "Solo la primera línea después", "Las líneas de arriba"], a: 0, why: "La sangría marca lo que está dentro del bucle." },
    { q: "¿Qué devuelve len([4, 8, 15])?", opts: ["3", "27", "15", "4"], a: 0, why: "len() cuenta los elementos, no los suma." },
    { q: "¿Por qué los bancos usan Python además de Excel?", opts: ["Repite pasos solo y maneja muchas más filas que una hoja de cálculo", "Nunca se equivoca", "Excel no puede hacer cuentas", "Python solo sirve para páginas web"], a: 0, why: "Una hoja de Excel llega a 1,048,576 filas; el código puede correr sobre millones." },
    { q: "¿Qué hace def en Python?", opts: ["Empieza una función: un conjunto de pasos con nombre que puedes reusar", "Borra una variable", "Define una lista", "Termina el programa"], a: 0, why: "def le pone nombre a una función; return devuelve su respuesta." },
    { q: "Ahorras $2,400 al año durante 30 años al 7%. ¿Con cuánto terminas, más o menos?", opts: ["$226,706", "$72,000", "$154,706", "$2,400,000"], a: 0, why: "$72,000 de tu dinero más $154,706 de crecimiento." },
    { q: "¿Qué es un DataFrame de pandas?", opts: ["Una tabla de filas y columnas que manejas con código", "Un tipo de gráfica", "Un tipo de bucle", "Una fórmula de Excel"], a: 0, why: "Es como una hoja de cálculo que controlas con Python." },
  ];

  FHLesson.init({ id: LESSON, short: "python", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
