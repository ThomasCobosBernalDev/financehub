// Unit 10, Lesson 2: The time value of money
(function () {
  const LESSON = "u10-time-value";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const usd0 = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // ---------- See it: now or later ----------
  const aEl = $("#tv-a"), yEl = $("#tv-y"), rEl = $("#tv-r");
  const drawTv = () => {
    const A = +aEl.value, y = +yEl.value, r = +rEl.value, g = Math.pow(1 + r / 100, y);
    const pv = A / g, fv = 1000 * g;
    $("#tv-a-v").textContent = usd0(A);
    $("#tv-y-v").textContent = y;
    $("#tv-r-v").textContent = r + "%";
    const max = Math.max(1000, pv);
    $("#tv-now").style.width = ((1000 / max) * 100).toFixed(1) + "%";
    $("#tv-pv").style.width = ((pv / max) * 100).toFixed(1) + "%";
    $("#tv-now").textContent = "$1,000";
    $("#tv-pv").textContent = usd(pv);
    const yrs = y === 1 ? T("1 year", "1 año") : T(`${y} years`, `${y} años`);
    $("#tv-out").innerHTML = [
      [T("Later offer in today's dollars", "La oferta futura en dólares de hoy"), `${fr(usd0(A), `${(1 + r / 100).toFixed(2)}<sup>${y}</sup>`)} = <b>${usd(pv)}</b>`],
      [T(`$1,000 now, grown for ${yrs}`, `$1,000 hoy, después de ${yrs}`), `$1,000 × ${(1 + r / 100).toFixed(2)}<sup>${y}</sup> = <b>${usd(fv)}</b>`],
    ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    const gap = pv - 1000, msg = $("#tv-msg");
    if (Math.abs(gap) < 0.5) { msg.textContent = T("A tie: the two choices are worth the same.", "Empate: las dos opciones valen lo mismo."); msg.dataset.tone = ""; }
    else if (gap > 0) { msg.textContent = T(`Waiting wins, by ${usd(gap)} in today's dollars.`, `Esperar gana, por ${usd(gap)} en dólares de hoy.`); msg.dataset.tone = "good"; }
    else { msg.textContent = T(`Taking the money now wins, by ${usd(-gap)} in today's dollars.`, `Tomar el dinero hoy gana, por ${usd(-gap)} en dólares de hoy.`); msg.dataset.tone = "warn"; }
    [aEl, yEl, rEl].forEach(fillRange);
  };
  [aEl, yEl, rEl].forEach((e) => e.addEventListener("input", drawTv));
  drawTv();

  // ---------- Play it: now or later ----------
  const NOW = T("Take it now", "Tomarlo hoy"), LATER = T("Wait for later", "Esperar"), SAME = T("They're worth the same", "Valen lo mismo");
  const ROUNDS = [
    { facts: [T("Offer A: $1,000 now", "Opción A: $1,000 hoy"), T("Offer B: $1,050 in 1 year", "Opción B: $1,050 en 1 año"), T("You could earn: 5% a year", "Podrías ganar: 5% al año")], q: T("Which is worth more?", "¿Cuál vale más?"),
      opts: [SAME, NOW, LATER], a: 0,
      why: T("$1,000 × 1.05 = $1,050 in a year. Both offers land on exactly $1,050.", "$1,000 × 1.05 = $1,050 en un año. Las dos opciones llegan exactamente a $1,050.") },
    { facts: [T("Savings: $2,000", "Ahorros: $2,000"), T("Rate: 6% a year", "Tasa: 6% al año"), T("Time: 2 years", "Tiempo: 2 años")], q: T("What's the future value?", "¿Cuál es el valor futuro?"),
      opts: ["$2,247.20", "$2,240.00", "$2,120.00", "$2,360.00"], a: 0,
      why: T("$2,000 × 1.06 = $2,120, then $2,120 × 1.06 = $2,247.20.", "$2,000 × 1.06 = $2,120, luego $2,120 × 1.06 = $2,247.20.") },
    { facts: [T("Promised: $1,210 in 2 years", "Prometido: $1,210 en 2 años"), T("Rate: 10% a year", "Tasa: 10% al año")], q: T("What's it worth today?", "¿Cuánto vale hoy?"),
      opts: ["$1,000", "$1,089", "$1,100", "$990"], a: 0,
      why: `${fr("$1,210", "1.10 × 1.10")} = ${fr("$1,210", "1.21")} = $1,000.` },
    { facts: [T("Offer A: $500 now", "Opción A: $500 hoy"), T("Offer B: $550 in 2 years", "Opción B: $550 en 2 años"), T("You could earn: 6% a year", "Podrías ganar: 6% al año")], q: T("Which should you take?", "¿Cuál deberías tomar?"),
      opts: [NOW, LATER, SAME], a: 0,
      why: T("$500 × 1.06 × 1.06 = $561.80 in 2 years. That beats $550, so take it now.", "$500 × 1.06 × 1.06 = $561.80 en 2 años. Supera los $550, así que tómalo hoy.") },
    { facts: [T("Offer A: $800 now", "Opción A: $800 hoy"), T("Offer B: $900 in 2 years", "Opción B: $900 en 2 años"), T("You could earn: 4% a year", "Podrías ganar: 4% al año")], q: T("Which should you take?", "¿Cuál deberías tomar?"),
      opts: [LATER, NOW, SAME], a: 0,
      why: T("$800 × 1.04 × 1.04 = $865.28 in 2 years. $900 is more, so waiting wins.", "$800 × 1.04 × 1.04 = $865.28 en 2 años. $900 es más, así que esperar gana.") },
    { facts: [T("Promised: $5,000 in 3 years", "Prometido: $5,000 en 3 años"), T("Your rate goes up from 4% to 8%", "Tu tasa sube de 4% a 8%")], q: T("What happens to its value today?", "¿Qué pasa con su valor de hoy?"),
      opts: [T("It gets smaller", "Se hace más chico"), T("It gets bigger", "Se hace más grande"), T("It stays the same", "Se queda igual")], a: 0,
      why: T("You divide by a bigger number, (1.08)³ instead of (1.04)³, so the present value shrinks.", "Divides entre un número más grande, (1.08)³ en vez de (1.04)³, así que el valor presente baja.") },
    { facts: [T("Offer A: $1,000 now", "Opción A: $1,000 hoy"), T("Offer B: $2,000 in 10 years", "Opción B: $2,000 en 10 años"), T("You could earn: 6% a year", "Podrías ganar: 6% al año")], q: T("Which should you take?", "¿Cuál deberías tomar?"),
      opts: [LATER, NOW, SAME], a: 0,
      why: `${T("Rule of 72:", "Regla del 72:")} ${fr("72", "6")} = ${T("12 years to double. In 10 years, $1,000 only reaches $1,790.85, less than $2,000.", "12 años para duplicarse. En 10 años, $1,000 solo llegan a $1,790.85, menos de $2,000.")}` },
    { facts: [T("$100 a year for 3 years", "$100 al año durante 3 años"), T("Rate: 10% a year", "Tasa: 10% al año"), T("Each payment's value today: $90.91, $82.64, $75.13", "Valor de hoy de cada pago: $90.91, $82.64, $75.13")], q: T("What are the payments worth today?", "¿Cuánto valen hoy los pagos?"),
      opts: ["$248.69", "$300.00", "$270.00", "$331.00"], a: 0,
      why: T("Add each payment's present value: $90.91 + $82.64 + $75.13 = $248.69.", "Suma el valor presente de cada pago: $90.91 + $82.64 + $75.13 = $248.69.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#nl-why"), nextB = $("#nl-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#nl-round").textContent = T(`Offer ${G.i + 1} of ${N}`, `Oferta ${G.i + 1} de ${N}`);
    $("#nl-q").textContent = r.q;
    $("#nl-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#nl-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#nl-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next offer", "Siguiente oferta")} <span class="arrow">→</span>`;
  };
  $("#nl-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#nl-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#nl-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#nl-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Time traveler", "Viajero del tiempo") : G.score >= 6 ? T("Good sense of time", "Buen sentido del tiempo") : T("Review the three steps", "Repasa los tres pasos")}</b><p>${T("Pick the rate, move both amounts to the same moment, then compare.", "Elige la tasa, lleva las dos cantidades al mismo momento y luego compara.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="nl-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#nl-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#nl-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#nl").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Compared eight offers", "Comparaste ocho ofertas"));
    if (G.score === N) FH.badge("time-traveler");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Which is the main reason a dollar today is worth more than a dollar a year from now?", opts: ["Today's dollar can be invested and earn interest", "Dollars printed earlier are rarer", "Banks charge fees on future dollars", "Future dollars can't be spent"], a: 0, why: "Money you have now can earn interest right away. Inflation and the risk of not getting paid add to it." },
    { q: "You save $3,000 at 4% a year, compounded. What is it worth in 2 years?", opts: ["$3,244.80", "$3,240.00", "$3,120.00", "$3,060.00"], a: 0, why: "$3,000 × 1.04 = $3,120, then $3,120 × 1.04 = $3,244.80." },
    { q: "What is $5,000 received 1 year from now worth today, at a 5% discount rate?", opts: ["$4,761.90", "$4,750.00", "$5,250.00", "$4,950.00"], a: 0, why: `${fr("$5,000", "1.05")} = $4,761.90. (Not $4,750: you divide by 1.05, you don't subtract 5%.)` },
    { q: "If the discount rate goes up, what happens to the present value of a future payment?", opts: ["It falls", "It rises", "It stays the same", "It doubles"], a: 0, why: "You divide by a bigger number, so today's value gets smaller." },
    { q: "Offer A is $2,000 now. Offer B is $2,200 in 2 years. You can earn 7% a year. Which is better?", opts: ["Offer A, because $2,000 grows to $2,289.80", "Offer B, because $2,200 is more than $2,000", "They are worth the same", "Offer B, because waiting is always safer"], a: 0, why: "$2,000 × 1.07 × 1.07 = $2,289.80 in 2 years, which beats $2,200." },
    { q: "What does \"discounting\" mean in finance?", opts: ["Turning a future amount into its value today", "Lowering a price during a sale", "Paying a loan off early", "Growing money forward with interest"], a: 0, why: "Discounting shrinks future money back to today by dividing by (1 + rate) for each year." },
    { q: "You'll get $100 at the end of each of the next 2 years. At 10%, what are the payments worth today?", opts: ["$173.55", "$200.00", "$180.00", "$165.29"], a: 0, why: `${fr("$100", "1.10")} + ${fr("$100", "1.21")} = $90.91 + $82.64 = $173.55.` },
    { q: "At a 5% rate, which of these is worth the most today?", opts: ["$1,000 now", "$1,040 in 1 year", "$1,100 in 2 years", "$1,150 in 3 years"], a: 0, why: `${fr("$1,040", "1.05")} = $990.48, ${fr("$1,100", "1.1025")} = $997.73 and ${fr("$1,150", "1.157625")} = $993.41. All are below $1,000.` },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál es la razón principal por la que un dólar hoy vale más que un dólar dentro de un año?", opts: ["El dólar de hoy se puede invertir y ganar intereses", "Los dólares impresos antes son más escasos", "Los bancos cobran comisiones sobre los dólares futuros", "Los dólares futuros no se pueden gastar"], a: 0, why: "El dinero que tienes hoy puede ganar intereses de inmediato. La inflación y el riesgo de no recibir el pago también cuentan." },
    { q: "Ahorras $3,000 al 4% anual, con interés compuesto. ¿Cuánto valen en 2 años?", opts: ["$3,244.80", "$3,240.00", "$3,120.00", "$3,060.00"], a: 0, why: "$3,000 × 1.04 = $3,120, luego $3,120 × 1.04 = $3,244.80." },
    { q: "¿Cuánto valen hoy $5,000 que recibirás en 1 año, con una tasa de descuento de 5%?", opts: ["$4,761.90", "$4,750.00", "$5,250.00", "$4,950.00"], a: 0, why: `${fr("$5,000", "1.05")} = $4,761.90. (No $4,750: se divide entre 1.05, no se resta 5%.)` },
    { q: "Si sube la tasa de descuento, ¿qué pasa con el valor presente de un pago futuro?", opts: ["Baja", "Sube", "Se queda igual", "Se duplica"], a: 0, why: "Divides entre un número más grande, así que el valor de hoy se hace más chico." },
    { q: "La opción A es $2,000 hoy. La opción B es $2,200 en 2 años. Puedes ganar 7% al año. ¿Cuál es mejor?", opts: ["La A, porque $2,000 crecen a $2,289.80", "La B, porque $2,200 es más que $2,000", "Valen lo mismo", "La B, porque esperar siempre es más seguro"], a: 0, why: "$2,000 × 1.07 × 1.07 = $2,289.80 en 2 años, que supera los $2,200." },
    { q: "¿Qué significa \"descontar\" en finanzas?", opts: ["Convertir una cantidad futura en su valor de hoy", "Bajar un precio durante una oferta", "Pagar un préstamo antes de tiempo", "Hacer crecer el dinero hacia adelante con intereses"], a: 0, why: "Descontar regresa el dinero futuro a hoy dividiendo entre (1 + tasa) por cada año." },
    { q: "Recibirás $100 al final de cada uno de los próximos 2 años. Al 10%, ¿cuánto valen hoy los pagos?", opts: ["$173.55", "$200.00", "$180.00", "$165.29"], a: 0, why: `${fr("$100", "1.10")} + ${fr("$100", "1.21")} = $90.91 + $82.64 = $173.55.` },
    { q: "Con una tasa de 5%, ¿cuál de estas vale más hoy?", opts: ["$1,000 hoy", "$1,040 en 1 año", "$1,100 en 2 años", "$1,150 en 3 años"], a: 0, why: `${fr("$1,040", "1.05")} = $990.48, ${fr("$1,100", "1.1025")} = $997.73 y ${fr("$1,150", "1.157625")} = $993.41. Todas quedan debajo de $1,000.` },
  ];

  FHLesson.init({ id: LESSON, short: "time-value", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
