/* =====================================================
   JUEGOS.JS — Lógica de los 6 Juegos Interactivos
   Unidad Didáctica Virtual: Números Racionales · 7°
   ===================================================== */

/* ===== GLOBAL STATE ===== */
let globalScore = parseInt(localStorage.getItem('global_score') || '0');
let gamesPlayed = parseInt(localStorage.getItem('games_played') || '0');
let bestStreak = parseInt(localStorage.getItem('best_streak') || '0');
let bestScores = JSON.parse(localStorage.getItem('best_scores') || '{}');

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    updateHeroStats();
    updateLeaderboard();
    spawnParticles();
});

/* ===== PARTICLES ===== */
function spawnParticles() {
    const container = document.getElementById('juegos-particles');
    if (!container) return;
    const emojis = ['➕', '➖', '✖️', '➗', '½', '¾', '⅓', '%', '⅔', '⅛'];
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 14 + Math.random() * 36;
        const useEmoji = Math.random() > 0.5;
        if (useEmoji) {
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.fontSize = (size * 0.7) + 'px';
            p.style.background = 'transparent';
            p.style.border = 'none';
        } else {
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.background = `rgba(79,53,210,0.06)`;
            p.style.border = '1px solid rgba(255,255,255,.06)';
        }
        Object.assign(p.style, {
            left: Math.random() * 100 + '%',
            bottom: '-60px',
            animationDuration: (12 + Math.random() * 18) + 's',
            animationDelay: (Math.random() * 14) + 's',
        });
        container.appendChild(p);
    }
}

/* ===== NAVIGATION ===== */
function launchGame(name) {
    document.getElementById('game-select').style.display = 'none';
    const el = document.getElementById('game-' + name);
    if (el) {
        el.style.display = 'block';
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

function backToMenu() {
    clearInterval(rpTimerInterval);
    clearInterval(ruTimerInterval);
    clearInterval(cvTimerInterval);
    clearInterval(pwTimerInterval);

    ['rapido', 'adivina', 'ruleta', 'clasifica', 'convierte', 'palabras', 'grafica-valor', 'valor-grafica'].forEach(g => {
        const el = document.getElementById('game-' + g);
        if (el) el.style.display = 'none';
    });
    document.getElementById('game-select').style.display = 'block';
    document.getElementById('game-select').scrollIntoView({ behavior: 'smooth' });
}

/* ===== SCORE HELPERS ===== */
function updateHeroStats() {
    setText('total-score', globalScore);
    setText('games-played', gamesPlayed);
    setText('best-streak', bestStreak);
}

function saveGlobalScore(points, streak, gameKey) {
    globalScore += points;
    gamesPlayed++;
    if (streak > bestStreak) bestStreak = streak;
    if (!bestScores[gameKey] || points > bestScores[gameKey]) bestScores[gameKey] = points;
    localStorage.setItem('global_score', globalScore);
    localStorage.setItem('games_played', gamesPlayed);
    localStorage.setItem('best_streak', bestStreak);
    localStorage.setItem('best_scores', JSON.stringify(bestScores));
    updateHeroStats();
    updateLeaderboard();
}

function updateLeaderboard() {
    const keys = ['rapido', 'adivina', 'ruleta', 'clasifica', 'convierte', 'palabras', 'grafica-valor', 'valor-grafica'];
    keys.forEach(k => {
        const el = document.getElementById('lb-' + k);
        if (el) el.textContent = bestScores[k] ? bestScores[k] + ' pts' : '— pts';
    });
}

function resetScores() {
    if (!confirm('¿Resetear todas las marcas?')) return;
    globalScore = 0; gamesPlayed = 0; bestStreak = 0; bestScores = {};
    ['global_score', 'games_played', 'best_streak', 'best_scores'].forEach(k => localStorage.removeItem(k));
    updateHeroStats();
    updateLeaderboard();
    showToast('🗑️ Marcas reiniciadas');
}

/* ===== HELPERS ===== */
function parseFrac(str) {
    str = str.trim().replace(/\s/g, '');
    if (str.includes('/')) {
        const [n, d] = str.split('/').map(Number);
        if (isNaN(n) || isNaN(d) || d === 0) return null;
        return n / d;
    }
    const n = parseFloat(str.replace(',', '.'));
    return isNaN(n) ? null : n;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function fracStr(n, d) { const g = gcd(Math.abs(n), Math.abs(d)); return `${n / g}/${d / g}`; }
function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    setTimeout(() => { t.className = 'toast'; }, 3000);
}
function show(id, visible) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? 'block' : 'none';
}

/* =====================================================
   JUEGO 1: FRACCIONES AL INSTANTE
   ===================================================== */
let rpTimerInterval = null, rpTimeLeft = 60, rpScore = 0,
    rpStreak = 0, rpDifficulty = 'facil', rpAnswered = false;

const RP_QUESTIONS = {
    facil: [
        { q: '½ + ½ = ?', opts: ['1', '¼', '2', '½'], ans: '1' },
        { q: '¾ − ¼ = ?', opts: ['½', '1', '¼', '¾'], ans: '½' },
        { q: '⅓ + ⅓ = ?', opts: ['⅔', '½', '1', '⅓'], ans: '⅔' },
        { q: '1 − ½ = ?', opts: ['½', '¼', '1', '⅓'], ans: '½' },
        { q: '½ × 2 = ?', opts: ['1', '½', '¼', '2'], ans: '1' },
        { q: '¼ + ¼ = ?', opts: ['½', '¾', '⅓', '¼'], ans: '½' },
        { q: '⅔ + ⅓ = ?', opts: ['1', '½', '⅔', '⅓'], ans: '1' },
        { q: '¾ + ¼ = ?', opts: ['1', '½', '1¼', '¾'], ans: '1' },
    ],
    medio: [
        { q: '⅔ × ¾ = ?', opts: ['½', '⅜', '⅔', '6/8'], ans: '½' },
        { q: '⅗ + ⅖ = ?', opts: ['1', '⅘', '⅗', '½'], ans: '1' },
        { q: '¾ ÷ ½ = ?', opts: ['3/2', '3/8', '¼', '6/4'], ans: '3/2' },
        { q: '⅔ − ⅓ = ?', opts: ['⅓', '½', '⅔', '1'], ans: '⅓' },
        { q: '⅗ × ⅔ = ?', opts: ['⅖', '⅗', '½', '2/5'], ans: '⅖' },
        { q: '½ ÷ ¼ = ?', opts: ['2', '½', '⅛', '¼'], ans: '2' },
        { q: '⅝ + ⅜ = ?', opts: ['1', '⅞', '⅝', '¾'], ans: '1' },
        { q: '⅘ − ⅗ = ?', opts: ['⅕', '⅖', '⅘', '1'], ans: '⅕' },
    ],
    dificil: [
        { q: '⁷⁄₁₂ + ⅙ = ?', opts: ['¾', '⅔', '7/18', '11/12'], ans: '¾' },
        { q: '⅘ ÷ ⅔ = ?', opts: ['6/5', '4/15', '¾', '8/15'], ans: '6/5' },
        { q: '¾ − ⅝ = ?', opts: ['⅛', '¼', '3/8', '1/8'], ans: '⅛' },
        { q: '⅔ × ⁹⁄₄ = ?', opts: ['3/2', '6/6', '18/8', '¾'], ans: '3/2' },
        { q: '⁵⁄₆ − ⅓ = ?', opts: ['½', '⅙', '⅔', '⁵⁄₉'], ans: '½' },
        { q: '⁷⁄₈ ÷ ¾ = ?', opts: ['7/6', '21/32', '⅞', '3/8'], ans: '7/6' },
        { q: '⅗ + ¼ = ?', opts: ['17/20', '⅞', '⅗', '¾'], ans: '17/20' },
        { q: '⁵⁄₉ × ⁶⁄₅ = ?', opts: ['⅔', '⅓', '30/45', '⅗'], ans: '⅔' },
    ],
};

let rpPool = [], rpCurrent = null;

function setDiff(btn, diff) {
    rpDifficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function startRapido() {
    rpScore = 0; rpStreak = 0; rpTimeLeft = 60; rpAnswered = false;
    rpPool = [...RP_QUESTIONS[rpDifficulty]].sort(() => Math.random() - .5);
    setText('rp-score', 0); setText('rp-timer', 60); setText('rp-streak', 0);
    const bar = document.getElementById('rp-timer-bar');
    if (bar) bar.style.width = '100%';
    show('rp-start', false); show('rp-result', false); show('rp-question', true);
    loadNextRapido();
    startRpTimer();
}

function loadNextRapido() {
    if (rpPool.length === 0) rpPool = [...RP_QUESTIONS[rpDifficulty]].sort(() => Math.random() - .5);
    rpCurrent = rpPool.pop();
    rpAnswered = false;
    setText('rp-q-label', `Pregunta · ${rpDifficulty.toUpperCase()}`);
    setText('rp-q-text', rpCurrent.q);
    document.getElementById('rp-feedback').textContent = '';
    const optsDiv = document.getElementById('rp-options');
    optsDiv.innerHTML = '';
    [...rpCurrent.opts].sort(() => Math.random() - .5).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'q-option-btn';
        btn.textContent = opt;
        btn.onclick = () => answerRapido(btn, opt);
        optsDiv.appendChild(btn);
    });
}

