import { store } from './core/store.js';
import { backfillRecurring } from './services/recurringService.js';
import { today } from './utils/date.js';
import { bindModalEvents } from './ui/modal.js';
import { bindCategoryEvents, renderCategories } from './features/category/categoryView.js';
import { bindTaskFormEvents } from './features/task/taskForm.js';
import { bindPlannerEvents, renderPlanner } from './features/planner/plannerView.js';
import { renderUpcoming } from './features/planner/upcomingView.js';
import { renderUpcomingYear } from './features/planner/upcomingYearView.js';
import { renderStats } from './features/stats/statsView.js';
import { renderHeatmap } from './features/stats/heatmapView.js';
import { renderCompleted } from './features/completed/completedView.js';
import { bindTaskActions } from './features/task/taskActions.js';
import { exportData, importData } from './features/backup/backupService.js';

function renderAll() {
  renderCategories();
  renderPlanner();
  renderUpcoming();
  renderUpcomingYear();
  renderStats();
  renderHeatmap();
  renderCompleted();
}

function init() {
  store.hydrate();

  const todayStr = today();
  document.getElementById('tSpecificDate').value = todayStr;
  document.getElementById('plannerDate').value = todayStr;

  store.update((s) => backfillRecurring(s));

  // Bind Events
  bindModalEvents();
  bindCategoryEvents();
  bindTaskFormEvents();
  bindPlannerEvents();
  bindTaskActions();
  
  // Backup buttons
  document.getElementById('btnExport').addEventListener('click', exportData);
  document.getElementById('importFile').addEventListener('change', importData);

  // Subscribe untuk re-render setiap state berubah
  store.subscribe(renderAll);
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);