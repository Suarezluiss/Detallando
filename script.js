/* =====================================================
   SCRIPT.JS — Lógica Interactiva Principal
   Para: index.html · Números Racionales 7° Grado
   ===================================================== */

/* ===== BUBBLES (hero) ===== */
; (function () {
  const container = document.getElementById('bubbles')
  if (!container) return
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('div')
    b.className = 'bubble'
    const size = 16 + Math.random() * 60
    Object.assign(b.style, {
      width: size + 'px',
      height: size + 'px',
      left: Math.random() * 100 + '%',
      bottom: '-' + (size + 10) + 'px',
      animationDuration: 10 + Math.random() * 16 + 's',
      animationDelay: Math.random() * 12 + 's'
    })
    container.appendChild(b)
  }
})()

/* ===== TOAST ===== */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast')
  if (!t) return
  t.textContent = msg
  t.className = 'toast ' + type + ' show'
  setTimeout(() => {
    t.className = 'toast'
  }, 3200)
}

/* ===== TABS ===== */
function showTab(name, btn) {
  document
    .querySelectorAll('.tab-panel')
    .forEach(p => p.classList.remove('active'))
  const panel = document.getElementById('tab-' + name)
  if (panel) panel.classList.add('active')

  document
    .querySelectorAll('.tab-btn')
    .forEach(b => b.classList.remove('active'))
  if (btn) btn.classList.add('active')
}

/* ===== THEORY ACCORDION — solo una tarjeta abierta a la vez ===== */
function toggleTheory(header) {
  const body = header.nextElementSibling
  const isOpen = header.classList.contains('open')

  // Cierra TODAS las tarjetas primero
  document.querySelectorAll('.theory-header').forEach(h => {
    h.classList.remove('open')
    const b = h.nextElementSibling
    if (b) {
      b.classList.remove('open')
      b.style.maxHeight = '0'
    }
  })

  // Si estaba cerrada, ábrela midiendo el contenido real
  if (!isOpen) {
    header.classList.add('open')
    body.classList.add('open')
    // Medimos el alto real del contenido antes de animar
    body.style.maxHeight = 'none'
    const realHeight = body.scrollHeight
    body.style.maxHeight = '0'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.style.maxHeight = realHeight + 'px'
      })
    })
  }
}

/* ===================================================
   METHODS ACCORDION (Suma y Resta de Fracciones)
   FIX PRINCIPAL: mide el alto real antes de animar
   =================================================== */
function toggleMethod(header) {
  const body = header.nextElementSibling   // .method-body
  const isOpen = body.classList.contains('open')
  const accordion = header.closest('.methods-accordion')

  // 1. Cierra todos los métodos del mismo acordeón
  if (accordion) {
    accordion.querySelectorAll('.method-body').forEach(b => {
      b.classList.remove('open')
      b.style.maxHeight = '0'
      b.style.paddingBottom = '0'
    })
    accordion.querySelectorAll('.m-toggle').forEach(t => {
      t.style.transform = ''
    })
  }

  // 2. Si estaba cerrado, lo abrimos midiendo su altura real
  if (!isOpen) {
    // a) Ponemos la clase para que el padding y border-top aparezcan
    body.classList.add('open')
    body.style.paddingBottom = '20px'

    // b) Medimos el scrollHeight con el contenido visible (sin overflow: hidden)
    //    Para eso, temporalmente dejamos max-height ilimitado
    body.style.transition = 'none'       // desactivamos transición para medir
    body.style.maxHeight = 'none'
    const realHeight = body.scrollHeight  // medida real
    body.style.maxHeight = '0'            // volvemos a 0

    // c) En el siguiente frame activamos la transición y animamos al alto real
    requestAnimationFrame(() => {
      body.style.transition = ''          // reactivamos transición del CSS
      requestAnimationFrame(() => {
        body.style.maxHeight = realHeight + 'px'
      })
    })

    // d) Rotamos la flecha del header
    const toggle = header.querySelector('.m-toggle')
    if (toggle) toggle.style.transform = 'rotate(180deg)'
  }
}

/* ===== VIDEO MODAL ===== */
function openVideo() {
  const modal = document.getElementById('video-modal')
  const frame = document.getElementById('yt-frame')
  if (!modal || !frame) return
  frame.src = 'https://www.youtube.com/embed/ql3lLSwsr98?autoplay=1'
  modal.style.display = 'flex'
  document.body.style.overflow = 'hidden'
}

function closeVideo() {
  const modal = document.getElementById('video-modal')
  const frame = document.getElementById('yt-frame')
  if (!modal || !frame) return
  modal.style.display = 'none'
  frame.src = ''
  document.body.style.overflow = ''
}