function answerRapido(btn, chosen) {
    if (rpAnswered) return;
    rpAnswered = true;
    const correct = chosen === rpCurrent.ans;
    document.querySelectorAll('.q-option-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent === rpCurrent.ans) b.classList.add('correct');
    });
    const fb = document.getElementById('rp-feedback');
    if (correct) {
        btn.classList.add('correct');
        rpStreak++;
        const bonus = rpStreak >= 3 ? 5 : 0;
        const pts = 10 + bonus;
        rpScore += pts;
        if (rpStreak > bestStreak) bestStreak = rpStreak;
        setText('rp-score', rpScore); setText('rp-streak', rpStreak);
        fb.textContent = bonus ? `✅ ¡Correcto! +${pts} (racha × ${rpStreak} 🔥)` : `✅ ¡Correcto! +10`;
        fb.style.color = 'var(--accent2)';
        showToast(rpStreak >= 3 ? '🔥 ¡Racha en llamas!' : '✅ ¡Correcto!');
    } else {
        btn.classList.add('wrong');
        rpStreak = 0; setText('rp-streak', 0);
        fb.textContent = `❌ Era: ${rpCurrent.ans}`;
        fb.style.color = 'var(--accent1)';
    }
    setTimeout(loadNextRapido, 1000);
}

function startRpTimer() {
    clearInterval(rpTimerInterval);
    rpTimerInterval = setInterval(() => {
        rpTimeLeft--;
        setText('rp-timer', rpTimeLeft);
        const bar = document.getElementById('rp-timer-bar');
        if (bar) bar.style.width = (rpTimeLeft / 60 * 100) + '%';
        if (rpTimeLeft <= 0) { clearInterval(rpTimerInterval); endRapido(); }
    }, 1000);
}

function endRapido() {
    show('rp-question', false); show('rp-result', true);
    setText('rp-result-emoji', rpScore >= 100 ? '🏆' : rpScore >= 50 ? '⭐' : '💪');
    setText('rp-result-title', rpScore >= 80 ? '¡Increíble!' : '¡Tiempo!');
    setText('rp-result-score', rpScore + ' pts');
    setText('rp-result-msg',
        rpScore >= 100 ? '¡Eres una máquina de fracciones! 🚀' :
            rpScore >= 60 ? '¡Muy bien! Sigue practicando 💪' :
                '¡No te rindas! Con práctica lo lograrás 😊');
    saveGlobalScore(rpScore, rpStreak, 'rapido');
}

/* =====================================================
   JUEGO 2: ADIVINA LA FRACCIÓN
   ===================================================== */
let adScore = 0, adStreak = 0, adLives = 3, adCurrent = null;

const AD_FRACTIONS = [
    { n: 1, d: 2 }, { n: -1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: -3, d: 4 }, { n: -1, d: 4 },
    { n: 1, d: 3 }, { n: 2, d: 3 }, { n: -1, d: 3 }, { n: -2, d: 3 }, { n: 1, d: 8 }, { n: 3, d: 8 },
    { n: 5, d: 8 }, { n: -3, d: 8 }, { n: 1, d: 6 }, { n: 5, d: 6 },
];

function startAdivina() {
    adScore = 0; adStreak = 0; adLives = 3;
    setText('ad-score', 0); setText('ad-streak', 0); setText('ad-lives', '❤️❤️❤️');
    show('ad-start', false); show('ad-result', false); show('ad-question', true);
    loadNextAdivina();
}

