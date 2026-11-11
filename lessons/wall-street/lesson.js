// Unit 16, Lesson 1: Who does what on Wall Street
(function () {
  const LESSON = "u16-wall-street";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: "2 and 20" ----------
  const rEl = $("#hf-r");
  const X = (p) => 150 + ((p + 5) / 35) * 420;
  const bar = (p, y, cls) => { const a = Math.min(X(0), X(p)), w = Math.max(3, Math.abs(X(p) - X(0))); return `<rect x="${a}" y="${y}" width="${w}" height="38" rx="8" class="${cls}"/>`; };
  const drawHf = () => {
    const r = +rEl.value, fee = 2 + 0.2 * r, net = r - fee;
    $("#hf-r-v").textContent = `${r}%`;
    let g = `<text x="138" y="62" text-anchor="end" class="hf-lab">${T("Fund", "Fondo")}</text><text x="138" y="122" text-anchor="end" class="hf-lab">${T("Investors", "Inversionistas")}</text>`;
    g += bar(r, 36, "hf-a") + bar(net, 96, "hf-b");
    g += `<line x1="${X(0)}" x2="${X(0)}" y1="26" y2="148" class="hf-zero"/>`;
    [[0, "0%"], [10, "10%"], [20, "20%"], [30, "30%"]].forEach(([p, l]) => { g += `<text x="${X(p)}" y="176" text-anchor="middle" class="hf-tick">${l}</text>`; });
    $("#hf-out").innerHTML = `<svg viewBox="0 0 600 186" class="hf-chart">${g}</svg>`;
    const m = $("#hf-msg");
    m.innerHTML = T(`The fund makes <b>$${r} million</b>. Fees: $2 million + 20% × $${r} million = <b>$${+fee.toFixed(1)} million</b>. Investors keep ${net < 0 ? "−" : ""}$${Math.abs(+net.toFixed(1))} million: <b>${net < 0 ? "−" : ""}${Math.abs(+net.toFixed(1))}%</b>.`,
      `El fondo gana <b>$${r} millones</b>. Comisiones: $2 millones + 20% × $${r} millones = <b>$${+fee.toFixed(1)} millones</b>. Los inversionistas se quedan con ${net < 0 ? "−" : ""}$${Math.abs(+net.toFixed(1))} millones: <b>${net < 0 ? "−" : ""}${Math.abs(+net.toFixed(1))}%</b>.`);
    m.dataset.tone = net > 0 ? "good" : "warn";
    fillRange(rEl);
  };
  rEl.addEventListener("input", drawHf);
  drawHf();

  // ---------- Play it: who does it? ----------
  const ROUNDS = [
    { facts: [T("Task: advise a company on buying a rival", "Tarea: asesorar a una empresa para comprar a una rival")], q: T("Who does it?", "¿Quién lo hace?"),
      opts: [T("An investment banker", "Banca de inversión"), T("A wealth manager", "Gestión patrimonial"), T("A commercial bank teller", "Caja de un banco comercial")], a: 0,
      why: T("M&A advice is a core job of investment banking.", "Asesorar en M&A es un trabajo central de la banca de inversión.") },
    { facts: [T("Task: pick stocks for a mutual fund", "Tarea: elegir acciones para un fondo mutuo")], q: T("Who does it?", "¿Quién lo hace?"),
      opts: [T("A portfolio manager", "Gestión de portafolios"), T("A trader at a bank", "Operaciones en un banco"), T("An equity research analyst", "Análisis de acciones")], a: 0,
      why: T("A portfolio manager at an asset manager decides what the fund buys.", "En una gestora de activos, quien gestiona el portafolio decide qué compra el fondo.") },
    { facts: [T("Task: buy whole companies with mostly borrowed money, sell them in 5 years", "Tarea: comprar empresas completas sobre todo con dinero prestado y venderlas en 5 años")], q: T("Which kind of firm?", "¿Qué tipo de firma?"),
      opts: [T("Private equity", "Capital privado"), T("A commercial bank", "Un banco comercial"), T("An index fund", "Un fondo indexado")], a: 0,
      why: T("That's a leveraged buyout, the main tool of private equity.", "Eso es una compra apalancada, la herramienta principal del capital privado.") },
    { facts: [T("Task: help a family plan for retirement and invest their savings", "Tarea: ayudar a una familia a planear su retiro e invertir sus ahorros")], q: T("Who does it?", "¿Quién lo hace?"),
      opts: [T("A wealth manager", "Gestión patrimonial"), T("A hedge fund trader", "Operaciones en un fondo de cobertura"), T("An M&A banker", "Banca de M&A")], a: 0,
      why: T("Wealth management serves individuals and families.", "La gestión patrimonial atiende a personas y familias.") },
    { facts: [T("Task: write reports rating stocks buy, hold or sell", "Tarea: escribir reportes que califican acciones como comprar, mantener o vender")], q: T("Who does it?", "¿Quién lo hace?"),
      opts: [T("An equity research analyst", "Análisis de acciones"), T("A back office team", "Un equipo de back office"), T("A private equity associate", "Capital privado")], a: 0,
      why: T("Equity research analysts study companies and publish ratings.", "En análisis de acciones se estudian empresas y se publican calificaciones.") },
    { facts: [T("IPO size: $200 million", "Tamaño de la IPO: $200 millones"), T("Underwriting fee: 7%", "Comisión de colocación: 7%")], q: T("What does the bank earn?", "¿Cuánto gana el banco?"),
      opts: [T("$14 million", "$14 millones"), T("$7 million", "$7 millones"), T("$1.4 million", "$1.4 millones"), T("$28 million", "$28 millones")], a: 0,
      why: T("7% × $200 million = $14 million.", "7% × $200 millones = $14 millones.") },
    { facts: [T("A $50 million hedge fund earns 20%", "Un fondo de cobertura de $50 millones gana 20%"), T("Fees: 2 and 20", "Comisiones: 2 y 20")], q: T("What are the total fees?", "¿Cuánto suman las comisiones?"),
      opts: [T("$3 million", "$3 millones"), T("$10 million", "$10 millones"), T("$1 million", "$1 millón"), T("$2 million", "$2 millones")], a: 0,
      why: T("Profit: 20% × $50 million = $10 million. Fees: 2% × $50 million = $1 million, plus 20% × $10 million = $2 million. Total $3 million.", "Ganancia: 20% × $50 millones = $10 millones. Comisiones: 2% × $50 millones = $1 millón, más 20% × $10 millones = $2 millones. Total $3 millones.") },
    { facts: [T("A pension fund invests money for retirees", "Un fondo de pensiones invierte dinero para personas jubiladas")], q: T("Which side is it on?", "¿De qué lado está?"),
      opts: [T("Buy side", "Lado comprador"), T("Sell side", "Lado vendedor"), T("Neither", "Ninguno")], a: 0,
      why: T("It invests money, so it's buy side.", "Invierte dinero, así que es del lado comprador.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#jb-why"), nextB = $("#jb-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#jb-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#jb-q").textContent = r.q;
    $("#jb-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#jb-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#jb-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#jb-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#jb-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#jb-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#jb-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Street smart", "Conoce Wall Street") : G.score >= 6 ? T("You know the map", "Ya conoces el mapa") : T("Review the two sides", "Repasa los dos lados")}</b><p>${T("The sell side sells deals and services; the buy side invests. Know how each gets paid.", "El lado vendedor vende operaciones y servicios; el lado comprador invierte. Conoce cómo cobra cada uno.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="jb-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#jb-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#jb-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#jb").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Placed eight Wall Street jobs", "Ubicaste ocho trabajos de Wall Street"));
    if (G.score === N) FH.badge("street-smart");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is the main difference between the sell side and the buy side?", opts: ["The sell side sells deals and services; the buy side invests money", "The sell side only sells stocks; the buy side only buys bonds", "The sell side is for individuals; the buy side is for companies", "There is no difference"], a: 0, why: "Investment banks sell advice, new securities and trading; funds invest." },
    { q: "Which of these is on the buy side?", opts: ["A pension fund", "An investment bank's M&A group", "An equity research team at a bank", "An IPO underwriter"], a: 0, why: "A pension fund invests money for retirees." },
    { q: "A bank underwrites a $100 million IPO for a 7% fee. How much does the bank earn?", opts: ["$7 million", "$700,000", "$70 million", "$93 million"], a: 0, why: "7% × $100 million = $7 million. The company keeps $93 million." },
    { q: "A $50 million hedge fund earns $5 million (10%) and charges 2 and 20. What are its total fees?", opts: ["$2 million", "$1 million", "$5 million", "$11 million"], a: 0, why: "2% × $50 million = $1 million, plus 20% × $5 million = $1 million. Total $2 million." },
    { q: "A wealth manager charges 1% a year on a $500,000 account. What is the yearly fee?", opts: ["$5,000", "$500", "$50,000", "$1,000"], a: 0, why: "1% × $500,000 = $5,000." },
    { q: "What is the usual first job title for a college graduate at an investment bank?", opts: ["Analyst", "Managing director", "Vice president", "Partner"], a: 0, why: "Analysts start right out of college; then associate, vice president, director, managing director." },
    { q: "What does an underwriter do in an IPO?", opts: ["Buys the company's new shares and resells them to investors, taking the risk they won't sell", "Lends the company money for 30 years", "Audits the company's taxes", "Sets the company's interest rate"], a: 0, why: "Underwriting is selling a company's new stock or bonds to investors for a cut of the money raised." },
    { q: "What does a commercial bank mainly do?", opts: ["Takes deposits and makes loans", "Advises on mergers", "Runs hedge funds", "Writes stock ratings"], a: 0, why: "Like the bank that holds your checking account and lends to businesses." },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál es la diferencia principal entre el lado vendedor y el lado comprador?", opts: ["El lado vendedor vende operaciones y servicios; el lado comprador invierte dinero", "El lado vendedor solo vende acciones; el comprador solo compra bonos", "El lado vendedor es para personas; el comprador es para empresas", "No hay diferencia"], a: 0, why: "Los bancos de inversión venden asesoría, valores nuevos y operaciones de compraventa; los fondos invierten." },
    { q: "¿Cuál de estos está del lado comprador?", opts: ["Un fondo de pensiones", "El grupo de M&A de un banco de inversión", "Un equipo de análisis de acciones de un banco", "Un banco que coloca una IPO"], a: 0, why: "Un fondo de pensiones invierte dinero para personas jubiladas." },
    { q: "Un banco coloca una IPO de $100 millones con una comisión de 7%. ¿Cuánto gana el banco?", opts: ["$7 millones", "$700,000", "$70 millones", "$93 millones"], a: 0, why: "7% × $100 millones = $7 millones. La empresa se queda con $93 millones." },
    { q: "Un fondo de cobertura de $50 millones gana $5 millones (10%) y cobra 2 y 20. ¿Cuánto suman sus comisiones?", opts: ["$2 millones", "$1 millón", "$5 millones", "$11 millones"], a: 0, why: "2% × $50 millones = $1 millón, más 20% × $5 millones = $1 millón. Total $2 millones." },
    { q: "Un servicio de gestión patrimonial cobra 1% al año sobre una cuenta de $500,000. ¿Cuánto es la comisión anual?", opts: ["$5,000", "$500", "$50,000", "$1,000"], a: 0, why: "1% × $500,000 = $5,000." },
    { q: "¿Cuál es el primer puesto habitual para alguien recién egresado en un banco de inversión?", opts: ["Analista", "Director general", "Vicepresidente", "Socio"], a: 0, why: "Se empieza como analista al salir de la universidad; luego asociado, vicepresidente, director y director general." },
    { q: "¿Qué hace el banco colocador en una IPO?", opts: ["Compra las acciones nuevas de la empresa y las revende a inversionistas, asumiendo el riesgo de que no se vendan", "Le presta dinero a la empresa a 30 años", "Audita los impuestos de la empresa", "Fija la tasa de interés de la empresa"], a: 0, why: "Colocar es venderles a inversionistas las acciones o bonos nuevos de una empresa a cambio de una parte del dinero recaudado." },
    { q: "¿Qué hace principalmente un banco comercial?", opts: ["Recibe depósitos y da préstamos", "Asesora en fusiones", "Maneja fondos de cobertura", "Escribe calificaciones de acciones"], a: 0, why: "Como el banco donde tienes tu cuenta de cheques y que les presta a los negocios." },
  ];

  FHLesson.init({ id: LESSON, short: "wall-street", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
