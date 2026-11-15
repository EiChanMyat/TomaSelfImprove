/* Landing page: first screen, scroll animations, live demo card and the sign in / create account entry */
function showScreen(name) {
  document.documentElement.setAttribute('data-screen', name);
  if (name === 'landing') updateLanding();
  window.scrollTo(0, 0);
}
function updateLanding() {   // signed-in visitors see "Open my garden" instead of sign in / sign up
  document.querySelectorAll('[data-guest]').forEach(e => e.classList.toggle('hidden', !!S.user));
  document.querySelectorAll('[data-user]').forEach(e => e.classList.toggle('hidden', !S.user));
}
function openAuth(mode) {
  if (!sb) { localStorage.setItem('toma-guest', '1'); return showScreen('app'); }   // no Supabase keys: guest only
  $('#authTitle').textContent = mode === 'signup' ? 'Create your account' : 'Welcome back';
  $('#authSub').textContent = mode === 'signup' ? 'It only takes a few seconds. Your garden is waiting.' : 'Sign in to pick up where you left off.';
  $('#authMsg').textContent = '';
  $('#authDlg').showModal(); $('#email').focus();
}
const TOMA_SAYS = {
  happy:'Toma is beaming! Let’s keep that energy going.', relaxed:'Toma is relaxed. Maybe a calm focus session?',
  calm:'Toma feels calm. A perfect time to tick a habit.', angry:'Toma is grumpy. A short walk always helps.',
  sad:'Toma is a little sad, but small wins still count. 💛'
};
Object.assign(actions, {
  home: () => showScreen('landing'),
  enter: () => { localStorage.setItem('toma-guest', '1'); showScreen('app'); },
  openApp: () => showScreen('app'),
  toTop: () => window.scrollTo({ top:0, behavior:'smooth' }),
  openSignin: () => openAuth('signin'),
  openSignup: () => openAuth('signup'),
  tomaMood: v => { $('#meetToma').innerHTML = toma('w-full h-full', v, 'meetTomaSvg'); $('#meetText').textContent = TOMA_SAYS[v]; }
});

$('#navToma').innerHTML = toma('w-full h-full', 'happy', 'navTomaSvg');
$('#heroToma').innerHTML = toma('w-full h-full', 'happy', 'heroTomaSvg');
$('#meetToma').innerHTML = toma('w-full h-full', 'happy', 'meetTomaSvg');
updateLanding();

/* reveal on scroll */
const reveal = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } }), { threshold:.12 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
window.addEventListener('scroll', () => {
  $('#landingNav').classList.toggle('shadow-md', window.scrollY > 10);
  $('#toTop').classList.toggle('show', window.scrollY > 400);   // back-to-top button appears after scrolling down
}, { passive:true });

/* live demo card: habits tick themselves and the bar fills */
(function demo() {
  const rows = [...document.querySelectorAll('.demo-row')], bar = $('#demoBar'), num = $('#demoNum'), msg = $('#demoMsg');
  const vals = [0, 15, 25, 35, 35], goal = 35; let step = 0;
  const paint = () => {
    rows.forEach((r, i) => r.classList.toggle('on', i < Math.min(step, 3)));
    bar.style.width = vals[step] / goal * 100 + '%'; num.textContent = vals[step] + ' / ' + goal;
    msg.textContent = step === 4 ? 'All done today! 🎉' : '';
  };
  paint();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { step = 4; paint(); return; }
  setInterval(() => {
    if (document.hidden || document.documentElement.getAttribute('data-screen') !== 'landing') return;
    step = (step + 1) % 5; paint();
  }, 1500);
})();
