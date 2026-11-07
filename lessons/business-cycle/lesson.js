// Unit 9, Lesson 3: Booms and recessions
(function () {
  const LESSON = "u9-business-cycle";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;

  // ---------- See it: cycle explorer ----------
  const W = 700, CYC = 1.6, AMP = 50;
  const theta = (t) => 2 * Math.PI * CYC * (t / 100) - 0.6;
  const yAt = (t) => 170 - 60 * (t / 100) - AMP * Math.sin(theta(t)) + 0 * t;
  const pts = [];
  for (let t = 0; t <= 100; t += 1) pts.push(`${(W * t) / 100},${yAt(t).toFixed(1)}`);
  $("#cy-line").setAttribute("d", "M" + pts.join(" L"));
  const PH = {
    exp: { n: T("Expansion", "Expansión"), rows: [
      [T("Output (GDP)", "Producción (PIB)"), T("Growing", "Crece")],
      [T("Jobs", "Empleo"), T("Businesses hire; unemployment falls", "Las empresas contratan; baja el desempleo")],
      [T("The Fed", "La Fed"), T("Holds rates, or raises them slowly", "Mantiene las tasas, o las sube poco a poco")],
      [T("Stocks", "Acciones"), T("Usually rising", "Casi siempre suben")],
      [T("Your move", "Tu jugada"), T("Build your emergency fund and invest steadily", "Arma tu fondo de emergencia e invierte con constancia")]] },
    peak: { n: T("Peak", "Pico"), rows: [
      [T("Output (GDP)", "Producción (PIB)"), T("Growing at its fastest, about to slow", "Crece lo más rápido, a punto de frenar")],
      [T("Jobs", "Empleo"), T("Hard to find workers; wages jump", "Cuesta encontrar trabajadores; suben los sueldos")],
      [T("The Fed", "La Fed"), T("Raises rates to cool rising prices", "Sube las tasas para enfriar los precios")],
      [T("Stocks", "Acciones"), T("Often near highs, getting bumpy", "Muchas veces cerca de máximos, con altibajos")],
      [T("Your move", "Tu jugada"), T("Don't spend every raise; pay down debt", "No gastes cada aumento; paga deudas")]] },
    con: { n: T("Contraction", "Contracción"), rows: [
      [T("Output (GDP)", "Producción (PIB)"), T("Shrinking", "Se encoge")],
      [T("Jobs", "Empleo"), T("Layoffs spread; unemployment rises", "Se extienden los despidos; sube el desempleo")],
      [T("The Fed", "La Fed"), T("Cuts rates to make borrowing cheaper", "Baja las tasas para abaratar los préstamos")],
      [T("Stocks", "Acciones"), T("Often falling", "Muchas veces bajan")],
      [T("Your move", "Tu jugada"), T("Lean on your fund; keep investing if your job is safe", "Usa tu fondo; sigue invirtiendo si tu trabajo es seguro")]] },
    tro: { n: T("Trough", "Fondo"), rows: [
      [T("Output (GDP)", "Producción (PIB)"), T("At the bottom, about to grow", "En el fondo, a punto de crecer")],
      [T("Jobs", "Empleo"), T("Unemployment near its high (it lags)", "El desempleo cerca de su máximo (va atrasado)")],
      [T("The Fed", "La Fed"), T("Rates low", "Tasas bajas")],
      [T("Stocks", "Acciones"), T("Often already recovering", "Muchas veces ya se recuperan")],
      [T("Your move", "Tu jugada"), T("Keep investing; refill the fund when pay returns", "Sigue invirtiendo; rellena el fondo cuando vuelva el sueldo")]] },
  };
  const phaseOf = (t) => {
    const a = ((theta(t) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (Math.abs(a - Math.PI / 2) < 0.45) return "peak";
    if (Math.abs(a - (3 * Math.PI) / 2) < 0.45) return "tro";
    return Math.cos(a) > 0 ? "exp" : "con";
  };
  const tEl = $("#cy-t");
  const drawCy = () => {
    const t = +tEl.value, k = phaseOf(t), dot = $("#cy-dot");
    dot.setAttribute("cx", (W * t) / 100); dot.setAttribute("cy", yAt(t).toFixed(1));
    dot.dataset.k = k;
    $("#cy-phase").textContent = PH[k].n;
    $("#cy-out").innerHTML = PH[k].rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    fillRange(tEl);
  };
  tEl.addEventListener("input", drawCy);
  drawCy();

  // ---------- Play it: name the phase ----------
  const NAMES = { exp: T("Expansion", "Expansión"), peak: T("Peak", "Pico"), con: T("Contraction", "Contracción"), tro: T("Trough", "Fondo") };
  const ROUNDS = shuffle([
    { news: T("Factories add jobs for the 18th month in a row. Unemployment falls to 3.9%.", "Las fábricas suman empleos por mes 18 seguido. El desempleo baja a 3.9%."), a: "exp",
      why: T("Steady hiring and falling unemployment, month after month, is an expansion.", "Contratar sin parar y un desempleo que baja, mes tras mes, es una expansión.") },
    { news: T("Restaurants can't find enough workers. Wages jump 6%, prices rise 5%, and the Fed raises rates again.", "Los restaurantes no encuentran suficientes trabajadores. Los sueldos suben 6%, los precios 5% y la Fed vuelve a subir las tasas.") , a: "peak",
      why: T("Too few workers, fast-rising prices and the Fed cooling things down: the economy is running hot, near the peak.", "Pocos trabajadores, precios que suben rápido y la Fed enfriando la economía: está muy caliente, cerca del pico.") },
    { news: T("GDP shrinks for a second quarter in a row as layoffs spread from factories to stores.", "El PIB se encoge por segundo trimestre seguido y los despidos pasan de las fábricas a las tiendas."), a: "con",
      why: T("Two quarters of shrinking GDP plus spreading layoffs is the rule of thumb for a recession: contraction.", "Dos trimestres de PIB a la baja más despidos que se extienden es la regla práctica de una recesión: contracción.") },
    { news: T("New claims for unemployment benefits finally start to fall, though the unemployment rate is still near its high.", "Las nuevas solicitudes de desempleo por fin empiezan a bajar, aunque la tasa de desempleo sigue cerca de su máximo."), a: "tro",
      why: T("A leading sign is turning up while the lagging unemployment rate is still high: the bottom, the trough.", "Un indicador adelantado mejora mientras el desempleo, que va atrasado, sigue alto: es el fondo.") },
    { news: T("Building permits rise for the fourth month in a row and hiring picks up after a long slump.", "Los permisos de construcción suben por cuarto mes seguido y las contrataciones repuntan después de una larga caída."), a: "exp",
      why: T("Leading signs rising and hiring returning: the recovery has started, a new expansion.", "Indicadores adelantados al alza y vuelven las contrataciones: empezó la recuperación, una nueva expansión.") },
    { news: T("Retail sales drop for three straight months and companies warn of lower profits.", "Las ventas al por menor caen tres meses seguidos y las empresas avisan de menores ganancias."), a: "con",
      why: T("Spending and profits falling month after month: the economy is shrinking.", "El gasto y las ganancias caen mes tras mes: la economía se está encogiendo.") },
    { news: T("The Fed has cut rates to near 0%. The economy is barely shrinking anymore, and stocks are already climbing.", "La Fed bajó las tasas a casi 0%. La economía ya casi no se encoge y las acciones ya están subiendo."), a: "tro",
      why: T("Rates at the floor, shrinking almost over, stocks rising first: the trough, just before growth returns.", "Tasas en el piso, la caída casi termina y las acciones suben primero: el fondo, justo antes de que vuelva el crecimiento.") },
    { news: T("Home prices hit a record and everyone seems to be borrowing to buy. The Fed warns the economy is overheating.", "Los precios de las casas llegan a un récord y todos parecen pedir prestado para comprar. La Fed advierte que la economía se sobrecalienta."), a: "peak",
      why: T("Record prices, heavy borrowing and an overheating warning: signs of the peak.", "Precios récord, mucho endeudamiento y una advertencia de sobrecalentamiento: señales del pico.") },
  ]);
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#np-why"), nextB = $("#np-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#np-round").textContent = T(`Headline ${G.i + 1} of ${N}`, `Titular ${G.i + 1} de ${N}`);
    $("#np-news").textContent = r.news;
    $$("#np-opts .sm-btn").forEach((x) => { x.disabled = false; x.classList.remove("right", "wrong", "alt"); });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next headline", "Siguiente titular")} <span class="arrow">→</span>`;
  };
  $("#np-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#np-opts .sm-btn").forEach((x) => { x.disabled = true; if (x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right:", "Correcto:") : T("Not quite:", "No exactamente:")} ${NAMES[r.a]}.</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#np-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#np-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Cycle reader", "Lector de ciclos") : G.score >= 6 ? T("Sharp eye", "Buen ojo") : T("Review the four phases", "Repasa las cuatro fases")}</b><p>${T("Growing or shrinking? Speeding up or slowing down? Are the leading signs turning?", "¿Crece o se encoge? ¿Acelera o frena? ¿Están cambiando los indicadores adelantados?")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="np-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#np-again").addEventListener("click", () => {
      shuffle(ROUNDS);
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#np-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#np").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Read eight headlines", "Leíste ocho titulares"));
    if (G.score === N) FH.badge("cycle-reader");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "What is the order of the business cycle's phases?", opts: ["Expansion, peak, contraction, trough", "Peak, expansion, trough, contraction", "Contraction, expansion, trough, peak", "Trough, peak, expansion, contraction"], a: 0, why: "The economy grows (expansion), tops out (peak), shrinks (contraction), bottoms out (trough), then grows again." },
    { q: "What's the common rule of thumb for a recession?", opts: ["Two quarters in a row of shrinking real GDP", "One month of falling stock prices", "Inflation above 2%", "Unemployment above 4%"], a: 0, why: "Two quarters of shrinking real GDP is the rule of thumb. Officially, an NBER committee decides." },
    { q: "Which of these is a leading indicator?", opts: ["Building permits for new homes", "The unemployment rate", "Last year's GDP", "Last year's tax refunds"], a: 0, why: "Building permits tend to turn before the economy does. The unemployment rate is lagging: it turns after." },
    { q: "During a recession, what does the Fed usually do?", opts: ["Cut interest rates", "Raise interest rates", "Close banks", "Print a new currency"], a: 0, why: "Cutting rates makes borrowing cheaper, which encourages people and businesses to spend." },
    { q: "In the contraction phase, what usually happens to unemployment?", opts: ["It rises", "It falls", "It stays the same", "It drops to zero"], a: 0, why: "As businesses cut back, layoffs spread and unemployment rises." },
    { q: "Since 1945, how do US expansions and recessions compare in length?", opts: ["Expansions average about 5 years; recessions about 10 months", "Both last about 1 year", "Recessions last longer than expansions", "Each lasts exactly 4 years"], a: 0, why: "Booms usually last much longer than busts, but neither runs on a fixed schedule." },
    { q: "What's the best personal preparation for a recession?", opts: ["An emergency fund built during good times", "Selling all your stocks during the boom", "Taking on more debt at the peak", "Spending every raise"], a: 0, why: "An emergency fund lets you cover a pay cut or job loss without selling investments at low prices." },
    { q: "Your pay drops from $2,400 to $1,800 a month. Your emergency fund is $3,600. How many months can it cover the gap?", opts: ["6 months", "2 months", "1.5 months", "3 months"], a: 0, why: `$2,400 − $1,800 = $600 a month. ${fr("$3,600", "$600")} = 6 months.` },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál es el orden de las fases del ciclo económico?", opts: ["Expansión, pico, contracción, fondo", "Pico, expansión, fondo, contracción", "Contracción, expansión, fondo, pico", "Fondo, pico, expansión, contracción"], a: 0, why: "La economía crece (expansión), llega a su punto más alto (pico), se encoge (contracción), toca fondo (fondo) y vuelve a crecer." },
    { q: "¿Cuál es la regla práctica común para una recesión?", opts: ["Dos trimestres seguidos de PIB real a la baja", "Un mes de caída en las acciones", "Inflación arriba del 2%", "Desempleo arriba del 4%"], a: 0, why: "Dos trimestres de PIB real a la baja es la regla práctica. Oficialmente, decide un comité del NBER." },
    { q: "¿Cuál de estos es un indicador adelantado?", opts: ["Los permisos de construcción de casas nuevas", "La tasa de desempleo", "El PIB del año pasado", "Los reembolsos de impuestos del año pasado"], a: 0, why: "Los permisos de construcción suelen cambiar antes que la economía. La tasa de desempleo va atrasada: cambia después." },
    { q: "Durante una recesión, ¿qué suele hacer la Fed?", opts: ["Bajar las tasas de interés", "Subir las tasas de interés", "Cerrar bancos", "Imprimir una moneda nueva"], a: 0, why: "Bajar las tasas abarata los préstamos, lo que anima a la gente y a las empresas a gastar." },
    { q: "En la fase de contracción, ¿qué suele pasar con el desempleo?", opts: ["Sube", "Baja", "Se queda igual", "Llega a cero"], a: 0, why: "Cuando las empresas recortan, se extienden los despidos y sube el desempleo." },
    { q: "Desde 1945, ¿cómo se comparan en duración las expansiones y recesiones en EE. UU.?", opts: ["Las expansiones duran en promedio unos 5 años; las recesiones unos 10 meses", "Ambas duran cerca de 1 año", "Las recesiones duran más que las expansiones", "Cada una dura exactamente 4 años"], a: 0, why: "Los auges suelen durar mucho más que las caídas, pero ninguno sigue un calendario fijo." },
    { q: "¿Cuál es la mejor preparación personal para una recesión?", opts: ["Un fondo de emergencia armado en los buenos tiempos", "Vender todas tus acciones durante el auge", "Endeudarte más en el pico", "Gastar cada aumento"], a: 0, why: "Un fondo de emergencia te deja cubrir un recorte de sueldo o un despido sin vender inversiones a precios bajos." },
    { q: "Tu sueldo baja de $2,400 a $1,800 al mes. Tu fondo de emergencia es de $3,600. ¿Cuántos meses puede cubrir la diferencia?", opts: ["6 meses", "2 meses", "1.5 meses", "3 meses"], a: 0, why: `$2,400 − $1,800 = $600 al mes. ${fr("$3,600", "$600")} = 6 meses.` },
  ];

  FHLesson.init({ id: LESSON, short: "business-cycle", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
