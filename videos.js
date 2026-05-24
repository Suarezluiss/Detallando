/* =====================================================
   VIDEOS.JS — Lógica Interactiva Videoteca
   ===================================================== */

/* ===== DATA ===== */
const VIDEO_DATA = {

    v1: {
        youtubeId: 'ql3lLSwsr98',
        title: 'Introducción a los Números Racionales',
        tag: 'conceptos',
        tagClass: 'tag-conceptos',
        desc: 'Una explicación clara y visual de qué son los números racionales.',
    },

    v2: {
        youtubeId: 'B7I2E78IxsI',
        title: 'Fracciones Equivalentes',
        tag: 'conceptos',
        tagClass: 'tag-conceptos',
        desc: 'Aprende a encontrar fracciones equivalentes.',
    },

    v3: {
        youtubeId: 'MhgOBorWbhg',
        title: 'Suma y Resta de Fracciones',
        tag: 'operaciones',
        tagClass: 'tag-operaciones',
        desc: 'Domina cómo sumar y restar fracciones.',
    },

    v4: {
        youtubeId: 'RPhaidW0dmY',
        title: 'Multiplicación y División',
        tag: 'operaciones',
        tagClass: 'tag-operaciones',
        desc: 'Aprende producto cruzado y fracción inversa.',
    },

    v5: {
        youtubeId: '4ywTWCaLmXE',
        title: 'Recta Numérica',
        tag: 'conceptos',
        tagClass: 'tag-conceptos',
        desc: 'Ubica fracciones fácilmente.',
    },

    v6: {
        youtubeId: 'zBAOT2vUFPI',
        title: 'Decimales y Porcentajes',
        tag: 'aplicaciones',
        tagClass: 'tag-aplicaciones',
        desc: 'Convierte entre fracción, decimal y porcentaje.',
    },

    v7: {
        youtubeId: 'vimcE6ui6NQ',
        title: 'Problemas con Fracciones',
        tag: 'aplicaciones',
        tagClass: 'tag-aplicaciones',
        desc: 'Ejercicios de la vida real.',
    },

    v8: {
        youtubeId: 'kYyDc0XRUeg',
        title: 'Repaso Completo',
        tag: 'repaso',
        tagClass: 'tag-repaso',
        desc: 'Todo el tema en un solo video.',
    },

    v9: {
        youtubeId: '1hfMRT5Ai-4',
        title: 'Tipos de Fracciones',
        tag: 'conceptos',
        tagClass: 'tag-conceptos',
        desc: 'Propias, impropias y mixtas.',
    },

    v10: {
        youtubeId: 'IdivcZZ1DEI',
        title: 'Simplificación de Fracciones',
        tag: 'operaciones',
        tagClass: 'tag-operaciones',
        desc: 'Cómo reducir fracciones usando el MCD.',
    },

    v11: {
        youtubeId: '1hfMRT5Ai-4',
        title: 'MCM y MCD Paso a Paso',
        tag: 'operaciones',
        tagClass: 'tag-operaciones',
        desc: 'Herramientas clave para fracciones.',
    },

    v12: {
        youtubeId: '8ME0-YAx9gE',
        title: 'Fracciones en la Cocina',
        tag: 'aplicaciones',
        tagClass: 'tag-aplicaciones',
        desc: 'Uso de fracciones en recetas.',
    },

    v13: {
        youtubeId: '3hl-27cRmZ0',
        title: 'Ejercicios Resueltos',
        tag: 'repaso',
        tagClass: 'tag-repaso',
        desc: '20 ejercicios explicados paso a paso.',
    }
};

/* ===== STATE ===== */
let currentVideoId = null;
let currentTag = 'all';
let currentSearch = '';

let watched = new Set(
    JSON.parse(localStorage.getItem('watched_videos') || '[]')
);

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    restoreWatched();
    updateProgress();
});

/* ===== FEATURED ===== */
function playFeatured() {

    const thumb = document.getElementById('featured-thumb');
    const iframe = document.getElementById('featured-iframe');

    thumb.style.display = 'none';
    iframe.style.display = 'block';

    iframe.src =
        'https://www.youtube.com/embed/ql3lLSwsr98?autoplay=1&rel=0';
}

