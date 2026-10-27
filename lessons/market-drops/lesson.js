// Unit 5, Lesson 6: When the market drops
(function () {
  const LESSON = "u5-market-drops";
  const { $, $$, fillRange } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgEl = (tag, attrs, text) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text != null) el.textContent = text;
    return el;
  };
  const sign = (r) => `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(1)}%`;

  // Real data. S&P 500 total return (with dividends) and 3-month Treasury bill return by year, 1928 to 2025,
  // from Aswath Damodaran, NYU Stern (histretSP). Same series as Unit 5, Lesson 1.
  const Y0 = 1928;
  const SP = [43.81, -8.30, -25.12, -43.84, -8.64, 49.98, -1.19, 46.74, 31.94, -35.34, 29.28, -1.10, -10.67, -12.77, 19.17, 25.06, 19.03, 35.82, -8.43, 5.20,
    5.70, 18.30, 30.81, 23.68, 18.15, -1.21, 52.56, 32.60, 7.44, -10.46, 43.72, 12.06, 0.34, 26.64, -8.81, 22.61, 16.42, 12.40, -9.97, 23.80,
    10.81, -8.24, 3.56, 14.22, 18.76, -14.31, -25.90, 37.00, 23.83, -6.98, 6.51, 18.52, 31.74, -4.70, 20.42, 22.34, 6.15, 31.24, 18.49, 5.81,
    16.54, 31.48, -3.06, 30.23, 7.49, 9.97, 1.33, 37.20, 22.68, 33.10, 28.34, 20.89, -9.03, -11.85, -21.97, 28.36, 10.74, 4.83, 15.61, 5.48,
    -36.55, 25.94, 14.82, 2.10, 15.89, 32.15, 13.52, 1.38, 11.77, 21.61, -4.23, 31.21, 18.02, 28.47, -18.04, 26.06, 24.88, 17.78];
  const TB = [3.08, 3.16, 4.55, 2.31, 1.07, 0.96, 0.28, 0.17, 0.17, 0.28, 0.07, 0.05, 0.04, 0.13, 0.34, 0.38, 0.38, 0.38, 0.38, 0.60,
    1.05, 1.12, 1.20, 1.52, 1.72, 1.89, 0.94, 1.72, 2.62, 3.22, 1.77, 3.39, 2.87, 2.35, 2.77, 3.16, 3.55, 3.95, 4.86, 4.29,
    5.34, 6.67, 6.39, 4.33, 4.06, 7.04, 7.85, 5.79, 4.98, 5.26, 7.18, 10.05, 11.39, 14.04, 11.09, 8.95, 9.92, 7.72, 6.15, 5.96,
    6.89, 8.39, 7.75, 5.54, 3.51, 3.07, 4.37, 5.66, 5.15, 5.20, 4.91, 4.78, 6.00, 3.48, 1.64, 1.03, 1.40, 3.22, 4.85, 4.48,
    1.40, 0.15, 0.14, 0.05, 0.09, 0.06, 0.03, 0.05, 0.32, 0.95, 1.97, 2.11, 0.36, 0.04, 2.09, 5.28, 5.18, 4.21];
  const sp = (y) => SP[y - Y0], tb = (y) => TB[y - Y0];

  // ---------- See it: every year since 1928 ----------
  const NOTE = {
    1929: T("The stock market crash in October", "La caída de la bolsa en octubre"),
    1931: T("The Great Depression, the worst year on record", "La Gran Depresión, el peor año registrado"),
    1937: T("A second slump during the Depression", "Una segunda caída durante la Depresión"),
    1954: T("The postwar boom, the best year on record", "El auge de la posguerra, el mejor año registrado"),
    1974: T("Oil crisis, inflation over 12% and a recession", "Crisis del petróleo, inflación de más de 12% y recesión"),
    1987: T("Black Monday: −20.5% in one day, yet the year ended up", "Lunes Negro: −20.5% en un día, y aun así el año terminó arriba"),
    1995: T("The start of the late-1990s boom", "El inicio del auge de finales de los noventa"),
    2002: T("The dot-com bust, a third losing year in a row", "El fin de la burbuja puntocom, el tercer año seguido con pérdidas"),
    2008: T("The global financial crisis", "La crisis financiera global"),
    2009: T("The rebound from the March bottom", "El rebote desde el fondo de marzo"),
    2020: T("The pandemic crash and rebound", "La caída por la pandemia y el rebote"),
    2022: T("Inflation and fast interest rate hikes", "Inflación y subidas rápidas de tasas de interés"),
  };
  const yrSvg = $("#yr-chart");
  const YX = (i) => 46 + i * 9.6, YY = (r) => 24 + (55 - r) * 2.2;
  const yrG = svgEl("g", { "font-size": 13, fill: "var(--ink-3)" });
  [-40, -20, 0, 20, 40].forEach((r) => {
    yrG.appendChild(svgEl("line", { x1: 46, x2: 990, y1: YY(r), y2: YY(r), stroke: r === 0 ? "var(--ink-3)" : "var(--line)", "stroke-width": r === 0 ? 1.5 : 1 }));
    yrG.appendChild(svgEl("text", { x: 40, y: YY(r) + 4, "text-anchor": "end" }, `${r > 0 ? "+" : ""}${r}%`));
  });
  for (let y = 1930; y <= 2020; y += 10) yrG.appendChild(svgEl("text", { x: YX(y - Y0) + 4, y: 276, "text-anchor": "middle" }, y));
  yrSvg.appendChild(yrG);
  const bars = SP.map((r, i) => {
    const b = svgEl("rect", { x: YX(i), width: 7.6, y: Math.min(YY(r), YY(0)), height: Math.max(1, Math.abs(YY(r) - YY(0))), rx: 1.5, fill: r >= 0 ? "var(--savings)" : "var(--wants)", class: "yr-bar" });
    yrSvg.appendChild(b);
    return b;
  });
  let yrSel = 2008 - Y0;
  const showYear = (i) => {
    yrSel = Math.max(0, Math.min(SP.length - 1, i));
    bars.forEach((b, k) => b.classList.toggle("dim", k !== yrSel));
    const y = Y0 + yrSel, r = SP[yrSel];
    $("#yr-out").innerHTML = `<b>${y}</b> <span class="${r >= 0 ? "up" : "down"}">${sign(r)}</span>${NOTE[y] ? `<span>${NOTE[y]}</span>` : ""}`;
  };
  const pickYear = (e) => {
    const box = yrSvg.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 1000;
    showYear(Math.round((x - 46 - 3.8) / 9.6));
  };
  yrSvg.addEventListener("pointerdown", (e) => { pickYear(e); });
  yrSvg.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "mouse") pickYear(e); });
  yrSvg.setAttribute("tabindex", "0");
  yrSvg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { showYear(yrSel - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { showYear(yrSel + 1); e.preventDefault(); }
  });
  showYear(yrSel);

  // ---------- See it: bear markets (S&P 500 price index) ----------
  const BEARS = [
    { k: "1973–74", fall: 48.2, months: 90, why: T("An oil embargo and inflation over 12%. Prices fell for 21 months, from January 1973 to October 1974, and didn't get back to the old high until July 1980.", "Un embargo petrolero e inflación de más de 12%. Los precios bajaron durante 21 meses, de enero de 1973 a octubre de 1974, y no volvieron al máximo anterior hasta julio de 1980.") },
    { k: "1987", fall: 33.5, months: 23, why: T("Black Monday: on October 19, 1987, the S&P 500 fell 20.5% in a single day. It was back at its August 1987 high by July 1989.", "El Lunes Negro: el 19 de octubre de 1987, el S&P 500 cayó 20.5% en un solo día. Volvió a su máximo de agosto de 1987 en julio de 1989.") },
    { k: "2000–02", fall: 49.1, months: 86, why: T("The dot-com bubble burst. Internet stocks crashed and the slide lasted 31 months, to October 2002. Prices got back to the March 2000 high in May 2007.", "Reventó la burbuja puntocom. Las acciones de internet se desplomaron y la caída duró 31 meses, hasta octubre de 2002. Los precios volvieron al máximo de marzo de 2000 en mayo de 2007.") },
    { k: "2007–09", fall: 56.8, months: 65, why: T("The global financial crisis. Banks failed and prices fell for 17 months, to March 2009. They were back at the October 2007 high in March 2013.", "La crisis financiera global. Quebraron bancos y los precios bajaron durante 17 meses, hasta marzo de 2009. Volvieron al máximo de octubre de 2007 en marzo de 2013.") },
    { k: "2020", fall: 33.9, months: 6, why: T("The pandemic. Prices fell 34% in 33 days, the fastest fall into a bear market on record, and were back at a new high in August 2020.", "La pandemia. Los precios cayeron 34% en 33 días, la caída más rápida a un mercado bajista que se haya registrado, y volvieron a un máximo en agosto de 2020.") },
    { k: "2022", fall: 25.4, months: 24, why: T("Inflation reached 9% and the Fed raised rates fast. Prices fell for 9 months, to October 2022, and passed the January 2022 high on January 19, 2024.", "La inflación llegó a 9% y la Fed subió las tasas rápido. Los precios bajaron durante 9 meses, hasta octubre de 2022, y pasaron el máximo de enero de 2022 el 19 de enero de 2024.") },
  ];
  $("#bear-rows").innerHTML = BEARS.map((b, i) => `<button type="button" class="bear-row" data-i="${i}"><b>${b.k}</b>
    <span class="bear-bar"><i class="fall" style="width:${(b.fall / 60) * 78}%"></i><em>−${b.fall}%</em></span>
    <span class="bear-bar"><i class="rec" style="width:${(b.months / 90) * 72}%"></i><em>${b.months} ${T("mo", "meses")}</em></span></button>`).join("");
  const bearMsg = (i) => {
    $$("#bear-rows .bear-row").forEach((x) => x.classList.toggle("on", +x.dataset.i === i));
    const b = BEARS[i];
    $("#bear-msg").innerHTML = `<b>${b.k}: −${b.fall}%, ${T(`${b.months} months from the old high back to it.`, `${b.months} meses desde el máximo anterior hasta volver a él.`)}</b> ${b.why}`;
  };
  $$("#bear-rows .bear-row").forEach((b) => b.addEventListener("click", () => bearMsg(+b.dataset.i)));
  bearMsg(3);

  // ---------- See it: chance of a loss by holding period ----------
  const hdYrs = $("#hd-yrs");
  const windows = (n) => {
    const out = [];
    for (let i = 0; i + n <= SP.length; i++) {
      let g = 1;
      for (let k = i; k < i + n; k++) g *= 1 + SP[k] / 100;
      out.push({ start: Y0 + i, g });
    }
    return out;
  };
  const drawHold = () => {
    const n = +hdYrs.value, w = windows(n), lose = w.filter((x) => x.g < 1).length;
    const worst = w.reduce((a, b) => (b.g < a.g ? b : a));
    $("#hd-yrs-v").textContent = n === 1 ? T("1 year", "1 año") : T(`${n} years`, `${n} años`);
    $("#hd-pct").textContent = `${((lose / w.length) * 100).toFixed(1)}%`;
    $("#hd-txt").textContent = T(`of ${n === 1 ? "single years" : `${n}-year stretches`} lost money: ${lose} of ${w.length}`, `de ${n === 1 ? "los años" : `los periodos de ${n} años`} perdieron dinero: ${lose} de ${w.length}`);
    $("#hd-cells").innerHTML = w.map((x) => `<i class="${x.g < 1 ? "lose" : "gain"}" title="${x.start}"></i>`).join("");
    const span = (x) => (n === 1 ? `${x.start}` : `${x.start}–${x.start + n - 1}`);
    const m = $("#hd-msg");
    if (lose === 0) {
      m.innerHTML = T(`Not one ${n}-year stretch lost money. Even the worst, ${span(worst)}, still turned $10,000 into ${money(10000 * worst.g)}.`, `Ningún periodo de ${n} años perdió dinero. Incluso el peor, ${span(worst)}, convirtió $10,000 en ${money(10000 * worst.g)}.`);
      m.dataset.tone = "good";
    } else {
      m.innerHTML = T(`The worst ${n === 1 ? "year" : `${n}-year stretch`}, ${span(worst)}, turned $10,000 into ${money(10000 * worst.g)}. ${n < 10 ? "Hold longer and the orange squares thin out." : "Losing stretches are rare now, but not gone."}`, `El peor ${n === 1 ? "año" : `periodo de ${n} años`}, ${span(worst)}, convirtió $10,000 en ${money(10000 * worst.g)}. ${n < 10 ? "Si esperas más años, los cuadros naranjas se vuelven pocos." : "Los periodos con pérdidas ya son raros, pero no desaparecen."}`);
      m.dataset.tone = "warn";
    }
    fillRange(hdYrs);
  };
  hdYrs.addEventListener("input", drawHold);
  drawHold();

  // ---------- See it: dollar-cost averaging ----------
  const dcMid = $("#dc-mid");
  const num2 = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2));
  const drawDca = () => {
    const prices = [50, +dcMid.value, 50], sh = prices.map((p) => 100 / p), tot = sh.reduce((a, b) => a + b, 0);
    $("#dc-mid-v").textContent = `$${prices[1]}`;
    $("#dc-months").innerHTML = prices.map((p, i) => `<div class="dc-m"><div class="dc-stack"><i style="height:${(sh[i] / 10) * 100}%"></i></div><b>${num2(sh[i])} ${T("shares", "acciones")}</b><span>${T(`Month ${i + 1}`, `Mes ${i + 1}`)} · $${p}</span></div>`).join("");
    const avg = 300 / tot, val = tot * 50;
    $("#dc-out").innerHTML = `
      <div><dt>${T("Total shares", "Acciones en total")}</dt><dd><b>${num2(tot)}</b></dd></div>
      <div><dt>${T("Average cost per share", "Costo promedio por acción")}</dt><dd>${`<span class="frac"><span>$300</span><span>${num2(tot)}</span></span>`} = <b>$${avg.toFixed(2)}</b></dd></div>
      <div><dt>${T("Worth at $50 in month 3", "Valen a $50 en el mes 3")}</dt><dd><b>${FH.money(val)}</b></dd></div>
      <div><dt>${T("$300 all in month 1 instead", "$300 todo en el mes 1")}</dt><dd>6 ${T("shares", "acciones")} · <b>$300</b></dd></div>`;
    const m = $("#dc-msg");
    if (prices[1] < 50) { m.innerHTML = T(`The dip let month 2's $100 buy ${num2(sh[1])} shares instead of 2. Your $300 ends up worth ${money(val)}, even though the price ended where it started.`, `La bajada hizo que los $100 del mes 2 compraran ${num2(sh[1])} acciones en vez de 2. Tus $300 terminan valiendo ${money(val)}, aunque el precio terminó donde empezó.`); m.dataset.tone = "good"; }
    else if (prices[1] === 50) { m.innerHTML = T("No dip, no bonus: 6 shares for $300, worth $300.", "Sin bajada no hay premio: 6 acciones por $300, que valen $300."); m.dataset.tone = ""; }
    else { m.innerHTML = T(`When the price jumps, $100 buys fewer shares, so you end a little below $300. Your average cost, $${avg.toFixed(2)}, is still below the $${((100 + prices[1]) / 3).toFixed(2)} average price, because you bought less when it was expensive.`, `Cuando el precio sube, $100 compran menos acciones, así que terminas un poco abajo de $300. Tu costo promedio, $${avg.toFixed(2)}, sigue abajo del precio promedio de $${((100 + prices[1]) / 3).toFixed(2)}, porque compraste menos cuando estaba caro.`); m.dataset.tone = "warn"; }
    fillRange(dcMid);
  };
  dcMid.addEventListener("input", drawDca);
  drawDca();

  // ---------- Play it: hold or fold ----------
  const ERAS = [
    { y0: 2020, news: [
      T("A new virus shuts down much of the world. Stocks crash a third in one month, then race back to new highs by summer.", "Un virus nuevo cierra gran parte del mundo. Las acciones caen un tercio en un mes y luego regresan a nuevos máximos para el verano."),
      T("Vaccines roll out and the economy reopens. Stocks climb almost all year.", "Llegan las vacunas y la economía reabre. Las acciones suben casi todo el año."),
      T("Prices for everything jump, and the central bank raises interest rates fast. A bear market: stocks slide most of the year.", "Los precios de todo se disparan y el banco central sube las tasas de interés rápido. Mercado bajista: las acciones bajan casi todo el año."),
      T("Inflation cools. Experts had warned of a recession, but it never comes.", "La inflación se calma. Los expertos advertían una recesión, pero nunca llega."),
      T("Big tech companies boom on artificial intelligence.", "Las grandes empresas de tecnología crecen con la inteligencia artificial."),
      T("New tariffs knock stocks down about 19% in the spring. By summer they're at new highs.", "Nuevos aranceles tumban las acciones como 19% en la primavera. Para el verano están en nuevos máximos."),
    ] },
    { y0: 1973, news: [
      T("Prices are rising fast, and an oil embargo sends gas prices soaring.", "Los precios suben rápido y un embargo petrolero dispara el precio de la gasolina."),
      T("The President resigns, inflation passes 12%, and the economy shrinks. Stocks keep sliding.", "El presidente renuncia, la inflación pasa de 12% y la economía se encoge. Las acciones siguen bajando."),
      T("Just as people give up, the recession ends and stocks surge.", "Justo cuando la gente se rinde, termina la recesión y las acciones se disparan."),
      T("The recovery keeps going.", "La recuperación sigue."),
      T("Inflation creeps back up, and stocks slip.", "La inflación vuelve a subir poco a poco y las acciones bajan un poco."),
      T("A choppy year, with a sharp fall in the autumn.", "Un año de subidas y bajadas, con una caída fuerte en el otoño."),
      T("Oil prices spike again and inflation tops 13%.", "El petróleo vuelve a dispararse y la inflación pasa de 13%."),
      T("Interest rates climb toward 20%, yet company profits hold up.", "Las tasas de interés suben hacia 20%, pero las ganancias de las empresas aguantan."),
    ] },
    { y0: 2007, news: [
      T("Home prices start falling and some mortgage lenders go bust, but stocks still end the year up.", "Los precios de las casas empiezan a bajar y algunos prestamistas hipotecarios quiebran, pero las acciones terminan el año arriba."),
      T("Big banks fail or need rescues, and millions lose their jobs. The worst year for stocks in 70 years.", "Bancos grandes quiebran o necesitan rescates, y millones pierden su trabajo. El peor año para las acciones en 70 años."),
      T("In March, stocks hit bottom, down more than half from their high. Then they bounce hard.", "En marzo las acciones tocan fondo, más de la mitad abajo de su máximo. Luego rebotan con fuerza."),
      T("Unemployment stays near 10%, but company profits recover.", "El desempleo sigue cerca de 10%, pero las ganancias de las empresas se recuperan."),
      T("The U.S. credit rating is cut and Europe's debt crisis rattles markets.", "Le bajan la calificación de crédito a Estados Unidos y la crisis de deuda de Europa sacude los mercados."),
      T("A slow, steady recovery.", "Una recuperación lenta pero constante."),
      T("Stocks finally pass their old high and keep climbing.", "Las acciones por fin pasan su máximo anterior y siguen subiendo."),
    ] },
  ];
  const ADD = 1200, START = 10000;
  const simulate = (y0, plan) => { // plan[k] = "S" (fund) or "C" (cash) for year k
    const out = [START];
    let v = START;
    plan.forEach((p, k) => { if (k > 0) v += ADD; v *= 1 + (p === "S" ? sp(y0 + k) : tb(y0 + k)) / 100; out.push(v); });
    return out;
  };
  const G = { r: 0, k: -1, pos: "S", v: START, path: [START], plan: [], marks: [], sells: 0, totalSells: 0, score: 0, results: [], done: false };
  const chartEl = $("#rd-chart");

  const drawRide = (reveal) => {
    const era = ERAS[G.r], n = era.news.length;
    const hold = simulate(era.y0, Array(n).fill("S"));
    const W = 520, H = 280, L = 58, R = 16, Tp = 18, B = 40;
    const max = Math.max(...hold, ...G.path) * 1.12;
    const step = max > 40000 ? 10000 : 5000;
    const X = (i) => L + (i / n) * (W - L - R), Y = (v) => H - B - (v / max) * (H - B - Tp);
    chartEl.innerHTML = "";
    const g = svgEl("g", { "font-size": 13, fill: "var(--ink-3)" });
    for (let v = 0; v <= max; v += step) {
      g.appendChild(svgEl("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: "var(--line)" }));
      g.appendChild(svgEl("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, `$${v / 1000}k`));
    }
    for (let i = 0; i <= n; i++) g.appendChild(svgEl("text", { x: X(i), y: H - 16, "text-anchor": "middle" }, i === 0 ? T("start", "inicio") : reveal ? `’${String(era.y0 + i - 1).slice(2)}` : `${T("Y", "A")}${i}`));
    chartEl.appendChild(g);
    if (reveal) {
      chartEl.appendChild(svgEl("polyline", { points: hold.map((v, i) => `${X(i)},${Y(v)}`).join(" "), fill: "none", stroke: "var(--ink-3)", "stroke-width": 2.5, "stroke-dasharray": "6 6" }));
      const hl = svgEl("text", { x: X(n) - 4, y: Y(hold[n]) - 10, "text-anchor": "end", "font-size": 13, fill: "var(--ink-2)", "font-weight": 700 }, T("stayed invested", "sin vender"));
      chartEl.appendChild(hl);
    }
    chartEl.appendChild(svgEl("polyline", { points: G.path.map((v, i) => `${X(i)},${Y(v)}`).join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 3.5, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    G.path.forEach((v, i) => {
      if (i === 0) return;
      const inFund = G.plan[i - 1] === "S";
      chartEl.appendChild(svgEl("circle", { cx: X(i), cy: Y(v), r: 6, fill: inFund ? "var(--accent)" : "var(--card)", stroke: "var(--accent)", "stroke-width": 2.5 }));
    });
    G.marks.forEach(({ i, kind }) => {
      const x = (X(i) + X(i + 1)) / 2;
      chartEl.appendChild(svgEl("text", { x, y: Tp + 12, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: kind === "sell" ? "var(--wants)" : "var(--savings)" }, kind === "sell" ? T("sold", "vendiste") : T("back in", "regresaste")));
      chartEl.appendChild(svgEl("line", { x1: X(i), x2: X(i), y1: Tp + 18, y2: H - B, stroke: kind === "sell" ? "var(--wants)" : "var(--savings)", "stroke-width": 1.5, "stroke-dasharray": "3 4" }));
    });
  };

  const btns = $("#rd-btns"), news = $("#rd-news");
  const setTop = () => {
    const n = ERAS[G.r].news.length;
    $("#rd-round").textContent = T(`Round ${G.r + 1} of 3`, `Ronda ${G.r + 1} de 3`);
    $("#rd-year").textContent = G.k < 0 ? T(`${n} years`, `${n} años`) : T(`Year ${G.k + 1} of ${n}`, `Año ${G.k + 1} de ${n}`);
    $("#rd-val").textContent = money(G.v);
    $("#rd-where").textContent = G.pos === "S" ? T("in the fund", "en el fondo") : T("in cash", "en efectivo");
    $("#rd-where").dataset.pos = G.pos;
  };

  const startRound = () => {
    Object.assign(G, { k: -1, pos: "S", v: START, path: [START], plan: [], marks: [], sells: 0 });
    setTop();
    news.innerHTML = `<p>${T(`You have <b>$10,000</b> in an S&P 500 index fund. Each year you'll see the news and what the fund did, then choose where your money sits next year. Another <b>$1,200</b> goes in at the start of each new year.`, `Tienes <b>$10,000</b> en un fondo indexado del S&P 500. Cada año vas a ver las noticias y lo que hizo el fondo, y luego eliges dónde va a estar tu dinero el año siguiente. Al inicio de cada año nuevo entran otros <b>$1,200</b>.`)}</p>`;
    btns.innerHTML = `<button class="btn" type="button" data-a="play">${T("Play year 1", "Jugar el año 1")} <span class="arrow">→</span></button>`;
    drawRide(false);
  };

  const playYear = () => {
    const era = ERAS[G.r], n = era.news.length;
    G.k++;
    const y = era.y0 + G.k, r = sp(y), c = tb(y);
    if (G.k > 0) G.v += ADD;
    const before = G.v;
    G.plan.push(G.pos);
    G.v *= 1 + (G.pos === "S" ? r : c) / 100;
    G.path.push(G.v);
    setTop();
    drawRide(false);
    const fundTxt = r >= 0 ? T(`The fund <b class="up">rose ${r.toFixed(1)}%</b>.`, `El fondo <b class="up">subió ${r.toFixed(1)}%</b>.`) : T(`The fund <b class="down">fell ${Math.abs(r).toFixed(1)}%</b>.`, `El fondo <b class="down">bajó ${Math.abs(r).toFixed(1)}%</b>.`);
    const youTxt = G.pos === "S"
      ? T(`You were in the fund: ${money(before)} → <b>${money(G.v)}</b>.`, `Estabas en el fondo: ${money(before)} → <b>${money(G.v)}</b>.`)
      : T(`You were in cash, which earned ${c.toFixed(2)}%: ${money(before)} → <b>${money(G.v)}</b>.`, `Estabas en efectivo, que ganó ${c.toFixed(2)}%: ${money(before)} → <b>${money(G.v)}</b>.`);
    news.innerHTML = `<small>${T(`Year ${G.k + 1}`, `Año ${G.k + 1}`)}</small><p class="rd-head">${era.news[G.k]}</p><p>${fundTxt} ${youTxt}</p>`;
    if (!reduced) { news.classList.remove("flash"); void news.offsetWidth; news.classList.add("flash"); }
    if (G.k === n - 1) { endRound(); return; }
    btns.innerHTML = (G.pos === "S"
      ? `<button class="btn" type="button" data-a="stay">${T("Stay invested", "Seguir invertido")}</button><button class="btn line" type="button" data-a="sell">${T("Sell, move to cash", "Vender y pasar a efectivo")}</button>`
      : `<button class="btn line" type="button" data-a="stay">${T("Stay in cash", "Seguir en efectivo")}</button><button class="btn" type="button" data-a="buy">${T("Buy back in", "Volver a comprar")}</button>`)
      + `<small>${T(`For year ${G.k + 2}. Then $1,200 more goes in.`, `Para el año ${G.k + 2}. Luego entran otros $1,200.`)}</small>`;
  };

  const endRound = () => {
    const era = ERAS[G.r], n = era.news.length;
    const hold = simulate(era.y0, Array(n).fill("S"))[n];
    const firstDrop = era.news.findIndex((_, k) => sp(era.y0 + k) < 0);
    const panic = simulate(era.y0, Array.from({ length: n }, (_, k) => (k <= firstDrop ? "S" : "C")))[n];
    const put = START + ADD * (n - 1);
    const matched = G.v >= hold - 0.5;
    if (matched) G.score++;
    G.results.push({ y0: era.y0, y1: era.y0 + n - 1, you: G.v, hold, sells: G.sells });
    $("#rd-score").textContent = T(`${G.score} of ${G.r + 1}`, `${G.score} de ${G.r + 1}`);
    drawRide(true);
    let verdict;
    if (G.sells === 0) verdict = T("You stayed invested the whole time, through every scary headline.", "Te quedaste invertido todo el tiempo, con todo y los titulares que daban miedo.");
    else if (matched) verdict = T("Your timing paid off this time. To do it you had to be right twice, when to get out and when to get back in, and few people manage that again and again.", "Esta vez te salió bien el momento. Para lograrlo tuviste que acertar dos veces, cuándo salir y cuándo volver a entrar, y poca gente lo logra una y otra vez.");
    else verdict = T(`Selling cost you ${money(hold - G.v)} compared with sitting tight.`, `Vender te costó ${money(hold - G.v)} comparado con quedarte quieto.`);
    news.innerHTML = `<small>${T("Round over", "Fin de la ronda")}</small><p class="rd-head">${T(`These years were <b>${era.y0} to ${era.y0 + n - 1}</b>.`, `Estos años fueron de <b>${era.y0} a ${era.y0 + n - 1}</b>.`)}</p>
      <dl class="rd-cmp">
        <div><dt>${T("You put in", "Pusiste")}</dt><dd>${money(put)}</dd></div>
        <div class="you"><dt>${T("You ended with", "Terminaste con")}</dt><dd>${money(G.v)}</dd></div>
        <div><dt>${T("Stayed invested the whole time", "Sin vender nunca")}</dt><dd>${money(hold)}</dd></div>
        <div><dt>${T(`Sold after the first down year (${era.y0 + firstDrop}) and stayed in cash`, `Vender después del primer año malo (${era.y0 + firstDrop}) y quedarse en efectivo`)}</dt><dd>${money(panic)}</dd></div>
      </dl><p>${verdict}</p>`;
    btns.innerHTML = `<button class="btn" type="button" data-a="next">${G.r < ERAS.length - 1 ? T("Next round", "Siguiente ronda") : T("See your results", "Ver tus resultados")} <span class="arrow">→</span></button>`;
  };

  const finish = () => {
    G.done = true;
    const res = $("#rd-result");
    res.classList.remove("hidden");
    const rows = G.results.map((r) => `<div><dt>${r.y0}–${r.y1}</dt><dd>${money(r.you)} <span class="muted">${T("vs.", "vs.")} ${money(r.hold)}</span></dd></div>`).join("");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/3</span><div><b>${G.totalSells === 0 ? T("Steady hands", "Pulso firme") : G.score === 3 ? T("Lucky timing", "Buen ojo, esta vez") : T("History lesson learned", "Lección de historia aprendida")}</b><p>${G.totalSells === 0
      ? T("You never sold in a drop. Across three real stretches, including the worst crash in 70 years, staying invested and adding $100 a month came out ahead every time.", "Nunca vendiste en una caída. En tres periodos reales, incluida la peor caída en 70 años, quedarte invertido y agregar $100 al mes salió adelante cada vez.")
      : T(`You sold ${G.totalSells} time${G.totalSells === 1 ? "" : "s"}. Compare each round with staying invested: the drops that felt scariest were usually followed by the biggest gains.`, `Vendiste ${G.totalSells} ${G.totalSells === 1 ? "vez" : "veces"}. Compara cada ronda con quedarte invertido: las caídas que más miedo daban casi siempre vinieron antes de las ganancias más grandes.`)}</p></div></div>
      <dl class="rd-cmp">${rows}</dl>`;
    btns.innerHTML = `<button class="btn line" type="button" data-a="again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 3) * 100));
    if (first) FH.addXP(50, T("Rode out real market history", "Aguantaste la historia real del mercado"));
    if (G.totalSells === 0) FH.badge("steady-hands", T("Steady Hands", "Pulso firme"));
    FH.save();
  };

  btns.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "play") playYear();
    else if (a === "stay") playYear();
    else if (a === "sell") { G.pos = "C"; G.sells++; G.totalSells++; G.marks.push({ i: G.k + 1, kind: "sell" }); playYear(); }
    else if (a === "buy") { G.pos = "S"; G.marks.push({ i: G.k + 1, kind: "buy" }); playYear(); }
    else if (a === "next") { if (G.r < ERAS.length - 1) { G.r++; startRound(); } else finish(); }
    else if (a === "again") { Object.assign(G, { r: 0, score: 0, results: [], totalSells: 0, done: false }); $("#rd-score").textContent = T("0 of 0", "0 de 0"); $("#rd-result").classList.add("hidden"); startRound(); }
  });
  startRound();

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "Your index fund falls from $10,000 to $7,500. What is the percent change?",
      opts: ["−25%", "−33%", "−75%", "−2.5%"], a: 0,
      why: `Percent change = ${F("new − old", "old")} = ${F("$7,500 − $10,000", "$10,000")} = −25%.` },
    { q: "After a 40% drop, about what gain do you need to get back to where you started?",
      opts: ["About 67%", "40%", "About 29%", "80%"], a: 0,
      why: `Gain needed = ${F("drop", "1 − drop")} = ${F("0.40", "0.60")} ≈ 0.667, about 67%. You're climbing back from a smaller amount.` },
    { q: "You invest $100 a month. The price is $20, then $10, then $20. What is your average cost per share?",
      opts: ["$15.00", "$16.67", "$20.00", "$10.00"], a: 0,
      why: `$100 buys 5, then 10, then 5 shares: 20 shares for $300. ${F("$300", "20 shares")} = $15.00, below the $16.67 average price.` },
    { q: "Which of these counts as a bear market?",
      opts: ["Stock prices falling 20% or more from a recent high", "Stock prices falling 10% in one month", "Any year when stocks end lower than they started", "Stock prices rising 20% or more"], a: 0,
      why: "A bear market is a drop of 20% or more from a recent high. A drop of 10% to 20% is a correction." },
    { q: "From 1928 to 2025, about how often did the S&P 500 lose money in a single calendar year?",
      opts: ["About 1 year in 4", "About 1 year in 20", "About 1 year in 2", "It never lost money in a year"], a: 0,
      why: "It fell in 26 of 98 years, about 27%, or roughly 1 year in 4. Over 20-year stretches, it never lost money." },
    { q: "You'll need $4,000 for a car down payment in 8 months. Where should it be?",
      opts: ["In savings, since the time horizon is too short for stocks", "In an S&P 500 fund, since it grows faster", "Half in stocks, half in a margin account", "In a single stock with good news"], a: 0,
      why: "Over one year, stocks lost money about 1 time in 4. Money you need within a few years belongs in savings." },
    { q: "Why does selling after a big drop usually hurt long-term investors?",
      opts: ["It locks in the loss and risks missing the rebound, which often comes soon after the worst days", "Brokers charge a penalty for selling during a drop", "SIPC stops protecting accounts that sell", "Prices never go lower after a 20% drop"], a: 0,
      why: "Selling turns a temporary drop into a permanent loss. J.P. Morgan found 7 of the 10 best days came within two weeks of the 10 worst." },
  ];
  const QUIZ_ES = [
    { q: "Tu fondo indexado baja de $10,000 a $7,500. ¿Cuál es el cambio porcentual?",
      opts: ["−25%", "−33%", "−75%", "−2.5%"], a: 0,
      why: `Cambio porcentual = ${F("nuevo − anterior", "anterior")} = ${F("$7,500 − $10,000", "$10,000")} = −25%.` },
    { q: "Después de una caída de 40%, ¿más o menos qué ganancia necesitas para volver a donde empezaste?",
      opts: ["Como 67%", "40%", "Como 29%", "80%"], a: 0,
      why: `Ganancia necesaria = ${F("caída", "1 − caída")} = ${F("0.40", "0.60")} ≈ 0.667, como 67%. Estás subiendo desde una cantidad más chica.` },
    { q: "Inviertes $100 al mes. El precio es $20, luego $10 y luego $20. ¿Cuál es tu costo promedio por acción?",
      opts: ["$15.00", "$16.67", "$20.00", "$10.00"], a: 0,
      why: `$100 compran 5, luego 10 y luego 5 acciones: 20 acciones por $300. ${F("$300", "20 acciones")} = $15.00, abajo del precio promedio de $16.67.` },
    { q: "¿Cuál de estos cuenta como mercado bajista?",
      opts: ["Que los precios de las acciones bajen 20% o más desde un máximo reciente", "Que los precios de las acciones bajen 10% en un mes", "Cualquier año en que las acciones terminen más abajo de como empezaron", "Que los precios de las acciones suban 20% o más"], a: 0,
      why: "Un mercado bajista es una caída de 20% o más desde un máximo reciente. Una caída de 10% a 20% es una corrección." },
    { q: "De 1928 a 2025, ¿más o menos qué tan seguido perdió dinero el S&P 500 en un año calendario?",
      opts: ["Como 1 de cada 4 años", "Como 1 de cada 20 años", "Como 1 de cada 2 años", "Nunca perdió dinero en un año"], a: 0,
      why: "Bajó en 26 de 98 años, como 27%, o más o menos 1 de cada 4 años. En periodos de 20 años, nunca perdió dinero." },
    { q: "Vas a necesitar $4,000 para el enganche de un carro en 8 meses. ¿Dónde deberían estar?",
      opts: ["En ahorros, porque el plazo es muy corto para acciones", "En un fondo del S&P 500, porque crece más rápido", "La mitad en acciones y la mitad en una cuenta de margen", "En una sola acción con buenas noticias"], a: 0,
      why: "En un año, las acciones perdieron dinero más o menos 1 de cada 4 veces. El dinero que necesitas en pocos años va en ahorros." },
    { q: "¿Por qué vender después de una caída grande casi siempre perjudica a quien invierte a largo plazo?",
      opts: ["Convierte la caída en una pérdida segura y te arriesgas a perder el rebote, que muchas veces llega poco después de los peores días", "Los brokers cobran una multa por vender durante una caída", "SIPC deja de proteger las cuentas que venden", "Los precios nunca bajan más después de una caída de 20%"], a: 0,
      why: "Vender convierte una caída temporal en una pérdida permanente. J.P. Morgan encontró que 7 de los 10 mejores días llegaron a menos de dos semanas de los 10 peores." },
  ];

  FHLesson.init({ id: LESSON, short: "market-drops", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