function loadNextAdivina() {
    if (adLives <= 0) { endAdivina(); return; }
    adCurrent = AD_FRACTIONS[Math.floor(Math.random() * AD_FRACTIONS.length)];
    drawNumberLine(adCurrent);
    const inp = document.getElementById('ad-input');
    const fb = document.getElementById('ad-feedback');
    if (inp) { inp.value = ''; inp.focus(); }
    if (fb) { fb.textContent = ''; }
}

function drawNumberLine(frac) {
    const svg = document.getElementById('ad-svg');
    if (!svg) return;
    const W = 520, margin = 30, lineY = 45;
    const xScale = x => margin + (x + 1) / 2 * (W - 2 * margin);
    let html = `
      <line x1="${margin}" y1="${lineY}" x2="${W - margin + 10}" y2="${lineY}" stroke="#4F35D2" stroke-width="2.5"/>
      <polygon points="${W - margin + 10},${lineY - 5} ${W - margin + 18},${lineY} ${W - margin + 10},${lineY + 5}" fill="#4F35D2"/>`;
    const marks = [-1, -0.5, 0, 0.5, 1], labels = ['-1', '-½', '0', '½', '1'];
    marks.forEach((m, i) => {
        const x = xScale(m), big = m === 0 || m === 1 || m === -1;
        html += `<line x1="${x}" y1="${lineY - (big ? 10 : 6)}" x2="${x}" y2="${lineY + (big ? 10 : 6)}" stroke="#4F35D2" stroke-width="${big ? 2.5 : 1.5}"/>`;
        html += `<text x="${x}" y="${lineY - 16}" font-size="11" fill="#4F35D2" text-anchor="middle" font-family="DM Sans" font-weight="${big ? 700 : 400}">${labels[i]}</text>`;
    });
    const px = xScale(frac.n / frac.d);
    html += `
      <line x1="${px}" y1="${lineY - 28}" x2="${px}" y2="${lineY + 2}" stroke="#FF5C6A" stroke-width="2.5" stroke-dasharray="4,3"/>
      <polygon points="${px},${lineY + 10} ${px - 7},${lineY - 2} ${px + 7},${lineY - 2}" fill="#FF5C6A"/>
      <text x="${px}" y="${lineY - 34}" font-size="13" fill="#FF5C6A" text-anchor="middle" font-family="DM Sans" font-weight="800">?</text>`;
    svg.innerHTML = html;
}

function checkAdivina() {
    const inp = document.getElementById('ad-input');
    const fb = document.getElementById('ad-feedback');
    if (!inp || !fb) return;
    const raw = inp.value.trim();
    if (!raw) { fb.textContent = '⚠️ Escribe una fracción (ej: 3/4)'; fb.style.color = 'var(--accent3)'; return; }
    const userVal = parseFrac(raw);
    const correctVal = adCurrent.n / adCurrent.d;
    const correct = fracStr(adCurrent.n, adCurrent.d);
    if (userVal === null) { fb.textContent = '⚠️ Formato inválido. Usa p/q'; fb.style.color = 'var(--accent3)'; return; }
    if (Math.abs(userVal - correctVal) < 0.0001) {
        adStreak++;
        const pts = 15 + (adStreak >= 3 ? 10 : 0);
        adScore += pts;
        setText('ad-score', adScore); setText('ad-streak', adStreak);
        fb.textContent = `✅ ¡Correcto! +${pts} pts`; fb.style.color = 'var(--accent2)';
        showToast(adStreak >= 3 ? '🔥 ¡Racha perfecta!' : '✅ ¡Correcto!');
        setTimeout(loadNextAdivina, 900);
    } else {
        adLives--; adStreak = 0; setText('ad-streak', 0);
        const hearts = '❤️'.repeat(adLives) + '🖤'.repeat(3 - adLives);
        setText('ad-lives', hearts || '💀');
        fb.textContent = `❌ Era: ${correct}. Vidas: ${hearts}`; fb.style.color = 'var(--accent1)';
        if (adLives <= 0) setTimeout(endAdivina, 1200);
    }
}

function endAdivina() {
    show('ad-question', false); show('ad-result', true);
    setText('ad-result-emoji', adScore >= 120 ? '🏆' : adScore >= 60 ? '⭐' : '💪');
    setText('ad-result-score', adScore + ' pts');
    setText('ad-result-msg',
        adScore >= 120 ? '¡Eres un maestro de la recta numérica! 🌟' :
            adScore >= 60 ? '¡Buen trabajo! Practica más para llegar al top.' :
                '¡No te rindas! Cada intento cuenta 😊');
    saveGlobalScore(adScore, adStreak, 'adivina');
}

/* =====================================================
   JUEGO 3: RULETA DE FRACCIONES
   ===================================================== */
let ruTimerInterval = null, ruTimeLeft = 90, ruScore = 0, ruStreak = 0,
    ruSpinning = false, ruCurrent = null, ruAngle = 0;

