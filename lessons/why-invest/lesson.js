// Unit 5, Lesson 1: Why invest at all?
(function () {
  const LESSON = "u5-why-invest";
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
  // A round step for an axis that goes from 0 to max, aiming for about 4 gridlines.
  const niceStep = (max) => {
    const raw = max / 4, pow = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  };
  const short = (n) => (n >= 1e6 ? `$${+(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `$${Math.round(n / 1e3)}k` : n >= 1e3 ? `$${+(n / 1e3).toFixed(1)}k` : money(n));

  // Real data. S&P 500 total return (with dividends) and 3-month Treasury bill return by year, 1928 to 2025,
  // from Aswath Damodaran, NYU Stern (histretSP). CPI annual averages, 1927 to 2025, from the Minneapolis Fed.
  const Y0 = 1928, Y1 = 2025;
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
  const CPI = [17.4, 17.2, 17.2, 16.7, 15.2, 13.6, 12.9, 13.4, 13.7, 13.9, 14.4, 14.1, 13.9, 14.0, 14.7, 16.3, 17.3, 17.6, 18.0, 19.5,
    22.3, 24.0, 23.8, 24.1, 26.0, 26.6, 26.8, 26.9, 26.8, 27.2, 28.1, 28.9, 29.2, 29.6, 29.9, 30.3, 30.6, 31.0, 31.5, 32.5,
    33.4, 34.8, 36.7, 38.8, 40.5, 41.8, 44.4, 49.3, 53.8, 56.9, 60.6, 65.2, 72.6, 82.4, 90.9, 96.5, 99.6, 103.9, 107.6, 109.6,
    113.6, 118.3, 124.0, 130.7, 136.2, 140.3, 144.5, 148.2, 152.4, 156.9, 160.5, 163.0, 166.6, 172.2, 177.1, 179.9, 184.0, 188.9, 195.3, 201.6,
    207.3, 215.3, 214.5, 218.1, 224.9, 229.6, 233.0, 236.7, 237.0, 240.0, 245.1, 251.1, 255.7, 258.8, 271.0, 292.7, 304.7, 313.7, 321.9];
  const sp = (y) => SP[y - Y0] / 100, tb = (y) => TB[y - Y0] / 100, cpi = (y) => CPI[y - Y0 + 1];

  // ---------- See it: S&P 500 return each year, 2000 to 2025 ----------
  (() => {
    const g = $("#sp-bars");
    if (!g) return;
    const x0 = 70, slot = 810 / 26, zero = 200, k = 3.75;
    for (let y = 2000; y <= 2025; y++) {
      const r = SP[y - Y0], i = y - 2000, h = Math.abs(r) * k, x = x0 + i * slot + 4.5;
      g.appendChild(svgEl("rect", { x, y: r >= 0 ? zero - h : zero, width: 22, height: Math.max(1, h), rx: 3, fill: r >= 0 ? "var(--savings)" : "var(--danger)" }));
      if (y % 5 === 0) g.appendChild(svgEl("text", { x: x + 11, y: 372, "text-anchor": "middle", "font-size": 14, fill: "var(--ink-2)" }, y));
      if ([2002, 2008, 2013, 2019, 2022].includes(y)) {
        g.appendChild(svgEl("text", { x: x + 11, y: r >= 0 ? zero - h - 8 : zero + h + 16, "text-anchor": "middle", "font-size": 13, "font-weight": 700,
          fill: r >= 0 ? "var(--savings)" : "var(--danger)" }, `${r > 0 ? "+" : "−"}${Math.round(Math.abs(r))}%`));
      }
    }
  })();

  // ---------- See it: grow a little every month ----------
  const AVG = { sav: 0.04, sp: 0.10, infl: 0.03 };
  const W = { x0: 96, x1: 872, y0: 292, y1: 18, narrow: false };
  // On phones the charts get a taller drawing area, so the lines aren't squashed flat.
  const fit = (svg, top) => {
    W.narrow = svg.getBoundingClientRect().width < 560;
    const h = W.narrow ? 640 : 340;
    svg.setAttribute("viewBox", `0 0 900 ${h}`);
    W.y0 = h - (W.narrow ? 58 : 48);
    W.y1 = W.narrow ? top + 12 : 18;
  };
  const drawGrid = (g, maxY, xTicks) => {
    g.innerHTML = "";
    const step = niceStep(maxY), top = Math.ceil(maxY / step) * step;
    for (let v = 0; v <= top + 1e-9; v += step) {
      const y = W.y0 - (v / top) * (W.y0 - W.y1);
      g.appendChild(svgEl("path", { d: `M${W.x0} ${y} H${W.x1}`, stroke: "var(--line)", "stroke-width": 1 }));
      g.appendChild(svgEl("text", { x: W.x0 - 8, y: y + 4, "text-anchor": "end" }, short(v)));
    }
    // Drop a regular tick that would crowd the label at the right end.
    const endTick = xTicks.find((t) => t[2] === "end");
    xTicks.filter((t) => !endTick || t === endTick || t[1] === xTicks[0][1] || t[0] < W.x1 - (String(endTick[1]).length > 4 ? 190 : 90))
      .forEach(([x, label, anchor]) => g.appendChild(svgEl("text", { x, y: W.y0 + 30, "text-anchor": anchor || "middle" }, label)));
    return top;
  };
  const pathOf = (vals, top) => vals.map((v, i) => `${i ? "L" : "M"}${(W.x0 + (i / (vals.length - 1)) * (W.x1 - W.x0)).toFixed(1)} ${(W.y0 - (v / top) * (W.y0 - W.y1)).toFixed(1)}`).join(" ");
  const drawIn = (el, d, ease = "stroke-dashoffset .7s cubic-bezier(.22,.8,.24,1)") => {
    el.setAttribute("d", d);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !el.getTotalLength) return;
    const len = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${len} ${len}`;
    el.style.strokeDashoffset = len;
    void el.getBoundingClientRect();
    el.style.transition = ease;
    el.style.strokeDashoffset = 0;
  };

  // Each line draws in with its own glowing tip; the S&P line also carries a tag with its running total
  // and a fill underneath that fades out downward.
  let growRun = 0;
  const growFx = (series, top, animate) => {
    const run = ++growRun, n = series[0].vals.length - 1;
    const tip = $("#gr-tip"), clip = $("#gr-clip-r"), [tk, tv] = tip.querySelectorAll("text");
    tk.textContent = T("S&P 500 fund buys", "El fondo S&P 500 compra");
    const lines = series.map(({ id, vals }) => {
      const el = $(id), d = pathOf(vals, top);
      el.setAttribute("d", d);
      el.style.transition = "none";
      return { el, vals, len: el.getTotalLength(), head: $(id + "-head"), d };
    });
    const sp = lines[lines.length - 1];
    $("#gr-sp-area").setAttribute("d", `${sp.d} L${W.x1} ${W.y0} L${W.x0} ${W.y0} Z`);
    const valAt = (vals, x) => {
      const f = Math.max(0, Math.min(1, (x - W.x0) / (W.x1 - W.x0))) * n, i = Math.floor(f);
      return i >= n ? vals[n] : vals[i] + (vals[i + 1] - vals[i]) * (f - i);
    };
    const frame = (t) => {
      lines.forEach((l) => {
        const pt = l.el.getPointAtLength(l.len * t);
        l.el.style.strokeDasharray = `${l.len} ${l.len}`;
        l.el.style.strokeDashoffset = l.len * (1 - t);
        l.head.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        l.pt = pt;
      });
      const pt = sp.pt;
      clip.setAttribute("width", pt.x);
      tv.textContent = money(Math.round(valAt(sp.vals, pt.x)));
      const w = Math.max(tk.getComputedTextLength(), tv.getComputedTextLength()) + 24;
      tip.querySelector("rect").setAttribute("width", w);
      let x = pt.x - w - 18, y = pt.y - 62;
      if (x < W.x0) x = pt.x + 18;
      if (y < 0) y = pt.y + 18;
      tip.setAttribute("transform", `translate(${x} ${y})`);
    };
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) { frame(1); return; }
    const t0 = performance.now(), dur = 2400;
    const step = (now) => {
      if (run !== growRun) return; // a newer draw took over
      const p = Math.min(1, (now - t0) / dur);
      frame(p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const grAmt = $("#gr-amt"), grYrs = $("#gr-yrs");
  const renderGrow = (animate) => {
    fit($("#gr-chart"), 88);
    fillRange(grAmt); fillRange(grYrs);
    const m = +grAmt.value, n = +grYrs.value, dep = m * 12;
    $("#gr-amt-v").textContent = money(m);
    $("#gr-yrs-v").textContent = T(n === 1 ? "1 year" : `${n} years`, n === 1 ? "1 año" : `${n} años`);
    const paid = [0], cash = [0], sav = [0], spv = [0];
    let s = 0, p = 0;
    for (let t = 1; t <= n; t++) {
      s = (s + dep) * (1 + AVG.sav); p = (p + dep) * (1 + AVG.sp);
      const pg = Math.pow(1 + AVG.infl, t);
      paid.push(dep * t); cash.push((dep * t) / pg); sav.push(s / pg); spv.push(p / pg);
    }
    const every = n <= 6 ? 1 : n <= 15 ? 3 : n <= 30 ? 5 : 10;
    const ticks = [];
    for (let t = 0; t <= n; t += every) ticks.push([W.x0 + (t / n) * (W.x1 - W.x0), t === 0 ? T("now", "hoy") : t]);
    if (n % every) ticks.push([W.x1, n, "end"]);
    const top = drawGrid($("#gr-grid"), Math.max(spv[n], paid[n]) * 1.05, ticks);
    const set = (id, vals) => (animate ? drawIn($(id), pathOf(vals, top), "stroke-dashoffset 2.4s cubic-bezier(.45,0,.55,1)") : $(id).setAttribute("d", pathOf(vals, top)));
    $("#gr-in").setAttribute("d", pathOf(paid, top));
    growFx([{ id: "#gr-cash", vals: cash }, { id: "#gr-sav", vals: sav }, { id: "#gr-sp", vals: spv }], top, animate);
    const key = $("#gr-grid");
    const ly = W.narrow ? 30 : W.y1 + 16, lx = W.narrow ? 0 : W.x0 + 14, gap = W.narrow ? 38 : 26;
    key.appendChild(svgEl("text", { x: lx, y: ly, "font-weight": 700, fill: "var(--ink-2)" }, T("What it buys, in today's dollars", "Lo que compra, en dólares de hoy")));
    key.appendChild(svgEl("path", { d: `M${lx} ${ly + gap - 5} h28`, stroke: "var(--ink-3)", "stroke-width": 2, "stroke-dasharray": "5 6" }));
    key.appendChild(svgEl("text", { x: lx + 36, y: ly + gap }, T("what you put in (dollars)", "lo que pusiste (dólares)")));
    const pgN = Math.pow(1 + AVG.infl, n), nom = { cash: dep * n, sav: sav[n] * pgN, sp: spv[n] * pgN };
    $("#gr-cash-v").textContent = T(`buys ${money(cash[n])}`, `compra ${money(cash[n])}`);
    $("#gr-sav-v").textContent = T(`buys ${money(sav[n])}`, `compra ${money(sav[n])}`);
    $("#gr-sp-v").textContent = T(`buys ${money(spv[n])}`, `compra ${money(spv[n])}`);
    $("#gr-cash-n").textContent = T(`${money(nom.cash)} in the drawer`, `${money(nom.cash)} en el cajón`);
    $("#gr-sav-n").textContent = T(`${money(nom.sav)} in the account`, `${money(nom.sav)} en la cuenta`);
    $("#gr-sp-n").textContent = T(`${money(nom.sp)} in the fund`, `${money(nom.sp)} en el fondo`);
    let msg = T(`You put in ${money(dep * n)}. At a 10% average, the S&P 500 fund would hold about ${money(nom.sp)}, which buys about ${money(spv[n])} worth at today's prices. The drawer would still hold ${money(nom.cash)}, but it would buy only ${money(cash[n])} worth.`,
      `Pones ${money(dep * n)}. Con un promedio de 10%, el fondo del S&P 500 tendría unos ${money(nom.sp)}, que compran lo que hoy cuestan ${money(spv[n])}. El cajón seguiría teniendo ${money(nom.cash)}, pero solo compraría lo que hoy cuestan ${money(cash[n])}.`);
    if (n < 5) msg += T(` Over just ${n === 1 ? "1 year" : `${n} years`}, though, a real market could easily be down. The average only shows up over long stretches.`,
      ` Pero en solo ${n === 1 ? "1 año" : `${n} años`}, un mercado real podría estar abajo sin problema. El promedio solo aparece en periodos largos.`);
    $("#gr-msg").textContent = msg;
    $("#gr-msg").dataset.tone = n < 5 ? "warn" : "good";
  };
  grAmt.addEventListener("input", () => renderGrow(false));
  grYrs.addEventListener("input", () => renderGrow(false));
  renderGrow(false);

  // ---------- See it: where should it live? ----------
  const ACCT = { chk: T("Checking", "Cheques"), sav: T("Savings", "Ahorro"), inv: T("Invest", "Invertir") };
  const SORT = [
    { t: T("$45 for your phone bill, due Friday", "$45 para la factura del celular, que vence el viernes"), a: "chk",
      why: T("It's due in days, and autopay pulls it from checking.", "Vence en días, y el pago automático lo saca de la cuenta de cheques.") },
    { t: T("Your $3,600 emergency fund", "Tu fondo de emergencia de $3,600"), a: "sav",
      why: T("You might need it any day. It can't be down 37% the week your car breaks down.", "Podrías necesitarlo cualquier día. No puede estar 37% abajo la semana en que se descompone tu carro.") },
    { t: T("$2,000 for a used car you'll buy next year", "$2,000 para un carro usado que vas a comprar el próximo año"), a: "sav",
      why: T("One year is too short. The S&P 500 went down in about 1 of every 4 years since 1928.", "Un año es muy poco. El S&P 500 bajó más o menos 1 de cada 4 años desde 1928.") },
    { t: T("$50 a month for retirement, 40+ years away", "$50 al mes para el retiro, en más de 40 años"), a: "inv",
      why: T("Decades of compounding, and every 20-year stretch since 1928 beat savings.", "Décadas de interés compuesto, y cada periodo de 20 años desde 1928 le ganó al ahorro.") },
    { t: T("$1,500 for next semester's tuition, due in 6 months", "$1,500 para la colegiatura del próximo semestre, en 6 meses"), a: "sav",
      why: T("Six months is well under 5 years, and tuition won't wait for the market to recover.", "Seis meses es mucho menos de 5 años, y la colegiatura no va a esperar a que el mercado se recupere.") },
    { t: T("A $5,000 gift you won't need for 15 years", "Un regalo de $5,000 que no vas a necesitar en 15 años"), a: "inv",
      why: T("15 years is a long horizon, and your emergency fund is already full, so this money can grow.", "15 años es un horizonte largo y tu fondo de emergencia ya está lleno, así que este dinero puede crecer.") },
  ];
  const sortState = SORT.map(() => ({ tries: 0, done: false, first: false }));
  const renderSortScore = () => {
    const right = sortState.filter((s) => s.done).length;
    $("#so-score").textContent = T(`${right} of 6`, `${right} de 6`);
    if (right === 6) {
      const first = sortState.filter((s) => s.first).length;
      $("#so-score").textContent = T(`6 of 6 · ${first} on the first try`, `6 de 6 · ${first} al primer intento`);
      if (first === 6) FH.badge("right-jar", T("Right Jar", "El frasco correcto"));
    }
  };
  $("#so-list").innerHTML = SORT.map((s, i) => `<li data-i="${i}"><p>${s.t}</p><div class="sort-opts">${Object.entries(ACCT).map(([k, v]) => `<button class="chip" type="button" data-k="${k}">${v}</button>`).join("")}</div><p class="sort-why" aria-live="polite"></p></li>`).join("");
  $$("#so-list li").forEach((li) => {
    const i = +li.dataset.i, item = SORT[i], st = sortState[i];
    li.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      if (st.done) return;
      st.tries++;
      const ok = b.dataset.k === item.a;
      b.classList.add(ok ? "right" : "wrong");
      const why = li.querySelector(".sort-why");
      if (ok) {
        st.done = true; st.first = st.tries === 1;
        li.classList.add("done");
        why.textContent = T(`${ACCT[item.a]}. `, `${ACCT[item.a]}. `) + item.why;
        li.querySelectorAll("button").forEach((x) => (x.disabled = true));
      } else {
        why.textContent = T("Not quite. Think about how soon you'll need this money.", "No exactamente. Piensa en qué tan pronto vas a necesitar este dinero.");
      }
      renderSortScore();
    }));
  });
  renderSortScore();

  // ---------- Play it: test it on real history ----------
  const H = { n: 30, s: 1996, view: "nom" };
  const run = (s, n) => {
    const out = { cash: [1000], sav: [1000], sp: [1000], pg: [1] };
    let a = 1000, b = 1000;
    for (let y = s; y < s + n; y++) {
      a *= 1 + tb(y); b *= 1 + sp(y);
      out.cash.push(1000); out.sav.push(a); out.sp.push(b); out.pg.push(cpi(y) / cpi(s - 1));
    }
    return out;
  };
  const MISSIONS = [
    { id: "shrink", t: T("<b>Watch cash shrink.</b> Pick 20 or 30 years, then switch to <i>What they buy</i>.", "<b>Mira cómo se encoge el efectivo.</b> Elige 20 o 30 años y cambia a <i>Lo que compran</i>."),
      test: (r) => H.n >= 20 && H.view === "real",
      note: (r, e) => T(`The drawer still holds $1,000, but by the end of ${e} it buys only what ${money(1000 / r.pg[H.n])} bought in ${H.s}.`,
        `El cajón sigue teniendo $1,000, pero a finales de ${e} solo compra lo que ${money(1000 / r.pg[H.n])} compraban en ${H.s}.`) },
    { id: "crash", t: T("<b>Find a crash.</b> Pick 1 year, then find a year when the S&P 500 fell more than 30%.", "<b>Encuentra una caída.</b> Elige 1 año y busca un año en que el S&P 500 cayó más de 30%."),
      test: (r) => H.n === 1 && sp(H.s) < -0.3,
      note: (r) => T(`In ${H.s}, $1,000 in the S&P 500 fell to ${money(r.sp[1])} in a single year. Money you need soon can't ride through that.`,
        `En ${H.s}, $1,000 en el S&P 500 cayeron a ${money(r.sp[1])} en un solo año. El dinero que vas a necesitar pronto no puede aguantar algo así.`) },
    { id: "lost", t: T("<b>Find a bad decade.</b> Pick 10 years, then find a start year where savings beat the S&P 500. The strip shows them in green.", "<b>Encuentra una mala década.</b> Elige 10 años y busca un año de inicio en que el ahorro le ganó al S&P 500. La franja los marca en verde."),
      test: (r) => H.n === 10 && r.sp[10] < r.sav[10],
      note: (r, e) => T(`From ${H.s} to ${e}, savings grew to ${money(r.sav[10])} and the S&P 500 fund reached only ${money(r.sp[10])}. Even 10 years can go badly, so 5 years is the minimum and longer is safer.`,
        `De ${H.s} a ${e}, el ahorro creció a ${money(r.sav[10])} y el fondo del S&P 500 solo llegó a ${money(r.sp[10])}. Hasta 10 años pueden salir mal, así que 5 años es lo mínimo y más tiempo es más seguro.`) },
    { id: "long", t: T("<b>Go long.</b> Pick 20 years and look at the strip of every 20-year stretch.", "<b>Piensa a largo plazo.</b> Elige 20 años y mira la franja con todos los periodos de 20 años."),
      test: () => H.n === 20,
      note: () => T("Every one of the 79 twenty-year stretches since 1928 ended with the S&P 500 ahead of savings and ahead of prices. Past results don't promise future ones, but that's the case for investing money you won't need for a long time.",
        "Los 79 periodos de 20 años desde 1928 terminaron con el S&P 500 por encima del ahorro y de los precios. Lo que pasó antes no garantiza lo que viene, pero por eso se invierte el dinero que no vas a necesitar en mucho tiempo.") },
  ];
  const done = {};
  $("#h-missions").innerHTML = MISSIONS.map((m) => `<li data-id="${m.id}"><span class="mk" aria-hidden="true"></span><span>${m.t}</span></li>`).join("");
  const startEl = $("#h-start");

  const renderStrip = () => {
    const last = Y1 - H.n + 1, strip = $("#h-strip");
    let wins = 0, total = 0;
    const cells = [];
    for (let s = Y0; s <= last; s++) {
      const r = run(s, H.n), win = r.sp[H.n] > r.sav[H.n];
      wins += win; total++;
      const e = s + H.n - 1;
      cells.push(`<button type="button" class="${win ? "win" : "lose"}${s === H.s ? " on" : ""}" data-s="${s}" title="${s === e ? s : `${s}–${e}`}: S&P 500 ${money(r.sp[H.n])}, ${T("savings", "ahorro")} ${money(r.sav[H.n])}" aria-label="${T("Start in", "Empezar en")} ${s}"></button>`);
    }
    strip.innerHTML = cells.join("");
    strip.style.setProperty("--cells", total);
    $("#h-strip-title").textContent = H.n === 1 ? T("Every single year since 1928", "Cada año desde 1928")
      : T(`Every ${H.n}-year stretch since 1928`, `Cada periodo de ${H.n} años desde 1928`);
    $("#h-strip-sum").textContent = T(`S&P 500 ahead in ${wins} of ${total}`, `S&P 500 adelante en ${wins} de ${total}`);
  };
  $("#h-strip").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-s]");
    if (!b) return;
    H.s = +b.dataset.s; startEl.value = H.s;
    render(true);
  });

  let lastStripN = null;
  const render = (animate) => {
    fit($("#h-chart"), 20);
    const last = Y1 - H.n + 1;
    startEl.max = last;
    if (H.s > last) { H.s = last; }
    startEl.value = H.s;
    fillRange(startEl);
    const e = H.s + H.n - 1, r = run(H.s, H.n), real = H.view === "real";
    $("#h-span").textContent = H.n === 1 ? `${H.s}` : `${H.s} → ${e}`;
    const val = (k, i) => (real ? r[k][i] / r.pg[i] : r[k][i]);
    const series = ["cash", "sav", "sp"].map((k) => r[k].map((_, i) => val(k, i)));
    const every = H.n <= 5 ? 1 : H.n <= 10 ? 2 : 5;
    const ticks = [];
    for (let t = 0; t < H.n; t += every) if (t <= H.n - every * 0.6 || t === 0) ticks.push([W.x0 + (t / H.n) * (W.x1 - W.x0), H.s + t]);
    ticks.push([W.x1, T(`end of ${e}`, `fin de ${e}`), "end"]);
    const top = drawGrid($("#h-grid"), Math.max(1100, ...series.flat()) * 1.06, ticks);
    $("#h-base").setAttribute("d", pathOf(r.cash.map(() => 1000), top));
    ["#h-cash", "#h-sav", "#h-sp"].forEach((id, j) => $(id).setAttribute("d", pathOf(series[j], top)));
    $("#h-dots").innerHTML = "";
    const spv = series[2], at = (x) => {
      const f = Math.max(0, Math.min(1, (x - W.x0) / (W.x1 - W.x0))) * H.n, i = Math.floor(f);
      return i >= H.n ? spv[H.n] : spv[i] + (spv[i + 1] - spv[i]) * (f - i);
    };
    FHLesson.fx.run($("#h-chart"), {
      lines: [{ el: $("#h-cash"), color: "var(--wants)" }, { el: $("#h-sav"), color: "var(--savings)" }, { el: $("#h-sp"), color: "var(--needs)" }],
      tag: { line: 2, label: T("S&P 500 fund", "Fondo S&P 500"), value: (x) => money(Math.round(at(x))), box: { x0: W.x0, y0: W.y0, big: W.narrow ? 2 : 1 } },
      area: { line: 2, baseY: W.y0 },
      animate,
    });
    const fmt = (k) => {
      const nom = r[k][H.n], buys = nom / r.pg[H.n];
      return real ? [T(`buys ${money(buys)}`, `compra ${money(buys)}`), T(`${money(nom)} in the jar`, `${money(nom)} en el frasco`)]
        : [money(nom), T(`buys what ${money(buys)} did in ${H.s}`, `compra lo que ${money(buys)} compraban en ${H.s}`)];
    };
    [["cash", "#h-cash"], ["sav", "#h-sav"], ["sp", "#h-sp"]].forEach(([k, id]) => {
      const [big, sub] = fmt(k);
      $(`${id}-v`).textContent = big; $(`${id}-n`).textContent = sub;
    });
    if (lastStripN !== H.n) { renderStrip(); lastStripN = H.n; }
    else $$("#h-strip button").forEach((b) => b.classList.toggle("on", +b.dataset.s === H.s));
    checkMissions(r, e);
  };

  const checkMissions = (r, e) => {
    let fresh = null;
    MISSIONS.forEach((m) => {
      if (!done[m.id] && m.test(r)) { done[m.id] = true; fresh = m; }
    });
    $$("#h-missions li").forEach((li) => li.classList.toggle("done", !!done[li.dataset.id]));
    const n = Object.keys(done).length;
    $("#h-count").textContent = T(`${n} of 4 done`, `${n} de 4 listas`);
    if (fresh) {
      $("#h-note").textContent = T(`Mission done (${n} of 4). `, `Misión lista (${n} de 4). `) + fresh.note(r, e);
      $("#h-note").dataset.tone = "good";
      const li = $(`#h-missions li[data-id="${fresh.id}"]`);
      li.classList.remove("pop"); void li.offsetWidth; li.classList.add("pop");
      if (n === 4) finish();
    }
  };

  const finish = () => {
    const res = $("#h-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">4/4</span><div><b>${T("All missions done", "Todas las misiones listas")}</b><p>${T("Over long stretches, cash loses buying power. Over one year, or even ten, stocks can lose to savings. Over twenty years, that hasn't happened once since 1928. That's why your time horizon decides which money to invest.",
      "En periodos largos, el efectivo pierde poder de compra. En un año, o hasta en diez, las acciones pueden perder contra el ahorro. En veinte años, eso no ha pasado ni una vez desde 1928. Por eso tu horizonte de tiempo decide qué dinero invertir.")}</p></div></div>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = 100;
    if (first) FH.addXP(50, T("Tested investing on real history", "Pusiste a prueba la inversión con la historia real"));
    FH.badge("time-traveler", T("Time Traveler", "Viajero del tiempo"));
    FH.save();
  };

  $$("#h-len button").forEach((b) => b.addEventListener("click", () => {
    H.n = +b.dataset.n;
    $$("#h-len button").forEach((x) => x.classList.toggle("on", x === b));
    render(true);
  }));
  $$("#h-view button").forEach((b) => b.addEventListener("click", () => {
    H.view = b.dataset.v;
    $$("#h-view button").forEach((x) => x.classList.toggle("on", x === b));
    render(true);
  }));
  startEl.addEventListener("input", () => { H.s = +startEl.value; render(false); });
  let resizeT;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { renderGrow(false); render(false); }, 150); });
  render(false);

  // Draw the lines in when the charts first scroll into view.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      if (en.target.id === "gr-chart") renderGrow(true); else render(true);
    }), { threshold: 0.35 });
    io.observe($("#gr-chart")); io.observe($("#h-chart"));
  }

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "Prices rise about 3% a year, and you keep $1,000 in cash in a drawer for ten years. What happens to it?",
      opts: ["It's still $1,000, but each year it buys a little less", "The bills slowly lose dollars, so you end up with less", "It buys more over time, since prices are going up", "It earns about 3% a year, the same as inflation"], a: 0,
      why: "Cash never loses dollars, but inflation raises prices, so each dollar buys less. That's lost buying power." },
    { q: "A savings account pays 4% a year, and inflation is 3%. About what is the real return?",
      opts: ["7%", "4%", "1%", "−1%"], a: 2,
      why: "Real return ≈ return − inflation = 4% − 3% = 1%. Your buying power grows about 1% a year." },
    { q: "You invest $1,000 and it grows 10% every year. What is it worth after 3 years?",
      opts: ["$1,300", "$1,331", "$1,310", "$1,030"], a: 1,
      why: "$1,000 × 1.10 = $1,100, × 1.10 = $1,210, × 1.10 = $1,331. Growth on growth makes it more than $1,300." },
    { q: "Using the rule of 72, about how long does money growing 6% a year take to double?",
      opts: ["6 years", "12 years", "18 years", "72 years"], a: 1,
      why: `Years to double ≈ ${F(72, "return in %")} = ${F(72, 6)} = 12 years.` },
    { q: "Your emergency fund is full and you have no debt. Which money is the best fit for an S&P 500 index fund?",
      opts: ["$2,000 you won't need for the next 20 years", "Next month's rent, which is due in three weeks", "The money set aside for surprise car repairs", "Savings for a used car you'll buy next year"], a: 0,
      why: "Only the 20-year money has a long time horizon. The others are needed within a year, when the market could be down." },
    { q: "Since 1928, how did the S&P 500 do against safe savings (3-month Treasury bills) over 20-year stretches?",
      opts: ["It ended up ahead in every 20-year stretch", "It ended up ahead in about half of them", "It ended up behind in most of the stretches", "It ended up exactly even in nearly all of them"], a: 0,
      why: "All 79 twenty-year stretches from 1928 to 2025 ended with the S&P 500 ahead of savings. Past results don't promise future ones." },
    { q: "In 2008 the S&P 500 fell 36.55%. About what was $1,000 invested at the start of the year worth at the end?",
      opts: ["$365", "$635", "$963", "$1,366"], a: 1,
      why: "$1,000 × (1 − 0.3655) = $1,000 × 0.6345 ≈ $635. It took until the end of 2012 to get back above $1,000." },
  ];

  const QUIZ_ES = [
    { q: "Los precios suben alrededor de 3% al año y guardas $1,000 en efectivo en un cajón durante diez años. ¿Qué les pasa?",
      opts: ["Siguen siendo $1,000, pero cada año compran un poco menos", "Los billetes pierden dólares poco a poco y te queda menos", "Compran más con el tiempo, porque los precios van subiendo", "Ganan más o menos 3% al año, lo mismo que la inflación"], a: 0,
      why: "El efectivo nunca pierde dólares, pero la inflación sube los precios, así que cada dólar compra menos. Eso es poder de compra perdido." },
    { q: "Una cuenta de ahorro paga 4% al año y la inflación es de 3%. ¿Más o menos cuál es el rendimiento real?",
      opts: ["7%", "4%", "1%", "−1%"], a: 2,
      why: "Rendimiento real ≈ rendimiento − inflación = 4% − 3% = 1%. Tu poder de compra crece más o menos 1% al año." },
    { q: "Inviertes $1,000 y crecen 10% cada año. ¿Cuánto valen después de 3 años?",
      opts: ["$1,300", "$1,331", "$1,310", "$1,030"], a: 1,
      why: "$1,000 × 1.10 = $1,100, × 1.10 = $1,210, × 1.10 = $1,331. El crecimiento sobre el crecimiento hace que sea más de $1,300." },
    { q: "Con la regla del 72, ¿más o menos cuánto tarda en duplicarse el dinero que crece 6% al año?",
      opts: ["6 años", "12 años", "18 años", "72 años"], a: 1,
      why: `Años para duplicarse ≈ ${F(72, "rendimiento en %")} = ${F(72, 6)} = 12 años.` },
    { q: "Tu fondo de emergencia está lleno y no tienes deudas. ¿Qué dinero es el más adecuado para un fondo indexado del S&P 500?",
      opts: ["$2,000 que no vas a necesitar en los próximos 20 años", "El alquiler del próximo mes, que vence en tres semanas", "El dinero apartado para reparaciones del carro", "Tus ahorros para un carro usado que comprarás el próximo año"], a: 0,
      why: "Solo el dinero a 20 años tiene un horizonte de tiempo largo. Los demás se necesitan antes de un año, cuando el mercado podría estar abajo." },
    { q: "Desde 1928, ¿cómo le fue al S&P 500 contra el ahorro seguro (bonos del Tesoro a 3 meses) en periodos de 20 años?",
      opts: ["Terminó adelante en todos los periodos de 20 años", "Terminó adelante más o menos en la mitad de ellos", "Terminó atrás en la mayoría de los periodos", "Terminó exactamente igual en casi todos ellos"], a: 0,
      why: "Los 79 periodos de 20 años entre 1928 y 2025 terminaron con el S&P 500 por encima del ahorro. Lo que pasó antes no garantiza lo que viene." },
    { q: "En 2008 el S&P 500 cayó 36.55%. ¿Más o menos cuánto valían al final del año $1,000 invertidos al principio?",
      opts: ["$365", "$635", "$963", "$1,366"], a: 1,
      why: "$1,000 × (1 − 0.3655) = $1,000 × 0.6345 ≈ $635. Tardó hasta finales de 2012 en volver a pasar de $1,000." },
  ];

  FHLesson.init({ id: LESSON, short: "why-invest", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
