/* Sign in / sign up rules: email, name and password checks, live password checklist, show-password eye */
const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5.6 19 2 12 2 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2M1 1l22 22"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

/* ----- rules ----- */
function checkEmail(e) {   // format only: any real-looking address passes, so test emails like test1@example.com still work
  if (!e) return 'Enter your email address.';
  if (e.length > 254 || e.split('@').length !== 2 || e.includes('..') || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Enter a valid email like name@example.com.';
  return '';
}
function checkName(n) {
  if (n.length < 2) return 'Your name needs at least 2 characters.';
  if (n.length > 30) return 'Your name can have at most 30 characters.';
  if (!/^[\p{L}\p{M}][\p{L}\p{M} '.-]*$/u.test(n)) return 'Use letters, spaces, apostrophes, dots or hyphens only (no numbers).';
  return '';
}
const COMMON_PW = ['password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'qwertyui', 'iloveyou', 'admin123', 'welcome1', 'letmein1', 'abc12345', '11111111', 'passw0rd', 'p@ssw0rd'];
const PW_RULES = [
  { k:'len',    t:'At least 8 characters',        m:'at least 8 characters',   ok:p => p.length >= 8 },
  { k:'low',    t:'One lowercase letter (a to z)', m:'a lowercase letter',      ok:p => /[a-z]/.test(p) },
  { k:'up',     t:'One uppercase letter (A to Z)', m:'an uppercase letter',     ok:p => /[A-Z]/.test(p) },
  { k:'num',    t:'One number (0 to 9)',           m:'a number',                ok:p => /\d/.test(p) },
  { k:'common', t:'Not a very common password',    m:'a less common password', ok:p => p.length > 0 && !COMMON_PW.includes(p.toLowerCase()) }
];
const pwProblems = pw => PW_RULES.filter(r => !r.ok(pw)).map(r => r.m);

const TYPOS = { 'gmial.com':'gmail.com', 'gmai.com':'gmail.com', 'gamil.com':'gmail.com', 'gnail.com':'gmail.com', 'gmail.con':'gmail.com', 'gmail.co':'gmail.com', 'gmail.comm':'gmail.com',
  'hotmial.com':'hotmail.com', 'hotmal.com':'hotmail.com', 'yaho.com':'yahoo.com', 'yahooo.com':'yahoo.com', 'outlok.com':'outlook.com', 'icloud.con':'icloud.com' };
const suggestEmail = e => { const [u, d] = e.split('@'); return d && TYPOS[d] ? u + '@' + TYPOS[d] : ''; };
function friendly(err) {
  const m = err.message || '';
  if (/invalid login/i.test(m)) return 'Email or password is incorrect.';
  if (/not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox.';
  if (/already registered/i.test(m)) return 'That email already has an account. Try signing in.';
  if (/rate limit/i.test(m)) return 'Too many emails were sent. Please wait a little and try again.';
  return m;
}

/* ----- password box with eye icon and live checklist ----- */
function pwBox(id, { ph = 'Password', ac = 'current-password', rules = false } = {}) {
  return `<div class="relative"><input id="${id}" type="password" maxlength="72" autocomplete="${ac}" placeholder="${ph}" ${rules ? 'data-pw' : ''} class="w-full border border-mint-300 rounded-xl pl-3 pr-11 py-2 bg-white">
    <button type="button" data-a="eye" data-v="${id}" aria-label="Show password" aria-pressed="false" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full text-ink/60 hover:bg-sky-100">${EYE}</button></div>
    ${rules ? `<div class="mt-2"><div class="h-1.5 rounded-full bg-sky-100 overflow-hidden"><div id="meter-${id}" class="h-full rounded-full transition-all" style="width:0"></div></div>
      <p id="meterTxt-${id}" class="text-xs font-bold mt-1 min-h-[1rem]"></p>
      <ul id="rules-${id}" class="text-xs space-y-1 mt-1">${PW_RULES.map(r => `<li data-r="${r.k}" class="rule"><span class="tick">○</span><span class="rt">${r.t}</span></li>`).join('')}</ul></div>` : ''}`;
}
function paintRules(id, showBad) {   // tick (and cross out) each rule as it is met
  const ul = $('#rules-' + id); if (!ul) return;
  const pw = $('#' + id).value; let ok = 0;
  PW_RULES.forEach(r => {
    const li = ul.querySelector(`[data-r="${r.k}"]`), pass = r.ok(pw); if (pass) ok++;
    li.className = 'rule ' + (pass ? 'ok' : showBad ? 'bad' : '');
    li.querySelector('.tick').textContent = pass ? '✓' : showBad ? '✗' : '○';
  });
  const lvl = !pw ? 0 : ok < PW_RULES.length ? 1 : pw.length >= 12 ? 3 : 2;
  $('#meter-' + id).style.width = [0, 33, 66, 100][lvl] + '%';
  $('#meter-' + id).style.background = ['', '#ff9aa2', '#f5c518', '#4fb88a'][lvl];
  $('#meterTxt-' + id).textContent = ['', 'Strength: weak', 'Strength: good', 'Strength: strong'][lvl];
}

/* ----- the sign in / create account dialog ----- */
function validateAuth(email, name, pw, up) {   // returns { name, email, pass } messages for the fields that need fixing
  const errs = {}, e = checkEmail(email); if (e) errs.email = e;
  if (up) {
    const n = checkName(name); if (n) errs.name = n;
    const bad = pwProblems(pw); if (bad.length) errs.pass = 'Your password still needs ' + bad.join(', ') + '.';
  } else if (!pw) errs.pass = 'Enter your password.';
  return errs;
}
function fieldError(f, msg) {   // f = 'name' | 'email' | 'pass': message shows right under that field and the field turns red
  const p = $('#' + f + 'Err'), i = $('#' + f); if (!p || !i) return;
  p.textContent = msg || ''; i.classList.toggle('field-bad', !!msg); i.setAttribute('aria-invalid', !!msg);
}
const up_name = () => $('#name').value.trim();
const clearFieldErrors = () => ['name', 'email', 'pass'].forEach(f => fieldError(f, ''));
function authError(err, up) {   // server errors: put them under the right field when we can
  const m = friendly(err);
  if (/already has an account/.test(m)) fieldError('email', m);
  else if (up && /password/i.test(err.message || '')) fieldError('pass', m);
  else setAuthMsg(m);
}

function setAuthMsg(text, kind) { const p = $('#authMsg'); p.textContent = text; p.className = 'text-sm min-h-[1.25rem] my-2 ' + (kind === 'ok' ? 'msg-ok' : 'msg-bad'); }
function setAuthMode(mode) {
  S.authMode = mode; const up = mode === 'signup';
  $('#authTitle').textContent = up ? 'Create your account' : 'Welcome back';
  $('#authSub').textContent = up ? 'It only takes a few seconds. Your garden is waiting.' : 'Sign in to pick up where you left off.';
  $('#nameRow').classList.toggle('hidden', !up);
  $('#pwSlot').innerHTML = pwBox('pass', { ph:up ? 'Create a password' : 'Your password', ac:up ? 'new-password' : 'current-password', rules:up });
  $('#forgotBtn').classList.toggle('hidden', up);
  $('#authGo').textContent = up ? 'Create account' : 'Sign in';
  $('#switchText').textContent = up ? 'Already have an account?' : 'New here?';
  $('#switchBtn').textContent = up ? 'Sign in' : 'Create an account';
  setAuthMsg(''); clearFieldErrors();
}
function hintEmail() {
  const s = suggestEmail($('#email').value.trim().toLowerCase());
  $('#emailHint').innerHTML = s ? `Did you mean <button type="button" data-a="fixEmail" data-v="${esc(s)}" class="font-bold underline">${esc(s)}</button>?` : '';
}

Object.assign(actions, {
  eye(v) {
    const i = $('#' + v), b = document.querySelector(`[data-a="eye"][data-v="${v}"]`), show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.innerHTML = show ? EYE_OFF : EYE;
    b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  },
  fixEmail(v) { $('#email').value = v; hintEmail(); },
  authSwitch() { setAuthMode(S.authMode === 'signup' ? 'signin' : 'signup'); },
  async authSubmit() {
    const email = $('#email').value.trim().toLowerCase(), name = up_name(), pw = $('#pass').value, up = S.authMode === 'signup', go = $('#authGo');
    clearFieldErrors(); setAuthMsg('');
    const errs = validateAuth(email, name, pw, up), first = ['name', 'email', 'pass'].find(f => errs[f]);
    if (first) {
      Object.entries(errs).forEach(([f, m]) => fieldError(f, m));
      if (errs.pass && up) paintRules('pass', true);
      return $('#' + first).focus();
    }
    go.disabled = true;
    try {
      if (up) {
        const { data, error } = await sb.auth.signUp({ email, password:pw, options:{ data:{ display_name:name } } });
        if (error) return authError(error, true);
        if (data.session) return await afterAuth();
        setAuthMode('signin'); setAuthMsg('Account created! Check your email to confirm it, then sign in.', 'ok');
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password:pw });
        if (error) return authError(error, false);
        await afterAuth();
      }
    } finally { go.disabled = false; }
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.hasAttribute && t.hasAttribute('data-pw')) paintRules(t.id);
  if (t.id === 'email') hintEmail();
  if (['name', 'email', 'pass'].includes(t.id)) fieldError(t.id, '');   // the message goes away as soon as you start fixing it
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && $('#authDlg').open && ['email', 'name', 'pass'].includes(e.target.id)) actions.authSubmit();
});
