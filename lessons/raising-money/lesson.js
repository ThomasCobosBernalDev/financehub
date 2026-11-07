// Unit 13, Lesson 1: Raising money
(function () {
  const LESSON = "u13-raising-money";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

  // ---------- See it: loan vs. investor ----------
  const INTEREST = 3200, KEEP = 0.75;
  const pEl = $("#rm-p");
  const drawRm = () => {
    const P = +pEl.value;
    $("#rm-p-v").textContent = usd(P);
    const rows = [
      { name: T("Bank loan: keep 100%, pay $3,200", "Préstamo: te quedas 100%, pagas $3,200"), you: P - INTEREST, other: INTEREST, oname: T("interest", "intereses") },
      { name: T("Investor: keep 75%", "Inversionista: te quedas 75%"), you: P * KEEP, other: P * (1 - KEEP), oname: T("investor's 25%", "25% del inversionista") },
    ];
    const W = 600, span = 60000 + 13200, sc = (W - 20) / span;
    const zx = 10 + 13200 * sc;
    let g = "";
    rows.forEach((r, i) => {
      const y = 50 + i * 96, w = Math.abs(r.you) * sc;
      g += `<text x="10" y="${y - 12}" class="rm-name">${r.name}</text>`;
      g += `<rect x="${r.you >= 0 ? zx : zx - w}" y="${y}" width="${Math.max(2, w)}" height="34" rx="6" class="${r.you >= 0 ? "rm-you" : "rm-loss"}"/>`;
      g += `<line x1="${zx}" x2="${zx}" y1="${y - 6}" y2="${y + 40}" class="rm-zero"/>`;
      const inside = r.you >= 0 && zx + w > W - 200;
      g += `<text x="${inside ? zx + w - 10 : r.you >= 0 ? zx + w + 8 : zx + 8}" y="${y + 24}" class="rm-num${inside ? " rm-in" : ""}"${inside ? ' text-anchor="end"' : ""}>${T("You", "Tú")} ${usd(r.you)}</text>`;
    });
    $("#rm-out").innerHTML = `<svg viewBox="0 0 ${W} 230" class="rm-chart">${g}</svg>`;
    const d = rows[0].you - rows[1].you, m = $("#rm-msg");
    if (Math.abs(d) < 1) { m.textContent = T("A tie: at $12,800 of profit, both offers leave you the same.", "Empate: con $12,800 de ganancia, las dos ofertas te dejan lo mismo."); m.dataset.tone = ""; }
    else if (d > 0) { m.textContent = T(`The loan leaves you ${usd(d)} more. The investor's 25% would cost more than $3,200 of interest.`, `El préstamo te deja ${usd(d)} más. El 25% del inversionista costaría más que $3,200 de intereses.`); m.dataset.tone = "good"; }
    else { m.textContent = T(`The investor leaves you ${usd(-d)} more. The interest is due even in a bad year; the investor shares the hit.`, `El inversionista te deja ${usd(-d)} más. Los intereses se pagan aunque sea un mal año; el inversionista comparte el golpe.`); m.dataset.tone = "warn"; }
    fillRange(pEl);
  };
  pEl.addEventListener("input", drawRm);
  drawRm();

  // ---------- Play it: debt or equity ----------
  const ROUNDS = [
    { facts: [T("An investor pays $50,000 for 20% of a bakery", "Un inversionista paga $50,000 por el 20% de una panadería")], q: T("What's the post-money valuation?", "¿Cuál es la valuación después de la inversión?"),
      opts: ["$250,000", "$200,000", "$60,000", "$1,000,000"], a: 0,
      why: `${fr("$50,000", "0.20")} = $250,000.` },
    { facts: [T("A café is worth $300,000 right after an investment", "Un café vale $300,000 justo después de una inversión"), T("The investor put in $60,000", "El inversionista puso $60,000")], q: T("What was the pre-money valuation?", "¿Cuál era la valuación antes de la inversión?"),
      opts: ["$240,000", "$360,000", "$300,000", "$60,000"], a: 0,
      why: T("Pre-money = post-money − investment: $300,000 − $60,000 = $240,000.", "Antes = después − inversión: $300,000 − $60,000 = $240,000.") },
    { facts: [T("A big company needs $500 million", "Una gran empresa necesita $500 millones"), T("It sells IOUs to investors that pay 5% a year and return the money in 10 years", "Vende pagarés a inversionistas que pagan 5% al año y devuelven el dinero en 10 años")], q: T("What is it selling?", "¿Qué está vendiendo?"),
      opts: [T("Bonds", "Bonos"), T("Shares", "Acciones"), T("An IPO", "Una salida a bolsa"), T("Insurance", "Seguros")], a: 0,
      why: T("IOUs that pay interest and return the money on a set date are bonds: debt.", "Los pagarés que pagan intereses y devuelven el dinero en una fecha fija son bonos: deuda.") },
    { facts: [T("A landscaper needs $20,000 for a truck", "Un jardinero necesita $20,000 para una camioneta"), T("Offer 1: a bank loan at 6%", "Oferta 1: un préstamo bancario al 6%"), T("Offer 2: an investor wants 30% of the business", "Oferta 2: un inversionista quiere el 30% del negocio")], q: T("Which lets the landscaper keep 100% ownership?", "¿Cuál le deja al jardinero el 100% del negocio?"),
      opts: [T("The bank loan", "El préstamo bancario"), T("The investor", "El inversionista"), T("Both", "Las dos"), T("Neither", "Ninguna")], a: 0,
      why: T("Debt doesn't buy any ownership. Equity does.", "La deuda no compra parte del negocio. El capital sí.") },
    { facts: [T("A $20,000 loan", "Un préstamo de $20,000"), T("Interest rate: 6% a year", "Tasa de interés: 6% al año")], q: T("How much interest is due in the first year?", "¿Cuánto interés se debe el primer año?"),
      opts: ["$1,200", "$120", "$6,000", "$12,000"], a: 0,
      why: T("$20,000 × 0.06 = $1,200.", "$20,000 × 0.06 = $1,200.") },
    { facts: [T("A company has been owned by its founders and a few investors", "Una empresa ha sido de sus fundadores y algunos inversionistas"), T("Now it lists its shares on the stock market for anyone to buy", "Ahora pone sus acciones en la bolsa para que cualquiera las compre")], q: T("What's this called?", "¿Cómo se llama esto?"),
      opts: [T("An IPO", "Una salida a bolsa (IPO)"), T("A bond", "Un bono"), T("Bootstrapping", "Arrancar con lo propio"), T("A loan", "Un préstamo")], a: 0,
      why: T("An initial public offering is the first time a company sells shares to the public.", "Una oferta pública inicial es la primera vez que una empresa vende acciones al público.") },
    { facts: [T("A new app has no profit yet", "Una app nueva todavía no tiene ganancias"), T("It could grow huge, or fail", "Podría crecer muchísimo o fracasar")], q: T("Who is most likely to fund it?", "¿Quién es más probable que la financie?"),
      opts: [T("A venture capital firm", "Una firma de capital de riesgo"), T("A bank loan", "Un préstamo bancario"), T("A bond sale", "Una venta de bonos"), T("An IPO", "Una salida a bolsa")], a: 0,
      why: T("With no profit to pay interest, it needs equity from investors who accept big risk for a shot at big growth.", "Sin ganancias para pagar intereses, necesita capital de inversionistas que aceptan mucho riesgo por la oportunidad de crecer mucho.") },
    { facts: [T("You own all 1,000 shares of your company", "Tienes las 1,000 acciones de tu empresa"), T("The company sells 250 new shares to an investor", "La empresa le vende 250 acciones nuevas a un inversionista")], q: T("What percent do you own now?", "¿Qué porcentaje tienes ahora?"),
      opts: ["80%", "75%", "100%", "25%"], a: 0,
      why: `${fr("1,000", "1,250")} = 0.80, ${T("so 80%. That's dilution.", "o sea 80%. Eso es dilución.")}` },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#de-why"), nextB = $("#de-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#de-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#de-q").textContent = r.q;
    $("#de-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#de-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#de-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#de-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#de-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#de-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#de-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Deal maker", "Cierras tratos") : G.score >= 6 ? T("Term sheet ready", "Listo para negociar") : T("Review debt vs. equity", "Repasa deuda vs. capital")}</b><p>${T("Debt: pay it back with interest, keep it all. Equity: never repay, give up a slice.", "Deuda: la pagas con intereses y te quedas con todo. Capital: nunca la pagas y cedes una parte.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="de-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#de-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#de-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#de").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Funded eight businesses", "Financiaste ocho negocios"));
    if (G.score === N) FH.badge("deal-maker");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What's the main difference between debt and equity financing?", opts: ["Debt is repaid with interest; equity sells a share of ownership", "Debt is cheaper in every case", "Equity must be repaid in 5 years", "Only big companies can use debt"], a: 0, why: "A loan or bond is paid back on a schedule. Equity is never repaid; investors own a slice instead." },
    { q: "An investor pays $100,000 for 25% of a company. What is the post-money valuation?", opts: ["$400,000", "$125,000", "$250,000", "$75,000"], a: 0, why: `${fr("$100,000", "0.25")} = $400,000.` },
    { q: "A company's post-money valuation is $400,000 after a $100,000 investment. What was its pre-money valuation?", opts: ["$300,000", "$500,000", "$400,000", "$100,000"], a: 0, why: "$400,000 − $100,000 = $300,000." },
    { q: "What is an IPO?", opts: ["The first time a company sells shares to the public", "A type of bank loan", "A bond that pays no interest", "A company's yearly tax filing"], a: 0, why: "An initial public offering lists a company's shares on a stock exchange for the first time." },
    { q: "What is a bond?", opts: ["A loan to a company or government that pays interest", "A share of ownership in a company", "A type of savings account", "Money an owner puts into a business"], a: 0, why: "Bond buyers lend money, earn interest, and get the full amount back on a set date." },
    { q: "Why might a profitable company choose debt over equity?", opts: ["It keeps full ownership and interest lowers its taxes", "Debt never has to be repaid", "Debt holders share the losses", "Equity always costs nothing"], a: 0, why: "The owners keep every future dollar of profit above the interest, and interest is a tax-deductible expense." },
    { q: "A founder owns all 1,000 shares of a company. The company issues 1,000 new shares to investors. What does the founder own now?", opts: ["50%", "100%", "25%", "75%"], a: 0, why: `${fr("1,000", "2,000")} = 0.50, so 50%.` },
    { q: "What does leverage do to a business owner's results?", opts: ["Makes good years better and bad years worse", "Removes all risk", "Always lowers profit", "Has no effect"], a: 0, why: "Interest is fixed. When profit is high, owners keep more; when profit falls, the interest is still due." },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál es la diferencia principal entre financiarse con deuda y con capital?", opts: ["La deuda se paga con intereses; el capital vende parte del negocio", "La deuda siempre es más barata", "El capital se paga en 5 años", "Solo las grandes empresas pueden usar deuda"], a: 0, why: "Un préstamo o un bono se paga en un calendario. El capital nunca se paga; los inversionistas se quedan con una parte." },
    { q: "Un inversionista paga $100,000 por el 25% de una empresa. ¿Cuál es la valuación después de la inversión?", opts: ["$400,000", "$125,000", "$250,000", "$75,000"], a: 0, why: `${fr("$100,000", "0.25")} = $400,000.` },
    { q: "Una empresa vale $400,000 después de una inversión de $100,000. ¿Cuánto valía antes?", opts: ["$300,000", "$500,000", "$400,000", "$100,000"], a: 0, why: "$400,000 − $100,000 = $300,000." },
    { q: "¿Qué es una salida a bolsa (IPO)?", opts: ["La primera vez que una empresa vende acciones al público", "Un tipo de préstamo bancario", "Un bono que no paga intereses", "La declaración anual de impuestos de una empresa"], a: 0, why: "Una oferta pública inicial pone las acciones de una empresa en la bolsa por primera vez." },
    { q: "¿Qué es un bono?", opts: ["Un préstamo a una empresa o gobierno que paga intereses", "Una parte de la propiedad de una empresa", "Un tipo de cuenta de ahorro", "Dinero que un dueño pone en su negocio"], a: 0, why: "Quienes compran bonos prestan dinero, reciben intereses y recuperan el total en una fecha fija." },
    { q: "¿Por qué una empresa con ganancias podría preferir deuda en vez de capital?", opts: ["Conserva todo el negocio y los intereses bajan sus impuestos", "La deuda nunca se paga", "Los prestamistas comparten las pérdidas", "El capital nunca cuesta nada"], a: 0, why: "Los dueños se quedan con cada dólar de ganancia arriba de los intereses, y los intereses son un gasto deducible." },
    { q: "Una fundadora tiene las 1,000 acciones de una empresa. La empresa emite 1,000 acciones nuevas para inversionistas. ¿Cuánto tiene ahora?", opts: ["50%", "100%", "25%", "75%"], a: 0, why: `${fr("1,000", "2,000")} = 0.50, o sea 50%.` },
    { q: "¿Qué hace el apalancamiento con los resultados del dueño?", opts: ["Hace mejores los años buenos y peores los malos", "Quita todo el riesgo", "Siempre baja la ganancia", "No tiene efecto"], a: 0, why: "Los intereses son fijos. Cuando la ganancia es alta, los dueños se quedan con más; cuando baja, los intereses se siguen debiendo." },
  ];

  FHLesson.init({ id: LESSON, short: "raising-money", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
