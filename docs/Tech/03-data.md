# Данные

## КТ1

Источник: code/frontend/src/data.js, версия demo-v1. Авторские демонстрационные вопросы без внешних заимствований: 3 профессии × 3 вопроса × 4 критерия. По 6 навыков на профиль. Каталог содержит варианты ключевых слов для разбора, но не эталон полноценной экспертной оценки.

### Локальное состояние

```json
{
  "profile": { "profession": "backend", "grade": "Middle", "skills": ["Python", "SQL"] },
  "history": []
}
```

Отчёт: id, date (ISO), version, снимок profile, scores (id вопроса, skill, score, checks), total, elapsedSeconds. В localStorage нет поля answer.

Черновики ответов хранятся только в session в памяти страницы. Ответ ограничен 5000 символами. При чтении проверяются профессия, грейд, версия и структура отчёта; испорченное состояние игнорируется.

## Следующий этап: схема корпуса

| Поле | Назначение |
| --- | --- |
| document_id / chunk_id | Стабильная идентификация документа и фрагмента |
| source_id / url / title | Происхождение и ссылка для ответа |
| retrieved_at / updated_at | Актуальность |
| license / permission | Основание использования |
| profession / grade / skill_ids | Фильтрация |
| text / content_hash | Текст и контроль изменения |
| reviewer / review_status | Ручная проверка |

Матрица компетенций: profession_id, grade, skill_id, weight, required_depth, prerequisites. Отдельные сущности question, rubric_version, assessment и criterion_result.

Не загружать личные резюме, тексты частных интервью и запрещённые к распространению наборы. Куратор ведёт реестр источников. Пока реального корпуса и индекса нет.

