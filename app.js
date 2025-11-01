// app.js

const API_BASE = 'https://api.alquran.cloud/v1';

// Données statiques (SURAHS, RECITERS) et état
const SURAHS = [ /* … votre tableau SURAHS … */ ];
const RECITERS = [ /* … votre tableau RECITERS … */ ];
const state = {
  startSurah: 1,
  startVerse: 1,
  endSurah: 114,
  endVerse: 6,
  attempts: '5',
  reciter: 'ar.shuraym',
  mode: 'verse-number',
  pool: [],
  asked: new Set(),
  correct: 0,
  incorrect: 0,
  startedAt: null,
  endedAt: null,
  activeElapsedMs: 0,
  lastFocusTs: null,
  history: [],
  answeredCurrent: false
};

// Utilitaires (toWestern, getSurahByNumber, formatDuration…)
// … fonctions fetchAyahData, buildAudioUrl, loadAudio, fetchReciters (si utilisé) …

// UI binding
function populateSurahs() { /* … */ }
function populateReciters() {
  const sel = document.getElementById('reciter-select');
  sel.innerHTML = '';
  RECITERS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    sel.appendChild(opt);
  });
  sel.value = 'ar.shuraym';
}

// Quiz flows: showQuestion, revealVerse, showAudioQuestion, revealAudioInfo,
// recordAnswer (avec answeredCurrent), nextQuestionFlow(async), startQuiz, bindUI…

// Enregistrement des événements
window.addEventListener('load', () => {
  populateSurahs();
  populateReciters();
  bindUI();
});

// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
