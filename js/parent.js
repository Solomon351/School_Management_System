
/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (d, o) => d.toLocaleDateString('en-GB', o);
const dShort = d => fmt(d, { day: 'numeric', month: 'short' });
const dLong = d => fmt(d, { weekday: 'short', day: 'numeric', month: 'short' });
const naira = n => '₦' + n.toLocaleString('en-NG');
const TODAY = new Date(2026, 9, 20);
const TERM_START = new Date(2026, 8, 14);
const HOLIDAYS = { '2026-10-01': 'Independence Day' };

/* ---------- sample data (replace with your school's records) ---------- */
const STUDENTS = [
  { id: 'chidera', name: 'Chidera Okafor', first: 'Chidera', cls: 'JSS 2A', reg: 'STU-0142', teacher: 'Mrs. Adaeze Nwosu', initials: 'CO',
    absent: { '2026-09-29': 'Unwell, parent note received' },
    late: { '2026-10-06': 'Arrived 8:25 am', '2026-10-13': 'Arrived 8:40 am' },
    terms: [
      { id: 't1', label: 'First Term 2026/27', cls: 'JSS 2A', status: 'ongoing', position: null,
        remark: 'These are continuous assessment scores only. Exam scores are added after first-term exams, which begin on 30 November.',
        subjects: [['English Language',29,null,25],['Mathematics',34,null,24],['Basic Science',27,null,24],['Basic Technology',25,null,23],['Social Studies',30,null,26],['Civic Education',27,null,25],['Business Studies',22,null,22],['Computer Studies',35,null,27],['Agricultural Science',26,null,23],['Igbo Language',28,null,26]] },
      { id: 't3', label: 'Third Term 2025/26', cls: 'JSS 1A', status: 'final', position: '5th of 38',
        remark: 'Chidera is a diligent pupil with a strong head for numbers. More practice with written work in Business Studies will lift her total further.',
        subjects: [['English Language',31,44,64],['Mathematics',35,52,58],['Basic Science',30,41,61],['Basic Technology',28,39,60],['Social Studies',33,45,66],['Civic Education',29,38,63],['Business Studies',26,33,57],['Computer Studies',36,50,68],['Agricultural Science',27,36,59],['Igbo Language',30,42,65]] }
    ],
    fees: { term: 'First Term 2026/27', due: '2026-11-06',
      items: [['Tuition',210000],['Development levy',20000],['Textbooks and stationery',38500],['ICT and laboratory fee',12000],['School bus (term)',45000],['PTA levy',5000]],
      payments: [{ d: '2026-09-08', rcpt: 'RCT-26-01834', method: 'Bank transfer', amt: 200000 }, { d: '2026-10-05', rcpt: 'RCT-26-02291', method: 'Bank transfer', amt: 80000 }] } },
  { id: 'emeka', name: 'Emeka Okafor', first: 'Emeka', cls: 'Primary 4B', reg: 'STU-0087', teacher: 'Mr. Chukwuma Eze', initials: 'EO',
    absent: { '2026-09-22': 'Family event, approved by form teacher', '2026-10-09': 'Unwell, parent note received' },
    late: { '2026-09-16': 'Arrived 8:30 am' },
    terms: [
      { id: 't1', label: 'First Term 2026/27', cls: 'Primary 4B', status: 'ongoing', position: null,
        remark: 'These are continuous assessment scores only. Exam scores are added after first-term exams, which begin on 30 November.',
        subjects: [['English Studies',27,null,25],['Mathematics',23,null,24],['Basic Science',26,null,25],['Social Studies',28,null,26],['Verbal Reasoning',24,null,23],['Quantitative Reasoning',21,null,22],['Computer Studies',30,null,25],['Creative Arts',34,null,28],['Handwriting',29,null,26],['Igbo Language',25,null,24]] },
      { id: 't3', label: 'Third Term 2025/26', cls: 'Primary 3B', status: 'final', position: '14th of 31',
        remark: 'Emeka is creative and cheerful. He needs more practice with word problems in Quantitative Reasoning. Reading aloud at home each evening will help.',
        subjects: [['English Studies',30,41,65],['Mathematics',24,36,62],['Basic Science',28,40,64],['Social Studies',29,38,66],['Verbal Reasoning',25,35,59],['Quantitative Reasoning',22,31,58],['Computer Studies',32,45,63],['Creative Arts',33,47,70],['Handwriting',30,42,67],['Igbo Language',26,34,61]] }
    ],
    fees: { term: 'First Term 2026/27', due: '2026-11-06',
      items: [['Tuition',165000],['Development levy',20000],['Textbooks and stationery',32000],['ICT fee',8000],['School bus (term)',45000],['PTA levy',5000]],
      payments: [{ d: '2026-09-08', rcpt: 'RCT-26-01835', method: 'Bank transfer', amt: 275000 }] } }
];
const NOTICES = [
  { d: '2026-10-19', cat: 'Fees', title: 'First-term fee balances are due on Friday 6 November' },
  { d: '2026-10-16', cat: 'Event', title: 'Mid-term break runs from Thursday 29 October to Monday 2 November' },
  { d: '2026-10-09', cat: 'Event', title: 'PTA general meeting on Saturday 7 November, 10:00 am, school hall' }
];

