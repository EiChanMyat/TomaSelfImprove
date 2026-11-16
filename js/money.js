/* Money tab: income and expenses with labels, balance, monthly view and pie charts */
const INCOME_LABELS = ['Salary', 'Allowance', 'Freelance', 'Gift', 'Investment', 'Refund', 'Other'];
const EXPENSE_LABELS = ['Rent', 'Bills', 'Grocery', 'Food', 'Transport', 'Makeup', 'Education', 'Health', 'Shopping', 'Entertainment', 'Other'];
const CURRENCIES = ['$', 'S$', '£', '€', '¥', '₹', '₩', '฿', 'RM', 'Rp', 'Ks', ''];
const PIE_COLORS = ['#4fb88a', '#5aaee0', '#ffd84d', '#ff9aa2', '#c3b1e8', '#f5a35c', '#9fdcbc', '#a9d6f2', '#e07aa8', '#8fa6ff'];
const cents = a => Math.round(Number(a) * 100);
const fromRow = r => ({ id:r.id, type:r.type, amount:Number(r.amount), label:r.label, note:r.note || '', date:r.tx_date });
const normMoney = m => ({ labels:{ income:(m && m.labels && m.labels.income) || [], expense:(m && m.labels && m.labels.expense) || [] }, cur:m && typeof m.cur === 'string' ? m.cur : '$' });
const fmtM = c => { const cur = S.money.cur || ''; return (cur.length > 1 ? cur + ' ' : cur) + (Math.abs(c) / 100).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }); };
const sumC = (list, type) => list.filter(t => t.type === type).reduce((a, t) => a + cents(t.amount), 0);
const monthKey = () => S.txMonth.getFullYear() + '-' + String(S.txMonth.getMonth() + 1).padStart(2, '0');
const saveMoney = () => { localSave(); return cloud() ? guard(sb.from('user_settings').upsert({ user_id:S.user.id, money:S.money, updated_at:new Date().toISOString() })) : null; };

/* labels: the ones we provide, the ones the user made (saved), and any already used. Income and expense stay separate. */
function labelsFor(type) {
  const seen = new Set(), out = [];
  [...(type === 'income' ? INCOME_LABELS : EXPENSE_LABELS), ...S.money.labels[type], ...S.tx.filter(t => t.type === type).map(t => t.label)]
    .forEach(l => { const k = l.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(l); } });
  return out;
}
function addLabel(type, raw) {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name) return { error:'Type a name for your label.' };
  if (name.length > 20) return { error:'Keep it to 20 characters or fewer.' };
  if (!/^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} &'.,-]*$/u.test(name)) return { error:'Use letters, numbers and spaces only.' };
  const hit = labelsFor(type).find(l => l.toLowerCase() === name.toLowerCase());
  if (hit) return { label:hit };
  S.money.labels[type].push(name); return { label:name, created:true };
}

