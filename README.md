# Stellar Burgers

Клиентское React-приложение для сборки космических бургеров. Учебный проект курса «React-разработчик», спринт 1: каталог ингредиентов, конструктор, загрузка данных из API и модальные окна.

## Стек

- React 19, TypeScript, Vite
- UI-kit [`@krgaa/react-developer-burger-ui-components`](https://react-burger-ui-components.education-services.ru/)
- Norma API: `https://new-stellarburgers.education-services.ru/api`

## Запуск

```bash
npm i
npm run dev
```

Сборка: `npm run build`. Превью продакшен-сборки: `npm run preview` (открыть путь `/react-burger-ts/`).

## Деплой

Сайт на GitHub Pages: https://kirillchistov.github.io/react-burger-ts/

```bash
npm run deploy
```

Скрипт собирает `dist` с `base: '/react-burger-ts/'`, копирует `index.html` в `404.html` для SPA-переходов и публикует ветку `gh-pages`.

## Спринт 1:
[x] Список ингредиентов с сервера, прелоадер и обработка ошибок
[x] Конструктор с демо-составом, стоимостью и кастомным скроллом
[x] Модальные окна деталей ингредиента и оформленного заказа (портал, Esc, оверлей)

## Спринт 2:

[x] Доработка интерфейса навигации по ингредиентам
[x] Перенос получения массива ингредиентов в Redux
[x] Перенос состояния модального окна выбора ингредиента в Redux
[x] Запрос на создание заказа
[x] Создание первых экшенов и редьюсеров
[x] Реализация перетаскивания ингредиентов
[x] Удаление ингредиентов из конструктора
[x] Вложенная сортировка ингредиентов в конструкторе
[x] Подсчёт количества добавленных ингредиентов
[x] Подсчёт общей стоимости заказа

## Проверки перед коммитом

При создании коммита запускаются `stylelint`, `eslint` и `prettier`. Если линтер найдёт ошибки, коммит не создастся: исправьте замечания, затем снова `git add` и коммит.

Перед коммитом:

```bash
npm run lint
```

Отдельно:

- `npm run eslint` — ESLint с автоисправлениями
- `npm run stylelint` — Stylelint с автоисправлениями
- `npm run prettier` — форматирование

Для коммита по [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) можно использовать `npm run commit`.

## Алиасы импорта

```
@          → src
@components → src/components
@pages      → src/pages
@services   → src/services
@utils      → src/utils
```
