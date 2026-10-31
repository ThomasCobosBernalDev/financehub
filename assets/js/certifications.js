// Certifications page: pick a finance job, see which certificates to get at each stage (and what they cost),
// or compare every certificate in one table. Facts checked against each issuer's site in October 2026.
(function () {
const T = FH.t;
const root = document.body.dataset.root || "./";
const box = document.getElementById("cert-map");
const rail = document.getElementById("cx-jobs"), panel = document.getElementById("cx-panel"), stagePick = document.getElementById("cx-stage");

// Every certificate. cost/time/exam/need are short, plain lines. sponsor: a firm must sign you up, so you take it after you're hired.
// units: FinancedHub units that teach what it tests.
const C = (id, short, name, org, url, o) => Object.assign({ id, short, name, org, url }, o);
const CERTS = [
  C("forage", T("Job simulations", "Simulaciones de trabajo"), T("Virtual job simulations", "Simulaciones virtuales de trabajo"), "Forage (J.P. Morgan, Citi, Goldman Sachs…)", "https://www.theforage.com/",
    { cost: T("Free", "Gratis"), free: 1, time: T("5 to 7 hours each", "5 a 7 horas cada una"), exam: T("No exam. You do sample tasks a real analyst would do.", "Sin examen. Haces tareas de muestra como las de un analista de verdad."),
      need: T("Anyone, any age", "Cualquier persona, de cualquier edad"), pays: "you",
      what: T("A taste of the job before you apply, and a line for your résumé that shows you're curious.", "Pruebas el trabajo antes de aplicar y ganas una línea para tu currículum que muestra interés."), units: [18] }),
  C("bmc", "BMC", "Bloomberg Market Concepts", "Bloomberg", "https://portal.bloombergforeducation.com/",
    { cost: T("Free on a school Bloomberg Terminal, otherwise about $150 (students) to $250", "Gratis en una terminal Bloomberg de tu escuela; si no, unos $150 (estudiantes) a $250"), free: 1,
      time: T("8 to 12 hours", "8 a 12 horas"), exam: T("Short quizzes after each video module", "Pruebas cortas después de cada módulo de video"), need: T("Anyone", "Cualquier persona"), pays: "you",
      what: T("How economics, interest rates, currencies and stocks connect, taught on the same screens Wall Street uses.", "Cómo se conectan la economía, las tasas de interés, las monedas y las acciones, en las mismas pantallas que usa Wall Street."), units: [9, 14, 16] }),
  C("yale", T("Financial Markets", "Mercados financieros"), T("Financial Markets (Yale, on Coursera)", "Mercados financieros (Yale, en Coursera)"), "Yale University · Coursera", "https://www.coursera.org/learn/financial-markets-global",
    { cost: T("Free to watch, $49 for the certificate", "Gratis para ver, $49 por el certificado"), free: 1, time: T("About 30 hours", "Unas 30 horas"),
      exam: T("Weekly quizzes", "Pruebas semanales"), need: T("Anyone", "Cualquier persona"), pays: "you",
      what: T("A Nobel Prize winner (Robert Shiller) explains stocks, bonds, banks and risk.", "Un ganador del Premio Nobel (Robert Shiller) explica acciones, bonos, bancos y riesgo."), units: [5, 14, 16] }),
  C("excel", "Excel (MOS)", "Microsoft Office Specialist: Excel", "Microsoft · Certiport", "https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Overview",
    { cost: T("About $100 per exam (testing centers set the price)", "Unos $100 por examen (cada centro pone su precio)"), time: T("20 to 40 hours of practice", "20 a 40 horas de práctica"),
      exam: T("50 minutes of real tasks in Excel", "50 minutos de tareas reales en Excel"), need: T("Anyone", "Cualquier persona"), pays: "you",
      what: T("Proves you can build formulas, tables and charts. Every finance job lives in Excel.", "Demuestra que sabes hacer fórmulas, tablas y gráficas. Todo trabajo de finanzas vive en Excel."), units: [17] }),
  C("model", T("Financial modeling", "Modelos financieros"), T("Financial modeling course (FMVA, Wall Street Prep or BIWS)", "Curso de modelos financieros (FMVA, Wall Street Prep o BIWS)"), "CFI · Wall Street Prep · BIWS", "https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva-program/",
    { cost: T("About $300 to $850 a year, often on sale. Many schools get it cheaper.", "Unos $300 a $850 al año, seguido en oferta. Muchas escuelas lo consiguen más barato."), time: T("About 100 hours at your own pace", "Unas 100 horas a tu ritmo"),
      exam: T("Online tests and a model you build", "Pruebas en línea y un modelo que tú armas"), need: T("Anyone. Know basic accounting first.", "Cualquier persona. Primero aprende contabilidad básica."), pays: "you",
      what: T("Teaches the 3-statement model and valuation that interviews test you on. It's a course, not a license.", "Enseña el modelo de 3 estados y la valuación que te preguntan en entrevistas. Es un curso, no una licencia."), units: [12, 13, 15] }),
  C("sie", "SIE", "Securities Industry Essentials", "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/securities-industry-essentials-exam",
    { cost: "$100", time: T("About 50 to 80 hours", "Unas 50 a 80 horas"), exam: T("75 questions in 1 h 45 min", "75 preguntas en 1 h 45 min"),
      need: T("Anyone 18 or older. No firm needed. A pass counts for 4 years.", "Cualquier persona de 18 años o más. No necesitas empresa. Aprobarlo vale por 4 años."), pays: "you",
      what: T("The entry exam for Wall Street: stocks, bonds, funds and the rules. Passing it before you apply shows you're serious.", "El examen de entrada a Wall Street: acciones, bonos, fondos y las reglas. Aprobarlo antes de aplicar muestra que vas en serio."), units: [5, 14, 16] }),
  C("s6", "Series 6", T("Series 6: funds and annuities", "Serie 6: fondos y anualidades"), "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/series6",
    { cost: "$100", time: T("About 40 to 60 hours", "Unas 40 a 60 horas"), exam: T("50 questions in 1 h 30 min", "50 preguntas en 1 h 30 min"), sponsor: 1,
      need: T("A firm must sponsor you, plus the SIE", "Una empresa debe patrocinarte, más el SIE"), pays: "firm",
      what: T("Lets you sell mutual funds and variable annuities, common at banks and insurance companies.", "Te permite vender fondos mutuos y anualidades variables, común en bancos y aseguradoras."), units: [5] }),
  C("s7", "Series 7", T("Series 7: general securities", "Serie 7: valores en general"), "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/series7",
    { cost: "$395", time: T("About 100 to 150 hours", "Unas 100 a 150 horas"), exam: T("125 questions in 3 h 45 min", "125 preguntas en 3 h 45 min"), sponsor: 1,
      need: T("A firm must sponsor you, plus the SIE", "Una empresa debe patrocinarte, más el SIE"), pays: "firm",
      what: T("The main license to buy and sell stocks, bonds and options for clients.", "La licencia principal para comprar y vender acciones, bonos y opciones para clientes."), units: [5, 14, 16] }),
  C("s57", "Series 57", T("Series 57: securities trader", "Serie 57: operador de valores"), "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/series57",
    { cost: "$105", time: T("About 40 to 60 hours", "Unas 40 a 60 horas"), exam: T("50 questions in 1 h 45 min", "50 preguntas en 1 h 45 min"), sponsor: 1,
      need: T("A firm must sponsor you, plus the SIE", "Una empresa debe patrocinarte, más el SIE"), pays: "firm",
      what: T("Required for traders who place trades for the firm.", "Obligatoria para quienes hacen operaciones para la empresa."), units: [16] }),
  C("s63", "Series 63", T("Series 63: state law", "Serie 63: leyes estatales"), "NASAA", "https://www.nasaa.org/exams/series-63-exam/",
    { cost: "$147", time: T("About 20 to 30 hours", "Unas 20 a 30 horas"), exam: T("60 questions in 1 h 15 min", "60 preguntas en 1 h 15 min"),
      need: T("Usually taken with the Series 6 or 7 once you're hired", "Por lo general se toma junto con la Serie 6 o 7 cuando ya te contrataron"), pays: "firm",
      what: T("Covers each state's rules for selling investments. Most firms want it right next to the Series 7.", "Cubre las reglas de cada estado para vender inversiones. Casi todas las empresas la piden junto con la Serie 7."), units: [5] }),
  C("s65", "Series 65", T("Series 65: investment adviser", "Serie 65: asesor de inversiones"), "NASAA", "https://www.nasaa.org/exams/series-65-exam/",
    { cost: "$187", time: T("About 60 to 100 hours", "Unas 60 a 100 horas"), exam: T("130 questions in 3 h", "130 preguntas en 3 h"),
      need: T("Anyone. No firm needed.", "Cualquier persona. No necesitas empresa."), pays: "you",
      what: T("Lets you charge a fee to give investment advice.", "Te permite cobrar por dar consejos de inversión."), units: [5, 14] }),
  C("s66", "Series 66", T("Series 66: adviser and state law", "Serie 66: asesor y leyes estatales"), "NASAA", "https://www.nasaa.org/exams/series-66-exam/",
    { cost: "$177", time: T("About 40 to 60 hours", "Unas 40 a 60 horas"), exam: T("100 questions in 2 h 30 min", "100 preguntas en 2 h 30 min"),
      need: T("Counts only with the Series 7", "Solo cuenta junto con la Serie 7"), pays: "firm",
      what: T("The Series 63 and 65 in one exam, for advisers who also hold the Series 7.", "La Serie 63 y la 65 en un solo examen, para asesores que ya tienen la Serie 7."), units: [5] }),
  C("s79", "Series 79", T("Series 79: investment banking", "Serie 79: banca de inversión"), "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/series79",
    { cost: "$395", time: T("About 80 to 100 hours", "Unas 80 a 100 horas"), exam: T("75 questions in 2 h 30 min", "75 preguntas en 2 h 30 min"), sponsor: 1,
      need: T("A firm must sponsor you, plus the SIE", "Una empresa debe patrocinarte, más el SIE"), pays: "firm",
      what: T("The license for bankers who work on mergers, IPOs and raising money for companies.", "La licencia para banqueros que trabajan en fusiones, salidas a bolsa y en conseguir dinero para empresas."), units: [13, 15] }),
  C("s86", "Series 86/87", T("Series 86 and 87: research analyst", "Series 86 y 87: analista de investigación"), "FINRA", "https://www.finra.org/registration-exams-ce/qualification-exams/series86-87",
    { cost: T("$295 + $195", "$295 + $195"), time: T("About 100 to 150 hours for both", "Unas 100 a 150 horas las dos"), exam: T("86: 85 questions in 4 h 30 min · 87: 50 questions in 1 h 45 min", "86: 85 preguntas en 4 h 30 min · 87: 50 preguntas en 1 h 45 min"), sponsor: 1,
      need: T("A firm must sponsor you, plus the SIE", "Una empresa debe patrocinarte, más el SIE"), pays: "firm",
      what: T("Needed to publish stock research reports. The 86 is valuation, the 87 is the rules.", "Necesarias para publicar reportes sobre acciones. La 86 es valuación, la 87 son las reglas."), units: [12, 15] }),
  C("cfa", "CFA", "Chartered Financial Analyst", "CFA Institute", "https://www.cfainstitute.org/programs/cfa-program",
    { cost: T("$1,140 to $1,590 per level (3 levels). Early sign-up is cheaper.", "$1,140 a $1,590 por nivel (3 niveles). Inscribirte temprano es más barato."), time: T("About 300 hours per level, 2 to 4 years in all", "Unas 300 horas por nivel, de 2 a 4 años en total"),
      exam: T("3 exams, Level I, II and III", "3 exámenes: Nivel I, II y III"),
      need: T("Level I in your last two years of college. The charter also needs 4,000 hours of work over 3+ years.", "El Nivel I en tus últimos dos años de universidad. El título también pide 4,000 horas de trabajo en 3 años o más."), pays: "both",
      what: T("The best-known credential in investing: accounting, valuation, economics, portfolios and ethics.", "El título más conocido en inversiones: contabilidad, valuación, economía, portafolios y ética."), units: [12, 13, 14, 15] }),
  C("caia", "CAIA", "Chartered Alternative Investment Analyst", "CAIA Association", "https://www.caia.org/",
    { cost: T("$400 to sign up, then $995 to $1,395 per level (2 levels)", "$400 de inscripción, luego $995 a $1,395 por nivel (2 niveles)"), time: T("About 200 hours per level", "Unas 200 horas por nivel"),
      exam: T("2 exams, Level I and II", "2 exámenes: Nivel I y II"), need: T("A bachelor's degree plus 1 year of work, or 4 years of work", "Licenciatura más 1 año de trabajo, o 4 años de trabajo"), pays: "both",
      what: T("Hedge funds, private equity, real estate and other investments beyond stocks and bonds.", "Fondos de cobertura, capital privado, bienes raíces y otras inversiones fuera de acciones y bonos."), units: [14] }),
  C("frm", "FRM", "Financial Risk Manager", "GARP", "https://www.garp.org/frm",
    { cost: T("$400 to sign up, then $600 to $800 per part (2 parts)", "$400 de inscripción, luego $600 a $800 por parte (2 partes)"), time: T("About 250 hours per part", "Unas 250 horas por parte"),
      exam: T("2 exams, Part I and II", "2 exámenes: Parte I y II"), need: T("Anyone can take the exams. The title needs 2 years of risk work.", "Cualquiera puede tomar los exámenes. El título pide 2 años de trabajo en riesgos."), pays: "both",
      what: T("Measuring and limiting what could go wrong: market crashes, bad loans and fraud.", "Medir y limitar lo que podría salir mal: caídas del mercado, préstamos malos y fraude."), units: [10, 14, 16] }),
  C("cpa", "CPA", "Certified Public Accountant", T("AICPA · NASBA · your state board", "AICPA · NASBA · la junta de tu estado"), "https://nasba.org/exams/cpaexam/",
    { cost: T("About $1,150 to $1,850 for the 4 exams, depending on your state", "Unos $1,150 a $1,850 por los 4 exámenes, según tu estado"), time: T("About 375 to 500 hours in all", "Unas 375 a 500 horas en total"),
      exam: T("4 exams: Audit, Financial accounting, Tax, plus one you pick", "4 exámenes: auditoría, contabilidad financiera, impuestos y uno que tú eliges"),
      need: T("150 college credits, or 120 credits plus 2 years of work in states with the new path (Texas since Aug 2026)", "150 créditos universitarios, o 120 créditos más 2 años de trabajo en los estados con la nueva ruta (Texas desde agosto de 2026)"), pays: "both",
      what: T("The license to sign audits and the top title in accounting and tax.", "La licencia para firmar auditorías y el título más alto en contabilidad e impuestos."), units: [2, 12] }),
  C("cma", "CMA", "Certified Management Accountant", "IMA", "https://www.imanet.org/",
    { cost: T("$300 to sign up + $545 per part (2 parts). Students pay $225 + $407.", "$300 de inscripción + $545 por parte (2 partes). Estudiantes pagan $225 + $407."), time: T("About 150 hours per part", "Unas 150 horas por parte"),
      exam: T("2 exams: planning and analysis, then strategy", "2 exámenes: planeación y análisis, luego estrategia"), need: T("A bachelor's degree. The title needs 2 years of work.", "Una licenciatura. El título pide 2 años de trabajo."), pays: "both",
      what: T("Budgets, forecasts and cost analysis: the work of a company's own finance team.", "Presupuestos, pronósticos y análisis de costos: el trabajo del equipo de finanzas de una empresa."), units: [12, 13] }),
  C("cfp", "CFP", "Certified Financial Planner", "CFP Board", "https://www.cfp.net/",
    { cost: T("$825 to $1,025 for the exam, plus the required classes", "$825 a $1,025 por el examen, más las clases obligatorias"), time: T("12 to 18 months of classes, then the exam", "12 a 18 meses de clases, luego el examen"),
      exam: T("1 exam, 170 questions over a day", "1 examen, 170 preguntas en un día"), need: T("A bachelor's degree and 6,000 hours of planning work (4,000 as an apprentice)", "Una licenciatura y 6,000 horas de trabajo en planeación (4,000 como aprendiz)"), pays: "both",
      what: T("The top title for helping families with budgets, taxes, insurance, investing and retirement.", "El título más alto para ayudar a familias con presupuesto, impuestos, seguros, inversión y retiro."), units: [1, 2, 3, 4, 5, 6, 7] }),
  C("ins", T("Insurance license", "Licencia de seguros"), T("State life and health insurance license", "Licencia estatal de seguros de vida y salud"), T("Your state's insurance department", "El departamento de seguros de tu estado"), "https://content.naic.org/state-insurance-departments",
    { cost: T("About $50 to $150 for the exam, plus a short class", "Unos $50 a $150 por el examen, más una clase corta"), time: T("About 20 to 40 hours", "Unas 20 a 40 horas"),
      exam: T("1 state exam, about 2 hours", "1 examen estatal, unas 2 horas"), need: T("18 or older. Some states need a pre-license class.", "18 años o más. Algunos estados piden una clase previa."), pays: "both",
      what: T("Lets you sell life and health insurance. Banks and advisers often want it too.", "Te permite vender seguros de vida y salud. Bancos y asesores también suelen pedirla."), units: [6] }),
  C("nmls", "NMLS", T("Mortgage loan originator license (SAFE test)", "Licencia para originar hipotecas (examen SAFE)"), "NMLS", "https://mortgage.nationwidelicensingsystem.org/",
    { cost: T("$110 for the test, plus a 20-hour class and state fees", "$110 por el examen, más una clase de 20 horas y cuotas del estado"), time: T("20 hours of class plus study", "20 horas de clase más estudio"),
      exam: T("1 national test", "1 examen nacional"), need: T("A background and credit check", "Revisión de antecedentes y de crédito"), pays: "both",
      what: T("Required to help people get home loans.", "Obligatoria para ayudar a la gente a conseguir préstamos para casa."), units: [4, 7] }),
];
const cert = Object.fromEntries(CERTS.map((c) => [c.id, c]));
// The side-by-side table shows one kind at a time so it stays short.
const KINDS = [
  { name: T("Free and starter", "Gratis y para empezar"), ids: ["forage", "bmc", "yale", "excel", "model"] },
  { name: T("Licenses", "Licencias"), ids: ["sie", "s6", "s7", "s57", "s63", "s65", "s66", "s79", "s86", "ins", "nmls"] },
  { name: T("Big titles", "Títulos grandes"), ids: ["cfa", "caia", "frm", "cpa", "cma", "cfp"] },
];
let kind = 0;

// Four stages, in order. The "Where are you now?" picker lights one up.
const STAGES = [
  { name: T("Start now", "Empieza ya"), sub: T("Free or cheap, any age", "Gratis o barato, a cualquier edad"), me: T("New to finance", "Nuevo en finanzas") },
  { name: T("Before you apply", "Antes de aplicar"), sub: T("Makes your résumé stand out", "Hace que tu currículum resalte"), me: T("In school", "En la escuela") },
  { name: T("Once you're hired", "Ya contratado"), sub: T("The job requires it", "El trabajo lo pide"), me: T("Just hired", "Recién contratado") },
  { name: T("To move up", "Para subir"), sub: T("Bigger roles, better pay", "Puestos más grandes, mejor sueldo"), me: T("A few years in", "Con unos años") },
];

// Jobs. stages: 4 lists of [certId, note?]; a "!" before the id marks a must-have.
const J = (id, group, name, does, tip, stages) => ({ id, group, name, does, tip, stages });
const GROUPS = [T("Wall Street", "Wall Street"), T("Investing and advice", "Inversión y asesoría"), T("Banking", "Banca"), T("Company finance", "Finanzas de empresa"), T("Risk and insurance", "Riesgo y seguros")];
const JOBS = [
  J("ib", 0, T("Investment banking", "Banca de inversión"), T("Help companies raise money and buy or sell other companies. Long hours building Excel models and pitch decks.", "Ayudas a empresas a conseguir dinero y a comprar o vender otras empresas. Muchas horas armando modelos en Excel y presentaciones."),
    T("Banks hire on internships, modeling skill and interviews. Nobody expects licenses before day one: the bank signs you up for the Series 79 and 63 after you start.", "Los bancos contratan por prácticas, habilidad con modelos y entrevistas. Nadie espera licencias antes del primer día: el banco te inscribe en la Serie 79 y la 63 cuando empiezas."),
    [["forage", "bmc"], ["!model", "sie"], ["!s79", "!s63"], ["cfa"]]),
  J("st", 0, T("Sales and trading", "Ventas y operaciones (trading)"), T("Buy and sell stocks, bonds and currencies for big clients, and explain the markets to them, all day, live.", "Compras y vendes acciones, bonos y monedas para clientes grandes y les explicas el mercado, todo el día, en vivo."),
    T("Know today's markets cold: interviewers ask what the S&P 500 and 10-year Treasury did this week. BMC helps with exactly that.", "Conoce el mercado de hoy al detalle: en entrevistas preguntan qué hicieron el S&P 500 y el bono del Tesoro a 10 años esta semana. El BMC ayuda justo con eso."),
    [["forage", "!bmc"], ["sie", "excel"], ["!s7", "!s63", "s57"], ["cfa"]]),
  J("er", 0, T("Equity research", "Análisis de acciones (equity research)"), T("Study a group of companies, build models and publish reports that say buy, hold or sell.", "Estudias un grupo de empresas, armas modelos y publicas reportes que dicen comprar, mantener o vender."),
    T("This is where the CFA matters most. Passing Level I while in school is one of the strongest signals you can send.", "Aquí es donde el CFA pesa más. Aprobar el Nivel I en la escuela es una de las señales más fuertes que puedes dar."),
    [["bmc", "yale"], ["!model", ["!cfa", T("Level I", "Nivel I")]], ["!s86"], [["cfa", T("Levels II and III", "Niveles II y III")]]]),
  J("pe", 0, T("Private equity", "Capital privado (private equity)"), T("Buy whole companies with investors' money, make them better, and sell them years later.", "Compras empresas completas con dinero de inversionistas, las mejoras y las vendes años después."),
    T("Most people get here after 2 years in investment banking or consulting. Start on the banking path and build modeling skill early.", "Casi todos llegan después de 2 años en banca de inversión o consultoría. Empieza por la ruta de banca y aprende modelos temprano."),
    [["bmc"], ["!model"], [], ["cfa", "caia"]]),
  J("am", 1, T("Asset management", "Administración de inversiones"), T("Pick the stocks and bonds for mutual funds, pensions and ETFs, or research them for the person who does.", "Eliges las acciones y bonos de fondos mutuos, pensiones y ETF, o los investigas para quien decide."),
    T("The CFA is close to expected here. Firms often pay for Levels II and III once you're hired.", "Aquí el CFA casi se da por hecho. Las empresas seguido pagan los Niveles II y III cuando ya te contrataron."),
    [["bmc", "yale"], ["sie", ["!cfa", T("Level I", "Nivel I")]], [["!cfa", T("Levels II and III", "Niveles II y III")]], ["caia"]]),
  J("wm", 1, T("Financial advisor", "Asesor financiero"), T("Help people and families plan, save and invest for school, a house and retirement.", "Ayudas a personas y familias a planear, ahorrar e invertir para la escuela, una casa y el retiro."),
    T("You can pass the SIE and Series 65 on your own. The Series 7 needs a firm, so most advisors start at one that trains them.", "Puedes aprobar el SIE y la Serie 65 por tu cuenta. La Serie 7 necesita una empresa, así que casi todos empiezan en una que los capacita."),
    [["yale"], ["!sie", "s65"], ["!s7", "!s66", "ins"], ["!cfp"]]),
  J("pb", 2, T("Personal banker", "Banquero personal"), T("Work in a bank branch: open accounts, explain loans and cards, and refer people to the bank's advisors.", "Trabajas en una sucursal: abres cuentas, explicas préstamos y tarjetas y mandas clientes a los asesores del banco."),
    T("A great first job with no degree required at many banks. Bigger banks pay for licenses so you can also sell investments.", "Un gran primer trabajo; muchos bancos no piden título. Los bancos grandes pagan las licencias para que también vendas inversiones."),
    [["forage"], ["sie"], ["s6", "s63", "ins"], ["s7", "cfp"]]),
  J("cb", 2, T("Commercial banking and credit", "Banca comercial y crédito"), T("Decide whether a business can pay back a loan: read its numbers, visit it, and write up the risk.", "Decides si una empresa puede pagar un préstamo: lees sus números, la visitas y escribes el riesgo."),
    T("Banks run their own credit training programs for new analysts, so no license is required. Accounting is the skill that matters.", "Los bancos tienen sus propios programas de crédito para analistas nuevos, así que no piden licencia. La contabilidad es lo que importa."),
    [["bmc", "forage"], ["!model", "excel"], [], ["cfa"]]),
  J("mlo", 2, T("Mortgage loan officer", "Oficial de préstamos hipotecarios"), T("Help people get a loan to buy a home, from the first call to closing day.", "Ayudas a la gente a conseguir un préstamo para comprar casa, desde la primera llamada hasta el cierre."),
    T("You can't take a loan application without the license, so lenders want it before or right as you start.", "No puedes tomar una solicitud de préstamo sin la licencia, así que los prestamistas la quieren antes o justo al empezar."),
    [[], ["!nmls"], [], ["cfp"]]),
  J("fpa", 3, T("Corporate finance (FP&A)", "Finanzas corporativas (FP&A)"), T("Work inside a company like Apple or H-E-B: build the budget, forecast sales, and tell leaders where money should go.", "Trabajas dentro de una empresa como Apple o H-E-B: armas el presupuesto, pronosticas ventas y dices a los líderes a dónde mandar el dinero."),
    T("Excel speed gets you hired. The CMA is built for exactly this job.", "La rapidez en Excel te consigue el trabajo. El CMA está hecho justo para este puesto."),
    [["!excel", "bmc"], ["model"], ["cma"], ["cpa", "cfa"]]),
  J("acct", 3, T("Accounting and audit", "Contabilidad y auditoría"), T("Keep a company's books, or check another company's books as an auditor (Deloitte, PwC, EY and KPMG are the big four).", "Llevas las cuentas de una empresa, o revisas las de otra como auditor (Deloitte, PwC, EY y KPMG son las cuatro grandes)."),
    T("The CPA is the one that counts. Many firms pay for your study course and give you time off to pass.", "El CPA es el que cuenta. Muchas firmas pagan tu curso y te dan días libres para aprobar."),
    [["excel"], [["!cpa", T("Start the exams", "Empieza los exámenes")]], [["!cpa", T("Finish and get licensed", "Termina y obtén la licencia")]], ["cma"]]),
  J("risk", 4, T("Risk management", "Administración de riesgos"), T("Measure what could go wrong for a bank or fund and set limits before it happens.", "Mides lo que podría salir mal en un banco o fondo y pones límites antes de que pase."),
    T("Math and coding (Python, SQL) matter as much as any certificate. The FRM is the one built for risk.", "Las matemáticas y programar (Python, SQL) importan tanto como cualquier certificado. El FRM es el hecho para riesgos."),
    [["bmc"], [["!frm", T("Part I", "Parte I")]], [["!frm", T("Part II", "Parte II")]], ["cfa"]]),
  J("insure", 4, T("Insurance agent", "Agente de seguros"), T("Help people protect their family, car and home with the right insurance.", "Ayudas a la gente a proteger a su familia, su carro y su casa con el seguro correcto."),
    T("The state license is the only must-have to start. Add investment licenses later if you want to sell annuities.", "La licencia estatal es lo único obligatorio para empezar. Suma licencias de inversión después si quieres vender anualidades."),
    [[], ["!ins"], ["s6", "s63"], ["cfp"]]),
];
const job = Object.fromEntries(JOBS.map((j) => [j.id, j]));
// Each stage entry is "id", "!id", or ["id" or "!id", note].
const entry = (e) => { const [raw, note] = Array.isArray(e) ? e : [e]; return { c: cert[raw.replace("!", "")], must: raw[0] === "!", note }; };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const PAYS = { you: T("You pay", "Pagas tú"), firm: T("Your employer pays", "Paga tu empleador"), both: T("You, or your employer", "Tú o tu empleador") };
const unitLinks = (c) => c.units.map((u) => `<a href="${root}course/#part-${FH.partOf(u).n}">${T("Unit", "Unidad")} ${u} · ${FH.UNIT_NAMES[u - 1]}</a>`).join("");

// Left rail: jobs by group, plus the side-by-side table.
rail.innerHTML = GROUPS.map((g, gi) => `<li class="cx-group">${g}</li>` + JOBS.filter((j) => j.group === gi).map((j) =>
  `<li><button class="cx-job" role="tab" data-job="${j.id}" aria-selected="false">${j.name}</button></li>`).join("")).join("")
  + `<li class="cx-group"></li><li><button class="cx-job cx-all" role="tab" data-job="all" aria-selected="false">${T("All certificates side by side", "Todos los certificados lado a lado")}</button></li>`;

// "Where are you now?" lights up one stage. Remembered in this browser only.
let me = 0;
try { me = Math.min(3, Math.max(0, +localStorage.getItem("fh-cert-stage") || 0)); } catch (e) {}
stagePick.innerHTML = `<span>${T("Where are you now?", "¿Dónde estás ahora?")}</span>` + STAGES.map((s, i) => `<button type="button" data-me="${i}" aria-pressed="false">${s.me}</button>`).join("");

let curJob = null, curCert = null;
const tile = (e, i) => `<button type="button" class="cx-tile${e.must ? " must" : ""}${e.c.free ? " free" : ""}" data-cert="${e.c.id}" data-stage="${i}">
  <b>${e.c.short}</b><small>${e.note ? esc(e.note) : e.c.org.split(" · ")[0].split(" (")[0]}</small>
  <span class="tags">${e.must ? `<i class="t-must">${T("Must-have", "Obligatorio")}</i>` : ""}${e.c.sponsor ? `<i>${T("Firm signs you up", "La empresa te inscribe")}</i>` : ""}${e.c.free ? `<i class="t-free">${T("Free option", "Opción gratis")}</i>` : ""}</span></button>`;

const detail = (c) => !c ? "" : `<div class="cx-detail" aria-live="polite">
  <div class="cx-d-head"><div><p class="kicker">${esc(c.org)}</p><h3>${c.name}</h3></div><a class="btn line sm" href="${c.url}" target="_blank" rel="noopener">${T("Official site", "Sitio oficial")}</a></div>
  <p class="cx-what">${c.what}</p>
  <dl>
    <div><dt>${T("Cost", "Costo")}</dt><dd>${c.cost}</dd></div>
    <div><dt>${T("Study time", "Tiempo de estudio")}</dt><dd>${c.time}</dd></div>
    <div><dt>${T("The test", "El examen")}</dt><dd>${c.exam}</dd></div>
    <div><dt>${T("Who can take it", "Quién puede tomarlo")}</dt><dd>${c.need}</dd></div>
    <div><dt>${T("Who pays", "Quién paga")}</dt><dd>${PAYS[c.pays]}</dd></div>
  </dl>
  <p class="cx-units"><span>${T("Get ready on FinancedHub:", "Prepárate en FinancedHub:")}</span>${unitLinks(c)}</p>
</div>`;

const showJob = (id) => {
  curJob = id;
  rail.querySelectorAll(".cx-job").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.job === id)));
  const sel = rail.querySelector(`[data-job="${id}"]`);
  if (sel && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: rail.scrollLeft + sel.getBoundingClientRect().left - rail.getBoundingClientRect().left - 16, behavior: "smooth" });
  box.classList.toggle("cx-table-on", id === "all");
  if (id === "all") return showTable();
  const j = job[id];
  const stages = j.stages.map((list) => list.map(entry));
  // Open on the must-have closest to where the learner is, so the details match their stage.
  const order = [me, me + 1, me + 2, me + 3, me - 1, me - 2, me - 3].filter((i) => i >= 0 && i < 4);
  const firstMust = order.map((i) => stages[i].find((e) => e.must)).find(Boolean);
  const first = firstMust || order.map((i) => stages[i][0]).find(Boolean);
  curCert = first && first.c.id;
  panel.innerHTML = `<div class="cx-pane">
    <p class="kicker">${GROUPS[j.group]}</p><h2>${j.name}</h2><p class="cx-does">${j.does}</p>
    <ol class="cx-road">${stages.map((list, i) => `<li class="cx-stage${i === me ? " here" : ""}" style="--i:${i}">
      <div class="cx-s-head"><span class="cx-n">${i + 1}</span><div><b>${STAGES[i].name}</b><small>${STAGES[i].sub}</small></div>${i === me ? `<em>${T("You're here", "Estás aquí")}</em>` : ""}</div>
      <div class="cx-tiles">${list.length ? list.map((e) => tile(e, i)).join("") : `<p class="cx-none">${i === 2 ? T("Nothing required. You learn on the job.", "Nada obligatorio. Aprendes en el trabajo.") : T("Nothing needed yet.", "Nada todavía.")}</p>`}</div></li>`).join("")}</ol>
    <p class="cx-tip"><b>${T("Real talk", "La verdad")}</b>${j.tip}</p>
    <div id="cx-detail"></div></div>`;
  panel.querySelectorAll(".cx-tile").forEach((b) => b.addEventListener("click", () => showCert(b.dataset.cert, true)));
  showCert(curCert);
};
const showCert = (id, scroll) => {
  curCert = id;
  panel.querySelectorAll(".cx-tile").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cert === id)));
  const d = document.getElementById("cx-detail");
  d.innerHTML = detail(cert[id]);
  if (scroll && innerWidth <= 760) d.scrollIntoView({ behavior: FH.still() ? "auto" : "smooth", block: "nearest" });
};

