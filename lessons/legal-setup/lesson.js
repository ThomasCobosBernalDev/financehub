// Unit 11, Lesson 3: Making it official
(function () {
  const LESSON = "u11-legal-setup";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // ---------- See it: taxed once or twice ----------
  const PROFIT = 100000, CORP = 0.21;
  const pEl = $("#ot-p");
  let rate = 22;
  const drawOt = () => {
    const pay = +pEl.value / 100, r = rate / 100, div = rate <= 12 ? 0 : 0.15;
    $("#ot-p-v").textContent = Math.round(pay * 100) + "%";
    const passTax = PROFIT * r;
    const corpTax = PROFIT * CORP, divTax = PROFIT * (1 - CORP) * pay * div;
    const rows = [
      { name: T("LLC (pass-through)", "LLC (de transferencia)"), tax: passTax, note: T(`${rate}% once`, `${rate}% una vez`) },
      { name: T("C corporation", "Corporación C"), tax: corpTax + divTax, note: divTax > 0 ? `21% + ${usd(divTax)}` : "21%" },
    ];
    const W = 600, x0 = 0, bw = W, bh = 34;
    let g = "";
    rows.forEach((row, i) => {
      const y = 44 + i * 112, tw = (bw * row.tax) / PROFIT;
      g += `<text x="${x0}" y="${y - 10}" class="ot-name">${row.name}</text>`;
      g += `<rect x="${x0}" y="${y}" width="${tw}" height="${bh}" rx="6" class="ot-tax"/>`;
      g += `<rect x="${x0 + tw}" y="${y}" width="${bw - tw}" height="${bh}" rx="6" class="ot-keep"/>`;
      g += `<text x="${x0}" y="${y + bh + 22}" class="ot-num">${T("Tax", "Impuesto")} ${usd(row.tax)} (${row.note})</text>`;
      g += `<text x="${W}" y="${y + bh + 22}" text-anchor="end" class="ot-num ot-k">${T("Kept", "Queda")} ${usd(PROFIT - row.tax)}</text>`;
    });
    $("#ot-bars").innerHTML = `<svg viewBox="0 0 ${W} 236" class="ot-chart">${g}</svg>`;
    const d = rows[1].tax - rows[0].tax, m = $("#ot-msg");
    if (Math.abs(d) < 1) { m.textContent = T("A tie: both leave the same amount.", "Empate: los dos dejan lo mismo."); m.dataset.tone = ""; }
    else if (d > 0) { m.textContent = T(`The LLC leaves ${usd(d)} more, because the profit is taxed only once.`, `La LLC deja ${usd(d)} más, porque la ganancia se grava una sola vez.`); m.dataset.tone = "good"; }
    else if (pay === 0) { m.textContent = T(`The corporation leaves ${usd(-d)} more, because profit kept in the business skips the second tax.`, `La corporación deja ${usd(-d)} más, porque la ganancia que se queda en el negocio no paga el segundo impuesto.`); m.dataset.tone = "good"; }
    else { m.textContent = T(`The corporation leaves ${usd(-d)} more, because the owner's ${rate}% rate beats the corporate tax and dividend tax added together.`, `La corporación deja ${usd(-d)} más, porque la tasa de ${rate}% del dueño es más alta que el impuesto corporativo y el de dividendos juntos.`); m.dataset.tone = "good"; }
    fillRange(pEl);
  };
  pEl.addEventListener("input", drawOt);
  $(".ot-rates").addEventListener("click", (e) => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    rate = +b.dataset.r;
    $$(".ot-rates [data-r]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    drawOt();
  });
  $$(".ot-rates [data-r]").forEach((x) => x.setAttribute("aria-pressed", x.classList.contains("on")));
  drawOt();

  // ---------- Play it: pick the paperwork ----------
  const ROUNDS = [
    { facts: [T("Maya starts selling candles online", "Maya empieza a vender velas en internet"), T("She files no paperwork", "No llena ningún papel"), T("She's the only owner", "Es la única dueña")], q: T("What kind of business does she have?", "¿Qué tipo de negocio tiene?"),
      opts: [T("Sole proprietorship", "Empresa de dueño único"), T("LLC", "LLC"), T("C corporation", "Corporación C"), T("Partnership", "Sociedad")], a: 0,
      why: T("With one owner and no paperwork, you're automatically a sole proprietor.", "Con una dueña y sin papeles, automáticamente es una empresa de dueño único.") },
    { facts: [T("Two friends open a food truck together", "Dos amigos abren un food truck juntos"), T("They file nothing", "No registran nada"), T("One friend signs a $10,000 loan for the business", "Uno de ellos firma un préstamo de $10,000 para el negocio")], q: T("Who can the lender collect from?", "¿A quién le puede cobrar el prestamista?"),
      opts: [T("Either friend", "A cualquiera de los dos"), T("Only the one who signed", "Solo al que firmó"), T("Only the truck", "Solo al food truck"), T("Nobody", "A nadie")], a: 0,
      why: T("Without filing, they're a general partnership: each partner can be on the hook for the whole debt.", "Sin registrarse, son una sociedad general: cada socio puede responder por toda la deuda.") },
    { facts: [T("Leo's LLC owes a supplier $6,000 and closes", "La LLC de Leo le debe $6,000 a un proveedor y cierra"), T("Leo has $8,000 of personal savings", "Leo tiene $8,000 de ahorros personales"), T("He signed no personal guarantee", "No firmó ninguna garantía personal")], q: T("Can the supplier take Leo's savings?", "¿Puede el proveedor quedarse con los ahorros de Leo?"),
      opts: [T("No, only what the LLC owns", "No, solo lo que tiene la LLC"), T("Yes, all $8,000", "Sí, los $8,000"), T("Yes, but only $6,000", "Sí, pero solo $6,000")], a: 0,
      why: T("That's limited liability: the supplier can collect from the business, not from Leo personally.", "Eso es responsabilidad limitada: el proveedor puede cobrarle al negocio, no a Leo en persona.") },
    { facts: [T("A C corporation's profit: $200,000", "Ganancia de una corporación C: $200,000"), T("Federal corporate tax: 21%", "Impuesto federal a corporaciones: 21%")], q: T("How much corporate tax does it pay?", "¿Cuánto impuesto corporativo paga?"),
      opts: ["$42,000", "$21,000", "$158,000", "$4,200"], a: 0,
      why: T("$200,000 × 0.21 = $42,000.", "$200,000 × 0.21 = $42,000.") },
    { facts: [T("After tax, the corporation pays $50,000 in dividends", "Después de impuestos, la corporación paga $50,000 en dividendos"), T("The owners' dividend tax rate: 15%", "La tasa de impuesto a dividendos de los dueños: 15%")], q: T("How much dividend tax do the owners pay?", "¿Cuánto impuesto a dividendos pagan los dueños?"),
      opts: ["$7,500", "$10,500", "$750", "$42,500"], a: 0,
      why: T("$50,000 × 0.15 = $7,500. That's the second tax in double taxation.", "$50,000 × 0.15 = $7,500. Ese es el segundo impuesto de la doble tributación.") },
    { facts: [T("An app startup plans to raise money from many investors", "Una startup de apps planea juntar dinero de muchos inversionistas"), T("Someday it hopes to sell shares on the stock market", "Algún día quiere vender acciones en la bolsa")], q: T("Which structure fits best?", "¿Qué estructura le queda mejor?"),
      opts: [T("C corporation", "Corporación C"), T("Sole proprietorship", "Empresa de dueño único"), T("General partnership", "Sociedad general")], a: 0,
      why: T("Corporations can sell shares to many investors. That's why startups raising money and public companies are corporations.", "Las corporaciones pueden vender acciones a muchos inversionistas. Por eso las startups que buscan dinero y las empresas en la bolsa son corporaciones.") },
    { facts: [T("A one-owner LLC makes $30,000 of profit", "Una LLC de un solo dueño gana $30,000"), T("It hasn't chosen any special tax treatment", "No eligió ningún trato fiscal especial")], q: T("Who pays the income tax on the $30,000?", "¿Quién paga el impuesto sobre la renta de los $30,000?"),
      opts: [T("The owner, on a personal return", "El dueño, en su declaración personal"), T("The LLC pays 21%", "La LLC paga 21%"), T("Both, double taxation", "Los dos, doble tributación"), T("Nobody", "Nadie")], a: 0,
      why: T("A one-owner LLC is pass-through by default: the profit lands on the owner's own return.", "Una LLC de un dueño es de transferencia por defecto: la ganancia va en la declaración del dueño.") },
    { facts: [T("Sam expects to owe $2,400 of tax on business profit this year", "Sam espera deber $2,400 de impuestos por la ganancia de su negocio este año"), T("Nobody withholds tax from it", "Nadie le retiene impuestos")], q: T("What should Sam do?", "¿Qué debe hacer Sam?"),
      opts: [T("Pay about $600 each quarter", "Pagar unos $600 cada trimestre"), T("Pay $2,400 next April", "Pagar $2,400 el próximo abril"), T("Pay $200 a month to the bank", "Pagarle $200 al mes al banco"), T("Nothing, it's under $5,000", "Nada, son menos de $5,000")], a: 0,
      why: `${T("Over $1,000 owed means estimated taxes every quarter:", "Deber más de $1,000 significa pagar impuestos estimados cada trimestre:")} ${fr("$2,400", "4")} = $600.` },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#pk-why"), nextB = $("#pk-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#pk-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#pk-q").textContent = r.q;
    $("#pk-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#pk-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#pk-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#pk-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#pk-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#pk-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#pk-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("By the book", "En regla") : G.score >= 6 ? T("Almost official", "Casi en regla") : T("Review the three steps", "Repasa los tres pasos")}</b><p>${T("Ask what you could lose, how the profit gets taxed, then do the paperwork.", "Pregúntate qué podrías perder, cómo se grava la ganancia y luego haz los trámites.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="pk-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#pk-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#pk-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#pk").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Set up eight businesses the right way", "Organizaste ocho negocios como se debe"));
    if (G.score === N) FH.badge("by-the-book");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What does limited liability mean for an LLC's owner?", opts: ["Business creditors usually can't take the owner's personal savings", "The owner pays no taxes", "The business can't borrow money", "The owner can't lose any money"], a: 0, why: "The owner can lose what's in the business, but personal savings are usually protected, unless the owner signed a personal guarantee." },
    { q: "What is double taxation?", opts: ["A corporation's profit is taxed, then taxed again when paid as dividends", "Paying tax to two states", "Paying self-employment tax twice", "Two owners each paying the same tax"], a: 0, why: "A C corporation pays 21% on its profit, then owners pay tax again on the dividends." },
    { q: "A C corporation earns $50,000 of profit. At a 21% federal rate, how much corporate tax does it owe?", opts: ["$10,500", "$5,000", "$39,500", "$21,000"], a: 0, why: "$50,000 × 0.21 = $10,500." },
    { q: "In a sole proprietorship, who is responsible for the business's debts?", opts: ["The owner, personally", "Nobody", "Only the business bank account", "The state"], a: 0, why: "The owner and the business are legally the same, so the owner has unlimited liability." },
    { q: "What is an EIN?", opts: ["A free tax ID number for a business from the IRS", "A business license from the city", "A type of LLC", "A business bank account"], a: 0, why: "An Employer Identification Number works like a Social Security number for a business." },
    { q: "By default, how is a one-owner LLC taxed?", opts: ["As a pass-through: profit goes on the owner's return", "Like a C corporation, at 21%", "It pays no tax at all", "Twice, like a corporation"], a: 0, why: "Unless it chooses otherwise, a one-owner LLC's profit passes through to the owner's personal return." },
    { q: "Why should an LLC owner keep a separate business bank account?", opts: ["Mixing money can weaken the LLC's liability protection", "It's the only way to get an EIN", "Banks pay more interest to businesses", "It lowers the tax rate"], a: 0, why: "Keeping business and personal money apart keeps clean records and keeps the legal wall between you and the business strong." },
    { q: "Why do self-employed people pay estimated taxes each quarter?", opts: ["No employer withholds tax from their income", "Quarterly payments have a lower tax rate", "It's only for corporations", "To get a bigger refund"], a: 0, why: "Paychecks have tax withheld; business profit doesn't. If you'll owe $1,000 or more, you pay four times a year." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué significa la responsabilidad limitada para el dueño de una LLC?", opts: ["Los acreedores del negocio normalmente no pueden quitarle sus ahorros personales", "El dueño no paga impuestos", "El negocio no puede pedir prestado", "El dueño no puede perder dinero"], a: 0, why: "El dueño puede perder lo que está en el negocio, pero sus ahorros personales normalmente están protegidos, a menos que haya firmado una garantía personal." },
    { q: "¿Qué es la doble tributación?", opts: ["La ganancia de una corporación paga impuestos, y otra vez cuando se paga como dividendos", "Pagar impuestos en dos estados", "Pagar dos veces el impuesto de trabajo por cuenta propia", "Que dos dueños paguen el mismo impuesto"], a: 0, why: "Una corporación C paga 21% sobre su ganancia, y luego los dueños pagan otra vez sobre los dividendos." },
    { q: "Una corporación C gana $50,000. Con una tasa federal de 21%, ¿cuánto impuesto corporativo debe?", opts: ["$10,500", "$5,000", "$39,500", "$21,000"], a: 0, why: "$50,000 × 0.21 = $10,500." },
    { q: "En una empresa de dueño único, ¿quién responde por las deudas del negocio?", opts: ["El dueño, en persona", "Nadie", "Solo la cuenta de banco del negocio", "El estado"], a: 0, why: "El dueño y el negocio son legalmente lo mismo, así que el dueño tiene responsabilidad ilimitada." },
    { q: "¿Qué es un EIN?", opts: ["Un número de identificación fiscal gratis para un negocio, del IRS", "Una licencia de la ciudad", "Un tipo de LLC", "Una cuenta de banco del negocio"], a: 0, why: "El Número de Identificación del Empleador funciona como un número de Seguro Social para un negocio." },
    { q: "Por defecto, ¿cómo paga impuestos una LLC de un solo dueño?", opts: ["Es de transferencia: la ganancia va en la declaración del dueño", "Como corporación C, al 21%", "No paga ningún impuesto", "Dos veces, como una corporación"], a: 0, why: "Si no elige otra cosa, la ganancia de una LLC de un dueño pasa a la declaración personal del dueño." },
    { q: "¿Por qué el dueño de una LLC debe tener una cuenta de banco aparte para el negocio?", opts: ["Mezclar el dinero puede debilitar la protección de la LLC", "Es la única forma de obtener un EIN", "Los bancos pagan más intereses a los negocios", "Baja la tasa de impuestos"], a: 0, why: "Separar el dinero del negocio y el personal mantiene los registros en orden y la pared legal entre tú y el negocio firme." },
    { q: "¿Por qué las personas que trabajan por su cuenta pagan impuestos estimados cada trimestre?", opts: ["Ningún empleador les retiene impuestos", "Los pagos trimestrales tienen una tasa más baja", "Es solo para corporaciones", "Para recibir un reembolso más grande"], a: 0, why: "A los cheques de pago se les retienen impuestos; a la ganancia de un negocio, no. Si vas a deber $1,000 o más, pagas cuatro veces al año." },
  ];

  FHLesson.init({ id: LESSON, short: "legal-setup", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
