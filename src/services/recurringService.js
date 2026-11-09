import { REPEAT_TYPES } from '../config/constants.js';
import { today, toDateString, startOfDay, daysBetween } from '../utils/date.js';

/**
 * Cek apakah template akan trigger di tanggal tertentu.
 * Fungsi murni, tanpa side-effect → mudah dites.
 */
export function willTriggerOn(tpl, dateObj) {
  const dayNum = dateObj.getDay();
  const dateNum = dateObj.getDate();

  switch (tpl.repeatType) {
    case REPEAT_TYPES.DAILY:
      return true;
    case REPEAT_TYPES.DAYS:
      return Array.isArray(tpl.days) && tpl.days.includes(dayNum);
    case REPEAT_TYPES.MONTHLY_DATE:
      return tpl.monthDay === dateNum;
    case REPEAT_TYPES.MONTHLY_MULTIPLE:
      return Array.isArray(tpl.monthDays) && tpl.monthDays.includes(dateNum);
    case REPEAT_TYPES.INTERVAL: {
      const baseDate = new Date((tpl.lastGenerated || tpl.createdAt) + 'T00:00:00');
      const diff = daysBetween(baseDate, dateObj);
      return diff > 0 && diff % (tpl.intervalVal || 2) === 0;
    }
    default:
      return false;
  }
}

/**
 * Backfill semua task recurring dari template. Idempotent.
 */
export function backfillRecurring(state) {
  const todayStr = today();
  const todayObj = startOfDay(new Date());

  state.templates.forEach((tpl) => {
    const startStr = tpl.lastGenerated || tpl.createdAt;
    if (!startStr) {
      tpl.lastGenerated = todayStr;
      return;
    }

    let cursor = new Date(startStr + 'T00:00:00');
    if (tpl.lastGenerated) cursor.setDate(cursor.getDate() + 1);

    const limit = new Date(todayObj);
    limit.setDate(limit.getDate() - 400);
    if (cursor < limit) cursor = new Date(limit);

    while (cursor <= todayObj) {
      const dateStr = toDateString(cursor);
      const exists = state.tasks.some(
        (t) => t.templateId === tpl.id && t.date === dateStr
      );
      if (!exists && willTriggerOn(tpl, cursor)) {
        state.tasks.push(createTaskFromTemplate(tpl, dateStr));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    tpl.lastGenerated = todayStr;
  });
}

export function createTaskFromTemplate(tpl, dateStr) {
  return {
    id: `t_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    date: dateStr,
    status: 'pending',
    duration: 0,
    title: tpl.title,
    categoryId: tpl.categoryId,
    notes: tpl.notes || '',
    templateId: tpl.id,
    deadline: tpl.deadline || '',
  };
}