const RU_FRACTIONS = [
    { n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
    { n: 1, d: 8 }, { n: 3, d: 8 }, { n: 5, d: 8 }, { n: 7, d: 8 }, { n: 1, d: 10 }, { n: 3, d: 10 }, { n: 1, d: 3 }, { n: 2, d: 3 },
];
const WHEEL_COLORS = ['#4F35D2', '#E67E22', '#27AE60', '#E84393', '#8E44AD', '#2980B9', '#FF5C6A', '#1CC9A0', '#F5C842', '#E74C3C', '#16A085', '#D35400', '#7D3C98', '#1A5276', '#117A65'];
let wheelFracs = [];

function startRuleta() {
    ruScore = 0; ruStreak = 0; ruTimeLeft = 90; ruSpinning = false;
    wheelFracs = [...RU_FRACTIONS].sort(() => Math.random() - .5).slice(0, 10);
    setText('ru-score', 0); setText('ru-timer', 90); setText('ru-streak', 0);
    const bar = document.getElementById('ru-timer-bar'); if (bar) bar.style.width = '100%';
    show('ru-start', false); show('ru-result', false); show('ru-question', true);
    setText('ru-q-label', 'Gira la ruleta para comenzar');
    setText('ru-q-text', ''); setText('ru-q-sub', '');
    const inputRow = document.getElementById('ru-input-row'); if (inputRow) inputRow.style.display = 'none';
    document.getElementById('ru-feedback').textContent = '';
    const spinBtn = document.getElementById('ru-spin-btn'); if (spinBtn) spinBtn.disabled = false;
    drawWheel(0);
    startRuTimer();
}

function drawWheel(angle) {
    const canvas = document.getElementById('ru-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 8;
    const n = wheelFracs.length, arc = (2 * Math.PI) / n;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wheelFracs.forEach((frac, i) => {
        const start = angle + i * arc, end = start + arc;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, end); ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
        const mid = start + arc / 2;
        ctx.save();
        ctx.translate(cx + Math.cos(mid) * r * .65, cy + Math.sin(mid) * r * .65);
        ctx.rotate(mid + Math.PI / 2);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px "DM Sans"';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${frac.n}/${frac.d}`, 0, 0); ctx.restore();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#4F35D2'; ctx.font = 'bold 10px "DM Sans"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎰', cx, cy);
}

function spinWheel() {
    if (ruSpinning) return;
    ruSpinning = true;
    const spinBtn = document.getElementById('ru-spin-btn'); if (spinBtn) spinBtn.disabled = true;
    document.getElementById('ru-feedback').textContent = '';
    const totalAngle = (5 + Math.random() * 5) * 2 * Math.PI;
    const duration = 3000, start = performance.now(), startAngle = ruAngle;
    function animate(now) {
        const elapsed = now - start, progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        ruAngle = startAngle + totalAngle * ease;
        drawWheel(ruAngle);
        if (progress < 1) requestAnimationFrame(animate);
        else { ruSpinning = false; landWheel(); }
    }
    requestAnimationFrame(animate);
}

function landWheel() {
    const n = wheelFracs.length, arc = (2 * Math.PI) / n;
    const normalized = ((ruAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const pointerAngle = (2 * Math.PI - normalized + (3 * Math.PI / 2)) % (2 * Math.PI);
    const idx = Math.floor(pointerAngle / arc) % n;
    const frac = wheelFracs[idx];
    const type = Math.random() > .5 ? 'decimal' : 'porcentaje';
    ruCurrent = { frac, type };
    setText('ru-q-label', 'Convierte la fracción al formato pedido');
    setText('ru-q-text', `${frac.n}/${frac.d}`);
    setText('ru-q-sub', type === 'decimal' ? '¿Cuál es su equivalente decimal?' : '¿Cuál es su equivalente en porcentaje? (ej: 75%)');
    const inputRow = document.getElementById('ru-input-row'); if (inputRow) inputRow.style.display = 'flex';
    const inp = document.getElementById('ru-input'); if (inp) { inp.value = ''; inp.focus(); }
    document.getElementById('ru-feedback').textContent = '';
}

function checkRuleta() {
    if (!ruCurrent) return;
    const inp = document.getElementById('ru-input');
    const fb = document.getElementById('ru-feedback');
    if (!inp || !fb) return;
    const raw = inp.value.trim().replace(',', '.');
    const { frac, type } = ruCurrent;
    const exactDecimal = frac.n / frac.d;
    if (type === 'decimal') {
        const userVal = parseFloat(raw);
        const ok = !isNaN(userVal) && Math.abs(userVal - exactDecimal) < 0.005;
        if (ok) {
            ruScore += 20 + (++ruStreak >= 3 ? 10 : 0);
            fb.textContent = `✅ ¡Correcto! El decimal es ${exactDecimal.toString().slice(0, 6)}. +${ruStreak >= 3 ? 30 : 20} pts 🔥`;
            fb.style.color = 'var(--accent2)'; showToast('✅ ¡Perfecto!');
        } else {
            ruStreak = 0;
            fb.textContent = `❌ El decimal correcto es ${exactDecimal.toString().slice(0, 6)}`;
            fb.style.color = 'var(--accent1)';
        }
    } else {
        const userVal = parseFloat(raw.replace('%', ''));
        const expectedPct = exactDecimal * 100;
        const ok = !isNaN(userVal) && Math.abs(userVal - expectedPct) < 0.5;
        if (ok) {
            ruScore += 20 + (++ruStreak >= 3 ? 10 : 0);
            fb.textContent = `✅ ¡Correcto! El porcentaje es ${expectedPct}%. +${ruStreak >= 3 ? 30 : 20} pts`;
            fb.style.color = 'var(--accent2)'; showToast('✅ ¡Correcto!');
        } else {
            ruStreak = 0;
            fb.textContent = `❌ El porcentaje correcto es ${expectedPct}%`;
            fb.style.color = 'var(--accent1)';
        }
    }
    setText('ru-score', ruScore); setText('ru-streak', ruStreak);
    setTimeout(() => {
        const spinBtn = document.getElementById('ru-spin-btn');
        if (spinBtn && ruTimeLeft > 0) spinBtn.disabled = false;
        const inputRow = document.getElementById('ru-input-row'); if (inputRow) inputRow.style.display = 'none';
        setText('ru-q-label', 'Gira la ruleta para continuar');
        setText('ru-q-text', ''); setText('ru-q-sub', '');
        ruCurrent = null;
    }, 1400);
}

function startRuTimer() {
    clearInterval(ruTimerInterval);
    ruTimerInterval = setInterval(() => {
        ruTimeLeft--;
        setText('ru-timer', ruTimeLeft);
        const bar = document.getElementById('ru-timer-bar');
        if (bar) bar.style.width = (ruTimeLeft / 90 * 100) + '%';
        if (ruTimeLeft <= 0) { clearInterval(ruTimerInterval); endRuleta(); }
    }, 1000);
}

function endRuleta() {
    show('ru-question', false); show('ru-result', true);
    setText('ru-result-emoji', ruScore >= 150 ? '🏆' : ruScore >= 80 ? '⭐' : '💪');
    setText('ru-result-score', ruScore + ' pts');
    setText('ru-result-msg',
        ruScore >= 150 ? '¡Eres el rey/reina de las conversiones! 👑' :
            ruScore >= 80 ? '¡Muy bien! Sigue girando para mejorar.' :
                '¡Practica más conversiones y vuelve a intentarlo! 💪');
    saveGlobalScore(ruScore, ruStreak, 'ruleta');
}

/* =====================================================
   JUEGO 4: CLASIFICA LA FRACCIÓN
   ===================================================== */
const CL_ITEMS = [
    { display: '¾', type: 'propia' },
    { display: '⁵⁄₃', type: 'impropia' },
    { display: '2¹⁄₄', type: 'mixta' },
    { display: '⅔', type: 'propia' },
    { display: '⁷⁄₄', type: 'impropia' },
    { display: '3⅓', type: 'mixta' },
    { display: '⅛', type: 'propia' },
    { display: '⁹⁄₉', type: 'impropia' },
    { display: '1½', type: 'mixta' },
    { display: '⁴⁄₅', type: 'propia' },
    { display: '⁸⁄₃', type: 'impropia' },
    { display: '2¾', type: 'mixta' },
    { display: '⅙', type: 'propia' },
    { display: '⁶⁄₅', type: 'impropia' },
    { display: '4¼', type: 'mixta' },
];

let clQueue = [], clCurrent = null, clScore = 0, clCorrect = 0, clWrong = 0, clTotal = 10;

function startClasifica() {
    clQueue = [...CL_ITEMS].sort(() => Math.random() - .5).slice(0, clTotal);
    clScore = 0; clCorrect = 0; clWrong = 0;
    setText('cl-score', 0); setText('cl-correct', 0); setText('cl-wrong', 0);
    show('cl-start', false); show('cl-result', false);
    document.getElementById('cl-game').style.display = 'block';
    updateClProgress();
    nextClasifica();
}

function nextClasifica() {
    if (clQueue.length === 0) { endClasifica(); return; }
    clCurrent = clQueue.shift();
    const display = document.getElementById('cl-fraction-display');
    if (display) {
        display.textContent = clCurrent.display;
        display.draggable = true;
        display.ondragstart = e => e.dataTransfer.setData('text', 'frac');
        display.style.animation = 'none';
        void display.offsetWidth;
        display.style.animation = '';
    }
    document.getElementById('cl-feedback').textContent = '';
    ['propia', 'impropia', 'mixta'].forEach(b => {
        const bin = document.getElementById('bin-' + b);
        if (bin) { bin.classList.remove('correct-flash', 'wrong-flash'); }
    });
    updateClProgress();
}

function updateClProgress() {
    const done = clTotal - clQueue.length - (clCurrent ? 1 : 0);
    const bar = document.getElementById('cl-progress-bar');
    if (bar) bar.style.width = (done / clTotal * 100) + '%';
}

function dropClasifica(event, binType) {
    event.preventDefault();
    selectBin(binType);
}

function selectBin(binType) {
    if (!clCurrent) return;
    const correct = binType === clCurrent.type;
    const fb = document.getElementById('cl-feedback');
    const bin = document.getElementById('bin-' + binType);

    if (correct) {
        clCorrect++; clScore += 10;
        setText('cl-correct', clCorrect); setText('cl-score', clScore);
        fb.textContent = `✅ ¡Correcto! "${clCurrent.display}" es ${binType}.`;
        fb.style.color = 'var(--accent2)';
        if (bin) bin.classList.add('correct-flash');
        showToast('✅ ¡Bien clasificado!');
    } else {
        clWrong++;
        setText('cl-wrong', clWrong);
        fb.textContent = `❌ Era ${clCurrent.type}. "${clCurrent.display}" ${clCurrent.type === 'propia' ? 'tiene numerador < denominador' : clCurrent.type === 'impropia' ? 'tiene numerador ≥ denominador' : 'tiene parte entera + fracción'}.`;
        fb.style.color = 'var(--accent1)';
        if (bin) bin.classList.add('wrong-flash');
    }
    setTimeout(nextClasifica, 1300);
}

function endClasifica() {
    document.getElementById('cl-game').style.display = 'none';
    show('cl-result', true);
    const pct = Math.round(clCorrect / clTotal * 100);
    setText('cl-result-emoji', pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪');
    setText('cl-result-score', clScore + ' pts');
    setText('cl-result-msg',
        pct >= 90 ? `¡Perfecto! ${clCorrect}/${clTotal}. ¡Dominas los tipos de fracciones! 🎉` :
            pct >= 60 ? `¡Bien! ${clCorrect}/${clTotal}. Repasa las definiciones y vuelve a intentarlo.` :
                `${clCorrect}/${clTotal}. Revisa la sección de teoría y practica de nuevo.`);
    saveGlobalScore(clScore, clCorrect, 'clasifica');
}

/* =====================================================
   JUEGO 5: CONVERTIDOR VELOZ
   ===================================================== */
let cvTimerInterval = null, cvTimeLeft = 75, cvScore = 0, cvStreak = 0, cvCurrent = null;

const CV_ITEMS = [
    { from: '7/3', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '2 1/3' },
    { from: '9/4', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '2 1/4' },
    { from: '11/3', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '3 2/3' },
    { from: '7/2', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '3 1/2' },
    { from: '13/5', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '2 3/5' },
    { from: '17/4', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '4 1/4' },
    { from: '8/3', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '2 2/3' },
    { from: '11/4', fromType: 'Fracción impropia', toType: 'Número mixto', answer: '2 3/4' },
    { from: '2 1/3', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '7/3' },
    { from: '3 1/2', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '7/2' },
    { from: '1 3/4', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '7/4' },
    { from: '2 2/5', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '12/5' },
    { from: '3 2/3', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '11/3' },
    { from: '4 1/4', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '17/4' },
    { from: '1 5/8', fromType: 'Número mixto', toType: 'Fracción impropia', answer: '13/8' },
];

let cvPool = [];

function startConvierte() {
    cvScore = 0; cvStreak = 0; cvTimeLeft = 75;
    cvPool = [...CV_ITEMS].sort(() => Math.random() - .5);
    setText('cv-score', 0); setText('cv-timer', 75); setText('cv-streak', 0);
    const bar = document.getElementById('cv-timer-bar'); if (bar) bar.style.width = '100%';
    show('cv-start', false); show('cv-result', false); show('cv-question', true);
    loadNextConvierte();
    startCvTimer();
}

function loadNextConvierte() {
    if (cvPool.length === 0) cvPool = [...CV_ITEMS].sort(() => Math.random() - .5);
    cvCurrent = cvPool.pop();
    setText('cv-from', cvCurrent.from);
    setText('cv-to-label', `→ Escribe como ${cvCurrent.toType}`);
    setText('cv-q-label', `Convierte: ${cvCurrent.fromType} → ${cvCurrent.toType}`);
    const inp = document.getElementById('cv-input');
    if (inp) { inp.value = ''; inp.focus(); }
    document.getElementById('cv-feedback').textContent = '';
}

function checkConvierte() {
    if (!cvCurrent) return;
    const inp = document.getElementById('cv-input');
    const fb = document.getElementById('cv-feedback');
    if (!inp || !fb) return;
    const raw = inp.value.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalize = s => s.trim().replace(/\s+/g, '').replace(/(\d)(\/)/g, '$1$2');
    const userNorm = normalize(raw);
    const ansList = [cvCurrent.answer, cvCurrent.answer.replace(' ', '')].map(normalize);
    const ok = ansList.some(a => userNorm === a);
    if (ok) {
        cvStreak++;
        const bonus = cvStreak >= 3 ? 10 : 0;
        cvScore += 15 + bonus;
        setText('cv-score', cvScore); setText('cv-streak', cvStreak);
        fb.textContent = `✅ ¡Correcto! +${15 + bonus} pts`; fb.style.color = 'var(--accent2)';
        showToast(cvStreak >= 3 ? '🔥 ¡Racha de conversiones!' : '✅ ¡Bien convertido!');
        setTimeout(loadNextConvierte, 900);
    } else {
        cvStreak = 0; setText('cv-streak', 0);
        fb.textContent = `❌ La respuesta correcta es: ${cvCurrent.answer}`; fb.style.color = 'var(--accent1)';
    }
}

function startCvTimer() {
    clearInterval(cvTimerInterval);
    cvTimerInterval = setInterval(() => {
        cvTimeLeft--;
        setText('cv-timer', cvTimeLeft);
        const bar = document.getElementById('cv-timer-bar');
        if (bar) bar.style.width = (cvTimeLeft / 75 * 100) + '%';
        if (cvTimeLeft <= 0) { clearInterval(cvTimerInterval); endConvierte(); }
    }, 1000);
}

function endConvierte() {
    show('cv-question', false); show('cv-result', true);
    setText('cv-result-emoji', cvScore >= 120 ? '🏆' : cvScore >= 60 ? '⭐' : '💪');
    setText('cv-result-title', cvScore >= 90 ? '¡Genial!' : '¡Tiempo!');
    setText('cv-result-score', cvScore + ' pts');
    setText('cv-result-msg',
        cvScore >= 120 ? '¡Eres un campeón de las conversiones! 🏆' :
            cvScore >= 60 ? '¡Muy bien! Sigue practicando fracciones mixtas e impropias.' :
                '¡Repasa la sección de conversión y vuelve a intentarlo! 💪');
    saveGlobalScore(cvScore, cvStreak, 'convierte');
}

/* =====================================================
   JUEGO 6: PALABRAS Y FRACCIONES
   ===================================================== */
let pwTimerInterval = null, pwTimeLeft = 90, pwScore = 0, pwStreak = 0, pwAnswered = false;

const PW_QUESTIONS = [
    { scene: '🍕', text: 'Ana compró una pizza y la cortó en 8 partes iguales. Se comió 3 partes. ¿Qué fracción de la pizza comió?', opts: ['3/8', '3/5', '5/8', '8/3'], ans: '3/8' },
    { scene: '🚗', text: 'Un carro recorre 3/4 de un tanque de gasolina en una hora. ¿Qué fracción del tanque consume en 2 horas a ese ritmo?', opts: ['1 1/2', '3/8', '6/8', '1/2'], ans: '1 1/2' },
    { scene: '🌳', text: 'Un árbol creció 2/5 de metro en enero y 1/5 de metro en febrero. ¿Cuánto creció en total?', opts: ['3/5', '1/5', '3/10', '2/10'], ans: '3/5' },
    { scene: '🐦', text: 'De 12 pájaros en un árbol, 5 volaron. ¿Qué fracción de los pájaros se fue?', opts: ['5/12', '7/12', '5/7', '12/5'], ans: '5/12' },
    { scene: '💰', text: 'Sebastián tiene $30.000. Gasta 1/3 en comida y 1/6 en transporte. ¿Qué fracción gastó en total?', opts: ['1/2', '1/9', '2/9', '2/3'], ans: '1/2' },
    { scene: '🎂', text: 'Un pastel se dividió en 6 partes. Lucía comió 2 partes y su hermano comió 1 parte. ¿Qué fracción queda?', opts: ['1/2', '2/6', '4/6', '3/6'], ans: '1/2' },
    { scene: '☁️', text: 'Si llovió 3/8 del mes de enero y 1/4 del mes de febrero, ¿qué número representa mejor la fracción de enero?', opts: ['Propia', 'Impropia', 'Mixta', 'Entera'], ans: 'Propia' },
    { scene: '🌧️', text: 'Un recipiente con 7/4 de litro de agua tiene:', opts: ['Una fracción impropia', 'Una fracción propia', 'Un número mixto incorrecto', 'Un entero'], ans: 'Una fracción impropia' },
    { scene: '🏠', text: 'María usó 2½ tazas de harina para una receta. ¿Cómo se escribe eso como fracción impropia?', opts: ['5/2', '7/2', '3/2', '4/2'], ans: '5/2' },
    { scene: '🚲', text: 'Un ciclista recorrió 3/4 de la ruta por la mañana y 1/4 por la tarde. ¿Qué fracción recorrió en total?', opts: ['1', '4/8', '6/8', '2/4'], ans: '1' },
    { scene: '🎒', text: 'De 20 estudiantes, 12 trajeron lonchera. ¿Qué fracción simplificada del grupo trajo lonchera?', opts: ['3/5', '12/20', '6/10', '4/5'], ans: '3/5' },
    { scene: '🍊', text: 'Una naranja se divide en 4 gajos. Si comes 3 gajos, ¿qué tipo de fracción representas?', opts: ['Propia', 'Impropia', 'Mixta', 'Entera'], ans: 'Propia' },
];

let pwPool = [], pwCurrent = null;

function startPalabras() {
    pwScore = 0; pwStreak = 0; pwTimeLeft = 90; pwAnswered = false;
    pwPool = [...PW_QUESTIONS].sort(() => Math.random() - .5);
    setText('pw-score', 0); setText('pw-timer', 90); setText('pw-streak', 0);
    const bar = document.getElementById('pw-timer-bar'); if (bar) bar.style.width = '100%';
    show('pw-start', false); show('pw-result', false); show('pw-question', true);
    loadNextPalabras();
    startPwTimer();
}

function loadNextPalabras() {
    if (pwPool.length === 0) pwPool = [...PW_QUESTIONS].sort(() => Math.random() - .5);
    pwCurrent = pwPool.pop();
    pwAnswered = false;
    setText('pw-scene-icon', pwCurrent.scene);
    setText('pw-q-text', pwCurrent.text);
    setText('pw-q-label', 'Problema del mundo real');
    document.getElementById('pw-feedback').textContent = '';
    const optsDiv = document.getElementById('pw-options');
    optsDiv.innerHTML = '';
    [...pwCurrent.opts].sort(() => Math.random() - .5).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'q-option-btn';
        btn.style.fontSize = '1.1rem';
        btn.style.minHeight = '56px';
        btn.textContent = opt;
        btn.onclick = () => answerPalabras(btn, opt);
        optsDiv.appendChild(btn);
    });
}

function answerPalabras(btn, chosen) {
    if (pwAnswered) return;
    pwAnswered = true;
    const correct = chosen === pwCurrent.ans;
    document.querySelectorAll('#pw-options .q-option-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent === pwCurrent.ans) b.classList.add('correct');
    });
    const fb = document.getElementById('pw-feedback');
    if (correct) {
        btn.classList.add('correct');
        pwStreak++;
        const pts = 12 + (pwStreak >= 3 ? 8 : 0);
        pwScore += pts;
        setText('pw-score', pwScore); setText('pw-streak', pwStreak);
        fb.textContent = `✅ ¡Correcto! +${pts} pts`; fb.style.color = 'var(--accent2)';
        showToast(pwStreak >= 3 ? '🔥 ¡Racha de problemas!' : '✅ ¡Muy bien!');
    } else {
        btn.classList.add('wrong');
        pwStreak = 0; setText('pw-streak', 0);
        fb.textContent = `❌ La respuesta es: ${pwCurrent.ans}`; fb.style.color = 'var(--accent1)';
    }
    setTimeout(loadNextPalabras, 1200);
}

function startPwTimer() {
    clearInterval(pwTimerInterval);
    pwTimerInterval = setInterval(() => {
        pwTimeLeft--;
        setText('pw-timer', pwTimeLeft);
        const bar = document.getElementById('pw-timer-bar');
        if (bar) bar.style.width = (pwTimeLeft / 90 * 100) + '%';
        if (pwTimeLeft <= 0) { clearInterval(pwTimerInterval); endPalabras(); }
    }, 1000);
}

function endPalabras() {
    show('pw-question', false); show('pw-result', true);
    setText('pw-result-emoji', pwScore >= 120 ? '🏆' : pwScore >= 60 ? '⭐' : '💪');
    setText('pw-result-title', pwScore >= 90 ? '¡Excelente!' : '¡Tiempo!');
    setText('pw-result-score', pwScore + ' pts');
    setText('pw-result-msg',
        pwScore >= 120 ? '¡Eres un experto resolviendo problemas con fracciones! 🌟' :
            pwScore >= 60 ? '¡Buen trabajo! Los problemas contextuales son clave en matemáticas.' :
                '¡Practica leyendo enunciados matemáticos con calma! 💪');
    saveGlobalScore(pwScore, pwStreak, 'palabras');
}

/* =====================================================
   JUEGO 7: GRÁFICA A FRACCIÓN
   ===================================================== */
let gvScore = 0, gvStreak = 0, gvCurrent = null, gvRounds = 0;

function startGraficaValor() {
    gvScore = 0; gvStreak = 0; gvRounds = 0;
    setText('gv-score', 0); setText('gv-streak', 0);
    show('gv-start', false); show('gv-result', false); show('gv-question', true);
    loadNextGraficaValor();
}

function loadNextGraficaValor() {
    if (gvRounds >= 10) { endGraficaValor(); return; }
    gvRounds++;
    const denominators = [2, 3, 4, 5, 6, 8];
    const d = denominators[Math.floor(Math.random() * denominators.length)];
    const n = Math.floor(Math.random() * d) + 1;
    gvCurrent = { n, d };
    drawFractionGraphic('gv-graphic', n, d);
    const inp = document.getElementById('gv-input');
    if (inp) { inp.value = ''; inp.focus(); }
    document.getElementById('gv-feedback').textContent = '';
}

function drawFractionGraphic(containerId, n, d) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const shape = Math.random() > 0.5 ? 'circle' : 'rect';
    let svgHtml = '';
    if (shape === 'circle') {
        const size = 160;
        const cx = size / 2, cy = size / 2, r = 75;
        svgHtml = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        if (d === 1) {
            svgHtml += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--primary)" stroke="#000" stroke-width="2"/>`;
        } else {
            let angle = -Math.PI / 2;
            const slice = (2 * Math.PI) / d;
            for (let i = 0; i < d; i++) {
                const x1 = cx + r * Math.cos(angle);
                const y1 = cy + r * Math.sin(angle);
                const x2 = cx + r * Math.cos(angle + slice);
                const y2 = cy + r * Math.sin(angle + slice);
                const largeArc = slice > Math.PI ? 1 : 0;
                const fill = i < n ? 'var(--primary)' : 'rgba(0,0,0,0.05)';
                svgHtml += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${fill}" stroke="#000" stroke-width="2"/>`;
                angle += slice;
            }
        }
        svgHtml += `</svg>`;
    } else {
        const width = 240, height = 60;
        svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        const cellW = width / d;
        for (let i = 0; i < d; i++) {
            const fill = i < n ? 'var(--accent1)' : 'rgba(0,0,0,0.05)';
            svgHtml += `<rect x="${i * cellW}" y="0" width="${cellW}" height="${height}" fill="${fill}" stroke="#000" stroke-width="2"/>`;
        }
        svgHtml += `</svg>`;
    }
    container.innerHTML = svgHtml;
}

