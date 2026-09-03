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

Сборка: `npm run build`. Превью продакшен-сборки: `npm run preview`.

## Что есть в спринте 1

- Список ингредиентов с сервера, прелоадер и обработка ошибок
- Конструктор с демо-составом, стоимостью и кастомным скроллом
- Модальные окна деталей ингредиента и оформленного заказа (портал, Esc, оверлей)

## Проверки перед коммитом

При создании коммита запускаются `stylelint`, `eslint` и `prettier`. Если линтер найдёт ошибки, коммит не создастся: исправьте замечания, затем снова `git add` и коммит.

Перед коммитом удобно прогнать:

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
@services   → src/utils
@utils      → src/utils
```
