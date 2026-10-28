/* My Flow - personal workout tracker. Original app, no external dependencies. */
(() => {
'use strict';
const LS_KEY = 'myflow.v1', RUN_KEY = 'myflow.run';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const now = () => new Date(window.__fakeNow || Date.now());
const todayKey = () => dkey(now());
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = k => parseKey(k).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtShort = k => parseKey(k).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

/* ---------- icons ---------- */
const P = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 6-7"/>',
  book: '<path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2z"/><path d="M12 6v14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
};
const ico = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const MARK = '<svg viewBox="0 0 100 100"><defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff27a"/><stop offset="1" stop-color="#ffc700"/></linearGradient></defs><path d="M50 88C20 66 8 48 8 32C8 18 19 10 31 10C40 10 47 15 50 22C53 15 60 10 69 10C81 10 92 18 92 32C92 48 80 66 50 88Z" fill="url(#mg)"/><path d="M50 34C56 43 62 47 62 57C62 65 56 71 50 71C44 71 38 65 38 57C38 51 42 48 44 44C46 47 47 48 48 49C49 45 49 40 50 34Z" fill="#0b0b0b"/></svg>';

/* ---------- progression ---------- */
const PROG = {
  backExt: {
    title: 'Back Extension Progression',
    levels: [
      { n: 1, name: 'Iso Holds', type: 'time', sets: 1, secs: 120, hold: true, goal: '1 × 2m hold' },
      { n: 2, name: 'Single Leg Iso Holds', type: 'time', sets: 1, secs: 60, hold: true, perSide: true, goal: '1 × 1m hold, both sides' },
      { n: 3, name: 'Reps', type: 'reps', sets: 1, reps: 30, goal: '1 × 30 reps' },
      { n: 4, name: 'Single Leg Reps', type: 'reps', sets: 1, reps: 20, perSide: true, goal: '1 × 20 reps, both sides' },
      { n: 5, name: 'Weighted Reps', type: 'reps', sets: 1, reps: 10, goal: '1 × 10 reps' }
    ]
  }
};
const LEVEL_KEYS = ['type', 'sets', 'secs', 'reps', 'hold', 'perSide'];

/* ---------- default data ---------- */
const R = (name, sets, reps, o) => Object.assign({ id: uid(), name, type: 'reps', sets, reps }, o || {});
const T = (name, sets, secs, o) => Object.assign({ id: uid(), name, type: 'time', sets, secs }, o || {});
function defaults() {
  return {
    v: 1,
    profile: { name: 'Bharath' },
    settings: { rest: 60, mode: 'start' },
    schedule: ['flow', 'mobility', 'flow', 'mobility', 'flow', null, null],
    sessions: [
      {
        id: 'flow', name: 'Flow', minutes: 60, exercises: [
          T('Sled Warm Up', 1, 600),
          R('Tibialis Raise', 2, 25),
          R('Deep Calf Raise', 2, 25),
          R('Reverse Step Up', 2, 25),
          R('Full Range Split Squats', 2, 10),
          R('External Rotation', 1, 15),
          R('Pullover', 2, 15),
          R('Trap 3 Raise', 2, 10),
          T('Back Extensions', 1, 120, { hold: true, prog: 'backExt' }),
          R('Hip Flexor Kick Out', 2, 5),
          R('Side Bend', 2, 12)
        ]
      },
      {
        id: 'mobility', name: 'Mobility Flow', minutes: 30, placeholder: true, exercises: [
          T('Couch Stretch', 2, 60, { perSide: true }),
          R('Pigeon Strength', 2, 8, { perSide: true }),
          R('Deep Squats', 2, 10),
          R('Loaded Butterfly', 2, 10),
          T('Active Hangs', 3, 30),
          R('Fire Hydrants', 2, 12, { perSide: true }),
          R('Hip Abduction', 2, 15),
          R('90/90 Rotation', 2, 8, { perSide: true }),
          R('Outer Hip Dropset', 2, 10, { perSide: true })
        ]
      }
    ],
    records: [],        // completed workouts
    checkins: [],       // {id,date,ts,pain,level,areas[]}
    journal: [],        // {id,date,ts,text,src}
    progression: { backExt: 1 },
    guides: {},         // exercise key -> {notes,url}
    lessons: [
      { id: uid(), title: 'Lesson 1', body: '' },
      { id: uid(), title: 'Lesson 2', body: '' }
    ],
    videos: [],
    lastBackup: null
  };
}
let state = load();
function load() {
  const d = defaults();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { console.warn('load failed', e); }
  return d;
}
function normalize(s) {
  const d = defaults();
  if (!s || typeof s !== 'object') return d;
  const out = Object.assign({}, d, s);
  out.profile = Object.assign({}, d.profile, s.profile);
  out.settings = Object.assign({}, d.settings, s.settings);
  out.progression = Object.assign({}, d.progression, s.progression);
  ['sessions', 'records', 'checkins', 'journal', 'lessons', 'videos'].forEach(k => { if (!Array.isArray(out[k])) out[k] = d[k]; });
  if (!Array.isArray(out.schedule) || out.schedule.length !== 7) out.schedule = d.schedule;
  if (!out.guides || typeof out.guides !== 'object') out.guides = {};
  return out;
}
let saveFailed = false;
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); saveFailed = false; }
  catch (e) { if (!saveFailed) toast('Could not save - storage full or blocked'); saveFailed = true; }
}