function checkGraficaValor() {
    if (!gvCurrent) return;
    const inp = document.getElementById('gv-input');
    const fb = document.getElementById('gv-feedback');
    if (!inp || !fb) return;
    const raw = inp.value.trim();
    if (!raw) { fb.textContent = '⚠️ Escribe una fracción'; fb.style.color = 'var(--accent3)'; return; }
    const userVal = parseFrac(raw);
    const correctVal = gvCurrent.n / gvCurrent.d;
    if (userVal === null) { fb.textContent = '⚠️ Formato inválido. Usa p/q'; fb.style.color = 'var(--accent3)'; return; }
    if (Math.abs(userVal - correctVal) < 0.0001) {
        gvStreak++;
        const pts = 10 + (gvStreak >= 3 ? 5 : 0);
        gvScore += pts;
        setText('gv-score', gvScore); setText('gv-streak', gvStreak);
        fb.textContent = `✅ ¡Correcto! +${pts} pts`; fb.style.color = 'var(--accent2)';
        showToast('✅ ¡Correcto!');
        setTimeout(loadNextGraficaValor, 1000);
    } else {
        gvStreak = 0; setText('gv-streak', 0);
        fb.textContent = `❌ Era: ${gvCurrent.n}/${gvCurrent.d}`; fb.style.color = 'var(--accent1)';
        setTimeout(loadNextGraficaValor, 1500);
    }
}

