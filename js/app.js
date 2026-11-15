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
function habitRow(h, manage) {
  const on = S.done.has(h.id);
  return `<div class="card flex items-center gap-2 px-4 py-3" style="${on ? 'background:#d8f3e4' : ''}">
    <span class="text-2xl">${esc(h.icon || '🌟')}</span>
    <div class="flex-1 min-w-0 pl-1">
      <p class="font-bold break-words ${on ? 'line-through opacity-60' : ''}">${esc(h.title)}</p>
      <p class="text-xs text-ink/60">+${h.energy} 💧</p>
    </div>
    ${manage ? `<button data-a="editHabit" data-v="${h.id}" class="w-9 h-9 rounded-full bg-sky-100 text-sm" aria-label="Edit ${esc(h.title)}">✏️</button>
    <button data-a="deleteHabit" data-v="${h.id}" class="w-9 h-9 rounded-full bg-butter-100 text-sm" aria-label="Delete ${esc(h.title)}">🗑️</button>` : ''}
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
        <div class="grid sm:grid-cols-2 gap-2">${S.habits.filter(h => !S.done.has(h.id)).slice(0, 4).map(h => habitRow(h)).join('') || '<p class="card p-4 text-sm">Every habit is done. Take a deep breath. 🌸</p>'}</div>
      </section>
    </div>
  </div>`;
}
function habitsView() {
  return `<div class="flex items-center justify-between mt-2 mb-3">
      <h2 class="font-display text-xl font-medium">Your habits</h2>
      <button data-a="addHabit" class="bg-mint-500 text-white font-bold rounded-full px-4 py-2 text-sm shadow-sm">+ Add habit</button>
    </div>
    ${S.habits.length ? `<div class="grid md:grid-cols-2 gap-3">${S.habits.map(h => habitRow(h, true)).join('')}</div>`
      : '<p class="card p-6 text-center">No habits yet. Tap “+ Add habit” to create your first one. 🌱</p>'}
    <p class="text-center text-sm text-ink/60 mt-4">${S.done.size} of ${S.habits.length} done${cloud() ? '' : ' · sign in to keep your habits on every device'}</p>`;
}
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
const curFocus = () => S.focus.find(f => f.id === T.sel) || S.focus[0];
function selectFocus(id) {
  const f = S.focus.find(x => x.id === id) || S.focus[0];
  stopTimer(); stopAlarm(); S.focusDone = ''; T.sel = f.id; T.total = T.left = f.minutes * 60;
}
function focusView() {
  const f = curFocus();
  return `<div class="max-w-xl mx-auto"><div class="flex flex-wrap justify-center gap-2 mt-2">${S.focus.map(x =>
    `<button data-a="cat" data-v="${x.id}" class="px-4 py-1.5 rounded-full text-sm font-bold ${x.id === f.id ? 'bg-sky-300' : 'bg-white'}">${esc(x.name)}</button>`).join('')}
    <button data-a="addFocus" class="px-4 py-1.5 rounded-full text-sm font-bold bg-mint-500 text-white">+ New</button></div>
  <div class="card mt-4 py-10 flex flex-col items-center">
    <div class="relative w-64 h-64">
      <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#dff0fb" stroke-width="12"/>
        <circle id="ring" cx="100" cy="100" r="88" fill="none" stroke="#4fb88a" stroke-width="12" stroke-linecap="round" stroke-dasharray="553"/>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span id="time" class="font-display text-6xl font-semibold"></span>
        <span class="text-sm text-ink/60 break-words">${esc(f.name)} · ${f.minutes} min</span>
        <span id="tstate" class="text-xs font-bold text-mint-700 mt-1 min-h-[1rem]"></span>
      </div>
    </div>
    <div class="flex gap-3 mt-6">
      <button id="sbtn" data-a="startpause"></button>
      <button data-a="reset" class="px-5 py-3 rounded-2xl bg-butter-300 font-bold">Reset</button>
      <button data-a="editFocus" class="px-5 py-3 rounded-2xl bg-sky-100 font-bold">Edit</button>
    </div>
    ${S.focusDone ? `<div class="mt-5 mx-6 rounded-2xl bg-butter-100 p-4 text-center font-bold">${esc(S.focusDone)}
      <button data-a="dismissDone" class="block mx-auto mt-2 text-sm bg-white rounded-full px-4 py-1.5">Got it 🌱</button></div>` : ''}
    <button data-a="sound" class="mt-5 text-xs font-bold bg-sky-100 rounded-full px-3 py-1.5">${soundOn() ? '🔔 Alarm on' : '🔕 Alarm off'}</button>
    <p class="text-xs text-ink/60 mt-3">Finish a session to earn +15 💧</p>
  </div></div>`;
}
function moodView() {
  const day = S.moodDay, cur = S.moodMap[day], now = new Date();
  const y = S.calMonth.getFullYear(), mo = S.calMonth.getMonth();
  const first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
  const isCurMonth = y === now.getFullYear() && mo === now.getMonth();
  const dayLabel = day === TODAY ? 'today' : 'on ' + new Date(day + 'T00:00:00').toLocaleDateString('en', { weekday:'short', day:'numeric', month:'short' });
  const cells = Array(first).fill('<div></div>').concat(Array.from({ length:days }, (_, i) => {
    const k = dateKey(new Date(y, mo, i + 1)), m = MOODS.find(x => x.k === S.moodMap[k]), future = k > TODAY;
    return `<button ${future ? 'disabled' : `data-a="pickDay" data-v="${k}"`} aria-label="${k}" class="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 ${k === day ? 'ring-4 ring-sky-300' : ''} ${k === TODAY ? 'bg-butter-100' : 'bg-white'} ${future ? 'opacity-30' : 'hover:bg-mint-50'}">
      <span class="text-[10px] leading-none text-ink/60">${i + 1}</span><span class="text-xl sm:text-2xl leading-none">${m ? m.e : '·'}</span></button>`;
  })).join('');
  return `<div class="grid md:grid-cols-2 gap-5 mt-2">
  <section>
    <h2 class="font-display text-xl font-medium mb-1">How did you feel ${dayLabel}?</h2>
    <p class="text-sm text-ink/60 mb-3">One mood per day. Tap the same mood again to clear it, or pick another day on the calendar to edit it.</p>
    <div class="grid grid-cols-5 gap-2">${MOODS.map(m =>
      `<button data-a="mood" data-v="${m.k}" aria-pressed="${cur === m.k}" class="card py-4 flex flex-col items-center gap-1 text-xs sm:text-sm font-bold ${cur === m.k ? 'ring-4 ring-sky-300' : ''}">
        <span class="text-3xl sm:text-4xl">${m.e}</span>${m.l}</button>`).join('')}</div>
    <div class="flex justify-center mt-5">${toma('w-24 h-24')}</div>
    <div class="rounded-3xl p-6 text-center bg-gradient-to-br from-butter-100 to-mint-100 shadow-sm mt-4">
      <p class="text-sm font-bold text-mint-700">Today’s affirmation</p>
      <p class="font-display text-2xl leading-snug mt-2">“${esc(AFFIRMATIONS[S.aff])}”</p>
      <button data-a="shuffle" class="mt-4 text-sm font-bold bg-white rounded-full px-4 py-1.5">Show another</button>
    </div>
  </section>
  <div class="space-y-5 self-start"><section class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <button data-a="calPrev" class="w-9 h-9 rounded-full bg-sky-100 font-bold" aria-label="Previous month">‹</button>
      <h2 class="font-display text-lg font-medium">${S.calMonth.toLocaleDateString('en', { month:'long', year:'numeric' })}</h2>
      <button data-a="calNext" ${isCurMonth ? 'disabled' : ''} class="w-9 h-9 rounded-full bg-sky-100 font-bold ${isCurMonth ? 'opacity-30' : ''}" aria-label="Next month">›</button>
    </div>
    <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink/60 mb-1">${['S','M','T','W','T','F','S'].map(x => `<span>${x}</span>`).join('')}</div>
    <div class="grid grid-cols-7 gap-1">${cells}</div>
  </section>${moodPie()}</div></div>`;
}

