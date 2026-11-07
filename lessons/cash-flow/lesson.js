// Unit 11, Lesson 2: Cash flow
(function () {
  const LESSON = "u11-cash-flow";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

  // ---------- See it: cash forecast ----------
  const ORDER = 4000, PARTS = 1000, REG = 450;
  const MONTHS = [T("June", "Junio"), T("July", "Julio"), T("August", "Agosto"), T("September", "Septiembre")];
  const sEl = $("#cf-s"), dEl = $("#cf-d"), bars = $("#cf-bars");
  let terms = 60;
  const drawCf = () => {
    const S = +sEl.value, D = +dEl.value / 100;
    $("#cf-s-v").textContent = usd(S);
    $("#cf-d-v").textContent = Math.round(D * 100) + "%";
    const dep = ORDER * D, rest = ORDER - dep, payIn = terms / 30; // month index the rest arrives
    let cash = S;
    const vals = MONTHS.map((_, i) => {
      cash += REG;
      if (i === 0) cash += dep - PARTS;
      if (i === payIn) cash += rest;
      return cash;
    });
    const W = 560, H = 240, top = 20, bot = 30, padL = 20;
    const hi = Math.max(0, ...vals), lo = Math.min(0, ...vals), span = hi - lo || 1;
    const y = (v) => top + ((hi - v) * (H - top - bot)) / span;
    const colW = (W - padL * 2) / 4, bw = colW * 0.56;
    let g = "";
    vals.forEach((v, i) => {
      const cx = padL + colW * i + colW / 2, y0 = y(0), y1 = y(v);
      const h = Math.max(3, Math.abs(y1 - y0));
      const yTop = v >= 0 ? Math.min(y0 - h, y1) : y0;
      g += `<rect x="${cx - bw / 2}" y="${yTop}" width="${bw}" height="${h}" rx="6" class="${v >= 0 ? "cf-pos" : "cf-neg"}"/>`;
      const ly = v >= 0 ? yTop - 8 : y0 - 8;
      g += `<text x="${cx}" y="${ly}" text-anchor="middle" class="cf-val ${v >= 0 ? "" : "cf-red"}">${usd(v)}</text>`;
      g += `<text x="${cx}" y="${H - 6}" text-anchor="middle" class="cf-lab">${MONTHS[i]}</text>`;
    });
    g += `<line x1="${padL}" x2="${W - padL}" y1="${y(0)}" y2="${y(0)}" class="cf-zero"/>`;
    bars.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="cf-chart">${g}</svg>`;
    const min = Math.min(...vals), m = $("#cf-msg");
    const mon = MONTHS[vals.indexOf(min)], mn = FH.lang === "es" ? mon.toLowerCase() : mon;
    if (min < 0) {
      m.textContent = T(`Overdrawn: ${mn} ends at ${usd(min)}. You'd need ${usd(-min)} more by then.`, `Sobregirado: el mes de ${mn} termina en ${usd(min)}. Te faltarían ${usd(-min)} para entonces.`);
      m.dataset.tone = "warn";
    } else {
      m.textContent = T(`You make it. Your lowest point is ${mn} at ${usd(min)}.`, `Lo logras. Tu punto más bajo es en ${mn}: ${usd(min)}.`);
      m.dataset.tone = "good";
    }
    fillRange(sEl); fillRange(dEl);
  };
  sEl.addEventListener("input", drawCf);
  dEl.addEventListener("input", drawCf);
  $(".cf-terms").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    terms = +b.dataset.t;
    $$(".cf-terms [data-t]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    drawCf();
  });
  $$(".cf-terms [data-t]").forEach((x) => x.setAttribute("aria-pressed", x.classList.contains("on")));
  drawCf();

  // ---------- Play it: cash or crash ----------
  const ROUNDS = [
    { facts: [T("Bakery cash in during March: $6,000", "Efectivo que entró a la panadería en marzo: $6,000"), T("Cash out during March: $7,000", "Efectivo que salió en marzo: $7,000")], q: T("What was March's cash flow?", "¿Cuál fue el flujo de efectivo de marzo?"),
      opts: ["−$1,000", "$1,000", "$13,000", "−$7,000"], a: 0,
      why: T("Cash in − cash out: $6,000 − $7,000 = −$1,000. More went out than came in.", "Efectivo que entra − efectivo que sale: $6,000 − $7,000 = −$1,000. Salió más de lo que entró.") },
    { facts: [T("App startup cash: $18,000", "Efectivo de una startup de apps: $18,000"), T("Burn rate: $3,000 a month", "Tasa de consumo: $3,000 al mes")], q: T("How many months of runway?", "¿Cuántos meses de pista tiene?"),
      opts: ["6", "3", "15", "54"], a: 0,
      why: `${fr("$18,000", "$3,000")} = ${T("6 months.", "6 meses.")}` },
    { facts: [T("A printing shop sends a $900 bill on May 1", "Una imprenta manda una factura de $900 el 1 de mayo"), T("Terms on the bill: net 30", "Condiciones de la factura: neto 30")], q: T("What does net 30 mean?", "¿Qué significa neto 30?"),
      opts: [T("Pay the full $900 within 30 days", "Pagar los $900 completos en 30 días"), T("Get a 30% discount", "Recibir 30% de descuento"), T("Pay $30 a day", "Pagar $30 al día"), T("Pay 30 days before the work", "Pagar 30 días antes del trabajo")], a: 0,
      why: T("Net 30 is a deadline: the whole bill is due within 30 days, so by about May 31.", "Neto 30 es un plazo: toda la factura vence en 30 días, o sea alrededor del 31 de mayo.") },
    { facts: [T("A caterer lands a $5,000 wedding", "Una empresa de banquetes consigue una boda de $5,000"), T("Food must be bought 2 weeks before", "La comida se compra 2 semanas antes"), T("The couple pays after the wedding", "Los novios pagan después de la boda")], q: T("Which change helps the caterer's cash the most?", "¿Qué cambio ayuda más al efectivo de la empresa?"),
      opts: [T("Ask for a deposit up front", "Pedir un anticipo por adelantado"), T("Give the couple 60 days to pay", "Darles 60 días para pagar"), T("Buy the food a month earlier", "Comprar la comida un mes antes"), T("Lower the price", "Bajar el precio")], a: 0,
      why: T("A deposit brings cash in before the food bill. The other moves push cash in later, or cash out sooner.", "Un anticipo trae efectivo antes de la cuenta de la comida. Los otros cambios hacen que el efectivo llegue después o salga antes.") },
    { facts: [T("A web designer finished a $2,500 site", "Un diseñador web terminó un sitio de $2,500"), T("The client hasn't paid yet", "El cliente todavía no paga")], q: T("For the designer, the $2,500 is:", "Para el diseñador, los $2,500 son:"),
      opts: [T("An account receivable", "Una cuenta por cobrar"), T("An account payable", "Una cuenta por pagar"), T("A fixed cost", "Un costo fijo"), T("A burn rate", "Una tasa de consumo")], a: 0,
      why: T("Money a customer owes you for work you already did is a receivable.", "El dinero que un cliente te debe por un trabajo ya hecho es una cuenta por cobrar.") },
    { facts: [T("A food truck starts the month with $800", "Un food truck empieza el mes con $800"), T("Cash in: $2,500", "Efectivo que entra: $2,500"), T("Cash out: $2,900", "Efectivo que sale: $2,900")], q: T("What's its cash at the end of the month?", "¿Cuánto efectivo tiene al final del mes?"),
      opts: ["$400", "−$400", "$1,200", "$6,200"], a: 0,
      why: T("Start + in − out: $800 + $2,500 − $2,900 = $400.", "Inicio + entra − sale: $800 + $2,500 − $2,900 = $400.") },
    { facts: [T("A furniture maker takes a $6,000 order", "Un fabricante de muebles acepta un pedido de $6,000"), T("It asks for a 25% deposit", "Pide un anticipo de 25%")], q: T("How much cash comes in up front?", "¿Cuánto efectivo entra por adelantado?"),
      opts: ["$1,500", "$2,500", "$4,500", "$250"], a: 0,
      why: T("$6,000 × 0.25 = $1,500 now. The other $4,500 comes later.", "$6,000 × 0.25 = $1,500 ahora. Los otros $4,500 llegan después.") },
    { facts: [T("A bike shop buys $3,000 of parts", "Una tienda de bicicletas compra $3,000 de piezas"), T("Option A: pay today", "Opción A: pagar hoy"), T("Option B: the supplier gives net 30", "Opción B: el proveedor da neto 30")], q: T("Which is better for the shop's cash, if the price is the same?", "¿Qué es mejor para el efectivo de la tienda, si el precio es el mismo?"),
      opts: [T("Option B, net 30", "Opción B, neto 30"), T("Option A, pay today", "Opción A, pagar hoy"), T("They're the same", "Dan lo mismo")], a: 0,
      why: T("Same cost, but the $3,000 stays in the bank 30 more days, maybe until customers have paid for the repairs.", "El mismo costo, pero los $3,000 se quedan en el banco 30 días más, tal vez hasta que los clientes paguen las reparaciones.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#cc-why"), nextB = $("#cc-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#cc-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#cc-q").textContent = r.q;
    $("#cc-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#cc-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#cc-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#cc-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#cc-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#cc-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#cc-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Cash keeper", "Guardián del efectivo") : G.score >= 6 ? T("Still solvent", "Sigues a flote") : T("Review the forecast steps", "Repasa los pasos del pronóstico")}</b><p>${T("Track when money moves, find the lowest point, and fix the timing first.", "Anota cuándo se mueve el dinero, encuentra el punto más bajo y arregla los tiempos primero.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="cc-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#cc-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#cc-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#cc").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Kept eight businesses out of the red", "Mantuviste ocho negocios a flote"));
    if (G.score === N) FH.badge("cash-keeper");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Why can a profitable business still run out of cash?", opts: ["Bills can come due before customers pay", "Profit is always bigger than revenue", "Fixed costs don't need to be paid", "Cash and profit are the same thing"], a: 0, why: "Profit counts a sale when it's made. Cash only arrives when the customer pays, and the bills may be due first." },
    { q: "What is an account payable?", opts: ["Money a business owes its suppliers", "Money customers owe the business", "Cash in the bank", "A monthly profit"], a: 0, why: "A payable is a bill you've received but haven't paid yet." },
    { q: "A startup has $40,000 of cash and burns $5,000 a month. What is its runway?", opts: ["8 months", "5 months", "35 months", "12 months"], a: 0, why: `${fr("$40,000", "$5,000")} = 8 months.` },
    { q: "A business sends a bill on March 1 with terms of net 60. When is payment due?", opts: ["Within 60 days, around April 30", "On March 1", "Within 6 days", "After 60 weeks"], a: 0, why: "Net 60 means the full amount is due within 60 days of the bill date." },
    { q: "A shop starts the month with $2,000. $6,000 comes in and $7,500 goes out. What is its ending cash?", opts: ["$500", "−$1,500", "$15,500", "$3,500"], a: 0, why: "$2,000 + $6,000 − $7,500 = $500." },
    { q: "How does asking customers for a deposit affect a business's cash flow?", opts: ["Cash arrives sooner", "Profit goes down", "Cash arrives later", "Fixed costs go up"], a: 0, why: "A deposit moves part of the payment to the start, before the business spends money on the job." },
    { q: "A contractor asks for a 40% deposit on a $10,000 job. How much cash comes in up front?", opts: ["$4,000", "$6,000", "$400", "$1,000"], a: 0, why: "$10,000 × 0.40 = $4,000." },
    { q: "A company's profit rose this year, but its cash went down. Which is the most likely reason?", opts: ["Customers owe it more: receivables grew", "It had no sales", "Its prices fell to zero", "It paid no bills"], a: 0, why: "Sales on credit count as profit right away, but the cash is stuck in receivables until customers pay." },
  ];
  const QUIZ_ES = [
    { q: "¿Por qué un negocio con ganancias puede quedarse sin efectivo?", opts: ["Las cuentas pueden vencer antes de que paguen los clientes", "La ganancia siempre es mayor que los ingresos", "Los costos fijos no se tienen que pagar", "El efectivo y la ganancia son lo mismo"], a: 0, why: "La ganancia cuenta una venta cuando se hace. El efectivo solo llega cuando el cliente paga, y las cuentas pueden vencer antes." },
    { q: "¿Qué es una cuenta por pagar?", opts: ["Dinero que un negocio les debe a sus proveedores", "Dinero que los clientes le deben al negocio", "Efectivo en el banco", "Una ganancia mensual"], a: 0, why: "Una cuenta por pagar es una factura que recibiste pero que todavía no pagas." },
    { q: "Una startup tiene $40,000 de efectivo y consume $5,000 al mes. ¿Cuánta pista tiene?", opts: ["8 meses", "5 meses", "35 meses", "12 meses"], a: 0, why: `${fr("$40,000", "$5,000")} = 8 meses.` },
    { q: "Un negocio manda una factura el 1 de marzo con condiciones de neto 60. ¿Cuándo vence el pago?", opts: ["En 60 días, alrededor del 30 de abril", "El 1 de marzo", "En 6 días", "Después de 60 semanas"], a: 0, why: "Neto 60 significa que el total vence dentro de 60 días desde la fecha de la factura." },
    { q: "Una tienda empieza el mes con $2,000. Entran $6,000 y salen $7,500. ¿Con cuánto efectivo termina?", opts: ["$500", "−$1,500", "$15,500", "$3,500"], a: 0, why: "$2,000 + $6,000 − $7,500 = $500." },
    { q: "¿Cómo afecta al flujo de efectivo pedirles un anticipo a los clientes?", opts: ["El efectivo llega antes", "La ganancia baja", "El efectivo llega después", "Los costos fijos suben"], a: 0, why: "Un anticipo pasa parte del pago al inicio, antes de que el negocio gaste en el trabajo." },
    { q: "Un contratista pide un anticipo de 40% en un trabajo de $10,000. ¿Cuánto efectivo entra por adelantado?", opts: ["$4,000", "$6,000", "$400", "$1,000"], a: 0, why: "$10,000 × 0.40 = $4,000." },
    { q: "La ganancia de una empresa subió este año, pero su efectivo bajó. ¿Cuál es la razón más probable?", opts: ["Los clientes le deben más: crecieron las cuentas por cobrar", "No tuvo ventas", "Sus precios bajaron a cero", "No pagó ninguna cuenta"], a: 0, why: "Las ventas a crédito cuentan como ganancia de inmediato, pero el efectivo se queda en cuentas por cobrar hasta que los clientes pagan." },
  ];

  FHLesson.init({ id: LESSON, short: "cash-flow", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