/* ---------- state ---------- */
const VIEWS = {
  children:   { label: 'My Children',  title: 'My Children',  sub: 'A quick look at each of your children.' },
  results:    { label: 'Child Result', title: 'Child Result', sub: 'Scores, grades and class position by term.' },
  fees:       { label: 'Pay fees',     title: 'Pay fees',     sub: 'See what is owed and pay the balance.' },
  attendance: { label: 'Attendance',   title: 'Attendance',   sub: 'Daily register for the current term.' },
  reports:    { label: 'Reports',      title: 'Reports',      sub: 'Download or print report cards and statements.' }
};
const ICONS = {
  children: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  results: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  fees: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  attendance: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  reports: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
};
const state = { view: 'children', child: 'chidera', term: {}, month: '2026-10', pay: { method: 'card', amount: '', error: '', busy: false, done: null } };
const kid = () => STUDENTS.find(s => s.id === state.child);
const kidById = id => STUDENTS.find(s => s.id === id);

/* ---------- calculations ---------- */
const gradeOf = p => p >= 70 ? 'A' : p >= 60 ? 'B' : p >= 50 ? 'C' : p >= 45 ? 'D' : p >= 40 ? 'E' : 'F';
const GRADE_CLS = { A: 'bg-success/15 text-success', B: 'bg-primary/10 text-primary', C: 'bg-bg text-text', D: 'bg-amber-100 text-amber-800', E: 'bg-amber-100 text-amber-800', F: 'bg-danger/10 text-danger' };
function calcTerm(t) {
  const final = t.status === 'final';
  const rows = t.subjects.map(([n, ca, ex, avg]) => {
    const total = final ? ca + ex : null;
    const pct = final ? total : Math.round(ca / 40 * 100);
    const avgPct = final ? avg : Math.round(avg / 40 * 100);
    return { n, ca, ex, avg, total, pct, avgPct, grade: final ? gradeOf(total) : null };
  });
  const mean = rows.reduce((a, r) => a + r.pct, 0) / rows.length;
  const hi = rows.reduce((a, r) => r.pct > a.pct ? r : a);
  const lo = rows.reduce((a, r) => r.pct < a.pct ? r : a);
  return { final, rows, mean, hi, lo, below: rows.filter(r => r.pct < r.avgPct).length };
}
const latestFinal = s => s.terms.find(t => t.status === 'final');
const termOf = s => s.terms.find(t => t.id === (state.term[s.id] || s.terms[0].id));
function schoolDays() { const out = []; for (let d = new Date(TERM_START); d <= TODAY; d.setDate(d.getDate() + 1)) { const w = d.getDay(); if (w > 0 && w < 6 && !HOLIDAYS[iso(d)]) out.push(new Date(d)); } return out; }
function dayStatus(s, d) {
  if (d < TERM_START) return 'out';
  if (d > TODAY) return 'future';
  const k = iso(d);
  if (HOLIDAYS[k]) return 'holiday';
  if (s.absent[k]) return 'absent';
  if (s.late[k]) return 'late';
  return 'present';
}
function attStats(s) {
  const days = schoolDays(), c = { present: 0, late: 0, absent: 0 };
  days.forEach(d => c[dayStatus(s, d)]++);
  return { days: days.length, ...c, rate: (c.present + c.late) / days.length * 100 };
}
function feeSum(s) {
  const total = s.fees.items.reduce((a, i) => a + i[1], 0);
  const paid = s.fees.payments.reduce((a, p) => a + p.amt, 0);
  return { total, paid, balance: total - paid };
}

/* ---------- small UI pieces ---------- */
const CARD = 'bg-card border border-border rounded-card shadow-sm';
const LBL = 'text-xs font-semibold uppercase tracking-wide text-muted';
const BTN = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
const BTN_P = BTN + ' bg-primary hover:bg-primary/90 text-white shadow-sm';
const BTN_O = BTN + ' border border-border bg-card hover:bg-bg';
const pill = (txt, tone) => `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${({ good: 'bg-success/15 text-success', warn: 'bg-amber-100 text-amber-800', bad: 'bg-danger/10 text-danger', info: 'bg-primary/10 text-primary', mute: 'bg-bg text-muted' })[tone]}">${txt}</span>`;
const stat = (label, value, sub) => `<div class="${CARD} p-4 sm:p-5"><p class="${LBL}">${label}</p><p class="text-2xl font-extrabold tracking-tight mt-1 tabular-nums">${value}</p><p class="text-xs text-muted mt-0.5">${sub}</p></div>`;
function childTabs() {
  return `<div class="flex flex-wrap gap-2 mb-6" role="group" aria-label="Choose a child">${STUDENTS.map(k => `<button type="button" data-child="${k.id}" aria-pressed="${k.id === state.child}" class="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-border bg-card text-sm font-semibold hover:bg-bg aria-pressed:bg-primary aria-pressed:text-white aria-pressed:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"><span class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold" aria-hidden="true">${k.initials}</span>${esc(k.first)} <span class="font-normal opacity-70">${esc(k.cls)}</span></button>`).join('')}</div>`;
}
function termTabs(s) {
  return `<div class="flex flex-wrap gap-2 mb-6" role="group" aria-label="Choose a term">${s.terms.map(t => `<button type="button" data-term="${t.id}" aria-pressed="${t.id === termOf(s).id}" class="px-3.5 py-2 rounded-input border border-border bg-card text-sm font-semibold hover:bg-bg aria-pressed:bg-navy aria-pressed:text-white aria-pressed:border-navy focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">${esc(t.label)}${t.status === 'ongoing' ? ' (ongoing)' : ''}</button>`).join('')}</div>`;
}

