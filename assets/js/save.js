// FinanceHub save file: one record for the learner's character, company and progress.
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
    preferredStyle: null,
    styles: null, // learning styles the learner picked; null means show everything
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
    { n: 1, name: t("Money basics", "Lo básico del dinero"), units: [1, 2, 3, 4, 5, 6, 7] },
    { n: 2, name: t("How the economy works", "Cómo funciona la economía"), units: [8, 9, 10] },
    { n: 3, name: t("Business", "Negocios"), units: [11, 12, 13] },
    { n: 4, name: t("Markets and Wall Street", "Mercados y Wall Street"), units: [14, 15, 16] },
    { n: 5, name: t("Career launch", "Lanza tu carrera"), units: [17, 18] },
  ];
  const UNIT_NAMES = LANG === "es"
    ? ["Tu primera cuenta de banco", "Tu sueldo y tus impuestos", "Presupuesto y ahorro", "Crédito y préstamos", "Lo básico de invertir", "Protege tu dinero", "Compras grandes",
      "Decisiones y mercados", "Inflación, tasas y la Fed", "Matemáticas y mentalidad del dinero",
      "Empezar un negocio", "Contabilidad", "Finanzas corporativas",
      "Inversiones y portafolios", "Valuación y modelos", "Mercados e instituciones",
      "Excel, Python y SQL", "Reclutamiento y entrevistas"]
    : ["Your first bank account", "Your paycheck and taxes", "Budgeting and saving", "Credit and borrowing", "Investing basics", "Protecting your money", "Big purchases",
      "Choices and markets", "Inflation, rates and the Fed", "Money math and mindset",
      "Starting a business", "Accounting", "Corporate finance",
      "Investments and portfolios", "Valuation and modeling", "Markets and institutions",
      "Excel, Python and SQL", "Recruiting and interviews"];
  const UNITS = UNIT_NAMES.length;
  const partOf = (unit) => PARTS.find((p) => p.units.includes(unit));

  // Every lesson in course order, built or planned. `href` (from this language's site root) means it's open.
  // `needs` lists lessons it builds on; a path adds any the learner skipped.
  const L = (unit, n, id, title, sub, extra) => Object.assign({ unit, n, id, title, sub }, extra);
  const CATALOG = [
    L(1, 1, "u1-checking-savings", t("Where your money lives", "Dónde vive tu dinero"), t("Checking vs. savings · Run your bank app", "Cheques vs. ahorro · Maneja la app de tu banco"), { href: "lessons/checking-savings/" }),
    L(1, 2, "u1-open-account", t("Open your first account", "Abre tu primera cuenta"), t("Banks, credit unions and FDIC insurance", "Bancos, cooperativas y el seguro de la FDIC")),
    L(1, 3, "u1-bank-fees", t("Dodge the fees", "Evita las comisiones"), t("Debit cards, overdrafts and fees", "Tarjetas de débito, sobregiros y comisiones")),
    L(1, 4, "u1-moving-money", t("Move money safely", "Mueve tu dinero con seguridad"), t("Direct deposit, transfers and payment apps", "Depósito directo, transferencias y apps de pago")),
    L(2, 1, "u2-pay-stub", t("Read your first pay stub", "Lee tu primer talón de pago"), t("Gross vs. take-home pay", "Sueldo bruto vs. neto")),
    L(2, 2, "u2-taxes", t("Where your taxes go", "A dónde van tus impuestos"), t("Tax brackets and the W-4", "Categorías de impuestos y el W-4")),
    L(2, 3, "u2-file-taxes", t("File your first tax return", "Presenta tu primera declaración"), t("Refunds, forms and side-hustle income", "Reembolsos, formularios e ingresos extra")),
    L(3, 1, "u4-budgeting-frameworks", t("Give every dollar a job", "Dale un trabajo a cada dólar"), t("Budgeting frameworks · Month Survivor", "Métodos de presupuesto · Sobrevive el mes"), { href: "lessons/budgeting/" }),
    L(3, 2, "u3-emergency-fund", t("Build an emergency fund", "Arma un fondo de emergencia"), t("How much, where to keep it, how fast", "Cuánto, dónde guardarlo y qué tan rápido"), { needs: ["u4-budgeting-frameworks"] }),
    L(3, 3, "u3-high-yield", t("Make your savings earn more", "Haz que tus ahorros ganen más"), t("High-yield savings and APY", "Ahorro de alto rendimiento y APY"), { needs: ["u1-checking-savings"] }),
    L(4, 1, "u4-credit-scores", t("How credit scores work", "Cómo funciona el puntaje de crédito"), t("Reports, scores and what moves them", "Reportes, puntajes y qué los mueve")),
    L(4, 2, "u4-credit-cards", t("Use a card without getting burned", "Usa una tarjeta sin quemarte"), t("Credit cards and interest", "Tarjetas de crédito e intereses"), { needs: ["u4-credit-scores"] }),
    L(4, 3, "u4-loans", t("Loans and the traps to avoid", "Préstamos y las trampas que debes evitar"), t("Car, student and payday loans", "Préstamos de carro, estudiantiles y de día de pago"), { needs: ["u4-credit-cards"] }),
    L(5, 1, "u5-why-invest", t("Why invest at all?", "¿Por qué invertir?"), t("Inflation shrinks cash, compounding grows it", "La inflación encoge el efectivo y el interés compuesto lo hace crecer"), { href: "lessons/why-invest/" }),
    L(5, 2, "u5-stocks", t("What a stock is", "Qué es una acción"), t("Owning a slice of a company", "Ser dueño de un pedazo de una empresa"), { needs: ["u5-why-invest"] }),
    L(5, 3, "u5-index-funds", t("Index funds and the S&P 500", "Los fondos indexados y el S&P 500"), t("One fund, 500 companies", "Un fondo, 500 empresas"), { needs: ["u5-stocks"] }),
    L(5, 4, "u5-brokerage", t("Open a brokerage account", "Abre una cuenta de inversión"), t("What you need and the fees to watch", "Qué necesitas y las comisiones que debes vigilar"), { needs: ["u1-checking-savings"] }),
    L(5, 5, "u5-first-trade", t("Buy your first $10", "Compra tus primeros $10"), t("Fractional shares and placing an order", "Acciones fraccionadas y cómo hacer una orden"), { needs: ["u5-index-funds", "u5-brokerage"] }),
    L(5, 6, "u5-market-drops", t("When the market drops", "Cuando el mercado cae"), t("Risk, time and not panic-selling", "Riesgo, tiempo y no vender por pánico"), { needs: ["u5-first-trade"] }),
    L(5, 7, "u5-retirement", t("401(k) and Roth IRA", "El 401(k) y la Roth IRA"), t("Retirement accounts and the employer match", "Cuentas para el retiro y la aportación del empleador"), { needs: ["u5-index-funds"] }),
    L(6, 1, "u6-insurance", t("Insurance, explained", "Los seguros, explicados"), t("Health, car and renters insurance", "Seguro médico, de carro y de inquilino")),
    L(6, 2, "u6-scams", t("Spot scams and protect your identity", "Detecta estafas y protege tu identidad"), t("Phishing, fake checks and identity theft", "Phishing, cheques falsos y robo de identidad")),
    L(7, 1, "u7-renting", t("Rent your first place", "Renta tu primer lugar"), t("Leases, deposits and roommates", "Contratos, depósitos y compañeros de cuarto")),
    L(7, 2, "u7-car", t("Buy a car without overpaying", "Compra un carro sin pagar de más"), t("New vs. used, loans and total cost", "Nuevo vs. usado, préstamos y costo total"), { needs: ["u4-loans"] }),
    L(7, 3, "u7-home", t("Rent or buy a home?", "¿Rentar o comprar casa?"), t("Mortgages and the real cost of owning", "Hipotecas y el costo real de ser dueño"), { needs: ["u7-renting"] }),
    L(8, 1, "u1-scarcity", t("Every choice has a price tag", "Cada decisión tiene un precio"), t("Scarcity and trade-offs · Ten Free Hours", "Escasez y renuncias · Diez horas libres"), { href: "lessons/scarcity/" }),
    L(8, 2, "u1-supply-demand", t("Why prices are what they are", "Por qué los precios son lo que son"), t("Supply and demand · Market Stall", "Oferta y demanda · Puesto en el mercado"), { href: "lessons/supply-demand/", needs: ["u1-scarcity"] }),
    L(9, 1, "u1-inflation", t("Why your money shrinks", "Por qué tu dinero se encoge"), t("Inflation and GDP · Beat Inflation", "Inflación y PIB · Gánale a la inflación"), { href: "lessons/inflation/", needs: ["u1-supply-demand"] }),
    L(9, 2, "u1-interest-rates", t("Who sets the price of money?", "¿Quién pone el precio del dinero?"), t("Interest rates and the Fed · Rate Dial", "Tasas de interés y la Fed · La perilla de tasas"), { href: "lessons/interest-rates/", needs: ["u1-inflation"] }),
    L(9, 3, "u9-business-cycle", t("Booms and recessions", "Auges y recesiones"), t("The business cycle", "El ciclo económico"), { needs: ["u1-interest-rates"] }),
    L(10, 1, "u10-percent-growth", t("Percentages and growth", "Porcentajes y crecimiento"), t("The math behind every money question", "Las matemáticas detrás de cada pregunta de dinero")),
    L(10, 2, "u10-time-value", t("A dollar today vs. a dollar later", "Un dólar hoy vs. un dólar después"), t("The time value of money", "El valor del dinero en el tiempo"), { needs: ["u10-percent-growth"] }),
    L(10, 3, "u10-money-mind", t("Why we make bad money choices", "Por qué tomamos malas decisiones con el dinero"), t("Behavioral finance", "Finanzas conductuales")),
  ];
  // Lessons that are open so far, in course order.
  const OPEN = CATALOG.filter((l) => l.href);
  const byId = Object.fromEntries(CATALOG.map((l) => [l.id, l]));

  // Why people learn here. A goal is either an ordered list of lessons or a set of whole units.
  const GOALS = [
    { id: "invest", label: t("Save more and start investing", "Ahorrar más y empezar a invertir"), aim: t("saving more and starting to invest", "ahorrar más y empezar a invertir"), desc: t("From a savings account to your first $10 in an index fund", "Desde una cuenta de ahorro hasta tus primeros $10 en un fondo indexado"),
      lessons: ["u1-checking-savings", "u4-budgeting-frameworks", "u5-why-invest", "u5-stocks", "u5-index-funds", "u5-brokerage", "u5-first-trade", "u5-market-drops", "u5-retirement"] },
    { id: "money", label: t("Understand how money works", "Entender cómo funciona el dinero"), aim: t("understanding how money works", "entender cómo funciona el dinero"), desc: t("Banking, paychecks, budgeting, credit, investing, insurance and big purchases", "Bancos, sueldo, presupuesto, crédito, inversión, seguros y compras grandes"), units: [1, 2, 3, 4, 5, 6, 7] },
    { id: "business", label: t("Start or run a business", "Empezar o manejar un negocio"), aim: t("starting or running a business", "empezar o manejar un negocio"), desc: t("Money basics, pricing, accounting, cash flow and raising money", "Lo básico del dinero, precios, contabilidad, flujo de caja y conseguir inversión"),
      lessons: ["u1-checking-savings", "u1-open-account", "u2-pay-stub", "u2-taxes", "u4-budgeting-frameworks", "u1-supply-demand"], units: [11, 12, 13] },
    { id: "career", label: t("Study finance and get hired", "Estudiar finanzas y conseguir trabajo"), aim: t("studying finance and getting hired", "estudiar finanzas y conseguir trabajo"), desc: t("The whole course, from the basics through valuation and interviews. The check finds where you start.", "Todo el curso, desde lo básico hasta valuación y entrevistas. La prueba encuentra dónde empiezas."), units: Array.from({ length: UNITS }, (_, i) => i + 1) },
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
    setPreferredStyle(style) {
      state.preferredStyle = style;
      persist();
      emit();
    },
    // Picked learning styles (ids from FH.STYLES). An empty or full list means "show everything".
    get styles() {
      const s = state.styles || (state.preferredStyle ? [state.preferredStyle] : null);
      return s && s.length && s.length < STYLES.length ? s : null;
    },
    setStyles(list) {
      state.styles = list && list.length ? [...new Set(list)] : null;
      state.preferredStyle = null; // the old single pick would otherwise come back as a filter
      persist();
      emit();
    },
    lang: LANG,
    t,
    // Remember the reader's language (this browser and their account) and go to that version of the page.
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
