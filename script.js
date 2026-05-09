const CAT = {
  health:  { emoji: '❤️', label: 'Kesehatan' },
  sport:   { emoji: '🏃', label: 'Olahraga' },
  study:   { emoji: '📖', label: 'Belajar' },
  mindful: { emoji: '🧘', label: 'Mindful' },
  work:    { emoji: '💼', label: 'Kerja' },
  other:   { emoji: '✨', label: 'Lainnya' },
};
const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MOTIV = [
  "Konsistensi kecil mengalahkan motivasi besar.",
  "Hari ini kamu sudah 100% lebih baik dari kemarin yang tidak melakukan apa-apa.",
  "Mulai dulu, sempurna belakangan.",
  "Streak bukan tentang kesempurnaan, tapi tentang niat.",
  "Setiap hari adalah kesempatan baru untuk memulai.",
];

let habits = JSON.parse(localStorage.getItem('streakup_v2') || 'null');
if (!habits) {
  habits = [
    { id: 1, name: 'Minum 8 gelas air', cat: 'health', log: [] },
    { id: 2, name: 'Olahraga 30 menit', cat: 'sport', log: [] },
    { id: 3, name: 'Baca buku 20 halaman', cat: 'study', log: [] },
  ];
}

const today = new Date().toISOString().slice(0,10);
let nextId = Math.max(...habits.map(h=>h.id), 0) + 1;

function save() { localStorage.setItem('streakup_v2', JSON.stringify(habits)); }

function getStreak(h) {
  let s = 0, d = new Date();
  while(true) {
    const ds = d.toISOString().slice(0,10);
    if (h.log.includes(ds)) { s++; d.setDate(d.getDate()-1); } else break;
  }
  return s;
}

function getLast7() {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    return { str: d.toISOString().slice(0,10), label: DAYS[d.getDay()], isToday: i===6 };
  });
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function addHabit() {
  const name = document.getElementById('habit-input').value.trim();
  if (!name) { toast('Isi nama habit dulu ya!'); return; }
  const cat = document.getElementById('cat-input').value;
  habits.push({ id: nextId++, name, cat, log: [] });
  save();
  document.getElementById('habit-input').value = '';
  render();
  toast('Habit baru ditambahkan! 🎯');
}

function toggle(id) {
  const h = habits.find(x=>x.id===id);
  if (!h) return;
  if (h.log.includes(today)) {
    h.log = h.log.filter(d=>d!==today);
    toast('Check-in dibatalkan');
  } else {
    h.log.push(today);
    toast('Mantap! Habit selesai ✅');
  }
  save(); render();
}

function del(id) {
  if (!confirm('Hapus habit ini?')) return;
  habits = habits.filter(x=>x.id!==id);
  save(); render();
}

function render() {
  const list = document.getElementById('habits-list');
  const days7 = getLast7();
  const doneToday = habits.filter(h=>h.log.includes(today)).length;
  const total = habits.length;
  const maxStreak = habits.length ? Math.max(...habits.map(getStreak)) : 0;
  const pct = total ? Math.round(doneToday/total*100) : 0;

  document.getElementById('s-total').textContent = total;
  document.getElementById('s-done').textContent = doneToday+'/'+total;
  document.getElementById('s-streak').textContent = maxStreak+' 🔥';

  const pw = document.getElementById('progress-wrap');
  pw.style.display = total ? 'block' : 'none';
  document.getElementById('progress-fill').style.width = pct+'%';
  document.getElementById('progress-pct').textContent = pct+'%';

  const motiv = document.getElementById('motivation');
  if (doneToday > 0 && doneToday === total) {
    motiv.textContent = '🎉 Semua habit selesai hari ini! Luar biasa!';
    motiv.classList.add('show');
  } else if (doneToday > 0) {
    motiv.textContent = '💪 ' + MOTIV[Math.floor(Math.random()*MOTIV.length)];
    motiv.classList.add('show');
  } else {
    motiv.classList.remove('show');
  }

  if (!habits.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🌱</div>Belum ada habit.<br/>Tambah habit pertamamu di atas!</div>`;
    return;
  }

  list.innerHTML = '';
  habits.forEach(h => {
    const c = CAT[h.cat] || CAT.other;
    const isDone = h.log.includes(today);
    const streak = getStreak(h);
    const card = document.createElement('div');
    card.className = 'habit-card' + (isDone?' done':'');

    const dots = days7.map(d => {
      const hit = h.log.includes(d.str);
      return `<div class="day-cell">
        <div class="day-dot${hit?' hit':''}${d.isToday&&!hit?' today':''}">${hit?'✓':''}</div>
        <div class="day-lbl${d.isToday?' today-lbl':''}">${d.label}</div>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="habit-main">
        <div class="habit-icon">${c.emoji}</div>
        <div class="habit-body">
          <div class="habit-name${isDone?' done-text':''}">${h.name}</div>
          <div class="habit-sub">${c.label}</div>
        </div>
        <div class="habit-actions">
          ${streak>0?`<div class="streak-pill">🔥 ${streak}</div>`:''}
          <button class="check-btn${isDone?' active':''}" onclick="toggle(${h.id})" title="${isDone?'Batal':'Tandai selesai'}">
            ${isDone?'✓':'○'}
          </button>
          <button class="del-btn" onclick="del(${h.id})" title="Hapus">✕</button>
        </div>
      </div>
      <div class="week-row">${dots}</div>
    `;
    list.appendChild(card);
  });
}

document.getElementById('habit-input').addEventListener('keydown', e => {
  if (e.key==='Enter') addHabit();
});

const now = new Date();
document.getElementById('nav-date').textContent = now.toLocaleDateString('id-ID', {weekday:'long',day:'numeric',month:'long',year:'numeric'});

render();
