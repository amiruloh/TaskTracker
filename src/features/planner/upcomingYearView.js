import { store } from '../../core/store.js';
import { toDateString, addDays } from '../../utils/date.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { willTriggerOn } from '../../services/recurringService.js';

function getCat(id) {
  return store.state.categories.find(c => c.id === id) || { name: 'Unknown', color: '#64748b' };
}

export function renderUpcomingYear() {
  const container = document.getElementById('upcomingYearList');
  if (!container) return;
  container.innerHTML = '';

  const filterVal = document.getElementById('categoryFilter').value;
  const hideRecurring = document.getElementById('hideRecurring').checked;
  const todayObj = new Date();
  todayObj.setHours(0,0,0,0);
  
  let hasUpcoming = false;
  let currentMonthStr = '';
  let monthEl = null;

  for (let i = 8; i <= 365; i++) {
    const targetDate = addDays(todayObj, i);
    const tDateStr = toDateString(targetDate);
    const monthName = targetDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    let manualTasks = store.state.tasks.filter(t => 
      t.date === tDateStr && t.status === 'pending' && (filterVal === 'all' || t.categoryId === filterVal)
    );
    if (hideRecurring) manualTasks = manualTasks.filter(t => !t.templateId);

    const triggeredTemplates = [];
    if (!hideRecurring) {
      store.state.templates.forEach(tpl => {
        if (filterVal !== 'all' && tpl.categoryId !== filterVal) return;
        const hasInstance = store.state.tasks.some(t => t.templateId === tpl.id && t.date === tDateStr);
        if (!hasInstance && willTriggerOn(tpl, targetDate)) triggeredTemplates.push(tpl);
      });
    }

    if (manualTasks.length === 0 && triggeredTemplates.length === 0) continue;
    hasUpcoming = true;

    if (monthName !== currentMonthStr) {
      currentMonthStr = monthName;
      monthEl = document.createElement('div');
      monthEl.className = 'upcoming-month-group';
      monthEl.innerHTML = `<h3 class="upcoming-month-title">${monthName}</h3>`;
      container.appendChild(monthEl);
    }

    const dayEl = document.createElement('div');
    dayEl.className = 'upcoming-day';
    dayEl.innerHTML = `
      <div class="upcoming-day-header">${targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric' })}</div>
      <div class="upcoming-day-body"></div>
    `;
    const body = dayEl.querySelector('.upcoming-day-body');

    manualTasks.forEach(t => {
      const cat = getCat(t.categoryId);
      body.insertAdjacentHTML('beforeend', `
        <div class="upcoming-item">
            <span class="upcoming-item-title sm">${escapeHtml(t.title)}</span>
            <span class="upcoming-item-badge sm" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
        </div>
      `);
    });

    triggeredTemplates.forEach(t => {
      const cat = getCat(t.categoryId);
      body.insertAdjacentHTML('beforeend', `
        <div class="upcoming-item">
            <span class="upcoming-item-title sm">${escapeHtml(t.title)} 🔄</span>
            <span class="upcoming-item-badge sm" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
        </div>
      `);
    });

    dayEl.addEventListener('click', () => {
      document.getElementById('plannerDate').value = tDateStr;
      // Panggil renderPlanner() dari luar
      import('./plannerView.js').then(m => m.renderPlanner());
    });
    monthEl.appendChild(dayEl);
  }

  if (!hasUpcoming) {
    container.innerHTML = `<p class="empty-state"><span>Tidak ada jadwal tercatat untuk setahun kedepan.</span></p>`;
  }
}