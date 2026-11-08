/**
 * Общие утилиты для интерактивных виджетов «Статика ЕГЭ».
 * ES-модуль — подключается через <script type="module">.
 */

// =====================================================
// 1. Форматирование чисел в стиле СИ (десятичная запятая)
// =====================================================

/**
 * Форматирует число с заданным количеством знаков после запятой,
 * используя десятичную запятую (русская локаль).
 * @param {number} value — числовое значение
 * @param {string} [unit=''] — единица измерения (добавляется через пробел)
 * @param {number} [digits=1] — количество знаков после запятой
 * @returns {string}
 */
export function formatSI(value, unit = '', digits = 1) {
  const str = Number(value).toFixed(digits).replace('.', ',');
  return unit ? `${str} ${unit}` : str;
}

// =====================================================
// 2. Сериализация / десериализация состояния в URL
// =====================================================

/**
 * Кодирует объект состояния в base64url-строку, пригодную для query-параметра.
 * @param {Object} st — объект состояния
 * @returns {string}
 */
export function encodeState(st) {
  const json = JSON.stringify(st);
  return btoa(encodeURIComponent(json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Декодирует base64url-строку из query-параметра ?state= обратно в объект.
 * Возвращает null, если строки нет, парсинг невозможен или данные невалидны.
 * @param {function(Object): Object|null} validate — функция валидации для конкретного виджета.
 *   Получает распарсенный JSON, должна вернуть проверенный объект состояния или null.
 * @returns {Object|null}
 */
export function loadStateFromUrl(validate) {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('state');
  if (!raw) return null;
  try {
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const parsed = JSON.parse(decodeURIComponent(atob(base64)));
    return validate(parsed);
  } catch {
    return null;
  }
}

// =====================================================
// 3. Кнопка «Поделиться» (с кэшем кнопки до await)
// =====================================================

/**
 * Устанавливает обработчик кнопки «Поделиться»: кодирует текущее состояние,
 * копирует URL в буфер обмена и показывает обратную связь.
 *
 * **Решает баг #1**: e.currentTarget кэшируется до первого await,
 * поэтому после асинхронного clipboard.writeText кнопка гарантированно доступна.
 *
 * @param {string} btnId — id кнопки (например, 'btn-share')
 * @param {function(): Object} getState — функция, возвращающая текущее состояние виджета
 */
export function initShareButton(btnId, getState) {
  document.getElementById(btnId).addEventListener('click', async (e) => {
    const btn = e.currentTarget;       // кэшируем ДО await
    const prev = btn.textContent;
    const encoded = encodeState(getState());
    const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
    window.history.replaceState({}, '', `?state=${encoded}`);
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Ссылка скопирована!';
      setTimeout(() => (btn.textContent = prev), 2000);
    } catch {
      prompt('Скопируйте ссылку на состояние:', url);
    }
  });
}
