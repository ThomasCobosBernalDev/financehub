// Unit 14, Lesson 2: Diversification
(function () {
  const LESSON = "u14-diversification";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: add stocks ----------
  const sdOf = (n) => Math.sqrt(400 + 1200 / n); // one stock 40%, market floor 20%
  const nEl = $("#ds-n");
  const X = (n) => 70 + ((n - 1) / 29) * 500, Y = (s) => 200 - s * 4;
  const drawDs = () => {
    const n = +nEl.value, sd = sdOf(n);
    $("#ds-n-v").textContent = n;
    let pts = [];
    for (let k = 1; k <= 30; k++) pts.push(`${X(k).toFixed(1)},${Y(sdOf(k)).toFixed(1)}`);
    let g = `<line x1="70" x2="570" y1="200" y2="200" class="ds-axis"/>`;
    [0, 20, 40].forEach((s) => { g += `<text x="58" y="${Y(s) + 5}" text-anchor="end" class="ds-tick">${s}%</text>`; });
    g += `<polygon points="${pts.join(" ")} ${X(30)},${Y(20)} ${X(1)},${Y(20)}" class="ds-unique"/>`;
    g += `<line x1="70" x2="570" y1="${Y(20)}" y2="${Y(20)}" class="ds-floor"/>`;
    g += `<polyline points="${pts.join(" ")}" class="ds-line"/>`;
    g += `<text x="570" y="${Y(20) + 26}" text-anchor="end" class="ds-lab">${T("market risk 20%", "riesgo de mercado 20%")}</text>`;
    g += `<text x="${X(1)}" y="226" text-anchor="middle" class="ds-tick">1</text><text x="${X(10)}" y="226" text-anchor="middle" class="ds-tick">10</text><text x="${X(20)}" y="226" text-anchor="middle" class="ds-tick">20</text><text x="${X(30)}" y="226" text-anchor="middle" class="ds-tick">30</text>`;
    g += `<circle cx="${X(n)}" cy="${Y(sd)}" r="10" class="ds-dot"/>`;
    g += `<text x="${Math.min(X(n) + 16, 470)}" y="${Y(sd) - 14}" class="ds-val">${sd.toFixed(1)}%</text>`;
    $("#ds-out").innerHTML = `<svg viewBox="0 0 600 236" class="ds-chart">${g}</svg>`;
    const u = sd - 20, m = $("#ds-msg");
    m.innerHTML = n === 1
      ? T("One stock: <b>40%</b> standard deviation. Half of that swing is unique risk you aren't paid for.", "Una acción: <b>40%</b> de desviación estándar. La mitad de ese vaivén es riesgo único por el que no te pagan.")
      : T(`${n} stocks: about <b>${sd.toFixed(1)}%</b>. Unique risk left: about ${u.toFixed(1)} points above the 20% market floor. Expected return: still 10%.`, `${n} acciones: cerca de <b>${sd.toFixed(1)}%</b>. Riesgo único que queda: cerca de ${u.toFixed(1)} puntos arriba del piso de mercado de 20%. Rendimiento esperado: sigue en 10%.`);
    m.dataset.tone = n >= 10 ? "good" : "warn";
    fillRange(nEl);
  };
  nEl.addEventListener("input", drawDs);
  drawDs();

  // ---------- Play it: spread it out ----------
  const ROUNDS = [
    { facts: [T("Two stocks always rise and fall together, by the same amount", "Dos acciones siempre suben y bajan juntas, en la misma cantidad")], q: T("What's their correlation?", "¿Cuál es su correlación?"),
      opts: ["+1", "0", "−1"], a: 0,
      why: T("Moving in lockstep is a correlation of +1. Mixing them removes no risk.", "Moverse igual es una correlación de +1. Mezclarlas no quita nada de riesgo.") },
    { facts: [T("A rain gear maker and a sunscreen maker", "Un fabricante de ropa para lluvia y uno de protector solar"), T("When one gains, the other loses the same amount", "Cuando uno gana, el otro pierde lo mismo")], q: T("What's their correlation?", "¿Cuál es su correlación?"),
      opts: ["−1", "+1", "0"], a: 0,
      why: T("Exactly opposite moves are a correlation of −1. A 50/50 mix can remove all the risk.", "Movimientos exactamente opuestos son una correlación de −1. Una mezcla 50/50 puede quitar todo el riesgo.") },
    { facts: [T("When oil prices jump, airlines lose and oil companies gain", "Cuando sube el petróleo, las aerolíneas pierden y las petroleras ganan")], q: T("Which pair diversifies best?", "¿Qué par diversifica mejor?"),
      opts: [T("An airline and an oil company", "Una aerolínea y una petrolera"), T("Two airlines", "Dos aerolíneas"), T("Two oil companies", "Dos petroleras")], a: 0,
      why: T("They react in opposite ways to the same news, so their bumps partly cancel.", "Reaccionan al revés ante la misma noticia, así que sus golpes se cancelan en parte.") },
    { facts: [T("A toy company recalls its best-selling toy", "Una empresa de juguetes retira su juguete más vendido"), T("Its stock falls 25%; the market barely moves", "Su acción baja 25%; el mercado casi no se mueve")], q: T("What kind of risk is this?", "¿Qué tipo de riesgo es este?"),
      opts: [T("Unique risk", "Riesgo único"), T("Market risk", "Riesgo de mercado")], a: 0,
      why: T("It hit one company, not everyone. Diversification removes this kind of risk.", "Le pegó a una empresa, no a todas. Diversificar quita este tipo de riesgo.") },
    { facts: [T("A recession starts", "Empieza una recesión"), T("Almost every stock falls", "Casi todas las acciones bajan")], q: T("What kind of risk is this?", "¿Qué tipo de riesgo es este?"),
      opts: [T("Market risk", "Riesgo de mercado"), T("Unique risk", "Riesgo único")], a: 0,
      why: T("It hits nearly everything at once, so owning more stocks can't remove it.", "Le pega a casi todo al mismo tiempo, así que tener más acciones no lo quita.") },
    { facts: [T("You own 1 stock and want less risk", "Tienes 1 acción y quieres menos riesgo"), T("You add 29 more, from different industries", "Agregas 29 más, de distintas industrias")], q: T("Which risk did you mostly remove?", "¿Qué riesgo quitaste casi por completo?"),
      opts: [T("Unique risk", "Riesgo único"), T("Market risk", "Riesgo de mercado"), T("Both, completely", "Los dos, por completo")], a: 0,
      why: T("Thirty stocks cut risk from 40% to about 21%, but the 20% market floor stays.", "Treinta acciones bajan el riesgo de 40% a cerca de 21%, pero el piso de mercado de 20% se queda.") },
    { facts: [T("Stock A: one company, expects 10%, swings 40%", "Acción A: una empresa, espera 10%, se mueve 40%"), T("Fund B: 500 companies, expects 10%, swings 20%", "Fondo B: 500 empresas, espera 10%, se mueve 20%")], q: T("Why doesn't A expect more for its extra risk?", "¿Por qué A no espera más por su riesgo extra?"),
      opts: [T("Its extra risk is unique risk, which isn't paid", "Su riesgo extra es riesgo único, y ese no se paga"), T("Riskier stocks always expect less", "Las acciones más riesgosas siempre esperan menos"), T("Single stocks have no market risk", "Las acciones solas no tienen riesgo de mercado")], a: 0,
      why: T("Anyone can delete unique risk by diversifying, so nobody pays a premium for carrying it.", "Cualquiera puede quitar el riesgo único diversificando, así que nadie paga una prima por cargarlo.") },
    { facts: [T("$5,000 in Raincoat Co.: +30% this summer", "$5,000 en Raincoat Co.: +30% este verano"), T("$5,000 in Sunny Co.: −10% this summer", "$5,000 en Sunny Co.: −10% este verano")], q: T("What's the total now?", "¿Cuánto hay en total ahora?"),
      opts: ["$11,000", "$13,000", "$10,000", "$12,000"], a: 0,
      why: "$5,000 × 1.30 = $6,500; $5,000 × 0.90 = $4,500; $6,500 + $4,500 = $11,000." },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sp-why"), nextB = $("#sp-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#sp-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#sp-q").textContent = r.q;
    $("#sp-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#sp-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#sp-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#sp-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#sp-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sp-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#sp-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Well diversified", "Bien diversificado") : G.score >= 6 ? T("Nearly spread out", "Casi bien repartido") : T("Review unique vs. market risk", "Repasa riesgo único vs. riesgo de mercado")}</b><p>${T("Own many things that don't move together. Unique risk cancels; market risk is the part you're paid for.", "Ten muchas cosas que no se mueven juntas. El riesgo único se cancela; el riesgo de mercado es el que te pagan.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="sp-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#sp-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#sp-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#sp").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Spread out eight portfolios", "Repartiste ocho portafolios"));
    if (G.score === N) FH.badge("well-diversified");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What does diversification mean?", opts: ["Spreading money across investments that don't all move together", "Putting all your money in the best stock", "Buying and selling often", "Only investing in bonds"], a: 0, why: "When some investments zig and others zag, the bumps partly cancel." },
    { q: "Two stocks have a correlation of −1. What does that mean?", opts: ["They always move in exactly opposite directions", "They always move together", "They aren't related at all", "They both always lose money"], a: 0, why: "Correlation runs from −1 (opposite) through 0 (unrelated) to +1 (lockstep)." },
    { q: "Which kind of risk can't be removed by diversification?", opts: ["Market risk", "Unique risk", "Company-specific risk", "Product recall risk"], a: 0, why: "Recessions and rate jumps hit nearly every stock at once, so adding stocks can't cancel them." },
    { q: "You put half your money in each of two stocks. Each has a 20% standard deviation, and their correlation is +1. What is the mix's standard deviation?", opts: ["20%", "10%", "0%", "40%"], a: 0, why: "At +1 they move in lockstep, so mixing them removes nothing: still 20%." },
    { q: "Which is an example of unique risk?", opts: ["A company's CEO is caught in a scandal", "The economy enters a recession", "Interest rates rise across the country", "A global pandemic closes stores everywhere"], a: 0, why: "A scandal hits one company. The others hit almost everyone." },
    { q: "Why is an S&P 500 index fund usually less risky than a single stock?", opts: ["It holds hundreds of companies, so their unique risks cancel out", "Its companies never lose money", "The government guarantees it", "It only holds bonds"], a: 0, why: "With 500 companies, one company's bad news barely moves the whole fund." },
    { q: "According to the CAPM, investors earn a risk premium for which kind of risk?", opts: ["Market risk, measured by beta", "Unique risk", "All risk equally", "No risk"], a: 0, why: "Unique risk can be diversified away for free, so only market risk is rewarded." },
    { q: "You put $6,000 in a stock that gains 20% and $4,000 in one that loses 5%. What is the total at the end?", opts: ["$11,000", "$11,500", "$10,500", "$12,000"], a: 0, why: "$6,000 × 1.20 = $7,200; $4,000 × 0.95 = $3,800; $7,200 + $3,800 = $11,000." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué significa diversificar?", opts: ["Repartir el dinero entre inversiones que no se mueven todas juntas", "Poner todo tu dinero en la mejor acción", "Comprar y vender seguido", "Invertir solo en bonos"], a: 0, why: "Cuando unas inversiones suben y otras bajan, los golpes se cancelan en parte." },
    { q: "Dos acciones tienen una correlación de −1. ¿Qué significa?", opts: ["Siempre se mueven exactamente al revés", "Siempre se mueven juntas", "No tienen ninguna relación", "Las dos siempre pierden dinero"], a: 0, why: "La correlación va de −1 (al revés), pasando por 0 (sin relación), a +1 (iguales)." },
    { q: "¿Qué tipo de riesgo no se puede quitar diversificando?", opts: ["El riesgo de mercado", "El riesgo único", "El riesgo de una sola empresa", "El riesgo de que retiren un producto"], a: 0, why: "Las recesiones y las subidas de tasas le pegan a casi todas las acciones a la vez, así que agregar acciones no las cancela." },
    { q: "Pones la mitad de tu dinero en cada una de dos acciones. Cada una tiene 20% de desviación estándar y su correlación es +1. ¿Cuál es la desviación estándar de la mezcla?", opts: ["20%", "10%", "0%", "40%"], a: 0, why: "Con +1 se mueven igual, así que mezclarlas no quita nada: sigue en 20%." },
    { q: "¿Cuál es un ejemplo de riesgo único?", opts: ["El director de una empresa queda envuelto en un escándalo", "La economía entra en recesión", "Suben las tasas de interés en todo el país", "Una pandemia cierra tiendas en todo el mundo"], a: 0, why: "Un escándalo le pega a una empresa. Los demás le pegan a casi todos." },
    { q: "¿Por qué un fondo indexado del S&P 500 suele ser menos riesgoso que una sola acción?", opts: ["Tiene cientos de empresas, así que sus riesgos únicos se cancelan", "Sus empresas nunca pierden dinero", "El gobierno lo garantiza", "Solo tiene bonos"], a: 0, why: "Con 500 empresas, las malas noticias de una casi no mueven el fondo completo." },
    { q: "Según el CAPM, ¿por qué tipo de riesgo reciben una prima los inversionistas?", opts: ["Por el riesgo de mercado, medido con la beta", "Por el riesgo único", "Por todo el riesgo por igual", "Por ningún riesgo"], a: 0, why: "El riesgo único se puede quitar gratis diversificando, así que solo se premia el riesgo de mercado." },
    { q: "Pones $6,000 en una acción que gana 20% y $4,000 en una que pierde 5%. ¿Cuánto tienes en total al final?", opts: ["$11,000", "$11,500", "$10,500", "$12,000"], a: 0, why: "$6,000 × 1.20 = $7,200; $4,000 × 0.95 = $3,800; $7,200 + $3,800 = $11,000." },
  ];

  FHLesson.init({ id: LESSON, short: "diversification", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