/* ===== MODAL ===== */
function openModal(id) {

    const data = VIDEO_DATA[id];

    if (!data) return;

    currentVideoId = id;

    document.getElementById('modal-title').textContent =
        data.title;

    document.getElementById('modal-desc').textContent =
        data.desc;

    const tag = document.getElementById('modal-tag');

    tag.textContent =
        data.tag.charAt(0).toUpperCase() + data.tag.slice(1);

    tag.className =
        'vid-tag ' + data.tagClass;

    document.getElementById('modal-iframe').src =
        `https://www.youtube.com/embed/${data.youtubeId}?autoplay=1&rel=0`;

    document.getElementById('vid-modal')
        .classList.add('open');

    document.body.style.overflow = 'hidden';
}

function closeModal() {

    document.getElementById('vid-modal')
        .classList.remove('open');

    document.getElementById('modal-iframe').src = '';

    document.body.style.overflow = '';
}

function closeModalBackdrop(e) {

    if (e.target.id === 'vid-modal') {
        closeModal();
    }
}

document.addEventListener('keydown', e => {

    if (e.key === 'Escape') {
        closeModal();
    }
});

/* ===== WATCHED ===== */
function markCurrentWatched() {

    if (!currentVideoId) return;

    markWatched(currentVideoId);
}

function markWatched(id) {

    watched.add(id);

    localStorage.setItem(
        'watched_videos',
        JSON.stringify([...watched])
    );

    const badge =
        document.getElementById('wb-' + id);

    if (badge) {
        badge.style.display = 'flex';
    }

    updateProgress();

    showToast('✅ Video marcado como visto');
}

function restoreWatched() {

    watched.forEach(id => {

        const badge =
            document.getElementById('wb-' + id);

        if (badge) {
            badge.style.display = 'flex';
        }
    });
}

/* ===== PROGRESS ===== */
function updateProgress() {

    const total =
        Object.keys(VIDEO_DATA).length;

    const done =
        watched.size;

    const pct =
        Math.round((done / total) * 100);

    const label =
        document.getElementById('progress-label');

    const bar =
        document.getElementById('progress-track-bar');

    if (label) {
        label.textContent =
            `${done} de ${total} videos vistos`;
    }

    if (bar) {
        bar.style.width = pct + '%';
    }
}

/* ===== SEARCH ===== */
function filterVideos(query) {

    currentSearch =
        query.toLowerCase().trim();

    const clearBtn =
        document.getElementById('search-clear-btn');

    clearBtn.style.display =
        currentSearch ? 'flex' : 'none';

    applyFilters();
}

function clearSearch() {

    document.getElementById('vid-search').value = '';

    currentSearch = '';

    document.getElementById('search-clear-btn')
        .style.display = 'none';

    applyFilters();
}

/* ===== FILTER ===== */
function filterByTag(tag, btn) {

    currentTag = tag;

    document.querySelectorAll('.pill')
        .forEach(p => p.classList.remove('active'));

    btn.classList.add('active');

    applyFilters();
}

function applyFilters() {

    const cards =
        document.querySelectorAll('.vid-card');

    let visible = 0;

    cards.forEach(card => {

        const tagMatch =
            currentTag === 'all' ||
            card.dataset.tags.includes(currentTag);

        const searchMatch =
            !currentSearch ||
            card.dataset.title
                .toLowerCase()
                .includes(currentSearch);

        if (tagMatch && searchMatch) {

            card.classList.remove('hidden');
            visible++;

        } else {

            card.classList.add('hidden');
        }
    });

    document.getElementById('vid-count')
        .textContent =
        `${visible} videos`;

    document.getElementById('vid-empty')
        .style.display =
        visible === 0 ? 'block' : 'none';
}

/* ===== TOAST ===== */
function showToast(msg) {

    const t =
        document.getElementById('toast');

    t.textContent = msg;

    t.className =
        'toast show';

    setTimeout(() => {

        t.className = 'toast';

    }, 3000);
}