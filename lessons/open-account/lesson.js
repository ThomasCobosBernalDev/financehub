// Unit 1, Lesson 2: Open your first account
(function () {
  const LESSON = "u1-open-account";
  const { $, $$, fillRange } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, text) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text != null) el.textContent = text;
    return el;
  };
  const cents = (x) => `${x < 0 ? "−" : ""}$${Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const chips = (sel, fn) => $$(`${sel} .chip`).forEach((c) => c.addEventListener("click", () => {
    $$(`${sel} .chip`).forEach((x) => x.classList.toggle("on", x === c));
    fn(c.dataset.v);
  }));

  // ---------- See it: bank failures by year ----------
  // Real data: failures of all FDIC-insured institutions, 1934 to 2025 (FDIC, via FRED series BKFTTLA641N).
  const F0 = 1934;
  const FAILS = [9, 25, 69, 75, 74, 60, 43, 15, 20, 5, 2, 1, 1, 5, 3, 4, 4, 2, 3, 2, 2, 5, 2, 1, 4, 3, 1, 5, 1, 2, 7, 5, 7, 4, 3, 9, 7, 6, 1, 6, 4, 13, 16, 5, 7, 10,
    10, 9, 33, 50, 83, 129, 159, 215, 231, 530, 381, 268, 179, 50, 15, 8, 6, 1, 3, 8, 7, 4, 11, 3, 4, 0, 0, 3, 25, 137, 155, 90, 50, 24, 18, 8, 5, 8, 0, 4, 4, 0, 0, 5, 2, 2];
  const NOTE = {
    1934: T("Deposit insurance begins, at $2,500 per depositor", "Empieza el seguro de depósitos, con $2,500 por depositante"),
    1937: T("Small banks still failing in the Depression's second slump", "Bancos pequeños siguen quebrando en la segunda caída de la Depresión"),
    1945: T("Just one failure: the quiet decades begin", "Solo una quiebra: empiezan las décadas tranquilas"),
    1980: T("Coverage rises to $100,000", "La cobertura sube a $100,000"),
    1985: T("Farm loans and high interest rates hit banks", "Los préstamos agrícolas y las tasas altas golpean a los bancos"),
    1988: T("The savings and loan crisis deepens", "La crisis de las cajas de ahorro empeora"),
    1989: T("The peak of the savings and loan crisis", "El peor momento de la crisis de las cajas de ahorro"),
    2005: T("Not a single failure", "Ni una sola quiebra"),
    2006: T("Not a single failure", "Ni una sola quiebra"),
    2008: T("Washington Mutual fails, the largest bank failure in U.S. history; coverage rises to $250,000", "Quiebra Washington Mutual, la mayor quiebra bancaria en la historia de EE. UU.; la cobertura sube a $250,000"),
    2009: T("The financial crisis: a failure almost every 3 days", "La crisis financiera: una quiebra casi cada 3 días"),
    2010: T("The most failures since 1992", "La mayor cantidad de quiebras desde 1992"),
    2018: T("Not a single failure", "Ni una sola quiebra"),
    2021: T("Not a single failure", "Ni una sola quiebra"),
    2022: T("Not a single failure", "Ni una sola quiebra"),
    2023: T("Silicon Valley Bank, Signature Bank and First Republic fail within two months", "Quiebran Silicon Valley Bank, Signature Bank y First Republic en dos meses"),
  };
  const flSvg = $("#fl-chart");
  const FX = (i) => 50 + i * 10.2, FY = (n) => 262 - (n / 550) * 240;
  const flG = svgEl("g", { "font-size": 13, fill: "var(--ink-3)" });
  [0, 100, 200, 300, 400, 500].forEach((n) => {
    flG.appendChild(svgEl("line", { x1: 50, x2: 990, y1: FY(n), y2: FY(n), stroke: n === 0 ? "var(--ink-3)" : "var(--line)", "stroke-width": n === 0 ? 1.5 : 1 }));
    flG.appendChild(svgEl("text", { x: 42, y: FY(n) + 4, "text-anchor": "end" }, n));
  });
  for (let y = 1940; y <= 2020; y += 10) flG.appendChild(svgEl("text", { x: FX(y - F0) + 4, y: 290, "text-anchor": "middle" }, y));
  flSvg.appendChild(flG);
  const flBars = FAILS.map((n, i) => {
    const b = svgEl("rect", { x: FX(i), width: 8, y: FY(n) - (n ? 0 : 1.5), height: Math.max(1.5, 262 - FY(n)), rx: 1.5, fill: "var(--wants)", class: "yr-bar" });
    flSvg.appendChild(b);
    return b;
  });
  let flSel = 2008 - F0;
  const showFail = (i) => {
    flSel = Math.max(0, Math.min(FAILS.length - 1, i));
    flBars.forEach((b, k) => { b.classList.toggle("dim", k !== flSel); b.classList.toggle("fx-bar", k === flSel); b.style.setProperty("--glow", "var(--wants)"); });
    const y = F0 + flSel, n = FAILS[flSel];
    // A tag rides above the picked bar.
    const tip = flSvg.querySelector(".fx-tip") || FHLesson.fx.tip(flSvg, "var(--ink)");
    FHLesson.fx.place(tip, FX(flSel) + 4, FY(n), String(y), n === 1 ? T("1 failure", "1 quiebra") : T(`${n} failures`, `${n} quiebras`), { x0: 50, y0: 262, big: .9 });
    $("#fl-out").innerHTML = `<b>${y}</b> <span class="down">${n === 1 ? T("1 failure", "1 quiebra") : T(`${n} failures`, `${n} quiebras`)}</span>${NOTE[y] ? `<span>${NOTE[y]}</span>` : ""}`;
  };
  const pickFail = (e) => {
    const box = flSvg.getBoundingClientRect();
    showFail(Math.round(((((e.clientX - box.left) / box.width) * 1000) - 50 - 4) / 10.2));
  };
  flSvg.addEventListener("pointerdown", pickFail);
  flSvg.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "mouse") pickFail(e); });
  flSvg.setAttribute("tabindex", "0");
  flSvg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { showFail(flSel - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { showFail(flSel + 1); e.preventDefault(); }
  });
  showFail(flSel);

  // ---------- See it: how much is covered ----------
  const LIMIT = 250000;
  const cvAmt = $("#cv-amt");
  let owners = 1, banks = 1;
  const drawCover = () => {
    const amt = +cvAmt.value, each = amt / banks, cap = LIMIT * owners;
    const covEach = Math.min(each, cap), cov = covEach * banks, unins = amt - cov;
    $("#cv-amt-v").textContent = money(amt);
    const scale = 600000;
    $("#cv-bars").innerHTML = Array.from({ length: banks }, (_, k) => `<div class="cv-row"><span>${banks === 1 ? T("Your bank", "Tu banco") : T(`Bank ${k + 1}`, `Banco ${k + 1}`)}</span>
      <div class="cv-track"><i class="ok" style="width:${(covEach / scale) * 100}%"></i><i class="miss" style="width:${((each - covEach) / scale) * 100}%"></i><em class="cv-lim" style="left:${(cap / scale) * 100}%"></em></div>
      <b>${money(each)}</b></div>`).join("");
    const m = $("#cv-msg");
    if (unins > 0.5) {
      m.innerHTML = T(`<b>${money(cov)}</b> is covered and <b>${money(unins)}</b> is uninsured. ${owners === 1 ? "A joint account or a second bank would cover the rest." : "Splitting across a second bank would cover the rest."}`, `<b>${money(cov)}</b> están cubiertos y <b>${money(unins)}</b> no están asegurados. ${owners === 1 ? "Una cuenta conjunta o un segundo banco cubrirían el resto." : "Repartirlo en un segundo banco cubriría el resto."}`);
      m.dataset.tone = "warn";
    } else {
      m.innerHTML = T(`All <b>${money(amt)}</b> is covered${banks > 1 ? `: ${money(each)} at each bank, under the limit at both` : owners > 1 ? `: up to ${money(cap)} for a joint account with two owners` : ""}.`, `Los <b>${money(amt)}</b> están cubiertos${banks > 1 ? `: ${money(each)} en cada banco, abajo del límite en los dos` : owners > 1 ? `: hasta ${money(cap)} en una cuenta conjunta con dos dueños` : ""}.`);
      m.dataset.tone = "good";
    }
    fillRange(cvAmt);
  };
  cvAmt.addEventListener("input", drawCover);
  chips("#cv-own", (v) => { owners = +v; drawCover(); });
  chips("#cv-bank", (v) => { banks = +v; drawCover(); });
  drawCover();

  // ---------- See it: compare the whole account ----------
  const OWNER = 3.22;
  const ACCTS = [
    { k: "harbor", name: "Harbor National", sub: T("Bank with branches", "Banco con sucursales"), apy: 0.0001,
      fee: (chk, dd) => (dd || chk >= 1500 ? 0 : 12), atm: (n) => n * (3 + OWNER) },
    { k: "river", name: "Riverbend CU", sub: T("Credit union", "Cooperativa de crédito"), apy: 0.005,
      fee: () => 0, atm: (n) => n * (1 + OWNER) },
    { k: "peak", name: "Peak", sub: T("Online bank, no branches", "Banco en línea, sin sucursales"), apy: 0.0375,
      fee: () => 0, atm: (n) => Math.max(0, n * OWNER - 10) },
  ];
  const whChk = $("#wh-chk"), whSav = $("#wh-sav"), whAtm = $("#wh-atm");
  let dd = true;
  const drawWhere = () => {
    const chk = +whChk.value, sav = +whSav.value, n = +whAtm.value;
    $("#wh-chk-v").textContent = money(chk);
    $("#wh-sav-v").textContent = money(sav);
    $("#wh-atm-v").textContent = n;
    const rows = ACCTS.map((a) => {
      const fees = 12 * (a.fee(chk, dd) + a.atm(n)), int = sav * a.apy;
      return Object.assign({}, a, { fees, int, net: int - fees });
    });
    const max = Math.max(...rows.map((r) => Math.abs(r.net)), 1);
    const best = rows.reduce((a, b) => (b.net > a.net ? b : a));
    $("#wh-rows").innerHTML = rows.map((r) => `<div class="wh-row${r === best ? " best" : ""}">
      <div class="wh-name"><b>${r.name}</b><small>${r.sub}</small></div>
      <dl class="wh-nums"><div><dt>${T("Fees", "Comisiones")}</dt><dd>${cents(r.fees)}</dd></div><div><dt>${T("Interest", "Intereses")}</dt><dd>${cents(r.int)}</dd></div></dl>
      <div class="wh-bar"><i class="${r.net >= 0 ? "up" : "down"}" style="width:${Math.max(r.net ? 2 : 0, (Math.abs(r.net) / max) * 100)}%"></i></div>
      <b class="wh-net ${r.net >= 0 ? "up" : "down"}">${r.net >= 0 ? "+" : ""}${cents(r.net)}<small>${T("a year", "al año")}</small></b></div>`).join("");
    const worst = rows.reduce((a, b) => (b.net < a.net ? b : a));
    const m = $("#wh-msg");
    const gap = best.net - worst.net;
    m.innerHTML = gap < 1
      ? T("With these habits, the three come out about the same, so pick on branches, app and service.", "Con estos hábitos, las tres salen más o menos igual, así que elige por sucursales, app y servicio.")
      : T(`<b>${best.name}</b> comes out <b>${money(gap)}</b> a year ahead of ${worst.name} for you.${best.k === "peak" ? " But it has no branch, so depositing cash is hard." : ""}${!dd && chk < 1500 ? " Without direct deposit, Harbor's $12 monthly fee kicks in." : ""}`,
        `<b>${best.name}</b> te deja <b>${money(gap)}</b> más al año que ${worst.name}.${best.k === "peak" ? " Pero no tiene sucursales, así que depositar efectivo es difícil." : ""}${!dd && chk < 1500 ? " Sin depósito directo, se activa la comisión mensual de $12 de Harbor." : ""}`);
    m.dataset.tone = "good";
    [whChk, whSav, whAtm].forEach(fillRange);
  };
  [whChk, whSav, whAtm].forEach((r) => r.addEventListener("input", drawWhere));
  chips("#wh-dd", (v) => { dd = v === "1"; drawWhere(); });
  drawWhere();

  // ---------- Play it: fine print detective ----------
  const ADS = [
    { k: "fdic", logo: "H", color: "#2f5d8a", name: "Harbor National Bank", head: T("Everyday Checking", "Cuenta de cheques Everyday"), pitch: T("$0 monthly fee with direct deposit. 15,000 ATMs nationwide.", "Sin comisión mensual con depósito directo. 15,000 cajeros en todo el país."), badge: null,
      fine: [T("Harbor National Bank, N.A.", "Harbor National Bank, N.A."), `<mark>${T("Member FDIC.", "Miembro de la FDIC.")}</mark>`, T("Equal Housing Lender.", "Prestamista que ofrece igualdad de oportunidades de vivienda.")],
      why: T("\"Member FDIC\" means Harbor is an insured bank. If it failed, the FDIC would cover your deposits up to $250,000, usually by having another bank take over, as with Washington Mutual in 2008.", "\"Miembro de la FDIC\" significa que Harbor es un banco asegurado. Si quebrara, la FDIC cubriría tus depósitos hasta $250,000, normalmente haciendo que otro banco se quede con él, como pasó con Washington Mutual en 2008.") },
    { k: "none", logo: "C", color: "#8a5a2e", name: "CoinNest", head: T("Earn 9.00% APY on your USDC", "Gana 9.00% APY con tus USDC"), pitch: T("Rewards paid daily. Withdraw anytime.", "Recompensas diarias. Retira cuando quieras."), badge: "9.00%",
      fine: [T("CoinNest is not a bank.", "CoinNest no es un banco."), `<mark>${T("Digital assets are not bank deposits and are not insured by the FDIC or SIPC.", "Los activos digitales no son depósitos bancarios y no están asegurados por la FDIC ni por SIPC.")}</mark>`, T("Rates may change at any time.", "Las tasas pueden cambiar en cualquier momento.")],
      why: T("Crypto isn't a deposit, so there's no insurance at all. In 2022, Celsius, a crypto company advertising double-digit yields, froze withdrawals in June and filed for bankruptcy in July. A high rate is often the price of the risk.", "Las criptomonedas no son depósitos, así que no hay ningún seguro. En 2022, Celsius, una empresa de criptomonedas que anunciaba rendimientos de dos dígitos, congeló los retiros en junio y se declaró en quiebra en julio. Una tasa alta muchas veces es el precio del riesgo.") },
    { k: "ncua", logo: "R", color: "#2f7a55", name: "Riverbend Community Credit Union", head: T("Share Savings, 0.50% APY", "Cuenta de ahorro, 0.50% APY"), pitch: T("Join with a $5 share. No monthly fees, ever.", "Únete con una acción de $5. Sin comisiones mensuales, nunca."), badge: null,
      fine: [`<mark>${T("Federally insured by NCUA.", "Asegurada federalmente por la NCUA.")}</mark>`, T("Membership open to anyone who lives, works, worships or studies in Riverbend County.", "Membresía abierta a quien vive, trabaja, va a su iglesia o estudia en el condado de Riverbend.")],
      why: T("\"Federally insured by NCUA\" is the credit union version of the FDIC sign. Your savings are covered up to $250,000, the same as at a bank.", "\"Asegurada federalmente por la NCUA\" es la versión de cooperativa del letrero de la FDIC. Tus ahorros están cubiertos hasta $250,000, igual que en un banco.") },
    { k: "partner", logo: "Z", color: "#6b4fa0", name: "Zipcash", head: T("Your money earns 4.25% APY", "Tu dinero gana 4.25% APY"), pitch: T("FDIC insured up to $250,000. Get paid two days early.", "Asegurado por la FDIC hasta $250,000. Cobra dos días antes."), badge: "4.25%",
      fine: [`<mark>${T("Zipcash is a financial technology company, not a bank. Banking services provided by Lakeview Bank, Member FDIC.", "Zipcash es una empresa de tecnología financiera, no un banco. Servicios bancarios de Lakeview Bank, miembro de la FDIC.")}</mark>`, T("FDIC insurance covers only the failure of an FDIC-insured bank.", "El seguro de la FDIC solo cubre la quiebra de un banco asegurado por la FDIC.")],
      why: T("The ad says \"FDIC insured,\" but the fine print says Zipcash isn't a bank. You're covered if Lakeview Bank fails, not if Zipcash does. When Synapse, a middleman for apps like Yotta, collapsed in 2024, up to $96 million of customer money went missing, and the FDIC said its insurance didn't apply.", "El anuncio dice \"asegurado por la FDIC\", pero la letra chica dice que Zipcash no es un banco. Estás cubierto si quiebra Lakeview Bank, no si quiebra Zipcash. Cuando Synapse, un intermediario de apps como Yotta, quebró en 2024, desaparecieron hasta $96 millones de los clientes, y la FDIC dijo que su seguro no aplicaba.") },
    { k: "fdic", logo: "P", color: "#1f6f5c", name: "Peak", head: T("High-Yield Savings, 3.75% APY", "Ahorro de alto rendimiento, 3.75% APY"), pitch: T("No branches, no monthly fees. Open in 5 minutes.", "Sin sucursales, sin comisiones mensuales. Ábrela en 5 minutos."), badge: "3.75%",
      fine: [`<mark>${T("Peak is a division of Peak Bank, N.A. Member FDIC.", "Peak es una división de Peak Bank, N.A. Miembro de la FDIC.")}</mark>`, T("APY accurate as of today and may change.", "El APY es correcto al día de hoy y puede cambiar.")],
      why: T("Online banks are real banks. \"Peak Bank, N.A. Member FDIC\" means your savings are covered up to $250,000. You can confirm any bank on the FDIC's BankFind tool.", "Los bancos en línea son bancos de verdad. \"Peak Bank, N.A. Miembro de la FDIC\" significa que tus ahorros están cubiertos hasta $250,000. Puedes confirmar cualquier banco en la herramienta BankFind de la FDIC.") },
    { k: "none", logo: "S", color: "#5a6270", name: "Summit Invest", head: T("Cash Plus: 4.10% yield", "Cash Plus: rendimiento de 4.10%"), pitch: T("Park your cash in our money market fund.", "Guarda tu efectivo en nuestro fondo del mercado monetario."), badge: "4.10%",
      fine: [`<mark>${T("Investments are not FDIC insured, are not bank guaranteed, and may lose value.", "Las inversiones no están aseguradas por la FDIC, no están garantizadas por un banco y pueden perder valor.")}</mark>`, T("Summit Securities, member SIPC.", "Summit Securities, miembro de SIPC.")],
      why: T("A money market fund is an investment, not a deposit, so it has no deposit insurance. SIPC, which you met in the brokerage lesson, steps in if the broker fails and your shares go missing, but never covers a drop in value.", "Un fondo del mercado monetario es una inversión, no un depósito, así que no tiene seguro de depósitos. SIPC, que viste en la lección del broker, ayuda si el broker quiebra y faltan tus acciones, pero nunca cubre una baja de valor.") },
  ];
  const LABEL = { fdic: T("An FDIC-insured bank", "Un banco asegurado por la FDIC"), ncua: T("An NCUA-insured credit union", "Una cooperativa asegurada por la NCUA"), partner: T("Only through a partner bank", "Solo a través de un banco asociado"), none: T("No deposit insurance", "Sin seguro de depósitos") };
  const P = { i: 0, tries: 0, done: false, score: 0, log: [] };
  const adEl = $("#fp-ad"), whyEl = $("#fp-why"), nextB = $("#fp-next");
  const showAd = (reveal) => {
    const a = ADS[P.i];
    adEl.innerHTML = `<div class="fp-card">
      <div class="fp-brand"><span class="fp-logo" style="background:${a.color}">${a.logo}</span><b>${a.name}</b></div>
      ${a.badge ? `<div class="fp-badge">${a.badge}<small>APY</small></div>` : ""}
      <p class="fp-head">${a.head}</p><p class="fp-pitch">${a.pitch}</p>
      <span class="fp-cta">${T("Open an account", "Abrir una cuenta")}</span>
      <p class="fp-fine${reveal ? " show" : ""}">${a.fine.map((f) => (reveal ? f : f.replace(/<\/?mark>/g, ""))).join(" ")}</p></div>`;
  };
  const startAd = () => {
    P.tries = 0; P.done = false;
    $("#fp-round").textContent = T(`Offer ${P.i + 1} of 6`, `Oferta ${P.i + 1} de 6`);
    showAd(false);
    $$(".fp-opt").forEach((b) => { b.disabled = false; b.classList.remove("right", "wrong"); });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
  };
  $$(".fp-opt").forEach((b) => b.addEventListener("click", () => {
    if (P.done) return;
    const a = ADS[P.i], ok = b.dataset.k === a.k;
    P.tries++;
    if (ok) {
      P.done = true;
      const first = P.tries === 1;
      if (first) P.score++;
      P.log.push({ name: a.name, ok: first, k: a.k });
      b.classList.add("right");
      $$(".fp-opt").forEach((x) => (x.disabled = true));
      showAd(true);
      whyEl.innerHTML = `<b>${first ? T("Right.", "Correcto.") : T("Got it on the next try.", "Lo lograste en el siguiente intento.")}</b> ${a.why}`;
      whyEl.dataset.tone = "good";
      nextB.disabled = false;
      nextB.innerHTML = P.i < ADS.length - 1 ? `${T("Next offer", "Siguiente oferta")} <span class="arrow">→</span>` : `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
    } else {
      b.classList.add("wrong");
      b.disabled = true;
      whyEl.innerHTML = `<b>${T("Not quite.", "No exactamente.")}</b> ${T("Read the fine print at the bottom of the ad again: who is actually holding your money?", "Vuelve a leer la letra chica al final del anuncio: ¿quién tiene tu dinero en realidad?")}`;
      whyEl.dataset.tone = "warn";
    }
    whyEl.classList.remove("hidden");
    $("#fp-score").textContent = T(`${P.score} of ${P.log.length}`, `${P.score} de ${P.log.length}`);
  }));
  nextB.addEventListener("click", () => {
    if (!P.done) return;
    if (P.i < ADS.length - 1) { P.i++; startAd(); return; }
    const res = $("#fp-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${P.score}/6</span><div><b>${P.score === 6 ? T("Sharp eyes", "Buen ojo") : P.score >= 4 ? T("Good detective work", "Buen trabajo de detective") : T("Keep reading the fine print", "Sigue leyendo la letra chica")}</b><p>${T("The big type sells. The small type tells you who's holding your money. Look for \"Member FDIC\" or \"Federally insured by NCUA,\" and be careful with \"not a bank.\"", "La letra grande vende. La letra chica te dice quién tiene tu dinero. Busca \"Miembro de la FDIC\" o \"Asegurada federalmente por la NCUA\", y ten cuidado con \"no es un banco\".")}</p></div></div>
      <dl class="rd-cmp">${P.log.map((l) => `<div><dt>${l.name}</dt><dd class="${l.ok ? "ok" : "no"}">${LABEL[l.k]} ${l.ok ? "✓" : "✗"}</dd></div>`).join("")}</dl>
      <div style="margin-top:16px"><button class="btn line" type="button" id="fp-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#fp-again").addEventListener("click", () => {
      Object.assign(P, { i: 0, score: 0, log: [] });
      $("#fp-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      startAd();
      $("#fp").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((P.score / 6) * 100));
    if (first) FH.addXP(50, T("Read the fine print on six offers", "Leíste la letra chica de seis ofertas"));
    if (P.score === 6) FH.badge("fine-print", T("Fine Print Detective", "Detective de letra chica"));
    FH.save();
  });
  startAd();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "You have $300,000 in one savings account in your name at an FDIC-insured bank. If the bank fails, how much is insured?",
      opts: ["$250,000", "$300,000", "$150,000", "$0, because one account can't be insured over $250,000"], a: 0,
      why: "Covered = the smaller of $300,000 and $250,000 × 1 owner = $250,000. The other $50,000 is uninsured." },
    { q: "You and a parent own a joint account with $400,000 at one FDIC-insured bank. How much is insured?",
      opts: ["All $400,000", "$250,000", "$200,000", "$500,000"], a: 0,
      why: "Each co-owner is covered up to $250,000, so the joint account is covered up to $500,000. The smaller of $400,000 and $500,000 is $400,000." },
    { q: "Which of these is NOT covered by FDIC insurance, even if you buy it through a bank?",
      opts: ["Shares of an S&P 500 index fund", "A savings account", "A checking account", "A certificate of deposit"], a: 0,
      why: "Deposit insurance covers deposits. Investments like funds, stocks, bonds and crypto aren't covered, even when a bank sells them." },
    { q: "Who owns a credit union?",
      opts: ["Its members, the customers", "Shareholders who buy its stock", "The federal government", "The NCUA"], a: 0,
      why: "A credit union is a not-for-profit owned by its members. The NCUA insures its deposits but doesn't own it." },
    { q: "A money app says \"FDIC insured through our partner bank.\" What does that insurance protect you from?",
      opts: ["The partner bank failing", "The app company failing", "The app losing track of your money", "Any loss on the account"], a: 0,
      why: "FDIC insurance covers the failure of an insured bank. When Synapse, a nonbank, collapsed in 2024, the FDIC said its insurance didn't apply." },
    { q: "An account charges $12 a month unless you have at least $500 a month of direct deposit. You don't have direct deposit. What does the fee cost in a year?",
      opts: ["$144", "$12", "$120", "$0"], a: 0,
      why: "12 months × $12 = $144 a year. Setting up a $500 direct deposit would bring it to $0." },
    { q: "Using an ATM your bank doesn't own cost $4.86 on average in 2025. If you do it 3 times a month, about how much is that in a year?",
      opts: ["About $175", "About $58", "About $15", "About $350"], a: 0,
      why: "12 × 3 × $4.86 = $174.96 a year: $3.22 each to the ATM owner plus $1.64 to your own bank." },
  ];
  const QUIZ_ES = [
    { q: "Tienes $300,000 en una cuenta de ahorro a tu nombre en un banco asegurado por la FDIC. Si el banco quiebra, ¿cuánto está asegurado?",
      opts: ["$250,000", "$300,000", "$150,000", "$0, porque una cuenta no se puede asegurar por más de $250,000"], a: 0,
      why: "Cubierto = lo menor entre $300,000 y $250,000 × 1 dueño = $250,000. Los otros $50,000 no están asegurados." },
    { q: "Tú y uno de tus papás tienen una cuenta conjunta con $400,000 en un banco asegurado por la FDIC. ¿Cuánto está asegurado?",
      opts: ["Los $400,000", "$250,000", "$200,000", "$500,000"], a: 0,
      why: "Cada dueño está cubierto hasta $250,000, así que la cuenta conjunta está cubierta hasta $500,000. Lo menor entre $400,000 y $500,000 es $400,000." },
    { q: "¿Cuál de estos NO está cubierto por el seguro de la FDIC, aunque lo compres en un banco?",
      opts: ["Acciones de un fondo indexado del S&P 500", "Una cuenta de ahorro", "Una cuenta de cheques", "Un certificado de depósito"], a: 0,
      why: "El seguro de depósitos cubre depósitos. Las inversiones como fondos, acciones, bonos y criptomonedas no están cubiertas, aunque las venda un banco." },
    { q: "¿Quién es dueño de una cooperativa de crédito?",
      opts: ["Sus socios, los clientes", "Accionistas que compran sus acciones", "El gobierno federal", "La NCUA"], a: 0,
      why: "Una cooperativa de crédito es una organización sin fines de lucro que pertenece a sus socios. La NCUA asegura sus depósitos, pero no es su dueña." },
    { q: "Una app de dinero dice \"asegurado por la FDIC a través de nuestro banco asociado\". ¿De qué te protege ese seguro?",
      opts: ["De que quiebre el banco asociado", "De que quiebre la empresa de la app", "De que la app pierda el registro de tu dinero", "De cualquier pérdida en la cuenta"], a: 0,
      why: "El seguro de la FDIC cubre la quiebra de un banco asegurado. Cuando Synapse, que no era un banco, quebró en 2024, la FDIC dijo que su seguro no aplicaba." },
    { q: "Una cuenta cobra $12 al mes a menos que tengas por lo menos $500 al mes de depósito directo. No tienes depósito directo. ¿Cuánto cuesta la comisión en un año?",
      opts: ["$144", "$12", "$120", "$0"], a: 0,
      why: "12 meses × $12 = $144 al año. Con un depósito directo de $500 bajaría a $0." },
    { q: "Usar un cajero que no es de tu banco costó $4.86 en promedio en 2025. Si lo haces 3 veces al mes, ¿más o menos cuánto es en un año?",
      opts: ["Como $175", "Como $58", "Como $15", "Como $350"], a: 0,
      why: "12 × 3 × $4.86 = $174.96 al año: $3.22 cada vez para el dueño del cajero más $1.64 para tu propio banco." },
  ];

  FHLesson.init({ id: LESSON, short: "open-account", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
