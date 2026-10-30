// Accounts: Supabase sign-in plus syncing the FH save file to the learner's account.
// The URL and publishable key are meant to be public; row level security keeps each save private.
(function () {
  const SUPABASE_URL = "https://mhwlfprsxbpslqycqzvl.supabase.co";
  const SUPABASE_KEY = "sb_publishable_pcjRVLnT3QstXWBETHc98Q_YyXRDuYP";
  if (!window.supabase || !window.FH) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  let user = null;
  let pushing = null;
  let applyingRemote = false;
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn(user));

  // Combine two saves: keep every badge and completed section, the best scores,
  // and the character numbers from whichever save changed most recently.
  const merge = (a, b) => {
    const newer = (a.updatedAt || "") >= (b.updatedAt || "") ? a : b;
    const out = JSON.parse(JSON.stringify(newer));
    out.xp = Math.max(a.xp || 0, b.xp || 0);
    out.badges = [...new Set([...(a.badges || []), ...(b.badges || [])])];
    const pa = a.profile, pb = b.profile;
    out.profile = !pa ? pb || null : !pb ? pa : (pa.setAt || "") >= (pb.setAt || "") ? pa : pb;
    out.lessons = {};
    for (const id of new Set([...Object.keys(a.lessons || {}), ...Object.keys(b.lessons || {})])) {
      const x = (a.lessons || {})[id] || {}, y = (b.lessons || {})[id] || {};
      out.lessons[id] = {
        sections: Object.assign({}, x.sections, y.sections),
        quizBest: Math.max(x.quizBest || 0, y.quizBest || 0),
        gameBest: x.gameBest == null ? y.gameBest ?? null : y.gameBest == null ? x.gameBest : Math.max(x.gameBest, y.gameBest),
        completedAt: x.completedAt || y.completedAt || null,
      };
    }
    return out;
  };

  const pull = async () => {
    const { data, error } = await client.from("progress").select("save, terms_accepted_at").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    const meta = user.user_metadata || {};
    const local = FH.state;
    const remote = data && data.save && Object.keys(data.save).length ? data.save : null;
    const merged = remote ? merge(local, remote) : local;
    applyingRemote = true;
    FH.replace(merged);
    applyingRemote = false;
    const row = { user_id: user.id, save: merged, updated_at: new Date().toISOString() };
    if (!data || !data.terms_accepted_at) {
      // Consent was recorded at sign-up; copy it onto the progress row.
      row.age_confirmed = !!meta.age_confirmed;
      row.terms_accepted_at = meta.terms_accepted_at || null;
    }
    const up = await client.from("progress").upsert(row);
    if (up.error) throw up.error;
  };

  const push = () => {
    if (!user || applyingRemote) return;
    clearTimeout(pushing);
    pushing = setTimeout(async () => {
      await client.from("progress").upsert({ user_id: user.id, save: FH.state, updated_at: new Date().toISOString() });
    }, 1500);
  };
  document.addEventListener("fh:save", push);

  // Header button reads "Account" once signed in.
  // Signed in, the header button opens an account menu; signed out, it stays a Sign in link.
  const ico = {
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
  };
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const closeMenus = () => document.querySelectorAll(".acct-menu.open").forEach((m) => {
    m.classList.remove("open");
    m.querySelector(".acct-btn").setAttribute("aria-expanded", "false");
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".acct-menu")) closeMenus(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".acct-menu.open");
    if (open) { closeMenus(); open.querySelector(".acct-btn").focus(); }
  });

  const buildMenu = (a, name) => {
    const base = a.getAttribute("href").replace(/account\/$/, "");
    const wrap = document.createElement("div");
    wrap.className = "acct-menu";
    wrap.innerHTML = `
      <button class="acct-btn" type="button" aria-haspopup="menu" aria-expanded="false">
        <span class="avatar"></span><span class="uname"></span>
        <svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="acct-pop" role="menu">
        <p class="acct-who"><span class="avatar"></span><span><b class="uname"></b><small></small></span></p>
        <button class="acct-row acct-notes" type="button" role="menuitem" aria-expanded="false">${svg(ico.bell)}<span>${FH.t("Notifications", "Notificaciones")}</span>${svg(ico.chev)}</button>
        <p class="acct-empty" hidden>${FH.t("You're all caught up.", "Estás al día.")}</p>
        <hr>
        <a class="acct-row" role="menuitem" href="${base || "./"}">${svg(ico.home)}<span>${FH.t("Learner home", "Mi inicio")}</span></a>
        <a class="acct-row" role="menuitem" href="${base}account/">${svg(ico.gear)}<span>${FH.t("Settings", "Ajustes")}</span></a>
        <a class="acct-row" role="menuitem" href="${base}about.html">${svg(ico.help)}<span>${FH.t("Help", "Ayuda")}</span></a>
        <hr>
        <button class="acct-row acct-out" type="button" role="menuitem">${svg(ico.out)}<span>${FH.t("Log out", "Cerrar sesión")}</span></button>
      </div>`;
    wrap.querySelectorAll(".avatar").forEach((el) => { el.textContent = name[0].toUpperCase(); });
    wrap.querySelectorAll(".uname").forEach((el) => { el.textContent = name; });
    wrap.querySelector(".acct-who small").textContent = user.email;
    const btn = wrap.querySelector(".acct-btn");
    btn.title = FH.t(`Signed in as ${name}`, `Sesión iniciada como ${name}`);
    btn.addEventListener("click", () => {
      const open = !wrap.classList.contains("open");
      closeMenus();
      wrap.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) wrap.querySelector(".acct-row").focus();
    });
    const notes = wrap.querySelector(".acct-notes");
    notes.addEventListener("click", () => {
      const empty = wrap.querySelector(".acct-empty");
      empty.hidden = !empty.hidden;
      notes.setAttribute("aria-expanded", String(!empty.hidden));
    });
    wrap.querySelector(".acct-out").addEventListener("click", () => { closeMenus(); FHAuth.signOut(); });
    // Arrow keys move through the rows.
    wrap.querySelector(".acct-pop").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const rows = [...wrap.querySelectorAll(".acct-row")];
      const i = rows.indexOf(document.activeElement);
      rows[(i + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
    });
    return wrap;
  };

  const paintHeader = () => document.querySelectorAll('.topbar a[href$="account/"]').forEach((a) => {
    if (!a.classList.contains("btn")) return;
    const name = user && ((user.user_metadata || {}).username || user.email.split("@")[0]);
    const old = a.nextElementSibling && a.nextElementSibling.classList.contains("acct-menu") ? a.nextElementSibling : null;
    if (old) old.remove();
    a.classList.toggle("hidden", !!user);
    if (!user) { a.textContent = FH.t("Sign in", "Entrar"); return; }
    a.after(buildMenu(a, name));
  });

  // After signing in (or landing from the confirmation email), go to the course, or to the
  // short setup the first time for a save that has none.
  const fromEmailLink = /access_token|type=signup|type=magiclink/.test(location.hash);
  let recovering = false;
  const afterSignIn = () => {
    if (!user || recovering || /\/start\/?$/.test(location.pathname)) return;
    const root = document.body.dataset.root || "./";
    let asked = false, justIn = fromEmailLink;
    try {
      asked = !!sessionStorage.getItem("fh-setup-asked");
      justIn = justIn || !!sessionStorage.getItem("fh-just-signed-in");
      sessionStorage.removeItem("fh-just-signed-in");
    } catch (e) { /* storage blocked */ }
    if (!(FH.state.profile && FH.state.profile.done) && !asked) {
      try { sessionStorage.setItem("fh-setup-asked", "1"); } catch (e) { /* storage blocked */ }
      location.href = root + "start/";
    } else if (justIn && /\/account\/?$/.test(location.pathname)) location.href = root;
  };

  client.auth.onAuthStateChange((event, session) => {
    const was = user && user.id;
    user = session ? session.user : null;
    if (event === "PASSWORD_RECOVERY") recovering = true;
    paintHeader();
    if (event === "USER_UPDATED") paintHeader();
    if (user && user.id !== was) pull().catch((e) => console.warn("Sync failed", e)).finally(() => { notify(); afterSignIn(); });
    else notify();
    if (event === "PASSWORD_RECOVERY") document.dispatchEvent(new CustomEvent("fh:recovery"));
  });

  window.FHAuth = {
    client,
    get user() { return user; },
    onChange(fn) { listeners.push(fn); fn(user); },
    redirect: () => location.origin + location.pathname,
    signUp: (email, password, consents) => client.auth.signUp({
      email, password,
      options: { emailRedirectTo: location.origin + location.pathname, data: consents },
    }),
    signIn: (email, password) => client.auth.signInWithPassword({ email, password }),
    signOut: () => client.auth.signOut(),
    resetPassword: (email) => client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }),
    setPassword: (password) => client.auth.updateUser({ password }),
    setUsername: (username) => client.auth.updateUser({ data: { username } }),
    resendConfirmation: (email) => client.auth.resend({ type: "signup", email, options: { emailRedirectTo: location.origin + location.pathname } }),
    deleteAccount: async () => {
      const { error } = await client.rpc("delete_my_account");
      if (error) throw error;
      await client.auth.signOut();
    },
  };
})();
