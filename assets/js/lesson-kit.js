// Shared lesson behavior: progress rail, learning-style picker, narration player,
// fill-in-the-blanks, private reflections and the exam-style quiz.
// Each lesson calls FHLesson.init({ id, title, quiz }) after its own lesson.js setup.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fillRange = (r) => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

  function init({ id, short, quiz = [], passMark }) {
    const chapters = $$("main .chapter");
    const slug = short || id;

    // ---------- XP, rail and learning style ----------
    const renderProgress = () => {
      const xp = $("#xp"); if (xp) xp.textContent = FH.state.xp;
      const seen = FH.lesson(id).sections;
      $$(".rail a").forEach((a) => a.classList.toggle("seen", !!seen[a.getAttribute("href").slice(1)]));
    };
    document.addEventListener("fh:save", renderProgress);

    // ---------- Learning-style filter ----------
    // Chapters outside the learner's picked styles fold down to one line; "Show anyway" opens them.
    const opened = new Set();
    chapters.forEach((c) => {
      if (!c.dataset.style) return;
      const k = c.querySelector(".kicker");
      const b = document.createElement("button");
      b.className = "unfold";
      b.type = "button";
      b.textContent = "Show anyway";
      b.addEventListener("click", () => { opened.add(c.id); applyStyle(); });
      k.appendChild(b);
    });
    const applyStyle = () => {
      const picks = FH.styles;
      chapters.forEach((c) => {
        const st = c.dataset.style;
        const mine = !!picks && !!st && picks.includes(st);
        c.classList.toggle("is-preferred", mine);
        c.classList.toggle("is-folded", !!picks && !!st && !mine && !opened.has(c.id));
      });
      $$(".rail a").forEach((a) => {
        const st = a.dataset.style;
        a.classList.toggle("pref", !!picks && !!st && picks.includes(st));
        a.classList.toggle("folded", !!picks && !!st && !picks.includes(st) && !opened.has(a.getAttribute("href").slice(1)));
      });
      renderFilter();
    };
    $$(".rail a").forEach((a) => a.addEventListener("click", () => {
      const id = a.getAttribute("href").slice(1);
      if (a.classList.contains("folded")) { opened.add(id); applyStyle(); }
    }));

    const filter = document.createElement("div");
    filter.className = "style-filter";
    filter.innerHTML = `<button class="sf-toggle" type="button" aria-expanded="false" aria-controls="sf-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span></span></button>
      <div class="sf-panel" id="sf-panel" hidden>
        <b>How you learn best</b>
        <p>Your picks stay open. The rest fold down so you can skip them.</p>
        <div class="sf-opts">${FH.STYLES.map((x) => `<label><input type="checkbox" value="${x.id}"><span>${x.label}<small>${x.chapter}</small></span></label>`).join("")}</div>
        <button class="btn sm line sf-all" type="button">Show every part</button>
      </div>`;
    document.body.appendChild(filter);
    const toggle = $(".sf-toggle", filter), panel = $(".sf-panel", filter);
    const renderFilter = () => {
      const picks = FH.styles;
      $("span", toggle).textContent = picks ? `Your styles · ${picks.length} of 8` : "All learning styles";
      $$("input", filter).forEach((i) => { i.checked = !picks || picks.includes(i.value); });
    };
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
    });
    document.addEventListener("click", (e) => { if (!filter.contains(e.target) && !panel.hidden) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); } });
    $$("input", filter).forEach((i) => i.addEventListener("change", () => {
      const list = $$("input", filter).filter((x) => x.checked).map((x) => x.value);
      FH.setStyles(list);
      opened.clear();
      applyStyle();
    }));
    $(".sf-all", filter).addEventListener("click", () => { FH.setStyles(null); opened.clear(); applyStyle(); });

    const seenIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting && FH.markSection(id, e.target.id)) FH.addXP(5); }),
      { threshold: 0.3 }
    );
    chapters.forEach((c) => seenIO.observe(c));

    // ---------- Hear it: recorded narration ----------
    const audio = $("#narration");
    if (audio) {
      const playBtn = $("#play-btn"), player = $("#player"), transcript = $("#transcript");
      for (let i = 0; i < 32; i++) {
        const bar = document.createElement("i");
        bar.style.animationDelay = `${(i * 137) % 900}ms`;
        bar.style.height = `${20 + ((i * 53) % 60)}%`;
        $("#wave").appendChild(bar);
      }
      let lines = [], current = -1, playing = false;
      const setPlaying = (on) => { playing = on; playBtn.classList.toggle("playing", on); player.classList.toggle("on", on); };
      const playLine = (i) => {
        if (i >= lines.length) { setPlaying(false); current = -1; $$("p", transcript).forEach((p) => p.classList.remove("now")); FH.badge(`listened-${slug}`, "Good Listener"); return; }
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
          p.tabIndex = 0;
          p.setAttribute("role", "button");
          p.setAttribute("aria-label", `Play from line ${i + 1}: ${t}`);
          p.addEventListener("click", () => playLine(i));
          p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playLine(i); } });
          transcript.appendChild(p);
        });
      }).catch(() => { transcript.innerHTML = "<p>The narration couldn't load. Try refreshing the page.</p>"; });
    }

    // ---------- Notes: fill in the blanks ----------
    const blanksBtn = $("#blanks-check");
    if (blanksBtn) blanksBtn.addEventListener("click", () => {
      const blanks = $$("#blanks .blank");
      let right = 0;
      blanks.forEach((b) => {
        const ok = b.dataset.answer.split("|").includes(b.value.trim().toLowerCase().replace(/[$,%]/g, ""));
        b.classList.toggle("right", ok);
        b.classList.toggle("wrong", !ok);
        if (ok) right++;
      });
      $("#blanks-result").textContent = `${right} of ${blanks.length} right`;
      if (right === blanks.length) FH.badge(`blanks-${slug}`, "Note Taker");
    });

    // ---------- On your own: reflections stay on this device ----------
    $$("[data-reflect]").forEach((t) => {
      const key = `fh-reflect-${id}-${t.dataset.reflect}`;
      try { t.value = localStorage.getItem(key) || ""; } catch (e) { /* storage blocked */ }
      t.addEventListener("input", () => {
        try { localStorage.setItem(key, t.value); $("#reflect-saved").textContent = "Saved on this device."; } catch (e) { /* storage blocked */ }
      });
    });

    // ---------- Check: quiz ----------
    const quizEl = $("#quiz");
    if (quizEl && quiz.length) {
      const pass = passMark || Math.ceil(quiz.length * 0.8);
      let correct = 0, answered = 0;
      quiz.forEach((item, qi) => {
        const div = document.createElement("div");
        div.className = "question reveal in";
        div.innerHTML = `<div class="stem"><small>Question ${qi + 1} of ${quiz.length}</small>${item.q}</div><div class="opts"></div><div class="why"></div>`;
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
            if (answered === quiz.length) {
              const l = FH.lesson(id);
              l.quizBest = Math.max(l.quizBest, correct);
              if (correct === quiz.length) FH.badge(`quiz-${slug}-perfect`, "Perfect Quiz");
              if (!l.completedAt) { l.completedAt = new Date().toISOString(); FH.addXP(25, "Lesson complete"); }
              FH.save();
              const done = document.createElement("div");
              done.className = "quiz-score";
              done.textContent = `${correct} of ${quiz.length}. ${correct >= pass ? "You're ready for the next lesson." : "Look back at Break it down, then reload to try again."}`;
              quizEl.appendChild(done);
            }
          });
          $(".opts", div).appendChild(b);
        });
        quizEl.appendChild(div);
      });
    }

    applyStyle();
    renderProgress();
  }

  window.FHLesson = { init, shuffle, fillRange, $, $$, wait: (ms) => new Promise((r) => setTimeout(r, ms)) };
})();
