import { store } from '../../core/store.js';
import { toDateString, addDays } from '../../utils/date.js';

export function renderHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = '';

  const dailyData = {};
  store.state.tasks.filter(t => t.status === 'completed').forEach(t => {
      dailyData[t.date] = (dailyData[t.date] || 0) + t.duration;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 363; i >= 0; i--) {
      const d = addDays(today, -i);
      const dateStr = toDateString(d);
      const val = dailyData[dateStr] || 0;

      let lvl = 0;
      if (val > 0 && val <= 30) lvl = 1;
      else if (val > 30 && val <= 60) lvl = 2;
      else if (val > 60 && val <= 120) lvl = 3;
      else if (val > 120) lvl = 4;

      const cell = document.createElement('div');
      cell.className = `heat-${lvl}`;
      cell.title = `${dateStr}: ${val} menit`;
      cell.addEventListener('click', () => {
          document.getElementById('plannerDate').value = dateStr;
          import('../planner/plannerView.js').then(m => m.renderPlanner());
      });
      grid.appendChild(cell);
  }
}