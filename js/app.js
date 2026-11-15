/* UI: helpers, views, focus timer, actions and startup */
/* ============ 4. UI HELPERS ============ */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  t.style.animation = 'none'; t.offsetHeight; t.style.animation = '';
  clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.add('hidden'), 2200);
}
function cheer(msg) {
  toast(msg);
  const el = $('#toma'); if (el) { el.classList.remove('bounce'); el.offsetHeight; el.classList.add('bounce'); }
}
function toma(size = 'w-36 h-36') {
  const mood = S.mood;
  const mouth = mood === 'sad' ? 'M42 71 Q50 64 58 71' : mood === 'angry' ? 'M43 69 H57' : 'M42 64 Q50 75 58 64';
  const brows = mood === 'angry' ? '<path d="M29 45 L42 50 M71 45 L58 50" stroke="#2b4a42" stroke-width="3" stroke-linecap="round"/>' : '';
  return `<svg id="toma" viewBox="0 0 100 100" class="${size}" role="img" aria-label="Toma the yellow tomato">
    <path d="M50 24 C44 10 34 10 29 15 C38 15 44 19 50 24 C56 19 62 15 71 15 C66 10 56 10 50 24Z" fill="#4fb88a"/>
    <rect x="48" y="12" width="4" height="13" rx="2" fill="#2c7a5c"/>
    <ellipse cx="50" cy="59" rx="40" ry="35" fill="#ffd84d"/>
    <ellipse cx="33" cy="44" rx="8" ry="5" fill="#fff" opacity=".45"/>
    <circle cx="36" cy="56" r="4.5" fill="#2b4a42"/><circle cx="64" cy="56" r="4.5" fill="#2b4a42"/>
    <circle cx="37.5" cy="54.5" r="1.4" fill="#fff"/><circle cx="65.5" cy="54.5" r="1.4" fill="#fff"/>
    <ellipse cx="26" cy="66" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/><ellipse cx="74" cy="66" rx="6" ry="4" fill="#ff9aa2" opacity=".6"/>
    ${brows}<path d="${mouth}" stroke="#2b4a42" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

/* ============ 5. VIEWS ============ */
function habitRow(h) {
  const on = S.done.has(h.id);
  const icon = (isCustom(h) ? h.icon : ICONS[h.id]) || h.icon || '🌟';
  return `<div class="card flex items-center gap-3 px-4 py-3" style="${on ? 'background:#d8f3e4' : ''}">
    <span class="text-2xl">${esc(icon)}</span>
    <div class="flex-1 min-w-0">
      <p class="font-bold break-words ${on ? 'line-through opacity-60' : ''}">${esc(h.title)}</p>
      <p class="text-xs text-ink/60">+${h.energy} 💧${isCustom(h) ? ' · yours' : ''}</p>
    </div>
    ${isCustom(h) ? `<button data-a="editHabit" data-v="${h.id}" class="w-9 h-9 rounded-full bg-sky-100 text-sm" aria-label="Edit ${esc(h.title)}">✏️</button>` : ''}
    <button data-a="toggle" data-v="${h.id}" aria-pressed="${on}" aria-label="${on ? 'Undo' : 'Complete'} ${esc(h.title)}"
      class="w-10 h-10 rounded-full border-2 text-lg font-bold ${on ? 'bg-mint-500 border-mint-500 text-white pop' : 'border-mint-300 bg-white text-transparent'}">✓</button>
  </div>`;
}
function homeView() {
  const plants = Math.min(12, Math.floor(S.energy / 20));
  const stages = ['🌱', '🌿', '🌷', '🌻', '🍅'];
  const slots = Array.from({ length:12 }, (_, i) => i < plants
    ? `<span class="text-4xl pop">${stages[i % 5]}</span>` : `<span class="text-xl opacity-25">🟤</span>`).join('');
  const msg = pct() === 0 ? 'Hi! Let’s water your garden today.'
    : pct() < 100 ? `Nice work! ${goal() - dayEnergy()} more energy to a full day.`
    : 'All done! Your garden is glowing today. ✨';
  const stat = (v, l) => `<div class="bg-butter-100 rounded-2xl py-2"><p class="font-display text-xl font-semibold">${v}</p><p class="text-xs text-ink/70">${l}</p></div>`;
  return `<div class="grid md:grid-cols-[340px_1fr] gap-5 mt-2">
    <section class="card p-6 flex flex-col items-center text-center self-start">
      ${toma('w-40 h-40')}
      <p class="font-bold mt-3">${msg}</p>
      <div class="w-full grid grid-cols-3 gap-2 mt-4">${stat(Math.floor(S.energy / 100) + 1, 'Level')}${stat(S.energy, 'Total 💧')}${stat(streak(), 'Day streak 🔥')}</div>
    </section>
    <div class="space-y-5">
      <section class="card p-5">
        <h2 class="font-display text-lg font-medium mb-3">My garden</h2>
        <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 place-items-center bg-butter-100 rounded-2xl py-5">${slots}</div>
        <p class="text-xs text-ink/60 mt-2">Every 20 energy grows a new plant.</p>
      </section>
      <section>
        <h2 class="font-display text-lg font-medium mb-2">Up next</h2>
        <div class="grid sm:grid-cols-2 gap-2">${S.habits.filter(h => !S.done.has(h.id)).slice(0, 4).map(habitRow).join('') || '<p class="card p-4 text-sm">Every habit is done. Take a deep breath. 🌸</p>'}</div>
      </section>
    </div>
  </div>`;
}
function habitsView() {
  return `<div class="flex items-center justify-between mt-2 mb-3">
      <h2 class="font-display text-xl font-medium">Today’s habits</h2>
      <button data-a="addHabit" class="bg-mint-500 text-white font-bold rounded-full px-4 py-2 text-sm shadow-sm">+ Add habit</button>
    </div>
    <div class="grid md:grid-cols-2 gap-3">${S.habits.map(habitRow).join('')}</div>
    <p class="text-center text-sm text-ink/60 mt-4">${S.done.size} of ${S.habits.length} done${cloud() ? '' : ' · sign in to keep your habits on every device'}</p>`;
}
/* Streak = consecutive days with at least one habit done (today may still be open) */
function streak() {
  let n = 0; const d = new Date();
  if (!(S.hist[dateKey(d)] > 0)) d.setDate(d.getDate() - 1);
  while (S.hist[dateKey(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function week() {   // last 7 days, oldest first
  return Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { k:dateKey(d), label:d.toLocaleDateString('en', { weekday:'short' }), n:S.hist[dateKey(d)] || 0 };
  });
}
function progressView() {
  const w = week(), st = streak(), max = Math.max(S.habits.length, 1);
  const total = w.reduce((a, d) => a + d.n, 0), active = w.filter(d => d.n > 0).length;
  const bars = w.map(d => `<div class="flex-1 flex flex-col items-center gap-1">
      <span class="text-xs font-bold">${d.n}</span>
      <div class="w-full h-36 flex items-end"><div class="w-full rounded-t-xl ${d.k === TODAY ? 'bg-mint-500' : 'bg-sky-300'}" style="height:${Math.max(4, Math.min(100, Math.round(d.n / max * 100)))}%"></div></div>
      <span class="text-xs ${d.k === TODAY ? 'font-bold' : 'text-ink/60'}">${d.label}</span></div>`).join('');
  const msg = st === 0 ? 'Complete any habit today to start a streak.'
    : S.hist[TODAY] > 0 ? 'You’re on a roll! Come back tomorrow to keep it going.'
    : 'Do one habit today to keep your streak alive.';
  return `<div class="grid md:grid-cols-[340px_1fr] gap-5 mt-2">
    <section class="card p-6 text-center self-start">
      <div class="text-5xl">🔥</div>
      <p class="font-display text-6xl font-semibold mt-1">${st}</p>
      <p class="font-bold">day streak</p>
      <p class="text-sm text-ink/70 mt-3">${msg}</p>
    </section>
    <section class="card p-5">
      <h2 class="font-display text-lg font-medium">This week</h2>
      <p class="text-sm text-ink/60">Habits completed each day</p>
      <div class="flex gap-2 mt-4">${bars}</div>
      <p class="text-sm font-bold text-mint-700 mt-4">${total} habits done across ${active} of the last 7 days</p>
    </section>
  </div>`;
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ffd84d', '#4fb88a', '#5aaee0', '#ff9aa2', '#9fdcbc'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.cssText = `left:${Math.random() * 100}vw;background:${colors[i % 5]};animation-delay:${Math.random() * .4}s;--dx:${(Math.random() - .5) * 160}px`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 2400);
  }
}
function focusView() {
  return `<div class="max-w-xl mx-auto"><div class="flex justify-center gap-2 mt-2">${Object.keys(CATS).map(c =>
    `<button data-a="cat" data-v="${c}" class="px-4 py-1.5 rounded-full text-sm font-bold ${T.cat === c ? 'bg-sky-300' : 'bg-white'}">${c}</button>`).join('')}</div>
  <div class="card mt-4 py-10 flex flex-col items-center">
    <div class="relative w-64 h-64">
      <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#dff0fb" stroke-width="12"/>
        <circle id="ring" cx="100" cy="100" r="88" fill="none" stroke="#4fb88a" stroke-width="12" stroke-linecap="round" stroke-dasharray="553"/>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span id="time" class="font-display text-6xl font-semibold"></span>
        <span class="text-sm text-ink/60">${T.cat}</span>
      </div>
    </div>
    <div class="flex gap-3 mt-6">
      <button id="sbtn" data-a="startpause" class="px-8 py-3 rounded-2xl bg-mint-500 text-white font-bold text-lg"></button>
      <button data-a="reset" class="px-5 py-3 rounded-2xl bg-butter-300 font-bold">Reset</button>
    </div>
    <p class="text-xs text-ink/60 mt-4">Finish a session to earn +15 💧</p>
  </div></div>`;
}
function moodView() {
  return `<div class="grid md:grid-cols-2 gap-5 mt-2">
  <section>
    <h2 class="font-display text-xl font-medium mb-3">How are you feeling?</h2>
    <div class="grid grid-cols-5 gap-2">${MOODS.map(m =>
      `<button data-a="mood" data-v="${m.k}" aria-pressed="${S.mood === m.k}" class="card py-4 flex flex-col items-center gap-1 text-xs sm:text-sm font-bold ${S.mood === m.k ? 'ring-4 ring-sky-300' : ''}">
        <span class="text-3xl sm:text-4xl">${m.e}</span>${m.l}</button>`).join('')}</div>
    <div class="flex justify-center mt-6">${toma('w-32 h-32')}</div>
  </section>
  <section class="rounded-3xl p-8 text-center bg-gradient-to-br from-butter-100 to-mint-100 shadow-sm self-start">
    <p class="text-sm font-bold text-mint-700">Today’s affirmation</p>
    <p class="font-display text-3xl leading-snug mt-3">“${esc(AFFIRMATIONS[S.aff])}”</p>
    <button data-a="shuffle" class="mt-5 text-sm font-bold bg-white rounded-full px-4 py-1.5">Show another</button>
  </section></div>`;
}

function render() {
  $('#energyText').textContent = `${dayEnergy()} / ${goal()}`;
  $('#bar').style.width = pct() + '%';
  $('#authChip').textContent = !sb ? '📴 Local mode' : S.user ? 'Sign out' : 'Sign in';
  $('#view').innerHTML = ({ home:homeView, habits:habitsView, progress:progressView, focus:focusView, mood:moodView })[S.tab]();
  document.querySelectorAll('.nav').forEach(b => {
    const on = b.dataset.v === S.tab;
    b.classList.toggle('bg-mint-100', on); b.classList.toggle('text-mint-700', on);
  });
  if (S.tab === 'focus') paintTimer();
}

/* ============ 6. TIMER ============ */
function paintTimer() {
  const t = $('#time'); if (!t) return;
  t.textContent = fmt(T.left);
  $('#ring').style.strokeDashoffset = 553 * (1 - T.left / T.total);
  $('#sbtn').textContent = T.running ? 'Pause' : (T.left < T.total ? 'Resume' : 'Start');
}
function tick() {
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
  paintTimer();
  if (T.left === 0) finishTimer();
}
function stopTimer() { clearInterval(T.id); T.running = false; }
async function finishTimer() {
  stopTimer();
  S.energy += 15; S.mood = S.mood; localSave();
  const mins = CATS[T.cat];
  T.left = T.total;
  render(); toast(`${T.cat} complete! +15 💧`);
  if (cloud()) {
    await guard(sb.from('focus_sessions').insert({ user_id:S.user.id, category:T.cat, minutes:mins }));
    await guard(saveEnergy());
  }
}

/* Open the add / edit habit dialog (id = null means a new habit) */
function openHabit(id) {
  const h = id == null ? null : S.habits.find(x => x.id === id);
  S.editId = h ? h.id : null;
  $('#habitTitle').textContent = h ? 'Edit habit' : 'New habit';
  $('#hTitle').value = h ? h.title : '';
  $('#hEnergy').value = h ? h.energy : 10;
  $('#hIcon').value = h && h.icon ? h.icon : '🌟';
  $('#hDelete').classList.toggle('hidden', !h);
  $('#hMsg').textContent = '';
  $('#habitDlg').showModal();
}

/* ============ 7. ACTIONS ============ */
const actions = {
  tab: v => { S.tab = v; render(); $('#view').parentElement.scrollTop = 0; },
  async toggle(v) {
    const id = Number(v), h = S.habits.find(x => x.id === id); if (!h) return;
    const on = !S.done.has(id);
    on ? S.done.add(id) : S.done.delete(id);
    S.energy = Math.max(0, S.energy + (on ? h.energy : -h.energy));
    localSave(); render();
    if (on) cheer(pct() === 100 ? 'All habits done! 🎉' : `+${h.energy} 💧 Nice!`);
    if (on && pct() === 100) confetti();
    if (cloud()) {
      await guard(on
        ? sb.from('habit_logs').insert({ user_id:S.user.id, habit_id:id, log_date:TODAY })
        : sb.from('habit_logs').delete().match({ user_id:S.user.id, habit_id:id, log_date:TODAY }));
      await guard(saveEnergy());
    }
  },
  cat: v => { stopTimer(); T.cat = v; T.total = T.left = CATS[v] * 60; render(); },
  startpause() {
    if (T.running) { stopTimer(); }
    else { T.end = Date.now() + T.left * 1000; T.running = true; T.id = setInterval(tick, 250); }
    paintTimer();
  },
  reset() { stopTimer(); T.left = T.total; paintTimer(); },
  async mood(v) {
    S.mood = v; localSave(); render();
    toast(`Logged: ${MOODS.find(m => m.k === v).l}`);
    if (cloud()) await guard(sb.from('moods').insert({ user_id:S.user.id, mood:v }));
  },
  shuffle() { S.aff = (S.aff + 1) % AFFIRMATIONS.length; render(); },
  addHabit: () => openHabit(null),
  editHabit: v => openHabit(Number(v)),
  closeHabit: () => $('#habitDlg').close(),
  async saveHabit() {
    const title = $('#hTitle').value.trim().slice(0, 60);
    if (!title) return ($('#hMsg').textContent = 'Give your habit a name.');
    const energy = Number($('#hEnergy').value), icon = $('#hIcon').value, id = S.editId;
    $('#habitDlg').close();
    if (id == null) {
      let h = { id:Date.now(), title, energy, icon, custom:true };
      if (cloud()) {
        const { data, error } = await sb.from('habits').insert({ title, energy, icon }).select().single();
        if (error) return toast('Couldn’t save: ' + error.message);
        h = data;
      }
      S.habits.push(h); toast('Habit added 🌱');
    } else {
      const h = S.habits.find(x => x.id === id); if (!h) return;
      if (S.done.has(id)) S.energy = Math.max(0, S.energy + energy - h.energy);
      Object.assign(h, { title, energy, icon }); toast('Habit updated');
      if (cloud()) {
        await guard(sb.from('habits').update({ title, energy, icon }).eq('id', id));
        if (S.done.has(id)) await guard(saveEnergy());
      }
    }
    localSave(); render();
  },
  async deleteHabit() {
    const id = S.editId, h = S.habits.find(x => x.id === id); if (!h) return;
    $('#habitDlg').close();
    if (!confirm('Delete “' + h.title + '”?')) return;
    if (S.done.has(id)) { S.energy = Math.max(0, S.energy - h.energy); S.done.delete(id); }
    S.habits = S.habits.filter(x => x.id !== id);
    localSave(); render(); toast('Habit deleted');
    if (cloud()) { await guard(sb.from('habits').delete().eq('id', id)); await guard(saveEnergy()); }
  },
  async auth() {
    if (!sb) return toast('Add your Supabase keys to enable sign-in');
    if (S.user) { await sb.auth.signOut(); S.user = null; localLoad(); render(); return toast('Signed out'); }
    $('#authMsg').textContent = ''; $('#authDlg').showModal();
  },
  closeAuth: () => $('#authDlg').close(),
  async signin() {
    const { error } = await sb.auth.signInWithPassword({ email:$('#email').value, password:$('#pass').value });
    if (error) return ($('#authMsg').textContent = error.message);
    await afterAuth();
  },
  async signup() {
    const { data, error } = await sb.auth.signUp({ email:$('#email').value, password:$('#pass').value });
    if (error) return ($('#authMsg').textContent = error.message);
    if (data.session) await afterAuth(); else $('#authMsg').textContent = 'Check your email to confirm, then sign in.';
  }
};
async function afterAuth() {
  const { data } = await sb.auth.getSession();
  S.user = data.session ? data.session.user : null;
  if (S.user) await cloudLoad();
  $('#authDlg').close(); render(); toast('Welcome back! 🌱');
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (b && actions[b.dataset.a]) actions[b.dataset.a](b.dataset.v);
});

/* ============ 8. START ============ */
localLoad(); render();
if (sb) sb.auth.getSession().then(async ({ data }) => {
  S.user = data.session ? data.session.user : null;
  if (S.user) { await cloudLoad(); render(); }
});
