// FinancedHub save file: one record for the learner's character, company and progress.
// Always kept in this browser; auth.js also syncs it to the learner's account when signed in.
(function () {
  const KEY = "financehub-save-v1";
  // Page language comes from <html lang>. Spanish pages live under es/ and mirror the English ones.
  const LANG = document.documentElement.lang === "es" ? "es" : "en";
  const t = (en, es) => (LANG === "es" && es != null ? es : en);

  const fresh = () => ({
    version: 1,
    xp: 0,
    badges: [],
    lang: null, // "en" or "es" once picked; pages also remember it in localStorage "fh-lang"
    profile: null, // from the setup: { goals: [], level, known: {unit: true}, quiz, done, setAt, map: 2 }
    character: {
      name: "You",
      age: 18,
      monthlyTakeHome: 2400,
      checking: 300,
      emergencyFund: 0,
      investments: 0,
      creditCardDebt: 0,
    },
    company: null, // created in Unit 9
    lessons: {}, // lessonId -> { sections: {id: true}, quizBest, gameBest, completedAt }
    updatedAt: null,
  });

  let state;
  try {
    state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {
    state = fresh();
  }

  const persist = () => {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  };

  const lesson = (id) => (state.lessons[id] ||= { sections: {}, quizBest: 0, gameBest: null });

  let toastEl;
  const toast = (msg) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  };

  // The eight ways every lesson teaches. `chapter` is the lesson section each one maps to.
  const applyMotion = () => {
    let pick = null;
    try { pick = localStorage.getItem("fh-motion"); } catch (e) { /* storage blocked */ }
    const reduce = pick ? pick === "reduce" : matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) document.documentElement.dataset.motion = "reduce"; else delete document.documentElement.dataset.motion;
  };
  applyMotion();

  const STYLES = [
    { id: "visual", label: t("Seeing", "Viendo"), chapter: t("See it", "Míralo"), desc: t("Diagrams and charts you can drag and poke", "Diagramas y gráficas que puedes mover y tocar") },
    { id: "auditory", label: t("Listening", "Escuchando"), chapter: t("Hear it", "Escúchalo"), desc: t("A short narrated walkthrough", "Un recorrido corto narrado") },
    { id: "kinesthetic", label: t("Doing", "Haciendo"), chapter: t("Play it", "Juégalo"), desc: t("A game where you make the calls", "Un juego donde tú tomas las decisiones") },
    { id: "logical", label: t("Working out the logic", "Entendiendo la lógica"), chapter: t("Break it down", "Paso a paso"), desc: t("Formulas and step-by-step examples", "Fórmulas y ejemplos paso a paso") },
    { id: "naturalistic", label: t("Linking it to nature", "Conectándolo con la naturaleza"), chapter: t("Nature link", "Conexión con la naturaleza"), desc: t("The idea as a living system", "La idea como un sistema vivo") },
    { id: "reading", label: t("Reading and writing", "Leyendo y escribiendo"), chapter: t("Notes", "Apuntes"), desc: t("Notes to copy and blanks to fill", "Apuntes para copiar y espacios para llenar") },
    { id: "social", label: t("Talking it through", "Hablándolo con otros"), chapter: t("Together", "En grupo"), desc: t("Debates and challenges with friends", "Debates y retos con amigos") },
    { id: "solitary", label: t("Thinking on my own", "Pensando por mi cuenta"), chapter: t("On your own", "Por tu cuenta"), desc: t("Private questions about your own life", "Preguntas privadas sobre tu propia vida") },
  ];

  // The course: 5 parts, 18 units, from a first bank account to Wall Street.
  const PARTS = [
    { n: 1, name: t("Personal finance", "Finanzas personales"), units: [1, 2, 3, 4, 5, 6, 7] },
    { n: 2, name: t("Economics", "Economía"), units: [8, 9, 10] },
    { n: 3, name: t("Business", "Negocios"), units: [11, 12, 13] },
    { n: 4, name: t("Wall Street and investing", "Wall Street e inversiones"), units: [14, 15, 16] },
    { n: 5, name: t("Finance careers", "Carreras en finanzas"), units: [17, 18] },
  ];
  // Plain topic names, so a learner can tell at a glance what each unit teaches.
  const UNIT_NAMES = LANG === "es"
    ? ["Cuentas de banco", "Sueldo e impuestos", "Presupuesto y ahorro", "Crédito y préstamos", "Invertir", "Seguros y estafas", "Rentar, carros y casas",
      "Oferta y demanda", "Inflación y tasas de interés", "Matemáticas del dinero",
      "Empezar un negocio", "Contabilidad", "Finanzas corporativas",
      "Armar un portafolio", "Valuar una empresa", "Bancos y mercados",
      "Excel, Python y SQL", "Entrevistas y contratación"]
    : ["Bank accounts", "Paychecks and taxes", "Budgeting and saving", "Credit and loans", "Investing", "Insurance and scams", "Renting, cars and homes",
      "Supply and demand", "Inflation and interest rates", "Money math",
      "Starting a business", "Accounting", "Corporate finance",
      "Building a portfolio", "Valuing a company", "Banks and markets",
      "Excel, Python and SQL", "Interviews and getting hired"];
  const UNITS = UNIT_NAMES.length;
  const partOf = (unit) => PARTS.find((p) => p.units.includes(unit));

  // Every lesson in course order, built or planned. `href` (from this language's site root) means it's open.
  // `needs` lists lessons it builds on; a path adds any the learner skipped.
  const L = (unit, n, id, title, sub, extra) => Object.assign({ unit, n, id, title, sub }, extra);
  const CATALOG = [
    L(1, 1, "u1-checking-savings", t("Checking vs. savings accounts", "Cuentas de cheques vs. de ahorro"), t("Where your money lives · Run your bank app", "Dónde vive tu dinero · Maneja la app de tu banco"), { href: "lessons/checking-savings/" }),
    L(1, 2, "u1-open-account", t("Opening a bank account", "Abrir una cuenta de banco"), t("Banks, credit unions and FDIC insurance", "Bancos, cooperativas y el seguro de la FDIC"), { href: "lessons/open-account/" }),
    L(1, 3, "u1-bank-fees", t("Bank fees and debit cards", "Comisiones del banco y tarjetas de débito"), t("Debit cards, overdrafts and fees", "Tarjetas de débito, sobregiros y comisiones"), { href: "lessons/bank-fees/" }),
    L(1, 4, "u1-moving-money", t("Transfers and payment apps", "Transferencias y apps de pago"), t("Direct deposit, transfers and payment apps", "Depósito directo, transferencias y apps de pago"), { href: "lessons/moving-money/" }),
    L(2, 1, "u2-pay-stub", t("Reading a pay stub", "Leer un talón de pago"), t("Gross vs. take-home pay", "Sueldo bruto vs. neto"), { href: "lessons/pay-stub/" }),
    L(2, 2, "u2-taxes", t("How taxes work", "Cómo funcionan los impuestos"), t("Tax brackets and the W-4", "Categorías de impuestos y el W-4"), { href: "lessons/taxes/", needs: ["u2-pay-stub"] }),
    L(2, 3, "u2-file-taxes", t("Filing a tax return", "Presentar tu declaración de impuestos"), t("Refunds, forms and side-hustle income", "Reembolsos, formularios e ingresos extra")),
    L(3, 1, "u4-budgeting-frameworks", t("Making a budget", "Hacer un presupuesto"), t("Give every dollar a job · Month Survivor", "Dale un trabajo a cada dólar · Sobrevive el mes"), { href: "lessons/budgeting/" }),
    L(3, 2, "u3-emergency-fund", t("Emergency funds", "El fondo de emergencia"), t("How much, where to keep it, how fast", "Cuánto, dónde guardarlo y qué tan rápido"), { needs: ["u4-budgeting-frameworks"] }),
    L(3, 3, "u3-high-yield", t("High-yield savings", "Ahorro de alto rendimiento"), t("Make your savings earn more", "Haz que tus ahorros ganen más"), { needs: ["u1-checking-savings"] }),
    L(4, 1, "u4-credit-scores", t("Credit scores", "El puntaje de crédito"), t("Reports, scores and what moves them", "Reportes, puntajes y qué los mueve")),
    L(4, 2, "u4-credit-cards", t("Credit cards", "Tarjetas de crédito"), t("Use a card without getting burned", "Usa una tarjeta sin quemarte"), { needs: ["u4-credit-scores"] }),
    L(4, 3, "u4-loans", t("Loans", "Préstamos"), t("Car, student and payday loans", "Préstamos de carro, estudiantiles y de día de pago"), { needs: ["u4-credit-cards"] }),
    L(5, 1, "u5-why-invest", t("Why invest?", "¿Por qué invertir?"), t("Inflation shrinks cash, compounding grows it", "La inflación encoge el efectivo y el interés compuesto lo hace crecer"), { href: "lessons/why-invest/" }),
    L(5, 2, "u5-stocks", t("Stocks", "Acciones"), t("Owning a slice of a company", "Ser dueño de un pedazo de una empresa"), { href: "lessons/stocks/", needs: ["u5-why-invest"] }),
    L(5, 3, "u5-index-funds", t("Index funds and the S&P 500", "Los fondos indexados y el S&P 500"), t("One fund, 500 companies", "Un fondo, 500 empresas"), { href: "lessons/index-funds/", needs: ["u5-stocks"] }),
    L(5, 4, "u5-brokerage", t("Brokerage accounts", "Cuentas de inversión"), t("What you need and the fees to watch", "Qué necesitas y las comisiones que debes vigilar"), { href: "lessons/brokerage/", needs: ["u1-checking-savings"] }),
    L(5, 5, "u5-first-trade", t("Buying your first stock", "Comprar tu primera acción"), t("Fractional shares and placing an order", "Acciones fraccionadas y cómo hacer una orden"), { href: "lessons/first-trade/", needs: ["u5-index-funds", "u5-brokerage"] }),
    L(5, 6, "u5-market-drops", t("Market drops and risk", "Caídas del mercado y riesgo"), t("Risk, time and not panic-selling", "Riesgo, tiempo y no vender por pánico"), { href: "lessons/market-drops/", needs: ["u5-first-trade"] }),
    L(5, 7, "u5-retirement", t("401(k) and Roth IRA", "El 401(k) y la Roth IRA"), t("Retirement accounts and the employer match", "Cuentas para el retiro y la aportación del empleador"), { href: "lessons/retirement/", needs: ["u5-index-funds"] }),
    L(6, 1, "u6-insurance", t("Insurance", "Seguros"), t("Health, car and renters insurance", "Seguro médico, de carro y de inquilino")),
    L(6, 2, "u6-scams", t("Scams and identity theft", "Estafas y robo de identidad"), t("Phishing, fake checks and identity theft", "Phishing, cheques falsos y robo de identidad")),
    L(7, 1, "u7-renting", t("Renting an apartment", "Rentar un departamento"), t("Leases, deposits and roommates", "Contratos, depósitos y compañeros de cuarto")),
    L(7, 2, "u7-car", t("Buying a car", "Comprar un carro"), t("New vs. used, loans and total cost", "Nuevo vs. usado, préstamos y costo total"), { needs: ["u4-loans"] }),
    L(7, 3, "u7-home", t("Renting vs. buying a home", "Rentar vs. comprar casa"), t("Mortgages and the real cost of owning", "Hipotecas y el costo real de ser dueño"), { needs: ["u7-renting"] }),
    L(8, 1, "u1-scarcity", t("Scarcity and trade-offs", "Escasez y renuncias"), t("Every choice has a price tag · Ten Free Hours", "Cada decisión tiene un precio · Diez horas libres"), { href: "lessons/scarcity/" }),
    L(8, 2, "u1-supply-demand", t("Supply and demand", "Oferta y demanda"), t("Why prices are what they are · Market Stall", "Por qué los precios son lo que son · Puesto en el mercado"), { href: "lessons/supply-demand/", needs: ["u1-scarcity"] }),
    L(9, 1, "u1-inflation", t("Inflation", "Inflación"), t("Why your money shrinks · Beat Inflation", "Por qué tu dinero se encoge · Gánale a la inflación"), { href: "lessons/inflation/", needs: ["u1-supply-demand"] }),
    L(9, 2, "u1-interest-rates", t("Interest rates and the Fed", "Las tasas de interés y la Fed"), t("Who sets the price of money? · Rate Dial", "¿Quién pone el precio del dinero? · La perilla de tasas"), { href: "lessons/interest-rates/", needs: ["u1-inflation"] }),
    L(9, 3, "u9-business-cycle", t("The business cycle", "El ciclo económico"), t("Booms and recessions", "Auges y recesiones"), { needs: ["u1-interest-rates"] }),
    L(10, 1, "u10-percent-growth", t("Percentages and growth", "Porcentajes y crecimiento"), t("The math behind every money question", "Las matemáticas detrás de cada pregunta de dinero")),
    L(10, 2, "u10-time-value", t("The time value of money", "El valor del dinero en el tiempo"), t("A dollar today vs. a dollar later", "Un dólar hoy vs. un dólar después"), { needs: ["u10-percent-growth"] }),
    L(10, 3, "u10-money-mind", t("Money psychology", "Psicología del dinero"), t("Behavioral finance", "Finanzas conductuales")),
  ];
  // Lessons that are open so far, in course order.
  const OPEN = CATALOG.filter((l) => l.href);
  const byId = Object.fromEntries(CATALOG.map((l) => [l.id, l]));

  // Why people learn here. A goal is either an ordered list of lessons or a set of whole units.
  const GOALS = [
    // Everyday money: pick just the topic you care about.
    { id: "bank", group: "life", label: t("Open and use a bank account", "Abrir y usar una cuenta de banco"), desc: t("Checking vs. savings, fees and moving money", "Cheques vs. ahorro, comisiones y mover dinero"), units: [1] },
    { id: "paycheck", group: "life", label: t("Understand my paycheck and taxes", "Entender mi sueldo y mis impuestos"), desc: t("Your pay stub, where taxes go and filing", "Tu talón de pago, a dónde van los impuestos y cómo declarar"), units: [2] },
    { id: "budget", group: "life", label: t("Budget and build savings", "Hacer presupuesto y ahorrar"), desc: t("A plan for every dollar and an emergency fund", "Un plan para cada dólar y un fondo de emergencia"), units: [3] },
    { id: "credit", group: "life", label: t("Credit scores and credit cards", "El puntaje de crédito y las tarjetas"), desc: t("How credit works, using a card and avoiding bad loans", "Cómo funciona el crédito, usar una tarjeta y evitar malos préstamos"), units: [4] },
    { id: "invest", group: "life", label: t("Start investing", "Empezar a invertir"), aim: t("saving more and starting to invest", "ahorrar más y empezar a invertir"), desc: t("From a savings account to your first $10 in an index fund", "Desde una cuenta de ahorro hasta tus primeros $10 en un fondo indexado"),
      lessons: ["u1-checking-savings", "u4-budgeting-frameworks", "u5-why-invest", "u5-stocks", "u5-index-funds", "u5-brokerage", "u5-first-trade", "u5-market-drops", "u5-retirement"] },
    { id: "protect", group: "life", label: t("Insurance and avoiding scams", "Seguros y cómo evitar estafas"), desc: t("What insurance covers and how to protect your identity", "Qué cubre un seguro y cómo proteger tu identidad"), units: [6] },
    { id: "big", group: "life", label: t("Buy a car or rent a home", "Comprar un carro o rentar casa"), desc: t("Renting, car loans and whether to buy a home", "Rentar, préstamos de carro y si conviene comprar casa"), units: [7] },
    { id: "money", group: "life", label: t("All of the above", "Todo lo anterior"), aim: t("understanding how money works", "entender cómo funciona el dinero"), desc: t("Ticks every topic in this group at once", "Marca todos los temas de este grupo a la vez"), units: [1, 2, 3, 4, 5, 6, 7] },
    // Bigger picture: the economy, business and a finance career.
    { id: "economy", group: "big", label: t("Understand the economy", "Entender la economía"), desc: t("Prices, inflation, interest rates and money math", "Precios, inflación, tasas de interés y matemáticas del dinero"), units: [8, 9, 10] },
    { id: "business", group: "big", label: t("Start or run a business", "Empezar o manejar un negocio"), aim: t("starting or running a business", "empezar o manejar un negocio"), desc: t("Money basics, pricing, accounting, cash flow and raising money", "Lo básico del dinero, precios, contabilidad, flujo de caja y conseguir inversión"),
      lessons: ["u1-checking-savings", "u1-open-account", "u2-pay-stub", "u2-taxes", "u4-budgeting-frameworks", "u1-supply-demand"], units: [11, 12, 13] },
    { id: "wallstreet", group: "big", label: t("Learn how Wall Street works", "Aprender cómo funciona Wall Street"), desc: t("Portfolios, valuation and how markets really run", "Portafolios, valuación y cómo funcionan los mercados"), units: [14, 15, 16] },
    { id: "career", group: "big", label: t("Study finance and get hired", "Estudiar finanzas y conseguir trabajo"), aim: t("studying finance and getting hired", "estudiar finanzas y conseguir trabajo"), desc: t("The whole course, from the basics through valuation and interviews. The check finds where you start.", "Todo el curso, desde lo básico hasta valuación y entrevistas. La prueba encuentra dónde empiezas."), units: Array.from({ length: UNITS }, (_, i) => i + 1) },
  ];

  // A learner's path: the goals' lessons (whole units become every lesson in them, or one "coming soon" stop
  // when none are planned yet), plus any lessons they build on, in course order with no repeats.
  // Items: { lesson } for a lesson, { unit } for a unit with no lessons planned yet.
  const buildPath = (goalIds) => {
    const goals = GOALS.filter((g) => goalIds.includes(g.id));
    const ids = new Set(), units = new Set();
    goals.forEach((g) => {
      (g.lessons || []).forEach((id) => ids.add(id));
      (g.units || []).forEach((u) => { const ls = CATALOG.filter((l) => l.unit === u); ls.length ? ls.forEach((l) => ids.add(l.id)) : units.add(u); });
    });
    const add = (id) => { (byId[id].needs || []).forEach((n) => { if (!ids.has(n)) { ids.add(n); add(n); } }); };
    [...ids].forEach(add);
    const order = (x) => (x.lesson ? x.lesson.unit * 100 + x.lesson.n : x.unit * 100);
    return [...[...ids].map((id) => ({ lesson: byId[id] })), ...[...units].map((u) => ({ unit: u }))].sort((a, b) => order(a) - order(b));
  };

  // Saves from before the 18-unit course used the old unit numbers for "known". Move them over once.
  const OLD_UNITS = { 1: [8, 9], 2: [10], 3: [2], 4: [1, 3], 5: [4], 6: [6], 7: [5], 8: [7], 9: [11], 10: [12], 11: [13], 12: [14], 13: [15], 14: [16], 15: [17, 18] };
  const upgrade = (st) => {
    const p = st.profile;
    if (p && !p.map) {
      const known = {};
      Object.keys(p.known || {}).forEach((u) => (OLD_UNITS[u] || []).forEach((n) => (known[n] = true)));
      st.profile = Object.assign({}, p, { known, map: 2 });
    }
    return st;
  };
  upgrade(state);

  // Line icons for the style cards (24px grid, stroked).
  const ICONS = {
    visual: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="3"/>',
    auditory: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    kinesthetic: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="17.5" cy="14" r="1"/>',
    logical: '<path d="M4 6h7M7.5 2.5v7M14 6h6M4 17l6-6M4 11l6 6M14 15h6M14 19h6"/>',
    naturalistic: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l8-8"/>',
    reading: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
    social: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.5-3 2.5-5 5-5s4.5 2 5 5M11 19c.5-3 2.5-5 5-5s4.5 2 5 5"/>',
    solitary: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>',
  };
  STYLES.forEach((st) => { st.icon = ICONS[st.id]; });

  const emit = () => document.dispatchEvent(new CustomEvent("fh:save", { detail: state }));

  window.FH = {
    get state() { return state; },
    lesson,
    addXP(n, why) {
      state.xp += n;
      persist();
      emit();
      if (why) toast(`+${n} XP · ${why}`);
    },
    badge(id, label) {
      if (state.badges.includes(id)) return;
      state.badges.push(id);
      persist();
      emit();
      toast(t(`Badge unlocked: ${label}`, `Insignia desbloqueada: ${label}`));
    },
    markSection(lessonId, sectionId) {
      const l = lesson(lessonId);
      if (l.sections[sectionId]) return false;
      l.sections[sectionId] = true;
      persist();
      emit();
      return true;
    },
    lang: LANG,
    t,
    // Remember the reader's language (this browser and their account) and go to that version of the page.
    // Reduce motion: the reader's own pick, or their device setting.
    setMotion(on) {
      try { localStorage.setItem("fh-motion", on ? "reduce" : "full"); } catch (e) { /* storage blocked */ }
      applyMotion();
    },
    still: () => document.documentElement.dataset.motion === "reduce",
    setLang(lang, go = true) {
      state.lang = lang;
      try { localStorage.setItem("fh-lang", lang); } catch (e) { /* storage blocked */ }
      persist();
      emit();
      const alt = document.documentElement.dataset.alt;
      if (go && lang !== LANG && alt) location.href = alt + location.search + location.hash;
    },
    STYLES,
    GOALS,
    PARTS,
    UNIT_NAMES,
    CATALOG,
    OPEN,
    partOf,
    lessonById: (id) => byId[id],
    buildPath,
    done: (id) => !!(state.lessons[id] && state.lessons[id].completedAt),
    // The next open lesson to take: on the path, not known, not finished. Falls back to any unfinished one.
    // The lesson the main button should open, with why: "new" (next on the path), "review" (on the path,
    // but in a unit they know) or "extra" (every open path lesson is done, so one from outside the path).
    nextLesson() {
      const { items, known } = this.path;
      const todo = (l) => l.href && !this.done(l.id);
      const onPath = items.filter((x) => x.lesson).map((x) => x.lesson);
      const pick = (l, why) => l && Object.assign({}, l, { why });
      return pick(onPath.find((l) => todo(l) && !known.has(l.unit)), "new") || pick(onPath.find(todo), "review")
        || pick(OPEN.find((l) => todo(l) && !known.has(l.unit)) || OPEN.find(todo), "extra") || null;
    },
    setProfile(patch) {
      state.profile = Object.assign({}, state.profile, patch, { setAt: new Date().toISOString(), map: 2 });
      persist();
      emit();
    },
    // The learner's path (see buildPath), the units it touches, and the units they already know.
    // No goals means the whole course.
    get path() {
      const p = state.profile;
      const goals = (p && p.goals && p.goals.length) ? p.goals : null;
      const items = buildPath(goals || GOALS.map((g) => g.id));
      const on = new Set(items.map((x) => (x.lesson ? x.lesson.unit : x.unit)));
      return { items, on, known: new Set(Object.keys((p && p.known) || {}).map(Number)), setUp: !!(p && p.done && goals) };
    },
    // Drop the goals and placement results so the whole course shows again. `done` stays so setup isn't forced again.
    clearPath() {
      this.setProfile({ goals: [], known: {}, level: null, quiz: null, done: true });
    },
    updateCharacter(patch) {
      Object.assign(state.character, patch);
      persist();
      emit();
    },
    save() { persist(); emit(); },
    // Swap in a save that came from the learner's account.
    replace(next) {
      state = upgrade(Object.assign(fresh(), next));
      // A language saved on the account wins in this browser too.
      if (state.lang) try { localStorage.setItem("fh-lang", state.lang); } catch (e) { /* storage blocked */ }
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
      document.dispatchEvent(new CustomEvent("fh:save", { detail: state, bubbles: false }));
    },
    reset() { state = fresh(); persist(); emit(); },
    toast,
    money: (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"),
  };
})();