/* ---------- views ---------- */
function viewChildren() {
  const cards = STUDENTS.map(s => {
    const a = attStats(s), f = feeSum(s), lc = calcTerm(latestFinal(s));
    return `<article class="${CARD} p-5 sm:p-6 flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-extrabold shrink-0" aria-hidden="true">${s.initials}</div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold tracking-tight truncate">${esc(s.name)}</h2>
          <p class="text-sm text-muted">${esc(s.cls)} · Form teacher: ${esc(s.teacher)}</p>
          <p class="font-mono text-xs text-muted mt-0.5">${s.reg}</p>
        </div>
      </div>
      <dl class="grid grid-cols-3 gap-3 text-center">
        <div class="rounded-input bg-bg py-3 px-2"><dt class="${LBL} !text-[10px]">Attendance</dt><dd class="font-extrabold text-lg tabular-nums mt-0.5">${a.rate.toFixed(0)}%</dd></div>
        <div class="rounded-input bg-bg py-3 px-2"><dt class="${LBL} !text-[10px]">Last avg</dt><dd class="font-extrabold text-lg tabular-nums mt-0.5">${lc.mean.toFixed(0)}%</dd></div>
        <div class="rounded-input bg-bg py-3 px-2"><dt class="${LBL} !text-[10px]">Fee balance</dt><dd class="font-extrabold text-lg tabular-nums mt-0.5 ${f.balance > 0 ? 'text-amber-700' : 'text-success'}">${f.balance > 0 ? naira(f.balance) : 'Paid'}</dd></div>
      </dl>
      <div class="flex flex-col sm:flex-row gap-2.5 mt-auto">
        <button type="button" data-go="results" data-child="${s.id}" class="${BTN_P} flex-1">View result</button>
        <button type="button" data-go="attendance" data-child="${s.id}" class="${BTN_O} flex-1">Attendance</button>
        ${f.balance > 0 ? `<button type="button" data-go="fees" data-child="${s.id}" class="${BTN_O} flex-1">Pay fees</button>` : ''}
      </div>
    </article>`;
  }).join('');
  const totalBal = STUDENTS.reduce((a, s) => a + feeSum(s).balance, 0);
  return `<div class="grid gap-5 lg:grid-cols-2">${cards}</div>
    <div class="grid gap-5 lg:grid-cols-3 mt-5">
      <section class="${CARD} p-5 sm:p-6 lg:col-span-2">
        <h2 class="text-base font-bold tracking-tight mb-3">School notices</h2>
        <ul class="divide-y divide-border">${NOTICES.map(n => `<li class="py-3 first:pt-0 last:pb-0 flex flex-wrap items-start gap-x-3 gap-y-1"><span class="shrink-0">${pill(n.cat, n.cat === 'Fees' ? 'warn' : 'info')}</span><span class="flex-1 min-w-[12rem]">${esc(n.title)}</span><time class="text-xs text-muted" datetime="${n.d}">${dShort(pd(n.d))}</time></li>`).join('')}</ul>
      </section>
      <section class="${CARD} p-5 sm:p-6">
        <p class="${LBL}">Total fees owed</p>
        <p class="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">${naira(totalBal)}</p>
        <p class="text-xs text-muted mt-0.5">Across ${STUDENTS.length} children${totalBal ? ', due Fri 6 Nov' : ''}</p>
        ${totalBal ? `<button type="button" data-go="fees" class="${BTN_P} w-full mt-4">Pay fees</button>` : ''}
      </section>
    </div>`;
}

