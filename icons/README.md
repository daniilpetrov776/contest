# SVG Icons для спрайтов

Поместите SVG файлы в эту папку для автоматической генерации спрайта.

## Структура

```
icons/
  ├── star.svg          → #icon-star
  ├── logo.svg          → #icon-logo
  └── common/
      └── arrow.svg     → #icon-common-arrow
```

## Использование в Handlebars

```hbs
{{sprite name="star" class="icon" width="24" height="24"}}
{{sprite name="arrow" dir="common" class="icon-arrow" width="16" height="16"}}
```

## Параметры хелпера `sprite`:

- `name` — имя файла без расширения (обязательно)
- `dir` — подпапка, если иконка в подпапке (опционально)
- `class` — CSS класс
- `width`, `height` — размеры иконки
