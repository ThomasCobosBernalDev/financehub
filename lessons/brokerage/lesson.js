// Unit 5, Lesson 4: Open a brokerage account
(function () {
  const LESSON = "u5-brokerage";
  const { $, $$ } = FHLesson;
  const T = FH.t;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- See it: tap the fee schedule ----------
  const FEES = [
    { k: T("Commission, U.S. stocks and ETFs online", "Comisión por operación, acciones y ETF de EE. UU. en línea"), v: "$0", never: true,
      when: T("Never. Buying $10 of an ETF costs $0, so all $10 gets invested.", "Nunca. Comprar $10 de un ETF cuesta $0, así que se invierten los $10 completos.") },
    { k: T("Account maintenance fee", "Comisión por manejo de cuenta"), v: T("$0", "$0"), never: true,
      when: T("Never. Some brokers used to charge just for having an account. This one doesn't.", "Nunca. Algunos brokers cobraban solo por tener una cuenta. Este no.") },
    { k: T("Fund expense ratio", "Tasa de gastos del fondo"), v: T("set by each fund, like 0.03%", "la fija cada fondo, como 0.03%"),
      when: T("Always, while you own a fund. It's taken out inside the fund, so the broker never bills you for it. Pick funds with low ones.", "Siempre, mientras tengas un fondo. Se descuenta dentro del fondo, así que el broker nunca te lo cobra aparte. Elige fondos con tasas bajas.") },
    { k: T("Mutual fund transaction fee", "Comisión por comprar ciertos fondos mutuos"), v: T("$49.95 per buy", "$49.95 por compra"),
      when: T("Only if you buy certain mutual funds from other fund companies. ETFs and the broker's own no-fee funds skip it.", "Solo si compras ciertos fondos mutuos de otras empresas. Los ETF y los fondos sin comisión del propio broker no la pagan.") },
    { k: T("Full account transfer out", "Transferencia de la cuenta a otro broker"), v: "$100",
      when: T("Only if you move your investments to another broker. Real brokers range from $0 to about $100 for this.", "Solo si te llevas tus inversiones a otro broker. Los brokers reales cobran entre $0 y unos $100 por esto.") },
    { k: T("Paper statements", "Estados de cuenta en papel"), v: T("$2 each", "$2 cada uno"),
      when: T("Only if you ask for paper. Choosing electronic statements makes it $0.", "Solo si pides papel. Con estados de cuenta electrónicos es $0.") },
    { k: T("Margin interest", "Intereses de margen"), v: T("11% a year", "11% al año"),
      when: T("Only if you borrow on margin. A cash account never pays it.", "Solo si pides prestado con margen. Una cuenta de efectivo nunca lo paga.") },
  ];
  $("#fs-rows").innerHTML = FEES.map((f, i) => `<button type="button" class="fs-row" data-i="${i}"><span>${f.k}</span><b>${f.v}</b></button>`).join("");
  const seen = new Set();
  $$("#fs-rows .fs-row").forEach((b) => b.addEventListener("click", () => {
    const f = FEES[+b.dataset.i];
    $$("#fs-rows .fs-row").forEach((x) => x.classList.toggle("on", x === b));
    b.classList.add("seen");
    seen.add(b.dataset.i);
    const msg = $("#fs-msg");
    msg.innerHTML = `<b>${f.k}: ${f.v}.</b> ${f.when}`;
    msg.dataset.tone = f.never ? "good" : "warn";
    if (seen.size === FEES.length) FH.badge("fee-reader", T("Fine Print Reader", "Lector de letra chiquita"));
  }));

  // ---------- Play it: open your account ----------
  const STEPS = [
    { title: T("Pick a broker", "Elige un broker"), short: T("Broker", "Broker"),
      prompt: T("Three apps show up when you search for investing apps. Which one do you sign up with?", "Te salen tres apps cuando buscas apps para invertir. ¿Con cuál te registras?"),
      opts: [
        { t: "Nimbus Trade", s: T("$4.95 per trade · $5 a month account fee · Member SIPC", "$4.95 por operación · $5 al mes por la cuenta · Miembro de SIPC"),
          why: T("It's legit, but $4.95 a trade would eat about half of a $10 buy, and $5 a month is $60 a year just for having the account.", "Es legítima, pero $4.95 por operación se comerían como la mitad de una compra de $10, y $5 al mes son $60 al año solo por tener la cuenta.") },
        { t: "MoonVault Invest", s: T("\"Guaranteed 20% a year!\" · not a SIPC member · deposit with gift cards", "\"¡20% garantizado al año!\" · no es miembro de SIPC · depósitos con tarjetas de regalo"),
          why: T("Guaranteed returns and gift-card deposits are scam signs. Without SIPC, nobody protects your account if the money vanishes.", "Los rendimientos garantizados y los depósitos con tarjetas de regalo son señales de estafa. Sin SIPC, nadie protege tu cuenta si el dinero desaparece.") },
        { t: "Oakline Brokerage", s: T("$0 commissions · $0 account fee · Member SIPC · buys pieces of shares", "$0 de comisiones · $0 por la cuenta · Miembro de SIPC · compra pedazos de acciones"), ok: true,
          why: T("$0 commissions, no account fee, SIPC protection, and it can buy pieces of a share, so $10 is enough to start.", "$0 de comisiones, nada por la cuenta, protección de SIPC, y puede comprar pedazos de una acción, así que con $10 alcanza para empezar.") },
      ] },
    { title: T("Account type", "Tipo de cuenta"), short: T("Type", "Tipo"),
      prompt: T("You're 19 and want an account for investing that you can take money out of any time. Which type?", "Tienes 19 años y quieres una cuenta para invertir de la que puedas sacar dinero cuando quieras. ¿Qué tipo eliges?"),
      opts: [
        { t: T("Custodial account", "Cuenta custodia"), s: T("Opened by a parent for someone under 18", "La abre un padre o madre para alguien menor de 18"),
          why: T("Custodial accounts are for people under 18. At 19, you can open your own.", "Las cuentas custodia son para menores de 18. A los 19, puedes abrir la tuya.") },
        { t: T("Individual brokerage account", "Cuenta de inversión individual"), s: T("In your name only · take money out any time", "Solo a tu nombre · sacas dinero cuando quieras"), ok: true,
          why: T("It's yours alone, and you can sell and take money out whenever you want.", "Es solo tuya, y puedes vender y sacar dinero cuando quieras.") },
        { t: T("Joint account", "Cuenta conjunta"), s: T("Owned with another person", "Compartida con otra persona"),
          why: T("A joint account belongs to both people, and either one can usually take money out. Keep your first account in your own name.", "Una cuenta conjunta es de las dos personas, y casi siempre cualquiera de las dos puede sacar dinero. Ten tu primera cuenta a tu nombre.") },
      ] },
    { title: T("Cash or margin?", "¿Efectivo o margen?"), short: T("Cash or margin", "Efectivo o margen"),
      prompt: T("The app asks how you want the account set up.", "La app te pregunta cómo quieres configurar la cuenta."),
      opts: [
        { t: T("Margin account", "Cuenta de margen"), s: T("Borrow from Oakline to invest more", "Pídele prestado a Oakline para invertir más"),
          why: T("Borrowing doubles losses as well as gains, and you'd pay 11% a year in interest. A 30% drop could wipe out 60% of your money.", "Pedir prestado duplica las pérdidas igual que las ganancias, y pagarías 11% al año de intereses. Una caída de 30% podría borrar el 60% de tu dinero.") },
        { t: T("Cash account", "Cuenta de efectivo"), s: T("Invest only the money I put in", "Invertir solo el dinero que yo ponga"), ok: true,
          why: T("You can never lose more than you put in, and you never pay margin interest.", "Nunca puedes perder más de lo que pusiste, y nunca pagas intereses de margen.") },
      ] },
    { title: T("Verify your identity", "Verifica tu identidad"), short: T("Identity", "Identidad"), multi: true,
      prompt: T("Select everything the app should ask you for, then tap Continue.", "Selecciona todo lo que la app debería pedirte y toca Continuar."),
      opts: [
        { t: T("Full legal name", "Nombre legal completo"), ok: true },
        { t: T("Home address", "Domicilio"), ok: true },
        { t: T("Your bank's login password", "La contraseña de tu banco"), bad: true },
        { t: T("Date of birth", "Fecha de nacimiento"), ok: true },
        { t: T("Debit card PIN", "El PIN de tu tarjeta de débito"), bad: true },
        { t: T("Social Security number", "Número de Seguro Social"), ok: true },
      ],
      why: T("Know-your-customer rules require your name, address, date of birth and Social Security number, and the SSN also goes on your tax forms. No real broker needs your bank password or your PIN.", "Las reglas de conocer a tu cliente piden tu nombre, domicilio, fecha de nacimiento y número de Seguro Social, y el número también va en tus formularios de impuestos. Ningún broker real necesita la contraseña de tu banco ni tu PIN."),
      bad: T("A real broker never asks for your bank password or debit card PIN. Anyone who does is trying to get into your bank account.", "Un broker real nunca te pide la contraseña de tu banco ni el PIN de tu tarjeta. Quien te los pide está tratando de entrar a tu cuenta del banco."),
      missing: T("You left out something the broker is required to check. Know-your-customer rules cover your name, address, date of birth and Social Security number.", "Te faltó algo que el broker tiene que verificar. Las reglas de conocer a tu cliente piden tu nombre, domicilio, fecha de nacimiento y número de Seguro Social.") },
    { title: T("Link your bank", "Vincula tu banco"), short: T("Bank", "Banco"), check: true,
      prompt: T("The bottom of your check reads like this. Which number goes in the Routing number box?", "La parte de abajo de tu cheque se ve así. ¿Qué número va en el campo de número de ruta?"),
      opts: [
        { t: "00084417", s: T("the second number", "el segundo número"), why: T("That's your account number, which identifies your own account. It goes in the next box.", "Ese es tu número de cuenta, que identifica tu propia cuenta. Va en el siguiente campo.") },
        { t: "1042", s: T("the last number", "el último número"), why: T("That's just the check number. It's also printed at the top right of the check.", "Ese es solo el número del cheque. También está impreso arriba a la derecha del cheque.") },
        { t: "123456789", s: T("the first number, 9 digits", "el primer número, de 9 dígitos"), ok: true, why: T("The routing number comes first and is always 9 digits. It tells Oakline which bank to pull from.", "El número de ruta va primero y siempre tiene 9 dígitos. Le dice a Oakline de qué banco sacar el dinero.") },
      ] },
    { title: T("Protect your login", "Protege tu acceso"), short: T("Security", "Seguridad"),
      prompt: T("Last screen: security. What do you turn on?", "Última pantalla: seguridad. ¿Qué activas?"),
      opts: [
        { t: T("Two-factor authentication", "Verificación en dos pasos"), s: T("Password plus a code sent to my phone", "Contraseña más un código que llega a mi celular"), ok: true,
          why: T("Even if someone steals your password, they can't get in without the code on your phone.", "Aunque alguien robe tu contraseña, no puede entrar sin el código de tu celular.") },
        { t: T("Remember me everywhere", "Recordarme en todos lados"), s: T("Stay logged in on any computer, even shared ones", "Seguir con la sesión abierta en cualquier computadora, aunque sea compartida"),
          why: T("Staying logged in on a shared computer lets the next person into your account.", "Dejar la sesión abierta en una computadora compartida deja entrar a la siguiente persona a tu cuenta.") },
        { t: T("Share access", "Compartir acceso"), s: T("Give my login to a friend who knows stocks", "Darle mi usuario a un amigo que sabe de acciones"),
          why: T("Anyone with your login can sell your investments or move your money. Never share it.", "Cualquiera con tu usuario puede vender tus inversiones o mover tu dinero. Nunca lo compartas.") },
      ] },
  ];
  const G = { step: 0, tries: 0, score: 0, done: false, picks: new Set() };
  const optsEl = $("#su-opts"), whyEl = $("#su-why"), nextBtn = $("#su-next"), submitBtn = $("#su-submit");
  $("#su-steps").innerHTML = STEPS.map((s, i) => `<li data-i="${i}"><span class="mk"></span><span class="lbl">${s.short}</span></li>`).join("");

  const renderStep = () => {
    const st = STEPS[G.step];
    G.tries = 0; G.picks = new Set();
    $("#su-step").textContent = T(`Step ${G.step + 1} of ${STEPS.length}`, `Paso ${G.step + 1} de ${STEPS.length}`);
    $("#su-title").textContent = st.title;
    $("#su-prompt").innerHTML = st.prompt + (st.check ? `<span class="su-micr">⑆123456789⑆ 00084417⑈ 1042</span>` : "");
    optsEl.className = `su-opts${st.multi ? " multi" : ""}`;
    optsEl.innerHTML = st.opts.map((o, i) => `<button type="button" class="su-opt" data-i="${i}"${st.multi ? ' aria-pressed="false"' : ""}><b>${o.t}</b>${o.s ? `<small>${o.s}</small>` : ""}</button>`).join("");
    submitBtn.classList.toggle("hidden", !st.multi);
    submitBtn.disabled = false;
    whyEl.classList.add("hidden"); whyEl.innerHTML = "";
    nextBtn.disabled = true;
    nextBtn.innerHTML = `${G.step === STEPS.length - 1 ? T("Open my account", "Abrir mi cuenta") : T("Next", "Siguiente")} <span class="arrow">→</span>`;
    $$("#su-steps li").forEach((li, i) => { li.classList.toggle("now", i === G.step); });
  };

  const pass = (msg) => {
    const first = G.tries === 1;
    if (first) G.score++;
    $(`#su-steps li[data-i="${G.step}"]`).classList.add(first ? "done" : "late");
    $("#su-score").textContent = T(`${G.score} of ${G.step + 1}`, `${G.score} de ${G.step + 1}`);
    whyEl.classList.remove("hidden");
    whyEl.dataset.tone = "good";
    whyEl.innerHTML = `<b>${first ? T("Right on the first try.", "Correcto al primer intento.") : T("That's it.", "Eso es.")}</b> ${msg}`;
    $$(".su-opt", optsEl).forEach((x) => (x.disabled = true));
    submitBtn.disabled = true;
    nextBtn.disabled = false;
  };
  const miss = (msg) => {
    whyEl.classList.remove("hidden");
    whyEl.dataset.tone = "warn";
    whyEl.innerHTML = `<b>${T("Not quite.", "No exactamente.")}</b> ${msg} ${T("Try again.", "Intenta otra vez.")}`;
  };

  optsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".su-opt");
    if (!b || b.disabled) return;
    const st = STEPS[G.step], o = st.opts[+b.dataset.i];
    if (st.multi) {
      const i = +b.dataset.i;
      G.picks.has(i) ? G.picks.delete(i) : G.picks.add(i);
      b.classList.toggle("on", G.picks.has(i));
      b.setAttribute("aria-pressed", G.picks.has(i) ? "true" : "false");
      return;
    }
    G.tries++;
    if (o.ok) { b.classList.add("right"); pass(o.why); }
    else { b.classList.add("wrong"); b.disabled = true; miss(o.why); }
  });
  submitBtn.addEventListener("click", () => {
    const st = STEPS[G.step];
    G.tries++;
    const picked = [...G.picks].map((i) => st.opts[i]);
    $$(".su-opt", optsEl).forEach((b) => b.classList.remove("wrong"));
    if (picked.some((o) => o.bad)) {
      [...G.picks].forEach((i) => { if (st.opts[i].bad) $(`.su-opt[data-i="${i}"]`, optsEl).classList.add("wrong"); });
      miss(st.bad);
    } else if (picked.length < st.opts.filter((o) => o.ok).length) miss(st.missing);
    else {
      $$(".su-opt", optsEl).forEach((b) => { if (st.opts[+b.dataset.i].ok) b.classList.add("right"); });
      pass(st.why);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (G.step < STEPS.length - 1) { G.step++; renderStep(); return; }
    if (G.done) { // start over
      G.step = 0; G.score = 0; G.done = false;
      $$("#su-steps li").forEach((li) => li.classList.remove("done", "late"));
      $("#su-score").textContent = T("0 of 0", "0 de 0");
      $("#su-result").classList.add("hidden");
      renderStep();
      return;
    }
    G.done = true;
    $$("#su-steps li").forEach((li) => li.classList.remove("now"));
    $("#su-step").textContent = T("All set", "Todo listo");
    $("#su-title").textContent = T("Account open", "Cuenta abierta");
    $("#su-prompt").innerHTML = "";
    submitBtn.classList.add("hidden");
    whyEl.classList.add("hidden");
    optsEl.className = "su-opts";
    optsEl.innerHTML = `<div class="su-summary">
      <small>OAKLINE · ${T("INDIVIDUAL CASH ACCOUNT", "CUENTA INDIVIDUAL DE EFECTIVO")}</small>
      <b class="su-bal">$0.00</b>
      <span>${T("Checking ••4417 linked", "Cheques ••4417 vinculada")}</span>
      <span class="su-xfer">${T("$50 transfer on the way · 1 to 3 business days", "Transferencia de $50 en camino · 1 a 3 días hábiles")}</span>
      <span>${T("Two-factor authentication on", "Verificación en dos pasos activada")}</span>
      <span>${T("Protected by SIPC up to $500,000", "Protegida por SIPC hasta $500,000")}</span></div>`;
    nextBtn.innerHTML = `${T("Start over", "Empezar de nuevo")} <span class="arrow">→</span>`;
    const res = $("#su-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/6</span><div><b>${G.score === 6 ? T("Opened without a single slip", "Abierta sin un solo error") : T("Your account is open", "Tu cuenta está abierta")}</b><p>${T(
      "You picked a broker with $0 commissions and SIPC protection, opened an individual cash account, gave only the information a real broker needs, linked your bank by its routing number, and locked your login. Next lesson, you'll use that $50 to place your first order.",
      "Elegiste un broker con $0 de comisiones y protección de SIPC, abriste una cuenta individual de efectivo, diste solo la información que pide un broker real, vinculaste tu banco con su número de ruta y protegiste tu acceso. En la siguiente lección vas a usar esos $50 para hacer tu primera orden.")}</p></div></div>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 6) * 100));
    if (first) FH.addXP(50, T("Opened a practice brokerage account", "Abriste una cuenta de inversión de práctica"));
    if (G.score === 6) FH.badge("account-opener", T("Account Opener", "Cuenta abierta"));
    FH.save();
    // The transfer lands a moment later, like it would a couple of days later for real.
    setTimeout(() => { const bal = $(".su-bal"); if (bal) { bal.textContent = "$50.00"; bal.classList.add("in"); $(".su-xfer").textContent = T("$50 arrived · ready to invest", "Llegaron los $50 · listos para invertir"); } }, reduced ? 0 : 1600);
  });
  renderStep();

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "Why can't you buy shares of an ETF straight from a regular checking account?",
      opts: ["Investments are bought and held through a brokerage account", "Checking accounts can only hold amounts under $1,000", "ETFs can only be bought with a credit card, not cash", "Banks are not allowed to hold any money for investing"], a: 0,
      why: "A broker buys and sells investments for you and holds them in a brokerage account. A checking account just holds cash." },
    { q: "Why does a broker ask for your Social Security number when you open an account?",
      opts: ["To verify who you are and report your investment taxes", "To check your credit score before letting you invest", "To pull money from your bank account without asking", "To sign you up for government retirement benefits"], a: 0,
      why: "Know-your-customer rules require brokers to verify your identity, and the SSN goes on the tax forms they send you and the IRS." },
    { q: "You put in $1,000 and borrow $1,000 on margin to buy $2,000 of stock. It falls 20%. How much of your own money is left?",
      opts: ["$600", "$800", "$1,600", "$400"], a: 0,
      why: `$2,000 × 0.80 = $1,600. Minus the $1,000 loan leaves $600: ${F("$600 − $1,000", "$1,000")} = −40%, double the 20% drop.` },
    { q: "A broker charges a $4.95 commission. About what percent of a $10 purchase is that?",
      opts: ["About 50%", "About 5%", "About 0.5%", "About 99%"], a: 0,
      why: `Fee as a percent = ${F("fee", "amount you invest")} = ${F("$4.95", "$10")} ≈ 0.50, about 50%.` },
    { q: "Your S&P 500 fund drops from $10,000 to $8,000 in a crash. Your broker is fine. What does SIPC pay you?",
      opts: ["Nothing, since SIPC never covers market losses", "$2,000, the full amount of your loss", "$500, a fixed payment for crash losses", "$1,000, half of your loss in the crash"], a: 0,
      why: "SIPC only covers missing investments when a brokerage firm fails, up to $500,000. Falling prices are your risk." },
    { q: "On a check, what does the 9-digit routing number identify?",
      opts: ["Your bank", "Your own account", "The check's number", "Your Social Security number"], a: 0,
      why: "The routing number identifies the bank. The account number after it identifies your own account." },
    { q: "A 16-year-old wants to start investing. What kind of account can she use?",
      opts: ["A custodial account opened by a parent", "A margin account in her own name", "A joint account with a friend her age", "None until she turns 21 in every state"], a: 0,
      why: "Most states require you to be 18 to open your own account. Until then, a parent can open a custodial account for her." },
  ];
  const QUIZ_ES = [
    { q: "¿Por qué no puedes comprar acciones de un ETF directamente desde una cuenta de cheques normal?",
      opts: ["Las inversiones se compran y se guardan en una cuenta de inversión", "Las cuentas de cheques solo pueden tener menos de $1,000", "Los ETF solo se compran con tarjeta de crédito, no con efectivo", "Los bancos no pueden guardar dinero para invertir"], a: 0,
      why: "Un broker compra y vende inversiones por ti y las guarda en una cuenta de inversión. Una cuenta de cheques solo guarda efectivo." },
    { q: "¿Por qué un broker te pide tu número de Seguro Social al abrir una cuenta?",
      opts: ["Para verificar quién eres y reportar los impuestos de tus inversiones", "Para revisar tu puntaje de crédito antes de dejarte invertir", "Para sacar dinero de tu banco sin preguntarte", "Para inscribirte en los beneficios de retiro del gobierno"], a: 0,
      why: "Las reglas de conocer a tu cliente obligan a los brokers a verificar tu identidad, y el número de Seguro Social va en los formularios de impuestos que te mandan a ti y al IRS." },
    { q: "Pones $1,000 y pides prestados $1,000 con margen para comprar $2,000 en acciones. Caen 20%. ¿Cuánto te queda de tu propio dinero?",
      opts: ["$600", "$800", "$1,600", "$400"], a: 0,
      why: `$2,000 × 0.80 = $1,600. Menos el préstamo de $1,000 quedan $600: ${F("$600 − $1,000", "$1,000")} = −40%, el doble de la caída de 20%.` },
    { q: "Un broker cobra una comisión de $4.95. ¿Más o menos qué porcentaje de una compra de $10 es eso?",
      opts: ["Más o menos 50%", "Más o menos 5%", "Más o menos 0.5%", "Más o menos 99%"], a: 0,
      why: `Comisión como porcentaje = ${F("comisión", "lo que inviertes")} = ${F("$4.95", "$10")} ≈ 0.50, más o menos 50%.` },
    { q: "Tu fondo del S&P 500 baja de $10,000 a $8,000 en una caída. Tu broker está bien. ¿Cuánto te paga SIPC?",
      opts: ["Nada, porque SIPC nunca cubre pérdidas del mercado", "$2,000, todo lo que perdiste", "$500, un pago fijo por caídas", "$1,000, la mitad de lo que perdiste"], a: 0,
      why: "SIPC solo cubre inversiones que faltan cuando quiebra una casa de bolsa, hasta $500,000. Las bajas de precio son tu riesgo." },
    { q: "En un cheque, ¿qué identifica el número de ruta de 9 dígitos?",
      opts: ["Tu banco", "Tu propia cuenta", "El número del cheque", "Tu número de Seguro Social"], a: 0,
      why: "El número de ruta identifica al banco. El número de cuenta que sigue identifica tu propia cuenta." },
    { q: "Una muchacha de 16 años quiere empezar a invertir. ¿Qué tipo de cuenta puede usar?",
      opts: ["Una cuenta custodia que abre su papá o su mamá", "Una cuenta de margen a su propio nombre", "Una cuenta conjunta con una amiga de su edad", "Ninguna hasta los 21 años en todos los estados"], a: 0,
      why: "En la mayoría de los estados necesitas 18 años para abrir tu propia cuenta. Mientras tanto, su papá o su mamá puede abrirle una cuenta custodia." },
  ];

  FHLesson.init({ id: LESSON, short: "brokerage", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