function endGraficaValor() {
    show('gv-question', false); show('gv-result', true);
    setText('gv-result-emoji', gvScore >= 100 ? '🏆' : gvScore >= 50 ? '⭐' : '💪');
    setText('gv-result-score', gvScore + ' pts');
    setText('gv-result-msg', gvScore >= 100 ? '¡Excelente lectura de gráficas!' : 'Sigue practicando para mejorar.');
    saveGlobalScore(gvScore, gvStreak, 'grafica-valor');
}

/* =====================================================
   JUEGO 8: ARMA LA GRÁFICA
   ===================================================== */
let vgScore = 0, vgStreak = 0, vgCurrent = null, vgRounds = 0;
let vgSelectedParts = 0;

function startValorGrafica() {
    vgScore = 0; vgStreak = 0; vgRounds = 0;
    setText('vg-score', 0); setText('vg-streak', 0);
    show('vg-start', false); show('vg-result', false); show('vg-question', true);
    loadNextValorGrafica();
}

function loadNextValorGrafica() {
    if (vgRounds >= 8) { endValorGrafica(); return; }
    vgRounds++;
    const denominators = [3, 4, 5, 6, 8, 10];
    const d = denominators[Math.floor(Math.random() * denominators.length)];
    const n = Math.floor(Math.random() * d) + 1;
    vgCurrent = { n, d };
    vgSelectedParts = 0;
    document.getElementById('vg-target-fraction').innerHTML = `<span class="fraction-inline" style="font-size:1em;"><span>${n}</span><span>${d}</span></span>`;
    document.getElementById('vg-feedback').textContent = '';
    buildInteractiveGraphic('vg-builder', d);
}

