/**
 * Модуль переключения темы (Dark Mode «Инженерный чертёж»)
 * Поддерживает класс `dark` на <html> и синхронизацию в localStorage.
 */

export function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Обновляем кнопку переключения, если она есть на странице
  updateThemeButton();
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeButton();
  // Вызываем кастомное событие для SVG-сцен
  window.dispatchEvent(new CustomEvent('themechanged', { detail: { isDark } }));
}

export function updateThemeButton() {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  btn.innerHTML = isDark ? '☀️' : '🌙';
  btn.setAttribute('title', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему («Инженерный чертёж»)');
  btn.setAttribute('aria-label', btn.getAttribute('title'));
}

// Автоматическая инициализация при загрузке скрипта
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}
