// FinanceHub save file: one record for the learner's character, company and progress.
// Always kept in this browser; auth.js also syncs it to the learner's account when signed in.
(function () {
  const KEY = "financehub-save-v1";

  const fresh = () => ({
    version: 1,
    xp: 0,
    badges: [],
    preferredStyle: null,
    styles: null, // learning styles the learner picked; null means show everything
    character: {
      name: "You",
      age: 18,
      monthlyTakeHome: 2400,
      checking: 300,
      emergencyFund: 0,
      investments: 0,
      creditCardDebt: 0,
    },
    company: null, // created in Unit 9
    lessons: {}, // lessonId -> { sections: {id: true}, quizBest, gameBest, completedAt }
    updatedAt: null,
  });

  let state;
  try {
    state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {
    state = fresh();
  }

  const persist = () => {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  };

  const lesson = (id) => (state.lessons[id] ||= { sections: {}, quizBest: 0, gameBest: null });

  let toastEl;
  const toast = (msg) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  };

  // The eight ways every lesson teaches. `chapter` is the lesson section each one maps to.
  const STYLES = [
    { id: "visual", label: "Seeing", chapter: "See it", desc: "Diagrams and charts you can drag and poke" },
    { id: "auditory", label: "Listening", chapter: "Hear it", desc: "A short narrated walkthrough" },
    { id: "kinesthetic", label: "Doing", chapter: "Play it", desc: "A game where you make the calls" },
    { id: "logical", label: "Working out the logic", chapter: "Break it down", desc: "Formulas and step-by-step examples" },
    { id: "naturalistic", label: "Linking it to nature", chapter: "Nature link", desc: "The idea as a living system" },
    { id: "reading", label: "Reading and writing", chapter: "Notes", desc: "Notes to copy and blanks to fill" },
    { id: "social", label: "Talking it through", chapter: "Together", desc: "Debates and challenges with friends" },
    { id: "solitary", label: "Thinking on my own", chapter: "On your own", desc: "Private questions about your own life" },
  ];

  const emit = () => document.dispatchEvent(new CustomEvent("fh:save", { detail: state }));

  window.FH = {
    get state() { return state; },
    lesson,
    addXP(n, why) {
      state.xp += n;
      persist();
      emit();
      if (why) toast(`+${n} XP · ${why}`);
    },
    badge(id, label) {
      if (state.badges.includes(id)) return;
      state.badges.push(id);
      persist();
      emit();
      toast(`Badge unlocked: ${label}`);
    },
    markSection(lessonId, sectionId) {
      const l = lesson(lessonId);
      if (l.sections[sectionId]) return false;
      l.sections[sectionId] = true;
      persist();
      emit();
      return true;
    },
    setPreferredStyle(style) {
      state.preferredStyle = style;
      persist();
      emit();
    },
    // Picked learning styles (ids from FH.STYLES). An empty or full list means "show everything".
    get styles() {
      const s = state.styles || (state.preferredStyle ? [state.preferredStyle] : null);
      return s && s.length && s.length < STYLES.length ? s : null;
    },
    setStyles(list) {
      state.styles = list && list.length ? [...new Set(list)] : null;
      persist();
      emit();
    },
    STYLES,
    updateCharacter(patch) {
      Object.assign(state.character, patch);
      persist();
      emit();
    },
    save() { persist(); emit(); },
    // Swap in a save that came from the learner's account.
    replace(next) {
      state = Object.assign(fresh(), next);
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
      document.dispatchEvent(new CustomEvent("fh:save", { detail: state, bubbles: false }));
    },
    reset() { state = fresh(); persist(); emit(); },
    toast,
    money: (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"),
  };
})();