function viewResults() {
  const s = kid(), t = termOf(s), c = calcTerm(t);
  const bars = c.rows.map(r => `<div class="grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)_2.5rem] sm:items-center sm:gap-4"><span class="text-sm">${esc(r.n)}</span><div class="relative h-3.5 rounded bg-bg" role="img" aria-label="${esc(r.n)}: ${r.pct} out of 100, class average ${r.avgPct}"><div class="absolute inset-y-0 left-0 rounded ${r.pct < r.avgPct ? 'bg-amber-500' : 'bg-primary'}" style="width:${r.pct}%"></div><div class="absolute -top-1 -bottom-1 w-[3px] rounded bg-text" style="left:${r.avgPct}%"></div></div><span class="text-sm font-bold tabular-nums sm:text-right">${r.pct}</span></div>`).join('');
  const rows = c.rows.map(r => `<tr class="border-t border-border"><td class="py-2.5 pr-3">${esc(r.n)}</td><td class="py-2.5 px-3 text-right tabular-nums">${r.ca}</td><td class="py-2.5 px-3 text-right tabular-nums">${c.final ? r.ex : '<span class="text-muted">Pending</span>'}</td><td class="py-2.5 px-3 text-right font-bold tabular-nums">${c.final ? r.total : '—'}</td><td class="py-2.5 px-3">${c.final ? `<span class="inline-flex w-7 h-7 items-center justify-center rounded-md font-mono text-sm ${GRADE_CLS[r.grade]}">${r.grade}</span>` : '—'}</td><td class="py-2.5 pl-3 text-right tabular-nums">${r.avg}${c.final ? '' : '/40'}</td></tr>`).join('');
  const pos = t.position ? t.position.split(' of ') : null;
  return `${childTabs()}${termTabs(s)}
    <p class="text-sm text-muted -mt-2 mb-5">${esc(s.name)} · ${esc(t.cls)} · ${esc(t.label)}</p>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      ${stat(c.final ? 'Average' : 'CA average', c.mean.toFixed(1) + '%', c.final ? 'Across ' + c.rows.length + ' subjects' : 'Scaled from 40 to 100')}
      ${stat('Class position', pos ? pos[0] : '—', pos ? 'of ' + pos[1] + ' pupils' : 'Ranked after exams')}
      ${stat('Highest', c.hi.pct, esc(c.hi.n))}
      ${stat('Lowest', c.lo.pct, esc(c.lo.n))}
    </div>
    <section class="${CARD} p-5 sm:p-6 mt-5">
      <h2 class="text-base font-bold tracking-tight mb-4">${c.final ? 'Total score by subject' : 'Continuous assessment by subject'}</h2>
      <div class="space-y-3">${bars}</div>
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-5 text-xs text-muted">
        <span class="inline-flex items-center gap-1.5"><i class="inline-block w-3.5 h-2.5 rounded-sm bg-primary"></i>Score out of 100</span>
        <span class="inline-flex items-center gap-1.5"><i class="inline-block w-3.5 h-2.5 rounded-sm bg-amber-500"></i>Below class average (${c.below})</span>
        <span class="inline-flex items-center gap-1.5"><i class="inline-block w-[3px] h-3.5 rounded-sm bg-text"></i>Class average</span>
      </div>
    </section>
    <section class="${CARD} p-5 sm:p-6 mt-5">
      <h2 class="text-base font-bold tracking-tight mb-3">Score sheet</h2>
      <div class="overflow-x-auto -mx-1 px-1"><table class="w-full min-w-[30rem] text-sm"><thead><tr class="${LBL} text-left"><th class="pb-2 pr-3 font-semibold">Subject</th><th class="pb-2 px-3 font-semibold text-right">CA /40</th><th class="pb-2 px-3 font-semibold text-right">Exam /60</th><th class="pb-2 px-3 font-semibold text-right">Total</th><th class="pb-2 px-3 font-semibold">Grade</th><th class="pb-2 pl-3 font-semibold text-right">Class avg</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="text-xs text-muted mt-3">Grades: A 70 to 100, B 60 to 69, C 50 to 59, D 45 to 49, E 40 to 44, F below 40.</p>
    </section>
    <section class="${CARD} p-5 sm:p-6 mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="min-w-0"><h2 class="text-base font-bold tracking-tight mb-1.5">Form teacher's comment</h2><p class="text-sm">${esc(t.remark)}</p><p class="text-xs text-muted mt-1.5">${esc(s.teacher)}</p></div>
      <button type="button" data-go="reports" class="${BTN_O} shrink-0">Go to reports</button>
    </section>`;
}

