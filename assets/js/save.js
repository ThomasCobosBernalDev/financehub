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
    profile: null, // from the setup: { goals: [], level, known: {unit: true}, quiz, done, setAt }
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

  // Why people learn here, and the units each goal needs (numbers match the course map).
  const GOALS = [
    { id: "money", label: "Understand how money works", desc: "Budgeting, credit, taxes, insurance and the economy around you", units: [1, 2, 3, 4, 5, 6, 7, 8] },
    { id: "invest", label: "Save more and start investing", desc: "Build an emergency fund, beat inflation and grow your money", units: [1, 2, 4, 5, 7, 8, 12, 14] },
    { id: "business", label: "Start or run a business", desc: "Pricing, accounting, cash flow and raising money", units: [1, 2, 3, 4, 9, 10, 11] },
    { id: "career", label: "Study finance and get hired", desc: "Everything, through valuation, deals and interviews", units: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  ];
  const UNIT_NAMES = ["How the money system works", "Money mindset and math toolkit", "Earning and taxes", "Budgeting and banking", "Credit and debt", "Protection", "Investing and retirement", "Big purchases", "Starting a business", "Accounting", "Corporate finance", "Investments and portfolios", "Valuation and modeling", "Macro, markets and institutions", "Excel, Python, SQL and recruiting"];
  // Lessons that are open so far, in course order. Paths are from the site root.
  const OPEN = [
    { unit: 1, n: 1, id: "u1-scarcity", href: "lessons/scarcity/", title: "Every choice has a price tag" },
    { unit: 1, n: 2, id: "u1-supply-demand", href: "lessons/supply-demand/", title: "Why prices are what they are" },
    { unit: 1, n: 3, id: "u1-inflation", href: "lessons/inflation/", title: "Why your money shrinks" },
    { unit: 1, n: 4, id: "u1-interest-rates", href: "lessons/interest-rates/", title: "Who sets the price of money?" },
    { unit: 4, n: 1, id: "u4-budgeting-frameworks", href: "lessons/budgeting/", title: "Give every dollar a job" },
  ];
  const UNITS = UNIT_NAMES.length;

  // Line icons for the style cards (24px grid, stroked).
  const ICONS = {
    visual: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="3"/>',
    auditory: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    kinesthetic: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="17.5" cy="14" r="1"/>',
    logical: '<path d="M4 6h7M7.5 2.5v7M14 6h6M4 17l6-6M4 11l6 6M14 15h6M14 19h6"/>',
    naturalistic: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l8-8"/>',
    reading: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
    social: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.5-3 2.5-5 5-5s4.5 2 5 5M11 19c.5-3 2.5-5 5-5s4.5 2 5 5"/>',
    solitary: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>',
  };
  STYLES.forEach((st) => { st.icon = ICONS[st.id]; });

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
      state.preferredStyle = null; // the old single pick would otherwise come back as a filter
      persist();
      emit();
    },
    STYLES,
    GOALS,
    UNIT_NAMES,
    OPEN,
    // The next open lesson to take: on the path, not known, not finished. Falls back to any unfinished one.
    nextLesson() {
      const { on, known } = this.path;
      const todo = OPEN.filter((l) => !(state.lessons[l.id] && state.lessons[l.id].completedAt));
      return todo.find((l) => on.has(l.unit) && !known.has(l.unit)) || todo.find((l) => on.has(l.unit)) || todo[0] || null;
    },
    setProfile(patch) {
      state.profile = Object.assign({}, state.profile, patch, { setAt: new Date().toISOString() });
      persist();
      emit();
    },
    // Unit numbers on the learner's path, and the ones they already know. No setup means everything.
    get path() {
      const p = state.profile;
      const goals = (p && p.goals && p.goals.length) ? p.goals : null;
      const on = new Set(goals ? GOALS.filter((g) => goals.includes(g.id)).flatMap((g) => g.units) : Array.from({ length: UNITS }, (_, i) => i + 1));
      return { on, known: new Set(Object.keys((p && p.known) || {}).map(Number)), setUp: !!(p && p.done) };
    },
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
