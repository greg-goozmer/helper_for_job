import test from 'node:test';
import assert from 'node:assert/strict';
import { profiles, careers } from '../frontend/src/data.js';
import { defaultState, evaluateAnswer, makeReport, addReport, careerMatch, loadState, saveState, STORAGE_KEY } from '../frontend/src/model.js';

const question = profiles.backend.questions[0];
const fullAnswer = 'SELECT user_id, SUM(amount) FROM orders WHERE created_at > now() GROUP BY user_id ORDER BY SUM(amount) DESC LIMIT 5';
test('пустой ответ не выполняет критерии, полный пример выполняет все', () => {
  assert.equal(evaluateAnswer(question, '').score, 0);
  assert.equal(evaluateAnswer(question, fullAnswer).score, 100);
});
test('составной критерий требует и убывания, и ограничения', () => {
  assert.equal(evaluateAnswer(question, 'ORDER BY total DESC').checks[3].met, false);
  assert.equal(evaluateAnswer(question, 'ORDER BY total DESC LIMIT 5').checks[3].met, true);
});
test('отчёт фиксирует цель и не сохраняет текст ответа', () => {
  const initial = defaultState();
  const report = makeReport(initial.profile, { [question.id]: fullAnswer }, 90);
  initial.profile.grade = 'Senior';
  initial.profile.skills.push('API');
  assert.equal(report.profile.grade, 'Middle');
  assert.deepEqual(report.profile.skills, ['Python', 'SQL']);
  assert.equal(report.total, 33);
  assert.equal(report.elapsedSeconds, 90);
  assert.equal(JSON.stringify(report).includes('SELECT'), false);
});
test('история ограничена 10 последними результатами без изменения исходного объекта', () => {
  const initial = defaultState();
  let next = initial;
  for (let i = 0; i < 12; i++) next = addReport(next, { id: String(i) });
  assert.equal(initial.history.length, 0);
  assert.equal(next.history.length, 10);
  assert.equal(next.history[0].id, '11');
  assert.equal(next.history.at(-1).id, '2');
});
test('разбор тренировки не меняет сохранённую историю', () => {
  const initial = defaultState();
  const before = JSON.stringify(initial);
  evaluateAnswer(question, fullAnswer);
  assert.equal(JSON.stringify(initial), before);
});
test('покрытие смежной роли объясняется списком недостающих навыков', () => {
  assert.deepEqual(careerMatch(['SQL', 'API'], careers[0]), { percent: 50, missing: ['JavaScript', 'HTML / CSS'] });
  assert.equal(careerMatch(careers[0].skills, careers[0]).percent, 100);
});
test('отсутствующие, повреждённые и недоступные данные дают начальное состояние', () => {
  for (const value of [null, '{', '{}', JSON.stringify({ profile: { profession: 'unknown', grade: 'Middle' } }), JSON.stringify({ profile: { profession: '__proto__', grade: 'Middle' } })]) {
    assert.deepEqual(loadState({ getItem: () => value }), defaultState());
  }
  assert.deepEqual(loadState({ getItem() { throw new Error('blocked'); } }), defaultState());
});
test('хранилище восстанавливает валидный отчёт и отбрасывает повреждённый', () => {
  const initial = defaultState();
  const report = makeReport(initial.profile, {});
  const broken = { ...report, profile: { profession: 'backend', grade: 'Middle' } };
  const saved = { profile: { ...initial.profile, skills: ['SQL', 'несуществующий навык'] }, history: [{ invalid: true }, broken, report] };
  const loaded = loadState({ getItem: () => JSON.stringify(saved) });
  assert.deepEqual(loaded.profile.skills, ['SQL']);
  assert.equal(loaded.history.length, 1);
  assert.equal(loaded.history[0].id, report.id);
});
test('ошибка записи возвращается вызывающему коду, а не прерывает сценарий', () => {
  assert.equal(saveState({ setItem() { throw new Error('quota'); } }, defaultState()), false);
  let key;
  assert.equal(saveState({ setItem(k) { key = k; } }, defaultState()), true);
  assert.equal(key, STORAGE_KEY);
});
