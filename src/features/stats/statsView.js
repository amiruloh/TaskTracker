import { store } from '../../core/store.js';
import { toDateString, addDays } from '../../utils/date.js';
import { willTriggerOn } from '../../services/recurringService.js';

export function renderStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  // Logika perhitungan (disalin dari app.js lama)
  const uniqueManualTasks = store.state.tasks.filter(t => !t.templateId).length;
  const uniqueTemplateIdsInTasks = [...new Set(store.state.tasks.filter(t => t.templateId).map(t => t.templateId))];
  const activeTemplatesWithoutTasks = store.state.templates.filter(tpl => !uniqueTemplateIdsInTasks.includes(tpl.id)).length;
  const totalKeseluruhan = uniqueManualTasks + uniqueTemplateIdsInTasks.length + activeTemplatesWithoutTasks;

  let upcomingCount = 0;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 7; i++) {
      const targetDate = addDays(todayDate, i);
      const tDateStr = toDateString(targetDate);
      upcomingCount += store.state.tasks.filter(t => t.date === tDateStr && t.status === 'pending').length;
      store.state.templates.forEach(tpl => {
          const hasInstance = store.state.tasks.some(t => t.templateId === tpl.id && t.date === tDateStr);
          if (!hasInstance && willTriggerOn(tpl, targetDate)) upcomingCount++;
      });
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const completedYear = store.state.tasks.filter(t => t.status === 'completed' && new Date(t.completedAt) >= oneYearAgo).length;

  const todayStr = toDateString(new Date());
  const missedCount = store.state.tasks.filter(t => t.status === 'pending' && t.date < todayStr).length;

  const totalInstances = store.state.tasks.length;
  const totalCompleted = store.state.tasks.filter(t => t.status === 'completed').length;
  const score = totalInstances === 0 ? 0 : Math.round((totalCompleted / totalInstances) * 100);

  let label = 'Mulai kerjakan tugas pertamamu hari ini! 🌱';
  if (totalInstances > 0) {
      if (score < 30) label = 'Masih butuh pemanasan! Bangun momentummu! 🔥';
      else if (score < 70) label = 'Cukup baik, pertahankan konsistensinya! 👍';
      else if (score < 90) label = 'Luar biasa! Kamu sangat produktif! 🚀';
      else label = 'Sempurna! Manajemen waktumu level Dewa! 👑';
  }

  grid.innerHTML = `
      <div class="stat-box"><div class="stat-value">${totalKeseluruhan}</div><div class="stat-label">Total Tugas Unik</div></div>
      <div class="stat-box"><div class="stat-value blue">${upcomingCount}</div><div class="stat-label">7 Hari Kedepan</div></div>
      <div class="stat-box"><div class="stat-value emerald">${completedYear}</div><div class="stat-label">Selesai (Setahun)</div></div>
      <div class="stat-box ${missedCount > 0 ? 'warn' : ''}"><div class="stat-value amber">${missedCount}</div><div class="stat-label">Terlewat</div></div>
  `;

  document.getElementById('scoreText').textContent = score + '%';
  document.getElementById('scoreBar').style.width = score + '%';
  document.getElementById('scoreLabel').textContent = label;
}