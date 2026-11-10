// Unit 14, Lesson 3: How bonds work
(function () {
  const LESSON = "u14-bonds";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---------- See it: price vs. market rate ----------
  const price = (n, r) => { let p = 0; for (let t = 1; t <= n; t++) p += 50 / Math.pow(1 + r, t); return p + 1000 / Math.pow(1 + r, n); };
  const rEl = $("#bp-r");
  const X = (r) => 70 + ((r - 1) / 8) * 500, Y = (p) => 210 - ((p - 700) / 700) * 190;
  const curve = (n) => { const pts = []; for (let r = 1; r <= 9.001; r += 0.25) pts.push(`${X(r).toFixed(1)},${Y(price(n, r / 100)).toFixed(1)}`); return pts.join(" "); };
  const drawBp = () => {
    const r = +rEl.value, p3 = price(3, r / 100), p10 = price(10, r / 100);
    $("#bp-r-v").textContent = `${r}%`;
    let g = `<line x1="70" x2="570" y1="${Y(1000)}" y2="${Y(1000)}" class="bp-par"/>`;
    [700, 1000, 1400].forEach((p) => { g += `<text x="58" y="${Y(p) + 5}" text-anchor="end" class="bp-tick">$${p.toLocaleString("en-US")}</text>`; });
    [1, 5, 9].forEach((x) => { g += `<text x="${X(x)}" y="236" text-anchor="middle" class="bp-tick">${x}%</text>`; });
    g += `<polyline points="${curve(3)}" class="bp-c3"/><polyline points="${curve(10)}" class="bp-c10"/>`;
    g += `<line x1="${X(r)}" x2="${X(r)}" y1="14" y2="214" class="bp-now"/>`;
    g += `<circle cx="${X(r)}" cy="${Y(p3)}" r="9" class="bp-d3"/><circle cx="${X(r)}" cy="${Y(p10)}" r="9" class="bp-d10"/>`;
    $("#bp-out").innerHTML = `<svg viewBox="0 0 600 246" class="bp-chart">${g}</svg>`;
    const ch = (p) => { const c = (p / 1000 - 1) * 100; return `${c < 0 ? "−" : "+"}${Math.abs(c).toFixed(1)}%`; };
    const m = $("#bp-msg");
    m.innerHTML = r === 5
      ? T("At 5%, both bonds pay exactly the market rate, so both are worth <b>$1,000.00</b>.", "Al 5%, los dos bonos pagan justo la tasa del mercado, así que los dos valen <b>$1,000.00</b>.")
      : T(`At ${r}%: 3-year bond <b>${usd(p3)}</b> (${ch(p3)}), 10-year bond <b>${usd(p10)}</b> (${ch(p10)}). ${r > 5 ? "Both trade at a discount." : "Both trade at a premium."}`, `Al ${r}%: bono a 3 años <b>${usd(p3)}</b> (${ch(p3)}), bono a 10 años <b>${usd(p10)}</b> (${ch(p10)}). ${r > 5 ? "Los dos se venden con descuento." : "Los dos se venden con prima."}`);
    m.dataset.tone = r > 5 ? "warn" : "good";
    fillRange(rEl);
  };
  rEl.addEventListener("input", drawBp);
  drawBp();

  // ---------- Play it: bond desk ----------
  const ROUNDS = [
    { facts: [T("Face value: $1,000", "Valor nominal: $1,000"), T("Coupon: 6%", "Cupón: 6%")], q: T("How much interest does it pay each year?", "¿Cuánto interés paga cada año?"),
      opts: ["$60", "$6", "$600", "$106"], a: 0,
      why: T("6% of $1,000 = $60 a year.", "6% de $1,000 = $60 al año.") },
    { facts: [T("You own a bond paying a fixed 4%", "Tienes un bono que paga 4% fijo"), T("Market rates jump to 6%", "Las tasas del mercado suben a 6%")], q: T("What happens to your bond's price?", "¿Qué pasa con el precio de tu bono?"),
      opts: [T("It falls", "Baja"), T("It rises", "Sube"), T("It stays at $1,000", "Se queda en $1,000")], a: 0,
      why: T("New bonds pay more, so yours must go on sale. Rates up, prices down.", "Los bonos nuevos pagan más, así que el tuyo tiene que bajar de precio. Tasas arriba, precios abajo.") },
    { facts: [T("A bond's coupon: 5%", "Cupón de un bono: 5%"), T("Market rate for similar bonds: 3%", "Tasa del mercado para bonos parecidos: 3%")], q: T("Where does it trade?", "¿A qué precio se vende?"),
      opts: [T("Above $1,000 (premium)", "Arriba de $1,000 (con prima)"), T("Below $1,000 (discount)", "Abajo de $1,000 (con descuento)"), T("Exactly $1,000", "Justo en $1,000")], a: 0,
      why: T("It pays more than new bonds, so buyers pay extra for it.", "Paga más que los bonos nuevos, así que los compradores pagan de más por él.") },
    { facts: [T("A bond pays one payment: $1,210 in 2 years", "Un bono hace un solo pago: $1,210 en 2 años"), T("Market rate: 10%", "Tasa del mercado: 10%")], q: T("What's its price today?", "¿Cuál es su precio hoy?"),
      opts: ["$1,000", "$1,100", "$1,210", "$990"], a: 0,
      why: `${fr("$1,210", "1.10<sup>2</sup>")} = ${fr("$1,210", "1.21")} = $1,000.` },
    { facts: [T("Rates rise by 2 points", "Las tasas suben 2 puntos"), T("Bond A matures in 2 years; Bond B in 20 years", "El bono A vence en 2 años; el bono B en 20 años")], q: T("Whose price falls more?", "¿Cuál baja más de precio?"),
      opts: [T("Bond B, the 20-year", "El bono B, a 20 años"), T("Bond A, the 2-year", "El bono A, a 2 años"), T("The same", "Lo mismo")], a: 0,
      why: T("Longer bonds have more payments far in the future, so they have more interest rate risk.", "Los bonos más largos tienen más pagos lejos en el futuro, así que tienen más riesgo de tasa de interés.") },
    { facts: [T("Bond C is rated AAA", "El bono C tiene calificación AAA"), T("Bond D is rated B", "El bono D tiene calificación B"), T("Same maturity", "Mismo plazo")], q: T("Which must pay the higher yield?", "¿Cuál tiene que pagar más rendimiento?"),
      opts: [T("Bond D", "El bono D"), T("Bond C", "El bono C"), T("The same", "Lo mismo")], a: 0,
      why: T("B is below investment grade. More credit risk means a bigger credit spread.", "B está abajo del grado de inversión. Más riesgo de crédito significa un diferencial de crédito más grande.") },
    { facts: [T("A bond pays $50 a year", "Un bono paga $50 al año"), T("Its price today: $1,250", "Su precio hoy: $1,250")], q: T("What's its current yield?", "¿Cuál es su rendimiento actual?"),
      opts: ["4%", "5%", "6.25%", "2.5%"], a: 0,
      why: `${fr("$50", "$1,250")} = 0.04, ${T("so 4%.", "o sea 4%.")}` },
    { facts: [T("You hold a $1,000 bond until it matures", "Tienes un bono de $1,000 hasta que vence"), T("Its price dipped to $900 along the way", "En el camino su precio bajó a $900"), T("The issuer never misses a payment", "El emisor nunca falla un pago")], q: T("What do you get at maturity?", "¿Qué recibes al vencimiento?"),
      opts: ["$1,000", "$900", "$950", "$0"], a: 0,
      why: T("At maturity you get the face value, whatever the price did before.", "Al vencimiento recibes el valor nominal, haya hecho lo que haya hecho el precio antes.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#bd-why"), nextB = $("#bd-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#bd-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#bd-q").textContent = r.q;
    $("#bd-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#bd-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#bd-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#bd-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#bd-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#bd-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#bd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Bond reader", "Lees bonos") : G.score >= 6 ? T("Ready for the bond desk", "Listo para la mesa de bonos") : T("Review the bond seesaw", "Repasa el subibaja de los bonos")}</b><p>${T("A bond is a stream of payments. Price it at today's rate: rates up, prices down.", "Un bono es una serie de pagos. Ponle precio con la tasa de hoy: tasas arriba, precios abajo.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="bd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#bd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#bd-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#bd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Priced eight bonds", "Le pusiste precio a ocho bonos"));
    if (G.score === N) FH.badge("bond-reader");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "A $1,000 bond has a 4% coupon. How much interest does it pay each year?", opts: ["$40", "$4", "$400", "$104"], a: 0, why: "4% of $1,000 = $40." },
    { q: "What is the price of a bond?", opts: ["The present value of all its future payments", "Always its face value", "Its coupon times its maturity", "Whatever the issuer decides"], a: 0, why: "Each coupon and the face value are brought back to today at the market rate and added up." },
    { q: "Market interest rates fall. What happens to the prices of existing bonds?", opts: ["They rise", "They fall", "They don't change", "They drop to zero"], a: 0, why: "Existing bonds now pay more than new ones, so buyers pay more for them." },
    { q: "A bond's coupon rate is lower than the current market rate. How does it trade?", opts: ["At a discount, below face value", "At a premium, above face value", "Exactly at face value", "It can't be sold"], a: 0, why: "It pays less than new bonds, so its price must fall until its yield matches the market." },
    { q: "A bond pays a single $1,100 in one year. The market rate is 10%. What is its price?", opts: ["$1,000", "$1,100", "$990", "$1,210"], a: 0, why: `${fr("$1,100", "1.10")} = $1,000.` },
    { q: "Which bond has the most interest rate risk?", opts: ["A 30-year bond", "A 1-year bond", "A 5-year bond", "A 3-month Treasury bill"], a: 0, why: "Longer maturities have higher duration: more payments far in the future, where rate changes hit hardest." },
    { q: "A bond pays $60 a year and sells for $1,200. What is its current yield?", opts: ["5%", "6%", "4%", "20%"], a: 0, why: `${fr("$60", "$1,200")} = 0.05, so 5%.` },
    { q: "A corporate bond yields 6.5% and a Treasury with the same maturity yields 4%. What is the credit spread?", opts: ["2.5%", "10.5%", "6.5%", "1.6%"], a: 0, why: "6.5% − 4% = 2.5%, the extra pay for the chance the company can't pay." },
  ];
  const QUIZ_ES = [
    { q: "Un bono de $1,000 tiene un cupón de 4%. ¿Cuánto interés paga cada año?", opts: ["$40", "$4", "$400", "$104"], a: 0, why: "4% de $1,000 = $40." },
    { q: "¿Qué es el precio de un bono?", opts: ["El valor presente de todos sus pagos futuros", "Siempre su valor nominal", "Su cupón por su plazo", "Lo que decida el emisor"], a: 0, why: "Cada cupón y el valor nominal se traen a hoy con la tasa del mercado y se suman." },
    { q: "Bajan las tasas de interés del mercado. ¿Qué pasa con el precio de los bonos que ya existen?", opts: ["Sube", "Baja", "No cambia", "Cae a cero"], a: 0, why: "Los bonos que ya existen ahora pagan más que los nuevos, así que los compradores pagan más por ellos." },
    { q: "La tasa del cupón de un bono es menor que la tasa actual del mercado. ¿Cómo se vende?", opts: ["Con descuento, abajo del valor nominal", "Con prima, arriba del valor nominal", "Justo en su valor nominal", "No se puede vender"], a: 0, why: "Paga menos que los bonos nuevos, así que su precio tiene que bajar hasta que su rendimiento iguale al del mercado." },
    { q: "Un bono hace un solo pago de $1,100 en un año. La tasa del mercado es 10%. ¿Cuál es su precio?", opts: ["$1,000", "$1,100", "$990", "$1,210"], a: 0, why: `${fr("$1,100", "1.10")} = $1,000.` },
    { q: "¿Qué bono tiene más riesgo de tasa de interés?", opts: ["Un bono a 30 años", "Un bono a 1 año", "Un bono a 5 años", "Una letra del Tesoro a 3 meses"], a: 0, why: "Los plazos más largos tienen más duración: más pagos lejos en el futuro, donde los cambios de tasa pegan más fuerte." },
    { q: "Un bono paga $60 al año y se vende en $1,200. ¿Cuál es su rendimiento actual?", opts: ["5%", "6%", "4%", "20%"], a: 0, why: `${fr("$60", "$1,200")} = 0.05, o sea 5%.` },
    { q: "Un bono corporativo rinde 6.5% y un bono del Tesoro con el mismo plazo rinde 4%. ¿Cuál es el diferencial de crédito?", opts: ["2.5%", "10.5%", "6.5%", "1.6%"], a: 0, why: "6.5% − 4% = 2.5%, el pago extra por la posibilidad de que la empresa no pague." },
  ];

  FHLesson.init({ id: LESSON, short: "bonds", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
