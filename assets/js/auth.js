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
  const paintHeader = () => document.querySelectorAll('a[href$="account/"]').forEach((a) => {
    if (!a.classList.contains("btn")) return;
    const name = user && ((user.user_metadata || {}).username || user.email.split("@")[0]);
    a.classList.toggle("signed-in", !!user);
    a.textContent = "";
    if (!user) { a.textContent = FH.t("Sign in", "Entrar"); a.removeAttribute("title"); return; }
    const av = document.createElement("span");
    av.className = "avatar";
    av.textContent = name[0].toUpperCase();
    const nm = document.createElement("span");
    nm.className = "uname";
    nm.textContent = name;
    a.append(av, nm);
    a.title = FH.t(`Signed in as ${name}`, `Sesión iniciada como ${name}`);
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
