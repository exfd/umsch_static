/**
 * Универсальный движок тренажёра «Задача ЕГЭ» и панели испытаний (v2.0)
 */

import { recordSolvedTask, completeChallenge, getProgress } from './progress.js';

export function createQuizManager(config) {
  // config: { topicId, getTargetValue, getTaskDescription, onModeChange, challenges }
  let mode = 'sandbox'; // 'sandbox' | 'quiz'
  let currentTask = null;
  let hasSolved = false;

  const modeBtnSandbox = document.getElementById('btn-mode-sandbox');
  const modeBtnQuiz = document.getElementById('btn-mode-quiz');
  const quizCard = document.getElementById('quiz-card');
  const quizPrompt = document.getElementById('quiz-prompt');
  const quizInput = document.getElementById('quiz-input');
  const quizBtnCheck = document.getElementById('btn-quiz-check');
  const quizBtnSolution = document.getElementById('btn-quiz-solution');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizSolutionText = document.getElementById('quiz-solution-text');

  function init() {
    if (modeBtnSandbox && modeBtnQuiz) {
      modeBtnSandbox.addEventListener('click', () => setMode('sandbox'));
      modeBtnQuiz.addEventListener('click', () => setMode('quiz'));
    }

    if (quizBtnCheck) {
      quizBtnCheck.addEventListener('click', checkAnswer);
    }

    if (quizBtnSolution) {
      quizBtnSolution.addEventListener('click', () => {
        if (!quizSolutionText) return;
        const isHidden = quizSolutionText.classList.contains('hidden');
        if (isHidden) {
          quizSolutionText.classList.remove('hidden');
          quizBtnSolution.textContent = 'Скрыть решение';
        } else {
          quizSolutionText.classList.add('hidden');
          quizBtnSolution.textContent = 'Показать решение';
        }
      });
    }

    renderChallenges();
  }

  function setMode(newMode) {
    mode = newMode;
    if (modeBtnSandbox && modeBtnQuiz) {
      if (mode === 'sandbox') {
        modeBtnSandbox.className = 'px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-sm transition';
        modeBtnQuiz.className = 'px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        if (quizCard) quizCard.classList.add('hidden');
      } else {
        modeBtnQuiz.className = 'px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-sm transition';
        modeBtnSandbox.className = 'px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        if (quizCard) quizCard.classList.remove('hidden');
        generateTask();
      }
    }
    if (config.onModeChange) {
      config.onModeChange(mode);
    }
  }

  function generateTask() {
    hasSolved = false;
    currentTask = config.generateTask ? config.generateTask() : null;
    if (!currentTask) return;

    if (quizPrompt) quizPrompt.innerHTML = currentTask.prompt;
    if (quizInput) {
      quizInput.value = '';
      quizInput.disabled = false;
      quizInput.focus();
    }
    if (quizFeedback) {
      quizFeedback.innerHTML = '';
      quizFeedback.className = 'mt-2 text-xs font-semibold';
    }
    if (quizSolutionText) {
      quizSolutionText.innerHTML = currentTask.solution || '';
      quizSolutionText.classList.add('hidden');
    }
    if (quizBtnSolution) quizBtnSolution.textContent = 'Показать решение';

    if (config.onTaskReady) {
      config.onTaskReady(currentTask);
    }
  }

  function checkAnswer() {
    if (!currentTask || hasSolved) return;
    const userVal = parseFloat(quizInput.value.replace(',', '.'));
    if (isNaN(userVal)) {
      quizFeedback.innerHTML = '<span class="text-amber-600 dark:text-amber-400">⚠️ Пожалуйста, введите числовое значение ответа</span>';
      return;
    }

    const trueVal = currentTask.answer;
    const tolerance = currentTask.tolerance !== undefined ? currentTask.tolerance : 0.15;

    if (Math.abs(userVal - trueVal) <= tolerance) {
      hasSolved = true;
      quizFeedback.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">✅ Верно! Ответ: ${trueVal} (ваш ответ: ${userVal}). Отличная точность!</span>`;
      recordSolvedTask(config.topicId);
      if (config.onTaskSolved) config.onTaskSolved(currentTask);
    } else {
      quizFeedback.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">❌ Неверно. Проверьте формулу и подстановку значений или воспользуйтесь подсказкой решения.</span>`;
    }
  }

  function renderChallenges() {
    const listEl = document.getElementById('challenges-list');
    if (!listEl || !config.challenges) return;

    const progress = getProgress();
    const topicProgress = progress.challenges[config.topicId] || [false, false, false];
    const completedCount = topicProgress.filter(Boolean).length;

    const counterEl = document.getElementById('challenges-counter');
    if (counterEl) counterEl.textContent = `${completedCount}/3`;

    listEl.innerHTML = config.challenges.map((ch, idx) => {
      const isDone = topicProgress[idx];
      return `
        <div class="flex items-center justify-between p-2.5 rounded-lg border ${
          isDone
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        } text-xs">
          <div class="flex items-center gap-2">
            <span>${isDone ? '✅' : '⚪'}</span>
            <span class="${isDone ? 'line-through opacity-85' : 'font-medium'}">${ch.title}</span>
          </div>
          <span class="text-[10px] font-mono opacity-70">${ch.hint || ''}</span>
        </div>
      `;
    }).join('');
  }

  function checkChallenges(state, computed) {
    if (!config.challenges) return;
    config.challenges.forEach((ch, idx) => {
      if (ch.isCompleted && ch.isCompleted(state, computed)) {
        if (completeChallenge(config.topicId, idx, ch.title)) {
          renderChallenges();
        }
      }
    });
  }

  return {
    init,
    getMode: () => mode,
    setMode,
    isQuiz: () => mode === 'quiz',
    getCurrentTask: () => currentTask,
    checkChallenges,
    renderChallenges
  };
}
