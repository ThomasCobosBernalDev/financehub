// Unit 6, Lesson 2: Spot scams and protect your identity
(function () {
  const LESSON = "u6-scams";
  const { $, $$ } = FHLesson;
  const T = FH.t;

  // ---------- See it: tap the red flags ----------
  const FLAGS = {
    from: T("A random phone number, not your bank's short code. Anyone can text from a number like this.", "Un número de teléfono cualquiera, no el código corto de tu banco. Cualquiera puede escribir desde un número así."),
    rush: T("Pressure: \"closed in 1 hour\" is there to rush you before you think.", "Presión: \"se cerrará en 1 hora\" está ahí para apurarte antes de que pienses."),
    link: T("A strange link: riverbend-verify.net isn't Riverbend's real site. It's a copy that steals what you type.", "Un enlace raro: riverbend-verify.net no es el sitio real de Riverbend. Es una copia que roba lo que escribes."),
    code: T("Asking for a code: no real bank ever asks for the code it texts you. That code unlocks your account.", "Pide un código: ningún banco real te pide el código que te envía. Ese código abre tu cuenta."),
  };
  const found = new Set();
  const rfMsg = $("#rf-msg");
  const mark = (b) => { b.classList.add("found"); b.setAttribute("aria-pressed", "true"); found.add(b.dataset.f); };
  const sayRf = (last) => {
    const n = found.size;
    rfMsg.innerHTML = n === 4
      ? T("<b>All 4 found.</b> Any one of these is enough to stop. Delete the text and open your bank's app yourself.", "<b>Encontraste las 4.</b> Con una sola basta para detenerte. Borra el mensaje y abre tú la app de tu banco.")
      : `<b>${T(`Found ${n} of 4.`, `Llevas ${n} de 4.`)}</b> ${FLAGS[last]}`;
  };
  $$("#rf .rf-bit").forEach((b) => { b.setAttribute("aria-pressed", "false"); const tap = () => { mark(b); sayRf(b.dataset.f); }; b.addEventListener("click", tap); b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } }); });
  $("#rf-show").addEventListener("click", () => {
    $$("#rf .rf-bit").forEach(mark);
    rfMsg.innerHTML = `<b>${T("The 4 red flags:", "Las 4 señales de alerta:")}</b> ${Object.values(FLAGS).join(" ")}`;
  });

  // ---------- Play it: scam or legit? ----------
  const ROUNDS = [
    { from: T("Text · +1 (415) 555-0199", "Mensaje · +1 (415) 555-0199"), text: T("Congrats! You won a $1,000 Walmart gift card. Pay the $9.99 shipping fee here to claim it: win-prize-now.co", "¡Felicidades! Ganaste una tarjeta de regalo de Walmart de $1,000. Paga $9.99 de envío aquí para reclamarla: gana-premio-ya.co"), a: "scam",
      why: T("Too good to be true: you won a prize you never entered, and a real prize never asks you to pay a fee.", "Demasiado bueno para ser verdad: ganaste un premio en el que nunca participaste, y un premio real nunca te pide pagar una tarifa.") },
    { from: T("Riverbend Bank app · notification", "App de Riverbend Bank · notificación"), text: T("Your direct deposit of $612.40 has posted to Checking.", "Tu depósito directo de $612.40 ya está en tu cuenta de cheques."), a: "legit",
      why: T("It came inside the bank's own app, it asks for nothing, and it matches your paycheck. No red flags.", "Llegó dentro de la app del banco, no te pide nada y coincide con tu cheque de pago. Ninguna señal de alerta.") },
    { from: T("Phone call · \"IRS agent\"", "Llamada · \"agente del IRS\""), text: T("You owe $2,400 in back taxes. Pay today with gift cards or police will come to arrest you.", "Debes $2,400 de impuestos atrasados. Paga hoy con tarjetas de regalo o la policía irá a arrestarte."), a: "scam",
      why: T("Pressure (today, or arrest) and a strange way to pay (gift cards). The IRS contacts you by mail first and never takes gift cards.", "Presión (hoy, o te arrestan) y una forma rara de pagar (tarjetas de regalo). El IRS te escribe primero por correo y nunca acepta tarjetas de regalo.") },
    { from: T("Text · Jordan (your friend)", "Mensaje · Jordan (tu amigo)"), text: T("Sent you $14 on Venmo for lunch yesterday, thanks!", "Te mandé $14 por Venmo por la comida de ayer, ¡gracias!"), a: "legit",
      why: T("A friend you know, paying you back for something real. You can check the $14 in your own Venmo app. Nothing is asked of you.", "Un amigo que conoces te paga algo real. Puedes revisar los $14 en tu propia app de Venmo. No te pide nada.") },
    { from: T("Text · 72975", "Mensaje · 72975"), text: T("Riverbend: your sign-in code is 481 092. We will never call or text to ask for this code. Don't share it.", "Riverbend: tu código para iniciar sesión es 481 092. Nunca te llamaremos ni escribiremos para pedírtelo. No lo compartas."), a: "legit",
      why: T("You just tried to sign in, and this is the code. It tells you never to share it, which is what real banks say.", "Acabas de intentar iniciar sesión y este es el código. Te dice que nunca lo compartas, que es lo que dicen los bancos reales.") },
    { from: T("Marketplace buyer", "Comprador en Marketplace"), text: T("I'll mail you a check for $1,500 for your $900 couch. Just send the extra $600 to my mover by Zelle.", "Te mando un cheque de $1,500 por tu sillón de $900. Solo envía los $600 de más a mi mudanza por Zelle."), a: "scam",
      why: T("The fake check scam: $1,500 − $900 = $600 sent back. When the check bounces, you lose the $600 and the couch.", "La estafa del cheque falso: $1,500 − $900 = $600 que devuelves. Cuando el cheque rebota, pierdes los $600 y el sillón.") },
    { from: T("Email · \"Riverbend Support\"", "Correo · \"Soporte Riverbend\""), text: T("We're upgrading accounts. Reply with your account number and password within 24 hours to keep access.", "Estamos actualizando cuentas. Responde con tu número de cuenta y contraseña en 24 horas para no perder el acceso."), a: "scam",
      why: T("Asking for your password, plus a 24-hour deadline. No real bank ever asks for your password by email.", "Te pide la contraseña, más un plazo de 24 horas. Ningún banco real te pide la contraseña por correo.") },
    { from: T("Text · +1 (213) 555-0128", "Mensaje · +1 (213) 555-0128"), text: T("Hi Mom, I broke my phone, this is my new number. I need $800 for rent today, please send it on Cash App.", "Hola mamá, se me rompió el teléfono, este es mi número nuevo. Necesito $800 para la renta hoy, por favor mándamelos por Cash App."), a: "scam",
      why: T("A \"family member\" from a new number, pressure (today) and a payment app. Call their old number to check before sending anything.", "Un \"familiar\" desde un número nuevo, presión (hoy) y una app de pagos. Llama a su número de siempre para confirmar antes de mandar nada.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sl-why"), nextB = $("#sl-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#sl-round").textContent = T(`Message ${G.i + 1} of ${N}`, `Mensaje ${G.i + 1} de ${N}`);
    $("#sl-from").textContent = r.from;
    $("#sl-text").textContent = r.text;
    $$("#sl-opts .sm-btn").forEach((x) => { x.disabled = false; x.classList.remove("right", "wrong", "alt"); });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next message", "Siguiente mensaje")} <span class="arrow">→</span>`;
  };
  $("#sl-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#sl-opts .sm-btn").forEach((x) => { x.disabled = true; if (x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    const label = r.a === "scam" ? T("Scam.", "Estafa.") : T("Legit.", "Legítimo.");
    whyEl.innerHTML = `<b>${ok ? T("Right:", "Correcto:") : T("Not quite:", "No exactamente:")} ${label}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sl-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#sl-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Scam spotter", "Detector de estafas") : G.score >= 6 ? T("Hard to fool", "Difícil de engañar") : T("Review the four red flags", "Repasa las cuatro señales de alerta")}</b><p>${T("Pressure, a strange way to pay, asking for codes, too good to be true. When in doubt, check it yourself in the app or with a number you trust.", "Presión, una forma rara de pagar, pedir códigos, demasiado bueno para ser verdad. Si dudas, revísalo tú en la app o con un número de confianza.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="sl-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#sl-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#sl-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#sl").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Judged eight messages", "Juzgaste ocho mensajes"));
    if (G.score === N) FH.badge("scam-spotter");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Which of these is a red flag that a message is a scam?", opts: ["It asks you to pay with gift cards", "It comes inside your bank's own app", "It tells you never to share your code", "It's from a friend paying you back"], a: 0, why: "Gift cards, crypto, wires and payment apps to strangers are a strange way to pay. Scammers like them because the money can't be pulled back." },
    { q: "A buyer sends a $1,200 check for your $700 bike and asks you to send back the extra. How much would you send back?", opts: ["$500", "$1,200", "$700", "$1,900"], a: 0, why: "$1,200 − $700 = $500. When the fake check bounces, you lose that $500 plus the $700 bike: $1,200 in all." },
    { q: "The money from a deposited check shows up in your account. Does that mean the check is good?", opts: ["No, a fake check can bounce weeks later and the bank takes the money back", "Yes, the bank already checked it", "Yes, once it shows up it's yours", "Only if it's over $1,000"], a: 0, why: "Banks must let you use deposits within a few days, but finding a fake can take weeks. When it bounces, you owe what you spent or sent." },
    { q: "What is phishing?", opts: ["A fake message pretending to be a company you trust, to steal passwords, codes or money", "A safe way to send money to friends", "A free lock on your credit report", "A bank's fraud alert inside its app"], a: 0, why: "Phishing (said like fishing) uses a fake text, email or call as bait. The link goes to a copy of a real site." },
    { q: "You get a text saying your bank account is locked, with a link. What should you do?", opts: ["Don't tap the link; open your bank's app yourself or call the number on your card", "Tap the link quickly before the deadline", "Reply with your code so they know it's you", "Call the number in the text"], a: 0, why: "Never use a link or number from the message itself. Check by going to your bank directly." },
    { q: "Why is sending money to a stranger by payment app risky?", opts: ["It works like cash: once sent, it's usually gone", "It charges a 25% fee", "It hurts your credit score", "It's illegal"], a: 0, why: "Payment apps move money in seconds with little protection. With strangers, a credit card is safer: $50 max fraud liability and you can dispute." },
    { q: "What does a credit freeze do?", opts: ["Stops anyone from opening new credit in your name", "Closes all your current cards", "Lowers your credit score", "Costs $50 per bureau"], a: 0, why: "Lenders can't see a frozen report, so nobody can open new accounts with it. It's free at Equifax, Experian and TransUnion, and you can lift it when you apply." },
    { q: "Someone opened a credit card in your name. Where do you report identity theft to get a recovery plan?", opts: ["IdentityTheft.gov", "Your social media", "The store where it was used", "Nowhere, just wait"], a: 0, why: "IdentityTheft.gov gives you a step-by-step plan. Also call your bank, change passwords and freeze your credit." },
  ];
  const QUIZ_ES = [
    { q: "¿Cuál de estas es una señal de alerta de que un mensaje es una estafa?", opts: ["Te pide pagar con tarjetas de regalo", "Llega dentro de la app de tu banco", "Te dice que nunca compartas tu código", "Es de un amigo que te paga algo"], a: 0, why: "Tarjetas de regalo, cripto, transferencias y apps de pago a desconocidos son formas raras de pagar. A los estafadores les gustan porque el dinero no se puede recuperar." },
    { q: "Un comprador te manda un cheque de $1,200 por tu bicicleta de $700 y te pide devolver lo que sobra. ¿Cuánto devolverías?", opts: ["$500", "$1,200", "$700", "$1,900"], a: 0, why: "$1,200 − $700 = $500. Cuando el cheque falso rebota, pierdes esos $500 más la bicicleta de $700: $1,200 en total." },
    { q: "El dinero de un cheque que depositaste ya aparece en tu cuenta. ¿Eso quiere decir que el cheque es bueno?", opts: ["No, un cheque falso puede rebotar semanas después y el banco retira el dinero", "Sí, el banco ya lo revisó", "Sí, si aparece ya es tuyo", "Solo si es de más de $1,000"], a: 0, why: "Los bancos deben dejarte usar los depósitos en pocos días, pero descubrir un cheque falso puede tardar semanas. Cuando rebota, debes lo que gastaste o enviaste." },
    { q: "¿Qué es el phishing?", opts: ["Un mensaje falso que se hace pasar por una empresa de confianza para robar contraseñas, códigos o dinero", "Una forma segura de mandar dinero a amigos", "Un candado gratis para tu reporte de crédito", "Una alerta de fraude dentro de la app del banco"], a: 0, why: "El phishing (se pronuncia como \"fishing\", pescar) usa un mensaje, correo o llamada falsa como carnada. El enlace lleva a una copia de un sitio real." },
    { q: "Te llega un mensaje que dice que tu cuenta está bloqueada, con un enlace. ¿Qué haces?", opts: ["No tocas el enlace; abres tú la app del banco o llamas al número de tu tarjeta", "Tocas el enlace rápido antes de que se acabe el plazo", "Respondes con tu código para que sepan que eres tú", "Llamas al número del mensaje"], a: 0, why: "Nunca uses un enlace o número del propio mensaje. Revisa yendo directo a tu banco." },
    { q: "¿Por qué es riesgoso mandarle dinero a un desconocido por una app de pagos?", opts: ["Funciona como efectivo: una vez enviado, casi siempre se pierde", "Cobra una comisión de 25%", "Baja tu puntaje de crédito", "Es ilegal"], a: 0, why: "Las apps de pago mueven dinero en segundos con poca protección. Con desconocidos es más seguro usar tarjeta de crédito: máximo $50 de responsabilidad por fraude y puedes disputar." },
    { q: "¿Qué hace un congelamiento de crédito?", opts: ["Impide que alguien abra crédito nuevo a tu nombre", "Cierra todas tus tarjetas actuales", "Baja tu puntaje de crédito", "Cuesta $50 por agencia"], a: 0, why: "Los prestamistas no pueden ver un reporte congelado, así que nadie puede abrir cuentas nuevas con él. Es gratis en Equifax, Experian y TransUnion, y lo puedes quitar cuando solicites algo." },
    { q: "Alguien abrió una tarjeta de crédito a tu nombre. ¿Dónde reportas el robo de identidad para recibir un plan de recuperación?", opts: ["IdentityTheft.gov", "En tus redes sociales", "En la tienda donde la usaron", "En ningún lado, solo esperas"], a: 0, why: "IdentityTheft.gov te da un plan paso a paso (también en español). Además llama a tu banco, cambia contraseñas y congela tu crédito." },
  ];

  FHLesson.init({ id: LESSON, short: "scams", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