/* ---------- views ---------- */
function pieCard(type, list) {   // only labels that have been used appear
  const by = {}; list.filter(t => t.type === type).forEach(t => { by[t.label] = (by[t.label] || 0) + cents(t.amount); });
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]), total = rows.reduce((a, r) => a + r[1], 0);
  let acc = 0;
  const stops = rows.map(([, c], i) => { const from = acc; acc += c / total * 100; return `${PIE_COLORS[i % PIE_COLORS.length]} ${from}% ${acc}%`; }).join(',');
  const legend = rows.map(([l, c], i) => `<li class="flex items-center gap-2 text-sm"><span class="w-3 h-3 rounded-full shrink-0" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span><span class="truncate">${esc(l)}</span><span class="ml-auto font-bold whitespace-nowrap">${fmtM(c)} · ${Math.round(c / total * 100)}%</span></li>`).join('');
  return `<section class="card p-4"><h3 class="font-display text-lg font-medium mb-3">${type === 'income' ? 'Income by label' : 'Spending by label'}</h3>
    ${total ? `<div class="flex items-center gap-4"><div class="w-32 h-32 shrink-0 rounded-full" style="background:conic-gradient(${stops})" role="img" aria-label="Pie chart of ${type} by label"></div><ul class="flex-1 min-w-0 space-y-1.5">${legend}</ul></div>`
    : `<p class="text-sm text-ink/60 py-6 text-center">No ${type} in this period yet.</p>`}</section>`;
}
function moneyView() {
  const all = S.tx, inc = sumC(all, 'income'), exp = sumC(all, 'expense'), left = inc - exp;
  const now = new Date(), isCur = S.txMonth.getFullYear() === now.getFullYear() && S.txMonth.getMonth() === now.getMonth();
  const list = (S.txAll ? all : all.filter(t => t.date.slice(0, 7) === monthKey())).slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const mi = sumC(list, 'income'), me = sumC(list, 'expense'), net = mi - me;
  const tile = (v, l, cls) => `<div class="bg-butter-100 rounded-2xl py-3 text-center"><p class="font-display text-xl font-semibold ${cls}">${v}</p><p class="text-xs text-ink/70">${l}</p></div>`;
  const rows = list.map(t => { const up = t.type === 'income';
    return `<div class="card flex items-center gap-3 px-4 py-3">
      <div class="w-10 h-10 rounded-full grid place-items-center text-lg ${up ? 'bg-mint-100' : 'bg-butter-100'}" aria-hidden="true">${up ? '⬆️' : '⬇️'}</div>
      <div class="flex-1 min-w-0"><p class="font-bold truncate">${esc(t.label)}</p><p class="text-xs text-ink/60 truncate">${new Date(t.date + 'T00:00:00').toLocaleDateString('en', { day:'numeric', month:'short', year:'numeric' })}${t.note ? ' · ' + esc(t.note) : ''}</p></div>
      <p class="font-bold whitespace-nowrap ${up ? 'amt-in' : 'amt-out'}">${up ? '+' : '−'}${fmtM(cents(t.amount))}</p>
      <button data-a="editTx" data-v="${t.id}" class="w-9 h-9 rounded-full bg-sky-100 text-sm" aria-label="Edit ${esc(t.label)}">✏️</button>
      <button data-a="delTx" data-v="${t.id}" class="w-9 h-9 rounded-full bg-butter-100 text-sm" aria-label="Delete ${esc(t.label)}">🗑️</button></div>`; }).join('');
  return `<div class="max-w-4xl mx-auto mt-2 space-y-5">
    <section class="card p-6 text-center">
      <div class="flex justify-end"><label class="text-xs text-ink/60 mr-2 self-center" for="curSel">Currency</label>
        <select id="curSel" class="border border-mint-300 rounded-lg px-2 py-1 text-sm bg-white">${CURRENCIES.map(c => `<option value="${esc(c)}" ${c === S.money.cur ? 'selected' : ''}>${c || 'None'}</option>`).join('')}</select></div>
      <p class="text-sm font-bold text-ink/70">Money left</p>
      <p class="font-display text-5xl font-semibold mt-1 ${left < 0 ? 'amt-out' : 'amt-in'}">${left < 0 ? '−' : ''}${fmtM(left)}</p>
      <p class="text-sm text-ink/60 mt-2">${S.tx.length ? `Total income ${fmtM(inc)} · Total spent ${fmtM(exp)}` : 'Add your first income or expense to get started.'}${left < 0 ? ' · You have spent more than you earned.' : ''}</p>
      <div class="flex flex-wrap justify-center gap-3 mt-5">
        <button data-a="addTx" data-v="income" class="bg-mint-500 text-white font-bold rounded-2xl px-6 py-3">+ Add income</button>
        <button data-a="addTx" data-v="expense" class="bg-butter-300 font-bold rounded-2xl px-6 py-3">− Add expense</button></div>
    </section>
    <div class="flex items-center justify-between gap-2">
      <button data-a="mPrev" ${S.txAll ? 'disabled' : ''} class="w-9 h-9 rounded-full bg-sky-100 font-bold ${S.txAll ? 'opacity-30' : ''}" aria-label="Previous month">‹</button>
      <h2 class="font-display text-lg font-medium">${S.txAll ? 'All time' : S.txMonth.toLocaleDateString('en', { month:'long', year:'numeric' })}</h2>
      <div class="flex items-center gap-2"><button data-a="mAll" aria-pressed="${!!S.txAll}" class="px-3 py-1 rounded-full text-xs font-bold ${S.txAll ? 'bg-sky-300' : 'bg-sky-100'}">All time</button>
      <button data-a="mNext" ${S.txAll || isCur ? 'disabled' : ''} class="w-9 h-9 rounded-full bg-sky-100 font-bold ${S.txAll || isCur ? 'opacity-30' : ''}" aria-label="Next month">›</button></div>
    </div>
    <div class="grid grid-cols-3 gap-3">${tile('+' + fmtM(mi), 'Income', 'amt-in')}${tile('−' + fmtM(me), 'Spent', 'amt-out')}${tile((net < 0 ? '−' : '') + fmtM(net), 'Net', net < 0 ? 'amt-out' : 'amt-in')}</div>
    <div class="grid md:grid-cols-2 gap-5">${pieCard('income', list)}${pieCard('expense', list)}</div>
    <section><h3 class="font-display text-lg font-medium mb-2">Transactions</h3>
      <div class="space-y-2">${rows || '<p class="card p-6 text-center text-ink/70">Nothing here yet. Tap “+ Add income” or “− Add expense”. 💰</p>'}</div></section>
  </div>`;
}

