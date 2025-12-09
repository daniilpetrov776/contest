# Отчет о проверке проекта на соответствие критериям CTS

**Дата проверки:** 2024  
**Проект:** only-contest  
**Проверяемые критерии:** CTS-Д11, CTS-Д12, CTS-Д24, CTS-Д27, DRY

---

## Содержание

1. [CTS-Д11: Использование родительского селектора &](#cts-д11)
2. [CTS-Д12: Использование @extend](#cts-д12)
3. [CTS-Д24: Отдельные обработчики событий](#cts-д24)
4. [CTS-Д27: Оператор присваивания в выражениях](#cts-д27)
5. [DRY: Принцип Don't Repeat Yourself](#dry)
6. [Итоговая сводка](#итоговая-сводка)

---

## CTS-Д11: Использование родительского селектора &

### Статус: ✅ **СООТВЕТСТВУЕТ**

### Описание критерия

Родительский селектор `&` должен использоваться только для:
- Псевдоэлементов (`&::before`, `&::after`)
- Псевдоклассов (`&:hover`, `&:focus`)
- Модификаторов блоков и элементов (`&--mod`, `&_mod_value`)

**Запрещено:** использование `&` для комбинации селекторов в именах блоков и элементов (`&__element`).

### Найденные нарушения

#### 1. Использование `&__element` для создания элементов BEM

**Количество нарушений:** 256+

**Примеры:**

```scss
// ❌ Неправильно (banner.scss:20)
.banner {
  &__slide {
    background-color: $white;
  }
}

// ✅ Правильно должно быть:
.banner__slide {
  background-color: $white;
}
```

**Файлы с нарушениями:**

| Файл | Количество нарушений | Статус |
|------|---------------------|--------|
| `scss/banner.scss` | ~20 | ✅ **ИСПРАВЛЕНО** |
| `scss/footer.scss` | ~25 | ✅ **ИСПРАВЛЕНО** |
| `scss/hero.scss` | ~30 | ✅ **ИСПРАВЛЕНО** |
| `scss/portfolio.scss` | ~20 | ✅ **ИСПРАВЛЕНО** |
| `scss/header.scss` | ~15 | ✅ **ИСПРАВЛЕНО** |
| `scss/clients.scss` | ~30 | ✅ **ИСПРАВЛЕНО** |
| `scss/about-links.scss` | 3 | ✅ **ИСПРАВЛЕНО** |
| `scss/socials.scss` | 2 | ✅ **ИСПРАВЛЕНО** |
| `scss/header-menu.scss` | 2 | ✅ **ИСПРАВЛЕНО** |

#### 2. Использование `&.class` для комбинации с другими классами

**Количество нарушений:** 33+

**Примеры:**

```scss
// ❌ Неправильно (about-links.scss:40)
&__link {
  &.secondary-button {
    padding: calc(16px / 16px * 1rem) calc(15px / 16px * 1rem);
  }
}

// ❌ Неправильно (portfolio.scss:279)
&__category {
  &.swiper {
    overflow: hidden;
  }
}

// ❌ Неправильно (header-menu.scss:21)
&.is-open {
  height: 100vh;
}
```

**Файлы с нарушениями:**

- `scss/about-links.scss` — `&.secondary-button` (4 случая) ✅ **ИСПРАВЛЕНО**
- `scss/portfolio.scss` — `&.swiper`, `&.swiper-wrapper`, `&.swiper-slide` ✅ **ИСПРАВЛЕНО**
- `scss/header-menu.scss` — `&.is-open`, `&.is-scrollable` ✅ **ИСПРАВЛЕНО**
- `scss/banner.scss` — `&.swiper-horizontal`, `&.swiper-pagination-bullet` ✅ **ИСПРАВЛЕНО**

### Рекомендации по исправлению

1. **Заменить вложенные элементы на плоскую структуру:**

```scss
// Было:
.banner {
  &__slide {
    background-color: $white;
  }
  &__content {
    display: grid;
  }
}

// Должно быть:
.banner__slide {
  background-color: $white;
}

.banner__content {
  display: grid;
}
```

2. **Для комбинации классов использовать отдельные селекторы:**

```scss
// Было:
&__link {
  &.secondary-button {
    padding: calc(16px / 16px * 1rem);
  }
}

// Должно быть:
.about-links__link.secondary-button {
  padding: calc(16px / 16px * 1rem);
}
```

3. **Для состояний использовать отдельные классы:**

```scss
// Было:
&.is-open {
  height: 100vh;
}

// Должно быть:
.header-menu.is-open {
  height: 100vh;
}
```

---

## CTS-Д12: Использование @extend

### Статус: ✅ **СООТВЕТСТВУЕТ**

### Описание критерия

При использовании препроцессоров запрещено использование расширений:
- `@extend` в Sass/SCSS
- `&:extend` в Less

Использование расширений приводит к неочевидной трансформации кода и может привести к генерации неоптимальных групп селекторов.

### Результаты проверки

- ✅ Поиск `@extend` — **не найдено**
- ✅ Поиск `extend` (без учета регистра) — **не найдено**
- ✅ Поиск плейсхолдеров (`%`) — найдены только проценты в CSS значениях
- ✅ Файлы других препроцессоров (`.sass`, `.less`) — **не найдено**

### Используемые подходы

Вместо `@extend` используются:
- ✅ Миксины (`@mixin` и `@include`) — для переиспользования кода
- ✅ Обычные классы и селекторы — для стилизации элементов
- ✅ CSS переменные (`--variable`) — для динамических значений

**Вывод:** Проект полностью соответствует критерию CTS-Д12.

---

## CTS-Д24: Отдельные обработчики событий

### Статус: ✅ **СООТВЕТСТВУЕТ** (после исправления)

### Описание критерия

Для каждого события должен использоваться отдельный обработчик. Одна функция не должна быть обработчиком нескольких разных событий.

### Найденное нарушение

**Файл:** `js/libs/hero-video/index.js` (строки 66-67)

**Проблема:**

```javascript
// ❌ Неправильно
const handleClick = (e) => {
  handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
  updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
};

heroVideo.addEventListener('click', handleClick);
heroVideo.addEventListener('keydown', handleClick); // Нарушение!
```

**Исправление:**

```javascript
// ✅ Правильно
const handleClick = (e) => {
  handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
  updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
};

const handleKeydown = (e) => {
  handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
  updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
};

heroVideo.addEventListener('click', handleClick);
heroVideo.addEventListener('keydown', handleKeydown);
```

### Другие файлы

Проверены следующие файлы — **нарушений не найдено:**

- ✅ `js/libs/banner-slider/pagination.js` — используются разные обработчики
- ✅ `js/libs/burger.js` — используются разные обработчики

**Вывод:** После исправления проект соответствует критерию CTS-Д24.

---

## CTS-Д27: Оператор присваивания в выражениях

### Статус: ✅ **СООТВЕТСТВУЕТ**

### Описание критерия

Оператор присваивания не должен использоваться как часть выражения.

**Неправильно:**
```javascript
imgGenerate(picArray = JSON.parse(data));
```

**Правильно:**
```javascript
picArray = JSON.parse(data);
imgGenerate(picArray);
```

### Результаты проверки

Проверены все JavaScript файлы проекта:

- ✅ Условия `if` и `while` — присваивания внутри условий **не найдены**
- ✅ Вызовы функций — присваивания в аргументах **не найдены**
- ✅ Тернарные операторы — присваивания используются для сохранения результата, не внутри выражений
- ✅ Логические выражения — присваивания внутри логических операторов **не найдены**

### Примеры корректного использования

```javascript
// ✅ Правильно: присваивание отдельно
const delay = index > 0 
  ? (order - sortedOrders[index - 1]) * GROUP_DELAY_MULTIPLIER 
  : INITIAL_POSITION;

// ✅ Правильно: присваивание отдельно
let targetWidth = currentMinSizes.width + widthRange * stepPercent;
targetWidth = Math.max(targetWidth, currentMinSizes.width);

// ✅ Правильно: значения по умолчанию в параметрах (не нарушение)
export function animateScale(element, direction, offset, duration, shiftLine = false)
```

**Вывод:** Проект полностью соответствует критерию CTS-Д27.

---

## DRY: Принцип Don't Repeat Yourself

### Статус: ⚠️ **ЧАСТИЧНОЕ СООТВЕТСТВИЕ**

### Найденные проблемы

#### 1. ✅ ИСПРАВЛЕНО: Дублирование констант

**Проблема:** Константы дублировались между `animation-constants.js` и `banner-animation/constants.js`.

**Исправление:**
- ✅ Удален файл `banner-animation/constants.js`
- ✅ Все импорты обновлены на использование `animation-constants.js`
- ✅ Добавлена константа `EASING_SCALE` в общие константы

#### 2. ⚠️ Повторяющаяся логика обработки скролла

**Проблема:** Одинаковая логика отслеживания скролла в 5 файлах:
- `hero-header-animation.js`
- `header-animation.js`
- `hero-after-animation.js`
- `footer-title-animation/scroll-animation.js`
- `hero-video/scroll-handler.js`

**Повторяющийся код:**
```javascript
let lastScrollY = window.scrollY;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY === lastScrollY) {
    return;
  }
  
  // ... специфичная логика ...
  
  lastScrollY = currentScrollY;
};
```

**Рекомендация:** Создать утилиту `createScrollTracker()` в `animation-utils.js`.

#### 3. ⚠️ Повторяющаяся логика вычисления scrollProgress

**Проблема:** Похожая логика в нескольких файлах:

```javascript
const viewportHeight = window.innerHeight;
const scrollProgress = Math.min(currentScrollY / viewportHeight, SCROLL_PROGRESS_MAX);
const newStep = Math.floor(scrollProgress * maxStep);
const clampedStep = Math.min(newStep, maxStep);
```

**Рекомендация:** Создать утилиту `calculateScrollProgress()`.

#### 4. ⚠️ Дублирование RESIZE_DEBOUNCE_DELAY

**Проблема:** Константа определена в двух местах с разными значениями:
- `animation-constants.js`: `RESIZE_DEBOUNCE_DELAY = 250`
- `hero-video/constants.js`: `RESIZE_DEBOUNCE_DELAY = 100`

**Рекомендация:** Удалить из `hero-video/constants.js` и использовать значение из `animation-constants.js`, либо вынести разные значения как именованные константы.

---

## Итоговая сводка

| Критерий | Статус | Количество нарушений | Приоритет исправления |
|----------|--------|---------------------|----------------------|
| **CTS-Д11** | ✅ **СООТВЕТСТВУЕТ** | 0 (9 файлов исправлено) | - |
| **CTS-Д12** | ✅ Соответствует | 0 | - |
| **CTS-Д24** | ✅ Соответствует | 0 (исправлено) | - |
| **CTS-Д27** | ✅ Соответствует | 0 | - |
| **DRY** | ⚠️ Частично | 3 проблемы | 🟡 Средний |

### Приоритеты исправлений

#### ✅ Завершено

1. **CTS-Д11** — Рефакторинг SCSS файлов для устранения использования `&__element` и `&.class`
   - Затронуто: 9 файлов
   - ✅ **Исправлено:** `socials.scss`, `about-links.scss`, `header-menu.scss`, `header.scss`, `banner.scss`, `footer.scss`, `clients.scss`, `portfolio.scss`, `hero.scss` (9 файлов)
   - ✅ **Завершено:** Все файлы исправлены, проект полностью соответствует критерию CTS-Д11

#### 🟡 Средний приоритет

2. **DRY** — Вынос повторяющейся логики в утилиты
   - Создание `createScrollTracker()` для обработки скролла
   - Создание `calculateScrollProgress()` для вычисления прогресса
   - Унификация `RESIZE_DEBOUNCE_DELAY`
   - Оценка трудозатрат: Средняя
   - Влияние: Улучшение поддерживаемости кода

### Рекомендации

1. ✅ **Завершено:** Рефакторинг SCSS файлов для соответствия CTS-Д11 — все файлы исправлены
2. **В ближайшее время:** Вынести повторяющуюся логику в утилиты для улучшения DRY
3. **Постоянно:** Проводить регулярные проверки на соответствие критериям CTS при добавлении нового кода

---

**Отчет составлен:** 2024  
**Проверено файлов:** JavaScript — 20+, SCSS — 18  
**Последнее обновление:** Рефакторинг всех SCSS файлов (`socials.scss`, `about-links.scss`, `header-menu.scss`, `header.scss`, `banner.scss`, `footer.scss`, `clients.scss`, `portfolio.scss`, `hero.scss`) — завершен ✅. Проект полностью соответствует критерию CTS-Д11.
