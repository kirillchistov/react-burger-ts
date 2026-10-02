# Обзор проекта

Stellar Burgers — клиентское React-приложение для сборки бургера и оформления заказа.
Учебный проект курса «Middle Front-end + React-разработчик».
Реализованы спринты 1–3. Собирается как Vite SPA.

> Схема: [`project-overview.svg`](./project-overview.svg)

Брифы заданий: [спринт 1](./checklist-1.md), [спринт 2](./sprint2.md), [спринт 3](./sprint3.md). Чек-листы: [2](./checklist-2.md), [3](./checklist-3.md). Архитектура: [`project-architecture.md`](./project-architecture.md).

## Что делает приложение

- Загружает ингредиенты из Norma API (`GET /ingredients`).
- Показывает каталог с вкладками «Булки / Соусы / Начинки» и подсветкой ближайшего заголовка при скролле.
- Позволяет собрать бургер drag-and-drop: булка заменяется, начинки добавляются, сортируются и удаляются.
- Считает стоимость и счётчики на карточках мемоизированными селекторами.
- Оформляет заказ (`POST /orders` с `authorization`) только у авторизованного пользователя и показывает номер в модалке.
- После закрытия попапа с номером очищает конструктор.
- Маршрутизирует экраны через `BrowserRouter`: главная, ингредиент, auth-формы, профиль, заглушки ленты и 404.
- Хранит JWT в `localStorage`, обновляет access-токен через `fetchWithRefresh`.

Пока не сделано: живая лента заказов, история заказов пользователя, WebSocket, SSR.

## Верхнеуровневая структура

```text
.
├── docs/                     # Задания, чек-листы, обзор и схемы
├── public/                   # Статические файлы Vite
├── src/
│   ├── components/           # UI: шапка, конструктор, модалки, ProtectedRoute
│   ├── pages/                # Страницы маршрутов
│   ├── services/             # Redux: store, слайсы, thunks, хуки
│   └── utils/                # API, auth storage, константы, типы, DnD
├── index.html                # HTML-оболочка, узел #modals
├── vite.config.ts            # Vite, алиасы, Vitest, base для GH Pages
└── package.json              # Скрипты и зависимости
```

## Поток запуска

```mermaid
flowchart TD
  Browser[Браузер] --> Html[index.html]
  Html --> Bootstrap[src/main.tsx]
  Bootstrap --> Providers[Redux Provider + BrowserRouter]
  Providers --> App[src/components/app/app.tsx]
  App --> Fetch[fetchIngredients]
  App --> GetUser[getUser]
  App --> Header[AppHeader NavLink]
  App --> Routes[Routes]
  Routes --> Home["/ Home + DndProvider"]
  Routes --> Pages[остальные страницы]
```

## Основные пользовательские потоки

### Конструктор бургера

```mermaid
flowchart LR
  Card[Карточка ингредиента] --> Drag[useDrag]
  Drag --> Drop[Drop в конструктор]
  Drop --> Add[addIngredient]
  Add --> CtorSlice[burgerConstructor slice]
  CtorSlice --> UI[UI конструктора]
  UI --> Submit[Оформить заказ]
  Submit --> Auth{user?}
  Auth -- нет --> Login["/login"]
  Auth -- да --> OrderApi["POST /orders"]
  OrderApi --> Modal[Модалка с номером]
  Modal --> Close[Закрытие попапа]
  Close --> Clear[clearConstructor]
```

### Ингредиент и модалки

```mermaid
flowchart TD
  ClickCard[Клик по карточке] --> Path["/ingredients/:id + background"]
  Path --> IngredientModal[Modal + IngredientDetails поверх Home]
  Direct[Прямой заход / refresh] --> IngredientPage[IngredientPage]

  OrderBtn[Оформить заказ] --> Create[createOrder thunk]
  Create --> OrderModal[Modal: прелоадер / ошибка / OrderDetails]
  OrderModal --> CloseOrder[clearOrder + clearConstructor при успехе]
```

### Auth и профиль

```mermaid
flowchart TD
  Guest[Гость на /profile] --> Login["/login + from"]
  LoginForm[login / register] --> Tokens[localStorage]
  Tokens --> Back[Navigate на from или /]
  Forgot[forgot-password] --> Flag[флаг в localStorage]
  Flag --> Reset["/reset-password"]
  Profile[профиль] --> Save[PATCH /auth/user]
  Profile --> Logout[POST /auth/logout]
  Logout --> LoginAgain["/login"]
```

## Источники данных

| Источник | Для чего используется | Основные файлы |
| --- | --- | --- |
| REST API | Ингредиенты, заказ, register/login/logout/token/user, сброс пароля | `src/utils/burger-api.ts`, `src/utils/constants.ts` |
| localStorage | `accessToken`, `refreshToken`, флаг reset-password | `src/utils/auth.ts` |
| Redux store | Auth, ингредиенты, конструктор, текущий ингредиент, заказ | `src/services/store.ts`, слайсы в `src/services/*` |
| React Router | Экраны, модальный фон ингредиента, protected routes | `src/main.tsx`, `src/components/app/app.tsx` |
| React DnD | Перетаскивание в конструктор и сортировка начинок | `src/utils/dnd.ts`, `src/pages/home/home.tsx` |

## Важные замечания по текущей реализации

- CSR SPA. `BrowserRouter` + `basename` из `BASE_URL` (на GH Pages это `/react-burger-ts`).
- Заказ только с авторизацией. Тело: `[bunId, ...fillingIds, bunId]`.
- `fetchWithRefresh`: при `jwt expired` — `POST /auth/token`, повтор исходного запроса.
- Redux DevTools включены только в `import.meta.env.DEV`.
- `/feed` и `/profile/orders` — заглушки до спринта с WebSocket.
- Деплой на GitHub Pages: https://kirillchistov.github.io/react-burger-ts/

## Спринты

### Спринт 1

- [x] Список ингредиентов с сервера, прелоадер и обработка ошибок
- [x] Конструктор, стоимость, кастомный скролл
- [x] Модалки ингредиента и заказа (портал, Esc, оверлей)

### Спринт 2

- [x] Табы ингредиентов, Redux, заказ, DnD, счётчики и цена

### Спринт 3

- [x] Роутинг, страница и модалка ингредиента
- [x] Вёрстка login/register/forgot/reset/profile/feed/404
- [x] Auth API, `ProtectedRoute`, профиль save/cancel, заказ только с токеном
