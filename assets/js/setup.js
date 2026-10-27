// Setup page (start/): language, learning styles, goals, level and a quick placement check.
// Shared by the English and Spanish pages; text comes from FH.t.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const T = FH.t;
  const prof = FH.state.profile || {};
  let goals = new Set(prof.goals || []);
  let level = prof.level || null;
  let known = {};

  // ---------- Steps ----------
  const steps = [...document.querySelectorAll(".step")];
  const show = (id) => {
    steps.forEach((s) => (s.hidden = s.dataset.step !== String(id)));
    const n = id === "quiz" ? 3 : Number(id);
    document.querySelectorAll(".setup-steps li").forEach((li) => {
      li.classList.toggle("on", Number(li.dataset.for) === n);
      li.classList.toggle("done", Number(li.dataset.for) < n);
    });
    scrollTo({ top: 0, behavior: "smooth" });
  };
  let at = 0;
  // ---------- Step 1: language ----------
  // Picking the other language reopens this page in it, on the next step.
  document.querySelectorAll("[data-lang-pick]").forEach((b) => {
    b.classList.toggle("on", b.dataset.langPick === FH.lang && !!FH.state.lang);
    b.addEventListener("click", () => {
      const lang = b.dataset.langPick;
      if (lang !== FH.lang) { location.hash = "styles"; FH.setLang(lang); return; }
      FH.setLang(lang, false);
      show(++at);
    });
  });
  document.querySelectorAll("[data-next]").forEach((b) => b.addEventListener("click", () => { saveName(); show(++at); }));
  document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => show(--at)));

  // ---------- Step 2: styles (and a username for new accounts) ----------
  const grid = $("#lp-grid");
  FH.STYLES.forEach((st) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "lp-card"; b.dataset.id = st.id; b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg><b>${st.label}</b><small>${st.desc}</small><i class="tick" aria-hidden="true"></i>`;
    b.addEventListener("click", () => {
      const cur = new Set(FH.state.styles || []);
      cur.has(st.id) ? cur.delete(st.id) : cur.add(st.id);
      FH.setStyles([...cur]);
    });
    grid.appendChild(b);
  });
  const paintStyles = () => {
    const picks = FH.state.styles || [];
    grid.querySelectorAll(".lp-card").forEach((b) => { const on = picks.includes(b.dataset.id); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    const all = picks.length === FH.STYLES.length;
    $("#lp-all").textContent = all ? T("Clear all", "Quitar todos") : T("Select all", "Elegir todos");
    $("#lp-status").textContent = !picks.length ? T("Nothing picked yet, so lessons show every part.", "Todavía no eliges nada, así que las lecciones muestran todas las partes.") : all ? T("All eight. Lessons show every part.", "Los ocho. Las lecciones muestran todas las partes.") : T(`${picks.length} picked.`, `${picks.length} elegidos.`);
  };
  $("#lp-all").addEventListener("click", () => FH.setStyles((FH.state.styles || []).length === FH.STYLES.length ? null : FH.STYLES.map((x) => x.id)));
  document.addEventListener("fh:save", paintStyles);
  paintStyles();

  const nameAsk = $("#name-ask"), nameIn = $("#setup-name");
  if (window.FHAuth) FHAuth.onChange((u) => { nameAsk.hidden = !u || !!(u.user_metadata || {}).username; });
  const saveName = () => {
    const v = nameIn.value.trim();
    if (nameAsk.hidden || !v || !/^[A-Za-z0-9_.]{3,20}$/.test(v)) return;
    FHAuth.setUsername(v).then(() => { nameAsk.hidden = true; });
  };

  // ---------- Step 3: goals ----------
  const ICON = {
    money: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.6 0-2.6.8-2.6 2s1 1.7 2.6 2c1.6.3 2.6.8 2.6 2s-1 2-2.6 2c-1.2 0-2.1-.5-2.6-1.3M12 6.5v11"/>',
    invest: '<path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/>',
    business: '<path d="M4 9h16l-1.5-4h-13zM5 9v10h14V9M10 19v-5h4v5"/>',
    career: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4.5c1.4 1.3 3 2 5 2s3.6-.7 5-2V11M21 9v5"/>',
  };
  const gg = $("#goal-grid");
  FH.GOALS.forEach((g) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "goal-card"; b.dataset.id = g.id;
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[g.id]}</svg><b>${g.label}</b><small>${g.desc}</small><span class="units">${T(`${g.units.length} of 15 units`, `${g.units.length} de 15 unidades`)}</span><i class="tick" aria-hidden="true"></i>`;
    b.addEventListener("click", () => { goals.has(g.id) ? goals.delete(g.id) : goals.add(g.id); paintGoals(); });
    gg.appendChild(b);
  });
  const paintGoals = () => {
    gg.querySelectorAll(".goal-card").forEach((b) => { const on = goals.has(b.dataset.id); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    $("#goal-next").disabled = !goals.size;
  };
  paintGoals();

  // ---------- Step 4: level ----------
  const LEVELS = [
    { id: "new", label: T("Brand new", "Desde cero"), desc: T("Start from the very beginning.", "Empezar desde el principio.") },
    { id: "basics", label: T("I know the basics", "Sé lo básico"), desc: T("Budgets and bank accounts make sense to me.", "Entiendo los presupuestos y las cuentas de banco.") },
    { id: "confident", label: T("Pretty confident", "Bastante seguro"), desc: T("I've taken a class or I invest already.", "Ya tomé una clase o ya invierto.") },
    { id: "unsure", label: T("Not sure", "No estoy seguro"), desc: T("Give me the quick check to find out.", "Dame la prueba rápida para saberlo.") },
  ];
  const lg = $("#level-grid");
  LEVELS.forEach((l, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "level-card"; b.dataset.id = l.id;
    b.innerHTML = `<span class="bars" aria-hidden="true">${[0, 1, 2].map((k) => `<i class="${l.id === "unsure" ? "q" : k <= i ? "f" : ""}"></i>`).join("")}</span><b>${l.label}</b><small>${l.desc}</small>`;
    b.addEventListener("click", () => { level = l.id; paintLevel(); });
    lg.appendChild(b);
  });
  const paintLevel = () => {
    lg.querySelectorAll(".level-card").forEach((b) => { const on = b.dataset.id === level; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    $("#level-next").disabled = !level;
    $("#level-next").firstChild.textContent = level && level !== "new" ? T("Start the quick check ", "Empezar la prueba rápida ") : T("Next ", "Siguiente ");
  };
  paintLevel();
  $("#level-next").addEventListener("click", () => {
    if (level === "new") { known = {}; finish(); } else startQuiz();
  });

  // ---------- Quick check: one question per unit on the learner's path ----------
  const QS_EN = [
    { unit: 1, q: "A bike shop raises its price and sells fewer bikes. Which idea explains that?", a: ["The law of demand", "Inflation", "Opportunity cost", "Compound interest"] },
    { unit: 2, q: "You invest $1,000 at 10% a year and leave the interest in. How much do you have after 2 years?", a: ["$1,210", "$1,200", "$1,100", "$2,000"] },
    { unit: 3, q: "You're in the 22% federal tax bracket. Roughly what share of your income goes to federal income tax?", a: ["Less than 22%, because only income above a cutoff is taxed at 22%", "Exactly 22% of everything you earn", "More than 22%, once you add the bracket below", "None until you earn $100,000"] },
    { unit: 4, q: "In a 50/30/20 budget, what is the 20% for?", a: ["Saving and paying down debt", "Rent and bills", "Fun money", "Taxes"] },
    { unit: 5, q: "What has the biggest effect on a FICO credit score?", a: ["Paying every bill on time", "How much money you earn", "How many cards you've closed", "Checking your own score"] },
    { unit: 6, q: "Your car insurance has a $500 deductible. What does that mean?", a: ["You pay the first $500 of a claim, then insurance pays", "Insurance costs $500 a year", "Insurance pays at most $500", "You get $500 back if you don't crash"] },
    { unit: 7, q: "What's the main reason people buy an index fund instead of a single stock?", a: ["It spreads your money across many companies, so one crash hurts less", "It always beats the market", "It's guaranteed by the government", "It pays a fixed interest rate"] },
    { unit: 8, q: "Compared with a 15-year mortgage, a 30-year mortgage for the same house usually has…", a: ["A lower monthly payment but more interest in total", "A higher monthly payment and less interest", "The same total cost", "No interest for the first 15 years"] },
    { unit: 9, q: "A business breaks even when…", a: ["Its revenue covers all of its costs", "It sells its first product", "It has more cash than debt", "Its prices match competitors"] },
    { unit: 10, q: "Finish the accounting equation: Assets = …", a: ["Liabilities + equity", "Revenue − expenses", "Cash + inventory", "Equity − liabilities"] },
    { unit: 11, q: "A project has a positive net present value (NPV). What does that tell you?", a: ["It's expected to earn more than its cost of capital", "It will be profitable in year one", "It pays for itself in under a year", "It has no risk"] },
    { unit: 12, q: "Diversifying a portfolio mainly reduces which kind of risk?", a: ["Risk tied to one company", "Risk of the whole market falling", "Inflation risk", "Interest rate risk"] },
    { unit: 13, q: "Enterprise value is equity value plus debt, minus…", a: ["Cash", "Revenue", "Dividends", "Taxes"] },
    { unit: 14, q: "When interest rates rise, prices of existing bonds usually…", a: ["Fall", "Rise", "Stay the same", "Double"] },
  ];
  const QS_ES = [
    { unit: 1, q: "Una tienda de bicicletas sube su precio y vende menos bicicletas. ¿Qué idea lo explica?", a: ["La ley de la demanda", "La inflación", "El costo de oportunidad", "El interés compuesto"] },
    { unit: 2, q: "Inviertes $1,000 al 10% anual y dejas que los intereses se queden. ¿Cuánto tienes después de 2 años?", a: ["$1,210", "$1,200", "$1,100", "$2,000"] },
    { unit: 3, q: "Estás en la categoría federal de impuestos del 22%. ¿Más o menos qué parte de tu ingreso se va en impuesto federal sobre la renta?", a: ["Menos del 22%, porque solo el ingreso arriba de cierto límite paga 22%", "Exactamente el 22% de todo lo que ganas", "Más del 22%, al sumar la categoría de abajo", "Nada hasta que ganas $100,000"] },
    { unit: 4, q: "En un presupuesto 50/30/20, ¿para qué es el 20%?", a: ["Ahorrar y pagar deudas", "Renta y cuentas", "Dinero para diversión", "Impuestos"] },
    { unit: 5, q: "¿Qué afecta más tu puntaje de crédito FICO?", a: ["Pagar cada cuenta a tiempo", "Cuánto dinero ganas", "Cuántas tarjetas has cerrado", "Revisar tu propio puntaje"] },
    { unit: 6, q: "Tu seguro de auto tiene un deducible de $500. ¿Qué significa?", a: ["Tú pagas los primeros $500 de un reclamo y luego paga el seguro", "El seguro cuesta $500 al año", "El seguro paga como máximo $500", "Te devuelven $500 si no chocas"] },
    { unit: 7, q: "¿Cuál es la razón principal para comprar un fondo indexado en vez de una sola acción?", a: ["Reparte tu dinero entre muchas empresas, así que si una se cae te afecta menos", "Siempre le gana al mercado", "Lo garantiza el gobierno", "Paga una tasa de interés fija"] },
    { unit: 8, q: "Comparada con una hipoteca a 15 años, una hipoteca a 30 años para la misma casa normalmente tiene…", a: ["Un pago mensual más bajo, pero más intereses en total", "Un pago mensual más alto y menos intereses", "El mismo costo total", "Cero intereses los primeros 15 años"] },
    { unit: 9, q: "Un negocio llega a su punto de equilibrio cuando…", a: ["Sus ventas cubren todos sus costos", "Vende su primer producto", "Tiene más efectivo que deudas", "Sus precios igualan a la competencia"] },
    { unit: 10, q: "Completa la ecuación contable: Activos = …", a: ["Pasivos + capital", "Ingresos − gastos", "Efectivo + inventario", "Capital − pasivos"] },
    { unit: 11, q: "Un proyecto tiene un valor presente neto (VPN) positivo. ¿Qué te dice eso?", a: ["Se espera que gane más que su costo de capital", "Dará ganancias el primer año", "Se paga solo en menos de un año", "No tiene riesgo"] },
    { unit: 12, q: "Diversificar un portafolio reduce sobre todo, ¿qué tipo de riesgo?", a: ["El riesgo ligado a una sola empresa", "El riesgo de que caiga todo el mercado", "El riesgo de inflación", "El riesgo de tasas de interés"] },
    { unit: 13, q: "El valor empresarial es el valor del capital más la deuda, menos…", a: ["El efectivo", "Los ingresos", "Los dividendos", "Los impuestos"] },
    { unit: 14, q: "Cuando suben las tasas de interés, el precio de los bonos que ya existen normalmente…", a: ["Baja", "Sube", "Se queda igual", "Se duplica"] },
  ];
  const QS = FH.lang === "es" ? QS_ES : QS_EN;
  let qs = [], qi = 0;
  const startQuiz = () => {
    const on = FH.path.on, gset = goals;
    const units = new Set(FH.GOALS.filter((g) => gset.has(g.id)).flatMap((g) => g.units));
    qs = QS.filter((q) => (units.size ? units : on).has(q.unit));
    qi = 0; known = {};
    show("quiz"); askQ();
  };
  const askQ = () => {
    if (qi >= qs.length) return finish();
    const q = qs[qi];
    $("#q-count").textContent = T(`Quick check · ${qi + 1} of ${qs.length}`, `Prueba rápida · ${qi + 1} de ${qs.length}`);
    $("#q-bar").style.width = `${(qi / qs.length) * 100}%`;
    $("#q-unit").textContent = `${T("Unit", "Unidad")} ${q.unit} · ${FH.UNIT_NAMES[q.unit - 1]}`;
    $("#q-stem").textContent = q.q;
    const box = $("#q-opts"); box.innerHTML = "";
    const order = q.a.map((t, i) => ({ t, ok: i === 0 })).sort(() => Math.random() - 0.5);
    order.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "q-opt"; b.textContent = o.t;
      b.addEventListener("click", () => {
        box.querySelectorAll("button").forEach((x) => (x.disabled = true));
        b.classList.add(o.ok ? "right" : "wrong");
        if (!o.ok) [...box.children][order.findIndex((x) => x.ok)].classList.add("right");
        if (o.ok) known[q.unit] = true;
        setTimeout(() => { qi++; askQ(); }, o.ok ? 650 : 1300);
      });
      box.appendChild(b);
    });
  };
  $("#q-idk").addEventListener("click", () => { qi++; askQ(); });
  $("#q-skip").addEventListener("click", () => {
    // No check: lean on what they told us.
    known = level === "confident" ? { 1: true, 2: true, 4: true } : level === "basics" ? { 1: true } : {};
    finish(true);
  });

  // ---------- Result ----------
  const finish = (skipped) => {
    FH.setProfile({ goals: [...goals], level, known, quiz: qs.length && !skipped ? { right: Object.keys(known).length, of: qs.length } : null, done: true });
    paintPath();
    at = 4; show(4);
  };
  const paintPath = () => {
    const { on, known: kn } = FH.path;
    const p = FH.state.profile;
    const list = $("#my-path"); list.innerHTML = "";
    let todo = 0;
    FH.UNIT_NAMES.forEach((name, i) => {
      const u = i + 1;
      if (!on.has(u)) return;
      const k = kn.has(u);
      if (!k) todo++;
      const open = FH.OPEN.filter((l) => l.unit === u).length;
      const li = document.createElement("li");
      li.className = k ? "known" : "";
      li.innerHTML = `<span class="n">${u}</span><b>${name}</b><small>${k ? T("You know this. It's there to review.", "Ya lo sabes. Está ahí para repasar.") : open ? T(`${open} lesson${open > 1 ? "s" : ""} open now`, `${open} ${open > 1 ? "lecciones abiertas" : "lección abierta"} ya`) : T("Coming soon", "Muy pronto")}</small>`;
      list.appendChild(li);
    });
    if (window.FHStagger) FHStagger();
    const extra = FH.UNIT_NAMES.length - on.size;
    const gl = FH.GOALS.filter((g) => p.goals.includes(g.id)).map((g) => g.aim);
    $("#path-sum").textContent = T(
      `Built for ${gl.join(", plus ")}. ${todo} unit${todo === 1 ? "" : "s"} to learn${kn.size ? `, ${kn.size} you already know` : ""}${extra ? `, and ${extra} extra unit${extra === 1 ? "" : "s"} you can still open anytime` : ""}.` + (p.quiz ? ` You got ${p.quiz.right} of ${p.quiz.of} on the check.` : ""),
      `Hecho para ${gl.join(", además de ")}. ${todo} ${todo === 1 ? "unidad" : "unidades"} por aprender${kn.size ? `, ${kn.size} que ya sabes` : ""}${extra ? `, y ${extra} ${extra === 1 ? "unidad extra" : "unidades extra"} que puedes abrir cuando quieras` : ""}.` + (p.quiz ? ` Sacaste ${p.quiz.right} de ${p.quiz.of} en la prueba.` : ""));
    const next = FH.nextLesson();
    const go = $("#path-go");
    if (next) {
      const review = kn.has(next.unit) || !on.has(next.unit);
      go.href = "../" + next.href;
      go.firstChild.textContent = T(`${review ? "Review" : "Start"} Unit ${next.unit} · Lesson ${next.n} `, `${review ? "Repasar" : "Empezar"} Unidad ${next.unit} · Lección ${next.n} `);
      if (review) $("#path-sum").textContent += T(" The units you still need are being built now, so start with a quick review while they're on the way.", " Las unidades que te faltan se están construyendo, así que empieza con un repaso rápido mientras llegan.");
    }
  };
  $("#redo").addEventListener("click", () => { at = 0; show(0); });

  // Coming back to edit: start on step 1 with the old answers filled in.
  // "#styles" means the learner just switched language on step 1, so carry on from step 2.
  if (location.hash === "#path" && prof.done) { paintPath(); at = 4; show(4); }
  else if (location.hash === "#styles") { at = 1; show(1); }
  else show(0);
})();
