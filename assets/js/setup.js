// Setup page (start/): language, the eight ways lessons teach, goals, level and a quick placement check.
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

  // ---------- Step 2: the eight ways every lesson teaches (and a username for new accounts) ----------
  const grid = $("#lp-grid");
  FH.STYLES.forEach((st) => {
    const li = document.createElement("li");
    li.className = "lp-card";
    li.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg><b>${st.label}</b><small>${st.desc}</small><i class="ch">${st.chapter}</i>`;
    grid.appendChild(li);
  });

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
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[g.id]}</svg><b>${g.label}</b><small>${g.desc}</small><span class="units">${g.id === "career" ? T("The whole course", "Todo el curso") : T(`${FH.buildPath([g.id]).length} lessons`, `${FH.buildPath([g.id]).length} lecciones`)}</span><i class="tick" aria-hidden="true"></i>`;
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

  // ---------- Placement check: two questions per unit on the path, one part of the course at a time ----------
  // The first answer of each question is the right one; they're shuffled on screen.
  const QS_EN = {
    1: [["What's the main difference between a checking account and a savings account?", "Checking is for spending; savings is for money you set aside", "Savings is for daily purchases; checking is for big bills", "Checking pays more interest because you use it more", "Only checking is insured; savings is at your own risk"],
        ["Your bank account is FDIC insured. What does that mean?", "If the bank fails, your deposits are covered up to $250,000", "If your investments drop, the government pays back the loss", "The bank promises your balance will earn a set rate", "The bank can't charge you monthly fees on the account"]],
    2: [["You earn $15 an hour and work 20 hours, but your pay stub shows $260. Why isn't it $300?", "Taxes and other deductions come out before you're paid", "Your employer keeps a cut of hourly pay as a hiring fee", "New workers get a lower rate during their first month", "The stub shows what's left after your bank's fees"],
        ["You're in the 22% federal tax bracket. Roughly what share of your income goes to federal income tax?", "Less than 22%, since only income above a cutoff is taxed at 22%", "Exactly 22%, since every dollar is taxed at your bracket's rate", "More than 22%, since the lower brackets get added on top", "Nothing, since federal tax only starts above $100,000"]],
    3: [["In a 50/30/20 budget, what is the 20% for?", "Saving and paying off debt", "Rent, groceries and other bills", "Eating out, hobbies and fun", "Federal and state income taxes"],
        ["Most experts say an emergency fund should cover about…", "3 to 6 months of your basic costs", "1 to 2 weeks of your basic costs", "2 to 3 years of your full salary", "One month's rent and nothing else"]],
    4: [["What has the biggest effect on a FICO credit score?", "Paying every bill on time", "How much money you earn", "How much is in your bank account", "How often you check your own score"],
        ["You owe $1,000 on a credit card at 24% a year and pay only the minimum each month. What happens?", "Interest keeps piling up, so payoff takes years and costs far more", "Interest stops growing as long as you pay the minimum", "The card company forgives what's left after one year of payments", "Your score climbs, because carrying a balance builds credit"]],
    5: [["What's the main reason people buy an index fund instead of a single stock?", "It spreads your money over many companies, so one crash hurts less", "It always beats the market, because experts pick the best stocks", "It's backed by the government, so you can't lose money in it", "It pays a fixed rate of interest, like a savings account does"],
        ["You have $10, and one share of an S&P 500 fund costs over $500. What lets you invest anyway?", "Fractional shares", "A margin loan", "Penny stocks", "Stock options"]],
    6: [["Your car insurance has a $500 deductible. What does that mean?", "You pay the first $500 of a claim, then insurance pays the rest", "You pay $500 a year, and insurance covers every claim in full", "Insurance pays up to $500 a claim, and you pay anything above it", "You get $500 back at the end of a year with no claims"],
        ["A text says your bank account is locked and gives you a link to log in. What should you do?", "Skip the link; open your bank's app or call the number on your card", "Tap the link right away so the bank doesn't close your account", "Reply with your password so the bank can unlock the account", "Call the phone number in the text to ask if it's real"]],
    7: [["Compared with a 15-year mortgage, a 30-year mortgage for the same house usually has…", "A lower monthly payment, but more interest in total", "A higher monthly payment, and less interest in total", "A lower monthly payment, and less interest in total", "The same total cost, just spread over more months"],
        ["When comparing two car loans, which number shows the yearly cost of borrowing, fees included?", "The annual percentage rate (APR)", "The monthly payment amount", "The interest rate before fees", "The total amount you borrow"]],
    8: [["A bike shop raises its price and sells fewer bikes. Which idea explains that?", "The law of demand", "The law of supply", "Opportunity cost", "Diminishing returns"],
        ["You skip a $60 work shift to go to a concert with a $40 ticket. What does the concert really cost you?", "$100: the ticket plus the lost pay", "$40: just the price of the ticket", "$60: just the pay from the shift", "$20: the shift minus the ticket"]],
    9: [["Your savings earn 4% a year while prices rise 6%. What happens to what your money can buy?", "It shrinks by about 2% a year", "It grows by about 4% a year", "It grows by about 10% a year", "It shrinks by about 6% a year"],
        ["To fight high inflation, the Federal Reserve usually…", "Raises interest rates", "Lowers interest rates", "Prints more money", "Raises income taxes"]],
    10: [["You invest $1,000 at 10% a year and leave the interest in. How much do you have after 2 years?", "$1,210", "$1,200", "$1,100", "$2,000"],
         ["Why is $1,000 today worth more than $1,000 five years from now?", "You can invest it now and earn interest on it", "It isn't; a dollar is a dollar no matter when", "Banks charge fees to hold money for years", "Future dollars will be taxed at a higher rate"]],
    11: [["A business breaks even when…", "Its revenue covers all of its costs", "It sells more units than last year", "It has more cash than it owes", "Its prices match its competitors'"],
         ["A stand sells lemonade for $2 a cup, and each cup takes $0.50 of supplies. How much does each cup add toward other costs and profit?", "$1.50", "$2.50", "$0.50", "$2.00"]],
    12: [["Finish the accounting equation: Assets = …", "Liabilities + equity", "Revenue − expenses", "Cash + inventory", "Equity − liabilities"],
         ["Which statement shows a company's revenue, costs and profit over a period of time?", "The income statement", "The balance sheet", "The cash flow statement", "The tax return"]],
    13: [["A project has a positive net present value (NPV). What does that tell you?", "It should earn more than its cost of capital", "It will make a profit in its very first year", "It will pay back its cost in under a year", "It carries no risk of losing money at all"],
         ["Why is borrowing usually cheaper for a company than selling new shares?", "Lenders take less risk than owners, and interest cuts taxes", "Debt never has to be paid back if profits fall short", "Selling new shares means paying a fee to the government", "Banks must lend to companies at lower rates by law"]],
    14: [["Diversifying a portfolio mainly reduces which kind of risk?", "Risk tied to one company", "Risk of the whole market falling", "Risk of prices rising", "Risk of interest rates rising"],
         ["A stock has a beta of 1.5. If the market rises 10%, the stock is expected to…", "Rise about 15%", "Rise about 10%", "Rise about 1.5%", "Fall about 15%"]],
    15: [["Enterprise value is equity value plus debt, minus…", "Cash", "Revenue", "Dividends", "Taxes"],
         ["A discounted cash flow (DCF) model values a company by…", "Adding up its future cash flows, discounted to today", "Multiplying this year's revenue by an industry number", "Using the price of the most recent trade of its stock", "Adding up the value of everything the company owns"]],
    16: [["When interest rates rise, prices of existing bonds usually…", "Fall", "Rise", "Stay the same", "Double"],
         ["What is quantitative easing (QE)?", "The central bank buys bonds to push long-term rates down", "The central bank sells bonds to push long-term rates up", "The government cuts taxes to get people spending again", "Banks are allowed to lend without any reserve limits"]],
    17: [["In Excel, which formula adds the values in cells A1 through A10?", "=SUM(A1:A10)", "=ADD(A1-A10)", "=TOTAL(A1,A10)", "=A1+A10"],
         ["In SQL, which keyword keeps only the rows that meet a condition?", "WHERE", "SELECT", "ORDER BY", "FROM"]],
    18: [["In a behavioral interview, what does the STAR method stand for?", "Situation, task, action, result", "Skills, talent, ambition, reward", "Start, think, answer, repeat", "Strengths, tasks, achievements, references"],
         ["An interviewer asks you to walk them through a DCF. What kind of question is that?", "A technical question", "A behavioral question", "A brainteaser", "A question about why you want the job"]],
  };
  const QS_ES = {
    1: [["¿Cuál es la diferencia principal entre una cuenta de cheques y una de ahorro?", "La de cheques es para gastar; la de ahorro, para lo que apartas", "La de ahorro es para compras diarias; la de cheques, para cuentas grandes", "La de cheques paga más interés porque la usas más seguido", "Solo la de cheques está asegurada; la de ahorro es bajo tu riesgo"],
        ["Tu cuenta de banco está asegurada por la FDIC. ¿Qué significa?", "Si el banco quiebra, tus depósitos están cubiertos hasta $250,000", "Si tus inversiones bajan, el gobierno te devuelve lo que perdiste", "El banco promete que tu saldo ganará una tasa fija", "El banco no te puede cobrar comisiones mensuales por la cuenta"]],
    2: [["Ganas $15 la hora y trabajas 20 horas, pero tu talón de pago dice $260. ¿Por qué no son $300?", "Antes de pagarte se descuentan impuestos y otras deducciones", "Tu empleador se queda una parte del pago como cuota de contratación", "A los nuevos les pagan menos durante su primer mes de trabajo", "El talón muestra lo que queda después de las comisiones del banco"],
        ["Estás en la categoría federal de impuestos del 22%. ¿Más o menos qué parte de tu ingreso se va en impuesto federal sobre la renta?", "Menos del 22%, porque solo lo que pasa de cierto límite paga 22%", "Exactamente el 22%, porque cada dólar paga la tasa de tu categoría", "Más del 22%, porque se suman encima las categorías de abajo", "Nada, porque el impuesto federal empieza arriba de $100,000"]],
    3: [["En un presupuesto 50/30/20, ¿para qué es el 20%?", "Ahorrar y pagar deudas", "Renta, comida y otras cuentas", "Salidas, pasatiempos y diversión", "Impuestos federales y estatales"],
        ["La mayoría de los expertos dice que un fondo de emergencia debe cubrir más o menos…", "De 3 a 6 meses de tus gastos básicos", "De 1 a 2 semanas de tus gastos básicos", "De 2 a 3 años de tu sueldo completo", "Un mes de renta y nada más"]],
    4: [["¿Qué afecta más tu puntaje de crédito FICO?", "Pagar cada cuenta a tiempo", "Cuánto dinero ganas", "Cuánto tienes en tu cuenta de banco", "Cada cuánto revisas tu propio puntaje"],
        ["Debes $1,000 en una tarjeta de crédito al 24% anual y pagas solo el mínimo cada mes. ¿Qué pasa?", "Los intereses se siguen sumando, así que tardas años y pagas mucho más", "Los intereses dejan de crecer mientras pagues el mínimo", "La compañía te perdona lo que falta después de un año de pagos", "Tu puntaje sube, porque tener saldo te ayuda a construir crédito"]],
    5: [["¿Cuál es la razón principal para comprar un fondo indexado en vez de una sola acción?", "Reparte tu dinero entre muchas empresas, así que una caída afecta menos", "Siempre le gana al mercado, porque unos expertos eligen las mejores", "Lo respalda el gobierno, así que no puedes perder dinero", "Paga una tasa de interés fija, como una cuenta de ahorro"],
        ["Tienes $10, y una acción de un fondo del S&P 500 cuesta más de $500. ¿Qué te permite invertir de todos modos?", "Las acciones fraccionadas", "Un préstamo de margen", "Las acciones de centavo", "Las opciones sobre acciones"]],
    6: [["Tu seguro de carro tiene un deducible de $500. ¿Qué significa?", "Tú pagas los primeros $500 de un reclamo y el seguro paga el resto", "Pagas $500 al año y el seguro cubre cada reclamo completo", "El seguro paga hasta $500 por reclamo y tú pagas lo que pase de eso", "Te devuelven $500 al final de un año sin reclamos"],
        ["Un mensaje dice que tu cuenta de banco está bloqueada y te da un enlace para entrar. ¿Qué debes hacer?", "No uses el enlace; abre la app de tu banco o llama al número de tu tarjeta", "Abrir el enlace rápido para que el banco no cierre tu cuenta", "Responder con tu contraseña para que el banco la desbloquee", "Llamar al número que viene en el mensaje para preguntar si es real"]],
    7: [["Comparada con una hipoteca a 15 años, una hipoteca a 30 años para la misma casa normalmente tiene…", "Un pago mensual más bajo, pero más intereses en total", "Un pago mensual más alto, y menos intereses en total", "Un pago mensual más bajo, y menos intereses en total", "El mismo costo total, solo repartido en más meses"],
        ["Al comparar dos préstamos de carro, ¿qué número muestra el costo anual de pedir prestado, comisiones incluidas?", "La tasa de porcentaje anual (APR)", "El monto del pago mensual", "La tasa de interés sin comisiones", "El total que pides prestado"]],
    8: [["Una tienda de bicicletas sube su precio y vende menos bicicletas. ¿Qué idea lo explica?", "La ley de la demanda", "La ley de la oferta", "El costo de oportunidad", "Los rendimientos decrecientes"],
        ["Faltas a un turno de trabajo de $60 para ir a un concierto con boleto de $40. ¿Cuánto te cuesta de verdad el concierto?", "$100: el boleto más el pago perdido", "$40: solo el precio del boleto", "$60: solo el pago del turno", "$20: el turno menos el boleto"]],
    9: [["Tus ahorros ganan 4% al año mientras los precios suben 6%. ¿Qué pasa con lo que puede comprar tu dinero?", "Se encoge más o menos 2% al año", "Crece más o menos 4% al año", "Crece más o menos 10% al año", "Se encoge más o menos 6% al año"],
        ["Para combatir una inflación alta, la Reserva Federal normalmente…", "Sube las tasas de interés", "Baja las tasas de interés", "Imprime más dinero", "Sube los impuestos"]],
    10: [["Inviertes $1,000 al 10% anual y dejas que los intereses se queden. ¿Cuánto tienes después de 2 años?", "$1,210", "$1,200", "$1,100", "$2,000"],
         ["¿Por qué $1,000 hoy valen más que $1,000 dentro de cinco años?", "Puedes invertirlos ya y ganar intereses con ellos", "No es así; un dólar es un dólar sin importar cuándo", "Los bancos cobran comisiones por guardar dinero años", "Los dólares futuros pagarán una tasa de impuestos más alta"]],
    11: [["Un negocio llega a su punto de equilibrio cuando…", "Sus ventas cubren todos sus costos", "Vende más unidades que el año pasado", "Tiene más efectivo del que debe", "Sus precios igualan a los de la competencia"],
         ["Un puesto vende limonada a $2 el vaso, y cada vaso lleva $0.50 de insumos. ¿Cuánto aporta cada vaso para pagar otros costos y dejar ganancia?", "$1.50", "$2.50", "$0.50", "$2.00"]],
    12: [["Completa la ecuación contable: Activos = …", "Pasivos + capital", "Ingresos − gastos", "Efectivo + inventario", "Capital − pasivos"],
         ["¿Qué estado muestra los ingresos, costos y ganancia de una empresa durante un periodo?", "El estado de resultados", "El balance general", "El estado de flujo de efectivo", "La declaración de impuestos"]],
    13: [["Un proyecto tiene un valor presente neto (VPN) positivo. ¿Qué te dice eso?", "Debería ganar más que su costo de capital", "Dará ganancias desde su primer año", "Recuperará lo que costó en menos de un año", "No tiene ningún riesgo de perder dinero"],
         ["¿Por qué pedir prestado suele salirle más barato a una empresa que vender acciones nuevas?", "Los prestamistas corren menos riesgo, y los intereses bajan los impuestos", "La deuda no se paga si las ganancias no alcanzan", "Vender acciones nuevas obliga a pagar una cuota al gobierno", "La ley obliga a los bancos a prestar barato a las empresas"]],
    14: [["Diversificar un portafolio reduce sobre todo, ¿qué tipo de riesgo?", "El riesgo ligado a una sola empresa", "El riesgo de que caiga todo el mercado", "El riesgo de que suban los precios", "El riesgo de que suban las tasas"],
         ["Una acción tiene una beta de 1.5. Si el mercado sube 10%, se espera que la acción…", "Suba más o menos 15%", "Suba más o menos 10%", "Suba más o menos 1.5%", "Baje más o menos 15%"]],
    15: [["El valor empresarial es el valor del capital más la deuda, menos…", "El efectivo", "Los ingresos", "Los dividendos", "Los impuestos"],
         ["Un modelo de flujo de caja descontado (DCF) valora una empresa…", "Sumando sus flujos de efectivo futuros, descontados a hoy", "Multiplicando sus ingresos del año por un número de su industria", "Usando el precio de la operación más reciente de su acción", "Sumando el valor de todo lo que la empresa tiene"]],
    16: [["Cuando suben las tasas de interés, el precio de los bonos que ya existen normalmente…", "Baja", "Sube", "Se queda igual", "Se duplica"],
         ["¿Qué es la flexibilización cuantitativa (QE)?", "El banco central compra bonos para bajar las tasas de largo plazo", "El banco central vende bonos para subir las tasas de largo plazo", "El gobierno baja los impuestos para que la gente gaste más", "Los bancos pueden prestar sin ningún límite de reservas"]],
    17: [["En Excel, ¿qué fórmula suma los valores de las celdas A1 a A10?", "=SUMA(A1:A10)", "=AGREGAR(A1-A10)", "=TOTAL(A1;A10)", "=A1+A10"],
         ["En SQL, ¿qué palabra clave deja solo las filas que cumplen una condición?", "WHERE", "SELECT", "ORDER BY", "FROM"]],
    18: [["En una entrevista de comportamiento, ¿qué significa el método STAR?", "Situación, tarea, acción, resultado", "Habilidades, talento, ambición, recompensa", "Empezar, pensar, responder, repetir", "Fortalezas, tareas, logros, referencias"],
         ["Un entrevistador te pide que le expliques un DCF paso a paso. ¿Qué tipo de pregunta es?", "Una pregunta técnica", "Una pregunta de comportamiento", "Un acertijo", "Una pregunta sobre por qué quieres el trabajo"]],
  };
  const QS = FH.lang === "es" ? QS_ES : QS_EN;
  // Parts in course order, each with the units on the learner's path.
  let parts = [], pi = 0, qs = [], qi = 0, right = 0, asked = 0, partMiss = 0, maxQs = 0;
  const pathUnits = () => new Set(FH.buildPath([...goals]).map((x) => (x.lesson ? x.lesson.unit : x.unit)));
  const startQuiz = () => {
    const on = pathUnits();
    parts = FH.PARTS.map((p) => p.units.filter((u) => on.has(u))).filter((us) => us.length);
    maxQs = parts.flat().length * 2;
    pi = 0; right = 0; asked = 0; known = {}; unitRight = {};
    show("quiz"); startPart();
  };
  const startPart = () => {
    if (pi >= parts.length) return finish();
    qs = parts[pi].flatMap((u) => QS[u].map((q) => ({ unit: u, q: q[0], a: q.slice(1) })));
    qi = 0; partMiss = 0;
    askQ();
  };
  let unitRight = {};
  const answer = (q, ok) => {
    asked++;
    if (ok) { right++; unitRight[q.unit] = (unitRight[q.unit] || 0) + 1; } else partMiss++;
    if (unitRight[q.unit] === 2) known[q.unit] = true;
    qi++;
    if (qi < qs.length) return askQ();
    // End of a part: missing more than half of it means the learner starts here, so stop.
    if (partMiss * 2 > qs.length) return finish();
    pi++; startPart();
  };
  const askQ = () => {
    const q = qs[qi], part = FH.partOf(q.unit);
    $("#q-count").textContent = T(`Placement check · Part ${part.n}, question ${qi + 1} of ${qs.length}`, `Prueba de nivel · Parte ${part.n}, pregunta ${qi + 1} de ${qs.length}`);
    $("#q-bar").style.width = `${(asked / maxQs) * 100}%`;
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
        setTimeout(() => answer(q, o.ok), o.ok ? 650 : 1300);
      });
      box.appendChild(b);
    });
  };
  $("#q-idk").addEventListener("click", () => answer(qs[qi], false));
  $("#q-skip").addEventListener("click", () => {
    // No check: lean on what they told us.
    known = level === "confident" ? { 1: true, 2: true, 3: true, 5: true } : level === "basics" ? { 1: true, 3: true } : {};
    finish(true);
  });

  // ---------- Result ----------
  const finish = (skipped) => {
    FH.setProfile({ goals: [...goals], level, known, quiz: asked && !skipped ? { right, of: asked } : null, done: true });
    paintPath();
    at = 4; show(4);
  };
  const paintPath = () => {
    const { items, known: kn } = FH.path;
    const next = FH.nextLesson();
    // The whole course as numbered squares, 10 to a row like lines in a book. Lessons on the path light up.
    const list = $("#my-path"); list.innerHTML = "";
    const onPath = new Map(items.filter((x) => x.lesson).map((x) => [x.lesson.id, x.lesson]));
    const label = $("#path-pick");
    const tell = (l) => { label.innerHTML = `<b>${l.unit}.${l.n}</b> ${l.title} <small>${!onPath.has(l.id) ? T("Not on your path", "No está en tu camino") : kn.has(l.unit) ? T("You know this. It's there to review.", "Ya lo sabes. Está ahí para repasar.") : l.href ? T("On your path", "En tu camino") : T("On your path · coming soon", "En tu camino · muy pronto")}</small>`; };
    FH.CATALOG.forEach((l, i) => {
      const li = document.createElement("li");
      const on = onPath.has(l.id);
      li.className = [on ? (kn.has(l.unit) ? "known" : "on") : "off", next && next.id === l.id ? "next" : "", !l.href ? "soon" : ""].join(" ").trim();
      li.innerHTML = l.href ? `<a href="../${l.href}" aria-label="${i + 1}. ${l.title}">${i + 1}</a>` : `<span tabindex="0" aria-label="${i + 1}. ${l.title}">${i + 1}</span>`;
      li.firstChild.addEventListener("mouseenter", () => tell(l));
      li.firstChild.addEventListener("focus", () => tell(l));
      list.appendChild(li);
    });
    tell(next ? FH.CATALOG.find((l) => l.id === next.id) || FH.CATALOG[0] : FH.CATALOG[0]);
    const lessons = items.filter((x) => x.lesson).map((x) => x.lesson);
    const skip = lessons.filter((l) => kn.has(l.unit)).length;
    $("#path-sum").textContent = T(
      `${lessons.length} lesson${lessons.length === 1 ? "" : "s"} on your path${skip && skip < lessons.length ? `, and you already know ${skip}` : ""}.`,
      `${lessons.length} ${lessons.length === 1 ? "lección" : "lecciones"} en tu camino${skip && skip < lessons.length ? `, y ya sabes ${skip}` : ""}.`);
    if (kn.size) {
      const startAt = items.map((x) => (x.lesson ? x.lesson.unit : x.unit)).find((u) => !kn.has(u));
      if (startAt) $("#path-sum").textContent += T(` You start at Unit ${startAt}: ${FH.UNIT_NAMES[startAt - 1]}.`, ` Empiezas en la Unidad ${startAt}: ${FH.UNIT_NAMES[startAt - 1]}.`);
    }
    const go = $("#path-go");
    if (next) {
      const verb = next.why === "review" ? T("Review", "Repasar") : next.why === "extra" ? T("Try an extra lesson:", "Prueba una lección extra:") : T("Start", "Empezar");
      go.href = "../" + next.href;
      go.firstChild.textContent = `${verb} ${T("Unit", "Unidad")} ${next.unit} · ${T("Lesson", "Lección")} ${next.n} `;
    }
  };
  $("#redo").addEventListener("click", () => { at = 0; show(0); });

  // Coming back to edit: start on step 1 with the old answers filled in.
  // "#styles" means the learner just switched language on step 1, so carry on from step 2.
  if (location.hash === "#path" && prof.done) { paintPath(); at = 4; show(4); }
  else if (location.hash === "#check" && goals.size) { level = level || "unsure"; at = 3; startQuiz(); }
  else if (location.hash === "#styles") { at = 1; show(1); }
  else show(0);
})();
