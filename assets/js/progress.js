/**
 * Модуль геймификации и трекера прогресса «Статика ЕГЭ 2.0»
 * Сохранение испытаний и решенных задач в localStorage.
 */

const STORAGE_KEY = 'statics_progress_v2';

export function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw);
    return {
      challenges: { ...getDefaultProgress().challenges, ...(parsed.challenges || {}) },
      solvedTasks: { ...getDefaultProgress().solvedTasks, ...(parsed.solvedTasks || {}) }
    };
  } catch {
    return getDefaultProgress();
  }
}

function getDefaultProgress() {
  return {
    challenges: {
      lever: [false, false, false],
      pulleys: [false, false, false],
      inclined: [false, false, false],
      threads: [false, false, false],
      beam: [false, false, false],
      ladder: [false, false, false]
    },
    solvedTasks: {
      lever: 0,
      pulleys: 0,
      inclined: 0,
      threads: 0,
      beam: 0,
      ladder: 0
    }
  };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('progresschanged', { detail: progress }));
  } catch {}
}

export function completeChallenge(topicId, challengeIdx, title = '') {
  const p = getProgress();
  if (!p.challenges[topicId]) p.challenges[topicId] = [false, false, false];
  if (!p.challenges[topicId][challengeIdx]) {
    p.challenges[topicId][challengeIdx] = true;
    saveProgress(p);
    showToast(`🏆 Испытание выполнено: ${title || 'Отличная работа!'}`);
    return true;
  }
  return false;
}

export function recordSolvedTask(topicId) {
  const p = getProgress();
  p.solvedTasks[topicId] = (p.solvedTasks[topicId] || 0) + 1;
  saveProgress(p);
  showToast('🎯 Задание ЕГЭ решено верно! (+1 к рейтингу)');
}

export function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-300 text-sm font-medium flex items-center gap-2 transform translate-y-4 opacity-0 transition-all duration-300 backdrop-blur';
  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Анимация появления
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Автоматическое исчезновение
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
