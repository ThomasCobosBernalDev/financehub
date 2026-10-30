// Unit 5, Lesson 7: 401(k) and Roth IRA
(function () {
  const LESSON = "u5-retirement";
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
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // Growth assumption used across the lesson: 7% a year after inflation (the S&P 500 averaged 6.8% real, 1928-2025).
  const R = 0.07;
  const fv = (yearly, n, r = R) => (yearly * ((1 + r) ** n - 1)) / r;
  const PAYCHECKS = 26;

  // ---------- See it: the match ----------
  const PLANS = [
    { m: (p) => Math.min(p, 4), full: 4 },
    { m: (p) => 0.5 * Math.min(p, 6), full: 6 },
    { m: (p) => Math.min(p, 3) + 0.5 * Math.max(0, Math.min(p, 5) - 3), full: 5 },
  ];
  let plan = 0;
  const mtSal = $("#mt-sal"), mtPct = $("#mt-pct");
  const drawMatch = () => {
    const sal = +mtSal.value, p = +mtPct.value, P = PLANS[plan];
    const you = (sal * p) / 100, emp = (sal * P.m(p)) / 100, max = (sal * P.m(P.full)) / 100, miss = max - emp;
    $("#mt-sal-v").textContent = money(sal);
    $("#mt-pct-v").textContent = T(`${p}% of pay`, `${p}% del sueldo`);
    const scale = 120000 * 0.14;
    const bar = $("#mt-bar");
    bar.querySelector(".you").style.width = `${(you / scale) * 100}%`;
    bar.querySelector(".emp").style.width = `${(emp / scale) * 100}%`;
    bar.querySelector(".miss").style.width = `${(miss / scale) * 100}%`;
    $("#mt-out").innerHTML = `
      <div><dt>${T("You put in each year", "Tú pones al año")}</dt><dd><b>${money(you)}</b> <span class="muted">· ${cents(you / PAYCHECKS)} ${T("a paycheck", "por cheque")}</span></dd></div>
      <div><dt>${T("Your employer adds", "Tu empleador agrega")}</dt><dd><b>${money(emp)}</b></dd></div>
      <div><dt>${T("Match you're missing", "Aportación que te falta")}</dt><dd><b>${money(miss)}</b></dd></div>
      <div><dt>${T("Instant return on your money", "Rendimiento inmediato de tu dinero")}</dt><dd>${p > 0 ? `${frac(money(emp), money(you))} = <b>${Math.round((emp / you) * 100)}%</b>` : "—"}</dd></div>`;
    const m = $("#mt-msg");
    if (p === 0) { m.innerHTML = T(`You put in nothing, so your employer adds nothing. That's <b>${money(miss)}</b> a year of pay left on the table.`, `No pones nada, así que tu empleador no agrega nada. Son <b>${money(miss)}</b> al año de sueldo que dejas en la mesa.`); m.dataset.tone = "warn"; }
    else if (miss > 0.5) { m.innerHTML = T(`Raise it to <b>${P.full}%</b> and your employer adds another <b>${money(miss)}</b> a year.`, `Súbelo a <b>${P.full}%</b> y tu empleador agrega otros <b>${money(miss)}</b> al año.`); m.dataset.tone = "warn"; }
    else if (p === P.full) { m.innerHTML = T(`${P.full}% is exactly enough to get the whole match: <b>${money(emp)}</b> a year of free money.`, `${P.full}% es justo lo necesario para recibir toda la aportación: <b>${money(emp)}</b> al año de dinero gratis.`); m.dataset.tone = "good"; }
    else { m.innerHTML = T(`You get the whole match. The extra ${p - P.full}% gets no match, but it still grows for your retirement.`, `Recibes toda la aportación. El ${p - P.full}% extra no recibe aportación, pero igual crece para tu retiro.`); m.dataset.tone = "good"; }
    fillRange(mtSal); fillRange(mtPct);
  };
  [mtSal, mtPct].forEach((r) => r.addEventListener("input", drawMatch));
  $$("#mt-plan .chip").forEach((c) => c.addEventListener("click", () => {
    plan = +c.dataset.p;
    $$("#mt-plan .chip").forEach((x) => x.classList.toggle("on", x === c));
    drawMatch();
  }));
  drawMatch();

  // ---------- See it: traditional vs. Roth ----------
  const G45 = (1 + R) ** 45;
  let rNow = 12, rLater = 22;
  const drawRoth = () => {
    const trad = { inn: 1000, grown: 1000 * G45, taxEnd: 1000 * G45 * (rLater / 100), taxNow: 0 };
    trad.keep = trad.grown - trad.taxEnd;
    const roth = { inn: 1000 * (1 - rNow / 100), taxNow: 1000 * (rNow / 100), taxEnd: 0 };
    roth.grown = roth.inn * G45; roth.keep = roth.grown;
    const H = 170, top = 1000 * G45;
    const col = (name, sub, c) => `<div class="rt-col">
        <b class="rt-col-h">${name}</b><span class="rt-col-s">${sub}</span>
        <div class="rt-bars" aria-hidden="true">
          <div class="rt-b"><div class="rt-stack" style="height:${Math.max(2, (1000 / top) * H)}px"><i class="tax" style="flex:${c.taxNow}"></i><i class="in" style="flex:${c.inn}"></i></div><span>${T("in", "entra")}</span></div>
          <div class="rt-b"><div class="rt-stack" style="height:${(c.grown / top) * H}px"><i class="tax" style="flex:${c.taxEnd}"></i><i class="keep" style="flex:${c.keep}"></i></div><span>${T("at 67", "a los 67")}</span></div>
        </div>
        <dl class="md-out">
          <div><dt>${T("Tax now", "Impuesto ahora")}</dt><dd>${c.taxNow ? `−${money(c.taxNow)}` : "$0"}</dd></div>
          <div><dt>${T("Goes in", "Entra")}</dt><dd>${money(c.inn)}</dd></div>
          <div><dt>${T("After 45 years", "Después de 45 años")}</dt><dd>${money(c.grown)}</dd></div>
          <div><dt>${T("Tax at the end", "Impuesto al final")}</dt><dd>${c.taxEnd ? `−${money(c.taxEnd)}` : "$0"}</dd></div>
          <div class="rt-keep"><dt>${T("Yours to spend", "Tuyo para gastar")}</dt><dd><b>${money(c.keep)}</b></dd></div>
        </dl></div>`;
    $("#rt-cols").innerHTML = col(T("Traditional", "Tradicional"), T("tax later", "impuesto después"), trad) + col("Roth", T("tax now", "impuesto ahora"), roth);
    const m = $("#rt-msg"), d = Math.abs(roth.keep - trad.keep);
    if (rNow < rLater) { m.innerHTML = T(`<b>Roth wins by ${money(d)}.</b> You paid ${rNow}% on the way in instead of ${rLater}% on the way out.`, `<b>Roth gana por ${money(d)}.</b> Pagaste ${rNow}% al entrar en vez de ${rLater}% al salir.`); m.dataset.tone = "good"; }
    else if (rNow > rLater) { m.innerHTML = T(`<b>Traditional wins by ${money(d)}.</b> You skip ${rNow}% now and pay only ${rLater}% later. That's common for people in their peak earning years.`, `<b>Tradicional gana por ${money(d)}.</b> Te saltas ${rNow}% ahora y pagas solo ${rLater}% después. Eso es común en los años en que más se gana.`); m.dataset.tone = "good"; }
    else { m.innerHTML = T(`<b>A tie: ${money(roth.keep)} either way.</b> With the same rate now and later, it doesn't matter when the tax comes out.`, `<b>Empate: ${money(roth.keep)} de cualquier forma.</b> Con la misma tasa ahora y después, no importa cuándo se paga el impuesto.`); m.dataset.tone = ""; }
  };
  const chipGroup = (sel, set) => $$(`${sel} .chip`).forEach((c) => c.addEventListener("click", () => {
    $$(`${sel} .chip`).forEach((x) => x.classList.toggle("on", x === c));
    set(+c.dataset.r);
    drawRoth();
  }));
  chipGroup("#rt-now", (r) => (rNow = r));
  chipGroup("#rt-later", (r) => (rLater = r));
  drawRoth();

  // ---------- See it: start early ----------
  const stAge = $("#st-age"), stChart = $("#st-chart");
  const YEARLY = 2400;
  let stSeen = false;
  const drawStart = (animate) => {
    const a = +stAge.value, n = 67 - a, end = fv(YEARLY, n);
    $("#st-age-v").textContent = a;
    $("#st-big").textContent = money(end);
    $("#st-txt").textContent = T(`at 67, from ${money(YEARLY * n)} put in over ${n} years`, `a los 67, de ${money(YEARLY * n)} que pusiste en ${n} años`);
    const W = stChart.clientWidth && stChart.clientWidth < 480 ? 400 : 600, H = 250, L = W < 600 ? 50 : 62, Rr = 14, Tp = 14, B = 34;
    stChart.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const X = (age) => L + ((age - 18) / 49) * (W - L - Rr), Y = (v) => H - B - (v / 1e6) * (H - B - Tp);
    stChart.innerHTML = "";
    const g = svgEl("g", { "font-size": W < 600 ? 14 : 13, fill: "var(--ink-3)" });
    [0, 250000, 500000, 750000, 1000000].forEach((v) => {
      g.appendChild(svgEl("line", { x1: L, x2: W - Rr, y1: Y(v), y2: Y(v), stroke: "var(--line)" }));
      g.appendChild(svgEl("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, v === 0 ? "$0" : v === 1e6 ? "$1M" : `$${v / 1000}k`));
    });
    (W < 600 ? [18, 30, 45, 67] : [18, 25, 35, 45, 55, 67]).forEach((age) => g.appendChild(svgEl("text", { x: X(age), y: H - 12, "text-anchor": "middle" }, age)));
    stChart.appendChild(g);
    const ages = Array.from({ length: n + 1 }, (_, k) => a + k);
    const bal = ages.map((_, k) => fv(YEARLY, k)), put = ages.map((_, k) => YEARLY * k);
    const area = (vals) => `M${X(a)},${Y(0)} ` + ages.map((age, k) => `L${X(age)},${Y(vals[k])}`).join(" ") + ` L${X(67)},${Y(0)}Z`;
    stChart.appendChild(svgEl("path", { d: area(put), fill: "color-mix(in srgb, var(--ink-3) 45%, transparent)" }));
    const line = svgEl("path", { d: "M" + ages.map((age, k) => `${X(age)} ${Y(bal[k])}`).join(" L"), fill: "none", stroke: "var(--savings)", "stroke-width": 3 });
    stChart.appendChild(line);
    // The balance draws in with a glowing tip and a tag counting up; the fill under it fades out downward.
    const balAt = (x) => {
      const f = Math.max(0, Math.min(1, (x - X(a)) / (X(67) - X(a)))) * n, k = Math.floor(f);
      return k >= n ? bal[n] : bal[k] + (bal[k + 1] - bal[k]) * (f - k);
    };
    const runFx = (animate) => FHLesson.fx.run(stChart, {
      lines: [{ el: line, color: "var(--savings)", r: 5 }],
      tag: { line: 0, label: T("Your balance", "Tu saldo"), value: (x) => money(Math.round(balAt(x))), box: { x0: L, y0: H - B, big: W < 600 ? 1.3 : .85 } },
      area: { line: 0, baseY: Y(0), strength: .5 },
      animate, dur: 2000,
    });
    if (a > 18) stChart.appendChild(svgEl("line", { x1: X(a), x2: X(a), y1: Tp, y2: H - B, stroke: "var(--ink-3)", "stroke-dasharray": "3 4" }));
    const lab = svgEl("text", { x: X(a) + 6, y: Tp + 14, "font-size": W < 600 ? 14 : 13, "font-weight": 700, fill: "var(--ink-2)" }, T(`start at ${a}`, `empiezas a los ${a}`));
    stChart.appendChild(lab);
    runFx(animate === true && stSeen);
    const m = $("#st-msg"), growth = end - YEARLY * n;
    const share = Math.round((growth / end) * 100);
    if (a <= 35) {
      const later = fv(YEARLY, n - 10);
      m.innerHTML = T(`Growth did <b>${share}%</b> of the work. Start 10 years later, at ${a + 10}, and you'd end with <b>${money(later)}</b>, ${Math.round((1 - later / end) * 100)}% less.`, `El crecimiento hizo <b>${share}%</b> del trabajo. Si empiezas 10 años después, a los ${a + 10}, terminarías con <b>${money(later)}</b>, ${Math.round((1 - later / end) * 100)}% menos.`);
      m.dataset.tone = "good";
    } else {
      const early = fv(YEARLY, 45);
      m.innerHTML = T(`Growth did <b>${share}%</b> of the work. Starting at 22 instead would give <b>${money(early)}</b>, ${(early / end).toFixed(1)} times as much.`, `El crecimiento hizo <b>${share}%</b> del trabajo. Empezar a los 22 daría <b>${money(early)}</b>, ${(early / end).toFixed(1)} veces más.`);
      m.dataset.tone = "warn";
    }
    fillRange(stAge);
  };
  stAge.addEventListener("input", () => drawStart(false));
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => drawStart(false), 150); });
  drawStart(false);
  // Draw the balance in when the chart first scrolls into view.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); stSeen = true; drawStart(true); } }, { threshold: 0.4 });
    io.observe(stChart);
  }

  // ---------- Play it: benefits day ----------
  const SAL = 50000;
  const G44 = (1 + R) ** 44, G42 = (1 + R) ** 42;
  const opt = (k, name, sub) => `<button type="button" class="bf-opt" data-k="${k}" aria-pressed="false"><b>${name}</b><small>${sub}</small></button>`;
  const MISSIONS = [
    {
      age: T("Age 22 · your first week at Brightline", "22 años · tu primera semana en Brightline"),
      goal: T("Set your 401(k) contribution. Brightline matches 100% of what you put in, up to 4% of your pay.", "Elige tu aportación al 401(k). Brightline iguala el 100% de lo que pones, hasta el 4% de tu sueldo."),
      app: T("Benefits · 401(k)", "Beneficios · 401(k)"),
      screen: () => `<div class="bf-q">${T("Traditional 401(k) contribution", "Aportación al 401(k) tradicional")}</div>
        <label class="md-lab" for="bf-rate">${T("Percent of each paycheck", "Porcentaje de cada cheque")} <b id="bf-rate-v">0%</b></label>
        <input type="range" id="bf-rate" min="0" max="15" step="1" value="0">
        <dl class="bf-est" id="bf-est"></dl>`,
      mount: () => {
        const r = $("#bf-rate");
        const upd = () => {
          const p = +r.value, you = (SAL * p) / 100, emp = (SAL * Math.min(p, 4)) / 100;
          $("#bf-rate-v").textContent = `${p}%`;
          $("#bf-est").innerHTML = `<div><dt>${T("Each paycheck from you", "De ti en cada cheque")}</dt><dd>${cents(you / PAYCHECKS)}</dd></div>
            <div><dt>${T("Each paycheck from Brightline", "De Brightline en cada cheque")}</dt><dd>${cents(emp / PAYCHECKS)}</dd></div>
            <div><dt>${T("A year, together", "Al año, juntos")}</dt><dd><b>${money(you + emp)}</b></dd></div>`;
          fillRange(r);
        };
        r.addEventListener("input", upd);
        upd();
        return true;
      },
      pick: () => +$("#bf-rate").value,
      judge: (p) => {
        const yr = (q) => (SAL * q) / 100 + (SAL * Math.min(q, 4)) / 100;
        const rows = [...new Set([0, 2, 4, p])].sort((x, y) => x - y).map((q) => ({ label: `${q}%`, v: fv(yr(q), 45), you: q === p, best: q >= 4 }));
        const ok = p >= 4;
        let why;
        if (p === 4) why = T("You got every dollar of the match: <b>$2,000</b> a year from Brightline on top of your $2,000. That's a 100% return before your fund earns anything.", "Recibiste cada dólar de la aportación: <b>$2,000</b> al año de Brightline además de tus $2,000. Es un rendimiento de 100% antes de que tu fondo gane algo.");
        else if (p > 4) why = T(`You got the whole $2,000 match, plus ${p - 4}% more of your own. The extra has no match, but it still grows: ${money(fv(yr(p), 45))} at 67.`, `Recibiste toda la aportación de $2,000, más ${p - 4}% extra tuyo. Lo extra no recibe aportación, pero igual crece: ${money(fv(yr(p), 45))} a los 67.`);
        else why = T(`You left <b>${money((SAL * (4 - p)) / 100)}</b> of Brightline's money on the table every year. That's <b>${money(fv(yr(4), 45) - fv(yr(p), 45))}</b> less at 67 than putting in 4%.`, `Dejaste <b>${money((SAL * (4 - p)) / 100)}</b> del dinero de Brightline en la mesa cada año. Son <b>${money(fv(yr(4), 45) - fv(yr(p), 45))}</b> menos a los 67 que si pusieras 4%.`);
        return { ok, rows, why, short: T(`${p}% of pay`, `${p}% del sueldo`) };
      },
    },
    {
      age: T("Age 22 · same week", "22 años · la misma semana"),
      goal: T("Choose how your 401(k) is invested. Say $4,000 a year goes in: your 4% plus the 4% match.", "Elige en qué se invierte tu 401(k). Digamos que entran $4,000 al año: tu 4% más el 4% de aportación."),
      app: T("Benefits · Investments", "Beneficios · Inversiones"),
      screen: () => `<div class="bf-q">${T("Pick one fund for all of it", "Elige un fondo para todo")}</div><div class="bf-opts" role="group">
        ${opt("stock", T("Brightline Foods stock", "Acciones de Brightline Foods"), T("Shares of just your own company", "Acciones solo de tu propia empresa"))}
        ${opt("stable", T("Stable value fund", "Fondo de valor estable"), T("Steady, about 1% a year after inflation", "Estable, como 1% al año después de la inflación"))}
        ${opt("active", T("Blue Peak Growth Fund", "Fondo Blue Peak Growth"), T("Managers pick stocks · fee 1.00% a year", "Gerentes eligen acciones · comisión de 1.00% al año"))}
        ${opt("index", T("S&P 500 Index Fund", "Fondo indexado del S&P 500"), T("500 big U.S. companies · fee 0.02% a year", "500 empresas grandes de EE. UU. · comisión de 0.02% al año"))}</div>`,
      judge: (k) => {
        const v = { index: fv(4000, 45, R - 0.0002), active: fv(4000, 45, R - 0.01), stable: fv(4000, 45, 0.01) };
        const rows = [
          { k: "index", label: T("S&P 500 index fund", "Fondo indexado del S&P 500"), v: v.index, best: true },
          { k: "active", label: T("Blue Peak, 1% fee", "Blue Peak, comisión de 1%"), v: v.active },
          { k: "stable", label: T("Stable value fund", "Fondo de valor estable"), v: v.stable },
          { k: "stock", label: T("Brightline stock", "Acciones de Brightline"), v: null, note: T("anything from $0 up", "desde $0 hasta lo que sea") },
        ].map((r) => Object.assign(r, { you: r.k === k }));
        const why = {
          index: T(`The lowest fee and 500 companies at once. The active fund's 1% fee would cost you about <b>${money(v.index - v.active)}</b> by 67. A target-date fund, the default in most plans, would be a good pick too.`, `La comisión más baja y 500 empresas a la vez. La comisión de 1% del fondo activo te costaría como <b>${money(v.index - v.active)}</b> a los 67. Un fondo con fecha objetivo, el que viene por defecto en la mayoría de los planes, también sería buena opción.`),
          active: T(`That 1% fee looks small, but it compounds: about <b>${money(v.index - v.active)}</b> less than the index fund by 67. And as you saw in the index funds lesson, most active funds trail the index anyway.`, `Esa comisión de 1% parece chica, pero se acumula: como <b>${money(v.index - v.active)}</b> menos que el fondo indexado a los 67. Y como viste en la lección de fondos indexados, la mayoría de los fondos activos se quedan atrás del índice.`),
          stable: T(`Safe from drops, but at about 1% a year it ends near <b>${money(v.stable)}</b>, about a fifth of the index fund. With 45 years to go, stock drops have time to recover.`, `Está a salvo de las caídas, pero a como 1% al año termina cerca de <b>${money(v.stable)}</b>, como una quinta parte del fondo indexado. Con 45 años por delante, las caídas de las acciones tienen tiempo de recuperarse.`),
          stock: T("One company is a gamble. If Brightline struggles, you could lose your job and your savings at the same time. In the stocks lesson you saw that most single stocks did worse than Treasury bills over their lifetimes.", "Una sola empresa es una apuesta. Si a Brightline le va mal, podrías perder tu trabajo y tus ahorros al mismo tiempo. En la lección de acciones viste que la mayoría de las acciones individuales rindieron menos que los bonos del Tesoro a lo largo de su vida."),
        }[k];
        return { ok: k === "index", rows, why, short: rows.find((r) => r.k === k).label };
      },
    },
    {
      age: T("Age 23 · tax season", "23 años · temporada de impuestos"),
      goal: T("You set aside $1,000 of this year's pay for an IRA at Oakline. Your top tax rate is 12% now, and with raises you expect 22% by retirement.", "Apartaste $1,000 del sueldo de este año para una IRA en Oakline. Tu tasa de impuestos más alta es 12% ahora y, con aumentos, esperas 22% en el retiro."),
      app: T("Oakline · New account", "Oakline · Cuenta nueva"),
      logo: "Oakline",
      screen: () => `<div class="bf-q">${T("Which IRA?", "¿Qué IRA?")}</div><div class="bf-opts" role="group">
        ${opt("roth", "Roth IRA", T("Pay the 12% tax now, take it out tax-free later", "Paga el 12% de impuesto ahora y sácalo sin impuestos después"))}
        ${opt("trad", T("Traditional IRA", "IRA tradicional"), T("Skip the tax now, pay your rate when you take it out", "Sáltate el impuesto ahora y paga tu tasa cuando lo saques"))}
        ${opt("wait", T("Wait until I earn more", "Esperar a ganar más"), T("Keep the $880 left after tax in checking for now", "Dejar por ahora en cheques los $880 que quedan después de impuestos"))}</div>`,
      judge: (k) => {
        const v = { roth: 880 * G44, trad: 1000 * G44 * 0.78, wait: 880 / 1.03 ** 44 };
        const rows = [
          { k: "roth", label: "Roth IRA", v: v.roth, best: true },
          { k: "trad", label: T("Traditional IRA", "IRA tradicional"), v: v.trad },
          { k: "wait", label: T("Checking account", "Cuenta de cheques"), v: v.wait },
        ].map((r) => Object.assign(r, { you: r.k === k }));
        const why = {
          roth: T(`You paid 12% now instead of 22% later: <b>${money(v.roth)}</b> vs. ${money(v.trad)}. And with a Roth IRA, the $880 you put in can come back out any time if you truly need it.`, `Pagaste 12% ahora en vez de 22% después: <b>${money(v.roth)}</b> vs. ${money(v.trad)}. Además, con una Roth IRA, los $880 que pusiste pueden salir en cualquier momento si de verdad los necesitas.`),
          trad: T(`Not bad: the money still grows. But you skipped a 12% tax now to pay 22% later, which leaves <b>${money(v.roth - v.trad)}</b> less than the Roth.`, `No está mal: el dinero igual crece. Pero te saltaste un impuesto de 12% ahora para pagar 22% después, y eso deja <b>${money(v.roth - v.trad)}</b> menos que la Roth.`),
          wait: T(`This year's $880 never gets invested. Inflation, about 3% a year on average since 1928, shrinks it to about <b>${money(v.wait)}</b> in today's dollars by 67. The Roth IRA would have grown it to ${money(v.roth)}.`, `Los $880 de este año nunca se invierten. La inflación, como 3% al año en promedio desde 1928, los encoge a como <b>${money(v.wait)}</b> en dólares de hoy a los 67. La Roth IRA los habría hecho crecer a ${money(v.roth)}.`),
        }[k];
        return { ok: k === "roth", rows, why, short: rows.find((r) => r.k === k).label };
      },
    },
    {
      age: T("Age 25 · a new job offer", "25 años · una nueva oferta de trabajo"),
      goal: T("You're leaving Brightline for a better job. Your 401(k) holds $9,000: $4,500 you put in and $4,500 of match. The match vests after 2 years and you've been here 3, so all of it is yours.", "Te vas de Brightline a un trabajo mejor. Tu 401(k) tiene $9,000: $4,500 que pusiste y $4,500 de aportación. La aportación se vuelve tuya después de 2 años y llevas 3, así que todo es tuyo."),
      app: T("Benefits · Leaving", "Beneficios · Salida"),
      screen: () => `<div class="bf-q">${T("What should happen to your $9,000?", "¿Qué pasa con tus $9,000?")}</div><div class="bf-opts" role="group">
        ${opt("roll", T("Roll it over into an IRA at Oakline", "Pasarlo a una IRA en Oakline (rollover)"), T("A direct rollover, with no tax", "Una transferencia directa, sin impuestos"))}
        ${opt("leave", T("Leave it in Brightline's plan", "Dejarlo en el plan de Brightline"), T("It stays invested where it is", "Sigue invertido donde está"))}
        ${opt("cash", T("Cash it out", "Sacarlo en efectivo"), T("Get a check now", "Recibir un cheque ahora"))}</div>`,
      judge: (k) => {
        const grown = 9000 * G42;
        const rows = [
          { k: "roll", label: T("Roll over", "Rollover"), v: grown, best: true },
          { k: "leave", label: T("Leave it", "Dejarlo"), v: grown, best: true },
          { k: "cash", label: T("Cash out", "Sacarlo"), v: 0, note: T("$7,020 check now, then spent", "cheque de $7,020 ahora, y se gasta") },
        ].map((r) => Object.assign(r, { you: r.k === k }));
        const why = {
          roll: T(`All $9,000 keeps growing, to about <b>${money(grown)}</b> by 67, and at Oakline you can pick any index fund. Asking for a direct rollover means nothing is held back for taxes.`, `Los $9,000 siguen creciendo, a como <b>${money(grown)}</b> a los 67, y en Oakline puedes elegir cualquier fondo indexado. Pedir una transferencia directa significa que no se retiene nada para impuestos.`),
          leave: T(`That works too: it keeps growing to about <b>${money(grown)}</b>. Just keep track of it, keep your address updated, and check its fees. Many people roll old plans into one IRA so nothing gets lost.`, `También funciona: sigue creciendo a como <b>${money(grown)}</b>. Solo no le pierdas la pista, mantén tu dirección al día y revisa sus comisiones. Mucha gente junta sus planes viejos en una IRA para que nada se pierda.`),
          cash: T(`After the 10% penalty, $900, and 12% income tax, $1,080, the check is <b>$7,020</b>, and that money stops growing for retirement. Left alone, it would be about <b>${money(grown)}</b> at 67.`, `Después de la multa de 10%, $900, y el impuesto de 12%, $1,080, el cheque es de <b>$7,020</b>, y ese dinero deja de crecer para tu retiro. Si lo dejas, serían como <b>${money(grown)}</b> a los 67.`),
        }[k];
        return { ok: k !== "cash", rows, why, short: rows.find((r) => r.k === k).label };
      },
    },
  ];

  const B = { m: 0, pick: null, done: false, score: 0, log: [] };
  const screen = $("#bf-screen"), submit = $("#bf-submit"), nextBtn = $("#bf-next"), whyEl = $("#bf-why"), barsEl = $("#bf-bars");
  const drawBars = (rows) => {
    const max = Math.max(...rows.map((r) => r.v || 0), 1);
    barsEl.innerHTML = rows.map((r) => `<div class="bf-row${r.you ? " you" : ""}${r.best ? " best" : ""}">
      <div class="bf-rl"><b>${r.label}</b>${r.you ? `<em>${T("your pick", "tu elección")}</em>` : ""}</div>
      <div class="bf-track">${r.v === null ? `<i class="unknown"></i>` : `<i style="width:${Math.max(r.v > 0 ? 1.5 : 0, (r.v / max) * 100)}%"></i>`}</div>
      <span class="bf-v">${r.v === null ? "?" : money(r.v)}${r.note ? `<small>${r.note}</small>` : ""}</span></div>`).join("");
  };
  const startMission = () => {
    const M = MISSIONS[B.m];
    B.pick = null; B.done = false;
    $("#bf-round").textContent = T(`Mission ${B.m + 1} of 4`, `Misión ${B.m + 1} de 4`);
    $("#bf-age").textContent = M.age;
    $("#bf-goal").textContent = M.goal;
    $("#bf-logo").textContent = M.logo || "Brightline Foods";
    $("#bf-app-t").textContent = M.app;
    screen.innerHTML = M.screen();
    if (M.mount) { M.mount(); submit.disabled = false; }
    else {
      submit.disabled = true;
      $$(".bf-opt", screen).forEach((b) => b.addEventListener("click", () => {
        if (B.done) return;
        B.pick = b.dataset.k;
        $$(".bf-opt", screen).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        submit.disabled = false;
      }));
    }
    barsEl.innerHTML = `<p class="bf-wait">${T("Make your choice to see what each option is worth at 67.", "Elige para ver cuánto vale cada opción a los 67.")}</p>`;
    whyEl.classList.add("hidden");
    nextBtn.disabled = true;
    submit.textContent = T("Save my choice", "Guardar mi elección");
  };
  submit.addEventListener("click", () => {
    if (B.done) return;
    const M = MISSIONS[B.m];
    const pick = M.pick ? M.pick() : B.pick;
    if (pick === null) return;
    const res = M.judge(pick);
    B.done = true;
    if (res.ok) B.score++;
    B.log.push({ ok: res.ok, short: res.short });
    $("#bf-score").textContent = T(`${B.score} of ${B.m + 1}`, `${B.score} de ${B.m + 1}`);
    drawBars(res.rows);
    whyEl.innerHTML = `<b>${res.ok ? T("Good call.", "Buena decisión.") : T("Not the best call.", "No es la mejor decisión.")}</b> ${res.why}`;
    whyEl.dataset.tone = res.ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $$("input, .bf-opt", screen).forEach((x) => (x.disabled = true));
    submit.disabled = true;
    submit.textContent = T("Saved", "Guardado");
    nextBtn.disabled = false;
    nextBtn.innerHTML = B.m < MISSIONS.length - 1 ? `${T("Next mission", "Siguiente misión")} <span class="arrow">→</span>` : `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextBtn.addEventListener("click", () => {
    if (!B.done) return;
    if (B.m < MISSIONS.length - 1) { B.m++; startMission(); return; }
    finish();
  });
  const finish = () => {
    const res = $("#bf-result");
    res.classList.remove("hidden");
    const title = B.score === 4 ? T("Retirement ready", "Listo para el retiro") : B.score === 3 ? T("Almost there", "Casi listo") : T("Good practice", "Buena práctica");
    const names = [T("Contribution", "Aportación"), T("Investment", "Inversión"), "IRA", T("Changing jobs", "Cambio de trabajo")];
    res.innerHTML = `<div class="result-grade"><span class="grade">${B.score}/4</span><div><b>${title}</b><p>${B.score === 4
      ? T("Full match, a low-cost index fund, a Roth IRA at a low tax rate, and no cashing out. That's the whole plan most planners would give you.", "Toda la aportación, un fondo indexado de bajo costo, una Roth IRA con una tasa de impuestos baja y nada de sacar el dinero. Es el plan completo que te daría la mayoría de los asesores.")
      : T("Look back at the bars for the calls you missed: each one shows what the best option would be worth at 67.", "Revisa las barras de las decisiones que fallaste: cada una muestra cuánto valdría la mejor opción a los 67.")}</p></div></div>
      <dl class="rd-cmp bf-sum">${B.log.map((l, i) => `<div><dt>${names[i]}</dt><dd class="${l.ok ? "ok" : "no"}">${l.short} ${l.ok ? "✓" : "✗"}</dd></div>`).join("")}</dl>
      <div style="margin-top:16px"><button class="btn line" type="button" id="bf-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#bf-again").addEventListener("click", () => {
      Object.assign(B, { m: 0, score: 0, log: [] });
      $("#bf-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      startMission();
      $("#bf").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, B.score * 25);
    if (first) FH.addXP(50, T("Made your benefits-day choices", "Tomaste tus decisiones de beneficios"));
    if (B.score === 4) FH.badge("retirement-ready", T("Retirement Ready", "Listo para el retiro"));
    FH.save();
  };
  startMission();

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "Your salary is $60,000. Your employer matches 100% of what you put in, up to 5% of pay. You contribute 3%. How much does your employer add in a year?",
      opts: ["$1,800", "$3,000", "$1,200", "$900"], a: 0,
      why: "Match = 100% × 3% × $60,000 = $1,800. Putting in 5% would get the full $3,000, so 3% leaves $1,200 a year on the table." },
    { q: "A plan matches 50% of what you put in, up to 6% of pay. What's the least you should contribute to get the whole match?",
      opts: ["6% of pay", "3% of pay", "50% of pay", "12% of pay"], a: 0,
      why: "The match covers your first 6% of pay, at 50 cents per dollar. Put in 6% and your employer adds 3%. Put in less and you leave match behind." },
    { q: "Which kind of account gives you a tax break now but taxes the money when you take it out in retirement?",
      opts: ["A traditional 401(k) or IRA", "A Roth 401(k) or IRA", "A regular brokerage account", "A high-yield savings account"], a: 0,
      why: "Traditional accounts skip income tax on the way in and tax withdrawals. Roth accounts are the reverse: taxed now, tax-free later." },
    { q: "You're 23 with a 12% top tax rate, and you expect a 22% rate in retirement. Which usually leaves you more to spend later?",
      opts: ["Roth, because you pay the lower 12% rate now", "Traditional, because you skip tax now", "They always come out exactly the same", "Neither, because retirement accounts are taxed twice"], a: 0,
      why: `For $1,000 of pay growing 21 times over 45 years: Roth = $1,000 × 0.88 × 21.00 = $18,482. Traditional = $1,000 × 21.00 × 0.78 = $16,382. They tie only when the rates are equal.` },
    { q: "At 30, you cash out $10,000 from a traditional 401(k). You owe the 10% early withdrawal penalty and a 22% income tax rate. About how much do you keep?",
      opts: ["$6,800", "$9,000", "$7,800", "$10,000"], a: 0,
      why: "$10,000 × (1 − 0.10 − 0.22) = $10,000 × 0.68 = $6,800. You lose $1,000 to the penalty and $2,200 to tax." },
    { q: "You're 20 and earned $20,000 from a job in 2026. What's the most you can put into IRAs that year?",
      opts: ["$7,500", "$24,500", "$20,000", "$1,100"], a: 0,
      why: "The 2026 IRA limit is $7,500, and you can't put in more than you earned from work. You earned $20,000, so the $7,500 limit applies. $24,500 is the 401(k) limit." },
    { q: "Your employer's match vests after 3 years. You leave after 2. What happens to your 401(k)?",
      opts: ["You keep everything you put in, but lose the match", "You lose everything in the account", "You keep all of it, match included", "You pay back the match plus a 10% penalty"], a: 0,
      why: "Your own contributions are always 100% yours. The match becomes yours only once it vests, so leaving before 3 years means giving it up." },
  ];
  const QUIZ_ES = [
    { q: "Tu sueldo es de $60,000. Tu empleador iguala el 100% de lo que pones, hasta el 5% del sueldo. Tú aportas 3%. ¿Cuánto agrega tu empleador en un año?",
      opts: ["$1,800", "$3,000", "$1,200", "$900"], a: 0,
      why: "Aportación = 100% × 3% × $60,000 = $1,800. Si pusieras 5% recibirías los $3,000 completos, así que con 3% dejas $1,200 al año en la mesa." },
    { q: "Un plan iguala el 50% de lo que pones, hasta el 6% del sueldo. ¿Qué es lo mínimo que deberías aportar para recibir toda la aportación?",
      opts: ["6% del sueldo", "3% del sueldo", "50% del sueldo", "12% del sueldo"], a: 0,
      why: "La aportación cubre tu primer 6% del sueldo, a 50 centavos por dólar. Pon 6% y tu empleador agrega 3%. Si pones menos, dejas aportación sin recibir." },
    { q: "¿Qué tipo de cuenta te da un beneficio fiscal ahora, pero cobra impuestos cuando sacas el dinero en el retiro?",
      opts: ["Un 401(k) o IRA tradicional", "Un 401(k) o IRA Roth", "Una cuenta de inversión normal", "Una cuenta de ahorro de alto rendimiento"], a: 0,
      why: "Las cuentas tradicionales no pagan impuesto sobre la renta al entrar y cobran impuesto al sacar. Las Roth son al revés: pagan impuesto ahora y salen sin impuestos después." },
    { q: "Tienes 23 años, tu tasa de impuestos más alta es 12% y esperas una tasa de 22% en el retiro. ¿Qué cuenta normalmente te deja más para gastar después?",
      opts: ["Roth, porque pagas la tasa más baja de 12% ahora", "Tradicional, porque te saltas el impuesto ahora", "Siempre dan exactamente lo mismo", "Ninguna, porque las cuentas para el retiro pagan impuestos dos veces"], a: 0,
      why: `Con $1,000 de sueldo que crecen 21 veces en 45 años: Roth = $1,000 × 0.88 × 21.00 = $18,482. Tradicional = $1,000 × 21.00 × 0.78 = $16,382. Solo empatan cuando las tasas son iguales.` },
    { q: "A los 30 años sacas $10,000 de un 401(k) tradicional. Debes la multa de 10% por retiro anticipado y una tasa de impuestos de 22%. ¿Más o menos cuánto te queda?",
      opts: ["$6,800", "$9,000", "$7,800", "$10,000"], a: 0,
      why: "$10,000 × (1 − 0.10 − 0.22) = $10,000 × 0.68 = $6,800. Pierdes $1,000 en la multa y $2,200 en impuestos." },
    { q: "Tienes 20 años y ganaste $20,000 trabajando en 2026. ¿Qué es lo máximo que puedes poner en IRAs ese año?",
      opts: ["$7,500", "$24,500", "$20,000", "$1,100"], a: 0,
      why: "El límite de las IRA en 2026 es $7,500, y no puedes poner más de lo que ganaste trabajando. Ganaste $20,000, así que aplica el límite de $7,500. $24,500 es el límite del 401(k)." },
    { q: "La aportación de tu empleador se vuelve tuya después de 3 años. Te vas a los 2. ¿Qué pasa con tu 401(k)?",
      opts: ["Te quedas con todo lo que pusiste, pero pierdes la aportación del empleador", "Pierdes todo lo que hay en la cuenta", "Te quedas con todo, aportación incluida", "Devuelves la aportación más una multa de 10%"], a: 0,
      why: "Lo que tú aportas siempre es 100% tuyo. La aportación del empleador solo es tuya cuando se adquieren los derechos, así que irte antes de 3 años significa perderla." },
  ];

  FHLesson.init({ id: LESSON, short: "retirement", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