const MOOD_COLORS = { happy:'#ffd84d', relaxed:'#9fdcbc', calm:'#a9d6f2', angry:'#ff9aa2', sad:'#c3b1e8' };
function moodPie() {
  const n = S.moodRange, counts = {};
  for (let i = 0; i < n; i++) { const m = S.moodMap[daysAgo(i)]; if (m) counts[m] = (counts[m] || 0) + 1; }
  const total = Object.values(counts).reduce((x, y) => x + y, 0);
  let acc = 0;
  const stops = MOODS.filter(m => counts[m.k]).map(m => { const from = acc; acc += counts[m.k] / total * 100; return `${MOOD_COLORS[m.k]} ${from}% ${acc}%`; }).join(',');
  const legend = MOODS.map(m => `<li class="flex items-center gap-2 text-sm"><span class="w-3 h-3 rounded-full" style="background:${MOOD_COLORS[m.k]}"></span>${m.e} ${m.l}<span class="ml-auto font-bold">${counts[m.k] || 0}${total ? ' · ' + Math.round((counts[m.k] || 0) / total * 100) + '%' : ''}</span></li>`).join('');
  return `<section class="card p-4">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 class="font-display text-lg font-medium">Mood summary</h2>
      <div class="flex gap-1">${[7, 15, 30].map(d => `<button data-a="range" data-v="${d}" aria-pressed="${S.moodRange === d}" class="px-3 py-1 rounded-full text-xs font-bold ${S.moodRange === d ? 'bg-sky-300' : 'bg-sky-100'}">${d} days</button>`).join('')}</div></div>
    ${total ? `<div class="flex items-center gap-5"><div class="w-36 h-36 shrink-0 rounded-full" style="background:conic-gradient(${stops})" role="img" aria-label="Pie chart of your moods over the last ${n} days"></div><ul class="flex-1 space-y-1.5">${legend}</ul></div>
      <p class="text-xs text-ink/60 mt-3">${total} of the last ${n} days logged.</p>`
    : `<p class="text-sm text-ink/60 py-6 text-center">No moods logged in the last ${n} days yet. Pick a mood above to start. 🌱</p>`}
  </section>`;
}
function todoView() {
  const done = S.todos.filter(t => t.done).length;
  return `<div class="max-w-xl mx-auto mt-2">
    <h2 class="font-display text-xl font-medium mb-3">To-do list</h2>
    <div class="flex gap-2 mb-4">
      <input id="todoInput" maxlength="120" placeholder="Add a task, e.g. Wash the dishes" class="flex-1 min-w-0 border border-mint-300 rounded-2xl px-4 py-3 bg-white">
      <button data-a="addTodo" class="bg-mint-500 text-white font-bold rounded-2xl px-5">Add</button>
    </div>
    ${S.todos.length ? `<div class="space-y-2">${S.todos.map(t => `<div class="card flex items-center gap-3 px-4 py-3" style="${t.done ? 'background:#d8f3e4' : ''}">
        <button data-a="todo" data-v="${t.id}" aria-pressed="${!!t.done}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}: ${esc(t.text)}" class="w-9 h-9 shrink-0 rounded-full border-2 font-bold ${t.done ? 'bg-mint-500 border-mint-500 text-white' : 'border-mint-300 bg-white text-transparent'}">✓</button>
        <span class="flex-1 min-w-0 break-words ${t.done ? 'line-through opacity-60' : ''}">${esc(t.text)}</span>
        <button data-a="delTodo" data-v="${t.id}" class="w-8 h-8 rounded-full bg-butter-100 text-sm" aria-label="Delete ${esc(t.text)}">🗑️</button></div>`).join('')}</div>
      <div class="flex items-center justify-between mt-4"><p class="text-sm text-ink/60">${done} of ${S.todos.length} done</p>
        <button data-a="clearTodos" class="text-sm font-bold bg-white rounded-full px-4 py-2 shadow-sm">Clear all</button></div>`
    : '<p class="card p-6 text-center">Nothing here yet. Add your first task above. ✨</p>'}
  </div>`;
}
function render() {
  $('#energyText').textContent = `${dayEnergy()} / ${goal()}`;
  $('#bar').style.width = pct() + '%';
  $('#authChip').textContent = !sb ? '📴 Local mode' : S.user ? 'Sign out' : 'Sign in';
  $('#acct').textContent = S.user ? '👤 ' + S.user.email : (sb ? '👤 Guest · not signed in' : '👤 Guest · saved on this device');
  $('#view').innerHTML = ({ home:homeView, habits:habitsView, progress:progressView, focus:focusView, mood:moodView, todo:todoView })[S.tab]();
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
  const paused = !T.running && T.left < T.total;
  $('#sbtn').textContent = T.running ? '⏸ Pause' : paused ? '▶ Resume' : '▶ Start';
  $('#sbtn').className = 'px-8 py-3 rounded-2xl font-bold text-lg ' + (T.running ? 'bg-butter-300' : 'bg-mint-500 text-white');
  $('#tstate').textContent = T.running ? 'Keep going…' : paused ? '⏸ Paused' : '';
}
function tick() {
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
  paintTimer();
  if (T.left === 0) finishTimer();
}
function stopTimer() { clearInterval(T.id); T.running = false; }
/* Alarm sound (assets/alarm-04.mp3) */
const alarm = new Audio('assets/alarm-04.mp3');
const soundOn = () => localStorage.getItem('toma-sound') !== 'off';
function unlockAlarm() {   // browsers only allow sound after a tap, so warm it up on Start
  alarm.muted = true;
  const p = alarm.play();
  if (p) p.then(() => { alarm.pause(); alarm.currentTime = 0; alarm.muted = false; }).catch(() => { alarm.muted = false; });
}
function stopAlarm() { alarm.pause(); alarm.currentTime = 0; }
function ring() { if (!soundOn()) return; alarm.currentTime = 0; const p = alarm.play(); if (p) p.catch(() => {}); }

