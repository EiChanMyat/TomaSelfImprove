/* Profile and settings, forgot password, delete account, dark mode and the midnight refresh */
function settingsView() {
  const dark = document.documentElement.classList.contains('dark');
  const field = (id, label, val, ph) => `<label class="text-sm font-bold" for="${id}">${label}</label>
    <input id="${id}" maxlength="30" value="${esc(val)}" placeholder="${ph}" class="w-full border border-mint-300 rounded-xl px-3 py-2 mt-1 mb-3 bg-white">`;
  const themeBtn = (v, label, on) => `<button data-a="theme" data-v="${v}" aria-pressed="${on}" class="px-4 py-2 rounded-xl font-bold ${on ? 'bg-sky-300' : 'bg-sky-100'}">${label}</button>`;
  return `<div class="max-w-xl mx-auto mt-2 space-y-5">
    <h2 class="font-display text-xl font-medium">Profile and settings</h2>
    <section class="card p-5">
      <p class="text-sm text-ink/60 mb-3">${S.user ? 'Signed in as <b>' + esc(S.user.email) + '</b>' : 'You are using Toma as a guest on this device.'}</p>
      ${field('sName', 'Display name', S.prefs.name, 'What should Toma call you?')}
      ${field('sGarden', 'Garden name', S.prefs.garden, 'My garden')}
      <button data-a="savePrefs" class="bg-mint-500 text-white font-bold rounded-xl px-5 py-2">Save</button>
    </section>
    <section class="card p-5"><h3 class="font-bold mb-3">Appearance</h3>
      <div class="flex gap-2">${themeBtn('light', '☀️ Light', !dark)}${themeBtn('dark', '🌙 Dark', dark)}</div></section>
    ${S.user ? `<section class="card p-5"><h3 class="font-bold mb-3">Change password</h3>
      <input id="newPw" type="password" autocomplete="new-password" placeholder="New password (6+ characters)" class="w-full border border-mint-300 rounded-xl px-3 py-2 mb-3 bg-white">
      <button data-a="changePw" class="bg-mint-500 text-white font-bold rounded-xl px-5 py-2">Update password</button>
      <p id="pwMsg" class="text-sm text-mint-700 mt-2 min-h-[1.25rem]"></p></section>
    <section class="card p-5 border-2 border-red-200"><h3 class="font-bold text-red-600">Delete my account</h3>
      <p class="text-sm text-ink/70 my-2">This permanently erases your account, habits, moods, focus sessions and to-dos. It cannot be undone.</p>
      <input id="delConfirm" placeholder="Type DELETE to confirm" class="w-full border border-red-200 rounded-xl px-3 py-2 mb-3 bg-white">
      <button data-a="deleteAccount" class="bg-red-600 text-white font-bold rounded-xl px-5 py-2">Delete everything</button>
      <p id="delMsg" class="text-sm text-red-600 mt-2 min-h-[1.25rem]"></p></section>`
    : `<section class="card p-5"><h3 class="font-bold mb-2">Data on this device</h3>
      <p class="text-sm text-ink/70 mb-3">Guest data lives only in this browser. Create an account to keep it safe.</p>
      <button data-a="clearLocal" class="bg-butter-300 font-bold rounded-xl px-5 py-2">Erase data on this device</button></section>`}
  </div>`;
}

const isDark = () => document.documentElement.classList.contains('dark');
function paintThemeBtns() { document.querySelectorAll('.themeBtn').forEach(b => { b.textContent = isDark() ? '☀️' : '🌙'; b.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode'); }); }
const wipeLocal = () => Object.keys(localStorage).filter(k => k.startsWith('toma-')).forEach(k => localStorage.removeItem(k));

Object.assign(actions, {
  theme(v) {
    const dark = v ? v === 'dark' : !isDark();
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('toma-theme', dark ? 'dark' : 'light');
    paintThemeBtns(); if (S.tab === 'settings') render();
  },
  async savePrefs() {
    S.prefs = { name:$('#sName').value.trim().slice(0, 30), garden:$('#sGarden').value.trim().slice(0, 30) };
    if (cloud()) await guard(sb.from('user_settings').upsert({ user_id:S.user.id, display_name:S.prefs.name || null, garden_name:S.prefs.garden || null, updated_at:new Date().toISOString() }));
    else localStorage.setItem('toma-prefs', JSON.stringify(S.prefs));
    render(); toast('Saved ✨');
  },
  async changePw() {
    const pw = $('#newPw').value, msg = $('#pwMsg');
    if (pw.length < 6) return (msg.textContent = 'Use at least 6 characters.');
    const { error } = await sb.auth.updateUser({ password:pw });
    msg.textContent = error ? error.message : 'Password updated ✅'; if (!error) $('#newPw').value = '';
  },
  async deleteAccount() {
    if ($('#delConfirm').value.trim() !== 'DELETE') return ($('#delMsg').textContent = 'Type DELETE to confirm.');
    const { error } = await sb.rpc('delete_my_account');
    if (error) return ($('#delMsg').textContent = error.message);
    await sb.auth.signOut(); wipeLocal(); S.user = null; localLoad(); render(); showScreen('landing');
  },
  clearLocal() { if (confirm('Erase all Toma data saved on this device?')) { wipeLocal(); location.reload(); } },
  async forgot() {
    const email = $('#email').value.trim(), msg = $('#authMsg');
    if (!email) return (msg.textContent = 'Type your email above first.');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo:location.origin + location.pathname });
    msg.textContent = error ? error.message : 'Check your email for a reset link.';
  },
  async saveNewPw() {
    const pw = $('#resetPw').value;
    if (pw.length < 6) return ($('#resetMsg').textContent = 'Use at least 6 characters.');
    const { error } = await sb.auth.updateUser({ password:pw });
    if (error) return ($('#resetMsg').textContent = error.message);
    $('#resetDlg').close(); await afterAuth();
  }
});
if (sb) sb.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') { $('#resetMsg').textContent = ''; $('#resetDlg').showModal(); } });
paintThemeBtns();

/* midnight refresh: a new day starts fresh habits, even if the tab stayed open */
const dayChanged = () => dateKey(new Date()) !== TODAY && !T.running;
setInterval(() => { if (dayChanged()) location.reload(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && dayChanged()) location.reload(); });
