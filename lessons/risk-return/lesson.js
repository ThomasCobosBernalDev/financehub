// Unit 14, Lesson 1: Risk and return
(function () {
  const LESSON = "u14-risk-return";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
  const pct = (n) => (n < 0 ? "−" : "") + Math.abs(+n.toFixed(1)) + "%";

  // ---------- See it: mix stocks with T-bills ----------
  const RF = 4, ER = 10, SD = 20, MONEY = 10000;
  const sEl = $("#rr-s");
  const X = (r) => 20 + ((r + 15) / 50) * 560;
  const drawRr = () => {
    const w = +sEl.value / 100, e = RF + w * (ER - RF), sd = w * SD, lo = e - sd, hi = e + sd;
    $("#rr-s-v").textContent = `${sEl.value}%`;
    let g = `<line x1="20" x2="580" y1="96" y2="96" class="rr-axis"/>`;
    [-10, 0, 10, 20, 30].forEach((t) => { g += `<line x1="${X(t)}" x2="${X(t)}" y1="90" y2="102" class="rr-axis"/><text x="${X(t)}" y="148" text-anchor="middle" class="rr-tick">${pct(t)}</text>`; });
    g += `<rect x="${X(lo)}" y="74" width="${Math.max(4, X(hi) - X(lo))}" height="44" rx="10" class="rr-band"/>`;
    g += `<circle cx="${X(e)}" cy="96" r="11" class="rr-dot"/>`;
    g += `<text x="${X(lo)}" y="58" text-anchor="${sd > 0 ? "end" : "middle"}" class="rr-end">${sd > 0 ? usd(MONEY * (1 + lo / 100)) : ""}</text>`;
    g += `<text x="${X(hi)}" y="58" text-anchor="${sd > 0 ? "start" : "middle"}" class="rr-end">${usd(MONEY * (1 + hi / 100))}</text>`;
    $("#rr-out").innerHTML = `<svg viewBox="0 0 600 156" class="rr-chart">${g}</svg>`;
    const m = $("#rr-msg");
    m.innerHTML = sd === 0
      ? T("All T-bills: 4% for sure, so $10,400 every time. No risk, and no risk premium.", "Todo en letras del Tesoro: 4% seguro, así que $10,400 siempre. Sin riesgo y sin prima de riesgo.")
      : T(`Expected <b>${pct(e)}</b>, standard deviation <b>${pct(sd)}</b>. About 2 years in 3 end between ${usd(MONEY * (1 + lo / 100))} and ${usd(MONEY * (1 + hi / 100))}.`, `Esperado <b>${pct(e)}</b>, desviación estándar <b>${pct(sd)}</b>. Cerca de 2 de cada 3 años terminan entre ${usd(MONEY * (1 + lo / 100))} y ${usd(MONEY * (1 + hi / 100))}.`);
    m.dataset.tone = lo < 0 ? "warn" : "good";
    fillRange(sEl);
  };
  sEl.addEventListener("input", drawRr);
  drawRr();

  // ---------- Play it: pick your risk ----------
  const ROUNDS = [
    { facts: [T("Half the time it earns 20%", "La mitad de las veces gana 20%"), T("Half the time it earns 0%", "La otra mitad gana 0%")], q: T("What's the expected return?", "¿Cuál es el rendimiento esperado?"),
      opts: ["10%", "20%", "0%", "5%"], a: 0,
      why: "0.5 × 20% + 0.5 × 0% = 10%." },
    { facts: [T("75% chance: earns 12%", "75% de probabilidad: gana 12%"), T("25% chance: loses 8%", "25% de probabilidad: pierde 8%")], q: T("What's the expected return?", "¿Cuál es el rendimiento esperado?"),
      opts: ["7%", "4%", "10%", "2%"], a: 0,
      why: "0.75 × 12% + 0.25 × (−8%) = 9% − 2% = 7%." },
    { facts: [T("Fund A always earns 5%", "El fondo A siempre gana 5%"), T("Fund B earns 15% or loses 5%, a coin flip", "El fondo B gana 15% o pierde 5%, a cara o cruz")], q: T("Which one is riskier?", "¿Cuál es más riesgoso?"),
      opts: [T("Fund B", "El fondo B"), T("Fund A", "El fondo A"), T("The same", "Igual")], a: 0,
      why: T("Both expect 5%, but B swings 10 points each way. A never moves. Risk is the swing, not the average.", "Los dos esperan 5%, pero B se mueve 10 puntos para cada lado. A nunca se mueve. El riesgo es el vaivén, no el promedio.") },
    { facts: [T("A fund earns 25% or loses 5%", "Un fondo gana 25% o pierde 5%"), T("Each is equally likely", "Las dos son igual de probables")], q: T("What's its standard deviation?", "¿Cuál es su desviación estándar?"),
      opts: ["15%", "30%", "10%", "20%"], a: 0,
      why: `${fr("25% − (−5%)", "2")} = ${fr("30%", "2")} = 15%.` },
    { facts: [T("A stock fund expects 9%", "Un fondo de acciones espera 9%"), T("T-bills pay 4%", "Las letras del Tesoro pagan 4%")], q: T("What's the risk premium?", "¿Cuál es la prima de riesgo?"),
      opts: ["5%", "9%", "13%", "4%"], a: 0,
      why: "9% − 4% = 5%." },
    { facts: [T("Risk-free rate: 4%", "Tasa libre de riesgo: 4%"), T("Fund A: expects 10%, standard deviation 20%", "Fondo A: espera 10%, desviación estándar 20%"), T("Fund B: expects 7%, standard deviation 6%", "Fondo B: espera 7%, desviación estándar 6%")], q: T("Which pays more per unit of risk?", "¿Cuál paga más por unidad de riesgo?"),
      opts: [T("Fund B", "El fondo B"), T("Fund A", "El fondo A"), T("The same", "Igual")], a: 0,
      why: `A: ${fr("10% − 4%", "20%")} = 0.30. B: ${fr("7% − 4%", "6%")} = 0.50. ${T("B has the higher Sharpe ratio.", "B tiene el índice de Sharpe más alto.")}` },
    { facts: [T("A fund expects 8% a year", "Un fondo espera 8% al año"), T("Its standard deviation is 15%", "Su desviación estándar es 15%")], q: T("Where do about 2 years in 3 land?", "¿Dónde caen cerca de 2 de cada 3 años?"),
      opts: [T("Between −7% and 23%", "Entre −7% y 23%"), T("Between 0% and 15%", "Entre 0% y 15%"), T("Between 8% and 23%", "Entre 8% y 23%"), T("Always at 8%", "Siempre en 8%")], a: 0,
      why: T("8% − 15% = −7%, up to 8% + 15% = 23%.", "8% − 15% = −7%, hasta 8% + 15% = 23%.") },
    { facts: [T("Fund C promises a higher expected return than Fund D", "El fondo C promete un rendimiento esperado más alto que el fondo D")], q: T("What should you expect from Fund C?", "¿Qué debes esperar del fondo C?"),
      opts: [T("More risk", "Más riesgo"), T("Less risk", "Menos riesgo"), T("No risk", "Nada de riesgo")], a: 0,
      why: T("The risk-return trade-off: higher expected return comes with bigger swings.", "El equilibrio entre riesgo y rendimiento: más rendimiento esperado viene con más vaivén.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#rk-why"), nextB = $("#rk-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#rk-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#rk-q").textContent = r.q;
    $("#rk-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#rk-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#rk-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#rk-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#rk-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#rk-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#rk-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Risk weigher", "Mides el riesgo") : G.score >= 6 ? T("Ready for the trading floor", "Listo para la mesa de inversiones") : T("Review expected return and risk", "Repasa rendimiento esperado y riesgo")}</b><p>${T("Average the outcomes, measure the swing, and ask what you're paid for the risk.", "Promedia los resultados, mide el vaivén y pregunta cuánto te pagan por el riesgo.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="rk-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#rk-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#rk-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#rk").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Sized up eight investments", "Evaluaste ocho inversiones"));
    if (G.score === N) FH.badge("risk-weigher");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "An investment has a 40% chance of returning 20% and a 60% chance of returning 5%. What is its expected return?", opts: ["11%", "12.5%", "25%", "8%"], a: 0, why: "0.40 × 20% + 0.60 × 5% = 8% + 3% = 11%." },
    { q: "What does standard deviation measure for an investment?", opts: ["How far its returns typically land from the expected return", "Its average return", "Its return after taxes", "How much it costs to buy"], a: 0, why: "Standard deviation measures the swing, or volatility, around the average." },
    { q: "A fund returns either 18% or −2%, each equally likely. What is its standard deviation?", opts: ["10%", "20%", "8%", "16%"], a: 0, why: `${fr("18% − (−2%)", "2")} = ${fr("20%", "2")} = 10%.` },
    { q: "A stock fund has an expected return of 11%. The risk-free rate is 3%. What is its risk premium?", opts: ["8%", "14%", "11%", "3%"], a: 0, why: "11% − 3% = 8%." },
    { q: "Fund X expects 12% with a 16% standard deviation. The risk-free rate is 4%. What is its Sharpe ratio?", opts: ["0.50", "0.75", "0.25", "1.33"], a: 0, why: `${fr("12% − 4%", "16%")} = ${fr("8%", "16%")} = 0.50.` },
    { q: "A portfolio expects 7% with a 12% standard deviation. In about 2 years out of 3, where should its return land?", opts: ["Between −5% and 19%", "Between 7% and 12%", "Between 0% and 12%", "Exactly 7%"], a: 0, why: "7% − 12% = −5%, up to 7% + 12% = 19%." },
    { q: "What does the risk-return trade-off say?", opts: ["Higher expected returns come with more risk", "Riskier investments always earn more every year", "Safe investments always lose money", "Risk and return are unrelated"], a: 0, why: "Investors demand more expected return to accept bigger swings, but a risky investment can still lose in any given year." },
    { q: "You put 40% of your money in a stock fund (expected 10%, standard deviation 20%) and 60% in T-bills at 4%. What are the portfolio's expected return and standard deviation?", opts: ["6.4% and 8%", "7% and 12%", "10% and 20%", "4% and 0%"], a: 0, why: "Expected: 0.4 × 10% + 0.6 × 4% = 4% + 2.4% = 6.4%. Swing: 0.4 × 20% = 8%, since T-bills add none." },
  ];
  const QUIZ_ES = [
    { q: "Una inversión tiene 40% de probabilidad de rendir 20% y 60% de probabilidad de rendir 5%. ¿Cuál es su rendimiento esperado?", opts: ["11%", "12.5%", "25%", "8%"], a: 0, why: "0.40 × 20% + 0.60 × 5% = 8% + 3% = 11%." },
    { q: "¿Qué mide la desviación estándar de una inversión?", opts: ["Qué tan lejos suelen caer sus rendimientos del rendimiento esperado", "Su rendimiento promedio", "Su rendimiento después de impuestos", "Cuánto cuesta comprarla"], a: 0, why: "La desviación estándar mide el vaivén, o volatilidad, alrededor del promedio." },
    { q: "Un fondo rinde 18% o −2%, con la misma probabilidad. ¿Cuál es su desviación estándar?", opts: ["10%", "20%", "8%", "16%"], a: 0, why: `${fr("18% − (−2%)", "2")} = ${fr("20%", "2")} = 10%.` },
    { q: "Un fondo de acciones tiene un rendimiento esperado de 11%. La tasa libre de riesgo es 3%. ¿Cuál es su prima de riesgo?", opts: ["8%", "14%", "11%", "3%"], a: 0, why: "11% − 3% = 8%." },
    { q: "El fondo X espera 12% con una desviación estándar de 16%. La tasa libre de riesgo es 4%. ¿Cuál es su índice de Sharpe?", opts: ["0.50", "0.75", "0.25", "1.33"], a: 0, why: `${fr("12% − 4%", "16%")} = ${fr("8%", "16%")} = 0.50.` },
    { q: "Un portafolio espera 7% con una desviación estándar de 12%. ¿Dónde debería caer su rendimiento en cerca de 2 de cada 3 años?", opts: ["Entre −5% y 19%", "Entre 7% y 12%", "Entre 0% y 12%", "Exactamente en 7%"], a: 0, why: "7% − 12% = −5%, hasta 7% + 12% = 19%." },
    { q: "¿Qué dice el equilibrio entre riesgo y rendimiento?", opts: ["Más rendimiento esperado viene con más riesgo", "Las inversiones riesgosas siempre ganan más cada año", "Las inversiones seguras siempre pierden dinero", "El riesgo y el rendimiento no tienen relación"], a: 0, why: "Los inversionistas piden más rendimiento esperado para aceptar más vaivén, pero una inversión riesgosa igual puede perder en cualquier año." },
    { q: "Pones 40% de tu dinero en un fondo de acciones (espera 10%, desviación estándar 20%) y 60% en letras del Tesoro al 4%. ¿Cuál es el rendimiento esperado y la desviación estándar del portafolio?", opts: ["6.4% y 8%", "7% y 12%", "10% y 20%", "4% y 0%"], a: 0, why: "Esperado: 0.4 × 10% + 0.6 × 4% = 4% + 2.4% = 6.4%. Vaivén: 0.4 × 20% = 8%, porque las letras del Tesoro no suman nada." },
  ];

  FHLesson.init({ id: LESSON, short: "risk-return", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