async function finishTimer() {
  stopTimer();
  const f = curFocus(); S.energy += 15; localSave();
  T.left = T.total;
  const cheers = ['Amazing focus!', 'You did it!', 'Look at you go!', 'Great work!'];
  S.focusDone = `🎉 ${cheers[Math.floor(Math.random() * cheers.length)]} You finished ${f.name} (${f.minutes} min) and earned +15 💧 for your garden.`;
  render(); confetti(); ring(); cheer(`${f.name} complete! +15 💧`);
  if (cloud()) {
    await guard(sb.from('focus_sessions').insert({ user_id:S.user.id, category:f.name, minutes:f.minutes }));
    await guard(saveEnergy());
  }
}

/* Open the add / edit focus dialog (id = null means a new focus) */
function openFocus(id) {
  const f = id ? S.focus.find(x => x.id === id) : null;
  S.editFocusId = f ? f.id : null;
  $('#focusDlgTitle').textContent = f ? 'Edit focus' : 'New focus';
  $('#fName').value = f ? f.name : '';
  $('#fMinutes').value = f ? f.minutes : 25;
  $('#fDelete').classList.toggle('hidden', !f || S.focus.length < 2);
  $('#fMsg').textContent = '';
  $('#focusDlg').showModal();
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
  cat: v => { selectFocus(v); render(); },
  addFocus: () => openFocus(null),
  editFocus: () => openFocus(T.sel),
  closeFocus: () => $('#focusDlg').close(),
  async saveFocus() {
    const name = $('#fName').value.trim().slice(0, 30), minutes = Math.round(Number($('#fMinutes').value));
    if (!name) return ($('#fMsg').textContent = 'Give it a name, like Cleaning.');
    if (!(minutes >= 1 && minutes <= 180)) return ($('#fMsg').textContent = 'Choose between 1 and 180 minutes.');
    const id = S.editFocusId; $('#focusDlg').close();
    let f;
    if (id) { f = S.focus.find(x => x.id === id); Object.assign(f, { name, minutes }); }
    else { f = { id:'f' + Date.now(), name, minutes }; S.focus.push(f); }
    selectFocus(f.id); localSave(); render();
    if (cloud()) await guard(syncFocus());
  },
  async deleteFocus() {
    const f = S.focus.find(x => x.id === S.editFocusId); if (!f || S.focus.length < 2) return;
    $('#focusDlg').close();
    if (!confirm('Delete “' + f.name + '”?')) return;
    S.focus = S.focus.filter(x => x.id !== f.id); selectFocus(S.focus[0].id); localSave(); render();
    if (cloud()) await guard(syncFocus());
  },
  startpause() {
    if (T.running) stopTimer();
    else {
      unlockAlarm(); stopAlarm();
      if (S.focusDone) { S.focusDone = ''; render(); }
      T.end = Date.now() + T.left * 1000; T.running = true; T.id = setInterval(tick, 250);
    }
    paintTimer();
  },
  reset() { stopTimer(); stopAlarm(); S.focusDone = ''; T.left = T.total; render(); },
  dismissDone() { stopAlarm(); S.focusDone = ''; render(); },
  sound() { localStorage.setItem('toma-sound', soundOn() ? 'off' : 'on'); stopAlarm(); render(); },
  range: v => { S.moodRange = Number(v); render(); },
  async addTodo() {
    const el = $('#todoInput'), text = el.value.trim().slice(0, 120); if (!text) return el.focus();
    let t = { id:Date.now(), text, done:false };
    if (cloud()) {
      const { data, error } = await sb.from('todos').insert({ text }).select().single();
      if (error) return toast('Couldn’t save: ' + error.message);
      t = data;
    }
    S.todos.push(t); localSave(); render(); $('#todoInput').focus();
  },
  async todo(v) {
    const t = S.todos.find(x => x.id === Number(v)); if (!t) return;
    t.done = !t.done; localSave(); render(); if (t.done) toast('Task done ✅');
    if (cloud()) await guard(sb.from('todos').update({ done:t.done }).eq('id', t.id));
  },
  async delTodo(v) {
    const id = Number(v); S.todos = S.todos.filter(x => x.id !== id); localSave(); render();
    if (cloud()) await guard(sb.from('todos').delete().eq('id', id));
  },
  async clearTodos() {
    if (!S.todos.length) return;
    const left = S.todos.filter(t => !t.done).length;
    if (!confirm(left ? `Clear all ${S.todos.length} tasks? ${left} aren’t done yet.` : 'Clear all tasks?')) return;
    S.todos = []; localSave(); render(); toast('List cleared 🧹');
    if (cloud()) await guard(sb.from('todos').delete().eq('user_id', S.user.id));
  },
  async mood(v) {
    const day = S.moodDay, clear = S.moodMap[day] === v;
    if (clear) delete S.moodMap[day]; else S.moodMap[day] = v;
    S.mood = S.moodMap[TODAY] || null;
    localSave(); render(); toast(clear ? 'Mood cleared' : 'Mood saved');
    if (cloud()) await guard(clear
      ? sb.from('moods').delete().match({ user_id:S.user.id, mood_date:day })
      : sb.from('moods').upsert({ user_id:S.user.id, mood_date:day, mood:v }, { onConflict:'user_id,mood_date' }));
  },
  calPrev: () => { S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() - 1, 1); render(); },
  calNext: () => { S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() + 1, 1); render(); },
  pickDay: v => { S.moodDay = v; render(); },
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
  async deleteHabit(v) {
    const id = v ? Number(v) : S.editId, h = S.habits.find(x => x.id === id); if (!h) return;
    if ($('#habitDlg').open) $('#habitDlg').close();
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

document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'todoInput') actions.addTodo(); });

/* ============ 8. START ============ */
localLoad(); render();
if (sb) sb.auth.getSession().then(async ({ data }) => {
  S.user = data.session ? data.session.user : null;
  if (S.user) { await cloudLoad(); render(); }
});
