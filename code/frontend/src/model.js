import { profiles, grades, DATA_VERSION } from './data.js';

export const STORAGE_KEY = 'interview-assistant:v1';
export const defaultState = () => ({ profile: { profession: 'backend', grade: 'Middle', skills: ['Python', 'SQL'] }, history: [] });
export const normalize = value => String(value).toLowerCase().replaceAll('ё', 'е');
export function evaluateAnswer(question, answer) {
  const text = normalize(answer);
  const checks = question.rubric.map(item => ({
    label: item.label,
    met: item.terms.some(term => text.includes(normalize(term))) && (!item.all || item.all.some(term => text.includes(normalize(term))))
  }));
  return { checks, score: Math.round(checks.filter(item => item.met).length / checks.length * 100) };
}
export function makeReport(profile, answers, elapsedSeconds = 0) {
  const questions = profiles[profile.profession].questions;
  const scores = questions.map(question => ({ id: question.id, skill: question.skill, ...evaluateAnswer(question, answers[question.id] || '') }));
  return { id: globalThis.crypto.randomUUID(), date: new Date().toISOString(), version: DATA_VERSION,
    profile: structuredClone(profile), scores, total: Math.round(scores.reduce((sum, row) => sum + row.score, 0) / scores.length), elapsedSeconds };
}
export function addReport(state, report) {
  return { ...state, history: [report, ...state.history].slice(0, 10) };
}
export function careerMatch(skills, career) {
  const missing = career.skills.filter(skill => !skills.includes(skill));
  return { percent: Math.round((career.skills.length - missing.length) / career.skills.length * 100), missing };
}
export function loadState(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!saved || !Object.hasOwn(profiles, saved.profile?.profession) || !grades.includes(saved.profile.grade)) return defaultState();
    const allowedSkills = profiles[saved.profile.profession].skills;
    const history = Array.isArray(saved.history) ? saved.history.filter(validReport).slice(0, 10) : [];
    return { profile: { profession: saved.profile.profession, grade: saved.profile.grade, skills: Array.isArray(saved.profile.skills) ? saved.profile.skills.filter(s => allowedSkills.includes(s)) : [] }, history };
  } catch { return defaultState(); }
}
function validReport(report) {
  return report?.version === DATA_VERSION && Object.hasOwn(profiles, report.profile?.profession) && grades.includes(report.profile.grade)
    && Array.isArray(report.profile.skills) && report.profile.skills.every(skill => profiles[report.profile.profession].skills.includes(skill))
    && typeof report.id === 'string' && Number.isFinite(Date.parse(report.date))
    && Number.isFinite(report.total) && report.total >= 0 && report.total <= 100
    && Array.isArray(report.scores) && report.scores.length === profiles[report.profile.profession].questions.length
    && report.scores.every(row => typeof row.skill === 'string' && Number.isFinite(row.score) && row.score >= 0 && row.score <= 100
      && Array.isArray(row.checks) && row.checks.every(check => typeof check.label === 'string' && typeof check.met === 'boolean'));
}
export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
