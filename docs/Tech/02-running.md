# Запуск

## Требования

Node.js 20+ и npm, современный браузер. Никаких API-ключей, Docker, базы данных и Python для КТ1 не нужно. Проверенная среда: Node.js 24.15.0 / npm 11.12.1.

## PowerShell / терминал

```powershell
git clone https://github.com/greg-goozmer/helper_for_job.git
cd helper_for_job/code/frontend
npm ci
npm run dev
```

Открыть http://localhost:5173. `npm ci` воспроизводит lock-файл; внешних зависимостей нет. Можно сразу выполнить `npm run dev`. Ctrl+C останавливает сервер.

Если PowerShell блокирует npm.ps1, используйте `npm.cmd ci` и `npm.cmd run dev`.

## Другой порт

PowerShell:

```powershell
$env:PORT = 5174
npm.cmd run dev
```

bash:

```bash
PORT=5174 npm run dev
```

Сервер слушает только 127.0.0.1. Если порт занят, остановите свою предыдущую копию или выберите другой порт.

## Проверки

Из code/frontend:

```bash
npm run check
npm test
```

Скрипт check проверяет синтаксис, не является сборкой или линтером. Сборка не требуется: браузер получает исходные HTML/CSS/JS. Открывать index.html через file:// не рекомендуется — ES-модули следует обслуживать через HTTP.

## Сброс

«Мой прогресс» → «Очистить историю» → подтверждение удаляет результаты и оставляет профиль. Для полного сброса удалите ключ interview-assistant:v1 в данных сайта браузера.

Если localStorage запрещён, сценарий работает в памяти с предупреждением о невозможности записи.

