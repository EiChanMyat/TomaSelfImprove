/* Data layer: app state, localStorage and Supabase. Keys live in js/config.js */
const sb = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* ============ 2. STATE ============ */
const TODAY = new Date().toISOString().slice(0, 10);
const ICONS = { 1:'🥗', 2:'🚶‍♀️', 3:'💭', 4:'💧', 5:'🧘' };
const DEFAULT_HABITS = [
  { id:1, title:'Control carbohydrates',  energy:10 },
  { id:2, title:'Power walk 20 min',      energy:15 },
  { id:3, title:'Think of a good memory', energy:10 },
  { id:4, title:'Drink 6 glasses of water', energy:10 },
  { id:5, title:'Stretch for 5 minutes',  energy:5 }
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
const CATS = { Focus:25, Meditation:10, Reading:20 };

const S = { tab:'home', habits:DEFAULT_HABITS, done:new Set(), energy:0, mood:null, user:null, aff:new Date().getDate() % AFFIRMATIONS.length };
const T = { cat:'Focus', total:1500, left:1500, running:false, end:0, id:null };

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cloud = () => sb && S.user;
const goal = () => S.habits.reduce((a, h) => a + h.energy, 0);
const dayEnergy = () => S.habits.filter(h => S.done.has(h.id)).reduce((a, h) => a + h.energy, 0);
const pct = () => Math.min(100, Math.round(dayEnergy() / (goal() || 1) * 100));

/* ============ 3. DATA LAYER (localStorage + optional Supabase) ============ */
function localLoad() {
  S.habits = DEFAULT_HABITS.slice();
  try {
    const d = JSON.parse(localStorage.getItem('toma-v1') || '{}');
    S.energy = d.energy || 0; S.done = new Set(); S.mood = null;
    if (d.date === TODAY) { S.done = new Set(d.done || []); S.mood = d.mood || null; }
    S.habits = DEFAULT_HABITS.concat(JSON.parse(localStorage.getItem('toma-habits') || '[]'));
  } catch (e) {}
}
function localSave() {
  try {
    localStorage.setItem('toma-v1', JSON.stringify({ date:TODAY, done:[...S.done], energy:S.energy, mood:S.mood }));
    if (!cloud()) localStorage.setItem('toma-habits', JSON.stringify(S.habits.filter(h => h.custom)));
  } catch (e) {}
}
const isCustom = h => !!(h.user_id || h.custom);   // a habit the user made themselves

async function cloudLoad() {
  const [h, l, g, m] = await Promise.all([
    sb.from('habits').select('*').order('id'),
    sb.from('habit_logs').select('habit_id').eq('log_date', TODAY),
    sb.from('garden_stats').select('*').maybeSingle(),
    sb.from('moods').select('mood').gte('created_at', TODAY).order('created_at', { ascending:false }).limit(1)
  ]);
  if (h.data && h.data.length) S.habits = h.data;
  S.done = new Set((l.data || []).map(r => r.habit_id));
  S.energy = g.data ? g.data.energy : 0;
  S.mood = m.data && m.data[0] ? m.data[0].mood : null;
}
const saveEnergy = () => sb.from('garden_stats').upsert({ user_id:S.user.id, energy:S.energy, updated_at:new Date().toISOString() });
async function guard(p) {
  try { const r = await p; if (r && r.error) throw r.error; } catch (e) { toast('Couldn’t sync: ' + (e.message || 'try again')); }
}

