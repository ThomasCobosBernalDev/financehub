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
    notes: [], // notifications, newest last: { id, at, read }
    streak: { days: 0, best: 0, last: null }, // days in a row the learner showed up
    avatar: null, // their own profile picture, a small square JPEG data URL
    banner: null, // the Unsplash photo id behind their profile (null = the default skyline)
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

  // Without an account, progress is only kept for the visit: it's erased once the browser is closed
  // (the fh-guest session cookie is gone) or after 12 hours away. An account keeps it for good.
  try {
    if (!Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k))) {
      const old = JSON.parse(localStorage.getItem(KEY) || "null");
      if (old && (!/(^|;\s*)fh-guest=1/.test(document.cookie) || Date.now() - Date.parse(old.updatedAt || 0) > 432e5)) localStorage.removeItem(KEY);
      document.cookie = "fh-guest=1; path=/; SameSite=Lax";
    }
  } catch (e) { /* storage blocked */ }

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

  // Reduce motion: the reader's own pick in Settings, or their device setting.
  const applyMotion = () => {
    let pick = null;
    try { pick = localStorage.getItem("fh-motion"); } catch (e) { /* storage blocked */ }
    const reduce = pick ? pick === "reduce" : matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) document.documentElement.dataset.motion = "reduce"; else delete document.documentElement.dataset.motion;
  };
  applyMotion();

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
  // One Unsplash photo per unit (course page and home page banners).
  const UNIT_PHOTO = ["1601597111158-2fceff292cdc", "1554224154-26032ffc0d07", "1554224155-8d04cb21cd6c", "1556742502-ec7c0e9f34b1",
    "1611974789855-9c2a0a7236a3", "1585914641050-fa9883c4e21c", "1741156386380-0236c72eb6f9", "1526399743290-f73cb4022f48",
    "1553729459-efe14ef6055d", "1626266061368-46a8f578ddd6", "1556742049-0cfed4f6a45d", "1772588627327-1eeddcf73c11",
    "1542744173-8e7e53415bb0", "1648275913341-7973ae7bc9b3", "1707157284454-553ef0a4ed0d", "1770461846516-b7e5993a8e4f",
    "1629654297299-c8506221ca97", "1758520144437-f068ecaf0d83"];
  const unitPhoto = (u) => `https://images.unsplash.com/photo-${UNIT_PHOTO[u - 1]}?auto=format&fit=crop&w=900&h=420&q=70`;
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
    L(2, 3, "u2-file-taxes", t("Filing a tax return", "Presentar tu declaración de impuestos"), t("Refunds, forms and side-hustle income", "Reembolsos, formularios e ingresos extra"), { href: "lessons/file-taxes/", needs: ["u2-taxes"] }),
    L(3, 1, "u4-budgeting-frameworks", t("Making a budget", "Hacer un presupuesto"), t("Give every dollar a job · Month Survivor", "Dale un trabajo a cada dólar · Sobrevive el mes"), { href: "lessons/budgeting/" }),
    L(3, 2, "u3-emergency-fund", t("Emergency funds", "El fondo de emergencia"), t("How much, where to keep it, how fast", "Cuánto, dónde guardarlo y qué tan rápido"), { href: "lessons/emergency-fund/", needs: ["u4-budgeting-frameworks"] }),
    L(3, 3, "u3-high-yield", t("High-yield savings", "Ahorro de alto rendimiento"), t("Make your savings earn more", "Haz que tus ahorros ganen más"), { href: "lessons/high-yield/", needs: ["u1-checking-savings"] }),
    L(4, 1, "u4-credit-scores", t("Credit scores", "El puntaje de crédito"), t("Reports, scores and what moves them", "Reportes, puntajes y qué los mueve"), { href: "lessons/credit-scores/" }),
    L(4, 2, "u4-credit-cards", t("Credit cards", "Tarjetas de crédito"), t("Use a card without getting burned", "Usa una tarjeta sin quemarte"), { href: "lessons/credit-cards/", needs: ["u4-credit-scores"] }),
    L(4, 3, "u4-loans", t("Loans", "Préstamos"), t("Car, student and payday loans", "Préstamos de carro, estudiantiles y de día de pago"), { href: "lessons/loans/", needs: ["u4-credit-cards"] }),
    L(5, 1, "u5-why-invest", t("Why invest?", "¿Por qué invertir?"), t("Inflation shrinks cash, compounding grows it", "La inflación encoge el efectivo y el interés compuesto lo hace crecer"), { href: "lessons/why-invest/" }),
    L(5, 2, "u5-stocks", t("Stocks", "Acciones"), t("Owning a slice of a company", "Ser dueño de un pedazo de una empresa"), { href: "lessons/stocks/", needs: ["u5-why-invest"] }),
    L(5, 3, "u5-index-funds", t("Index funds and the S&P 500", "Los fondos indexados y el S&P 500"), t("One fund, 500 companies", "Un fondo, 500 empresas"), { href: "lessons/index-funds/", needs: ["u5-stocks"] }),
    L(5, 4, "u5-brokerage", t("Brokerage accounts", "Cuentas de inversión"), t("What you need and the fees to watch", "Qué necesitas y las comisiones que debes vigilar"), { href: "lessons/brokerage/", needs: ["u1-checking-savings"] }),
    L(5, 5, "u5-first-trade", t("Buying your first stock", "Comprar tu primera acción"), t("Fractional shares and placing an order", "Acciones fraccionadas y cómo hacer una orden"), { href: "lessons/first-trade/", needs: ["u5-index-funds", "u5-brokerage"] }),
    L(5, 6, "u5-market-drops", t("Market drops and risk", "Caídas del mercado y riesgo"), t("Risk, time and not panic-selling", "Riesgo, tiempo y no vender por pánico"), { href: "lessons/market-drops/", needs: ["u5-first-trade"] }),
    L(5, 7, "u5-retirement", t("401(k) and Roth IRA", "El 401(k) y la Roth IRA"), t("Retirement accounts and the employer match", "Cuentas para el retiro y la aportación del empleador"), { href: "lessons/retirement/", needs: ["u5-index-funds"] }),
    L(6, 1, "u6-insurance", t("Insurance", "Seguros"), t("Health, car and renters insurance", "Seguro médico, de carro y de inquilino"), { href: "lessons/insurance/" }),
    L(6, 2, "u6-scams", t("Scams and identity theft", "Estafas y robo de identidad"), t("Phishing, fake checks and identity theft", "Phishing, cheques falsos y robo de identidad"), { href: "lessons/scams/" }),
    L(7, 1, "u7-renting", t("Renting an apartment", "Rentar un departamento"), t("Leases, deposits and roommates", "Contratos, depósitos y compañeros de cuarto"), { href: "lessons/renting/" }),
    L(7, 2, "u7-car", t("Buying a car", "Comprar un carro"), t("New vs. used, loans and total cost", "Nuevo vs. usado, préstamos y costo total"), { needs: ["u4-loans"], href: "lessons/buying-car/" }),
    L(7, 3, "u7-home", t("Renting vs. buying a home", "Rentar vs. comprar casa"), t("Mortgages and the real cost of owning", "Hipotecas y el costo real de ser dueño"), { needs: ["u7-renting"], href: "lessons/rent-vs-buy/" }),
    L(8, 1, "u1-scarcity", t("Scarcity and trade-offs", "Escasez y renuncias"), t("Every choice has a price tag · Ten Free Hours", "Cada decisión tiene un precio · Diez horas libres"), { href: "lessons/scarcity/" }),
    L(8, 2, "u1-supply-demand", t("Supply and demand", "Oferta y demanda"), t("Why prices are what they are · Market Stall", "Por qué los precios son lo que son · Puesto en el mercado"), { href: "lessons/supply-demand/", needs: ["u1-scarcity"] }),
    L(9, 1, "u1-inflation", t("Inflation", "Inflación"), t("Why your money shrinks · Beat Inflation", "Por qué tu dinero se encoge · Gánale a la inflación"), { href: "lessons/inflation/", needs: ["u1-supply-demand"] }),
    L(9, 2, "u1-interest-rates", t("Interest rates and the Fed", "Las tasas de interés y la Fed"), t("Who sets the price of money? · Rate Dial", "¿Quién pone el precio del dinero? · La perilla de tasas"), { href: "lessons/interest-rates/", needs: ["u1-inflation"] }),
    L(9, 3, "u9-business-cycle", t("The business cycle", "El ciclo económico"), t("Booms and recessions", "Auges y recesiones"), { needs: ["u1-interest-rates"], href: "lessons/business-cycle/" }),
    L(10, 1, "u10-percent-growth", t("Percentages and growth", "Porcentajes y crecimiento"), t("The math behind every money question", "Las matemáticas detrás de cada pregunta de dinero"), { href: "lessons/percentages/" }),
    L(10, 2, "u10-time-value", t("The time value of money", "El valor del dinero en el tiempo"), t("A dollar today vs. a dollar later", "Un dólar hoy vs. un dólar después"), { needs: ["u10-percent-growth"], href: "lessons/time-value/" }),
    L(10, 3, "u10-money-mind", t("Money psychology", "Psicología del dinero"), t("Behavioral finance", "Finanzas conductuales"), { href: "lessons/money-mind/" }),
    L(11, 1, "u11-price-profit", t("Price, costs and profit", "Precio, costos y ganancia"), t("Fixed vs. variable costs and break-even", "Costos fijos vs. variables y punto de equilibrio"), { needs: ["u10-percent-growth"], href: "lessons/price-profit/" }),
    L(11, 2, "u11-cash-flow", t("Cash flow", "Flujo de efectivo"), t("Why profitable businesses still run out of money", "Por qué negocios con ganancias se quedan sin dinero"), { needs: ["u11-price-profit"], href: "lessons/cash-flow/" }),
    L(11, 3, "u11-legal-setup", t("Making it official", "Hacerlo oficial"), t("Sole proprietor, LLC or corporation, plus business taxes", "Dueño único, LLC o corporación, más impuestos del negocio"), { needs: ["u11-price-profit"], href: "lessons/legal-setup/" }),
    L(12, 1, "u12-income-statement", t("The income statement", "El estado de resultados"), t("Did the business make money?", "¿El negocio ganó dinero?"), { needs: ["u11-price-profit"], href: "lessons/income-statement/" }),
    L(12, 2, "u12-balance-sheet", t("The balance sheet", "El balance general"), t("What it owns, what it owes", "Lo que tiene y lo que debe"), { needs: ["u12-income-statement"], href: "lessons/balance-sheet/" }),
    L(12, 3, "u12-three-statements", t("How the three statements connect", "Cómo se conectan los tres estados"), t("The cash flow statement ties it together", "El estado de flujo de efectivo lo une todo"), { needs: ["u12-balance-sheet"], href: "lessons/three-statements/" }),
    L(13, 1, "u13-raising-money", t("Raising money", "Conseguir dinero"), t("Debt vs. equity, from loans to an IPO", "Deuda vs. capital, de préstamos a una salida a bolsa"), { needs: ["u12-balance-sheet"], href: "lessons/raising-money/" }),
    L(13, 2, "u13-npv", t("Picking projects with NPV", "Elegir proyectos con el VPN"), t("Is this investment worth it?", "¿Vale la pena esta inversión?"), { needs: ["u10-time-value"], href: "lessons/npv/" }),
    L(13, 3, "u13-cost-of-capital", t("The cost of capital", "El costo de capital"), t("What money costs a company", "Lo que le cuesta el dinero a una empresa"), { needs: ["u13-raising-money", "u13-npv"], href: "lessons/cost-of-capital/" }),
    L(14, 1, "u14-risk-return", t("Risk and return", "Riesgo y rendimiento"), t("Expected return, volatility and the trade-off", "Rendimiento esperado, volatilidad y el equilibrio entre los dos"), { needs: ["u5-market-drops"], href: "lessons/risk-return/" }),
    L(14, 2, "u14-diversification", t("Diversification", "Diversificar"), t("Why mixing investments lowers risk", "Por qué mezclar inversiones baja el riesgo"), { needs: ["u14-risk-return"], href: "lessons/diversification/" }),
    L(14, 3, "u14-bonds", t("How bonds work", "Cómo funcionan los bonos"), t("Prices, yields and why they move opposite", "Precios, rendimientos y por qué se mueven al revés"), { needs: ["u10-time-value"], href: "lessons/bonds/" }),
    L(15, 1, "u15-dcf", t("Valuing a company with DCF", "Valuar una empresa con DCF"), t("What a business is worth from its future cash", "Lo que vale un negocio por su efectivo futuro"), { needs: ["u13-cost-of-capital"], href: "lessons/dcf/" }),
    L(15, 2, "u15-multiples", t("Comparables and multiples", "Comparables y múltiplos"), t("Pricing a company against its peers", "Ponerle precio a una empresa comparándola con otras"), { needs: ["u15-dcf"], href: "lessons/multiples/" }),
    L(15, 3, "u15-mergers", t("Mergers and buyouts", "Fusiones y compras de empresas"), t("How companies buy companies, including LBOs", "Cómo las empresas compran empresas, incluidas las LBO"), { needs: ["u15-multiples"], href: "lessons/mergers/" }),
    L(16, 1, "u16-wall-street", t("Who does what on Wall Street", "Quién hace qué en Wall Street"), t("Banks, funds and the jobs inside them", "Bancos, fondos y los trabajos que hay adentro"), { needs: ["u13-raising-money"], href: "lessons/wall-street/" }),
    L(16, 2, "u16-trading", t("How trading works", "Cómo se compran y venden acciones"), t("Exchanges, orders and market makers", "Bolsas, órdenes y creadores de mercado"), { needs: ["u16-wall-street"], href: "lessons/trading/" }),
    L(16, 3, "u16-derivatives", t("Options and futures", "Opciones y futuros"), t("Contracts on what happens next", "Contratos sobre lo que va a pasar"), { needs: ["u14-risk-return"], href: "lessons/derivatives/" }),
    L(17, 1, "u17-excel", t("Spreadsheets for finance", "Hojas de cálculo para finanzas"), t("Cells, formulas and your first model", "Celdas, fórmulas y tu primer modelo"), { needs: ["u10-percent-growth"], href: "lessons/spreadsheets/" }),
    L(17, 2, "u17-python", t("Python for finance", "Python para finanzas"), t("Let code do the math for you", "Deja que el código haga las cuentas"), { needs: ["u17-excel"], href: "lessons/python/" }),
    L(17, 3, "u17-sql", t("SQL for finance", "SQL para finanzas"), t("Ask a database questions", "Hazle preguntas a una base de datos"), { needs: ["u17-excel"], href: "lessons/sql/" }),
    L(18, 1, "u18-resume", t("A finance resume and LinkedIn", "Currículum y LinkedIn para finanzas"), t("One page that gets you the call", "Una página que te consigue la llamada"), { needs: ["u16-wall-street"] }),
    L(18, 2, "u18-recruiting", t("Networking and recruiting", "Contactos y reclutamiento"), t("Coffee chats, timelines and internships", "Charlas, fechas y prácticas"), { needs: ["u18-resume"] }),
    L(18, 3, "u18-interviews", t("Acing the interview", "Cómo destacar en la entrevista"), t("Your story and the technical questions", "Tu historia y las preguntas técnicas"), { needs: ["u15-dcf", "u12-three-statements"] }),
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

  // ---------- Badges, streaks and notifications ----------
  // Course-wide badges, checked after every save. Badges earned inside a lesson use FH.badge(id, name) instead.
  const ICON = {
    coin: '<circle cx="12" cy="12" r="8"/><circle cx="11" cy="13" r="4"/>',
    chart: '<path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/>',
    books: '<path d="M5 4h4v16H5zM10 4h4v16h-4zM15 5.5l3.6-1 3.4 14.6-3.6 1z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    clip: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2M9 13l2 2 4-4"/>',
    shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    flame: '<path d="M12 21c-3.5 0-6-2.5-6-6 0-4 4-6 4-11 3 2 5 5 5 8 1-.8 1.5-2 1.5-3 1.5 1.6 2.5 3.8 2.5 6 0 3.5-3 6-7 6z"/>',
    ear: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  };
  const doneCount = () => Object.values(state.lessons).filter((l) => l.completedAt).length;
  const ACHIEVEMENTS = [
    { id: "first-lesson", tier: "bronze", icon: "coin", name: t("First Deposit", "Primer depósito"), how: t("Finish your first lesson.", "Termina tu primera lección."), test: () => doneCount() >= 1 },
    { id: "five-lessons", tier: "silver", icon: "chart", name: t("Building Interest", "Generando intereses"), how: t("Finish 5 lessons.", "Termina 5 lecciones."), test: () => doneCount() >= 5 },
    { id: "fifteen-lessons", tier: "gold", icon: "books", name: t("Blue Chip", "Acción de primera"), how: t("Finish 15 lessons.", "Termina 15 lecciones."), test: () => doneCount() >= 15 },
    { id: "full-unit", tier: "green", icon: "check", name: t("Unit Closed", "Unidad cerrada"), how: t("Finish every lesson in a unit.", "Termina todas las lecciones de una unidad."),
      test: () => PARTS.flatMap((p) => p.units).some((u) => { const ls = CATALOG.filter((l) => l.unit === u); return ls.length && ls.every((l) => FH.done(l.id)); }) },
    { id: "whole-course", tier: "gold", icon: "trophy", name: t("Wall Street Ready", "Listo para Wall Street"), how: t("Finish every lesson in the course.", "Termina todas las lecciones del curso."), test: () => CATALOG.every((l) => FH.done(l.id)) },
    { id: "path-set", tier: "green", icon: "route", name: t("Mapped Out", "Camino trazado"), how: t("Choose your path.", "Elige tu camino."), test: () => FH.path.setUp },
    { id: "placement", tier: "silver", icon: "clip", name: t("Know Your Worth", "Sabes lo que vales"), how: t("Take the quick quiz of what you know.", "Haz la prueba rápida de lo que sabes."), test: () => !!(state.profile && state.profile.quiz) },
    { id: "explorer", tier: "bronze", icon: "compass", name: t("Off the Beaten Path", "Fuera del camino"), how: t("Finish a lesson that isn't on your path.", "Termina una lección que no está en tu camino."),
      test: () => { const { items, setUp } = FH.path; if (!setUp) return false; const on = new Set(items.filter((x) => x.lesson).map((x) => x.lesson.id)); return CATALOG.some((l) => FH.done(l.id) && !on.has(l.id)); } },
    { id: "account", tier: "green", icon: "shield", name: t("Vault Secured", "Bóveda asegurada"), how: t("Create your free account.", "Crea tu cuenta gratis."), test: () => false },
    { id: "streak-3", tier: "flame", icon: "flame", name: t("On a Roll", "En racha"), how: t("Show up 3 days in a row.", "Entra 3 días seguidos."), test: () => state.streak.best >= 3 },
    { id: "streak-7", tier: "flame", icon: "flame", name: t("Week Strong", "Semana completa"), how: t("Show up 7 days in a row.", "Entra 7 días seguidos."), test: () => state.streak.best >= 7 },
    { id: "streak-30", tier: "gold", icon: "flame", name: t("Habit Formed", "Hábito formado"), how: t("Show up 30 days in a row.", "Entra 30 días seguidos."), test: () => state.streak.best >= 30 },
  ];
  // Badges won inside a lesson's game or activity: [id, lesson folder, name, how to earn it]. Shown on the wall even before they're earned.
  const GAME_BADGES = [
    ["fee-dodger", "bank-fees", t("Fee Dodger", "Esquiva comisiones"), t("Dodge every fee in the debit card game.", "Esquiva todas las comisiones en el juego de la tarjeta de débito.")],
    ["fee-reader", "brokerage", t("Fine Print Reader", "Lector de letra chiquita"), t("Check every fee on the brokerage fee sheet.", "Revisa todas las comisiones de la hoja de la casa de bolsa.")],
    ["account-opener", "brokerage", t("Account Opener", "Cuenta abierta"), t("Get 6 of 6 in the open-an-account game.", "Saca 6 de 6 en el juego de abrir una cuenta.")],
    ["dollar-grid", "budgeting", t("Every Dollar Has a Job", "Cada dólar tiene un trabajo"), t("Give your coins jobs at exactly 50/30/20.", "Reparte tus monedas exactamente en 50/30/20.")],
    ["month-survivor-a", "budgeting", t("Month Survivor: A", "Sobrevive al mes: A"), t("Get an A in Month Survivor.", "Saca A en Sobrevive al mes.")],
    ["smart-split", "checking-savings", t("Smart Split", "Buen reparto"), t("Find a smart split between checking and savings.", "Encuentra un buen reparto entre cheques y ahorro.")],
    ["bank-app-a", "checking-savings", t("Bank App Pro", "Experto en la app del banco"), t("Get an A in the bank app game.", "Saca A en el juego de la app del banco.")],
    ["order-pro", "first-trade", t("Order Desk Pro", "Pro de las órdenes"), t("Fill all 4 orders right at the order desk.", "Llena bien las 4 órdenes en la mesa de órdenes.")],
    ["fund-shopper", "index-funds", t("Fund Shopper", "Comprador de fondos"), t("Pick the right fund 4 out of 4 times.", "Elige el fondo correcto 4 de 4 veces.")],
    ["time-traveler", "why-invest", t("Time Traveler", "Viajero del tiempo"), t("Travel back in time with real market history.", "Viaja al pasado con la historia real del mercado.")],
    ["beat-inflation-a", "inflation", t("Beat Inflation: A", "Gánale a la inflación: A"), t("Get an A in Beat Inflation.", "Saca A en Gánale a la inflación.")],
    ["volcker", "interest-rates", t("Channeling Volcker", "Al estilo Volcker"), t("Push the Fed's rate to 9% or higher.", "Sube la tasa de la Fed a 9% o más.")],
    ["rate-dial-a", "interest-rates", t("Rate Dial: A", "El dial de tasas: A"), t("Get an A in Rate Dial.", "Saca A en El dial de tasas.")],
    ["steady-hands", "market-drops", t("Steady Hands", "Pulso firme"), t("Ride out the crashes without selling.", "Aguanta las caídas sin vender.")],
    ["money-mover", "moving-money", t("Money Mover", "Experto en mover dinero"), t("Pick the right way to move all 6 payments.", "Elige bien cómo mover los 6 pagos.")],
    ["fine-print", "open-account", t("Fine Print Detective", "Detective de letra chica"), t("Spot the catch in all 6 account offers.", "Encuentra la trampa en las 6 ofertas de cuenta.")],
    ["stub-detective", "pay-stub", t("Stub Detective", "Detective de talones"), t("Catch every mistake on 6 pay stubs.", "Encuentra todos los errores en 6 talones de pago.")],
    ["retirement-ready", "retirement", t("Retirement Ready", "Listo para el retiro"), t("Make all 4 benefits-day choices right.", "Toma bien las 4 decisiones del día de beneficios.")],
    ["ppf-explorer", "scarcity", t("Frontier Explorer", "Explorador de la frontera"), t("Test all 3 kinds of plans on the frontier.", "Prueba los 3 tipos de plan en la frontera.")],
    ["ten-hours-a", "scarcity", t("Ten Free Hours: A", "Diez horas libres: A"), t("Get an A in Ten Free Hours.", "Saca A en Diez horas libres.")],
    ["quote-reader", "stocks", t("Quote Reader", "Lector de cotizaciones"), t("Tap all 6 parts of a stock quote.", "Toca las 6 partes de una cotización.")],
    ["scatter-hoarder", "stocks", t("Scatter Hoarder", "Ardilla previsora"), t("Finish the stock-picking game.", "Termina el juego de elegir acciones.")],
    ["found-equilibrium", "supply-demand", t("Found the Equilibrium", "Encontraste el equilibrio"), t("Find the price where supply meets demand.", "Encuentra el precio donde la oferta y la demanda se igualan.")],
    ["market-stall-a", "supply-demand", t("Market Stall: A", "Puesto del mercado: A"), t("Get an A in Market Stall.", "Saca A en Puesto del mercado.")],
    ["bracket-pro", "taxes", t("Bracket Pro", "Experto en categorías"), t("Pour all 6 paychecks into the right brackets.", "Reparte bien los 6 sueldos en sus categorías.")],
    ["mail-sorter", "file-taxes", t("Ready to File", "Listo para declarar"), t("Sort all 8 pieces of tax mail right.", "Ordena bien las 8 cosas del correo de impuestos.")],
    ["rainy-day", "emergency-fund", t("Rainy-Day Ready", "Listo para la lluvia"), t("Make all 6 emergency fund calls right.", "Decide bien las 6 sorpresas del fondo de emergencia.")],
    ["rate-shopper", "high-yield", t("Rate Shopper", "Cazador de tasas"), t("Pick the better account all 6 times.", "Elige la mejor cuenta las 6 veces.")],
    ["score-keeper", "credit-scores", t("Score Keeper", "Guardián del puntaje"), t("Call all 8 score moves right.", "Acierta las 8 jugadas de crédito.")],
    ["statement-pro", "credit-cards", t("Statement Pro", "Experto en estados de cuenta"), t("Answer all 6 statement questions right.", "Acierta las 6 preguntas del estado de cuenta.")],
    ["loan-detective", "loans", t("Loan Detective", "Detective de préstamos"), t("Solve all 6 loan cases right.", "Resuelve bien los 6 casos de préstamos.")],
    ["claims-pro", "insurance", t("Claims Pro", "Experto en reclamos"), t("Settle all 6 insurance claims right.", "Resuelve bien los 6 reclamos de seguro.")],
    ["scam-spotter", "scams", t("Scam Spotter", "Detector de estafas"), t("Judge all 8 messages right in Scam or legit.", "Juzga bien los 8 mensajes del juego Estafa o legítimo.")],
    ["lease-ready", "renting", t("Lease Ready", "Listo para rentar"), t("Answer all 8 Lease check questions right.", "Responde bien las 8 preguntas del juego Revisa el contrato.")],
    ["car-smart", "buying-car", t("Car Smart", "Experto en carros"), t("Answer all 8 Car lot questions right.", "Responde bien las 8 preguntas del juego Lote de carros.")],
    ["home-smart", "rent-vs-buy", t("Home Smart", "Experto en vivienda"), t("Answer all 8 House hunt questions right.", "Responde bien las 8 preguntas del juego Busca casa.")],
    ["cycle-reader", "business-cycle", t("Cycle Reader", "Lector de ciclos"), t("Place all 8 headlines right in Name the phase.", "Ubica bien los 8 titulares del juego Nombra la fase.")],
    ["percent-pro", "percentages", t("Percent Pro", "Experto en porcentajes"), t("Answer all 8 questions right in Percent sprint.", "Responde bien las 8 preguntas del juego Carrera de porcentajes.")],
    ["time-traveler", "time-value", t("Time Traveler", "Viajero del tiempo"), t("Answer all 8 offers right in Now or later.", "Responde bien las 8 ofertas del juego Hoy o después.")],
    ["bias-buster", "money-mind", t("Bias Buster", "Detector de sesgos"), t("Name all 8 traps right in Name the trap.", "Nombra bien las 8 trampas del juego Nombra la trampa.")],
    ["in-the-black", "price-profit", t("In the Black", "Números negros"), t("Answer all 8 businesses right in Break-even or bust.", "Responde bien los 8 negocios del juego Equilibrio o quiebra.")],
    ["cash-keeper", "cash-flow", t("Cash Keeper", "Guardián del efectivo"), t("Answer all 8 questions right in Cash or crash.", "Responde bien las 8 preguntas del juego Efectivo o quiebra.")],
    ["by-the-book", "legal-setup", t("By the Book", "En regla"), t("Answer all 8 questions right in Pick the paperwork.", "Responde bien las 8 preguntas del juego Elige los trámites.")],
    ["bottom-liner", "income-statement", t("Bottom Liner", "Experto en utilidades"), t("Answer all 8 questions right in Line it up.", "Responde bien las 8 preguntas del juego Ponlo en orden.")],
    ["balanced-books", "balance-sheet", t("Balanced Books", "Cuentas cuadradas"), t("Answer all 8 questions right in Keep it balanced.", "Responde bien las 8 preguntas del juego Que cuadre.")],
    ["dot-connector", "three-statements", t("Dot Connector", "Conectas los puntos"), t("Answer all 8 questions right in Connect the dots.", "Responde bien las 8 preguntas del juego Une los puntos.")],
    ["deal-maker", "raising-money", t("Deal Maker", "Cierras tratos"), t("Answer all 8 questions right in Debt or equity.", "Responde bien las 8 preguntas del juego ¿Deuda o capital?")],
    ["value-creator", "npv", t("Value Creator", "Creas valor"), t("Answer all 8 questions right in Build it or skip it.", "Responde bien las 8 preguntas del juego ¿Lo haces o no?")],
    ["hurdle-setter", "cost-of-capital", t("Hurdle Setter", "Fijas la tasa mínima"), t("Answer all 8 questions right in Clear the hurdle.", "Responde bien las 8 preguntas del juego Supera la tasa mínima.")],
    ["risk-weigher", "risk-return", t("Risk Weigher", "Mides el riesgo"), t("Answer all 8 questions right in Pick your risk.", "Responde bien las 8 preguntas del juego Elige tu riesgo.")],
    ["well-diversified", "diversification", t("Well Diversified", "Bien diversificado"), t("Answer all 8 questions right in Spread it out.", "Responde bien las 8 preguntas del juego Repártelo bien.")],
    ["bond-reader", "bonds", t("Bond Reader", "Lees bonos"), t("Answer all 8 questions right in Bond desk.", "Responde bien las 8 preguntas del juego Mesa de bonos.")],
    ["dcf-builder", "dcf", t("DCF Builder", "Arma un DCF"), t("Answer all 8 questions right in Valuation desk.", "Responde bien las 8 preguntas del juego Mesa de valuación.")],
    ["comps-pro", "multiples", t("Comps Pro", "Domina los comparables"), t("Answer all 8 questions right in Comps table.", "Responde bien las 8 preguntas del juego Mesa de comparables.")],
    ["deal-closer", "mergers", t("Deal Closer", "Cierra tratos"), t("Answer all 8 questions right in Deal room.", "Responde bien las 8 preguntas del juego Mesa de negociación.")],
    ["street-smart", "wall-street", t("Street Smart", "Conoce Wall Street"), t("Answer all 8 questions right in the Who does it? game.", "Responde bien las 8 preguntas del juego ¿Quién lo hace?")],
    ["market-mover", "trading", t("Market Mover", "Mueve el mercado"), t("Answer all 8 questions right in Trading desk.", "Responde bien las 8 preguntas del juego Mesa de operaciones.")],
    ["hedge-master", "derivatives", t("Hedge Master", "Domina las coberturas"), t("Answer all 8 questions right in Derivatives desk.", "Responde bien las 8 preguntas del juego Mesa de derivados.")],
    ["formula-pro", "spreadsheets", t("Formula Pro", "Domina las fórmulas"), t("Answer all 8 questions right in Formula check.", "Responde bien las 8 preguntas del juego Revisa la fórmula.")],
    ["python-pro", "python", t("Python Pro", "Domina Python"), t("Answer all 8 questions right in Code check.", "Responde bien las 8 preguntas del juego Revisa el código.")],
    ["query-pro", "sql", t("Query Pro", "Domina las consultas"), t("Answer all 8 questions right in Query check.", "Responde bien las 8 preguntas del juego Revisa la consulta.")],
    ["right-jar", "why-invest", t("Right Jar", "El frasco correcto"), t("Sort all 6 into the right jar on the first try.", "Pon los 6 en el frasco correcto al primer intento.")],
  ].map(([id, slug, name, how]) => ({ id, slug, name, how, tier: "silver", icon: "star", kind: "game" }));
  const lessonTitle = (slug) => { const l = CATALOG.find((x) => x.href === `lessons/${slug}/`); return l ? l.title : slug; };
  // Every lesson also has three of its own: listen to all of it, fill every blank, ace the quiz.
  const perLesson = (id) => {
    let m = /^listened-(.+)$/.exec(id);
    if (m) return { id, tier: "bronze", icon: "ear", kind: "lesson", name: t("Good Listener", "Buen oyente"), how: t(`Listened to all of ${lessonTitle(m[1])}.`, `Escuchaste toda la lección ${lessonTitle(m[1])}.`) };
    m = /^blanks-(.+)$/.exec(id);
    if (m) return { id, tier: "bronze", icon: "pen", kind: "lesson", name: t("Note Taker", "Buenos apuntes"), how: t(`Filled every blank in ${lessonTitle(m[1])}.`, `Llenaste todos los espacios de ${lessonTitle(m[1])}.`) };
    m = /^quiz-(.+)-perfect$/.exec(id);
    if (m) return { id, tier: "gold", icon: "check", kind: "lesson", name: t("Perfect Quiz", "Examen perfecto"), how: t(`Got every quiz question right in ${lessonTitle(m[1])}.`, `Acertaste todo el examen de ${lessonTitle(m[1])}.`) };
    return null;
  };
  const TIERS = { bronze: "#b0793f", silver: "#7f8c99", gold: "#c3952a", green: "#1f6f5a", flame: "#d0602a" };
  // A badge as a round medal: tier color, a ring like the logo's, and its icon. Locked badges are gray.
  const medal = (b, earned = true) => `<svg class="medal${earned ? "" : " locked"}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="${earned ? TIERS[b.tier] || TIERS.green : "var(--line)"}"/><circle cx="32" cy="32" r="25" fill="none" stroke="${earned ? "rgba(255,255,255,.4)" : "var(--paper)"}" stroke-width="2"/><g transform="translate(18 18) scale(1.17)" fill="none" stroke="${earned ? "#fff" : "var(--ink-3)"}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[b.icon] || ICON.star}</g></svg>`;
  // Everything about a badge by its id. Old ids from earlier versions of the site return null and aren't shown.
  const info = (id) => ACHIEVEMENTS.find((a) => a.id === id) || GAME_BADGES.find((a) => a.id === id) || perLesson(id);
  const award = (id) => {
    if (state.badges.includes(id)) return false;
    state.badges.push(id);
    state.notes.push({ id, at: new Date().toISOString(), read: false });
    if (state.notes.length > 40) state.notes = state.notes.slice(-40);
    return true;
  };
  // Show off a new badge for a few seconds (site.js draws it; this just asks).
  const celebrate = (id) => { const b = info(id); if (b) document.dispatchEvent(new CustomEvent("fh:badge", { detail: b })); };
  const checkBadges = () => {
    const fresh = ACHIEVEMENTS.filter((a) => !state.badges.includes(a.id) && a.test()).map((a) => a.id);
    fresh.forEach(award);
    if (fresh.length) { persist(); celebrate(fresh[fresh.length - 1]); }
  };
  // Today's date on the learner's own clock, like 2026-11-01.
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const touchStreak = () => {
    const st = state.streak || (state.streak = { days: 0, best: 0, last: null });
    const today = day();
    if (st.last === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    st.days = st.last === day(y) ? st.days + 1 : 1;
    st.best = Math.max(st.best || 0, st.days);
    st.last = today;
    persist();
  };
  // The streak still counts if they came yesterday; after that it's broken.
  const liveStreak = () => { const st = state.streak || {}; const y = new Date(); y.setDate(y.getDate() - 1); return st.last === day() || st.last === day(y) ? st.days : 0; };

  const emit = () => { checkBadges(); document.dispatchEvent(new CustomEvent("fh:save", { detail: state })); };

  window.FH = {
    get state() { return state; },
    lesson,
    addXP(n, why) {
      state.xp += n;
      persist();
      emit();
      if (why) toast(`+${n} XP · ${why}`);
    },
    // A badge earned inside a lesson (a perfect quiz, a game won). Its name and how-to live in GAME_BADGES / perLesson.
    badge(id) {
      if (state.badges.includes(id)) return;
      award(id);
      persist();
      emit();
      celebrate(id);
    },
    // A course-wide badge that can't be checked from the save alone (like creating an account).
    award(id) { if (award(id)) { persist(); emit(); celebrate(id); } },
    ACHIEVEMENTS,
    GAME_BADGES,
    badgeInfo: info,
    medal,
    streak: liveStreak,
    // Mark every notification as seen.
    readNotes() { if (state.notes.some((n) => !n.read)) { state.notes.forEach((n) => { n.read = true; }); persist(); emit(); } },
    setAvatar(dataUrl) { state.avatar = dataUrl; persist(); emit(); },
    setBanner(id) { state.banner = id; persist(); emit(); },
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
    setMotion(on) {
      try { localStorage.setItem("fh-motion", on ? "reduce" : "full"); } catch (e) { /* storage blocked */ }
      applyMotion();
    },
    still: () => document.documentElement.dataset.motion === "reduce",
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
    unitPhoto,
    CATALOG,
    partOf,
    buildPath,
    done: (id) => !!(state.lessons[id] && state.lessons[id].completedAt),
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
    // Drop the goals and quiz results so the whole course shows again. `done` stays so setup isn't forced again.
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
      touchStreak();
      // A language saved on the account wins in this browser too.
      if (state.lang) try { localStorage.setItem("fh-lang", state.lang); } catch (e) { /* storage blocked */ }
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
      document.dispatchEvent(new CustomEvent("fh:save", { detail: state, bubbles: false }));
    },
    toast,
    money: (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"),
  };
  // Every visit counts toward the streak; then catch up on any badges this save already qualifies for.
  touchStreak();
  setTimeout(checkBadges, 600); // after site.js is listening, so a new badge gets its pop-up
})();