/* ---------- helpers on data ---------- */
const getSession = id => state.sessions.find(s => s.id === id) || null;
const keyOf = n => String(n || '').trim().toLowerCase();
function eff(ex) {
  const p = ex.prog && PROG[ex.prog];
  if (!p) return Object.assign({}, ex);
  const lv = p.levels[(state.progression[ex.prog] || 1) - 1] || p.levels[0];
  const o = Object.assign({}, ex);
  LEVEL_KEYS.forEach(k => delete o[k]);
  LEVEL_KEYS.forEach(k => { if (lv[k] != null) o[k] = lv[k]; });
  o.lvl = lv.n; o.lvlName = lv.name;
  return o;
}
function fmtDur(s) { s = Math.round(s); if (s >= 60) { const m = Math.floor(s / 60), r = s % 60; return r ? `${m}m ${r}s` : `${m}m`; } return `${s}s`; }
function fmtClock(s) { s = Math.max(0, Math.ceil(s)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function fmtTarget(e) {
  let t;
  if (e.type === 'time') t = (e.sets === 1 && !e.hold) ? fmtDur(e.secs) : `${e.sets} × ${fmtDur(e.secs)}`;
  else t = `${e.sets} × ${e.reps} reps`;
  if (e.hold) t += ' hold';
  if (e.perSide) t += ' each side';
  return t;
}
function slotsOf(e) {
  const out = [];
  for (let s = 1; s <= e.sets; s++) {
    if (e.perSide) { out.push({ set: s, side: 'Left' }); out.push({ set: s, side: 'Right' }); }
    else out.push({ set: s, side: '' });
  }
  return out;
}
const slotLabel = (e, sl, i) => `Set ${sl.set} of ${e.sets}${sl.side ? ' · ' + sl.side + ' side' : ''}`;
const recordsOn = k => state.records.filter(r => r.date === k);
function lastWeight(name) {
  for (let i = state.records.length - 1; i >= 0; i--) {
    const ex = state.records[i].exercises.find(x => keyOf(x.name) === keyOf(name));
    if (ex) { for (let j = ex.sets.length - 1; j >= 0; j--) if (ex.sets[j].weight) return ex.sets[j].weight; }
  }
  return '';
}
function allExerciseNames() {
  const seen = new Map();
  state.sessions.forEach(s => s.exercises.forEach(e => { if (!seen.has(keyOf(e.name))) seen.set(keyOf(e.name), e.name); }));
  state.records.forEach(r => r.exercises.forEach(e => { if (!seen.has(keyOf(e.name))) seen.set(keyOf(e.name), e.name); }));
  return [...seen.values()];
}
const KNOWN = ['Couch Stretch', 'Pigeon Strength', 'Deep Squats', 'Loaded Butterfly', 'Active Hangs', 'Fire Hydrants', 'Hip Abduction', '90/90 Rotation', 'Outer Hip Dropset'];
function topExercises() {
  const m = new Map();
  state.records.forEach(r => r.exercises.forEach(e => {
    if (!e.sets || !e.sets.length) return;
    const k = keyOf(e.name); const o = m.get(k) || { name: e.name, count: 0, last: '' };
    o.count++; if (r.date > o.last) o.last = r.date; m.set(k, o);
  }));
  const list = allExerciseNames().map(n => m.get(keyOf(n)) || { name: n, count: 0, last: '' });
  list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return list;
}

/* ---------- UI state ---------- */
let tab = 'home';
const ui = { cal: { y: now().getFullYear(), m: now().getMonth() }, range: 7 };
let sheets = [];
let run = null;
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
const greet = () => { const h = now().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

/* ---------- tabs / views ---------- */
function renderTabs() {
  const items = [['home', 'home'], ['progress', 'chart'], ['learn', 'book'], ['settings', 'gear']];
  $('#tabs').innerHTML = items.map(([id, ic]) =>
    `<button data-a="tab" data-t="${id}" class="${tab === id ? 'on' : ''}" aria-label="${id}">${ico(ic)}</button>`).join('');
}
function renderView() {
  const v = $('#view'); const st = v.scrollTop;
  v.innerHTML = tab === 'home' ? viewHome() : tab === 'progress' ? viewProgress() : tab === 'learn' ? viewLearn() : viewSettings();
  v.scrollTop = st;
  renderTabs();
  if (tab === 'progress') drawPain();
}

function weekDays() { const m = mondayOf(now()); return DAYS.map((_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return d; }); }
function viewHome() {
  const wk = weekDays(), tk = todayKey();
  const strip = wk.map((d, i) => {
    const k = dkey(d), plan = state.schedule[i] && getSession(state.schedule[i]), done = recordsOn(k).length > 0;
    return `<button class="wd ${k === tk ? 'today' : ''} ${plan ? 'plan' : ''} ${done ? 'done' : ''}" data-a="day" data-k="${k}" aria-label="${fmtDate(k)}${done ? ', completed' : ''}">
      <span>${DAYS[i]}</span><span class="c">${done ? ico('check') : d.getDate()}</span></button>`;
  }).join('');
  const idx = (now().getDay() + 6) % 7;
  const sess = state.schedule[idx] && getSession(state.schedule[idx]);
  const doneToday = recordsOn(tk).length > 0;
  let today;
  if (sess) {
    today = `<div class="card hero"><div class="mark">${MARK}</div>
      <h2>Today’s Workout</h2><p class="sub">${esc(sess.name)}${doneToday ? ' · <span class="pill">Done today</span>' : ''}</p>
      <div style="height:34px"></div>
      <div class="stat"><span class="l">${ico('list')}Exercises</span><b>${sess.exercises.length}</b></div>
      <div class="stat"><span class="l">${ico('clock')}Time</span><b>${sess.minutes}m</b></div>
      <div style="height:14px"></div>
      <button class="btn y" data-a="openWorkout" data-sid="${sess.id}" data-k="${tk}">${doneToday ? 'Start again' : 'Start'}</button>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="link" data-a="pickSession">Do a different session</button></div></div>`;
  } else {
    today = `<div class="card hero"><div class="mark">${MARK}</div>
      <h2>Rest Day</h2><p class="sub">Nothing scheduled today. Recover well.</p><div style="height:24px"></div>
      <button class="btn" data-a="pickSession">Pick a session anyway</button></div>`;
  }
  const ciToday = state.checkins.some(c => c.date === tk);
  return `<p class="hello">${greet()}, ${esc(state.profile.name || 'there')}</p>
    <div class="card"><h2>This Week</h2><p class="sub">Your Training Plan</p><div class="week">${strip}</div>
      <button class="btn" data-a="editSchedule">Edit Schedule</button></div>
    ${today}
    <div class="card ci" data-a="checkin" role="button"><div class="ic">${MARK.replace('<svg ', '<svg width="26" height="26" ')}</div>
      <div><div class="t">Check In</div><div class="sub" style="margin-top:2px">${ciToday ? 'Checked in today ✓ · tap to add another' : 'Track your symptoms.'}</div></div><span class="chev">${ico('chev')}</span></div>`;
}

/* ----- progress ----- */
const PAIN = [
  { n: 1, label: 'No pain / Low', short: 'Low', color: '#34c759' },
  { n: 2, label: 'Mild', short: 'Mild', color: '#ffd60a' },
  { n: 3, label: 'Moderate', short: 'Moderate', color: '#ff9f0a' },
  { n: 4, label: 'High', short: 'High', color: '#ff453a' },
  { n: 5, label: 'Severe', short: 'Severe', color: '#b3141c' }
];
function viewProgress() {
  const { y, m } = ui.cal; const tk = todayKey();
  const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
  const doneDays = new Set(state.records.map(r => r.date));
  let cells = DAYS.map(d => `<div class="h">${d[0]}</div>`).join('');
  for (let i = 0; i < lead; i++) cells += '<div></div>';
  for (let d = 1; d <= dim; d++) {
    const k = `${y}-${pad(m + 1)}-${pad(d)}`;
    cells += `<div class="d ${doneDays.has(k) ? 'on' : ''} ${k === tk ? 'today' : ''}" data-k="${k}">${d}</div>`;
  }
  const monthCount = state.records.filter(r => r.date.startsWith(`${y}-${pad(m + 1)}`)).length;
  const lv = state.progression.backExt, pl = PROG.backExt.levels[lv - 1];
  const top = topExercises().filter(t => t.count > 0).slice(0, 3);
  const mx = top.length ? top[0].count : 1;
  const topHtml = top.length ? top.map(t => `<div class="top"><div style="width:42%;font-weight:600">${esc(t.name)}</div><div class="b"><i style="width:${Math.round(t.count / mx * 100)}%"></i></div><b>${t.count}</b></div>`).join('')
    : '<div class="empty">Complete a workout to see your most trained exercises.</div>';
  const jr = [...state.journal].sort((a, b) => b.ts - a.ts);
  return `<h1 class="pg-title">Progress</h1>
    <div class="card"><div class="row sb"><button class="icon-b" data-a="calPrev" aria-label="Previous month">${ico('back')}</button>
      <h2 style="font-size:20px">${MONTHS[m]} ${y}</h2><button class="icon-b" data-a="calNext" aria-label="Next month">${ico('chev')}</button></div>
      <div class="cal">${cells}</div>
      <div class="row sb" style="margin-top:16px"><div><div class="sub" style="margin:0">Workouts Completed</div><div class="small">${state.records.length} all time</div></div><div class="big" id="monthCount">${monthCount}</div></div></div>
    <div class="card"><h2 style="font-size:21px">${PROG.backExt.title}</h2>
      <p class="sub">Level ${lv} · ${esc(pl.name)}</p>
      <div class="lvls">${PROG.backExt.levels.map(l => `<i class="${l.n <= lv ? 'on' : ''}"></i>`).join('')}</div>
      <p class="note" style="margin-bottom:14px">Goal: ${esc(pl.goal)}</p>
      <button class="btn" data-a="progPick">Change my progression</button></div>
    <div class="card"><div class="row sb"><h2 style="font-size:21px">Your Top Exercises</h2><button class="link" data-a="topAll">See all</button></div>${topHtml}</div>
    <div class="card"><h2 style="font-size:21px">Pain Progress</h2>
      <div class="rng">${[[7, '7d'], [30, '30d'], [90, '90d'], [365, '1yr']].map(([d, l]) => `<button data-a="range" data-d="${d}" class="${ui.range === d ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div id="painWrap"></div>
      <div class="legend">${PAIN.map(p => `<span><i style="background:${p.color}"></i>${p.label}</span>`).join('')}</div></div>
    <div class="card"><div class="row sb"><h2 style="font-size:21px">Journal</h2><button class="link" data-a="jAdd">+ Add entry</button></div>
      ${jr.length ? jr.slice(0, 20).map(j => `<div class="j" data-a="jEdit" data-id="${j.id}" role="button"><div class="dt">${fmtDate(j.date)}${j.src === 'checkin' ? ' · Check-in' : ''}</div><p>${esc(j.text)}</p></div>`).join('') : '<div class="empty">No entries yet.</div>'}</div>`;
}
function drawPain() {
  const wrap = $('#painWrap'); if (!wrap) return;
  const days = ui.range, end = now(), start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - days + 1);
  const t0 = start.getTime(), t1 = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1).getTime();
  const pts = state.checkins.filter(c => { const t = parseKey(c.date).getTime(); return t >= t0 && t < t1; }).sort((a, b) => a.ts - b.ts);
  const W = 340, H = 220, L = 58, Rr = 14, Tp = 14, B = 34, iw = W - L - Rr, ih = H - Tp - B;
  const yOf = n => Tp + ih - (n - 1) / 4 * ih;
  const xOf = k => L + (parseKey(k).getTime() - t0 + 43200000) / (t1 - t0) * iw;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Pain progress chart">`;
  PAIN.forEach(p => { s += `<line x1="${L}" x2="${W - Rr}" y1="${yOf(p.n)}" y2="${yOf(p.n)}" stroke="#262626" stroke-dasharray="3 4"/><text x="${L - 8}" y="${yOf(p.n) + 4}" fill="#8d8d8d" font-size="11" text-anchor="end">${p.short}</text>`; });
  const ticks = days <= 7 ? 7 : 4;
  for (let i = 0; i < ticks; i++) {
    const f = ticks === 1 ? 0 : i / (ticks - 1); const d = new Date(t0 + f * (t1 - t0 - 86400000));
    const lab = days <= 7 ? DAYS[(d.getDay() + 6) % 7] : days > 180 ? `${MONTHS[d.getMonth()].slice(0, 3)} ’${String(d.getFullYear()).slice(2)}` : `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
    const x = L + (days <= 7 ? (i + 0.5) / 7 : f) * iw;
    s += `<text x="${Math.min(W - 10, Math.max(L, x))}" y="${H - 12}" fill="#8d8d8d" font-size="11" text-anchor="middle">${lab}</text>`;
  }
  if (pts.length > 1) s += `<polyline fill="none" stroke="#3a3a3a" stroke-width="1.5" points="${pts.map(p => `${xOf(p.date).toFixed(1)},${yOf(p.level).toFixed(1)}`).join(' ')}"/>`;
  pts.forEach(p => { const c = PAIN[p.level - 1] || PAIN[0]; s += `<circle class="pdot" data-level="${p.level}" cx="${xOf(p.date).toFixed(1)}" cy="${yOf(p.level).toFixed(1)}" r="6" fill="${c.color}" stroke="#0e0e0e" stroke-width="2"/>`; });
  if (!pts.length) s += `<text x="${W / 2 + 20}" y="${H / 2}" fill="#6a6a6a" font-size="14" text-anchor="middle">No check-ins in this period</text>`;
  s += '</svg>';
  const avg = pts.length ? (pts.reduce((a, b) => a + b.level, 0) / pts.length) : 0;
  wrap.innerHTML = s + (pts.length ? `<p class="small" style="margin-top:6px">${pts.length} check-in${pts.length > 1 ? 's' : ''} · average ${PAIN[Math.round(avg) - 1].short}</p>` : '');
}

/* ----- learn ----- */
function viewLearn() {
  return `<h1 class="pg-title">Learn</h1>
    ${state.lessons.map(l => `<div class="card" data-a="lessonEdit" data-id="${l.id}" role="button"><div class="row sb"><h2 style="font-size:21px">${esc(l.title || 'Untitled')}</h2><span class="chev">${ico('pencil')}</span></div>
      <p class="sub" style="white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${l.body ? esc(l.body) : 'Tap to write your notes…'}</p></div>`).join('')}
    <button class="btn" data-a="lessonAdd">${ico('plus')} Add lesson</button>
    <div class="sec"><h3>Saved Videos</h3></div>
    ${state.videos.length ? state.videos.map(v => `<div class="ex"><div class="grow"><div class="nm">${esc(v.title || v.url)}</div><div class="dt" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(v.url)}</div></div>
      <a class="guide" style="text-decoration:none" href="${esc(normUrl(v.url))}" target="_blank" rel="noopener">Open</a>
      <button class="icon-b" data-a="videoEdit" data-id="${v.id}" aria-label="Edit">${ico('pencil')}</button></div>`).join('') : '<div class="empty">No saved videos yet. Paste links to videos you want to keep.</div>'}
    <button class="btn" data-a="videoAdd">${ico('plus')} Save a video link</button>`;
}
const normUrl = u => { u = String(u || '').trim(); return !u ? '' : /^https?:\/\//i.test(u) ? u : 'https://' + u; };

/* ----- settings ----- */
function viewSettings() {
  return `<h1 class="pg-title">Settings</h1>
    <div class="card"><label class="f" style="margin-top:0">Your name</label><input type="text" id="setName" data-in="name" value="${esc(state.profile.name)}" autocomplete="off">
      <label class="f">Default rest timer (seconds)</label>
      <div class="row"><button class="icon-b" data-a="restDef" data-d="-5">−</button><input type="number" id="setRest" data-in="rest" inputmode="numeric" min="0" max="600" value="${state.settings.rest}"><button class="icon-b" data-a="restDef" data-d="5">+</button></div></div>
    <div class="card"><h2 style="font-size:20px">Sessions</h2><p class="sub">Edit exercises, sets, reps and time, or create new sessions.</p><div style="height:12px"></div>
      <button class="btn" data-a="manageSessions">Manage sessions</button></div>
    <div class="card"><h2 style="font-size:20px">Your data</h2>
      <p class="note" style="margin:8px 0 14px">Everything is stored on this phone only. Export a backup now and then so you never lose it.${state.lastBackup ? `<br>Last backup: ${esc(fmtShort(state.lastBackup))}` : '<br>No backup yet.'}</p>
      <button class="btn y" data-a="export">Export backup (JSON)</button><div style="height:10px"></div>
      <button class="btn" data-a="copyExport">Copy backup text</button><div style="height:10px"></div>
      <button class="btn" data-a="importFile">Import from file</button>
      <input type="file" id="impFile" accept="application/json,.json,text/plain" hidden>
      <label class="f">Or paste backup text</label><textarea id="impText" style="min-height:90px" placeholder="Paste backup text here"></textarea><div style="height:10px"></div>
      <button class="btn" data-a="importText">Import pasted text</button><div style="height:10px"></div>
      <button class="btn danger" data-a="reset">Reset all data</button></div>
    <div class="card"><h2 style="font-size:20px">Notifications</h2><p class="note" style="margin-top:8px">Reminders are not included. iPhone web apps can’t schedule notifications reliably, so use an alarm or Reminders app for workout times.</p></div>
    <div class="card"><h2 style="font-size:20px">About</h2><p class="note" style="margin-top:8px">My Flow works offline once installed. To install: open in Safari, tap Share, then “Add to Home Screen”.</p></div>`;
}

/* ---------- sheets ---------- */
function openSheet(sh) { sheets.push(sh); renderSheets(); }
function closeSheet() { sheets.pop(); renderSheets(); renderView(); }
function closeAllSheets() { sheets = []; renderSheets(); renderView(); }
function renderSheets() {
  const root = $('#sheets');
  while (root.children.length > sheets.length) root.lastChild.remove();
  sheets.forEach((sh, i) => {
    let n = root.children[i];
    if (!n) { n = document.createElement('div'); n.className = 'sheet'; root.appendChild(n); }
    const b = n.querySelector('.sh-body'); const st = b ? b.scrollTop : 0;
    n.innerHTML = sheetHTML(sh);
    const nb = n.querySelector('.sh-body'); if (nb) nb.scrollTop = st;
  });
  root.style.pointerEvents = sheets.length ? 'auto' : 'none';
  if (run) ensureTick();
}
const topSheet = () => sheets[sheets.length - 1];
function head(title, sub, opts = {}) {
  return `<div class="sh-head"><div style="min-width:0"><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}${opts.meta ? `<p class="sub" style="margin-top:12px">${opts.meta}</p>` : ''}</div>
    ${opts.extra || ''}<button class="x" data-a="${opts.close || 'close'}" aria-label="Close">${ico('x')}</button></div>`;
}
const body = h => `<div class="sh-body">${h}</div>`;
const foot = h => `<div class="sh-foot">${h}</div>`;

function sheetHTML(sh) {
  switch (sh.type) {
    case 'workout': return wkHTML(sh);
    case 'log': return logHTML(sh);
    case 'run': return runHTML();
    case 'pick': return head('Pick a session', 'Choose what to train today') + body(state.sessions.map(s => `<button class="opt" data-a="openWorkout" data-sid="${s.id}" data-k="${sh.k || todayKey()}" data-replace="1"><div style="flex:1"><div style="font-weight:700">${esc(s.name)}</div><div class="d2">${s.exercises.length} exercises · ${s.minutes}m</div></div>${ico('chev')}</button>`).join('') || '<div class="empty">No sessions yet.</div>');
    case 'schedule': return scheduleHTML();
    case 'sessions': return head('Sessions', 'Tap one to edit it') + body(state.sessions.map(s => `<button class="opt" data-a="sessEd" data-sid="${s.id}"><div style="flex:1"><div style="font-weight:700">${esc(s.name)}</div><div class="d2">${s.exercises.length} exercises · ${s.minutes}m</div></div>${ico('chev')}</button>`).join('') + `<button class="btn" data-a="sessNew">${ico('plus')} New session</button>`);
    case 'sessEd': return sessEdHTML(sh);
    case 'exEd': return exEdHTML(sh);
    case 'guide': return guideHTML(sh);
    case 'checkin': return checkinHTML(sh);
    case 'progPick': return progHTML(sh);
    case 'topAll': return head('All Exercises', 'How often you’ve trained each one') + body(topExercises().map(t => `<div class="ex"><div class="grow"><div class="nm">${esc(t.name)}</div><div class="dt">${t.count ? `${t.count} time${t.count > 1 ? 's' : ''} · last ${fmtShort(t.last)}` : 'Not trained yet'}</div></div><button class="guide" data-a="guide" data-name="${esc(t.name)}">Guide</button></div>`).join(''));
    case 'jEdit': { const j = sh.id && state.journal.find(x => x.id === sh.id); return head(j ? 'Edit entry' : 'New entry', j ? fmtDate(j.date) : fmtDate(todayKey())) + body(`<textarea id="jText" data-in="jtext" placeholder="How are you feeling? Anything worth noting…">${esc(j ? j.text : sh.text || '')}</textarea>`) + foot(`<button class="btn y" data-a="jSave">Save</button>${j ? '<div style="height:10px"></div><button class="btn danger" data-a="jDel">Delete entry</button>' : ''}`); }
    case 'lessonEd': { const l = state.lessons.find(x => x.id === sh.id); if (!l) return head('Lesson', '') + body('<div class="empty">Not found</div>'); return head('Edit lesson', '') + body(`<label class="f" style="margin-top:0">Title</label><input type="text" data-in="ltitle" value="${esc(l.title)}"><label class="f">Notes</label><textarea data-in="lbody" style="min-height:260px" placeholder="Write what you learned, cues to remember, links…">${esc(l.body)}</textarea>`) + foot(`<button class="btn y" data-a="close">Done</button><div style="height:10px"></div><button class="btn danger" data-a="lessonDel">Delete lesson</button>`); }
    case 'videoEd': { const v = sh.id && state.videos.find(x => x.id === sh.id); return head(v ? 'Edit video' : 'Save a video link', '') + body(`<label class="f" style="margin-top:0">Title</label><input type="text" id="vTitle" value="${esc(v ? v.title : '')}" placeholder="e.g. Couch stretch tutorial"><label class="f">Link</label><input type="url" id="vUrl" value="${esc(v ? v.url : '')}" placeholder="https://youtube.com/…" autocapitalize="off" autocorrect="off">`) + foot(`<button class="btn y" data-a="videoSave">Save</button>${v ? '<div style="height:10px"></div><button class="btn danger" data-a="videoDel">Delete</button>' : ''}`); }
  }
  return '';
}

function wkHTML(sh) {
  const s = getSession(sh.sid); if (!s) return head('Workout', '') + body('<div class="empty">Session not found.</div>');
  const isToday = sh.k === todayKey();
  const rows = s.exercises.map((x, i) => { const e = eff(x); return `<div class="ex"><div class="n">${i + 1}</div><div class="grow"><div class="nm">${esc(e.name)}</div><div class="dt">${esc(fmtTarget(e))}</div>${e.lvl ? `<div class="lv">Lvl ${e.lvl} - ${esc(e.lvlName)}</div>` : ''}</div><button class="guide" data-a="guide" data-name="${esc(e.name)}">Guide</button></div>`; }).join('');
  const mode = state.settings.mode;
  return head(`${isToday ? 'Today’s ' : ''}${esc(s.name)} Workout`, 'Start or log your scheduled session', { meta: `${s.exercises.length} exercises  •  ${s.minutes}m${isToday ? '' : '  •  ' + fmtDate(sh.k)}`, extra: `<button class="icon-b" data-a="sessEd" data-sid="${s.id}" aria-label="Edit session" style="margin-top:2px">${ico('pencil')}</button>` })
    + body((s.placeholder ? `<div class="banner">Defaults are placeholders, edit sets/reps. <button class="btn sm ghost" data-a="sessEd" data-sid="${s.id}">Edit now</button></div>` : '') + (rows || '<div class="empty">No exercises yet. Tap the pencil to add some.</div>'))
    + foot(`<div class="mode-l">${ico('help')} Which Mode?</div><div class="seg"><button data-a="mode" data-m="log" class="${mode === 'log' ? 'on' : ''}">Log</button><button data-a="mode" data-m="start" class="${mode === 'start' ? 'on' : ''}">Start</button></div>
    <button class="btn y" data-a="${mode === 'log' ? 'beginLog' : 'beginRun'}" ${s.exercises.length ? '' : 'disabled'}>${mode === 'log' ? 'Log Workout' : 'Start Workout'}</button>`);
}

function scheduleHTML() {
  return head('Edit Schedule', 'Tap a day to change its session') + body(
    DAYS_LONG.map((d, i) => { const s = state.schedule[i] && getSession(state.schedule[i]); return `<button class="sched" data-a="cycle" data-i="${i}"><span>${d}</span><span class="s ${s ? '' : 'rest'}">${s ? esc(s.name) : 'Rest'}</span></button>`; }).join('')
    + `<p class="note" style="margin:6px 4px 14px">Tap repeatedly to cycle through your sessions and Rest.</p><button class="btn" data-a="manageSessions">Manage sessions</button>`)
    + foot('<button class="btn y" data-a="close">Done</button>');
}

function sessEdHTML(sh) {
  const s = getSession(sh.sid); if (!s) return head('Session', '') + body('<div class="empty">Not found</div>');
  const rows = s.exercises.map((x, i) => { const e = eff(x); return `<div class="ex"><div class="n">${i + 1}</div><div class="grow" data-a="exEd" data-sid="${s.id}" data-id="${x.id}" role="button"><div class="nm">${esc(e.name)}</div><div class="dt">${esc(fmtTarget(e))}</div>${e.lvl ? `<div class="lv">Lvl ${e.lvl} - ${esc(e.lvlName)}</div>` : ''}</div>
    <div style="display:flex;flex-direction:column;gap:6px"><button class="icon-b" data-a="exUp" data-sid="${s.id}" data-id="${x.id}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${ico('up')}</button><button class="icon-b" data-a="exDown" data-sid="${s.id}" data-id="${x.id}" ${i === s.exercises.length - 1 ? 'disabled' : ''} aria-label="Move down">${ico('down')}</button></div>
    <div style="display:flex;flex-direction:column;gap:6px"><button class="icon-b" data-a="exEd" data-sid="${s.id}" data-id="${x.id}" aria-label="Edit">${ico('pencil')}</button><button class="icon-b red" data-a="exDel" data-sid="${s.id}" data-id="${x.id}" aria-label="Remove">${ico('trash')}</button></div></div>`; }).join('');
  return head('Edit session', '') + body(
    (s.placeholder ? `<div class="banner">Defaults are placeholders, edit sets/reps. <button class="btn sm ghost" data-a="sessOk" data-sid="${s.id}">I’ve edited these</button></div>` : '')
    + `<label class="f" style="margin-top:0">Session name</label><input type="text" data-in="sname" data-sid="${s.id}" value="${esc(s.name)}">
    <label class="f">Estimated time (minutes)</label><input type="number" inputmode="numeric" min="1" data-in="smin" data-sid="${s.id}" value="${s.minutes}">
    <div class="sec"><h3>Exercises</h3></div>${rows || '<div class="empty">No exercises yet.</div>'}
    <button class="btn" data-a="exEd" data-sid="${s.id}" data-id="">${ico('plus')} Add exercise</button>
    <div style="height:18px"></div><button class="btn danger" data-a="sessDel" data-sid="${s.id}">Delete session</button>`)
    + foot('<button class="btn y" data-a="close">Done</button>');
}

function exEdHTML(sh) {
  const s = getSession(sh.sid); const x = sh.id ? s.exercises.find(e => e.id === sh.id) : null;
  const d = sh.draft || (sh.draft = x ? Object.assign({}, x) : { name: '', type: 'reps', sets: 2, reps: 10, secs: 30 });
  const secs = d.secs || 0;
  const hasProg = !!d.prog;
  return head(x ? 'Edit exercise' : 'Add exercise', esc(s.name)) + body(
    `<label class="f" style="margin-top:0">Name</label><input type="text" id="exName" list="exnames" value="${esc(d.name)}" autocomplete="off" placeholder="Exercise name">
    <datalist id="exnames">${[...new Set([...allExerciseNames(), ...KNOWN])].map(n => `<option value="${esc(n)}">`).join('')}</datalist>
    <label class="f">Measured in</label><div class="seg" style="margin-top:0"><button data-a="exType" data-t="reps" class="${d.type === 'reps' ? 'on' : ''}">Reps</button><button data-a="exType" data-t="time" class="${d.type === 'time' ? 'on' : ''}">Time</button></div>
    <div class="two"><div><label class="f" style="margin-top:0">Sets</label><input type="number" inputmode="numeric" id="exSets" min="1" value="${d.sets}"></div>
    ${d.type === 'reps' ? `<div><label class="f" style="margin-top:0">Reps</label><input type="number" inputmode="numeric" id="exReps" min="1" value="${d.reps || 10}"></div>`
      : `<div><label class="f" style="margin-top:0">Time per set</label><div class="two"><input type="number" inputmode="numeric" id="exMin" min="0" value="${Math.floor(secs / 60)}" aria-label="minutes"><input type="number" inputmode="numeric" id="exSec" min="0" max="59" value="${secs % 60}" aria-label="seconds"></div><p class="small" style="margin-top:4px">minutes · seconds</p></div>`}</div>
    ${hasProg ? `<div class="banner" style="margin-top:14px">Sets and reps for this exercise come from your Back Extension progression level (Progress tab).<button class="btn sm ghost" data-a="exNoProg">Use my own sets/reps instead</button></div>`
      : `<label class="chk"><input type="checkbox" id="exSide" ${d.perSide ? 'checked' : ''}> Each side (left &amp; right)</label>${d.type === 'time' ? `<label class="chk" style="margin-top:0"><input type="checkbox" id="exHold" ${d.hold ? 'checked' : ''}> Show as a hold</label>` : ''}${/back extension/i.test(d.name) ? `<button class="btn" data-a="exProg">Drive by Back Extension progression</button>` : ''}`}`)
    + foot('<button class="btn y" data-a="exSave">Save exercise</button>');
}

function guideHTML(sh) {
  const g = state.guides[keyOf(sh.name)] || { notes: '', url: '' };
  const q = encodeURIComponent(sh.name + ' exercise');
  return head(esc(sh.name), 'Guide') + body(
    `<label class="f" style="margin-top:0">My notes &amp; cues</label><textarea id="gNotes" data-in="gnotes" data-name="${esc(sh.name)}" placeholder="Setup, form cues, what to feel, mistakes to avoid…">${esc(g.notes)}</textarea>
    <label class="f">Video or link (optional)</label><input type="url" id="gUrl" data-in="gurl" data-name="${esc(sh.name)}" value="${esc(g.url)}" placeholder="https://…" autocapitalize="off" autocorrect="off">
    <div style="height:12px"></div>
    ${g.url ? `<a class="btn" id="gOpen" href="${esc(normUrl(g.url))}" target="_blank" rel="noopener">${ico('play')} Open my video</a><div style="height:10px"></div>` : '<span id="gOpenSlot"></span>'}
    <a class="btn y" id="gYt" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">${ico('ext')} Search YouTube</a>
    <p class="note" style="margin-top:12px">Notes and the link save automatically.</p>`);
}

function checkinHTML(sh) {
  const name = esc(state.profile.name || '');
  const back = sh.hist && sh.hist.length ? `<button class="btn ghost" data-a="ciBack">Back</button>` : '';
  let h;
  if (sh.step === 'pain') {
    h = head('Check In', 'Track your symptoms') + body(`<div class="ck"><h1>Do you have any pain today?</h1></div><div class="big2"><button class="btn y" data-a="ciPain" data-v="1">Yes</button><button class="btn" data-a="ciPain" data-v="0">No</button></div>`);
  } else if (sh.step === 'level') {
    h = head('Check In', 'Pain level') + body(`<div class="ck" style="padding-top:6px"><h1>How bad is it?</h1></div>` + PAIN.map(p => `<button class="opt ${sh.level === p.n ? 'on' : ''}" data-a="ciLevel" data-n="${p.n}"><span class="dot" style="border-color:${p.color};${sh.level === p.n ? `background:${p.color}` : ''}"></span><span style="flex:1"><b>${p.n}</b> · ${p.label}</span></button>`).join('')) + foot(back);
  } else if (sh.step === 'area') {
    const AREAS = ['Neck', 'Shoulder', 'Upper back', 'Lower back', 'Hip', 'Glute', 'Knee', 'Calf / Shin', 'Ankle / Foot', 'Elbow / Wrist', 'Other'];
    h = head('Check In', 'Where does it hurt?') + body(`<div class="ck" style="padding-top:6px"><h1>Which area?</h1><p class="sub" style="margin-bottom:18px">Pick all that apply</p></div><div class="chips">${AREAS.map(a => `<button data-a="ciArea" data-v="${a}" class="${sh.areas.includes(a) ? 'on' : ''}">${a}</button>`).join('')}</div>`) + foot(`<button class="btn y" data-a="ciNext">Continue</button>${sh.hist.length ? '<div style="height:8px"></div>' + back : ''}`);
  } else if (sh.step === 'journal') {
    h = head('Check In', 'Journal (optional)') + body(`<div class="ck" style="padding-top:6px"><h1>Anything to note?</h1></div><textarea id="ciJournal" data-in="cijournal" placeholder="How did you feel? Sleep, stress, what helped or hurt…">${esc(sh.journal)}</textarea>`) + foot(`<button class="btn y" data-a="ciFinish">Finish</button><div style="height:8px"></div>${back}`);
  } else {
    h = head('Check In', '') + body(`<div class="ck"><div style="width:96px;height:96px;margin:30px auto 20px">${MARK}</div><h1>Thanks${name ? ', ' + name : ''}!</h1><p class="sub">Your check-in is saved. See your trend in Progress.</p></div>`) + foot('<button class="btn y" data-a="close">Done</button>');
  }
  return h;
}

function progHTML(sh) {
  const cur = sh.sel || state.progression.backExt;
  return head('Change my progression', 'Back Extensions') + body(
    `<p class="note" style="margin:0 2px 14px">The level you pick is used the next time you do Back Extensions.</p>` +
    PROG.backExt.levels.map(l => `<button class="opt ${cur === l.n ? 'on' : ''}" data-a="progSel" data-n="${l.n}"><span class="dot"></span><span style="flex:1"><div style="font-weight:700">Level ${l.n} · ${esc(l.name)}</div><div class="d2">Goal: ${esc(l.goal)}</div></span></button>`).join(''))
    + foot('<button class="btn y" data-a="progSave">Save level</button>');
}

/* ---------- log mode ---------- */
function logHTML(sh) {
  const cards = sh.items.map((e, i) => {
    const sl = slotsOf(e), isT = e.type === 'time', lw = lastWeight(e.name);
    const rows = sl.map((s, j) => `<div class="logset"><span>${e.perSide ? `S${s.set} ${s.side[0]}` : `Set ${s.set}`}</span>
      <input type="number" inputmode="decimal" min="0" data-ex="${i}" data-set="${j}" data-f="${isT ? 'secs' : 'reps'}" value="${isT ? e.secs : e.reps}" aria-label="${isT ? 'seconds' : 'reps'}">
      <input type="number" inputmode="decimal" min="0" step="0.5" data-ex="${i}" data-set="${j}" data-f="weight" value="${lw}" placeholder="kg" aria-label="weight kg"></div>`).join('');
    return `<div class="card" style="padding:14px"><div class="row sb"><div><div class="nm" style="font-size:18px;font-weight:700">${i + 1}. ${esc(e.name)}</div><div class="small">Target: ${esc(fmtTarget(e))}${e.lvl ? ` · Lvl ${e.lvl}` : ''}</div></div>
      <label class="row" style="gap:8px;color:var(--mut);font-size:14px"><input type="checkbox" data-ex="${i}" data-f="done" checked style="width:22px;height:22px;accent-color:#ffd60a">Done</label></div>
      <div class="logset" style="margin-top:12px"><span></span><span>${isT ? 'Seconds' : 'Reps'}</span><span>Weight (kg)</span></div>${rows}</div>`;
  }).join('');
  return head('Log Workout', esc(sh.name)) + body(`<label class="f" style="margin-top:0">Date</label><input type="date" id="logDate" value="${sh.k}" max="${todayKey()}"><div style="height:14px"></div>${cards}`)
    + foot('<button class="btn y" data-a="logSave">Save workout</button>');
}

/* ---------- run (start mode) ---------- */
let audioCtx = null, wakeLock = null, tickI = null;
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {} }
function beep(n = 2) {
  try { navigator.vibrate && navigator.vibrate(200); } catch (e) {}
  if (!audioCtx) return;
  for (let i = 0; i < n; i++) {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
    const t = audioCtx.currentTime + i * 0.25; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.start(t); o.stop(t + 0.2);
  }
}
async function getWake() { try { if (navigator.wakeLock && run) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {} }
function saveRun() { try { run ? localStorage.setItem(RUN_KEY, JSON.stringify(run)) : localStorage.removeItem(RUN_KEY); } catch (e) {} }
function startRun(sid, k) {
  const s = getSession(sid); if (!s || !s.exercises.length) return toast('Add exercises first');
  const items = s.exercises.map(eff);
  run = { sid, k, sessionName: s.name, items, results: items.map(() => []), idx: 0, slot: 0, phase: 'work', restSecs: state.settings.rest, restEnd: 0, timer: null, startedAt: Date.now() };
  setWork(0);
  unlockAudio(); getWake();
  openSheet({ type: 'run' });
}
function firstUnrecorded(i) { const n = slotsOf(run.items[i]).length; for (let j = 0; j < n; j++) if (!run.results[i][j]) return j; return 0; }
function setWork(i) {
  const r = run; r.idx = i; r.slot = firstUnrecorded(i); r.phase = 'work';
  r.timer = { running: false, endAt: 0, remaining: r.items[i].type === 'time' ? r.items[i].secs : 0 };
  saveRun();
}
function ensureTick() { if (!tickI) tickI = setInterval(tick, 250); }
const setTmr = t => { const el = $('#tmr'); if (el && el.textContent !== t) el.textContent = t; };
function timerRemaining() { const t = run.timer; return t.running ? Math.max(0, Math.ceil((t.endAt - Date.now()) / 1000)) : t.remaining; }
function tick() {
  if (!run || !sheets.some(s => s.type === 'run')) { clearInterval(tickI); tickI = null; return; }
  if (run.phase === 'rest') {
    const rem = Math.ceil((run.restEnd - Date.now()) / 1000); setTmr(fmtClock(rem));
    if (rem <= 0) { beep(1); setWork(run.idx); renderSheets(); }
  } else if (run.phase === 'work' && run.timer.running) {
    const rem = timerRemaining(); setTmr(fmtClock(rem));
    if (rem <= 0) { beep(3); run.timer.running = false; run.timer.remaining = 0; recordSet(true); }
  }
}
function recordSet(auto) {
  const r = run, e = r.items[r.idx], sls = slotsOf(e), sl = sls[r.slot], rec = { side: sl.side };
  if (e.type === 'time') { let el = e.secs - timerRemaining(); if (auto || el <= 0) el = e.secs; rec.secs = Math.round(el); }
  else { const inp = $('#rReps'); rec.reps = Math.max(0, parseInt(inp && inp.value, 10) || e.reps); const w = parseFloat(($('#rW') || {}).value); if (w > 0) rec.weight = w; }
  r.results[r.idx][r.slot] = rec;
  if (r.slot + 1 < sls.length) { r.slot++; r.timer = { running: false, endAt: 0, remaining: e.secs || 0 }; }
  else if (r.idx + 1 < r.items.length) { setWork(r.idx + 1); }
  else { r.phase = 'finish'; saveRun(); return renderSheets(); }
  if (r.restSecs > 0) { r.phase = 'rest'; r.restEnd = Date.now() + r.restSecs * 1000; }
  else r.phase = 'work';
  saveRun(); renderSheets();
}
function runHTML() {
  const r = run; if (!r) return '';
  const total = r.items.reduce((a, e) => a + slotsOf(e).length, 0), done = r.results.reduce((a, x) => a + x.filter(Boolean).length, 0);
  const bar = `<div class="bar"><i style="width:${Math.round(done / total * 100)}%"></i></div>`;
  const hd = (t, s) => head(t, s, { close: 'runClose' });
  if (r.phase === 'finish') {
    const rows = r.items.map((e, i) => { const n = r.results[i].filter(Boolean).length; return `<div class="ex"><div class="n">${i + 1}</div><div class="grow"><div class="nm">${esc(e.name)}</div><div class="dt">${n ? `${n} set${n > 1 ? 's' : ''} done` : 'Skipped'}</div></div>${n ? `<span style="color:var(--y)">${ico('check')}</span>` : ''}</div>`; }).join('');
    return hd('Workout complete', `${esc(r.sessionName)} · ${done} of ${total} sets`) + body(rows) + foot('<button class="btn y" data-a="runSave">Save workout</button><div style="height:8px"></div><button class="btn ghost" data-a="prevEx">Back</button>');
  }
  const e = r.items[r.idx], sl = slotsOf(e)[r.slot];
  const lvl = e.lvl ? `<div class="lv" style="color:var(--y);margin-top:6px">Lvl ${e.lvl} - ${esc(e.lvlName)}</div>` : '';
  if (r.phase === 'rest') {
    return hd('Rest', `Next: ${r.idx + 1} of ${r.items.length}`) + body(`<div class="run">${bar}<div class="sub">Rest</div><div class="clock rest" id="tmr">${fmtClock((r.restEnd - Date.now()) / 1000)}</div>
      <div class="set" style="color:#fff">Next up: ${esc(e.name)}</div><div class="tg">${esc(slotLabel(e, sl))}</div>
      <div class="two" style="margin-top:28px"><button class="btn" data-a="restAdj" data-d="-15">−15s</button><button class="btn" data-a="restAdj" data-d="15">+15s</button></div></div>`)
      + foot('<button class="btn y" data-a="restSkip">Skip rest</button>');
  }
  let main, ctrl;
  if (e.type === 'time') {
    const run_ = r.timer.running;
    main = `<div class="clock" id="tmr">${fmtClock(timerRemaining())}</div><p class="small">${e.hold ? 'Hold for' : 'Work for'} ${fmtDur(e.secs)}</p>`;
    ctrl = `<button class="btn y" data-a="tToggle">${run_ ? 'Pause' : (r.timer.remaining < e.secs ? 'Resume' : 'Start timer')}</button><div class="two" style="margin-top:10px"><button class="btn" data-a="tReset">Reset</button><button class="btn" data-a="runDone">Mark done</button></div>`;
  } else {
    const lw = lastWeight(e.name);
    main = `<div class="stepper"><button data-a="step" data-d="-1" aria-label="fewer reps">−</button><input type="number" inputmode="numeric" id="rReps" value="${e.reps}"><button data-a="step" data-d="1" aria-label="more reps">+</button></div><p class="small">reps</p>
      <div class="wrow"><span class="small">Weight</span><input type="number" inputmode="decimal" id="rW" step="0.5" placeholder="kg" aria-label="weight in kg (optional)" value="${lw}"></div>`;
    ctrl = `<button class="btn y" data-a="runDone">Done set</button>`;
  }
  return hd(`Exercise ${r.idx + 1} of ${r.items.length}`, esc(r.sessionName)) + body(`<div class="run">${bar}<h2>${esc(e.name)}</h2><div class="tg">${esc(fmtTarget(e))}</div>${lvl}<div class="set">${esc(slotLabel(e, sl))}</div>
    <div style="margin-top:10px"><button class="guide" data-a="guide" data-name="${esc(e.name)}">Guide</button></div>${main}</div>`)
    + foot(`${ctrl}<div class="nav2" style="margin-top:10px"><button class="btn" data-a="prevEx" ${r.idx === 0 ? 'disabled' : ''}>← Previous</button><button class="btn" data-a="nextEx">${r.idx + 1 === r.items.length ? 'Finish' : 'Next →'}</button></div>`);
}
function addRecord(rec) { state.records.push(rec); state.records.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts); save(); }
function endRun() { run = null; saveRun(); try { wakeLock && wakeLock.release(); } catch (e) {} wakeLock = null; }
function saveRunRecord() {
  const r = run;
  const exercises = r.items.map((e, i) => ({ name: e.name, type: e.type, lvl: e.lvl || null, lvlName: e.lvlName || null, sets: r.results[i].filter(Boolean) })).filter(x => x.sets.length);
  if (!exercises.length) return toast('Complete at least one set first');
  addRecord({ id: uid(), date: r.k, ts: Date.now(), sessionId: r.sid, sessionName: r.sessionName, mode: 'start', durationSec: Math.round((Date.now() - r.startedAt) / 1000), exercises });
  endRun(); sheets = []; renderSheets(); renderView(); toast('Workout saved 💪');
}

/* ---------- actions ---------- */
function readExDraft() {
  const sh = topSheet(); if (!sh || sh.type !== 'exEd') return;
  const d = sh.draft, g = id => document.getElementById(id);
  if (g('exName')) d.name = g('exName').value;
  if (g('exSets')) d.sets = Math.max(1, parseInt(g('exSets').value, 10) || 1);
  if (g('exReps')) d.reps = Math.max(1, parseInt(g('exReps').value, 10) || 1);
  if (g('exMin')) d.secs = Math.max(0, (parseInt(g('exMin').value, 10) || 0) * 60 + Math.min(59, parseInt(g('exSec').value, 10) || 0));
  if (g('exSide')) d.perSide = g('exSide').checked;
  if (g('exHold')) d.hold = g('exHold').checked;
}
function exportPayload() { return JSON.stringify({ app: 'My Flow', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2); }
function markBackup() { state.lastBackup = todayKey(); save(); renderView(); }
function doExport() {
  const text = exportPayload(), name = `my-flow-backup-${todayKey()}.json`;
  let file = null;
  try { file = new File([text], name, { type: 'application/json' }); } catch (e) {}
  const dl = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500); markBackup(); toast('Backup downloaded');
  };
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'My Flow backup' }).then(() => { markBackup(); toast('Backup shared'); }).catch(err => { if (err && err.name !== 'AbortError') dl(); });
  } else dl();
}
function importJSON(text) {
  let obj; try { obj = JSON.parse(text); } catch (e) { return toast('That is not a valid backup'); }
  obj = obj && obj.data ? obj.data : obj;
  if (!obj || !Array.isArray(obj.sessions)) return toast('That is not a My Flow backup');
  if (!confirm('Replace ALL current data with this backup?')) return;
  state = normalize(obj); save(); sheets = []; renderSheets(); renderView(); toast('Backup imported');
}
function openSession(sid) { openSheet({ type: 'sessEd', sid }); }

const A = {
  tab(el) { tab = el.dataset.t; $('#view').scrollTop = 0; renderView(); },
  close() { closeSheet(); },
  day(el) {
    const k = el.dataset.k, i = (parseKey(k).getDay() + 6) % 7, sid = state.schedule[i];
    if (sid && getSession(sid)) openSheet({ type: 'workout', sid, k }); else openSheet({ type: 'pick', k });
  },
  editSchedule() { openSheet({ type: 'schedule' }); },
  pickSession() { openSheet({ type: 'pick', k: todayKey() }); },
  openWorkout(el) { if (el.dataset.replace) sheets.pop(); openSheet({ type: 'workout', sid: el.dataset.sid, k: el.dataset.k }); },
  cycle(el) {
    const i = +el.dataset.i, ids = state.sessions.map(s => s.id).concat([null]);
    let n = ids.indexOf(state.schedule[i]); if (n < 0) n = ids.length - 1;
    state.schedule[i] = ids[(n + 1) % ids.length]; save(); renderSheets(); renderView();
  },
  mode(el) { state.settings.mode = el.dataset.m; save(); renderSheets(); },
  beginRun() { const sh = topSheet(); startRun(sh.sid, sh.k); },
  beginLog() {
    const sh = topSheet(), s = getSession(sh.sid); if (!s || !s.exercises.length) return;
    openSheet({ type: 'log', sid: s.id, k: sh.k, name: s.name, items: s.exercises.map(eff) });
  },
  logSave() {
    const sh = topSheet(), items = sh.items, date = ($('#logDate') || {}).value || sh.k;
    const exercises = [];
    items.forEach((e, i) => {
      const done = document.querySelector(`input[data-ex="${i}"][data-f="done"]`); if (done && !done.checked) return;
      const sets = slotsOf(e).map((sl, j) => {
        const f = n => document.querySelector(`input[data-ex="${i}"][data-set="${j}"][data-f="${n}"]`);
        const o = { side: sl.side };
        if (e.type === 'time') o.secs = Math.max(0, Math.round(parseFloat(f('secs').value) || 0)); else o.reps = Math.max(0, Math.round(parseFloat(f('reps').value) || 0));
        const w = parseFloat(f('weight').value); if (w > 0) o.weight = w;
        return o;
      }).filter(o => (o.reps || o.secs));
      if (sets.length) exercises.push({ name: e.name, type: e.type, lvl: e.lvl || null, lvlName: e.lvlName || null, sets });
    });
    if (!exercises.length) return toast('Nothing to log - tick at least one exercise');
    addRecord({ id: uid(), date, ts: Date.now(), sessionId: sh.sid, sessionName: sh.name, mode: 'log', durationSec: 0, exercises });
    sheets = []; renderSheets(); renderView(); toast('Workout logged');
  },
  /* run */
  runClose() { if (confirm('Leave this workout? Your progress will be discarded.')) { endRun(); closeAllSheets(); } },
  runDone() { recordSet(false); },
  step(el) { const i = $('#rReps'); i.value = Math.max(0, (parseInt(i.value, 10) || 0) + +el.dataset.d); },
  tToggle() {
    const t = run.timer;
    if (t.running) { t.remaining = timerRemaining(); t.running = false; }
    else { if (t.remaining <= 0) t.remaining = run.items[run.idx].secs; t.endAt = Date.now() + t.remaining * 1000; t.running = true; unlockAudio(); ensureTick(); }
    saveRun(); renderSheets();
  },
  tReset() { run.timer = { running: false, endAt: 0, remaining: run.items[run.idx].secs }; saveRun(); renderSheets(); },
  restAdj(el) {
    const d = +el.dataset.d; run.restSecs = Math.max(0, run.restSecs + d);
    run.restEnd = Math.max(Date.now() + 1000, run.restEnd + d * 1000); saveRun(); setTmr(fmtClock((run.restEnd - Date.now()) / 1000));
  },
  restSkip() { setWork(run.idx); renderSheets(); },
  prevEx() { setWork(Math.max(0, run.phase === 'finish' ? run.items.length - 1 : run.idx - 1)); renderSheets(); },
  nextEx() { if (run.idx + 1 >= run.items.length) { run.phase = 'finish'; saveRun(); } else setWork(run.idx + 1); renderSheets(); },
  runSave() { saveRunRecord(); },
  /* guide */
  guide(el) { openSheet({ type: 'guide', name: el.dataset.name }); },
  /* sessions */
  manageSessions() { openSheet({ type: 'sessions' }); },
  sessEd(el) { openSession(el.dataset.sid); },
  sessNew() {
    const s = { id: uid(), name: 'New Session', minutes: 30, exercises: [] }; state.sessions.push(s); save(); renderView(); openSession(s.id);
  },
  sessOk(el) { const s = getSession(el.dataset.sid); if (s) { delete s.placeholder; save(); renderSheets(); renderView(); } },
  sessDel(el) {
    const sid = el.dataset.sid; if (!confirm('Delete this session?')) return;
    state.sessions = state.sessions.filter(s => s.id !== sid); state.schedule = state.schedule.map(x => x === sid ? null : x); save();
    sheets = sheets.filter(s => s.sid !== sid); renderSheets(); renderView();
  },
  exEd(el) { openSheet({ type: 'exEd', sid: el.dataset.sid, id: el.dataset.id || null }); },
  exUp(el) { moveEx(el, -1); },
  exDown(el) { moveEx(el, 1); },
  exDel(el) {
    const s = getSession(el.dataset.sid), x = s.exercises.find(e => e.id === el.dataset.id);
    if (!confirm(`Remove “${x.name}” from ${s.name}?`)) return;
    s.exercises = s.exercises.filter(e => e.id !== el.dataset.id); save(); renderSheets(); renderView();
  },
  exType(el) {
    readExDraft(); const d = topSheet().draft; d.type = el.dataset.t;
    if (d.type === 'time' && !d.secs) d.secs = 30; if (d.type === 'reps' && !d.reps) d.reps = 10;
    renderSheets();
  },
  exProg() { readExDraft(); topSheet().draft.prog = 'backExt'; renderSheets(); },
  exNoProg() { readExDraft(); const sh = topSheet(), d = sh.draft; Object.assign(d, eff(d)); delete d.prog; delete d.lvl; delete d.lvlName; renderSheets(); },
  exSave() {
    readExDraft(); const sh = topSheet(), s = getSession(sh.sid), d = sh.draft;
    d.name = d.name.trim(); if (!d.name) return toast('Give the exercise a name');
    if (d.type === 'time' && !(d.secs > 0)) return toast('Set a time above 0');
    const clean = { id: d.id || uid(), name: d.name, type: d.type, sets: d.sets || 1 };
    if (d.type === 'time') clean.secs = d.secs; else clean.reps = d.reps || 10;
    if (d.perSide) clean.perSide = true; if (d.hold && d.type === 'time') clean.hold = true; if (d.prog) clean.prog = d.prog;
    if (sh.id) { const i = s.exercises.findIndex(e => e.id === sh.id); s.exercises[i] = clean; } else s.exercises.push(clean);
    save(); closeSheet(); renderSheets();
  },
  /* progression */
  progPick() { openSheet({ type: 'progPick', sel: state.progression.backExt }); },
  progSel(el) { topSheet().sel = +el.dataset.n; renderSheets(); },
  progSave() { state.progression.backExt = topSheet().sel; save(); closeSheet(); renderSheets(); toast('Level saved - used in your next workout'); },
  topAll() { openSheet({ type: 'topAll' }); },
  calPrev() { const c = ui.cal; c.m--; if (c.m < 0) { c.m = 11; c.y--; } renderView(); },
  calNext() { const c = ui.cal; c.m++; if (c.m > 11) { c.m = 0; c.y++; } renderView(); },
  range(el) { ui.range = +el.dataset.d; renderView(); },
  /* check-in */
  checkin() { openSheet({ type: 'checkin', step: 'pain', hist: [], pain: false, level: 0, areas: [], journal: '' }); },
  ciPain(el) { const sh = topSheet(); sh.hist.push(sh.step); sh.pain = el.dataset.v === '1'; sh.step = sh.pain ? 'level' : 'journal'; renderSheets(); },
  ciLevel(el) { const sh = topSheet(); sh.level = +el.dataset.n; sh.hist.push(sh.step); sh.step = 'area'; renderSheets(); },
  ciArea(el) { const sh = topSheet(), v = el.dataset.v, i = sh.areas.indexOf(v); i < 0 ? sh.areas.push(v) : sh.areas.splice(i, 1); renderSheets(); },
  ciNext() { const sh = topSheet(); sh.hist.push(sh.step); sh.step = 'journal'; renderSheets(); },
  ciBack() { const sh = topSheet(); sh.step = sh.hist.pop() || 'pain'; renderSheets(); },
  ciFinish() {
    const sh = topSheet(), tk = todayKey(), text = sh.journal.trim();
    state.checkins.push({ id: uid(), date: tk, ts: Date.now(), pain: sh.pain, level: sh.pain ? sh.level : 1, areas: sh.pain ? sh.areas.slice() : [] });
    if (text) state.journal.push({ id: uid(), date: tk, ts: Date.now(), text, src: 'checkin' });
    save(); sh.step = 'done'; renderSheets(); renderView();
  },
  /* journal */
  jAdd() { openSheet({ type: 'jEdit', id: null }); },
  jEdit(el) { openSheet({ type: 'jEdit', id: el.dataset.id }); },
  jSave() {
    const sh = topSheet(), text = ($('#jText').value || '').trim(); if (!text) return toast('Write something first');
    if (sh.id) { const j = state.journal.find(x => x.id === sh.id); if (j) j.text = text; } else state.journal.push({ id: uid(), date: todayKey(), ts: Date.now(), text, src: 'manual' });
    save(); closeSheet();
  },
  jDel() { if (!confirm('Delete this entry?')) return; state.journal = state.journal.filter(x => x.id !== topSheet().id); save(); closeSheet(); },
  /* learn */
  lessonEdit(el) { openSheet({ type: 'lessonEd', id: el.dataset.id }); },
  lessonAdd() { const l = { id: uid(), title: `Lesson ${state.lessons.length + 1}`, body: '' }; state.lessons.push(l); save(); renderView(); openSheet({ type: 'lessonEd', id: l.id }); },
  lessonDel() { if (!confirm('Delete this lesson?')) return; state.lessons = state.lessons.filter(l => l.id !== topSheet().id); save(); closeSheet(); },
  videoAdd() { openSheet({ type: 'videoEd', id: null }); },
  videoEdit(el) { openSheet({ type: 'videoEd', id: el.dataset.id }); },
  videoSave() {
    const sh = topSheet(), title = $('#vTitle').value.trim(), url = $('#vUrl').value.trim(); if (!url) return toast('Paste a link');
    if (sh.id) { const v = state.videos.find(x => x.id === sh.id); v.title = title; v.url = url; } else state.videos.push({ id: uid(), title, url });
    save(); closeSheet();
  },
  videoDel() { if (!confirm('Delete this video link?')) return; state.videos = state.videos.filter(v => v.id !== topSheet().id); save(); closeSheet(); },
  /* settings */
  restDef(el) { state.settings.rest = Math.max(0, Math.min(600, (parseInt(state.settings.rest, 10) || 0) + +el.dataset.d)); save(); $('#setRest').value = state.settings.rest; },
  export() { doExport(); },
  copyExport() {
    const t = exportPayload();
    const ok = () => { markBackup(); toast('Backup copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok).catch(() => prompt('Copy this backup text', t));
    else prompt('Copy this backup text', t);
  },
  importFile() { $('#impFile').click(); },
  importText() { const t = $('#impText').value.trim(); if (!t) return toast('Paste backup text first'); importJSON(t); },
  reset() {
    if (!confirm('Reset ALL data? This deletes workouts, check-ins and notes. Export a backup first if unsure.')) return;
    endRun(); state = defaults(); save(); sheets = []; tab = 'home'; renderSheets(); renderView(); toast('Data reset');
  }
};
function moveEx(el, dir) {
  const s = getSession(el.dataset.sid), i = s.exercises.findIndex(e => e.id === el.dataset.id), j = i + dir;
  if (j < 0 || j >= s.exercises.length) return;
  [s.exercises[i], s.exercises[j]] = [s.exercises[j], s.exercises[i]]; save(); renderSheets(); renderView();
}
const IN = {
  name(el) { state.profile.name = el.value; save(); },
  rest(el) { state.settings.rest = Math.max(0, Math.min(600, parseInt(el.value, 10) || 0)); save(); },
  sname(el) { const s = getSession(el.dataset.sid); if (s) { s.name = el.value || 'Session'; save(); } },
  smin(el) { const s = getSession(el.dataset.sid); if (s) { s.minutes = Math.max(1, parseInt(el.value, 10) || 1); save(); } },
  gnotes(el) { const g = guideFor(el.dataset.name); g.notes = el.value; save(); },
  gurl(el) {
    const g = guideFor(el.dataset.name); g.url = el.value.trim(); save();
    const link = $('#gOpen'), slot = $('#gOpenSlot');
    if (link) { g.url ? link.setAttribute('href', normUrl(g.url)) : link.remove(); }
    else if (slot && g.url) { slot.outerHTML = `<a class="btn" id="gOpen" href="${esc(normUrl(g.url))}" target="_blank" rel="noopener" style="margin-bottom:10px">${ico('play')} Open my video</a>`; }
  },
  jtext() {},
  ltitle(el) { const l = state.lessons.find(x => x.id === topSheet().id); if (l) { l.title = el.value; save(); } },
  lbody(el) { const l = state.lessons.find(x => x.id === topSheet().id); if (l) { l.body = el.value; save(); } },
  cijournal(el) { topSheet().journal = el.value; }
};
function guideFor(name) { const k = keyOf(name); return state.guides[k] || (state.guides[k] = { notes: '', url: '' }); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const f = A[el.dataset.a]; if (f) { unlockAudio(); f(el, e); }
});
document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el); });
document.addEventListener('change', e => {
  if (e.target.id === 'impFile' && e.target.files[0]) { const rd = new FileReader(); rd.onload = () => importJSON(String(rd.result)); rd.readAsText(e.target.files[0]); e.target.value = ''; }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); getWake(); } });

/* ---------- boot ---------- */
function boot() {
  renderView();
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (raw) { const r = JSON.parse(raw); if (r && r.items && Date.now() - r.startedAt < 12 * 3600e3) { run = r; sheets = [{ type: 'run' }]; renderSheets(); ensureTick(); getWake(); } else localStorage.removeItem(RUN_KEY); }
  } catch (e) { localStorage.removeItem(RUN_KEY); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.__flow = { get state() { return state; }, get run() { return run; } };
boot();
})();