document.getElementById('video-modal')?.addEventListener('click', function (e) {
  if (e.target === this) closeVideo()
})

/* ===== FRACTION EVALUATION HELPER ===== */
function parseFrac(str) {
  str = str.trim().replace(/\s+/g, '')
  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length !== 2) return null
    const n = parseInt(parts[0]),
      d = parseInt(parts[1])
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return n / d
  }
  const n = parseFloat(str)
  return isNaN(n) ? null : n
}

function fracEqual(a, b, tol = 0.0001) {
  return Math.abs(a - b) < tol
}

function evalFrac(inputId, correct, feedbackId, force = false) {
  const inp = document.getElementById(inputId)
  const fb = document.getElementById(feedbackId)
  if (!inp || !fb) return

  const raw = inp.value.trim()
  if (!raw && !force) {
    fb.textContent = ''
    fb.style.color = ''
    return
  }

  const userVal = parseFrac(raw)
  const correctVal = parseFrac(correct)

  if (userVal === null) {
    fb.textContent = '⚠️ Formato inválido. Usa p/q (ej: 3/4)'
    fb.style.color = 'var(--accent1)'
    return
  }

  if (fracEqual(userVal, correctVal)) {
    fb.textContent = '✅ ¡Correcto!'
    fb.style.color = 'var(--accent2)'
    inp.style.borderColor = 'var(--accent2)'
    showToast('¡Respuesta correcta! 🎉')
  } else {
    if (force) {
      fb.textContent = '❌ La respuesta correcta es ' + correct
      fb.style.color = 'var(--accent1)'
      inp.style.borderColor = 'var(--accent1)'
    }
  }
}

/* ===== PRESABERES QUIZ ===== */
let pCorrect = 0

function checkPresaberes(btn, idx, isCorrect) {
  const q = document.getElementById('pq-' + idx)
  if (!q) return

  q.querySelectorAll('.option').forEach(b => {
    b.disabled = true
    b.style.opacity = '0.55'
  })
  btn.style.opacity = '1'

  const fb = document.getElementById('pfb-' + idx)

  if (isCorrect) {
    btn.classList.add('correct')
    pCorrect++
    if (fb) {
      fb.textContent = '✅ ¡Excelente! Respuesta correcta.'
      fb.style.color = 'var(--accent2)'
    }
    showToast('¡Correcto! 🌟')
  } else {
    btn.classList.add('wrong')
    q.querySelectorAll('.option').forEach(b => {
      if (b.onclick && b.onclick.toString().includes('true'))
        b.classList.add('correct')
    })
    if (fb) {
      fb.textContent = '❌ No es la correcta. ¡Sigue intentando!'
      fb.style.color = 'var(--accent1)'
    }
  }

  const next = document.getElementById('pq-' + (idx + 1))
  if (next) {
    setTimeout(() => {
      next.style.display = 'block'
      next.style.animation = 'slideUp 0.4s'
    }, 1200)
  } else {
    setTimeout(showPresaberesResult, 1400)
  }
}

function showPresaberesResult() {
  const el = document.getElementById('presaberes-result')
  if (!el) return
  const total = typeof pTotal !== 'undefined' ? pTotal : 7
  const msg =
    pCorrect === total
      ? `🎉 ¡Excelente! Obtuviste ${pCorrect}/${total}. ¡Tienes una base sólida!`
      : pCorrect >= Math.ceil(total / 2)
        ? `⭐ Bien hecho. ${pCorrect}/${total} correctas. ¡Estás casi listo!`
        : `💪 ${pCorrect}/${total} correctas. ¡Esta unidad te ayudará mucho!`
  el.innerHTML = `<div style="background:rgba(79,53,210,0.06);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px 22px;margin-top:8px;">
    <strong style="color:var(--primary);font-size:1rem;">${msg}</strong>
  </div>`
}

/* ===== ORDERING GAME ===== */
const orderItems = [
  { label: '-1/2', value: -0.5 },
  { label: '3/4', value: 0.75 },
  { label: '-2', value: -2 },
  { label: '1/3', value: 0.333 },
  { label: '5/4', value: 1.25 }
]

let orderDragging = null

function buildOrderGame() {
  const src = document.getElementById('order-source')
  const target = document.getElementById('order-target')
  if (!src || !target) return

  src.innerHTML = ''
  target.innerHTML = ''
  document.getElementById('order-feedback').textContent = ''

  const shuffled = [...orderItems].sort(() => Math.random() - 0.5)
  shuffled.forEach(item => src.appendChild(createOrderItem(item)))

    ;[src, target].forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault()
        zone.classList.add('over')
      })
      zone.addEventListener('dragleave', () => zone.classList.remove('over'))
      zone.addEventListener('drop', e => {
        e.preventDefault()
        zone.classList.remove('over')
        if (orderDragging) zone.appendChild(orderDragging)
      })
    })
}

