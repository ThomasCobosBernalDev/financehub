// Unit 4, Lesson 1: Budgeting frameworks
(function () {
  const LESSON = "u4-budgeting-frameworks";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = FH.money;
  const SECTIONS = $$("main .section").map((s) => s.id);

  // ---------- XP, progress and the style navigator ----------
  const renderXP = () => {
    $("#xp").textContent = FH.state.xp;
    const seen = FH.lesson(LESSON).sections;
    const done = SECTIONS.filter((id) => seen[id]).length;
    $("#lesson-progress").style.width = `${(done / SECTIONS.length) * 100}%`;
    $$("#style-chips .chip").forEach((c) => c.classList.toggle("done", !!seen[c.dataset.target]));
  };
  document.addEventListener("fh:save", renderXP);

  $$("#style-chips .chip").forEach((chip) =>
    chip.addEventListener("click", () => document.getElementById(chip.dataset.target).scrollIntoView())
  );

  const applyStyle = () => {
    const pref = FH.state.preferredStyle;
    $$("main .section").forEach((s) => s.classList.toggle("is-preferred", !!pref && s.dataset.style === pref));
    $$("#style-chips .chip").forEach((c) => c.classList.toggle("preferred", !!pref && c.dataset.style === pref));
    $$("#style-picker .chip").forEach((c) => c.classList.toggle("preferred", c.dataset.pick === pref));
  };
  $$("#style-picker .chip").forEach((c) =>
    c.addEventListener("click", () => {
      FH.setPreferredStyle(c.dataset.pick);
      applyStyle();
      const target = $(`main .section[data-style="${c.dataset.pick}"]`);
      FH.toast("Saved. Your style is flagged in every lesson.");
      if (target) setTimeout(() => target.scrollIntoView(), 400);
    })
  );

  // A section counts as visited once most of it has been on screen.
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting && FH.markSection(LESSON, e.target.id)) FH.addXP(5);
      }),
    { threshold: 0.35 }
  );
  $$("main .section").forEach((s) => io.observe(s));

  // ---------- See it: live 50/30/20 ----------
  const slider = $("#pay-slider");
  const renderSplit = () => {
    const pay = +slider.value;
    $("#pay-label").textContent = money(pay);
    $("#amt-needs").textContent = money(pay * 0.5);
    $("#amt-wants").textContent = money(pay * 0.3);
    $("#amt-savings").textContent = money(pay * 0.2);
    $("#bar-needs").textContent = `Needs ${money(pay * 0.5)}`;
    $("#bar-wants").textContent = `Wants ${money(pay * 0.3)}`;
    $("#bar-savings").textContent = `Savings ${money(pay * 0.2)}`;
  };
  slider.addEventListener("input", renderSplit);
  renderSplit();

  // ---------- See it: every dollar gets a job ----------
  const grid = $("#dollar-grid");
  const squares = Array.from({ length: 100 }, () => grid.appendChild(document.createElement("span")));
  const given = { needs: 0, wants: 0, savings: 0 };
  const colors = { needs: "var(--needs)", wants: "var(--wants)", savings: "var(--savings)" };
  const renderGrid = () => {
    let i = 0;
    for (const k of ["needs", "wants", "savings"]) {
      for (let n = 0; n < given[k]; n++) squares[i++].style.background = colors[k];
    }
    for (; i < 100; i++) squares[i].style.background = "";
    const left = 100 - given.needs - given.wants - given.savings;
    const status = $("#grid-status");
    if (left > 0) {
      status.textContent = `${left}% unassigned. Every grey square is money with no plan.`;
    } else if (given.needs === 50 && given.wants === 30 && given.savings === 20) {
      status.innerHTML = "<b class='c-good'>Zero left, and it's exactly 50/30/20.</b> Every dollar has a job.";
      FH.badge("dollar-grid", "Every Dollar Has a Job");
    } else {
      status.innerHTML = `<b class='c-good'>Zero left.</b> Your split is ${given.needs}/${given.wants}/${given.savings}. That's a valid zero-based budget even though it isn't 50/30/20.`;
    }
  };
  $$("[data-give]").forEach((b) =>
    b.addEventListener("click", () => {
      const left = 100 - given.needs - given.wants - given.savings;
      if (left <= 0) { grid.classList.remove("shake"); void grid.offsetWidth; grid.classList.add("shake"); return; }
      given[b.dataset.give] += Math.min(5, left);
      renderGrid();
    })
  );
  $("#grid-reset").addEventListener("click", () => { given.needs = given.wants = given.savings = 0; renderGrid(); });
  renderGrid();

  // ---------- Hear it: narration ----------
  const lines = $$("#script p");
  let speaking = false;
  const stopSpeech = () => {
    speaking = false;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    lines.forEach((p) => p.classList.remove("speaking"));
    $("#speak-play").textContent = "▶ Play";
  };
  const speakFrom = (i) => {
    if (!speaking || i >= lines.length) {
      if (i >= lines.length) FH.badge("listened-budgeting", "Good Listener");
      return stopSpeech();
    }
    lines.forEach((p) => p.classList.remove("speaking"));
    lines[i].classList.add("speaking");
    lines[i].scrollIntoView({ block: "nearest" });
    const u = new SpeechSynthesisUtterance(lines[i].textContent);
    u.rate = +$("#speak-rate").value;
    u.onend = () => speakFrom(i + 1);
    speechSynthesis.speak(u);
  };
  if (!("speechSynthesis" in window)) {
    $("#speak-unsupported").classList.remove("hidden");
    $("#speak-play").disabled = true;
  }
  $("#speak-play").addEventListener("click", () => {
    if (speaking) return stopSpeech();
    speaking = true;
    $("#speak-play").textContent = "⏸ Stop";
    speakFrom(0);
  });
  $("#speak-stop").addEventListener("click", stopSpeech);
  lines.forEach((p, i) =>
    p.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      speaking = true;
      $("#speak-play").textContent = "⏸ Stop";
      speakFrom(i);
    })
  );

  // ---------- Play it: Month Survivor ----------
  const INCOME = 2400;
  const CATS = [
    { id: "rent", label: "Rent", kind: "needs", value: 900, locked: true, hint: "Locked by your lease." },
    { id: "groceries", label: "Groceries", kind: "needs", value: 0, hint: "Under about $250 and you'll run short before the month ends." },
    { id: "transport", label: "Transport", kind: "needs", value: 0, hint: "Bus pass is $100. Less than that and you'll be scrambling for rides." },
    { id: "phone", label: "Phone", kind: "needs", value: 0, hint: "Your plan is $50." },
    { id: "fun", label: "Fun and eating out", kind: "wants", value: 0, hint: "Too little and you'll be tempted to blow the budget." },
    { id: "subs", label: "Subscriptions", kind: "wants", value: 0, hint: "Streaming, games, music." },
    { id: "ef", label: "Emergency fund", kind: "savings", value: 0, hint: "Pays for surprises so they don't land on a credit card." },
    { id: "invest", label: "Investing", kind: "savings", value: 0, hint: "Money that grows for future you (Unit 7)." },
  ];
  const KIND_COLOR = { needs: "var(--needs)", wants: "var(--wants)", savings: "var(--savings)" };

  const rows = $("#g-rows");
  CATS.forEach((c) => {
    const row = document.createElement("div");
    row.className = "alloc-row";
    row.innerHTML = `
      <label for="cat-${c.id}">${c.label} <span class="kind" style="background:${KIND_COLOR[c.kind]}">${c.kind}</span></label>
      <input type="number" id="cat-${c.id}" min="0" step="10" value="${c.value}" ${c.locked ? "disabled" : ""}>
      <div class="hint">${c.hint}</div>`;
    rows.appendChild(row);
    const input = row.querySelector("input");
    input.addEventListener("input", () => {
      c.value = Math.max(0, Math.round(+input.value || 0));
      renderPlan();
    });
  });

  const totals = () => {
    const t = { needs: 0, wants: 0, savings: 0 };
    CATS.forEach((c) => (t[c.kind] += c.value));
    return t;
  };
  const cat = (id) => CATS.find((c) => c.id === id).value;

  const renderPlan = () => {
    const t = totals();
    const sum = t.needs + t.wants + t.savings;
    const left = INCOME - sum;
    const el = $("#g-left");
    el.textContent = money(left);
    el.className = "left-to-assign " + (left === 0 ? "c-good" : left < 0 ? "c-danger" : "");
    const pct = (n) => Math.max(0, (n / Math.max(INCOME, sum)) * 100);
    $("#g-bar-needs").style.width = pct(t.needs) + "%";
    $("#g-bar-wants").style.width = pct(t.wants) + "%";
    $("#g-bar-savings").style.width = pct(t.savings) + "%";
    const p = (n) => Math.round((n / INCOME) * 100);
    $("#g-split").textContent =
      `Your split: ${p(t.needs)}% needs · ${p(t.wants)}% wants · ${p(t.savings)}% savings (target 50/30/20). ` +
      (left > 0 ? `Assign ${money(left)} more to start.` : left < 0 ? `You're ${money(-left)} over. Cut something.` : "Every dollar has a job. Ready.");
    $("#g-start").disabled = left !== 0;
  };
  renderPlan();

  // Month simulation state
  let S, week, deck;
  const EVENTS = [
    {
      emoji: "🚲", title: "Your bike chain snaps", text: "A repair costs $140. Without it you're walking 40 minutes to work.",
      choices: [
        { label: "Pay from emergency fund", run: () => pay(140, "ef", "Fixed the bike from the emergency fund.") },
        { label: "Put it on the credit card", run: () => card(140, "Bike repair on the card.") },
        { label: "Walk for a while", run: () => { S.stress += 15; S.happy -= 5; log("Walking to work. Tiring, but free."); } },
      ],
    },
    {
      emoji: "🎂", title: "Best friend's birthday dinner", text: "Everyone's going to a nice place. Your share would be about $60.",
      choices: [
        { label: "Go, pay from fun money", run: () => { pay(60, "fun", "Great night out."); S.happy += 10; } },
        { label: "Suggest a cheaper hangout ($15)", run: () => { pay(15, "fun", "Cheaper hangout, still fun."); S.happy += 6; } },
        { label: "Skip it", run: () => { S.happy -= 12; log("Skipped the dinner. Saved money, felt left out."); } },
      ],
    },
    {
      emoji: "⏰", title: "Your manager offers overtime", text: "One extra shift would add $110 after taxes.",
      choices: [
        { label: "Take it and save it", run: () => { S.ef += 110; S.stress += 8; log("Overtime +$110 straight to the emergency fund."); } },
        { label: "Take it and spend it", run: () => { S.fun += 110; S.stress += 8; log("Overtime +$110 added to fun money."); } },
        { label: "Turn it down and rest", run: () => { S.stress -= 6; log("Turned down overtime. Rested up."); } },
      ],
    },
    {
      emoji: "🩺", title: "Doctor visit", text: "A bad sore throat. The copay and prescription come to $75.",
      choices: [
        { label: "Pay from emergency fund", run: () => pay(75, "ef", "Doctor paid from the emergency fund.") },
        { label: "Put it on the credit card", run: () => card(75, "Doctor visit on the card.") },
      ],
    },
    {
      emoji: "👟", title: "Sneakers, 40% off", text: "The pair you've wanted is $120 today only.",
      choices: [
        { label: "Buy with fun money", run: () => { pay(120, "fun", "New sneakers."); S.happy += 8; } },
        { label: "Buy on the credit card", run: () => { card(120, "Sneakers on the card."); S.happy += 8; } },
        { label: "Pass", run: () => { S.happy -= 3; log("Passed on the sneakers."); } },
      ],
    },
    {
      emoji: "📱", title: "Cracked phone screen", text: "Repair costs $160. You can still use it, barely.",
      choices: [
        { label: "Pay from emergency fund", run: () => pay(160, "ef", "Screen fixed from the emergency fund.") },
        { label: "Put it on the credit card", run: () => card(160, "Screen repair on the card.") },
        { label: "Live with the crack", run: () => { S.stress += 6; S.happy -= 4; log("Living with a cracked screen."); } },
      ],
    },
    {
      emoji: "💸", title: "Surprise refund", text: "An overcharge from last month is refunded: $40.",
      choices: [
        { label: "Add to emergency fund", run: () => { S.ef += 40; log("+$40 to the emergency fund."); } },
        { label: "Add to fun money", run: () => { S.fun += 40; log("+$40 to fun money."); } },
      ],
    },
    {
      emoji: "💡", title: "Electric bill came in high", text: "A cold snap means you owe $45 more than usual.",
      choices: [
        { label: "Pay from emergency fund", run: () => pay(45, "ef", "Extra electric bill from the emergency fund.") },
        { label: "Pay from fun money", run: () => pay(45, "fun", "Extra electric bill from fun money.") },
        { label: "Put it on the credit card", run: () => card(45, "Electric bill on the card.") },
      ],
    },
  ];

  const log = (msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    $("#g-log").prepend(li);
  };
  // Pay from a bucket; anything it can't cover goes on the card.
  const pay = (amt, bucket, msg) => {
    const from = Math.min(S[bucket], amt);
    S[bucket] -= from;
    if (amt > from) {
      card(amt - from, `${msg} ${bucket === "ef" ? "Emergency fund" : "Fun money"} ran out, so ${money(amt - from)} went on the card.`);
    } else log(msg);
  };
  const card = (amt, msg) => {
    S.debt += amt;
    S.stress += 6;
    log(`${msg} (+${money(amt)} debt at 24% APR)`);
  };

  const clamp = () => {
    S.happy = Math.max(0, Math.min(100, S.happy));
    S.stress = Math.max(0, Math.min(100, S.stress));
  };
  const renderStats = () => {
    clamp();
    $("#s-ef").textContent = money(S.ef);
    $("#s-fun").textContent = money(S.fun);
    $("#s-debt").textContent = money(S.debt);
    $("#s-debt").className = S.debt > 0 ? "c-danger" : "";
    $("#s-happy").textContent = S.happy;
    $("#s-stress").textContent = S.stress;
    $("#m-happy").style.width = S.happy + "%";
    $("#m-stress").style.width = S.stress + "%";
  };

  // Consequences of the plan itself, injected on fixed weeks.
  const planEvents = () => {
    const out = [];
    if (cat("groceries") < 250) {
      const short = 250 - cat("groceries");
      out.push({
        emoji: "🛒", title: "The fridge is empty", text: `Your grocery budget ran out with days to go. You need about ${money(short)} more food.`,
        choices: [
          { label: "Pay from fun money", run: () => pay(short, "fun", "Bought groceries with fun money.") },
          { label: "Pay from emergency fund", run: () => pay(short, "ef", "Bought groceries from the emergency fund.") },
          { label: "Order takeout on the card", run: () => card(Math.round(short * 1.6), "Takeout on the card costs more than groceries.") },
        ],
      });
    }
    if (cat("transport") < 100) {
      const short = 100 - cat("transport");
      out.push({
        emoji: "🚌", title: "Bus pass short", text: `You can't afford the monthly pass. Single rides will cost ${money(short + 20)} more.`,
        choices: [
          { label: "Pay from fun money", run: () => pay(short + 20, "fun", "Paid for bus rides from fun money.") },
          { label: "Pay from emergency fund", run: () => pay(short + 20, "ef", "Paid for bus rides from the emergency fund.") },
          { label: "Put it on the credit card", run: () => card(short + 20, "Bus rides on the card.") },
        ],
      });
    }
    if (cat("phone") < 50) {
      out.push({
        emoji: "📵", title: "Phone bill overdue", text: `You budgeted ${money(cat("phone"))} but the bill is $50, plus a $15 late fee.`,
        choices: [
          { label: "Pay from emergency fund", run: () => pay(65 - cat("phone"), "ef", "Paid the phone bill and late fee.") },
          { label: "Put it on the credit card", run: () => card(65 - cat("phone"), "Phone bill on the card.") },
        ],
      });
    }
    if (cat("fun") < 80) {
      out.push({
        emoji: "🛍️", title: "Burnout splurge", text: "With almost no fun money, a rough week ends with you wanting to blow $90 on stuff.",
        choices: [
          { label: "Splurge on the card", run: () => { card(90, "Splurged on the card."); S.happy += 10; } },
          { label: "Free night in with friends", run: () => { S.happy += 4; S.stress -= 4; log("Free night in. Not bad."); } },
        ],
      });
    }
    return out;
  };

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const showWeek = () => {
    if (week >= deck.length) return finish();
    const ev = deck[week];
    const box = $("#g-event");
    box.innerHTML = `
      <div class="event">
        <div class="week">Week ${Math.floor((week * 4) / deck.length) + 1} of 4 · event ${week + 1} of ${deck.length}</div>
        <div style="display:flex;gap:14px;align-items:center;margin:8px 0">
          <div class="emoji" aria-hidden="true">${ev.emoji}</div>
          <div><h3 style="margin:0">${ev.title}</h3><div class="muted">${ev.text}</div></div>
        </div>
        <div class="choices"></div>
      </div>`;
    const wrap = $(".choices", box);
    ev.choices.forEach((ch) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = ch.label;
      b.addEventListener("click", () => { ch.run(); renderStats(); week++; showWeek(); });
      wrap.appendChild(b);
    });
  };

  $("#g-start").addEventListener("click", () => {
    S = { ef: cat("ef"), fun: cat("fun"), debt: 0, happy: 70, stress: 20 };
    if (cat("subs") > 60) { S.happy += 4; }
    const forced = planEvents();
    const random = shuffle([...EVENTS]).slice(0, Math.max(3, 6 - forced.length));
    deck = shuffle([...random, ...forced]);
    week = 0;
    $("#g-plan").classList.add("hidden");
    $("#g-live").classList.remove("hidden");
    $("#g-result").classList.add("hidden");
    $("#g-log").innerHTML = "";
    renderStats();
    showWeek();
    $("#play").scrollIntoView();
  });

  const finish = () => {
    // A month of interest on any card balance.
    const interest = Math.round(S.debt * 0.24 / 12 * 100) / 100;
    const saved = S.ef + cat("invest");
    const checks = [
      { ok: S.debt === 0, pts: 35, text: S.debt === 0 ? "Finished with no credit card debt" : `Ended with ${money(S.debt)} on the card, about $${interest.toFixed(2)} in interest next month and growing` },
      { ok: S.ef > 0, pts: 20, text: S.ef > 0 ? `Emergency fund survived with ${money(S.ef)}` : "Emergency fund was drained" },
      { ok: saved >= INCOME * 0.2, pts: 25, text: `Saved ${money(saved)} (${Math.round((saved / INCOME) * 100)}% of pay; target 20%)` },
      { ok: S.happy >= 50, pts: 10, text: `Happiness ${S.happy}/100` },
      { ok: S.stress <= 50, pts: 10, text: `Stress ${S.stress}/100` },
    ];
    const score = checks.reduce((n, c) => n + (c.ok ? c.pts : 0), 0);
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";
    const tip =
      S.debt > 0 ? "Surprises landed on the card. Next time, move money from wants into the emergency fund before the month starts."
      : S.ef === 0 ? "You stayed out of debt, but only just. A bigger emergency fund gives you room."
      : S.happy < 50 ? "Your money held up, but you weren't happy. Budgets that cut all fun usually break. Give wants a bit more room."
      : "That's how a budget is supposed to work: surprises came out of money you'd already set aside.";

    $("#g-live").classList.add("hidden");
    const r = $("#g-result");
    r.classList.remove("hidden");
    r.innerHTML = `
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
        <div class="grade ${score >= 75 ? "c-good" : score >= 45 ? "" : "c-danger"}">${grade}</div>
        <div><h3 style="margin:0">Month complete · ${score}/100</h3><p class="muted" style="margin:0">${tip}</p></div>
      </div>
      <ul style="margin-top:16px">${checks.map((c) => `<li>${c.ok ? "✅" : "❌"} ${c.text}</li>`).join("")}</ul>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" id="g-again">Plan a new month</button>
      </div>`;
    $("#g-again").addEventListener("click", () => {
      r.classList.add("hidden");
      $("#g-plan").classList.remove("hidden");
      $("#play").scrollIntoView();
    });

    // Carry results into the save file.
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    if (first || score > l.gameBest) l.gameBest = score;
    const c = FH.state.character;
    FH.updateCharacter({
      emergencyFund: c.emergencyFund + S.ef,
      investments: c.investments + cat("invest"),
      creditCardDebt: c.creditCardDebt + S.debt,
    });
    FH.addXP(first ? 50 : 15, first ? "Survived your first month" : "Played another month");
    if (grade === "A") FH.badge("month-survivor-a", "Month Survivor: A grade");
  };

  // ---------- Notes: fill in the blanks ----------
  $("#blanks-check").addEventListener("click", () => {
    let right = 0;
    const blanks = $$("#blanks .blank");
    blanks.forEach((b) => {
      const answers = b.dataset.answer.split("|");
      const v = b.value.trim().toLowerCase().replace(/[$,]/g, "");
      const ok = answers.includes(v);
      b.classList.toggle("right", ok);
      b.classList.toggle("wrong", !ok);
      if (ok) right++;
    });
    $("#blanks-result").textContent = `${right} of ${blanks.length} correct`;
    if (right === blanks.length) FH.badge("blanks-budgeting", "Note Taker");
  });

  // ---------- On your own: reflections stay local ----------
  $$("[data-reflect]").forEach((t) => {
    const key = `fh-reflect-${LESSON}-${t.dataset.reflect}`;
    try { t.value = localStorage.getItem(key) || ""; } catch (e) { /* storage blocked */ }
    t.addEventListener("input", () => {
      try { localStorage.setItem(key, t.value); $("#reflect-saved").textContent = "Saved on this device."; } catch (e) { /* storage blocked */ }
    });
  });

  // ---------- Check: quiz ----------
  const QUIZ = [
    {
      q: "Maria's take-home pay is $3,200 a month. Under the 50/30/20 rule, what is the most she should plan to spend on wants?",
      opts: ["$640", "$960", "$1,600", "$1,280"], a: 1,
      why: "Wants are 30% of take-home pay: 0.30 × $3,200 = $960. $640 is the 20% savings target and $1,600 is the 50% needs target.",
    },
    {
      q: "Under a zero-based budget, Dev earns $2,800 and has planned $2,650. What should Dev do next?",
      opts: ["Nothing, $150 left over is a cushion", "Assign the remaining $150 to a category, such as savings", "Cut $150 from needs", "Increase income by $150"], a: 1,
      why: "Zero-based means income − planned categories = $0. The leftover $150 needs a job. Savings counts, so 'cushion' money should be named as savings, not left unassigned.",
    },
    {
      q: "Which of these is a need under the 50/30/20 framework?",
      opts: ["A streaming subscription", "The minimum payment on a student loan", "Concert tickets", "Upgrading to a newer phone that works the same"], a: 1,
      why: "Minimum debt payments are required, and missing them damages your credit, so they're a need. Payments above the minimum count as savings.",
    },
    {
      q: "The 50/30/20 rule should be applied to which number?",
      opts: ["Gross salary", "After-tax (take-home) pay", "Net worth", "Pay before retirement contributions and taxes"], a: 1,
      why: "The rule is applied to after-tax income, the money that actually reaches your account. Taxes are already gone before you can budget them.",
    },
    {
      q: "You put a $250 surprise bill on a credit card at 24% APR and carry it for 3 months. About how much interest do you pay? (Use simple interest.)",
      opts: ["$6", "$15", "$60", "$24"], a: 1,
      why: "Interest ≈ principal × annual rate × time = 250 × 0.24 × (3 ÷ 12) = $15. In Unit 5 you'll see why real cards charge a bit more than this (daily compounding).",
    },
    {
      q: "Why does an emergency fund usually lower your long-run costs?",
      opts: ["It earns higher returns than stocks", "It lets you pay surprises without borrowing at high interest", "It lowers your taxes", "Banks reward you with a better credit score for having one"], a: 1,
      why: "An emergency fund's job isn't returns. It's to avoid high-interest debt when surprises hit. Credit scores don't see your savings balance at all.",
    },
    {
      q: "A company budgeted $10,000 for marketing this quarter but spent $12,500. How would an FP&A analyst describe this?",
      opts: ["$2,500 favorable variance", "$2,500 unfavorable variance", "25% favorable variance", "No variance, it's within budget"], a: 1,
      why: "Variance = actual − budget = $2,500. Spending more than planned is unfavorable. This is the same budget-vs-actual thinking you'll use for your company in Unit 10.",
    },
  ];
  const quizEl = $("#quiz");
  let correct = 0, answered = 0;
  QUIZ.forEach((item, qi) => {
    const div = document.createElement("div");
    div.className = "q";
    div.innerHTML = `<b>${qi + 1}. ${item.q}</b><div class="opts"></div><div class="why"></div>`;
    // Shuffle the options so the right answer isn't always in the same spot.
    const order = shuffle(item.opts.map((_, i) => i));
    const answerPos = order.indexOf(item.a);
    order.map((i) => item.opts[i]).forEach((o, oi) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.textContent = o;
      b.addEventListener("click", () => {
        if (div.classList.contains("answered")) return;
        div.classList.add("answered");
        b.classList.add(oi === answerPos ? "right" : "wrong");
        $$(".opt", div)[answerPos].classList.add("right");
        $(".why", div).textContent = (oi === answerPos ? "Correct. " : "Not quite. ") + item.why;
        answered++;
        if (oi === answerPos) { correct++; FH.addXP(10, "Correct"); }
        if (answered === QUIZ.length) {
          const l = FH.lesson(LESSON);
          l.quizBest = Math.max(l.quizBest, correct);
          if (correct === QUIZ.length) FH.badge("quiz-budgeting-perfect", "Perfect Quiz: Budgeting");
          if (!l.completedAt) { l.completedAt = new Date().toISOString(); FH.addXP(25, "Lesson complete"); }
          FH.save();
          const done = document.createElement("p");
          done.innerHTML = `<b>You got ${correct} of ${QUIZ.length}.</b> ${correct >= 6 ? "You're ready for the next lesson." : "Look over Break it down and try the quiz again after a reload."}`;
          quizEl.appendChild(done);
        }
      });
      $(".opts", div).appendChild(b);
    });
    quizEl.appendChild(div);
  });

  applyStyle();
  renderXP();
})();