function viewFees() {
  const s = kid(), f = feeSum(s), p = state.pay, due = pd(s.fees.due);
  const days = Math.round((due - TODAY) / 864e5);
  const amount = p.amount === '' ? f.balance : p.amount;
  const status = f.balance > 0 ? pill('Due ' + dShort(due) + ' (' + days + ' days)', 'warn') : pill('Paid in full', 'good');
  const method = (id, label, hint) => `<label class="flex items-start gap-3 p-3.5 rounded-input border border-border cursor-pointer hover:bg-bg has-[:checked]:border-primary has-[:checked]:bg-primary/5"><input type="radio" name="method" value="${id}" ${p.method === id ? 'checked' : ''} class="mt-1 accent-[#2563EB]"><span><span class="block text-sm font-semibold">${label}</span><span class="block text-xs text-muted">${hint}</span></span></label>`;
  const hints = { card: 'You will enter your card details on the secure payment page.', bank: 'Transfer to Educanize School, account 0000000000 (sample), using ' + s.reg + ' as the reference.', ussd: 'Dial the code shown after you confirm. It works on any phone.' };
  const payForm = f.balance > 0 ? `
    <section class="${CARD} p-5 sm:p-6">
      <h2 class="text-base font-bold tracking-tight">Make a payment</h2>
      <p class="text-xs text-muted mt-1 mb-4">Demo mode: payments here are simulated and no money moves.</p>
      ${p.done ? `<div class="mb-4 rounded-input bg-success/10 text-success px-4 py-3 text-sm font-medium" role="status">Payment of ${naira(p.done.amt)} recorded. Receipt <span class="font-mono">${p.done.rcpt}</span>.</div>` : ''}
      <form id="payForm" novalidate class="space-y-4">
        <div>
          <label for="payAmount" class="block text-xs font-semibold mb-1.5">Amount to pay (NGN)</label>
          <input id="payAmount" type="number" inputmode="numeric" min="100" step="100" value="${amount}" class="w-full px-3.5 py-2.5 rounded-input border ${p.error ? 'border-danger' : 'border-border'} bg-bg text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" aria-describedby="payError">
          <div class="flex flex-wrap gap-2 mt-2">
            <button type="button" data-amt="${f.balance}" class="px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-bg">Full balance</button>
            <button type="button" data-amt="${Math.round(f.balance / 2 / 100) * 100}" class="px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-bg">Half</button>
          </div>
          <p id="payError" class="${p.error ? '' : 'hidden'} text-danger text-xs mt-1.5 font-medium" role="alert">${esc(p.error)}</p>
        </div>
        <fieldset class="space-y-2"><legend class="text-xs font-semibold mb-1.5">Payment method</legend>
          ${method('card', 'Debit or credit card', '')}${method('bank', 'Bank transfer', '')}${method('ussd', 'USSD', '')}
        </fieldset>
        <p class="text-xs text-muted" id="methodHint">${hints[p.method]}</p>
        <button type="submit" ${p.busy ? 'disabled' : ''} class="${BTN_P} w-full disabled:opacity-60 disabled:cursor-not-allowed">${p.busy ? 'Processing payment...' : 'Pay now'}</button>
      </form>
    </section>` : `
    <section class="${CARD} p-5 sm:p-6 flex flex-col items-start gap-2 justify-center">
      <div class="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center text-2xl" aria-hidden="true">✓</div>
      <h2 class="text-base font-bold tracking-tight">${esc(s.first)}'s fees are paid in full</h2>
      <p class="text-sm text-muted">Nothing is owed for ${esc(s.fees.term)}. Your receipts are listed on this page.</p>
    </section>`;
  return `${childTabs()}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      ${stat('Billed', naira(f.total), esc(s.fees.term))}
      ${stat('Paid', naira(f.paid), s.fees.payments.length + ' payment' + (s.fees.payments.length > 1 ? 's' : ''))}
      ${stat('Balance', naira(f.balance), status)}
    </div>
    <div class="${CARD} p-5 sm:p-6 mt-5">
      <div class="flex justify-between text-sm mb-2"><span class="font-semibold">Payment progress</span><span class="text-muted tabular-nums">${Math.round(f.paid / f.total * 100)}% paid</span></div>
      <div class="h-3 rounded-full bg-bg overflow-hidden" role="img" aria-label="${Math.round(f.paid / f.total * 100)} percent paid"><div class="h-full bg-success" style="width:${f.paid / f.total * 100}%"></div></div>
    </div>
    <div class="grid gap-5 lg:grid-cols-2 mt-5">
      ${payForm}
      <div class="space-y-5">
        <section class="${CARD} p-5 sm:p-6"><h2 class="text-base font-bold tracking-tight mb-3">Invoice</h2>
          <table class="w-full text-sm"><tbody>${s.fees.items.map(([n, a]) => `<tr class="border-t border-border first:border-0"><td class="py-2.5 pr-3">${esc(n)}</td><td class="py-2.5 text-right tabular-nums">${naira(a)}</td></tr>`).join('')}</tbody><tfoot><tr class="border-t-2 border-border font-bold"><td class="pt-3">Total</td><td class="pt-3 text-right tabular-nums">${naira(f.total)}</td></tr></tfoot></table>
        </section>
        <section class="${CARD} p-5 sm:p-6"><h2 class="text-base font-bold tracking-tight mb-3">Payments received</h2>
          <ul class="divide-y divide-border">${s.fees.payments.map(x => `<li class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"><div class="min-w-0"><p class="text-sm font-semibold">${dShort(pd(x.d))} · ${esc(x.method)}</p><p class="font-mono text-xs text-muted">${x.rcpt}</p></div><p class="font-bold tabular-nums text-sm">${naira(x.amt)}</p></li>`).join('')}</ul>
        </section>
      </div>
    </div>`;
}

function monthGrid(s, ym) {
  const [y, m] = ym.split('-').map(Number), last = new Date(y, m, 0).getDate();
  const tone = { present: 'bg-success/15 text-success', late: 'bg-amber-100 text-amber-800', absent: 'bg-danger/10 text-danger', holiday: 'bg-primary/10 text-primary', out: 'border border-dashed border-border text-muted', future: 'border border-dashed border-border text-muted' };
  const lbl = { present: 'Present', late: 'Late', absent: 'Absent', holiday: 'Public holiday', out: 'Not in term', future: 'Upcoming' };
  const tag = { present: 'P', late: 'L', absent: 'A', holiday: 'H' };
  let offset = null, cells = '';
  for (let day = 1; day <= last; day++) {
    const d = new Date(y, m - 1, day), w = d.getDay();
    if (w === 0 || w === 6) continue;
    if (offset === null) { offset = w - 1; cells += '<div></div>'.repeat(offset); }
    const st = dayStatus(s, d);
    cells += `<div class="min-h-[3.75rem] rounded-lg p-1.5 sm:p-2 flex flex-col justify-between ${tone[st]}" aria-label="${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}: ${lbl[st]}"><span class="text-xs sm:text-sm font-semibold tabular-nums">${day}</span>${tag[st] ? `<span class="self-end font-mono text-xs sm:text-sm font-medium" aria-hidden="true">${tag[st]}</span>` : ''}</div>`;
  }
  return `<div class="grid grid-cols-5 gap-1.5 sm:gap-2">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(x => `<div class="${LBL} text-center !text-[11px]">${x}</div>`).join('')}${cells}</div>`;
}
function viewAttendance() {
  const s = kid(), a = attStats(s);
  const log = [...Object.entries(s.absent).map(([k, v]) => ({ k, v, st: 'absent' })), ...Object.entries(s.late).map(([k, v]) => ({ k, v, st: 'late' }))].sort((x, y) => x.k < y.k ? 1 : -1);
  const months = [['2026-09', 'September'], ['2026-10', 'October']];
  return `${childTabs()}
    <p class="text-sm text-muted -mt-2 mb-5">${esc(s.name)} · first term so far, ${dLong(TERM_START)} to ${dLong(TODAY)}.</p>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      ${stat('Attendance rate', a.rate.toFixed(1) + '%', a.days + ' school days')}
      ${stat('Present', a.present, 'On time')}
      ${stat('Late', a.late, 'Counted as present')}
      ${stat('Absent', a.absent, a.absent ? 'See details below' : 'No absences')}
    </div>
    <section class="${CARD} p-5 sm:p-6 mt-5">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-base font-bold tracking-tight">Calendar</h2>
        <div class="flex gap-2" role="group" aria-label="Choose a month">${months.map(([k, l]) => `<button type="button" data-month="${k}" aria-pressed="${state.month === k}" class="px-3.5 py-1.5 rounded-full border border-border text-sm font-semibold hover:bg-bg aria-pressed:bg-navy aria-pressed:text-white aria-pressed:border-navy focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">${l}</button>`).join('')}</div>
      </div>
      ${monthGrid(s, state.month)}
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 text-xs text-muted"><span><b class="font-mono">P</b> Present</span><span><b class="font-mono">L</b> Late</span><span><b class="font-mono">A</b> Absent</span><span><b class="font-mono">H</b> Public holiday</span></div>
    </section>
    <section class="${CARD} p-5 sm:p-6 mt-5">
      <h2 class="text-base font-bold tracking-tight mb-3">Absences and late arrivals</h2>
      ${log.length ? `<ul class="divide-y divide-border">${log.map(e => `<li class="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center gap-x-4 gap-y-1"><span class="w-24 text-sm font-semibold">${dLong(pd(e.k))}</span>${pill(e.st === 'absent' ? 'Absent' : 'Late', e.st === 'absent' ? 'bad' : 'warn')}<span class="text-sm text-muted flex-1 min-w-[10rem]">${esc(e.v)}</span></li>`).join('')}</ul>` : '<p class="text-sm text-muted">No absences or late arrivals this term.</p>'}
    </section>`;
}

function viewReports() {
  const s = kid(), t3 = latestFinal(s);
  const row = (title, sub, status, actions) => `<li class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"><div class="w-10 h-10 rounded-input bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ICONS.reports}"/></svg></div><div class="flex-1 min-w-0"><p class="font-semibold text-sm">${title}</p><p class="text-xs text-muted">${sub}</p></div><div class="flex flex-wrap items-center gap-2">${status}${actions}</div></li>`;
  const act = (a, label, extra) => `<button type="button" data-report="${a}" ${extra || ''} class="${BTN_O} !py-2 !px-3 !text-xs">${label}</button>`;
  return `${childTabs()}
    <section class="${CARD} p-5 sm:p-6">
      <h2 class="text-base font-bold tracking-tight mb-4">Documents for ${esc(s.name)}</h2>
      <ul class="divide-y divide-border">
        ${row('Report card, ' + esc(t3.label), esc(t3.cls) + ' · Final results with form teacher comment', pill('Ready', 'good'), act('print-card', 'Print or save as PDF') + act('csv-card', 'Download CSV'))}
        ${row('Report card, First Term 2026/27', 'Published after first-term exams', pill('After exams', 'mute'), '')}
        ${row('Attendance summary', 'First term so far, one row per school day', pill('Updated today', 'info'), act('csv-att', 'Download CSV'))}
        ${row('Fee statement', esc(s.fees.term) + ' · Invoice and payments', pill('Updated today', 'info'), act('csv-fees', 'Download CSV'))}
      </ul>
      <p class="text-xs text-muted mt-4">CSV files open in Excel, Google Sheets and Numbers. In the print window, choose "Save as PDF" as the printer to keep a copy.</p>
    </section>`;
}