/* ---------- add / edit dialog ---------- */
function txErr(f, msg) { const p = $('#' + f + 'Err'); if (p) p.textContent = msg || ''; const i = $('#' + f); if (i) i.classList.toggle('field-bad', !!msg); }
function paintTxLabels() {   // shows only the labels of the chosen type
  $('#txLabels').innerHTML = labelsFor(S.txType).map(l => `<button type="button" data-a="txPick" data-v="${esc(l)}" aria-pressed="${l === S.txLabel}" class="px-3 py-1.5 rounded-full text-sm font-bold ${l === S.txLabel ? 'bg-mint-500 text-white' : 'bg-sky-100'}">${esc(l)}</button>`).join('')
    + '<button type="button" data-a="txNew" class="px-3 py-1.5 rounded-full text-sm font-bold border-2 border-dashed border-mint-300">+ New label</button>';
}
function openTx(type, id) {
  const t = id ? S.tx.find(x => x.id === id) : null;
  S.txType = t ? t.type : type; S.txId = t ? t.id : null; S.txLabel = t ? t.label : '';
  $('#txTitle').textContent = (t ? 'Edit ' : 'Add ') + S.txType;
  $('#txAmt').value = t ? t.amount : ''; $('#txDate').value = t ? t.date : TODAY; $('#txNote').value = t ? t.note : '';
  $('#txNewRow').classList.add('hidden'); $('#txNewLabel').value = '';
  $('#txDelete').classList.toggle('hidden', !t);
  ['txAmt', 'txLabel', 'txDate'].forEach(f => txErr(f, ''));
  paintTxLabels(); $('#txDlg').showModal(); $('#txAmt').focus();
}
async function removeTx(id) {
  const t = S.tx.find(x => x.id === id); if (!t) return;
  if (!confirm('Delete this ' + t.type + ' (' + t.label + ', ' + fmtM(cents(t.amount)) + ')?')) return;
  S.tx = S.tx.filter(x => x.id !== id); localSave(); render(); toast('Deleted');
  if (cloud()) await guard(sb.from('transactions').delete().eq('id', id));
}

Object.assign(actions, {
  addTx: v => openTx(v, null),
  editTx: v => openTx(null, Number(v)),
  delTx: v => removeTx(Number(v)),
  txClose: () => $('#txDlg').close(),
  txDelete: () => { $('#txDlg').close(); removeTx(S.txId); },
  txPick(v) { S.txLabel = v; txErr('txLabel', ''); paintTxLabels(); },
  txNew() { $('#txNewRow').classList.remove('hidden'); $('#txNewLabel').focus(); },
  async txAddLabel() {
    const r = addLabel(S.txType, $('#txNewLabel').value);
    if (r.error) return txErr('txLabel', r.error);
    S.txLabel = r.label; txErr('txLabel', ''); $('#txNewLabel').value = ''; $('#txNewRow').classList.add('hidden'); paintTxLabels();
    if (r.created) await saveMoney();
  },
  async txSave() {
    const amt = Number($('#txAmt').value), date = $('#txDate').value, note = $('#txNote').value.trim().slice(0, 60), label = S.txLabel;
    const e = {};
    if (!(amt > 0)) e.txAmt = 'Enter an amount above 0.'; else if (amt > 999999999) e.txAmt = 'That amount is too large.';
    if (!label) e.txLabel = 'Choose a label, or make a new one.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.txDate = 'Pick a date.';
    ['txAmt', 'txLabel', 'txDate'].forEach(f => txErr(f, e[f]));
    if (Object.keys(e).length) return;
    const amount = Math.round(amt * 100) / 100, id = S.txId;
    $('#txDlg').close();
    if (id == null) {
      let t = { id:Date.now(), type:S.txType, amount, label, note, date };
      if (cloud()) {
        const { data, error } = await sb.from('transactions').insert({ type:t.type, amount, label, note:note || null, tx_date:date }).select().single();
        if (error) return toast('Couldn’t save: ' + error.message);
        t = fromRow(data);
      }
      S.tx.push(t); toast(t.type === 'income' ? 'Income added 💰' : 'Expense added');
    } else {
      const t = S.tx.find(x => x.id === id); if (!t) return;
      Object.assign(t, { amount, label, note, date }); toast('Updated');
      if (cloud()) await guard(sb.from('transactions').update({ amount, label, note:note || null, tx_date:date }).eq('id', id));
    }
    localSave(); render(); checkBadges();
  },
  mPrev() { S.txMonth = new Date(S.txMonth.getFullYear(), S.txMonth.getMonth() - 1, 1); render(); },
  mNext() { S.txMonth = new Date(S.txMonth.getFullYear(), S.txMonth.getMonth() + 1, 1); render(); },
  mAll() { S.txAll = !S.txAll; render(); }
});
document.addEventListener('change', e => { if (e.target.id === 'curSel') { S.money.cur = e.target.value; saveMoney(); render(); } });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !$('#txDlg').open) return;
  if (e.target.id === 'txNewLabel') { e.preventDefault(); actions.txAddLabel(); }
  else if (['txAmt', 'txDate', 'txNote'].includes(e.target.id)) actions.txSave();
});