function buildInteractiveGraphic(containerId, d) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const size = 220;
    let html = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    const cx = size / 2, cy = size / 2, r = 100;
    let angle = -Math.PI / 2;
    const slice = (2 * Math.PI) / d;
    for (let i = 0; i < d; i++) {
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + slice);
        const y2 = cy + r * Math.sin(angle + slice);
        const largeArc = slice > Math.PI ? 1 : 0;
        html += `<path class="vg-part" data-idx="${i}" data-selected="false" d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="rgba(0,0,0,0.05)" stroke="#000" stroke-width="2" style="cursor:pointer; transition: fill 0.2s, opacity 0.2s;"/>`;
        angle += slice;
    }
    html += `</svg>`;
    container.innerHTML = html;
    document.querySelectorAll('.vg-part').forEach(part => {
        part.addEventListener('click', function () {
            if (this.getAttribute('data-selected') === 'true') {
                this.setAttribute('data-selected', 'false');
                this.setAttribute('fill', 'rgba(0,0,0,0.05)');
                vgSelectedParts--;
            } else {
                this.setAttribute('data-selected', 'true');
                this.setAttribute('fill', 'var(--accent2)');
                vgSelectedParts++;
            }
        });
        part.addEventListener('mouseover', function () { this.style.opacity = '0.8'; });
        part.addEventListener('mouseout', function () { this.style.opacity = '1'; });
    });
}