/* ---------- downloads and print ---------- */
const csvCell = v => { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const csv = rows => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast('Download started');
}
function reportCardHtml(s, t) {
  const c = calcTerm(t);
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:760px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0B1B3B;padding-bottom:12px"><div><div style="font-size:26px;font-weight:800;color:#0B1B3B">Educanize School</div><div style="font-size:13px;color:#555">Terminal report card</div></div><div style="text-align:right;font-size:13px">${esc(t.label)}</div></div>
    <table style="width:100%;font-size:14px;margin:16px 0"><tr><td><b>Name:</b> ${esc(s.name)}</td><td><b>Class:</b> ${esc(t.cls)}</td></tr><tr><td><b>Registration no.:</b> ${s.reg}</td><td><b>Position:</b> ${esc(t.position || '-')}</td></tr></table>
    <table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#eef1f7;text-align:left"><th style="padding:8px;border:1px solid #ccc">Subject</th><th style="padding:8px;border:1px solid #ccc">CA /40</th><th style="padding:8px;border:1px solid #ccc">Exam /60</th><th style="padding:8px;border:1px solid #ccc">Total</th><th style="padding:8px;border:1px solid #ccc">Grade</th><th style="padding:8px;border:1px solid #ccc">Class avg</th></tr></thead><tbody>${c.rows.map(r => `<tr><td style="padding:7px 8px;border:1px solid #ccc">${esc(r.n)}</td><td style="padding:7px 8px;border:1px solid #ccc">${r.ca}</td><td style="padding:7px 8px;border:1px solid #ccc">${r.ex}</td><td style="padding:7px 8px;border:1px solid #ccc"><b>${r.total}</b></td><td style="padding:7px 8px;border:1px solid #ccc">${r.grade}</td><td style="padding:7px 8px;border:1px solid #ccc">${r.avg}</td></tr>`).join('')}</tbody></table>
    <p style="font-size:14px;margin-top:14px"><b>Average:</b> ${c.mean.toFixed(1)}%</p>
    <p style="font-size:14px;margin-top:8px"><b>Form teacher's comment:</b> ${esc(t.remark)}</p>
    <div style="display:flex;justify-content:space-between;margin-top:48px;font-size:13px"><div style="border-top:1px solid #000;padding-top:4px;width:40%">${esc(s.teacher)}, Form teacher</div><div style="border-top:1px solid #000;padding-top:4px;width:40%">Head teacher</div></div>
    <p style="font-size:11px;color:#777;margin-top:20px">Grades: A 70-100, B 60-69, C 50-59, D 45-49, E 40-44, F below 40.</p></div>`;
}
function runReport(kind) {
  const s = kid(), t3 = latestFinal(s);
  if (kind === 'print-card') { $('printArea').innerHTML = reportCardHtml(s, t3); window.print(); }
  else if (kind === 'csv-card') {
    const c = calcTerm(t3);
    download(`${s.reg}-report-card-${t3.label.replace(/[^A-Za-z0-9]+/g, '-')}.csv`, csv([['Subject', 'CA (40)', 'Exam (60)', 'Total', 'Grade', 'Class average'], ...c.rows.map(r => [r.n, r.ca, r.ex, r.total, r.grade, r.avg]), [], ['Average', '', '', c.mean.toFixed(1), '', ''], ['Position', t3.position]]));
  } else if (kind === 'csv-att') {
    const lbl = { present: 'Present', late: 'Late', absent: 'Absent', holiday: 'Public holiday' };
    const days = []; for (let d = new Date(TERM_START); d <= TODAY; d.setDate(d.getDate() + 1)) { const w = d.getDay(); if (w > 0 && w < 6) days.push(new Date(d)); }
    download(`${s.reg}-attendance-first-term-2026-27.csv`, csv([['Date', 'Day', 'Status', 'Note'], ...days.map(d => { const st = dayStatus(s, d), k = iso(d); return [k, fmt(d, { weekday: 'long' }), lbl[st], s.absent[k] || s.late[k] || HOLIDAYS[k] || '']; })]));
  } else if (kind === 'csv-fees') {
    const f = feeSum(s);
    download(`${s.reg}-fee-statement-first-term-2026-27.csv`, csv([['Type', 'Description', 'Date', 'Reference', 'Amount (NGN)'], ...s.fees.items.map(([n, a]) => ['Charge', n, '', '', a]), ...s.fees.payments.map(p => ['Payment', p.method, p.d, p.rcpt, -p.amt]), [], ['Total billed', '', '', '', f.total], ['Total paid', '', '', '', f.paid], ['Balance', '', '', '', f.balance]]));
  }
}

/* ---------- navigation and rendering ---------- */
function renderNav() {
  const item = (key, label, icon, extra) => `<li>${extra || `<a href="#${key}" ${state.view === key ? 'aria-current="page"' : ''} class="flex items-center gap-3 px-3.5 py-3 rounded-input text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 aria-[current=page]:bg-white/10 aria-[current=page]:text-white focus:outline-none focus:ring-2 focus:ring-white/60"><svg class="w-5 h-5 shrink-0 ${state.view === key ? 'text-[#22c55e]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"/></svg>${label}</a>`}</li>`;
  $('navList').innerHTML = Object.entries(VIEWS).map(([k, v]) => item(k, v.label, ICONS[k])).join('') +
    `<li class="pt-2 mt-2 border-t border-white/10"><button id="logoutBtn" type="button" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-input text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 text-left"><svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ICONS.logout}"/></svg>Logout</button></li>`;
}
function renderView() {
  const v = VIEWS[state.view];
  const body = { children: viewChildren, results: viewResults, fees: viewFees, attendance: viewAttendance, reports: viewReports }[state.view]();
  $('view').innerHTML = `<div class="anim-fade-up"><header class="mb-6"><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${v.title}</h1><p class="text-muted text-sm mt-1">${v.sub}</p></header>${body}</div>`;
}
function go(view, child) {
  if (!VIEWS[view]) view = 'children';
  if (child) state.child = child;
  state.view = view;
  if (location.hash.slice(1) !== view) { try { location.hash = view; } catch (e) {} }
  renderNav(); renderView(); closeMenu();
}

/* mobile drawer */
function openMenu() { $('sidebar').classList.remove('-translate-x-full'); $('backdrop').classList.remove('hidden'); $('menuBtn').setAttribute('aria-expanded', 'true'); document.body.classList.add('overflow-hidden'); $('closeBtn').focus(); }
function closeMenu() { $('sidebar').classList.add('-translate-x-full'); $('backdrop').classList.add('hidden'); $('menuBtn').setAttribute('aria-expanded', 'false'); document.body.classList.remove('overflow-hidden'); }

/* logout */
let lastFocus = null;
function openLogout() { lastFocus = document.activeElement; const m = $('logoutModal'); m.classList.remove('hidden'); m.classList.add('flex'); $('logoutCancel').focus(); }
function closeLogout() { const m = $('logoutModal'); m.classList.add('hidden'); m.classList.remove('flex'); if (lastFocus) lastFocus.focus(); }
function setSignedIn(on) {
  $('root').classList.toggle('hidden', !on);
  const l = $('loginScreen'); l.classList.toggle('hidden', on); l.classList.toggle('flex', !on);
  if (on) { renderNav(); renderView(); } window.scrollTo(0, 0);
}

let toastTimer;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2200); }

/* payment (simulated) */
function submitPayment() {
  const s = kid(), f = feeSum(s), p = state.pay;
  const val = Number($('payAmount').value);
  p.method = (document.querySelector('input[name=method]:checked') || {}).value || p.method;
  p.done = null;
  if (!val || val < 100) { p.error = 'Enter an amount of at least ' + naira(100) + '.'; p.amount = $('payAmount').value; renderView(); return; }
  if (val > f.balance) { p.error = 'The amount cannot be more than the balance of ' + naira(f.balance) + '.'; p.amount = val; renderView(); return; }
  p.error = ''; p.busy = true; p.amount = val; renderView();
  setTimeout(() => {
    const n = STUDENTS.reduce((a, x) => a + x.fees.payments.length, 0);
    const rec = { d: iso(TODAY), rcpt: 'RCT-26-' + String(2300 + n).padStart(5, '0'), method: ({ card: 'Card', bank: 'Bank transfer', ussd: 'USSD' })[p.method], amt: val };
    s.fees.payments.push(rec);
    state.pay = { method: p.method, amount: '', error: '', busy: false, done: rec };
    if (state.view === 'fees') renderView();
  }, 900);
}

/* events */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a');
  if (!t) return;
  if (t.id === 'menuBtn') openMenu();
  else if (t.id === 'closeBtn') closeMenu();
  else if (t.id === 'logoutBtn') { closeMenu(); openLogout(); }
  else if (t.id === 'logoutCancel') closeLogout();
  else if (t.id === 'logoutConfirm') { closeLogout(); setSignedIn(false); }
  else if (t.dataset.go) go(t.dataset.go, t.dataset.child);
  else if (t.dataset.child) { state.child = t.dataset.child; state.pay = { method: 'card', amount: '', error: '', busy: false, done: null }; renderView(); }
  else if (t.dataset.term) { state.term[state.child] = t.dataset.term; renderView(); }
  else if (t.dataset.month) { state.month = t.dataset.month; renderView(); }
  else if (t.dataset.amt) { state.pay.amount = Number(t.dataset.amt); state.pay.error = ''; renderView(); }
  else if (t.dataset.report) runReport(t.dataset.report);
  else if (t.tagName === 'A' && t.closest('#navList')) closeMenu();
});
$('backdrop').addEventListener('click', closeMenu);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('logoutModal').classList.contains('hidden')) closeLogout(); else closeMenu();
});
document.addEventListener('change', e => {
  if (e.target.name === 'method') { state.pay.method = e.target.value; const h = $('methodHint'); if (h) h.textContent = ({ card: 'You will enter your card details on the secure payment page.', bank: 'Transfer to Educanize School, account 0000000000 (sample), using ' + kid().reg + ' as the reference.', ussd: 'Dial the code shown after you confirm. It works on any phone.' })[e.target.value]; }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'payForm') submitPayment();
  else if (e.target.id === 'loginForm') { setSignedIn(true); go('children'); }
});
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (VIEWS[h] && h !== state.view) go(h); });
window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
window.addEventListener('afterprint', () => { $('printArea').innerHTML = ''; });

/* start */
(function () { const h = location.hash.slice(1); if (VIEWS[h]) state.view = h; })();
setSignedIn(true);
