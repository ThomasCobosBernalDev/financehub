// Unit 3, Lesson 2: Build an emergency fund
(function () {
  const LESSON = "u3-emergency-fund";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
  const one = (x) => (Math.round(x * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });

  // ---------- See it: fund planner ----------
  const needsEl = $("#ef-needs"), saveEl = $("#ef-save");
  let months = 3;
  const draw = () => {
    const needs = +needsEl.value, save = +saveEl.value, goal = needs * months;
    $("#ef-needs-v").textContent = usd(needs);
    $("#ef-save-v").textContent = usd(save);
    const toGoal = goal / save, to400 = 400 / save, full = Math.ceil(toGoal - 1e-9);
    const shown = Math.min(full, 24);
    $("#ef-months").innerHTML = Array.from({ length: shown }, (_, i) => {
      const amt = Math.min(goal, save * (i + 1));
      return `<i style="--h:${(100 * amt / goal).toFixed(1)}%;--i:${Math.min(i, 20)}" title="${T(`Month ${i + 1}`, `Mes ${i + 1}`)}: ${usd(amt)}"></i>`;
    }).join("") + (full > 24 ? `<span>+${full - 24}</span>` : "");
    // Watch the jar fill: one beat per month of saving.
    const w = $("#ef-water");
    w.style.transition = "none"; w.style.height = FH.still() ? "100%" : "0%";
    if (!FH.still())
    requestAnimationFrame(() => requestAnimationFrame(() => { w.style.transition = `height ${Math.min(3, full * 0.15).toFixed(2)}s linear`; w.style.height = "100%"; }));
    $("#ef-mark").style.bottom = `${Math.min(100, (100 * 400) / goal)}%`;
    $("#ef-jar-t").innerHTML = `<b>${usd(goal)}</b><small>${T(`${months} months of needs`, `${months} meses de necesidades`)}</small>`;
    $("#ef-msg").innerHTML = T(
      `Goal: ${usd(needs)} × ${months} = <b>${usd(goal)}</b>. Saving ${usd(save)} a month, you pass the $400 first goal in <b>${one(to400)}</b> months and reach the full fund in <b>${one(toGoal)}</b> months. When it's full, it pays your needs for <b>${months} months</b> with no paycheck.`,
      `Meta: ${usd(needs)} × ${months} = <b>${usd(goal)}</b>. Ahorrando ${usd(save)} al mes, pasas la primera meta de $400 en <b>${one(to400)}</b> meses y llenas el fondo en <b>${one(toGoal)}</b> meses. Ya lleno, paga tus necesidades por <b>${months} meses</b> sin sueldo.`);
    $("#ef-msg").dataset.tone = "good";
    fillRange(needsEl); fillRange(saveEl);
  };
  needsEl.addEventListener("input", draw);
  saveEl.addEventListener("input", draw);
  $$("#ef-m .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#ef-m .chip").forEach((x) => x.classList.toggle("on", x === c));
    months = +c.dataset.v; draw();
  }));
  draw();

  // ---------- Play it: rainy day ----------
  const START = 3600;
  const ROUNDS = [
    { cost: 450, use: 1, what: T("Your car won't start. The repair shop says it will cost <b>$450</b>. You need the car to get to work.", "Tu carro no arranca. El taller dice que la reparación cuesta <b>$450</b>. Necesitas el carro para ir al trabajo."),
      why: T("Needed (you drive to work), urgent (it broke today) and unexpected. That's exactly what the fund is for.", "Necesario (manejas al trabajo), urgente (se descompuso hoy) e inesperado. Para eso es el fondo.") },
    { cost: 150, use: 0, what: T("Your favorite band announces a concert. Tickets cost <b>$150</b> and go on sale tomorrow.", "Tu banda favorita anuncia un concierto. Los boletos cuestan <b>$150</b> y salen a la venta mañana."),
      why: T("Fun, but not needed. Pay for it from your wants money, or skip it.", "Divertido, pero no necesario. Págalo con tu dinero para gustos, o no vayas.") },
    { cost: 300, use: 1, what: T("You fall and hurt your wrist. The urgent care bill is <b>$300</b> after insurance.", "Te caes y te lastimas la muñeca. La cuenta de la clínica es de <b>$300</b> después del seguro."),
      why: T("A medical bill you didn't plan for is a real emergency.", "Una cuenta médica que no planeaste es una emergencia de verdad.") },
    { cost: 800, use: 0, what: T("Your phone screen cracked, but the phone still works fine. A new phone costs <b>$800</b>.", "La pantalla de tu teléfono se estrelló, pero sigue funcionando bien. Uno nuevo cuesta <b>$800</b>."),
      why: T("It still works, so it isn't needed or urgent. Save up for a new one in your budget.", "Todavía funciona, así que no es necesario ni urgente. Ahorra para uno nuevo en tu presupuesto.") },
    { cost: 600, use: 0, what: T("Your car insurance bill of <b>$600</b> is due. It comes every six months, on the same date.", "Llega tu cuenta del seguro del carro de <b>$600</b>. Llega cada seis meses, en la misma fecha."),
      why: T("You knew it was coming, so it isn't unexpected. Save $100 a month in your budget for it.", "Sabías que venía, así que no es inesperada. Aparta $100 al mes en tu presupuesto para pagarla.") },
    { cost: 1200, use: 1, what: T("The bike shop closes for a month to remodel, so you get no paycheck. You still need <b>$1,200</b> for rent, food, gas and phone.", "La tienda de bicicletas cierra un mes para remodelar, así que no te pagan. Igual necesitas <b>$1,200</b> para renta, comida, gasolina y teléfono."),
      why: T("Losing your income is the biggest reason the fund exists. One month of needs is $1,200.", "Quedarte sin ingreso es la razón más grande para tener el fondo. Un mes de necesidades son $1,200.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, bal: START };
  const whyEl = $("#rd-why"), nextB = $("#rd-next");
  const paint = () => {
    $("#rd-bal").textContent = usd(G.bal);
    $("#rd-water").style.height = `${(100 * G.bal) / START}%`;
  };
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#rd-round").textContent = T(`Surprise ${G.i + 1} of ${N}`, `Sorpresa ${G.i + 1} de ${N}`);
    $("#rd-card").innerHTML = `<p>${r.what}</p>`;
    $$(".rd-pick").forEach((b) => { b.disabled = false; b.className = "fd-opt rd-pick"; });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next surprise", "Siguiente sorpresa")} <span class="arrow">→</span>`;
    paint();
  };
  $$(".rd-pick").forEach((b) => b.addEventListener("click", () => {
    if (G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.v === r.use;
    if (ok) G.score++;
    if (r.use) G.bal -= r.cost;
    $$(".rd-pick").forEach((x) => { x.disabled = true; if (+x.dataset.v === r.use) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    const after = r.use ? T(` The fund pays ${usd(r.cost)}: ${usd(G.bal + r.cost)} − ${usd(r.cost)} = ${usd(G.bal)} left.`, ` El fondo paga ${usd(r.cost)}: ${usd(G.bal + r.cost)} − ${usd(r.cost)} = ${usd(G.bal)} quedan.`) : T(" The fund stays the same.", " El fondo se queda igual.");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}${after}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    paint();
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  }));
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const used = START - G.bal, refill = used / 480;
    const res = $("#rd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Rainy-day ready", "Listo para la lluvia") : G.score >= 4 ? T("Good instincts", "Buen instinto") : T("Use the test: needed, urgent, unexpected", "Usa la prueba: necesario, urgente, inesperado")}</b><p>${T(`The fund paid ${usd(used)} of real emergencies and ${usd(G.bal)} is left. Saving $480 a month, refilling takes`, `El fondo pagó ${usd(used)} de emergencias reales y quedan ${usd(G.bal)}. Ahorrando $480 al mes, rellenarlo toma`)} <span class="frac"><span>${usd(used)}</span><span>$480</span></span> = ${one(refill)} ${T("months.", "meses.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="rd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#rd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, bal: START });
      res.classList.add("hidden");
      start();
      $("#rd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Got through a rainy year", "Pasaste un año lluvioso"));
    if (G.score === N) FH.badge("rainy-day");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const fr = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "What is an emergency fund for?", opts: ["Surprises that are needed, urgent and unexpected", "Anything you want to buy soon", "Investing in stocks", "Bills you know are coming, like insurance"], a: 0, why: "It's only for real surprises. Planned bills, like car insurance every six months, go in your budget instead." },
    { q: "Your monthly needs are $1,200. How big is a three-month emergency fund?", opts: ["$3,600", "$1,200", "$7,200", "$2,400"], a: 0, why: "Goal = needs × months: $1,200 × 3 = $3,600. $7,200 would be six months." },
    { q: "Your pay changes a lot from month to month. Your needs are $1,200 a month. What goal fits best?", opts: ["Six months: $7,200", "Three months: $3,600", "One month: $1,200", "No fund, since pay changes anyway"], a: 0, why: "Uneven pay is a reason to aim for six months: $1,200 × 6 = $7,200." },
    { q: "You have $0 saved, your goal is $3,600, and you save $480 a month. How long until the fund is full?", opts: ["7.5 months", "3 months", "4.8 months", "12 months"], a: 0, why: `Months = ${fr("goal − what you have", "saved per month")} = ${fr("$3,600 − $0", "$480")} = 7.5 months.` },
    { q: "Which of these is a reason to use your emergency fund?", opts: ["Your car breaks and you need it to get to work", "Concert tickets go on sale tomorrow", "Your car insurance bill comes, like every six months", "A new phone, though yours still works"], a: 0, why: "Only the car repair is needed, urgent and unexpected. The insurance bill is planned, and the others aren't needed." },
    { q: "Where is the best place to keep an emergency fund?", opts: ["A separate, FDIC-insured savings account", "Your checking account with your bill money", "Stocks, so it grows faster", "Cash hidden at home"], a: 0, why: "A separate savings account is safe, easy to reach and hard to spend by accident. Stocks can drop right when you need the money." },
    { q: "Your fund holds $3,600 and your needs are $1,200 a month. If your paycheck stopped, how long would the fund last?", opts: ["3 months", "1 month", "6 months", "36 months"], a: 0, why: `Runway = ${fr("fund", "monthly needs")} = ${fr("$3,600", "$1,200")} = 3 months.` },
    { q: "You used $450 from your fund for a repair. You save $480 a month. About how long to refill it?", opts: ["About 1 month", "About 4 months", "7.5 months", "You don't need to refill it"], a: 0, why: `Months to refill = ${fr("amount used", "saved per month")} = ${fr("$450", "$480")} = 0.94, about 1 month.` },
  ];
  const QUIZ_ES = [
    { q: "¿Para qué es un fondo de emergencia?", opts: ["Para sorpresas necesarias, urgentes e inesperadas", "Para cualquier cosa que quieras comprar pronto", "Para invertir en acciones", "Para cuentas que sabes que vienen, como el seguro"], a: 0, why: "Es solo para sorpresas de verdad. Las cuentas planeadas, como el seguro del carro cada seis meses, van en tu presupuesto." },
    { q: "Tus necesidades del mes son $1,200. ¿De qué tamaño es un fondo de tres meses?", opts: ["$3,600", "$1,200", "$7,200", "$2,400"], a: 0, why: "Meta = necesidades × meses: $1,200 × 3 = $3,600. $7,200 serían seis meses." },
    { q: "Tu sueldo cambia mucho de un mes a otro. Tus necesidades son $1,200 al mes. ¿Qué meta te conviene?", opts: ["Seis meses: $7,200", "Tres meses: $3,600", "Un mes: $1,200", "Ningún fondo, si igual tu sueldo cambia"], a: 0, why: "Un sueldo disparejo es razón para apuntar a seis meses: $1,200 × 6 = $7,200." },
    { q: "Tienes $0 ahorrados, tu meta es $3,600 y ahorras $480 al mes. ¿Cuánto tardas en llenar el fondo?", opts: ["7.5 meses", "3 meses", "4.8 meses", "12 meses"], a: 0, why: `Meses = ${fr("meta − lo que tienes", "ahorro al mes")} = ${fr("$3,600 − $0", "$480")} = 7.5 meses.` },
    { q: "¿Cuál de estas es una razón para usar tu fondo de emergencia?", opts: ["Se descompone tu carro y lo necesitas para ir al trabajo", "Los boletos de un concierto salen a la venta mañana", "Llega la cuenta del seguro del carro, como cada seis meses", "Un teléfono nuevo, aunque el tuyo funciona"], a: 0, why: "Solo la reparación del carro es necesaria, urgente e inesperada. El seguro es una cuenta planeada y lo demás no es necesario." },
    { q: "¿Dónde conviene guardar un fondo de emergencia?", opts: ["En una cuenta de ahorro aparte, asegurada por la FDIC", "En tu cuenta de cheques junto con el dinero de las cuentas", "En acciones, para que crezca más rápido", "En efectivo escondido en casa"], a: 0, why: "Una cuenta de ahorro aparte es segura, fácil de usar y difícil de gastar sin querer. Las acciones pueden bajar justo cuando necesitas el dinero." },
    { q: "Tu fondo tiene $3,600 y tus necesidades son $1,200 al mes. Si dejaras de recibir sueldo, ¿cuánto te duraría?", opts: ["3 meses", "1 mes", "6 meses", "36 meses"], a: 0, why: `Margen = ${fr("fondo", "necesidades al mes")} = ${fr("$3,600", "$1,200")} = 3 meses.` },
    { q: "Usaste $450 de tu fondo para una reparación. Ahorras $480 al mes. ¿Cuánto tardas más o menos en rellenarlo?", opts: ["Cerca de 1 mes", "Cerca de 4 meses", "7.5 meses", "No hace falta rellenarlo"], a: 0, why: `Meses para rellenar = ${fr("lo que usaste", "ahorro al mes")} = ${fr("$450", "$480")} = 0.94, cerca de 1 mes.` },
  ];

  FHLesson.init({ id: LESSON, short: "emergency-fund", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
