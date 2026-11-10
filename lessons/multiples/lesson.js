// Unit 15, Lesson 2: Comparables and multiples
(function () {
  const LESSON = "u15-multiples";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // ---------- See it: football field ----------
  const EBITDA = 110000, OFFER = 500000, DCF = [523441, 890765], COMPS = [550000, 770000];
  const mEl = $("#cm-m");
  const X = (v) => 150 + ((v - 400000) / 600000) * 420;
  const drawCm = () => {
    const m = +mEl.value, v = m * EBITDA;
    $("#cm-m-v").textContent = `${m}x`;
    let g = `<text x="138" y="62" text-anchor="end" class="cm-lab">DCF</text><text x="138" y="122" text-anchor="end" class="cm-lab">${T("Comps", "Múltiplos")}</text>`;
    g += `<rect x="${X(DCF[0])}" y="36" width="${X(DCF[1]) - X(DCF[0])}" height="38" rx="8" class="cm-bd"/>`;
    g += `<rect x="${X(COMPS[0])}" y="96" width="${X(COMPS[1]) - X(COMPS[0])}" height="38" rx="8" class="cm-bc"/>`;
    g += `<line x1="${X(OFFER)}" x2="${X(OFFER)}" y1="26" y2="148" class="cm-offer"/>`;
    g += `<text x="${X(OFFER)}" y="16" text-anchor="middle" class="cm-tick">${T("Offer $500k", "Oferta $500k")}</text>`;
    g += `<circle cx="${X(v)}" cy="115" r="11" class="cm-dot"/>`;
    [[400000, "$400k"], [700000, "$700k"], [1000000, "$1M"]].forEach(([x, l]) => { g += `<text x="${X(x)}" y="176" text-anchor="middle" class="cm-tick">${l}</text>`; });
    $("#cm-out").innerHTML = `<svg viewBox="0 0 600 186" class="cm-chart">${g}</svg>`;
    const inBoth = v >= COMPS[0] && v <= COMPS[1];
    const m2 = $("#cm-msg");
    m2.innerHTML = T(`At ${m}x: ${m} × $110,000 = <b>${usd(v)}</b>. ${v < OFFER ? "That's below the offer, so $500,000 would look fair." : inBoth ? "That's inside both ranges, a price you can defend." : v < COMPS[0] ? "That's above the offer but low next to the shops that sold." : "That's higher than any shop that sold. Hard to defend."}`,
      `Con ${m}x: ${m} × $110,000 = <b>${usd(v)}</b>. ${v < OFFER ? "Eso está abajo de la oferta, así que $500,000 parecería justo." : inBoth ? "Eso está dentro de los dos rangos, un precio que puedes defender." : v < COMPS[0] ? "Eso está arriba de la oferta, pero bajo comparado con las tiendas que se vendieron." : "Eso es más que cualquier tienda que se vendió. Difícil de defender."}`);
    m2.dataset.tone = inBoth ? "good" : "warn";
    fillRange(mEl);
  };
  mEl.addEventListener("input", drawCm);
  drawCm();

  // ---------- Play it: comps table ----------
  const ROUNDS = [
    { facts: [T("Share price: $40", "Precio de la acción: $40"), T("Earnings per share: $4", "Ganancia por acción: $4")], q: T("What's the P/E ratio?", "¿Cuál es la razón P/E?"),
      opts: ["10", "4", "160", "36"], a: 0,
      why: `${fr("$40", "$4")} = 10.` },
    { facts: [T("Enterprise value: $900,000", "Valor de empresa: $900,000"), "EBITDA: $150,000"], q: T("What's the EV/EBITDA multiple?", "¿Cuál es el múltiplo EV/EBITDA?"),
      opts: ["6x", "5x", "7.5x", "1.5x"], a: 0,
      why: `${fr("$900,000", "$150,000")} = 6x.` },
    { facts: [T("Three comps: 4x, 5x and 9x", "Tres comparables: 4x, 5x y 9x")], q: T("What's the median?", "¿Cuál es la mediana?"),
      opts: ["5x", "6x", "4x", "9x"], a: 0,
      why: T("Sorted, 4x, 5x, 9x: the middle one is 5x.", "En orden, 4x, 5x, 9x: la del medio es 5x.") },
    { facts: [T("Your EBITDA: $200,000", "Tu EBITDA: $200,000"), T("Median EV/EBITDA: 6x", "Mediana de EV/EBITDA: 6x")], q: T("What's your enterprise value?", "¿Cuál es tu valor de empresa?"),
      opts: ["$1,200,000", "$33,333", "$206,000", "$600,000"], a: 0,
      why: "6 × $200,000 = $1,200,000." },
    { facts: [T("Similar stocks trade at a P/E of 20", "Acciones parecidas cotizan a un P/E de 20"), T("Earnings per share: $3", "Ganancia por acción: $3")], q: T("About what should the stock cost?", "¿Más o menos cuánto debería costar la acción?"),
      opts: ["$60", "$23", "$6.67", "$17"], a: 0,
      why: "20 × $3 = $60." },
    { facts: [T("You're pricing a local bike shop", "Le pones precio a una tienda de bicicletas local"), T("Candidates: two bike shops and a software company", "Candidatas: dos tiendas de bicicletas y una empresa de software")], q: T("Which one is NOT a good comp?", "¿Cuál NO es un buen comparable?"),
      opts: [T("The software company", "La empresa de software"), T("The first bike shop", "La primera tienda"), T("The second bike shop", "La segunda tienda")], a: 0,
      why: T("Comps should be in the same industry, with similar size, growth and risk.", "Los comparables deben ser de la misma industria, con tamaño, crecimiento y riesgo parecidos.") },
    { facts: [T("Company A grows 20% a year", "La empresa A crece 20% al año"), T("Company B grows 3% a year", "La empresa B crece 3% al año"), T("Same industry and risk", "Misma industria y riesgo")], q: T("Which should have the higher multiple?", "¿Cuál debería tener el múltiplo más alto?"),
      opts: [T("Company A", "La empresa A"), T("Company B", "La empresa B"), T("The same", "Igual")], a: 0,
      why: T("Investors pay more today for profit they expect to grow faster.", "Los inversionistas pagan más hoy por ganancias que esperan que crezcan más rápido.") },
    { facts: [T("Enterprise value from comps: $1,200,000", "Valor de empresa por comparables: $1,200,000"), T("Debt: $300,000", "Deuda: $300,000"), T("Cash: $100,000", "Efectivo: $100,000")], q: T("What's the owners' share?", "¿Cuál es la parte de los dueños?"),
      opts: ["$1,000,000", "$1,400,000", "$1,600,000", "$800,000"], a: 0,
      why: "$1,200,000 − $300,000 + $100,000 = $1,000,000." },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#mx-why"), nextB = $("#mx-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#mx-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#mx-q").textContent = r.q;
    $("#mx-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#mx-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#mx-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#mx-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#mx-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#mx-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#mx-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Comps pro", "Domina los comparables") : G.score >= 6 ? T("Ready to build a comps table", "Puedes armar una tabla de comparables") : T("Review the four steps", "Repasa los cuatro pasos")}</b><p>${T("Similar companies sell for similar multiples. Pick good comps, take the median, apply it.", "Las empresas parecidas se venden a múltiplos parecidos. Elige buenos comparables, toma la mediana y aplícala.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="mx-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#mx-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#mx-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#mx").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Built a comps table", "Armaste una tabla de comparables"));
    if (G.score === N) FH.badge("comps-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is a valuation multiple?", opts: ["A price divided by a measure of profit, like earnings", "A company's growth rate", "The number of shares a company has", "Profit minus costs"], a: 0, why: "It tells you how many dollars investors pay for each dollar of that measure." },
    { q: "A stock trades at $50 and earns $2.50 per share. What is its P/E ratio?", opts: ["20", "125", "2.5", "47.5"], a: 0, why: `${fr("$50", "$2.50")} = 20.` },
    { q: "A company has operating income of $80,000 and depreciation of $20,000. What is its EBITDA?", opts: ["$100,000", "$60,000", "$80,000", "$1,600,000"], a: 0, why: "$80,000 + $20,000 = $100,000." },
    { q: "Five comps have EV/EBITDA multiples of 6x, 7x, 8x, 9x and 20x. What is the median?", opts: ["8x", "10x", "7x", "20x"], a: 0, why: "Sorted, the middle of five is the third: 8x. The 20x can't pull it up." },
    { q: "A company's EBITDA is $250,000 and comparable companies trade at 8x EV/EBITDA. What is its enterprise value?", opts: ["$2,000,000", "$31,250", "$258,000", "$800,000"], a: 0, why: "8 × $250,000 = $2,000,000." },
    { q: "Which value should be divided by EBITDA?", opts: ["Enterprise value", "Share price", "Earnings per share", "Cash"], a: 0, why: "EBITDA comes before interest, so it belongs to lenders and owners. Enterprise value is also for both." },
    { q: "Why do faster-growing companies usually have higher multiples?", opts: ["Investors pay more today for profit they expect to grow", "They have more debt", "They pay less tax", "They have fewer shares"], a: 0, why: "A higher multiple means paying more per dollar of today's profit, which makes sense if that profit will grow fast." },
    { q: "What is a main weakness of valuing with comparables?", opts: ["If similar companies are all overpriced, your value will be too", "It needs a 10-year forecast", "It ignores what real buyers pay", "It only works for bonds"], a: 0, why: "Comps show what others pay, not true worth, as the dot-com bubble showed." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es un múltiplo de valuación?", opts: ["Un precio dividido entre una medida de ganancia, como las utilidades", "La tasa de crecimiento de una empresa", "El número de acciones de una empresa", "La ganancia menos los costos"], a: 0, why: "Te dice cuántos dólares pagan los inversionistas por cada dólar de esa medida." },
    { q: "Una acción cotiza a $50 y gana $2.50 por acción. ¿Cuál es su razón P/E?", opts: ["20", "125", "2.5", "47.5"], a: 0, why: `${fr("$50", "$2.50")} = 20.` },
    { q: "Una empresa tiene una utilidad de operación de $80,000 y una depreciación de $20,000. ¿Cuál es su EBITDA?", opts: ["$100,000", "$60,000", "$80,000", "$1,600,000"], a: 0, why: "$80,000 + $20,000 = $100,000." },
    { q: "Cinco comparables tienen múltiplos EV/EBITDA de 6x, 7x, 8x, 9x y 20x. ¿Cuál es la mediana?", opts: ["8x", "10x", "7x", "20x"], a: 0, why: "En orden, la del medio de cinco es la tercera: 8x. El 20x no la puede mover hacia arriba." },
    { q: "El EBITDA de una empresa es $250,000 y empresas comparables cotizan a 8x EV/EBITDA. ¿Cuál es su valor de empresa?", opts: ["$2,000,000", "$31,250", "$258,000", "$800,000"], a: 0, why: "8 × $250,000 = $2,000,000." },
    { q: "¿Qué valor se debe dividir entre el EBITDA?", opts: ["El valor de empresa", "El precio de la acción", "La ganancia por acción", "El efectivo"], a: 0, why: "El EBITDA va antes de los intereses, así que es de prestamistas y dueños. El valor de empresa también es de los dos." },
    { q: "¿Por qué las empresas que crecen más rápido suelen tener múltiplos más altos?", opts: ["Los inversionistas pagan más hoy por ganancias que esperan que crezcan", "Tienen más deuda", "Pagan menos impuestos", "Tienen menos acciones"], a: 0, why: "Un múltiplo más alto significa pagar más por cada dólar de ganancia de hoy, lo cual tiene sentido si esa ganancia va a crecer rápido." },
    { q: "¿Cuál es una debilidad principal de valuar con comparables?", opts: ["Si todas las empresas parecidas están sobrevaluadas, tu valor también lo estará", "Necesita una proyección a 10 años", "Ignora lo que pagan los compradores reales", "Solo sirve para bonos"], a: 0, why: "Los comparables muestran lo que otros pagan, no lo que algo vale de verdad, como mostró la burbuja de las punto com." },
  ];

  FHLesson.init({ id: LESSON, short: "multiples", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