function resetValorGrafica() {
    vgSelectedParts = 0;
    document.querySelectorAll('.vg-part').forEach(part => {
        part.setAttribute('data-selected', 'false');
        part.setAttribute('fill', 'rgba(0,0,0,0.05)');
    });
    document.getElementById('vg-feedback').textContent = '';
}

function checkValorGrafica() {
    if (!vgCurrent) return;
    const fb = document.getElementById('vg-feedback');
    if (!fb) return;
    if (vgSelectedParts === vgCurrent.n) {
        vgStreak++;
        const pts = 15 + (vgStreak >= 3 ? 5 : 0);
        vgScore += pts;
        setText('vg-score', vgScore); setText('vg-streak', vgStreak);
        fb.textContent = `✅ ¡Correcto! +${pts} pts`; fb.style.color = 'var(--accent2)';
        showToast('✅ ¡Perfecto!');
        document.querySelectorAll('.vg-part').forEach(p => p.style.pointerEvents = 'none');
        setTimeout(loadNextValorGrafica, 1000);
    } else {
        vgStreak = 0; setText('vg-streak', 0);
        fb.textContent = `❌ Has coloreado ${vgSelectedParts} partes, pero necesitas ${vgCurrent.n}.`;
        fb.style.color = 'var(--accent1)';
    }
}

function endValorGrafica() {
    show('vg-question', false); show('vg-result', true);
    setText('vg-result-emoji', vgScore >= 120 ? '🏆' : vgScore >= 60 ? '⭐' : '💪');
    setText('vg-result-score', vgScore + ' pts');
    setText('vg-result-msg', vgScore >= 120 ? '¡Eres un artista de las fracciones!' : 'Sigue practicando tu representación gráfica.');
    saveGlobalScore(vgScore, vgStreak, 'valor-grafica');
}

/* ===== ENTER KEY ===== */
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const ad = document.getElementById('game-adivina');
    const ru = document.getElementById('game-ruleta');
    const cv = document.getElementById('game-convierte');
    const gv = document.getElementById('game-grafica-valor');
    if (ad && ad.style.display !== 'none') checkAdivina();
    if (ru && ru.style.display !== 'none') checkRuleta();
    if (cv && cv.style.display !== 'none') checkConvierte();
    if (gv && gv.style.display !== 'none') checkGraficaValor();
});