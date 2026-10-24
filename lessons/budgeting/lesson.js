// Unit 4, Lesson 1: Budgeting frameworks
(function () {
  const LESSON = "u4-budgeting-frameworks";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = FH.money;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const chapters = $$("main .chapter");

  // ---------- XP, rail and learning style ----------
  const renderProgress = () => {
    $("#xp").textContent = FH.state.xp;
    const seen = FH.lesson(LESSON).sections;
    $$(".rail a").forEach((a) => a.classList.toggle("seen", !!seen[a.getAttribute("href").slice(1)]));
  };
  document.addEventListener("fh:save", renderProgress);

  const applyStyle = () => {
    const pref = FH.state.preferredStyle;
    chapters.forEach((c) => c.classList.toggle("is-preferred", !!pref && c.dataset.style === pref));
    $$(".rail a").forEach((a) => a.classList.toggle("pref", !!pref && a.dataset.style === pref));
    $$("#style-picker button").forEach((b) => b.classList.toggle("on", b.dataset.pick === pref));
  };
  $$("#style-picker button").forEach((b) =>
    b.addEventListener("click", () => {
      FH.setPreferredStyle(b.dataset.pick);
      applyStyle();
      FH.toast("Got it. That part of every lesson is marked for you.");
      const target = $(`main .chapter[data-style="${b.dataset.pick}"]`);
      if (target) setTimeout(() => target.scrollIntoView(), 700);
    })
  );

  const seenIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting && FH.markSection(LESSON, e.target.id)) FH.addXP(5); }),
    { threshold: 0.3 }
  );
  chapters.forEach((c) => seenIO.observe(c));

  const fillRange = (r) => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

  // ---------- See it: live 50/30/20 ----------
  const slider = $("#pay-slider");
  const renderSplit = () => {
    const pay = +slider.value;
    fillRange(slider);
    $("#pay-label").textContent = money(pay);
    [["needs", 0.5], ["wants", 0.3], ["savings", 0.2]].forEach(([k, f]) => {
      $(`#amt-${k}`).textContent = money(pay * f);
      $(`#bar-${k}`).textContent = `${k[0].toUpperCase() + k.slice(1)} ${money(pay * f)}`;
    });
  };
  slider.addEventListener("input", renderSplit);
  renderSplit();

  // ---------- See it: one hundred coins ----------
  const coinBox = $("#coins");
  const coins = Array.from({ length: 100 }, () => coinBox.appendChild(document.createElement("span")));
  const given = { needs: 0, wants: 0, savings: 0 };
  const KIND = { needs: "var(--needs)", wants: "var(--wants)", savings: "var(--savings)" };
  const renderCoins = () => {
    let i = 0;
    for (const k of ["needs", "wants", "savings"]) for (let n = 0; n < given[k]; n++) {
      const c = coins[i++];
      c.style.background = KIND[k];
      c.classList.add("on");
      c.style.transitionDelay = `${(n % 5) * 40}ms`;
    }
    for (; i < 100; i++) { coins[i].style.background = ""; coins[i].classList.remove("on"); }
    const left = 100 - given.needs - given.wants - given.savings;
    const status = $("#coins-status");
    if (left > 0) status.textContent = `${left} coins with no job yet.`;
    else if (given.needs === 50 && given.wants === 30 && given.savings === 20) {
      status.innerHTML = "<b class='c-good'>Every coin has a job, and it's exactly 50/30/20.</b>";
      FH.badge("dollar-grid", "Every Dollar Has a Job");
    } else status.innerHTML = `<b class='c-good'>Every coin has a job.</b> Your split is ${given.needs}/${given.wants}/${given.savings}. That's still a zero-based budget, just not 50/30/20.`;
  };
  $$("[data-give]").forEach((b) =>
    b.addEventListener("click", () => {
      const left = 100 - given.needs - given.wants - given.savings;
      if (left > 0) { given[b.dataset.give] += Math.min(5, left); renderCoins(); }
    })
  );
  $("#coins-reset").addEventListener("click", () => { given.needs = given.wants = given.savings = 0; renderCoins(); });
  renderCoins();

  // ---------- Hear it: recorded narration ----------
  const audio = $("#narration");
  const playBtn = $("#play-btn");
  const player = $("#player");
  const transcript = $("#transcript");
  for (let i = 0; i < 32; i++) {
    const bar = document.createElement("i");
    bar.style.animationDelay = `${(i * 137) % 900}ms`;
    bar.style.height = `${20 + ((i * 53) % 60)}%`;
    $("#wave").appendChild(bar);
  }
  let lines = [], current = -1, playing = false;
  const setPlaying = (on) => { playing = on; playBtn.classList.toggle("playing", on); player.classList.toggle("on", on); };
  const playLine = (i) => {
    if (i >= lines.length) { setPlaying(false); current = -1; $$("p", transcript).forEach((p) => p.classList.remove("now")); FH.badge("listened-budgeting", "Good Listener"); return; }
    current = i;
    $$("p", transcript).forEach((p, j) => p.classList.toggle("now", j === i));
    audio.src = `audio/line-${String(i + 1).padStart(2, "0")}.mp3`;
    audio.playbackRate = +$(".speed .on").dataset.rate;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  audio.addEventListener("ended", () => playLine(current + 1));
  playBtn.addEventListener("click", () => {
    if (playing) { audio.pause(); setPlaying(false); }
    else if (current >= 0 && audio.src) { audio.play(); setPlaying(true); }
    else playLine(0);
  });
  $$(".speed button").forEach((b) => b.addEventListener("click", () => {
    $$(".speed button").forEach((x) => x.classList.toggle("on", x === b));
    audio.playbackRate = +b.dataset.rate;
  }));
  fetch("narration.json").then((r) => r.json()).then((spec) => {
    lines = spec.lines;
    lines.forEach((t, i) => {
      const p = document.createElement("p");
      p.textContent = t;
      p.addEventListener("click", () => playLine(i));
      transcript.appendChild(p);
    });
  }).catch(() => { transcript.innerHTML = "<p>The narration couldn't load. Try refreshing the page.</p>"; });

  // ---------- Play it: Month Survivor ----------
  const INCOME = 2400;
  const CATS = [
    { id: "rent", label: "Rent", kind: "needs", value: 900, max: 900, locked: true, hint: "Locked by your lease." },
    { id: "groceries", label: "Groceries", kind: "needs", value: 0, max: 600, hint: "Under about $250 and you'll run out before the month ends." },
    { id: "transport", label: "Transport", kind: "needs", value: 0, max: 300, hint: "A monthly bus pass is $100." },
    { id: "phone", label: "Phone", kind: "needs", value: 0, max: 120, hint: "Your plan is $50." },
    { id: "fun", label: "Fun and eating out", kind: "wants", value: 0, max: 800, hint: "Too little and you'll be tempted to blow the budget." },
    { id: "subs", label: "Subscriptions", kind: "wants", value: 0, max: 150, hint: "Streaming, games, music." },
    { id: "ef", label: "Emergency fund", kind: "savings", value: 0, max: 1200, hint: "Pays for surprises so they don't land on the card." },
    { id: "invest", label: "Investing", kind: "savings", value: 0, max: 1200, hint: "Grows for future you. You'll learn how in Unit 7." },
  ];
  const cat = (id) => CATS.find((c) => c.id === id).value;
  const KIND_COLOR = { needs: "var(--needs)", wants: "var(--wants)", savings: "var(--savings)" };

  // Scene coordinates (SVG user units, 800 × 500).
  const POS = {
    rent: [110, 120], groceries: [290, 80], transport: [510, 80], phone: [690, 120],
    card: [110, 330], fun: [700, 330], invest: [250, 410], ef: [550, 410],
    you: [400, 270], pin: [400, 150], sky: [400, -40],
  };
  const PLACE_OF = { subs: "fun" };
  const scene = $("#scene");
  const sceneSvg = $("svg", scene);

  const flyCoins = (from, to, n, { red = false, delay = 0 } = {}) => {
    const r = sceneSvg.getBoundingClientRect();
    const sx = r.width / 800, sy = r.height / 500;
    const [x1, y1] = POS[from], [x2, y2] = POS[to];
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 70;
    const runs = Array.from({ length: n }, (_, i) => {
      const c = document.createElement("div");
      c.className = "coin" + (red ? " red" : "");
      scene.appendChild(c);
      const j = () => (Math.random() - 0.5) * 18;
      const anim = c.animate([
        { transform: `translate(${x1 * sx}px, ${y1 * sy}px) scale(.6)`, opacity: 0 },
        { transform: `translate(${mx * sx + j()}px, ${my * sy + j()}px) scale(1.1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${x2 * sx}px, ${y2 * sy}px) scale(.7)`, opacity: 0.9 },
      ], { duration: 750, delay: delay + i * 70, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" });
      return anim.finished.then(() => c.remove());
    });
    return Promise.all(runs).then(() => hit(to));
  };
  const hit = (place) => {
    const g = $(`#pl-${place}`);
    if (!g) return;
    g.classList.remove("hit"); void g.getBoundingClientRect(); g.classList.add("hit");
  };
  const coinsFor = (amt) => Math.max(1, Math.min(8, Math.round(amt / 80)));

  const setJar = (amt) => $("#jar-fill").setAttribute("y", 46 - Math.min(1, amt / 800) * 68);
  const setTree = (amt) => ($("#tree-crown").style.transform = `scale(${0.45 + Math.min(1, amt / 600) * 0.75})`);
  const setCard = (debt) => {
    $("#amt-card").textContent = `${money(debt)} owed`;
    $("#pl-card").classList.toggle("owing", debt > 0);
  };
  const setFace = (happy, stress) => {
    $("#mouth").setAttribute("d", happy >= 65 ? "M-9 -10 Q0 -2 9 -10" : happy >= 40 ? "M-8 -8 L8 -8" : "M-9 -5 Q0 -13 9 -5");
    $("#sweat").setAttribute("opacity", stress > 50 ? 0.9 : 0);
  };

  // Plan rows: sliders that move money around the town.
  const rows = $("#g-rows");
  CATS.forEach((c) => {
    const row = document.createElement("div");
    row.className = "alloc" + (c.locked ? " locked" : "");
    row.innerHTML = `
      <div class="name">${c.label}<small style="color:${KIND_COLOR[c.kind]}">${c.kind}</small></div>
      <input type="range" min="0" max="${c.max}" step="10" value="${c.value}" aria-label="${c.label}" style="--c:${KIND_COLOR[c.kind]}">
      <div class="amt">${money(c.value)}</div>
      <div class="hint">${c.hint}</div>`;
    rows.appendChild(row);
    const input = $("input", row);
    fillRange(input);
    input.addEventListener("input", () => {
      c.value = +input.value;
      $(".amt", row).textContent = money(c.value);
      fillRange(input);
      renderPlan();
    });
  });

  const renderPlan = () => {
    const t = { needs: 0, wants: 0, savings: 0 };
    CATS.forEach((c) => (t[c.kind] += c.value));
    const sum = t.needs + t.wants + t.savings;
    const left = INCOME - sum;
    const el = $("#g-left");
    el.textContent = money(left);
    el.className = "left-big " + (left === 0 ? "c-good" : left < 0 ? "c-danger" : "");
    const pct = (n) => `${(n / Math.max(INCOME, sum)) * 100}%`;
    $("#g-bar-needs").style.flexBasis = pct(t.needs);
    $("#g-bar-wants").style.flexBasis = pct(t.wants);
    $("#g-bar-savings").style.flexBasis = pct(t.savings);
    const p = (n) => Math.round((n / INCOME) * 100);
    $("#g-split").textContent = `${p(t.needs)}% needs · ${p(t.wants)}% wants · ${p(t.savings)}% savings (target 50/30/20). ` +
      (left > 0 ? `Give ${money(left)} more a job to start.` : left < 0 ? `You're ${money(-left)} over. Pull something back.` : "Every dollar has a job.");
    $("#g-start").disabled = left !== 0;
    // Town reflects the plan as you build it.
    ["rent", "groceries", "transport", "phone", "invest", "ef"].forEach((id) => ($(`#amt-${id}`).textContent = money(cat(id))));
    $("#amt-fun").textContent = money(cat("fun") + cat("subs"));
    setJar(cat("ef"));
    setTree(cat("invest"));
    setCard(0);
    setFace(70, 20);
  };
  renderPlan();

  // ----- The month -----
  let S, step, deck, pending;
  const log = (msg, tone = "") => {
    const li = document.createElement("li");
    li.textContent = msg;
    if (tone) li.className = tone;
    $("#g-log").prepend(li);
  };
  const toPin = (from, amt, red) => pending.push(flyCoins(from, "pin", coinsFor(amt), { red }));
  const fromPin = (to, amt) => pending.push(flyCoins("pin", to, coinsFor(amt)));
  const card = (amt, msg) => {
    S.debt += amt;
    S.stress += 6;
    toPin("card", amt, true);
    log(`${msg} +${money(amt)} on the card at 24% APR.`, "bad");
  };
  // Pay from a bucket; whatever it can't cover goes on the card.
  const pay = (amt, bucket, msg) => {
    const from = Math.min(S[bucket], amt);
    S[bucket] -= from;
    if (from > 0) toPin(bucket, from);
    if (amt > from) card(amt - from, `${msg} ${bucket === "ef" ? "The emergency fund" : "Fun money"} ran dry.`);
    else log(msg);
  };
  const gain = (amt, bucket, msg) => { S[bucket] += amt; fromPin(bucket, amt); log(msg, "good"); };

  const EVENTS = [
    { icon: "bike", title: "Your bike chain snaps", text: "A repair is $140. Without it you're walking 40 minutes to work.",
      choices: [
        { label: "Pay from the emergency fund", tag: "−$140 jar", run: () => pay(140, "ef", "Fixed the bike from the emergency fund.") },
        { label: "Put it on the credit card", tag: "+$140 debt", run: () => card(140, "Bike repair.") },
        { label: "Walk for a while", tag: "+stress", run: () => { S.stress += 15; S.happy -= 5; log("Walking to work. Tiring, but free."); } },
      ] },
    { icon: "cake", title: "Best friend's birthday dinner", text: "Everyone's going somewhere nice. Your share is about $60.",
      choices: [
        { label: "Go, and pay from fun money", tag: "−$60 fun", run: () => { pay(60, "fun", "Great night out."); S.happy += 10; } },
        { label: "Suggest somewhere cheaper", tag: "−$15 fun", run: () => { pay(15, "fun", "Cheaper hangout, still fun."); S.happy += 6; } },
        { label: "Skip it", tag: "−happiness", run: () => { S.happy -= 12; log("Skipped the dinner. Saved money, felt left out."); } },
      ] },
    { icon: "clock", title: "Your manager offers overtime", text: "One extra shift adds $110 after taxes.",
      choices: [
        { label: "Take it and save it", tag: "+$110 jar", run: () => { gain(110, "ef", "Overtime +$110 into the emergency fund."); S.stress += 8; } },
        { label: "Take it and spend it", tag: "+$110 fun", run: () => { gain(110, "fun", "Overtime +$110 into fun money."); S.stress += 8; } },
        { label: "Turn it down and rest", tag: "−stress", run: () => { S.stress -= 6; log("Turned down overtime and rested."); } },
      ] },
    { icon: "health", title: "A trip to the doctor", text: "Bad sore throat. The copay and prescription come to $75.",
      choices: [
        { label: "Pay from the emergency fund", tag: "−$75 jar", run: () => pay(75, "ef", "Doctor paid from the emergency fund.") },
        { label: "Put it on the credit card", tag: "+$75 debt", run: () => card(75, "Doctor visit.") },
      ] },
    { icon: "shoe", title: "Sneakers, 40% off", text: "The pair you've wanted is $120, today only.",
      choices: [
        { label: "Buy them with fun money", tag: "−$120 fun", run: () => { pay(120, "fun", "New sneakers."); S.happy += 8; } },
        { label: "Buy them on the card", tag: "+$120 debt", run: () => { card(120, "Sneakers."); S.happy += 8; } },
        { label: "Pass", tag: "", run: () => { S.happy -= 3; log("Passed on the sneakers."); } },
      ] },
    { icon: "crack", title: "Cracked phone screen", text: "A repair is $160. It still works, barely.",
      choices: [
        { label: "Pay from the emergency fund", tag: "−$160 jar", run: () => pay(160, "ef", "Screen fixed from the emergency fund.") },
        { label: "Put it on the credit card", tag: "+$160 debt", run: () => card(160, "Screen repair.") },
        { label: "Live with the crack", tag: "+stress", run: () => { S.stress += 6; S.happy -= 4; log("Living with a cracked screen."); } },
      ] },
    { icon: "refund", title: "Surprise refund", text: "Last month's overcharge comes back: $40.",
      choices: [
        { label: "Into the emergency fund", tag: "+$40 jar", run: () => gain(40, "ef", "+$40 into the emergency fund.") },
        { label: "Into fun money", tag: "+$40 fun", run: () => gain(40, "fun", "+$40 into fun money.") },
      ] },
    { icon: "bolt", title: "The electric bill came in high", text: "A cold snap means you owe $45 more than usual.",
      choices: [
        { label: "Pay from the emergency fund", tag: "−$45 jar", run: () => pay(45, "ef", "Extra electric bill from the emergency fund.") },
        { label: "Pay from fun money", tag: "−$45 fun", run: () => pay(45, "fun", "Extra electric bill from fun money.") },
        { label: "Put it on the credit card", tag: "+$45 debt", run: () => card(45, "Electric bill.") },
      ] },
  ];

  // A thin plan creates its own problems.
  const planEvents = () => {
    const out = [];
    if (cat("groceries") < 250) {
      const short = 250 - cat("groceries");
      out.push({ icon: "cart", title: "The fridge is empty", text: `Your grocery money ran out with days to go. You need about ${money(short)} more food.`,
        choices: [
          { label: "Pay from fun money", tag: `−${money(short)} fun`, run: () => pay(short, "fun", "Bought groceries with fun money.") },
          { label: "Pay from the emergency fund", tag: `−${money(short)} jar`, run: () => pay(short, "ef", "Bought groceries from the emergency fund.") },
          { label: "Order takeout on the card", tag: `+${money(short * 1.6)} debt`, run: () => card(Math.round(short * 1.6), "Takeout costs more than groceries.") },
        ] });
    }
    if (cat("transport") < 100) {
      const cost = 120 - cat("transport");
      out.push({ icon: "bus", title: "No bus pass", text: `You couldn't afford the monthly pass. Single rides cost ${money(cost)} more.`,
        choices: [
          { label: "Pay from fun money", tag: `−${money(cost)} fun`, run: () => pay(cost, "fun", "Paid for bus rides from fun money.") },
          { label: "Pay from the emergency fund", tag: `−${money(cost)} jar`, run: () => pay(cost, "ef", "Paid for bus rides from the emergency fund.") },
          { label: "Put it on the credit card", tag: `+${money(cost)} debt`, run: () => card(cost, "Bus rides.") },
        ] });
    }
    if (cat("phone") < 50) {
      const cost = 65 - cat("phone");
      out.push({ icon: "phone", title: "Phone bill overdue", text: `You planned ${money(cat("phone"))}, but the bill is $50, plus a $15 late fee.`,
        choices: [
          { label: "Pay from the emergency fund", tag: `−${money(cost)} jar`, run: () => pay(cost, "ef", "Paid the phone bill and late fee.") },
          { label: "Put it on the credit card", tag: `+${money(cost)} debt`, run: () => card(cost, "Phone bill.") },
        ] });
    }
    if (cat("fun") < 80) {
      out.push({ icon: "bag", title: "Burnout splurge", text: "With almost no fun money, a rough week ends with you wanting to blow $90.",
        choices: [
          { label: "Splurge on the card", tag: "+$90 debt", run: () => { card(90, "Splurged."); S.happy += 10; } },
          { label: "Free night in with friends", tag: "", run: () => { S.happy += 4; S.stress -= 4; log("Free night in. Not bad."); } },
        ] });
    }
    return out;
  };

  const renderStats = () => {
    S.happy = Math.max(0, Math.min(100, S.happy));
    S.stress = Math.max(0, Math.min(100, S.stress));
    const set = (id, v) => { const el = $(id); if (el.textContent !== v) { el.textContent = v; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } };
    set("#s-ef", money(S.ef));
    set("#s-fun", money(S.fun));
    set("#s-debt", money(S.debt));
    $("#s-debt").classList.toggle("c-danger", S.debt > 0);
    set("#s-happy", String(S.happy));
    set("#s-stress", String(S.stress));
    $("#m-happy").style.width = S.happy + "%";
    $("#m-stress").style.width = S.stress + "%";
    $("#amt-ef").textContent = money(S.ef);
    $("#amt-fun").textContent = money(S.fun);
    setJar(S.ef);
    setCard(S.debt);
    setFace(S.happy, S.stress);
  };

  const setWeek = (w) => $$("#week-strip span").forEach((s, i) => { s.classList.toggle("now", i === w); s.classList.toggle("past", i < w); });
  const pin = $("#event-pin");

  const showEvent = () => {
    if (step >= deck.length) return finish();
    const ev = deck[step];
    const week = Math.floor((step * 4) / deck.length);
    setWeek(week);
    $("#event-pin-icon").setAttribute("href", `#i-${ev.icon}`);
    pin.setAttribute("opacity", 1);
    pin.classList.remove("on"); void pin.getBoundingClientRect(); pin.classList.add("on");
    const box = $("#g-event");
    box.innerHTML = `
      <div class="event-card">
        <svg class="art" aria-hidden="true"><use href="#i-${ev.icon}"/></svg>
        <div class="when">Week ${week + 1} · ${step + 1} of ${deck.length}</div>
        <h3>${ev.title}</h3>
        <div class="muted">${ev.text}</div>
        <div class="choices"></div>
      </div>`;
    const wrap = $(".choices", box);
    ev.choices.forEach((ch) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.innerHTML = `<span>${ch.label}</span><span class="small muted">${ch.tag}</span>`;
      b.addEventListener("click", async () => {
        $$(".choice", wrap).forEach((x) => (x.disabled = true));
        pending = [];
        ch.run();
        await Promise.all(pending);
        renderStats();
        pin.setAttribute("opacity", 0);
        await wait(350);
        step++;
        showEvent();
      });
      wrap.appendChild(b);
    });
  };

  $("#g-start").addEventListener("click", async () => {
    $("#g-start").disabled = true;
    $$("#g-rows input").forEach((i) => (i.disabled = true));
    $("#play").scrollIntoView();
    await wait(500);
    // Payday: the paycheck lands, then flows out to every job you gave it.
    await flyCoins("sky", "you", 12);
    const outs = CATS.filter((c) => c.value > 0 && c.id !== "subs").map((c, i) =>
      flyCoins("you", PLACE_OF[c.id] || c.id, coinsFor(c.value), { delay: i * 120 }));
    await Promise.all(outs);
    S = { ef: cat("ef"), fun: cat("fun") + cat("subs"), debt: 0, happy: cat("subs") > 0 ? 72 : 68, stress: 20 };
    deck = shuffle([...shuffle([...EVENTS]).slice(0, Math.max(3, 6 - planEvents().length)), ...planEvents()]);
    step = 0;
    $("#g-plan").classList.add("hidden");
    $("#g-live").classList.remove("hidden");
    $("#g-log").innerHTML = "";
    renderStats();
    showEvent();
  });

  const finish = () => {
    setWeek(4);
    const interest = S.debt * 0.24 / 12;
    const saved = S.ef + cat("invest");
    const checks = [
      { ok: S.debt === 0, pts: 35, text: S.debt === 0 ? "No credit card debt" : `${money(S.debt)} on the card, costing about $${interest.toFixed(2)} in interest next month` },
      { ok: S.ef > 0, pts: 20, text: S.ef > 0 ? `Emergency fund survived with ${money(S.ef)}` : "Emergency fund drained to zero" },
      { ok: saved >= INCOME * 0.2, pts: 25, text: `Saved ${money(saved)}, ${Math.round((saved / INCOME) * 100)}% of your pay (target 20%)` },
      { ok: S.happy >= 50, pts: 10, text: `Happiness ${S.happy} out of 100` },
      { ok: S.stress <= 50, pts: 10, text: `Stress ${S.stress} out of 100` },
    ];
    const score = checks.reduce((n, c) => n + (c.ok ? c.pts : 0), 0);
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";
    const tip =
      S.debt > 0 ? "Surprises landed on the card. Next month, move some wants money into the emergency fund before anything happens."
      : S.ef === 0 ? "You stayed out of debt, but only just. A bigger emergency fund gives you room to breathe."
      : S.happy < 50 ? "Your money held up but you were miserable. Budgets that cut all the fun usually break. Give wants a little more room."
      : "That's a budget doing its job. The surprises came out of money you'd already set aside.";

    $("#g-live").classList.add("hidden");
    const r = $("#g-result");
    r.classList.remove("hidden");
    r.innerHTML = `
      <div style="display:flex;gap:32px;align-items:center;flex-wrap:wrap">
        <div class="grade ${score >= 75 ? "c-good" : score >= 45 ? "" : "c-danger"}">${grade}</div>
        <div style="flex:1;min-width:240px"><h3 style="margin:0 0 6px">Month complete · ${score} points</h3><p class="muted" style="margin:0">${tip}</p></div>
      </div>
      <ul class="checks">${checks.map((c) => `<li class="${c.ok ? "" : "no"}">${c.text}</li>`).join("")}</ul>
      <button class="btn" id="g-again">Plan another month <span class="arrow">→</span></button>`;
    $("#g-again").addEventListener("click", () => {
      r.classList.add("hidden");
      $("#g-plan").classList.remove("hidden");
      $$("#g-rows input").forEach((i, n) => (i.disabled = !!CATS[n].locked));
      $$("#week-strip span").forEach((s) => s.classList.remove("now", "past"));
      renderPlan();
      $("#play").scrollIntoView();
    });

    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    if (first || score > l.gameBest) l.gameBest = score;
    const c = FH.state.character;
    FH.updateCharacter({
      emergencyFund: c.emergencyFund + S.ef,
      investments: c.investments + cat("invest"),
      creditCardDebt: c.creditCardDebt + S.debt,
    });
    FH.addXP(first ? 50 : 15, first ? "Survived your first month" : "Another month down");
    if (grade === "A") FH.badge("month-survivor-a", "Month Survivor: A");
  };

  // ---------- Notes: fill in the blanks ----------
  $("#blanks-check").addEventListener("click", () => {
    const blanks = $$("#blanks .blank");
    let right = 0;
    blanks.forEach((b) => {
      const ok = b.dataset.answer.split("|").includes(b.value.trim().toLowerCase().replace(/[$,]/g, ""));
      b.classList.toggle("right", ok);
      b.classList.toggle("wrong", !ok);
      if (ok) right++;
    });
    $("#blanks-result").textContent = `${right} of ${blanks.length} right`;
    if (right === blanks.length) FH.badge("blanks-budgeting", "Note Taker");
  });

  // ---------- On your own: reflections stay on this device ----------
  $$("[data-reflect]").forEach((t) => {
    const key = `fh-reflect-${LESSON}-${t.dataset.reflect}`;
    try { t.value = localStorage.getItem(key) || ""; } catch (e) { /* storage blocked */ }
    t.addEventListener("input", () => {
      try { localStorage.setItem(key, t.value); $("#reflect-saved").textContent = "Saved on this device."; } catch (e) { /* storage blocked */ }
    });
  });

  // ---------- Check: quiz ----------
  const QUIZ = [
    { q: "Maria takes home $3,200 a month. Under the 50/30/20 rule, what's the most she should plan to spend on wants?",
      opts: ["$640", "$960", "$1,600", "$1,280"], a: 1,
      why: "Wants are 30% of take-home pay: 0.30 × $3,200 = $960. $640 is the 20% savings target and $1,600 is the 50% needs target." },
    { q: "Dev earns $2,800 and has planned $2,650 in a zero-based budget. What should Dev do next?",
      opts: ["Nothing. $150 left over is a cushion", "Give the remaining $150 a job, such as savings", "Cut $150 from needs", "Earn $150 more"], a: 1,
      why: "Zero-based means income − planned categories = $0. A cushion is fine, but it has to be named as savings, not left unassigned." },
    { q: "Which of these is a need under the 50/30/20 framework?",
      opts: ["A streaming subscription", "The minimum payment on a student loan", "Concert tickets", "Upgrading a phone that still works"], a: 1,
      why: "Minimum debt payments are required, and missing them damages your credit. Payments above the minimum count as savings." },
    { q: "The 50/30/20 rule is applied to which number?",
      opts: ["Gross salary", "After-tax (take-home) pay", "Net worth", "Pay before retirement contributions and taxes"], a: 1,
      why: "It's applied to after-tax income, the money that actually reaches your account. Taxes are gone before you can budget them." },
    { q: "You put a $250 surprise bill on a card at 24% APR and carry it for 3 months. Using simple interest, about how much interest do you pay?",
      opts: ["$6", "$15", "$60", "$24"], a: 1,
      why: "Interest ≈ principal × rate × time = 250 × 0.24 × (3 ÷ 12) = $15. Real cards compound daily, so it's a bit more. That's Unit 5." },
    { q: "Why does an emergency fund usually lower your long-run costs?",
      opts: ["It earns more than stocks", "It covers surprises without borrowing at high interest", "It lowers your taxes", "It raises your credit score"], a: 1,
      why: "Its job isn't returns. It's avoiding high-interest debt when surprises hit. Credit scores can't see your savings balance at all." },
    { q: "A company budgeted $10,000 for marketing this quarter and spent $12,500. How would an FP&A analyst describe it?",
      opts: ["$2,500 favorable variance", "$2,500 unfavorable variance", "25% favorable variance", "No variance"], a: 1,
      why: "Variance = actual − budget = $2,500. Spending more than planned is unfavorable. You'll do this for your own company in Unit 10." },
  ];
  const quizEl = $("#quiz");
  let correct = 0, answered = 0;
  QUIZ.forEach((item, qi) => {
    const div = document.createElement("div");
    div.className = "question reveal in";
    div.innerHTML = `<div class="stem"><small>Question ${qi + 1} of ${QUIZ.length}</small>${item.q}</div><div class="opts"></div><div class="why"></div>`;
    // Shuffle the options so the right answer isn't always in the same spot.
    const order = shuffle(item.opts.map((_, i) => i));
    const answerPos = order.indexOf(item.a);
    order.forEach((oi, pos) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = `<span class="letter">${"ABCD"[pos]}</span><span>${item.opts[oi]}</span>`;
      b.addEventListener("click", () => {
        if (div.classList.contains("answered")) return;
        div.classList.add("answered");
        const ok = pos === answerPos;
        b.classList.add(ok ? "right" : "wrong");
        $$(".opt", div)[answerPos].classList.add("right");
        $(".why", div).textContent = (ok ? "Right. " : "Not quite. ") + item.why;
        answered++;
        if (ok) { correct++; FH.addXP(10, "Correct"); }
        if (answered === QUIZ.length) {
          const l = FH.lesson(LESSON);
          l.quizBest = Math.max(l.quizBest, correct);
          if (correct === QUIZ.length) FH.badge("quiz-budgeting-perfect", "Perfect Quiz: Budgeting");
          if (!l.completedAt) { l.completedAt = new Date().toISOString(); FH.addXP(25, "Lesson complete"); }
          FH.save();
          const done = document.createElement("div");
          done.className = "quiz-score";
          done.textContent = `${correct} of ${QUIZ.length}. ${correct >= 6 ? "You're ready for the next lesson." : "Look back at Break it down, then reload to try again."}`;
          quizEl.appendChild(done);
        }
      });
      $(".opts", div).appendChild(b);
    });
    quizEl.appendChild(div);
  });

  applyStyle();
  renderProgress();
})();
