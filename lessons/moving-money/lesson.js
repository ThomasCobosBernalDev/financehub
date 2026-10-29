// Unit 1, Lesson 4: Move money safely
(function () {
  const LESSON = "u1-moving-money";
  const { $, $$, fillRange } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const chips = (sel, fn) => $$(`${sel} .chip`).forEach((c) => c.addEventListener("click", () => {
    $$(`${sel} .chip`).forEach((x) => x.classList.toggle("on", x === c));
    fn(c.dataset.v);
  }));
  const instantFee = (a) => Math.min(25, Math.max(0.25, Math.round(a * 0.0175 * 100) / 100));

  // ---------- See it: five ways to send ----------
  const rlAmt = $("#rl-amt");
  let day = "am", need = "week";
  const drawRails = () => {
    const a = +rlAmt.value, am = day === "am";
    $("#rl-amt-v").textContent = money(a);
    const rails = [
      { name: "Zelle", sub: T("Bank to bank, by phone or email", "De banco a banco, por teléfono o correo"), when: T("Minutes", "Minutos"), today: true, fee: 0, undo: false },
      { name: T("ACH bank transfer", "Transferencia ACH"), sub: T("Between your own accounts", "Entre tus propias cuentas"), when: am ? T("By Tuesday", "A más tardar el martes") : T("By Wednesday", "A más tardar el miércoles"), today: false, fee: 0, undo: true },
      { name: T("Wire transfer", "Transferencia urgente"), sub: T("Bank to bank, same business day", "De banco a banco, el mismo día hábil"), when: am ? T("Today", "Hoy") : T("Monday", "El lunes"), today: am, fee: 30, undo: false },
      { name: T("Venmo, standard", "Venmo, estándar"), sub: T("App balance to your bank", "Del saldo de la app a tu banco"), when: am ? T("By Tuesday", "A más tardar el martes") : T("By Wednesday", "A más tardar el miércoles"), today: false, fee: 0, undo: false },
      { name: T("Venmo, instant", "Venmo, instantáneo"), sub: T("App balance to your bank", "Del saldo de la app a tu banco"), when: T("Minutes", "Minutos"), today: true, fee: instantFee(a), undo: false },
    ];
    const ok = rails.filter((r) => need === "week" || r.today);
    const best = ok.reduce((b, r) => (r.fee < b.fee ? r : b), ok[0]);
    $("#rl-rows").innerHTML = rails.map((r) => {
      const miss = need === "now" && !r.today;
      return `<div class="rl-row${r === best ? " best" : ""}${miss ? " miss" : ""}">
        <div class="rl-name"><b>${r.name}</b><small>${r.sub}</small></div>
        <div class="rl-cell"><small>${T("Arrives", "Llega")}</small><b>${r.when}</b></div>
        <div class="rl-cell"><small>${T("Fee", "Comisión")}</small><b class="${r.fee ? "neg" : "ok"}">${cents(r.fee)}</b></div>
        <div class="rl-cell"><small>${T("Can undo?", "¿Se puede deshacer?")}</small><b>${r.undo ? T("Sometimes", "A veces") : T("No", "No")}</b></div></div>`;
    }).join("");
    const m = $("#rl-msg");
    if (need === "week") {
      m.innerHTML = T(`Waiting is free: an ACH transfer or Venmo's standard transfer moves ${money(a)} for <b>$0</b>. Instant would cost <b>${cents(instantFee(a))}</b> and a wire about <b>$30</b>.`, `Esperar es gratis: una transferencia ACH o la estándar de Venmo mueven ${money(a)} por <b>$0</b>. La instantánea costaría <b>${cents(instantFee(a))}</b> y una transferencia urgente unos <b>$30</b>.`);
      m.dataset.tone = "good";
    } else {
      m.innerHTML = T(`Need it today? Zelle is free if both accounts use it. From an app balance, instant costs <b>${cents(instantFee(a))}</b>.${am ? " A wire works too, but costs about $30." : " On Friday night, even a wire waits until Monday."}`, `¿Lo necesitas hoy? Zelle es gratis si las dos cuentas lo usan. Desde el saldo de una app, lo instantáneo cuesta <b>${cents(instantFee(a))}</b>.${am ? " Una transferencia urgente también sirve, pero cuesta unos $30." : " El viernes en la noche, hasta una transferencia urgente espera al lunes."}`);
      m.dataset.tone = "warn";
    }
    fillRange(rlAmt);
  };
  rlAmt.addEventListener("input", drawRails);
  chips("#rl-day", (v) => { day = v; drawRails(); });
  chips("#rl-need", (v) => { need = v; drawRails(); });
  drawRails();

  // ---------- Play it: pick the right rail ----------
  const ROUNDS = [
    { scene: T("Your roommate covered your <b>$15</b> share of pizza and asks you to pay them back tonight.", "Tu compañero de cuarto pagó tu parte de <b>$15</b> de la pizza y te pide que se la devuelvas hoy."),
      opts: [
        { t: T("Zelle it to the number saved in your contacts", "Se lo mandas por Zelle al número que tienes guardado"), ok: true, why: T("Fast, free, and you know them. Using the saved number means you won't mistype it.", "Rápido, gratis, y lo conoces. Usar el número guardado evita que lo escribas mal.") },
        { t: T("Send a wire transfer", "Le mandas una transferencia urgente"), ok: false, why: T("A wire costs about $30 to send $15. Way too much.", "Una transferencia urgente cuesta unos $30 para mandar $15. Demasiado.") },
        { t: T("Mail a check", "Le mandas un cheque por correo"), ok: false, why: T("It works, but it takes days and a stamp. Zelle or Venmo is free and instant for someone you know.", "Funciona, pero tarda días y cuesta un timbre postal. Zelle o Venmo son gratis e instantáneos con alguien que conoces.") },
      ] },
    { scene: T("A stranger on social media is selling two concert tickets for <b>$120</b>. They ask you to pay by Zelle.", "Un desconocido en redes sociales vende dos boletos para un concierto por <b>$120</b>. Te pide que pagues por Zelle."),
      opts: [
        { t: T("Zelle the $120 quickly before someone else buys them", "Le mandas los $120 por Zelle rápido, antes de que alguien más los compre"), ok: false, why: T("Zelle is like cash: if the tickets never come, the money's gone. Rushing you is a classic scam move.", "Zelle es como efectivo: si los boletos nunca llegan, el dinero se perdió. Apurarte es una táctica típica de estafa.") },
        { t: T("Pay with a credit card through the official ticket seller", "Pagas con tarjeta de crédito en el vendedor oficial de boletos"), ok: true, why: T("A card can be disputed, and the official seller guarantees the tickets are real.", "Una tarjeta se puede disputar, y el vendedor oficial garantiza que los boletos son reales.") },
        { t: T("Send it on Venmo as friends and family", "Lo mandas por Venmo como amigos y familia"), ok: false, why: T("Friends-and-family payments have no purchase protection. You'd have no way to get it back.", "Los pagos de amigos y familia no tienen protección de compra. No habría forma de recuperarlo.") },
      ] },
    { scene: T("Rent of <b>$650</b> is due next Friday. $300 of it is in your Peak savings, and it's Monday.", "La renta de <b>$650</b> vence el próximo viernes. $300 están en tu ahorro de Peak, y es lunes."),
      opts: [
        { t: T("Start a free ACH transfer from Peak today", "Empiezas hoy una transferencia ACH gratis desde Peak"), ok: true, why: T("1 to 3 business days means it lands by Wednesday, two days early, for $0.", "De 1 a 3 días hábiles significa que llega a más tardar el miércoles, dos días antes, por $0.") },
        { t: T("Wire it from Peak today", "La mandas por transferencia urgente desde Peak hoy"), ok: false, why: T("About $30 for speed you don't need. You have a whole week.", "Unos $30 por una rapidez que no necesitas. Tienes toda una semana.") },
        { t: T("Wait and move it Friday morning", "Esperas y la mueves el viernes en la mañana"), ok: false, why: T("Started Friday, it might not land until Tuesday, after rent is due.", "Si empieza el viernes, podría no llegar hasta el martes, después de que vence la renta.") },
      ] },
    { scene: T("You have <b>$400</b> in your Venmo balance from selling your old bike. You don't need it until next week.", "Tienes <b>$400</b> en tu saldo de Venmo por vender tu bicicleta vieja. No los necesitas hasta la próxima semana."),
      opts: [
        { t: T("Instant transfer to your bank", "Transferencia instantánea a tu banco"), ok: false, why: T("1.75% × $400 = $7.00, for money you don't need yet.", "1.75% × $400 = $7.00, por dinero que todavía no necesitas.") },
        { t: T("Standard transfer to your bank", "Transferencia estándar a tu banco"), ok: true, why: T("Free, and it arrives in 1 to 3 business days. It's also safer in your insured bank account than in an app balance.", "Gratis, y llega en 1 a 3 días hábiles. Además está más seguro en tu cuenta bancaria asegurada que en el saldo de una app.") },
        { t: T("Leave it in Venmo for now", "Lo dejas en Venmo por ahora") , ok: false, why: T("An app balance isn't a bank deposit and may not be FDIC insured. Move it to your bank for free.", "Un saldo en una app no es un depósito bancario y puede no estar asegurado por la FDIC. Pásalo gratis a tu banco.") },
      ] },
    { scene: T("An email from your landlord says: \"We switched banks. Please wire this month's <b>$650</b> to our new account below.\"", "Un correo de tu casero dice: \"Cambiamos de banco. Por favor manda por transferencia urgente los <b>$650</b> de este mes a nuestra nueva cuenta\"."),
      opts: [
        { t: T("Wire it to the new account", "La mandas a la cuenta nueva"), ok: false, why: T("Fake \"new bank details\" emails are a common scam, and a wire is almost impossible to pull back.", "Los correos falsos de \"datos bancarios nuevos\" son una estafa común, y una transferencia urgente es casi imposible de recuperar.") },
        { t: T("Call your landlord at the number you already had", "Llamas a tu casero al número que ya tenías"), ok: true, why: T("Confirm new payment details by calling a number you trust, never one in the email.", "Confirma los datos de pago nuevos llamando a un número de confianza, nunca al del correo.") },
        { t: T("Reply to the email to ask if it's real", "Respondes el correo para preguntar si es real"), ok: false, why: T("If the email is fake, the scammer is the one who answers \"yes, it's real.\"", "Si el correo es falso, el estafador es quien te contesta \"sí, es real\".") },
      ] },
    { scene: T("Grandma mailed you a <b>$200</b> birthday check. It's Monday.", "Tu abuela te mandó por correo un cheque de <b>$200</b> de cumpleaños. Es lunes."),
      opts: [
        { t: T("Deposit it by photo in your Riverbend app", "Lo depositas con una foto en tu app de Riverbend"), ok: true, why: T("It's under $275, so all $200 is usually available Tuesday. Write \"For mobile deposit only\" under your signature.", "Es menos de $275, así que los $200 suelen estar disponibles el martes. Escribe \"Solo para depósito móvil\" bajo tu firma.") },
        { t: T("Cash it at a check-cashing store", "Lo cambias en una tienda que cambia cheques"), ok: false, why: T("Check-cashing stores charge a fee, often a few percent. Your own bank deposits it for free.", "Las tiendas que cambian cheques cobran una comisión, muchas veces de varios por ciento. Tu banco lo deposita gratis.") },
        { t: T("Keep it in a drawer until you need it", "Lo guardas en un cajón hasta que lo necesites"), ok: false, why: T("Checks can expire, often after 6 months, and a lost check is a hassle. Deposit it now.", "Los cheques pueden vencer, muchas veces a los 6 meses, y uno perdido es un problema. Deposítalo ya.") },
      ] },
  ];
  const G = { i: 0, done: false, score: 0, log: [] };
  const whyEl = $("#rr-why"), nextB = $("#rr-next"), optsEl = $("#rr-opts");
  const startRound = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#rr-round").textContent = T(`Situation ${G.i + 1} of 6`, `Situación ${G.i + 1} de 6`);
    $("#rr-scene").innerHTML = r.scene;
    optsEl.innerHTML = r.opts.map((o, k) => `<button type="button" class="fd-opt" data-k="${k}">${o.t}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next situation", "Siguiente situación")} <span class="arrow">→</span>`;
  };
  optsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".fd-opt");
    if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], o = r.opts[+b.dataset.k];
    if (o.ok) G.score++;
    G.log.push(o.ok);
    $$("#rr-opts .fd-opt").forEach((x) => { x.disabled = true; if (r.opts[+x.dataset.k].ok && x !== b) x.classList.add("alt"); });
    b.classList.add(o.ok ? "right" : "wrong");
    const best = r.opts.find((x) => x.ok);
    whyEl.innerHTML = o.ok ? `<b>${T("Best move.", "La mejor jugada.")}</b> ${o.why}` : `<b>${T("Not the best move.", "No es la mejor jugada.")}</b> ${o.why} ${T("Best move:", "Mejor jugada:")} ${best.t}.`;
    whyEl.dataset.tone = o.ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#rr-score").textContent = T(`${G.score} of ${G.log.length}`, `${G.score} de ${G.log.length}`);
    nextB.disabled = false;
    if (G.i === ROUNDS.length - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < ROUNDS.length - 1) { G.i++; startRound(); return; }
    const res = $("#rr-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/6</span><div><b>${G.score === 6 ? T("Money mover", "Experto en mover dinero") : G.score >= 4 ? T("Solid choices", "Buenas decisiones") : T("Check twice next time", "La próxima, revisa dos veces")}</b><p>${T("Free and slow when you can wait, fast only when you must, and never money you can't get back to someone you don't know.", "Gratis y lento cuando puedes esperar, rápido solo cuando hace falta, y nunca dinero que no puedes recuperar a alguien que no conoces.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="rr-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#rr-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, log: [] });
      $("#rr-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      startRound();
      $("#rr").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 6) * 100));
    if (first) FH.addXP(50, T("Picked the rail for six payments", "Elegiste cómo mover seis pagos"));
    if (G.score === 6) FH.badge("money-mover", T("Money Mover", "Experto en mover dinero"));
    FH.save();
  });
  startRound();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Venmo's instant transfer fee is 1.75%, at least $0.25 and at most $25. What does it cost to instantly move $400?",
      opts: ["$7.00", "$1.75", "$25.00", "$0.25"], a: 0, why: "$400 × 0.0175 = $7.00, which is between the $0.25 minimum and the $25 maximum." },
    { q: "Using the same fee rule, what does it cost to instantly move $2,000?",
      opts: ["$25.00", "$35.00", "$17.50", "$0"], a: 0, why: "$2,000 × 0.0175 = $35, but the fee is capped at $25." },
    { q: "What does a routing number identify?",
      opts: ["Your bank or credit union", "Your own account", "The check's number", "Your Social Security number"], a: 0, why: "The 9-digit routing number identifies the bank, and everyone there shares it. The account number identifies your account." },
    { q: "You send $120 by Zelle to a stranger for tickets that never arrive. What's most likely?",
      opts: ["You can't get the money back", "Your bank refunds it automatically", "FDIC insurance covers it", "Zelle charges the seller a fee and refunds you"], a: 0, why: "Zelle works like cash: once it arrives, it's the other person's. That's why you only use it with people you know." },
    { q: "An email that looks like it's from your landlord gives new bank details for rent. What should you do first?",
      opts: ["Call your landlord at a number you already had", "Reply to the email to confirm", "Send $1 to the new account", "Wire the rent, since wires are fast"], a: 0, why: "Confirm new payment details by calling a number you trust. Replying to a fake email reaches the scammer." },
    { q: "You mobile-deposit a $1,000 check on Monday. Under the usual rules, how much can you spend on Tuesday?",
      opts: ["$275", "$1,000", "$0", "$725"], a: 0, why: "The first $275 is usually available the next business day, and the other $725 by the second business day." },
    { q: "You start a free ACH transfer on Friday night, after the bank's cutoff. If it takes up to 3 business days, when will it land at the latest?",
      opts: ["Wednesday", "Monday", "Sunday", "Tuesday"], a: 0, why: "After the cutoff, it starts the next business day, Monday. Monday, Tuesday, Wednesday: it lands by Wednesday." },
  ];
  const QUIZ_ES = [
    { q: "La comisión de Venmo por transferencia instantánea es de 1.75%, como mínimo $0.25 y como máximo $25. ¿Cuánto cuesta mover $400 al instante?",
      opts: ["$7.00", "$1.75", "$25.00", "$0.25"], a: 0, why: "$400 × 0.0175 = $7.00, que está entre el mínimo de $0.25 y el máximo de $25." },
    { q: "Con la misma regla, ¿cuánto cuesta mover $2,000 al instante?",
      opts: ["$25.00", "$35.00", "$17.50", "$0"], a: 0, why: "$2,000 × 0.0175 = $35, pero la comisión tiene un tope de $25." },
    { q: "¿Qué identifica un número de ruta?",
      opts: ["Tu banco o cooperativa", "Tu propia cuenta", "El número del cheque", "Tu número de Seguro Social"], a: 0, why: "El número de ruta de 9 dígitos identifica al banco, y todos ahí lo comparten. El número de cuenta identifica tu cuenta." },
    { q: "Mandas $120 por Zelle a un desconocido por unos boletos que nunca llegan. ¿Qué es lo más probable?",
      opts: ["No puedes recuperar el dinero", "Tu banco te lo devuelve automáticamente", "El seguro de la FDIC lo cubre", "Zelle le cobra al vendedor y te lo devuelve"], a: 0, why: "Zelle funciona como efectivo: cuando llega, es de la otra persona. Por eso solo se usa con gente que conoces." },
    { q: "Un correo que parece de tu casero te da datos bancarios nuevos para la renta. ¿Qué haces primero?",
      opts: ["Llamas a tu casero a un número que ya tenías", "Respondes el correo para confirmar", "Mandas $1 a la cuenta nueva", "Mandas la renta por transferencia urgente, porque es rápida"], a: 0, why: "Confirma los datos de pago nuevos llamando a un número de confianza. Responder un correo falso llega al estafador." },
    { q: "Depositas con el celular un cheque de $1,000 el lunes. Con las reglas usuales, ¿cuánto puedes gastar el martes?",
      opts: ["$275", "$1,000", "$0", "$725"], a: 0, why: "Los primeros $275 suelen estar disponibles el siguiente día hábil, y los otros $725 para el segundo día hábil." },
    { q: "Empiezas una transferencia ACH gratis el viernes en la noche, después de la hora límite del banco. Si tarda hasta 3 días hábiles, ¿cuándo llega a más tardar?",
      opts: ["El miércoles", "El lunes", "El domingo", "El martes"], a: 0, why: "Después de la hora límite, empieza el siguiente día hábil, el lunes. Lunes, martes, miércoles: llega a más tardar el miércoles." },
  ];

  FHLesson.init({ id: LESSON, short: "moving-money", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