// Every certificate in one table, cheapest first within each kind. Click a name to see which jobs use it.
const showTable = () => {
  const usedBy = (id) => JOBS.filter((j) => j.stages.flat().some((e) => entry(e).c.id === id)).map((j) => `<a href="#${j.id}">${j.name}</a>`).join(", ");
  panel.innerHTML = `<div class="cx-pane"><p class="kicker">${T("Compare", "Compara")}</p><h2>${T("Every certificate side by side", "Todos los certificados lado a lado")}</h2>
    <p class="cx-does">${T("Green ones are free or have a free option. Fees are from each issuer's site, checked October 2026, and can change.", "Los verdes son gratis o tienen opción gratis. Los costos vienen del sitio de cada emisor, revisados en octubre de 2026, y pueden cambiar.")}</p>
    <div class="cx-kinds" role="group">${KINDS.map((k, i) => `<button type="button" data-kind="${i}" aria-pressed="${i === kind}">${k.name} <small>${k.ids.length}</small></button>`).join("")}</div>
    <div class="cx-scroll"><table class="cx-table"><thead><tr><th>${T("Certificate", "Certificado")}</th><th>${T("Cost", "Costo")}</th><th>${T("Study time", "Tiempo de estudio")}</th><th>${T("Who pays", "Quién paga")}</th><th>${T("Jobs that use it", "Trabajos que lo usan")}</th></tr></thead>
    <tbody>${KINDS[kind].ids.map((id) => cert[id]).map((c) => `<tr class="${c.free ? "free" : ""}"><th><a href="${c.url}" target="_blank" rel="noopener">${c.short}</a><small>${c.name}</small></th><td>${c.cost}</td><td>${c.time}</td><td>${PAYS[c.pays]}${c.sponsor ? `<small>${T("Firm signs you up", "La empresa te inscribe")}</small>` : ""}</td><td>${usedBy(c.id)}</td></tr>`).join("")}</tbody></table></div></div>`;
  panel.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { kind = +b.dataset.kind; showTable(); }));
};

const paintMe = () => {
  stagePick.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.me === me)));
  if (curJob && curJob !== "all") showJob(curJob);
};
stagePick.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
  me = +b.dataset.me;
  try { localStorage.setItem("fh-cert-stage", me); } catch (e) {}
  paintMe();
}));

// Links like #ib or #all open that job; the rail updates the hash so a job can be shared.
rail.querySelectorAll(".cx-job").forEach((b) => b.addEventListener("click", () => history.replaceState(null, "", "#" + b.dataset.job) || showJob(b.dataset.job)));
const fromHash = () => { const id = location.hash.slice(1); showJob(job[id] || id === "all" ? id : curJob || JOBS[0].id); };
addEventListener("hashchange", fromHash);
paintMe();
fromHash();
})();
