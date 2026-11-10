// Unit 13, Lesson 2: Picking projects with NPV
(function () {
  const LESSON = "u13-npv";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

  // ---------- See it: the van at any discount rate ----------
  const COST = 10000, CASH = 3000, YEARS = 5;
  const rEl = $("#nv-r");
  const drawNv = () => {
    const r = +rEl.value / 100;
    $("#nv-r-v").textContent = `${rEl.value}%`;
    const x0 = 92, full = 330;
    let g = "", sum = 0;
    for (let y = 1; y <= YEARS; y++) {
      const pv = CASH / Math.pow(1 + r, y), top = 8 + (y - 1) * 44;
      sum += pv;
      g += `<text x="0" y="${top + 23}" class="nv-yr">${T("Year", "Año")} ${y}</text>`;
      g += `<rect x="${x0}" y="${top}" width="${full}" height="32" rx="6" class="nv-ghost"/>`;
      g += `<rect x="${x0}" y="${top}" width="${(full * pv) / CASH}" height="32" rx="6" class="nv-pv"/>`;
      g += `<text x="${x0 + full + 12}" y="${top + 23}" class="nv-num">${usd(pv)}</text>`;
    }
    $("#nv-out").innerHTML = `<svg viewBox="0 0 600 226" class="nv-chart">${g}</svg>`;
    const npv = sum - COST, m = $("#nv-msg");
    const line = `${T("Worth today", "Vale hoy")} ${usd(sum)} − ${T("cost", "costo")} $10,000 = <b>${T("NPV", "VPN")} ${usd(npv)}</b>`;
    if (npv > 0) { m.innerHTML = `${line}. ${T(`Above zero: at ${rEl.value}%, buy the van.`, `Arriba de cero: al ${rEl.value}%, compra la camioneta.`)}`; m.dataset.tone = "good"; }
    else { m.innerHTML = `${line}. ${T(`Below zero: at ${rEl.value}%, the van doesn't earn enough. Skip it.`, `Abajo de cero: al ${rEl.value}%, la camioneta no rinde lo suficiente. No la compres.`)}`; m.dataset.tone = "warn"; }
    fillRange(rEl);
  };
  rEl.addEventListener("input", drawNv);
  drawNv();

  // ---------- Play it: build it or skip it ----------
  const BUILD = T("Build it", "Hazlo"), SKIP = T("Skip it", "No lo hagas");
  const ROUNDS = [
    { facts: [T("Costs $1,000 today", "Cuesta $1,000 hoy"), T("Brings $1,100 in one year", "Trae $1,100 en un año"), T("Discount rate: 10%", "Tasa de descuento: 10%")], q: T("What's the NPV?", "¿Cuál es el VPN?"),
      opts: ["$0", "$100", "−$100", "$1,100"], a: 0,
      why: `${fr("$1,100", "1.10")} = $1,000. $1,000 − $1,000 = $0.` },
    { facts: [T("You'll get $1,210 in 2 years", "Recibirás $1,210 en 2 años"), T("Discount rate: 10%", "Tasa de descuento: 10%")], q: T("What's it worth today?", "¿Cuánto vale hoy?"),
      opts: ["$1,000", "$1,100", "$1,210", "$990"], a: 0,
      why: `${fr("$1,210", "1.21")} = $1,000. ${T("Two years means dividing by 1.10 twice: 1.10 × 1.10 = 1.21.", "Dos años es dividir entre 1.10 dos veces: 1.10 × 1.10 = 1.21.")}` },
    { facts: [T("A food truck looks at a new grill", "Un camión de comida evalúa una parrilla nueva"), T("Its NPV is +$2,500", "Su VPN es +$2,500")], q: T("Build it or skip it?", "¿Lo haces o no?"),
      opts: [BUILD, SKIP], a: 0,
      why: T("NPV above zero means it earns more than the discount rate. Do it.", "Un VPN arriba de cero significa que rinde más que la tasa de descuento. Hazlo.") },
    { facts: [T("A new sign costs $4,000", "Un letrero nuevo cuesta $4,000"), T("It pays back in 2 years", "Se paga solo en 2 años"), T("Its NPV is −$400", "Su VPN es −$400")], q: T("Build it or skip it?", "¿Lo haces o no?"),
      opts: [BUILD, SKIP], a: 1,
      why: T("Fast payback doesn't matter: NPV below zero means it earns less than your rate. Skip it.", "Que se pague rápido no importa: un VPN abajo de cero significa que rinde menos que tu tasa. No lo hagas.") },
    { facts: [T("You can only afford one project", "Solo te alcanza para un proyecto"), T("Project A: NPV $3,000", "Proyecto A: VPN $3,000"), T("Project B: NPV $1,800, pays back faster", "Proyecto B: VPN $1,800, se paga más rápido")], q: T("Which one?", "¿Cuál eliges?"),
      opts: ["A", "B", T("Neither", "Ninguno")], a: 0,
      why: T("When you can only do one, pick the higher NPV: A adds $1,200 more value.", "Cuando solo puedes hacer uno, elige el VPN más alto: A suma $1,200 más de valor.") },
    { facts: [T("A project's NPV is $5,000 at an 8% rate", "El VPN de un proyecto es $5,000 con una tasa de 8%"), T("The rate rises to 12%", "La tasa sube a 12%")], q: T("What happens to the NPV?", "¿Qué pasa con el VPN?"),
      opts: [T("It goes down", "Baja"), T("It goes up", "Sube"), T("It stays the same", "Sigue igual")], a: 0,
      why: T("A higher rate shrinks every future dollar more, so the present value and the NPV fall.", "Una tasa más alta achica más cada dólar futuro, así que el valor presente y el VPN bajan.") },
    { facts: [T("A project's IRR is 14%", "La TIR de un proyecto es 14%"), T("Your discount rate is 10%", "Tu tasa de descuento es 10%")], q: T("Build it or skip it?", "¿Lo haces o no?"),
      opts: [BUILD, SKIP], a: 0,
      why: T("The IRR beats your rate, so the NPV at 10% is above zero. Do it.", "La TIR le gana a tu tasa, así que el VPN al 10% está arriba de cero. Hazlo.") },
    { facts: [T("A machine costs $9,000", "Una máquina cuesta $9,000"), T("It brings $3,000 a year", "Trae $3,000 al año")], q: T("What's the payback period?", "¿Cuál es el periodo de recuperación?"),
      opts: [T("3 years", "3 años"), T("2 years", "2 años"), T("4 years", "4 años"), T("9 years", "9 años")], a: 0,
      why: `${fr("$9,000", "$3,000")} = 3 ${T("years.", "años.")}` },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#np-why"), nextB = $("#np-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#np-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#np-q").textContent = r.q;
    $("#np-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#np-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#np-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#np-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#np-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
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
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Value creator", "Creas valor") : G.score >= 6 ? T("Ready for the CFO", "Listo para el director financiero") : T("Review the NPV rule", "Repasa la regla del VPN")}</b><p>${T("Bring every future dollar back to today, subtract the cost, and build only when NPV is above zero.", "Trae cada dólar futuro a hoy, resta el costo y solo hazlo cuando el VPN esté arriba de cero.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="np-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#np-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#np-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#np").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Judged eight projects", "Evaluaste ocho proyectos"));
    if (G.score === N) FH.badge("value-creator");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is a project's net present value (NPV)?", opts: ["The present value of its future cash flows minus its cost today", "Its total cash flows added up", "Its yearly profit", "How many years it takes to pay back"], a: 0, why: "NPV brings every future dollar back to today's dollars, then subtracts what you pay today." },
    { q: "A project costs $2,000 today and pays $2,200 in one year. At a 10% discount rate, what is its NPV?", opts: ["$0", "$200", "$2,200", "−$200"], a: 0, why: `${fr("$2,200", "1.10")} = $2,000. $2,000 − $2,000 = $0.` },
    { q: "Under the NPV rule, when should a company accept a project?", opts: ["When its NPV is above zero", "When its payback is under 5 years", "When its total cash is above its cost", "Whenever it has the money"], a: 0, why: "An NPV above zero means the project earns more than the discount rate and adds value." },
    { q: "What is a project's internal rate of return (IRR)?", opts: ["The discount rate that makes its NPV exactly zero", "The interest rate on a bank loan", "Its profit divided by its revenue", "The rate the government sets"], a: 0, why: "The IRR is the yearly return the project earns. If it beats your discount rate, the NPV is above zero." },
    { q: "A company raises its discount rate from 8% to 12%. What happens to a project's NPV?", opts: ["It falls", "It rises", "It stays the same", "It becomes the IRR"], a: 0, why: "A higher rate shrinks every future dollar more, so the present value, and the NPV, go down." },
    { q: "What is a weakness of the payback period?", opts: ["It ignores the time value of money and cash after payback", "It's too hard to calculate", "It always picks the higher NPV", "It uses profit instead of revenue"], a: 0, why: "Payback treats a dollar in year 3 like a dollar today and ignores everything after the cost is earned back." },
    { q: "A company can afford only one of two projects. Project X has an NPV of $40,000; Project Y has an NPV of $25,000 and a shorter payback. Which should it choose?", opts: ["Project X", "Project Y", "Neither", "Both"], a: 0, why: "When projects compete for the same money, pick the higher NPV: X adds $15,000 more value." },
    { q: "A machine costs $12,000 and brings $4,000 of cash a year. What is its payback period?", opts: ["3 years", "4 years", "2 years", "12 years"], a: 0, why: `${fr("$12,000", "$4,000")} = 3 years.` },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es el valor presente neto (VPN) de un proyecto?", opts: ["El valor presente de sus flujos de efectivo futuros menos su costo hoy", "La suma de todos sus flujos de efectivo", "Su ganancia anual", "Cuántos años tarda en pagarse"], a: 0, why: "El VPN trae cada dólar futuro a dólares de hoy y luego resta lo que pagas hoy." },
    { q: "Un proyecto cuesta $2,000 hoy y paga $2,200 en un año. Con una tasa de descuento de 10%, ¿cuál es su VPN?", opts: ["$0", "$200", "$2,200", "−$200"], a: 0, why: `${fr("$2,200", "1.10")} = $2,000. $2,000 − $2,000 = $0.` },
    { q: "Según la regla del VPN, ¿cuándo debe una empresa aceptar un proyecto?", opts: ["Cuando su VPN está arriba de cero", "Cuando se paga en menos de 5 años", "Cuando su efectivo total supera su costo", "Siempre que tenga el dinero"], a: 0, why: "Un VPN arriba de cero significa que el proyecto rinde más que la tasa de descuento y suma valor." },
    { q: "¿Qué es la tasa interna de retorno (TIR) de un proyecto?", opts: ["La tasa de descuento que hace su VPN exactamente cero", "La tasa de interés de un préstamo bancario", "Su ganancia dividida entre sus ingresos", "La tasa que fija el gobierno"], a: 0, why: "La TIR es el rendimiento anual del proyecto. Si le gana a tu tasa de descuento, el VPN está arriba de cero." },
    { q: "Una empresa sube su tasa de descuento de 8% a 12%. ¿Qué pasa con el VPN de un proyecto?", opts: ["Baja", "Sube", "Sigue igual", "Se vuelve la TIR"], a: 0, why: "Una tasa más alta achica más cada dólar futuro, así que el valor presente, y el VPN, bajan." },
    { q: "¿Cuál es una debilidad del periodo de recuperación?", opts: ["Ignora el valor del dinero en el tiempo y el efectivo después de recuperar la inversión", "Es muy difícil de calcular", "Siempre elige el VPN más alto", "Usa la ganancia en vez de los ingresos"], a: 0, why: "Trata un dólar del año 3 igual que un dólar de hoy e ignora todo lo que llega después de recuperar el costo." },
    { q: "Una empresa solo puede pagar uno de dos proyectos. El proyecto X tiene un VPN de $40,000; el Y tiene un VPN de $25,000 y se paga más rápido. ¿Cuál debe elegir?", opts: ["El proyecto X", "El proyecto Y", "Ninguno", "Los dos"], a: 0, why: "Cuando los proyectos compiten por el mismo dinero, elige el VPN más alto: X suma $15,000 más de valor." },
    { q: "Una máquina cuesta $12,000 y trae $4,000 de efectivo al año. ¿Cuál es su periodo de recuperación?", opts: ["3 años", "4 años", "2 años", "12 años"], a: 0, why: `${fr("$12,000", "$4,000")} = 3 años.` },
  ];

  FHLesson.init({ id: LESSON, short: "npv", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
