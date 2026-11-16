/* Insights and achievements (shown on the Progress tab) */
const GOOD = ['happy', 'relaxed', 'calm'];
const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const lastDays = n => Array.from({ length:n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d; });

function insightsView() {
  const wk = lastDays(7);
  const doneWk = wk.reduce((a, d) => a + (S.hist[dateKey(d)] || 0), 0);
  const plannedWk = wk.reduce((a, d) => a + S.habits.filter(h => onDay(h, d.getDay())).length, 0);
  const rate = plannedWk ? Math.min(100, Math.round(doneWk / plannedWk * 100)) : 0;
  const focusWk = S.flog.filter(x => x.d >= daysAgo(6)).reduce((a, x) => a + x.m, 0);
  const focusAll = S.flog.reduce((a, x) => a + x.m, 0);
  const byDow = Array(7).fill(0);                                   // strongest weekday over 8 weeks
  lastDays(56).forEach(d => { byDow[d.getDay()] += S.hist[dateKey(d)] || 0; });
  const best = Math.max(...byDow), bestDay = byDow.indexOf(best);
  const strong = [], other = [];                                    // positive moods on strong vs other habit days
  lastDays(60).forEach(d => {
    const k = dateKey(d), m = S.moodMap[k]; if (!m) return;
    const planned = S.habits.filter(h => onDay(h, d.getDay())).length;
    ((S.hist[k] || 0) >= Math.max(1, Math.ceil(planned / 2)) ? strong : other).push(GOOD.includes(m));
  });
  const share = a => Math.round(a.filter(Boolean).length / a.length * 100);
  const link = strong.length >= 2 && other.length >= 2
    ? `On days you finish most of your habits, <b>${share(strong)}%</b> of your moods are positive, compared with <b>${share(other)}%</b> on other days.`
    : 'Log your mood and habits for a few more days to unlock this insight.';
  const tile = (v, l) => `<div class="bg-butter-100 rounded-2xl py-3 text-center"><p class="font-display text-2xl font-semibold">${v}</p><p class="text-xs text-ink/70 px-1">${l}</p></div>`;
  return `<section class="card p-5">
    <h2 class="font-display text-lg font-medium">Insights</h2><p class="text-sm text-ink/60 mb-3">What your last few weeks say about you</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">${tile(rate + '%', 'scheduled habits done this week')}${tile(focusWk + ' min', 'focused this week')}${tile(focusAll + ' min', 'focused in total')}${tile(S.flog.length, 'focus sessions')}</div>
    <ul class="mt-4 space-y-2 text-sm">
      <li>📅 ${best >= 3 ? `Your strongest day is <b>${DOW_FULL[bestDay]}</b>. Plan your toughest habits for it.` : 'Complete a few habits to find your strongest day.'}</li>
      <li>💭 ${link}</li></ul></section>`;
}

/* id, emoji, name, how to earn it, test */
const BADGES = [
  ['first', '🌱', 'First step', 'Tick your first habit', () => Object.values(S.hist).some(v => v > 0)],
  ['streak3', '🔥', '3-day streak', 'Do a habit 3 days in a row', () => streak() >= 3],
  ['streak7', '🌟', '7-day streak', 'Keep a 7-day streak', () => streak() >= 7],
  ['streak30', '🏆', '30-day streak', 'Keep a 30-day streak', () => streak() >= 30],
  ['perfect', '⭐', 'Perfect day', 'Finish all of a day’s habits (3 or more)', () => todays().length >= 3 && todays().every(h => S.done.has(h.id))],
  ['focus1', '⏱️', 'Focus starter', 'Finish a focus session', () => S.flog.length >= 1],
  ['focus120', '🧘', 'Deep focus', 'Focus for 120 minutes in total', () => S.flog.reduce((a, x) => a + x.m, 0) >= 120],
  ['mood1', '😊', 'Self-aware', 'Log your first mood', () => Object.keys(S.moodMap).length >= 1],
  ['mood7', '📅', 'Mood tracker', 'Log 7 moods', () => Object.keys(S.moodMap).length >= 7],
  ['garden3', '🌳', 'Garden keeper', 'Reach garden level 3', () => S.energy >= 200],
  ['tasks5', '📝', 'Task master', 'Have 5 tasks ticked at once', () => S.todos.filter(t => t.done).length >= 5],
  ['money1', '💰', 'Money minded', 'Add your first income or expense', () => S.tx.length >= 1]
];
function badgesView() {
  const got = BADGES.filter(b => S.badges[b[0]]).length;
  return `<section class="card p-5"><div class="flex items-baseline justify-between"><h2 class="font-display text-lg font-medium">Achievements</h2><span class="text-sm font-bold text-mint-700">${got} of ${BADGES.length}</span></div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">${BADGES.map(([id, e, n, d]) => { const on = S.badges[id];
      return `<div class="rounded-2xl p-3 text-center ${on ? 'bg-butter-100' : 'bg-sky-100 opacity-60'}"><div class="text-3xl">${on ? e : '🔒'}</div><p class="font-bold text-sm mt-1">${n}</p><p class="text-xs text-ink/70">${on ? 'Earned ' + on : d}</p></div>`; }).join('')}</div></section>`;
}
async function checkBadges(announce = true) {
  const fresh = BADGES.filter(b => !S.badges[b[0]] && b[4]());
  if (!fresh.length) return;
  fresh.forEach(b => { S.badges[b[0]] = TODAY; });
  localSave();   // guests keep badges in this browser
  if (cloud()) await guard(sb.from('user_settings').upsert({ user_id:S.user.id, badges:S.badges, updated_at:new Date().toISOString() }));
  if (announce) { toast('🏅 Badge unlocked: ' + fresh.map(b => b[1] + ' ' + b[2]).join(', ')); confetti(); }
  if (S.tab === 'progress') render();
}
checkBadges(false);
