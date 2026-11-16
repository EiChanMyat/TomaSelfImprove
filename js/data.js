/* Data layer: app state, localStorage and Supabase. Keys live in js/config.js */
const sb = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* ============ 2. STATE ============ */
const dateKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const TODAY = dateKey(new Date());   // your local date, so days roll over at your own midnight
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return dateKey(d); };
const DEFAULT_HABITS = [
  { id:1, title:'Control carbohydrates',    energy:10, icon:'🥗' },
  { id:2, title:'Power walk 20 min',        energy:15, icon:'🚶‍♀️' },
  { id:3, title:'Think of a good memory',   energy:10, icon:'💭' },
  { id:4, title:'Drink 6 glasses of water', energy:10, icon:'💧' },
  { id:5, title:'Stretch for 5 minutes',    energy:5,  icon:'🧘' }
];
const DEFAULT_FOCUS = [
  { id:'f1', name:'Focus', minutes:25 }, { id:'f2', name:'Meditation', minutes:10 }, { id:'f3', name:'Reading', minutes:20 }
];
const MOODS = [
  { k:'happy',   e:'😄', l:'Happy' },   { k:'relaxed', e:'😌', l:'Relaxed' },
  { k:'calm',    e:'🙂', l:'Calm' },    { k:'angry',   e:'😠', l:'Angry' },
  { k:'sad',     e:'😢', l:'Sad' }
];
const AFFIRMATIONS = [
  'I am allowed to grow at my own pace.',
  'Small steps still move me forward.',
  'I treat myself with the kindness I give others.',
  'My feelings are valid, and they will pass.',
  'I am doing better than I think.',
  'Rest is part of growing.',
  'Today I choose progress over perfect.',
  'I deserve care, starting with my own.'
];

const S = { tab:'home', habits:DEFAULT_HABITS, focus:DEFAULT_FOCUS.map(f => ({ ...f })), done:new Set(), energy:0, mood:null, moodMap:{}, moodDay:TODAY, moodRange:7, todos:[], focusDone:'', prefs:{ name:'', garden:'' }, flog:[], badges:{},
  calMonth:new Date(new Date().getFullYear(), new Date().getMonth(), 1), user:null, aff:new Date().getDate() % AFFIRMATIONS.length };
const T = { sel:'f1', total:1500, left:1500, running:false, end:0, id:null };

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cloud = () => sb && S.user;
const todayDow = () => new Date().getDay();
const onDay = (h, dow) => !h.days || !h.days.length || h.days.includes(dow);   // schedule: empty = every day
const todays = () => S.habits.filter(h => onDay(h, todayDow()));               // habits scheduled for today
const goal = () => todays().reduce((a, h) => a + h.energy, 0);
const dayEnergy = () => todays().filter(h => S.done.has(h.id)).reduce((a, h) => a + h.energy, 0);
const pct = () => Math.min(100, Math.round(dayEnergy() / (goal() || 1) * 100));

/* ============ 3. DATA LAYER (localStorage + optional Supabase) ============ */
function localLoad() {
  const get = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } };
  const d = get('toma-v1', {});
  S.energy = d.energy || 0;
  S.done = new Set(d.date === TODAY ? d.done || [] : []);
  S.hist = get('toma-hist', {});
  S.moodMap = get('toma-moods', {});
  S.todos = get('toma-todos', []);
  S.prefs = get('toma-prefs', { name:'', garden:'' });
  S.flog = get('toma-flog', []);
  S.badges = get('toma-badges', {});
  S.mood = S.moodMap[TODAY] || null;
  S.habits = get('toma-habits2', DEFAULT_HABITS.map(h => ({ ...h })));
  S.focus = get('toma-focus', DEFAULT_FOCUS.map(f => ({ ...f })));
  selectFocus(S.focus[0].id);
}
function localSave() {
  try {
    S.hist[TODAY] = S.done.size;
    localStorage.setItem('toma-v1', JSON.stringify({ date:TODAY, done:[...S.done], energy:S.energy }));
    if (cloud()) return;   // signed in: the cloud is the source of truth
    localStorage.setItem('toma-hist', JSON.stringify(S.hist));
    localStorage.setItem('toma-moods', JSON.stringify(S.moodMap));
    localStorage.setItem('toma-habits2', JSON.stringify(S.habits));
    localStorage.setItem('toma-focus', JSON.stringify(S.focus));
    localStorage.setItem('toma-todos', JSON.stringify(S.todos));
    localStorage.setItem('toma-flog', JSON.stringify(S.flog));
    localStorage.setItem('toma-badges', JSON.stringify(S.badges));
  } catch (e) {}
}

async function cloudLoad() {
  const [h, l, g, m, r, st, td, fq] = await Promise.all([
    sb.from('habits').select('*').order('id'),
    sb.from('habit_logs').select('habit_id').eq('log_date', TODAY),
    sb.from('garden_stats').select('*').maybeSingle(),
    sb.from('moods').select('mood_date,mood').order('mood_date', { ascending:false }).limit(800),
    sb.from('habit_logs').select('log_date').gte('log_date', daysAgo(60)),
    sb.from('user_settings').select('focus_types,display_name,garden_name,badges').maybeSingle(),
    sb.from('todos').select('*').order('id'),
    sb.from('focus_sessions').select('created_at,minutes').order('created_at', { ascending:false }).limit(500)
  ]);
  S.habits = h.data || [];
  S.todos = td.data || [];
  S.done = new Set((l.data || []).map(x => x.habit_id));
  S.energy = g.data ? g.data.energy : 0;
  S.moodMap = {}; (m.data || []).forEach(x => { S.moodMap[x.mood_date] = x.mood; });
  S.mood = S.moodMap[TODAY] || null;
  S.hist = {}; (r.data || []).forEach(x => { S.hist[x.log_date] = (S.hist[x.log_date] || 0) + 1; });
  const ft = st.data && st.data.focus_types;
  S.prefs = { name:(st.data && st.data.display_name) || '', garden:(st.data && st.data.garden_name) || '' };
  S.focus = ft && ft.length ? ft : DEFAULT_FOCUS.map(f => ({ ...f }));
  S.flog = (fq.data || []).map(x => ({ d:dateKey(new Date(x.created_at)), m:x.minutes }));
  S.badges = (st.data && st.data.badges) || {};
  if (typeof checkBadges === 'function') checkBadges(false);   // quietly award anything already earned
  selectFocus(S.focus[0].id);
}
const saveEnergy = () => sb.from('garden_stats').upsert({ user_id:S.user.id, energy:S.energy, updated_at:new Date().toISOString() });
const syncFocus = () => sb.from('user_settings').upsert({ user_id:S.user.id, focus_types:S.focus, updated_at:new Date().toISOString() });
async function guard(p) {
  try { const r = await p; if (r && r.error) throw r.error; } catch (e) { toast('Couldn’t sync: ' + (e.message || 'try again')); }
}

