# Карта кода

| Путь | Ответственность |
| --- | --- |
| code/frontend/index.html | Точка входа, метаданные и семантический каркас |
| code/frontend/src/app.js | Экраны, маршруты, сессии и события |
| code/frontend/src/data.js | Локальные профили, вопросы, критерии и смежные роли |
| code/frontend/src/model.js | Разбор, отчёты, покрытие, чтение/запись состояния |
| code/frontend/src/styles.css | Адаптивные стили и состояния |
| code/frontend/public/favicon.svg | Значок продукта |
| code/scripts/serve.mjs | Статическая раздача файлов, loopback, 404 |
| code/scripts/check-docs.mjs | Целостность ссылок и манифеста документации |
| code/tests/model.test.mjs | Регрессионные проверки правил |
| code/backend/README.md | Граница будущего backend |
| code/data/README.md | План корпуса |
| code/benchmark/README.md | План измерения retrieval |

Изменение вопроса или критерия требует новой DATA_VERSION, иначе сравнение результатов разных наборов будет некорректным. При появлении API app.js следует разделить на экраны и сервис сессий.