function createOrderItem(item) {
  const el = document.createElement('div')
  el.className = 'order-item'
  el.textContent = item.label
  el.dataset.val = item.value
  el.draggable = true
  el.addEventListener('dragstart', () => {
    orderDragging = el
    el.classList.add('dragging')
  })
  el.addEventListener('dragend', () => {
    orderDragging = null
    el.classList.remove('dragging')
  })
  return el
}

function checkOrder() {
  const fb = document.getElementById('order-feedback')
  const items = [
    ...document.getElementById('order-target').querySelectorAll('.order-item')
  ]
  if (items.length < orderItems.length) {
    fb.textContent = '⚠️ Primero mueve todos los números a la zona de orden.'
    fb.style.color = 'var(--accent3)'
    return
  }
  const vals = items.map(i => parseFloat(i.dataset.val))
  const sorted = [...vals].sort((a, b) => a - b)
  const ok = vals.every((v, i) => Math.abs(v - sorted[i]) < 0.001)
  if (ok) {
    fb.textContent = '🎉 ¡Perfecto! Orden correcto de menor a mayor.'
    fb.style.color = 'var(--accent2)'
    showToast('¡Orden correcto! 🌟')
  } else {
    fb.textContent =
      '❌ El orden no es correcto. Recuerda: los negativos son los menores.'
    fb.style.color = 'var(--accent1)'
  }
}

function resetOrder() {
  buildOrderGame()
}

/* ===== MEMORY GAME ===== */
const memPairs = [
  { a: '1/2', b: '0.5' },
  { a: '3/4', b: '0.75' },
  { a: '1/4', b: '25%' },
  { a: '2/5', b: '0.4' },
  { a: '1/5', b: '20%' },
  { a: '1/8', b: '0.125' }
]

let memFlipped = [],
  memLocked = false,
  memMatches = 0,
  memAttempts = 0

