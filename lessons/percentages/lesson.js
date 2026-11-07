// Unit 10, Lesson 1: The math of percent and growth
(function () {
  const LESSON = "u10-percent-growth";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // ---------- See it: simple vs. compound growth ----------
  const rEl = $("#gm-r"), yEl = $("#gm-y");
  const drawGm = () => {
    const r = +rEl.value, y = +yEl.value, d = r / 100;
    $("#gm-r-v").textContent = r + "%";
    $("#gm-y-v").textContent = y;
    const max = 1000 * Math.pow(1 + d, y);
    let cols = "";
    for (let k = 1; k <= y; k++) {
      const c = 1000 * Math.pow(1 + d, k), s = 1000 * (1 + d * k);
      cols += `<i style="height:${((c / max) * 100).toFixed(2)}%"><s style="height:${((s / c) * 100).toFixed(2)}%"></s></i>`;
    }
    $("#gm-bars").innerHTML = cols;
    const comp = max, simp = 1000 * (1 + d * y);
    const exact = Math.log(2) / Math.log(1 + d);
    $("#gm-out").innerHTML = [
      [y === 1 ? T("Compound, after 1 year", "Compuesto, después de 1 año") : T(`Compound, after ${y} years`, `Compuesto, después de ${y} años`), `<b class="ok">${usd(comp)}</b>`],
      [T("Simple growth", "Crecimiento simple"), usd(simp)],
      [T("Extra from compounding", "Extra por el interés compuesto"), usd(comp - simp)],
      [T("Years to double", "Años para duplicar"), `${fr("72", r)} ≈ ${(72 / r).toFixed(1)} ${T("(exact:", "(exacto:")} ${exact.toFixed(1)})`],
    ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    fillRange(rEl); fillRange(yEl);
  };
  rEl.addEventListener("input", drawGm);
  yEl.addEventListener("input", drawGm);
  drawGm();

  // ---------- Play it: percent sprint ----------
  const ROUNDS = [
    { facts: [T("Meal: $50", "Comida: $50"), T("Tip: 18%", "Propina: 18%")], q: T("How much is the tip?", "¿De cuánto es la propina?"),
      opts: ["$9", "$18", "$5", "$8"], a: 0,
      why: T("18% = 0.18. $50 × 0.18 = $9.", "18% = 0.18. $50 × 0.18 = $9.") },
    { facts: [T("Old price: $40", "Precio anterior: $40"), T("New price: $50", "Precio nuevo: $50")], q: T("By what percent did the price go up?", "¿En qué porcentaje subió el precio?"),
      opts: ["25%", "20%", "10%", "50%"], a: 0,
      why: `${fr("$50 − $40", "$40")} = ${fr("$10", "$40")} = 0.25, ${T("so 25%. Always measure from the old price.", "o sea 25%. Siempre se mide desde el precio anterior.")}` },
    { facts: [T("A stock was $100", "Una acción valía $100"), T("It falls 50% to $50", "Cae 50% a $50")], q: T("What gain does it need to get back to $100?", "¿Qué ganancia necesita para volver a $100?"),
      opts: ["100%", "50%", "75%", "150%"], a: 0,
      why: `${fr("$100 − $50", "$50")} = 1.00, ${T("a 100% gain. The gain starts from the smaller $50.", "una ganancia de 100%. La ganancia parte de los $50, que son menos.")}` },
    { facts: [T("Savings rate last year: 4%", "Tasa de ahorro el año pasado: 4%"), T("Savings rate this year: 6%", "Tasa de ahorro este año: 6%")], q: T("How many percentage points did the rate rise?", "¿Cuántos puntos porcentuales subió la tasa?"),
      opts: [T("2 points", "2 puntos"), T("50 points", "50 puntos"), T("1.5 points", "1.5 puntos"), T("10 points", "10 puntos")], a: 0,
      why: T("Percentage points are the plain difference: 6 − 4 = 2 points. (In percent, that's a 50% increase.)", "Los puntos porcentuales son la simple diferencia: 6 − 4 = 2 puntos. (En porcentaje, es un aumento de 50%.)") },
    { facts: [T("Shoes: $50", "Zapatos: $50"), T("Sale: 20% off", "Oferta: 20% de descuento"), T("Coupon: an extra 10% off the sale price", "Cupón: 10% extra sobre el precio de oferta")], q: T("What do you pay?", "¿Cuánto pagas?"),
      opts: ["$36", "$35", "$40", "$45"], a: 0,
      why: T("Multiply what you keep: $50 × 0.80 = $40, then $40 × 0.90 = $36. Not $35, because the 10% comes off $40, not $50.", "Multiplica lo que te queda: $50 × 0.80 = $40, luego $40 × 0.90 = $36. No $35, porque el 10% se quita de $40, no de $50.") },
    { facts: [T("Money grows 12% a year", "El dinero crece 12% al año"), T("Use the rule of 72", "Usa la regla del 72")], q: T("About how many years until it doubles?", "¿En cuántos años, más o menos, se duplica?"),
      opts: [T("6 years", "6 años"), T("12 years", "12 años"), T("8 years", "8 años"), T("72 years", "72 años")], a: 0,
      why: `${fr("72", "12")} = ${T("6 years.", "6 años.")}` },
    { facts: [T("Savings: $1,000", "Ahorros: $1,000"), T("Grows 10% a year, compound", "Crece 10% al año, compuesto"), T("Time: 2 years", "Tiempo: 2 años")], q: T("How much do you have?", "¿Cuánto tienes?"),
      opts: ["$1,210", "$1,200", "$1,100", "$1,020"], a: 0,
      why: T("$1,000 × 1.10 = $1,100, then $1,100 × 1.10 = $1,210. The extra $10 over simple growth is growth on growth.", "$1,000 × 1.10 = $1,100, luego $1,100 × 1.10 = $1,210. Los $10 extra sobre el crecimiento simple son crecimiento sobre crecimiento.") },
    { facts: [T("Pay: $2,000 a month", "Sueldo: $2,000 al mes"), T("A 10% raise", "Un aumento de 10%"), T("Then a 10% cut", "Luego un recorte de 10%")], q: T("What's your pay now?", "¿Cuánto ganas ahora?"),
      opts: ["$1,980", "$2,000", "$2,020", "$1,800"], a: 0,
      why: T("$2,000 × 1.10 = $2,200, then $2,200 × 0.90 = $1,980. The cut is 10% of a bigger number.", "$2,000 × 1.10 = $2,200, luego $2,200 × 0.90 = $1,980. El recorte es 10% de un número más grande.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#ps-why"), nextB = $("#ps-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#ps-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#ps-q").textContent = r.q;
    $("#ps-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#ps-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#ps-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#ps-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#ps-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#ps-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Percent pro", "Experto en porcentajes") : G.score >= 6 ? T("Sharp with numbers", "Bueno con los números") : T("Review the three moves", "Repasa los tres pasos")}</b><p>${T("Turn the percent into a decimal, use a multiplier, and always ask: percent of what?", "Convierte el porcentaje en decimal, usa un multiplicador y siempre pregunta: ¿porcentaje de qué?")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="ps-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#ps-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#ps-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#ps").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Solved eight percent problems", "Resolviste ocho problemas de porcentajes"));
    if (G.score === N) FH.badge("percent-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is 35% written as a decimal?", opts: ["0.35", "3.5", "0.035", "35.0"], a: 0, why: "Move the decimal point two places left: 35% = 0.35." },
    { q: "An $80 jacket is 25% off. What is the sale price?", opts: ["$60", "$55", "$20", "$75"], a: 0, why: "You keep 75%: $80 × 0.75 = $60. (The discount itself is $20.)" },
    { q: "A shop's monthly sales go from $500 to $600. What is the percent change?", opts: ["20%", "16.7%", "100%", "10%"], a: 0, why: `${fr("$600 − $500", "$500")} = ${fr("$100", "$500")} = 0.20, so 20%. Measure from the starting number.` },
    { q: "A loan rate rises from 2% to 3%. Which statement is correct?", opts: ["It rose 1 percentage point, which is a 50% increase", "It rose 1%, which is a 1 point increase", "It rose 50 percentage points", "It rose 3 percentage points"], a: 0, why: `The plain difference is 3 − 2 = 1 point. As a percent change: ${fr("3 − 2", "2")} = 0.50, a 50% increase.` },
    { q: "An investment falls 20%, from $100 to $80. What gain does it need to get back to $100?", opts: ["25%", "20%", "40%", "15%"], a: 0, why: `${fr("$100 − $80", "$80")} = ${fr("$20", "$80")} = 0.25, a 25% gain. The gain starts from the smaller $80.` },
    { q: "A store takes 30% off, then an extra 20% off the sale price. What is the total discount?", opts: ["44%", "50%", "46%", "40%"], a: 0, why: "Multiply what you keep: 0.70 × 0.80 = 0.56. You pay 56%, so the total discount is 44%." },
    { q: "$500 grows at 4% a year, compounded, for 2 years. How much is it worth?", opts: ["$540.80", "$540.00", "$520.00", "$504.00"], a: 0, why: "$500 × 1.04 = $520, then $520 × 1.04 = $540.80. Simple growth would give $540; the extra $0.80 is growth on growth." },
    { q: "Using the rule of 72, about how long does money take to double at 6% a year?", opts: ["12 years", "6 years", "7.2 years", "18 years"], a: 0, why: `${fr("72", "6")} = 12 years.` },
  ];
  const QUIZ_ES = [
    { q: "¿Cómo se escribe 35% como decimal?", opts: ["0.35", "3.5", "0.035", "35.0"], a: 0, why: "Mueve el punto decimal dos lugares a la izquierda: 35% = 0.35." },
    { q: "Una chaqueta de $80 tiene 25% de descuento. ¿Cuál es el precio de oferta?", opts: ["$60", "$55", "$20", "$75"], a: 0, why: "Te queda el 75%: $80 × 0.75 = $60. (El descuento en sí es de $20.)" },
    { q: "Las ventas mensuales de una tienda pasan de $500 a $600. ¿Cuál es el cambio porcentual?", opts: ["20%", "16.7%", "100%", "10%"], a: 0, why: `${fr("$600 − $500", "$500")} = ${fr("$100", "$500")} = 0.20, o sea 20%. Se mide desde el número inicial.` },
    { q: "La tasa de un préstamo sube de 2% a 3%. ¿Qué afirmación es correcta?", opts: ["Subió 1 punto porcentual, que es un aumento de 50%", "Subió 1%, que es un aumento de 1 punto", "Subió 50 puntos porcentuales", "Subió 3 puntos porcentuales"], a: 0, why: `La simple diferencia es 3 − 2 = 1 punto. Como cambio porcentual: ${fr("3 − 2", "2")} = 0.50, un aumento de 50%.` },
    { q: "Una inversión cae 20%, de $100 a $80. ¿Qué ganancia necesita para volver a $100?", opts: ["25%", "20%", "40%", "15%"], a: 0, why: `${fr("$100 − $80", "$80")} = ${fr("$20", "$80")} = 0.25, una ganancia de 25%. La ganancia parte de los $80, que son menos.` },
    { q: "Una tienda descuenta 30% y luego 20% extra sobre el precio de oferta. ¿Cuál es el descuento total?", opts: ["44%", "50%", "46%", "40%"], a: 0, why: "Multiplica lo que te queda: 0.70 × 0.80 = 0.56. Pagas el 56%, así que el descuento total es de 44%." },
    { q: "$500 crecen 4% al año, con interés compuesto, durante 2 años. ¿Cuánto valen?", opts: ["$540.80", "$540.00", "$520.00", "$504.00"], a: 0, why: "$500 × 1.04 = $520, luego $520 × 1.04 = $540.80. El crecimiento simple daría $540; los $0.80 extra son crecimiento sobre crecimiento." },
    { q: "Con la regla del 72, ¿cuánto tarda el dinero en duplicarse al 6% anual?", opts: ["12 años", "6 años", "7.2 años", "18 años"], a: 0, why: `${fr("72", "6")} = 12 años.` },
  ];

  FHLesson.init({ id: LESSON, short: "percentages", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
