import { store } from '../../core/store.js';
import { toDateString, addDays, formatDateLabel } from '../../utils/date.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { willTriggerOn } from '../../services/recurringService.js';

function getCat(id) {
  return store.state.categories.find(c => c.id === id) || { name: 'Unknown', color: '#64748b' };
}

export function renderUpcoming() {
  const container = document.getElementById('upcomingList');
  container.innerHTML = '';
  
  const filterVal = document.getElementById('categoryFilter').value;
  const hideRecurring = document.getElementById('hideRecurring').checked;
  const todayObj = new Date();
  todayObj.setHours(0,0,0,0);
  
  let hasUpcoming = false;

  for (let i = 1; i <= 7; i++) {
    const targetDate = addDays(todayObj, i);
    const tDateStr = toDateString(targetDate);

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

    const group = document.createElement('div');
    group.className = 'upcoming-group';
    group.innerHTML = `
      <div class="upcoming-group-header">
          <span>${formatDateLabel(targetDate)}</span>
          <span class="hint">Lihat ➡️</span>
      </div>
      <div class="upcoming-group-body"></div>
    `;
    const body = group.querySelector('.upcoming-group-body');

    manualTasks.forEach(t => {
      const cat = getCat(t.categoryId);
      body.insertAdjacentHTML('beforeend', `
        <div class="upcoming-item">
            <span class="upcoming-item-title">${escapeHtml(t.title)}</span>
            <span class="upcoming-item-badge" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
        </div>
      `);
    });

    triggeredTemplates.forEach(t => {
      const cat = getCat(t.categoryId);
      body.insertAdjacentHTML('beforeend', `
        <div class="upcoming-item">
            <span class="upcoming-item-title">${escapeHtml(t.title)} 🔄</span>
            <span class="upcoming-item-badge" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
        </div>
      `);
    });

    group.addEventListener('click', () => {
      document.getElementById('plannerDate').value = tDateStr;
      renderPlanner(); // Asumsi renderPlanner di-import atau jadi global
    });
    
    container.appendChild(group);
  }

  if (!hasUpcoming) {
    container.innerHTML = `<p class="empty-state"><span>Tidak ada jadwal tercatat untuk 7 hari kedepan.</span></p>`;
  }
}