function initMemory() {
  memFlipped = []
  memLocked = false
  memMatches = 0
  memAttempts = 0
  document.getElementById('mem-attempts').textContent = 0
  document.getElementById('mem-matches').textContent = 0

  const grid = document.getElementById('memory-grid')
  if (!grid) return
  grid.innerHTML = ''

  const cards = []
  memPairs.forEach((p, i) => {
    cards.push({ pairId: i, face: p.a })
    cards.push({ pairId: i, face: p.b })
  })
  cards.sort(() => Math.random() - 0.5)

  cards.forEach(c => {
    const card = document.createElement('div')
    card.className = 'mem-card'
    card.dataset.pair = c.pairId
    card.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-front">🔢</div>
        <div class="mem-back">${c.face}</div>
      </div>`
    card.addEventListener('click', () => flipMemCard(card))
    grid.appendChild(card)
  })
}

function flipMemCard(card) {
  if (
    memLocked ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  )
    return
  card.classList.add('flipped')
  memFlipped.push(card)

  if (memFlipped.length === 2) {
    memLocked = true
    memAttempts++
    document.getElementById('mem-attempts').textContent = memAttempts

    if (memFlipped[0].dataset.pair === memFlipped[1].dataset.pair) {
      memFlipped[0].classList.add('matched')
      memFlipped[1].classList.add('matched')
      memMatches++
      document.getElementById('mem-matches').textContent = memMatches
      memFlipped = []
      memLocked = false
      showToast('¡Par encontrado! ✅')
      if (memMatches === memPairs.length) {
        setTimeout(() => showToast('🏆 ¡Completaste el memorama!'), 400)
      }
    } else {
      setTimeout(() => {
        memFlipped.forEach(c => c.classList.remove('flipped'))
        memFlipped = []
        memLocked = false
      }, 1000)
    }
  }
}

/* ===== QUIZ CIERRE ===== */
let quizAnswers = []
let quizCorrects = 0
const TOTAL_QUESTIONS = 6

function selectQuiz(btn, qIdx, isCorrect) {
  const q = document.getElementById('qq-' + qIdx)
  if (!q) return

  q.querySelectorAll('.quiz-option').forEach(b => {
    b.disabled = true
    b.style.opacity = '0.5'
  })
  btn.style.opacity = '1'

  const fb = document.getElementById('qfb-' + qIdx)
  const nextBtn = document.getElementById('qnext-' + qIdx)

  if (isCorrect) {
    btn.classList.add('correct')
    quizCorrects++
    if (fb) {
      fb.textContent = '✅ ¡Correcto!'
      fb.style.color = 'var(--accent2)'
    }
  } else {
    btn.classList.add('wrong')
    q.querySelectorAll('.quiz-option').forEach(b => {
      if (b.onclick?.toString().includes(',true)')) b.classList.add('correct')
    })
    if (fb) {
      fb.textContent = '❌ Incorrecto.'
      fb.style.color = 'var(--accent1)'
    }
  }

  quizAnswers[qIdx] = isCorrect

  const progress = ((qIdx + 1) / TOTAL_QUESTIONS) * 100
  const bar = document.getElementById('quiz-progress')
  if (bar) bar.style.width = progress + '%'

  if (nextBtn) nextBtn.classList.add('visible')
}

function nextQuiz(nextIdx) {
  const current = document.getElementById('qq-' + (nextIdx - 1))
  const next = document.getElementById('qq-' + nextIdx)
  if (current) current.classList.remove('active')
  if (next) next.classList.add('active')
}

function showResults() {
  const current = document.getElementById('qq-' + (TOTAL_QUESTIONS - 1))
  if (current) current.classList.remove('active')

  const resultsEl = document.getElementById('quiz-results')
  if (!resultsEl) return
  resultsEl.classList.add('visible')

  const wrong = TOTAL_QUESTIONS - quizCorrects
  const pct = Math.round((quizCorrects / TOTAL_QUESTIONS) * 100)

  document.getElementById('result-emoji').textContent =
    quizCorrects >= 5 ? '🏆' : quizCorrects >= 3 ? '⭐' : '💪'
  document.getElementById(
    'result-score'
  ).textContent = `${quizCorrects}/${TOTAL_QUESTIONS}`
  document.getElementById('result-label').textContent =
    quizCorrects === 6
      ? '¡Perfecto! Dominas los racionales 🎉'
      : quizCorrects >= 4
        ? '¡Bien hecho! Sigue practicando'
        : '¡No te rindas! Repasa la teoría'
  document.getElementById('res-correct').textContent = quizCorrects
  document.getElementById('res-wrong').textContent = wrong
  document.getElementById('res-pct').textContent = pct + '%'

  const bar = document.getElementById('quiz-progress')
  if (bar) bar.style.width = '100%'

  showToast(
    quizCorrects >= 4 ? '¡Buen resultado! 🏆' : '¡Sigue practicando! 💪'
  )
}

function resetQuiz() {
  quizAnswers = []
  quizCorrects = 0

  const resultsEl = document.getElementById('quiz-results')
  if (resultsEl) resultsEl.classList.remove('visible')

  const bar = document.getElementById('quiz-progress')
  if (bar) bar.style.width = '0%'

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const q = document.getElementById('qq-' + i)
    if (!q) continue
    q.classList.toggle('active', i === 0)
    q.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = false
      b.style.opacity = '1'
      b.classList.remove('correct', 'wrong')
    })
    const fb = document.getElementById('qfb-' + i)
    if (fb) {
      fb.textContent = ''
      fb.style.color = ''
    }
    const nb = document.getElementById('qnext-' + i)
    if (nb) nb.classList.remove('visible')
  }
}

/* ===== STAR RATING ===== */
function rateSelf(stars) {
  document.querySelectorAll('.eval-star').forEach((s, i) => {
    s.classList.toggle('active', i < stars)
  })
  showToast(
    stars >= 4
      ? '¡Vas muy bien! 🌟'
      : stars >= 2
        ? 'Sigue practicando 💪'
        : '¡No te rindas! ❤️'
  )
}

/* ===== REFLECTION SAVE ===== */
function saveReflection() {
  const txt = document.getElementById('reflection-text')
  const confirm = document.getElementById('save-confirm')
  if (!txt || !txt.value.trim()) {
    showToast('Escribe algo primero 😊', 'error')
    return
  }
  localStorage.setItem('reflection_racionales', txt.value.trim())
  if (confirm) {
    confirm.style.display = 'inline'
    setTimeout(() => {
      confirm.style.display = 'none'
    }, 3000)
  }
  showToast('¡Reflexión guardada! 💾')
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Restaurar reflexión guardada
  const saved = localStorage.getItem('reflection_racionales')
  const area = document.getElementById('reflection-text')
  if (saved && area) area.value = saved

  // Componentes interactivos
  buildOrderGame()
  initMemory()

  // Nav activo al hacer scroll
  const sections = document.querySelectorAll('section[id]')
  const navLinks = document.querySelectorAll('.nav-links a')

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => {
            a.classList.toggle(
              'active',
              a.getAttribute('href') === '#' + entry.target.id
            )
          })
        }
      })
    },
    { threshold: 0.4 }
  )

  sections.forEach(s => observer.observe(s))
})