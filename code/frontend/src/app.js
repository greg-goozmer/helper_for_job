import { profiles, grades, careers } from './data.js';
import { loadState, saveState, defaultState, evaluateAnswer, makeReport, addReport, careerMatch } from './model.js';

const app = document.querySelector('#app');
const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
let state = loadState(storage);
let session = null;
let selectedReportId = null;
let selectedCareer = null;
let storageWarning = false;
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icons = { grid: '▦', skills: '◇', test: '▤', related: '⌘', plan: '☷', progress: '↗' };
const nav = [['competencies', 'Компетенции', 'skills'], ['modes', 'Тестирование', 'test'], ['related', 'Смежные профессии', 'related'], ['plan', 'План развития', 'plan'], ['progress', 'Мой прогресс', 'progress']];
const currentProfile = () => profiles[state.profile.profession];
const latestReport = () => state.history.find(report => report.profile.profession === state.profile.profession && report.profile.grade === state.profile.grade);
const currentRoute = () => location.hash.slice(1) || 'home';
const time = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const date = value => new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function persist() { storageWarning = !saveState(storage, state); }
function go(route) {
  if (currentRoute() === route) render(true); else location.hash = route;
}
function button(label, action, extra = '', secondary = false) {
  return `<button type="button" class="button ${secondary ? 'secondary' : ''}" data-action="${action}" ${extra}>${label}</button>`;
}
function heading(kicker, title, description, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="muted">${description}</p></div>${action}</div>`;
}
function demoNotice(text = 'Это учебный прототип. Вопросы и разбор подготовлены заранее; AI и RAG пока не подключены.') {
  return `<div class="notice"><span aria-hidden="true">ⓘ</span><p>${text}</p></div>`;
}
function ring(value, caption = 'демо-результат') {
  return `<div class="ring" style="--value:${value}" role="img" aria-label="${value}% — ${caption}"><div><strong>${value}<small>%</small></strong><span>${caption}</span></div></div>`;
}
function bar(score) { return `<div class="bar" aria-hidden="true"><span style="width:${score}%"></span></div><strong class="percent">${score}%</strong>`; }
function shell(content, route) {
  const home = route === 'home';
  const active = route === 'training' || route === 'assessment' ? 'modes' : route;
  app.innerHTML = `<header class="topbar"><a class="brand" href="#home"><img src="./public/favicon.svg" alt="" width="34" height="34"/><span>Interview<span class="brand-light"> Assistant</span></span></a><nav class="topnav" aria-label="Основная навигация"><a href="#home" ${home ? 'aria-current="page"' : ''}>Главная</a><a href="#profile" ${route === 'profile' ? 'aria-current="page"' : ''}>Подготовка</a><a href="#progress" ${route === 'progress' ? 'aria-current="page"' : ''}>Мой прогресс</a></nav><span class="demo-badge">Прототип · КТ1</span></header>
    <div class="workspace ${home ? 'landing' : ''}">${home ? '' : `<aside class="sidebar"><a class="profile-link" href="#profile"><span class="avatar">Я</span><span><strong>Мой профиль</strong><small>${currentProfile().short} · ${state.profile.grade}</small></span><span aria-hidden="true">↗</span></a><nav aria-label="Разделы подготовки">${nav.map(([id, label, icon]) => `<a href="#${id}" ${active === id ? 'aria-current="page"' : ''}><span aria-hidden="true">${icons[icon]}</span>${label}</a>`).join('')}</nav><div class="sidebar-note"><span class="status-dot"></span>Маленькие шаги.<br/>Понятный прогресс.</div></aside>`}<main id="main" tabindex="-1">${storageWarning ? '<div class="notice warning">Браузер не разрешил сохранить данные. Сценарий работает до закрытия страницы.</div>' : ''}${content}</main></div><footer>Interview Assistant <span>Учебный проект · 2026</span></footer>`;
}
function homePage() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>Твой следующий карьерный шаг</p><h1>Готовься<br/>к собеседованиям<br/><em>уверенно.</em></h1><p class="hero-description">Определи цель, найди пробелы в навыках и практикуйся с понятным планом. Всё для подготовки — в одном месте.</p><div class="hero-actions">${button('Начать подготовку <span aria-hidden="true">↗</span>', 'go-profile')}<a class="text-link" href="#modes">Попробовать демо →</a></div><p class="micro">Без регистрации · Три направления · В своём темпе</p></div><div class="hero-art" aria-label="Пример плана подготовки"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="floating-tag tag-top">✦ &nbsp; От цели — к практике</div><div class="preview-card"><div class="preview-top"><span class="icon-box">↗</span><span class="pill">Твой маршрут</span></div><p class="muted">Цель на ближайшее время</p><h2>Backend разработчик</h2><span class="grade-tag">Middle</span><div class="preview-divider"></div><div class="preview-task"><span class="task-number">01</span><div><strong>Проверь свои навыки</strong><small>3 вопроса · демонстрационная оценка</small></div><span>→</span></div><div class="preview-task"><span class="task-number mint">02</span><div><strong>Потренируй слабые места</strong><small>Разбор по критериям ответа</small></div><span>→</span></div><div class="preview-task"><span class="task-number peach">03</span><div><strong>Подтверди прогресс</strong><small>Пройди оценку ещё раз</small></div><span>→</span></div></div><div class="floating-tag tag-bottom"><span class="status-dot"></span>Следующий шаг всегда понятен</div></div></section><section class="benefits" aria-label="Возможности"><article><span class="icon-box">◇</span><h3>Понятная цель</h3><p>Профессия, грейд и карта нужных компетенций.</p></article><article><span class="icon-box mint">▤</span><h3>Практика с разбором</h3><p>Тренировочные вопросы и критерии хорошего ответа.</p></article><article><span class="icon-box peach">↗</span><h3>Личный план</h3><p>Слабые места, приоритеты и повторная оценка.</p></article><article><span class="icon-box blue">⌘</span><h3>Смежные профессии</h3><p>Посмотри, какие навыки пригодятся для перехода.</p></article></section>${demoNotice()}`;
}
function profilePage() {
  return `${heading('01 / Карьерная цель', 'С чего начнём?', 'Выбери целевую профессию и уровень, к которому готовишься.')}<form id="profile-form" class="panel profile-form"><fieldset><legend>Твоя целевая профессия</legend><div class="profession-grid">${Object.entries(profiles).map(([key, profile]) => `<label class="profession-option"><input type="radio" name="profession" value="${key}" ${state.profile.profession === key ? 'checked' : ''}/><span class="profession-inner"><span class="icon-box">${escape(profile.symbol)}</span><strong>${profile.name}</strong><small>${profile.description}</small><span class="selection-mark" aria-hidden="true">✓</span></span></label>`).join('')}</div></fieldset><fieldset><legend>Целевой грейд</legend><div class="grade-options">${grades.map(grade => `<label><input type="radio" name="grade" value="${grade}" ${state.profile.grade === grade ? 'checked' : ''}/><span>${grade}</span></label>`).join('')}</div></fieldset><fieldset id="skills-field"><legend>Какие навыки уже знакомы? <span class="optional">можно пропустить</span></legend><p class="muted small">Самооценка нужна для сравнения направлений. Она не влияет на результат теста.</p><div class="skill-options">${skillOptions(state.profile.profession)}</div></fieldset>${demoNotice('В демо доступны три профессии. Грейд сохраняется как цель; вопросы пока общие для всех уровней и не калиброваны под грейд.')}<div class="form-footer"><span class="muted small">Цель можно изменить в любой момент</span><button class="button" type="submit">Показать компетенции →</button></div></form>`;
}
function skillOptions(profession) {
  return profiles[profession].skills.map(skill => `<label class="skill-checkbox"><input type="checkbox" name="skills" value="${escape(skill)}" ${state.profile.skills.includes(skill) ? 'checked' : ''}/><span>${skill}</span></label>`).join('');
}
function competenciesPage() {
  const report = latestReport();
  return `${heading('02 / Карта навыков', 'Ключевые компетенции', `${currentProfile().name} · ${state.profile.grade}`, '<a class="button secondary" href="#profile">Изменить цель</a>')}<div class="summary-strip"><div><strong>${currentProfile().skills.length}</strong><span>компетенций в профиле</span></div><div><strong>${state.profile.skills.length}</strong><span>знакомы по самооценке</span></div><div><strong>3</strong><span>вопроса в демо</span></div></div><section class="panel"><div class="section-heading"><h2>На чём сфокусироваться</h2><span class="muted small">Приоритеты — пример для прототипа</span></div><div class="competency-list">${currentProfile().skills.map((skill, index) => { const score = report?.scores.find(row => row.skill === skill); return `<article class="competency"><span class="icon-box ${index % 2 ? 'blue' : ''}">${index + 1}</span><div class="competency-name"><h3>${skill}</h3><p>${state.profile.skills.includes(skill) ? 'Знакомый навык · самооценка' : 'Добавь в свой план подготовки'}</p></div><span class="priority ${index < 3 ? 'high' : ''}">${index < 3 ? 'Высокий' : 'Средний'}</span><div class="competency-score">${score ? bar(score.score) : '<span class="muted small">Нет оценки</span>'}</div></article>`; }).join('')}</div></section><div class="bottom-actions"><p class="muted small">Тренировка помогает учиться. Оценка фиксирует результат.</p><a class="button" href="#modes">Выбрать формат →</a></div>`;
}
function modesPage() {
  return `${heading('03 / Практика', 'Как будем готовиться?', `${currentProfile().name} · ${state.profile.grade}. Два формата для разных задач.`)}<div class="mode-grid"><article class="panel mode-card featured"><span class="icon-box big">◇</span><p class="eyebrow">Учиться и разбирать</p><h2>Тренировка</h2><p class="muted">Спокойно разбери вопрос и попробуй улучшить свой ответ.</p><ul class="check-list"><li>Критерии доступны сразу</li><li>Разбор после каждого ответа</li><li>Повторная попытка без ограничений</li><li>Не меняет историю оценок</li></ul>${button('Начать тренировку →', 'start-training')}</article><article class="panel mode-card"><span class="icon-box big mint">▥</span><p class="eyebrow">Проверить себя</p><h2>Оценка</h2><p class="muted">Пройди три вопроса без подсказок и получи итоговый разбор.</p><ul class="check-list"><li>3 вопроса по выбранной профессии</li><li>Без подсказок во время ответа</li><li>Разбор критериев после завершения</li><li>Результат в локальной истории</li></ul>${button('Начать оценку →', 'start-assessment', '', true)}</article></div>${demoNotice('Демонстрационный разбор ищет ключевые слова по фиксированным правилам. Он не понимает смысл ответа и не подтверждает готовность к реальному собеседованию.')}`;
}
function startSession(mode) {
  session = { mode, profile: structuredClone(state.profile), index: 0, answers: {}, feedback: null, started: Date.now() };
  go(mode);
}
function sessionPage(mode) {
  if (!session || session.mode !== mode) return `${heading('Практика', 'Начни новую сессию', 'Выбери формат подготовки. Ответы незавершённой сессии не сохраняются после обновления страницы.')}<a class="button" href="#modes">Выбрать формат →</a>`;
  const profile = profiles[session.profile.profession];
  const questions = profile.questions;
  const question = questions[session.index];
  const training = mode === 'training';
  return `${heading(training ? 'Тренировка / С разбором' : 'Оценка / Без подсказок', training ? `Практика: ${question.skill}` : 'Проверь свои знания', `${profile.name} · ${session.profile.grade}`, `<span class="timer">◷ <span data-timer>${time((Date.now() - session.started) / 1000)}</span></span>`)}<div class="session-layout"><aside class="panel question-nav"><p class="eyebrow">Твой маршрут</p><ol>${questions.map((q, i) => `<li class="${i === session.index ? 'active' : ''}"><span>${session.answers[q.id] ? '✓' : i + 1}</span>${escape(training ? q.title : `Вопрос ${i + 1}`)}</li>`).join('')}</ol><p class="muted small">${training ? 'Можно возвращаться и улучшать ответы.' : 'Критерии и разбор появятся в конце.'}</p></aside><section class="panel question-card"><div class="question-meta"><span class="pill">Вопрос ${session.index + 1} из ${questions.length}</span><span class="muted small">${escape(question.skill)}</span></div><div class="question-progress" aria-label="Вопрос ${session.index + 1} из ${questions.length}"><span style="width:${(session.index + 1) / questions.length * 100}%"></span></div><h2>${escape(question.prompt)}</h2>${training ? `<details class="rubric"><summary>На что обратить внимание</summary><ul>${question.rubric.map(item => `<li>${item.label}</li>`).join('')}</ul></details>` : ''}<form id="answer-form" novalidate><label for="answer">Твой ответ</label><textarea id="answer" name="answer" rows="7" maxlength="5000" aria-describedby="answer-help answer-error" placeholder="Объясни ход мысли, приведи пример или напиши код…">${escape(session.answers[question.id] || '')}</textarea><div class="answer-help"><span id="answer-help">От 10 до 5 000 символов</span><span data-count>${(session.answers[question.id] || '').length} / 5 000</span></div><p id="answer-error" class="field-error" role="alert"></p><div class="answer-actions">${session.index > 0 ? button('← Назад', 'previous', '', true) : '<span></span>'}<button class="button" type="submit">${training ? 'Разобрать ответ' : session.index === questions.length - 1 ? 'Завершить оценку' : 'Следующий вопрос →'}</button></div></form>${training && session.feedback ? `<section class="feedback" aria-live="polite"><div class="section-heading"><h3>Разбор по ключевым словам</h3><span class="pill">${session.feedback.score}% критериев</span></div><ul>${session.feedback.checks.map(check => `<li class="${check.met ? 'met' : ''}"><span>${check.met ? '✓' : '○'}</span>${check.label}</li>`).join('')}</ul><p class="small muted">Это проверка упоминаний, а не оценка смысла. Сопоставь свой ответ с критериями и попробуй дополнить его.</p>${session.index < questions.length - 1 ? button('К следующему вопросу →', 'next-training') : '<a class="button" href="#modes">Тренировка пройдена →</a>'}</section>` : ''}</section></div>`;
}
function resultsPage() {
  const report = state.history.find(item => item.id === selectedReportId) || state.history[0];
  if (!report) return emptyPage('Пока нет результатов', 'Пройди оценку, чтобы увидеть разбор и план подготовки.', 'Начать оценку', 'start-assessment');
  const profile = profiles[report.profile.profession];
  const gaps = [...report.scores].sort((a, b) => a.score - b.score);
  return `${heading('04 / Результаты', 'Точка отсчёта есть.', `${profile.name} · ${report.profile.grade} · ${date(report.date)}`)}<section class="panel result-summary">${ring(report.total)}<div><span class="pill">Демонстрационная оценка</span><h2>${report.total >= 75 ? 'Основные критерии упомянуты' : 'Есть темы для практики'}</h2><p class="muted">${report.scores.length} вопроса · Время ${time(report.elapsedSeconds)}<br/>Процент показывает долю найденных критериев, а не готовность к трудоустройству.</p></div></section><div class="results-grid"><section class="panel"><h2>Разбор по компетенциям</h2>${report.scores.map(row => `<details class="score-detail"><summary><span>${escape(row.skill)}</span><span class="score-inline">${bar(row.score)}</span></summary><ul class="criteria-list">${row.checks.map(check => `<li><span class="${check.met ? 'check-met' : 'muted'}">${check.met ? '✓' : '○'}</span>${escape(check.label)}</li>`).join('')}</ul></details>`).join('')}</section><section class="panel next-steps"><span class="icon-box peach">↗</span><h2>Следующий шаг</h2><p class="muted">Начни с темы с наименьшим результатом:</p><h3>${escape(gaps[0].skill)}</h3><p class="muted">Разбери критерии ответа, потренируйся и пройди оценку повторно.</p><a class="button" href="#plan">Открыть план развития →</a><a class="text-link" href="#progress">Посмотреть историю</a></section></div>${demoNotice('Смысловые ошибки и простое перечисление ключевых слов могут давать одинаковый процент. Реальная оценка по рубрике с учётом грейда запланирована для следующего этапа.')}`;
}
function relatedPage() {
  return `${heading('Карьерные возможности', 'Смежные профессии', 'Посмотри, где пригодятся навыки, отмеченные в твоём профиле.')}<div class="notice"><p>Процент — покрытие небольшого списка навыков по самооценке. Это иллюстрация механики, а не прогноз успешного перехода.</p></div><div class="career-list">${careers.map((career, index) => { const match = careerMatch(state.profile.skills, career); return `<article class="panel career-card"><span class="icon-box ${index === 1 ? 'mint' : ''}">${['⌘', '⚙', '↗'][index]}</span><div class="career-copy"><h2>${career.name}</h2><p class="muted">${career.description}</p><span class="pill">${match.missing.length ? `Добавить навыков: ${match.missing.length}` : 'Все навыки из демо-списка отмечены'}</span></div><div class="career-percent"><strong>${match.percent}%</strong><small>покрытие</small></div>${button(selectedCareer === index ? 'Скрыть ↑' : 'Подробнее →', 'career', `data-index="${index}" aria-expanded="${selectedCareer === index}"`, true)}${selectedCareer === index ? `<div class="career-details"><h3>${match.missing.length ? 'Что предстоит освоить' : 'Навыки из списка уже знакомы'}</h3><div class="tags">${(match.missing.length ? match.missing : career.skills).map(skill => `<span class="pill">${skill}</span>`).join('')}</div><p class="small muted">Для реального перехода понадобятся более полная матрица требований и отдельная оценка.</p></div>` : ''}</article>`; }).join('')}</div><div class="bottom-actions"><p class="muted small">Добавь знакомые навыки, чтобы сравнить покрытие.</p><a class="button secondary" href="#profile">Изменить профиль →</a></div>`;
}
function planPage() {
  const report = latestReport();
  const gaps = report ? [...report.scores].sort((a, b) => a.score - b.score) : currentProfile().questions.map(q => ({ skill: q.skill }));
  return `${heading('Следующий шаг', 'Твой план развития', `${currentProfile().name} · ${state.profile.grade}`)}${report ? `<div class="notice"><p>План составлен по последней демо-оценке: ${date(report.date)}. Сначала идут темы с меньшим процентом найденных критериев.</p></div>` : '<div class="notice"><p>Пока нет оценки для этой цели. Это стартовый план; после тестирования темы будут упорядочены по результату.</p></div>'}<div class="plan-list">${gaps.map((row, index) => `<article class="panel plan-item"><span class="plan-number">0${index + 1}</span><div><span class="eyebrow">${index === 0 ? 'Начни здесь' : 'Затем'}</span><h2>${escape(row.skill)}</h2><p class="muted">Повтори основные понятия. Ответь на вопрос в тренировке и сравни ответ с критериями.</p></div><span class="pill">${row.score === undefined ? 'Стартовый план' : `${row.score}% критериев`}</span>${button('Практиковаться →', 'train-skill', `data-skill="${escape(row.skill)}"`, true)}</article>`).join('')}</div><section class="reassessment"><span class="icon-box mint">↻</span><div><h2>Закрепи результат новой оценкой</h2><p class="muted">Практика не меняет процент. В историю попадает только завершённая оценка.</p></div>${button('Пройти оценку →', 'start-assessment')}</section>`;
}
function progressPage() {
  if (!state.history.length) return emptyPage('Здесь будет твой прогресс', 'Заверши первую оценку — сохраним результат в этом браузере. Тренировки не меняют историю.', 'Пройти первую оценку', 'start-assessment');
  const matching = state.history.filter(report => report.profile.profession === state.profile.profession && report.profile.grade === state.profile.grade);
  const delta = matching.length >= 2 ? matching[0].total - matching[1].total : null;
  return `${heading('Твой путь', 'История оценок', 'Последние 10 результатов в этом браузере. Тексты ответов не сохраняются.')}<div class="summary-strip"><div><strong>${state.history.length}</strong><span>завершённых оценок</span></div><div><strong>${matching[0] ? `${matching[0].total}%` : '—'}</strong><span>последняя для текущей цели</span></div><div><strong>${delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta} п.п.`}</strong><span>изменение для той же цели</span></div></div><div class="panel history-list">${state.history.map(report => `<article><span class="icon-box">↗</span><div><h3>${profiles[report.profile.profession].name} · ${report.profile.grade}</h3><p class="muted small">${date(report.date)} · ${report.scores.length} вопроса · демо</p></div><strong class="history-score">${report.total}%</strong>${button('Разбор →', 'view-report', `data-id="${escape(report.id)}"`, true)}</article>`).join('')}</div><div class="bottom-actions"><p class="muted small">Повторяются те же вопросы: изменение процента не доказывает рост навыка.</p>${button('Очистить историю', 'clear-history', '', true)}</div><div id="clear-confirm"></div>`;
}
function emptyPage(title, description, label, action) {
  return `<section class="panel empty-state"><span class="icon-box big">↗</span><p class="eyebrow">Каждый путь начинается с первого шага</p><h1>${title}</h1><p class="muted">${description}</p>${button(`${label} →`, action)}</section>`;
}
function render(focus = false) {
  const route = currentRoute();
  const pages = { home: homePage, profile: profilePage, competencies: competenciesPage, modes: modesPage, training: () => sessionPage('training'), assessment: () => sessionPage('assessment'), results: resultsPage, related: relatedPage, plan: planPage, progress: progressPage };
  shell((pages[route] || homePage)(), route);
  const title = app.querySelector('h1')?.textContent || 'Подготовка к собеседованиям';
  document.title = `${title} — Interview Assistant`;
  if (focus) { document.querySelector('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
}
app.addEventListener('change', event => {
  if (event.target.name === 'profession') document.querySelector('.skill-options').innerHTML = skillOptions(event.target.value);
});
app.addEventListener('input', event => {
  if (event.target.id === 'answer' && session) {
    const question = profiles[session.profile.profession].questions[session.index];
    session.answers[question.id] = event.target.value;
    document.querySelector('[data-count]').textContent = `${event.target.value.length} / 5 000`;
    document.querySelector('#answer-error').textContent = '';
    event.target.removeAttribute('aria-invalid');
  }
});
app.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'profile-form') {
    const form = new FormData(event.target);
    state.profile = { profession: form.get('profession'), grade: form.get('grade'), skills: form.getAll('skills') };
    session = null; persist(); go('competencies');
  }
  if (event.target.id === 'answer-form' && session) {
    const question = profiles[session.profile.profession].questions[session.index];
    const answer = String(new FormData(event.target).get('answer')).trim();
    if (answer.length < 10 || answer.length > 5000) {
      document.querySelector('#answer-error').textContent = 'Напиши ответ длиной от 10 до 5 000 символов.';
      document.querySelector('#answer').setAttribute('aria-invalid', 'true');
      document.querySelector('#answer').focus(); return;
    }
    session.answers[question.id] = answer;
    if (session.mode === 'training') { session.feedback = evaluateAnswer(question, answer); render(); document.querySelector('.feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    else if (session.index < profiles[session.profile.profession].questions.length - 1) { session.index++; render(true); }
    else {
      const report = makeReport(session.profile, session.answers, Math.round((Date.now() - session.started) / 1000));
      state = addReport(state, report); selectedReportId = report.id; session = null; persist(); go('results');
    }
  }
});
app.addEventListener('click', event => {
  // Исторический отчёт может относиться к другой цели. План должен сохранять его контекст.
  if (event.target.closest('.next-steps a[href="#plan"]')) {
    event.preventDefault();
    const report = state.history.find(item => item.id === selectedReportId) || state.history[0];
    if (report) { state.profile = structuredClone(report.profile); session = null; persist(); go('plan'); }
    return;
  }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'go-profile') go('profile');
  if (action === 'start-training') startSession('training');
  if (action === 'start-assessment') startSession('assessment');
  if (action === 'previous' && session) { session.index--; session.feedback = null; render(true); }
  if (action === 'next-training' && session) { session.index++; session.feedback = null; render(true); }
  if (action === 'career') { selectedCareer = selectedCareer === Number(control.dataset.index) ? null : Number(control.dataset.index); render(); }
  if (action === 'train-skill') {
    session = { mode: 'training', profile: structuredClone(state.profile), index: Math.max(0, currentProfile().questions.findIndex(q => q.skill === control.dataset.skill)), answers: {}, feedback: null, started: Date.now() }; go('training');
  }
  if (action === 'view-report') { selectedReportId = control.dataset.id; go('results'); }
  if (action === 'clear-history') { document.querySelector('#clear-confirm').innerHTML = `<div class="notice warning"><p>Удалить все результаты из этого браузера? Профиль останется.</p>${button('Удалить результаты', 'confirm-clear', '', true)}${button('Отмена', 'cancel-clear', '', true)}</div>`; }
  if (action === 'cancel-clear') document.querySelector('#clear-confirm').innerHTML = '';
  if (action === 'confirm-clear') { state = { ...state, history: defaultState().history }; selectedReportId = null; persist(); render(true); }
});
window.addEventListener('hashchange', () => render(true));
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); document.querySelector('#main').focus(); });
setInterval(() => { const timer = document.querySelector('[data-timer]'); if (timer && session) timer.textContent = time((Date.now() - session.started) / 1000); }, 1000);
render();
