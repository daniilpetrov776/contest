# Работа с изображениями в Handlebars

В проекте доступны хелперы для упрощения работы с изображениями в Handlebars шаблонах.

## Хелпер `picture`

Используется для создания адаптивных изображений с поддержкой WebP и разных размеров.

### Примеры использования:

```hbs
{{!-- Простое изображение с WebP --}}
{{picture
    src="/images/hero.jpg"
    webp="/images/hero.webp"
    alt="Hero image"
    class="hero-image"
    width="1920"
    height="1080"
}}

{{!-- Адаптивное изображение с srcset --}}
{{picture
    src="/images/hero.jpg"
    webp="/images/hero.webp"
    srcset="/images/hero-mobile.jpg 768w, /images/hero-desktop.jpg 1920w"
    sizes="(max-width: 768px) 100vw, 1920px"
    alt="Hero image"
    class="hero-image"
}}
```

### Параметры:

- `src` — основной путь к изображению (обязательно)
- `webp` — путь к WebP версии (опционально)
- `srcset` — srcset для адаптивных изображений (опционально)
- `sizes` — sizes для srcset (опционально)
- `alt` — альтернативный текст
- `class` — CSS класс
- `width`, `height` — размеры изображения
- `loading` — lazy/eager (по умолчанию lazy)

---

## Хелпер `svg`

Используется для подключения SVG файлов как обычных изображений (через `<img>`).

### Примеры использования:

```hbs
{{!-- Простое SVG изображение --}}
{{svg
    src="/images/logo.svg"
    alt="Logo"
    class="logo"
    width="120"
    height="40"
}}
```

### Параметры:

- `src` — путь к SVG файлу (обязательно)
- `alt` — альтернативный текст
- `class` — CSS класс
- `width`, `height` — размеры изображения

---
