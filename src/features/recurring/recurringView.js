import { store } from '../../core/store.js';
import { DAY_NAMES } from '../../config/constants.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { openModal, confirmDialog } from '../../ui/modal.js';

function getCat(id) {
  return store.state.categories.find(c => c.id === id) || { name: 'Unknown', color: '#64748b' };
}

export function openRecurringModal() {
  renderRecurringList();
  openModal('recurringModal');
}

function renderRecurringList() {
  const list = document.getElementById('recurringList');
  list.innerHTML = '';

  if (store.state.templates.length === 0) {
    list.innerHTML = `<div class="empty-state"><span class="empty-emoji">🍃</span><p>Tidak ada siklus tugas berulang yang aktif.</p></div>`;
    return;
  }

  store.state.templates.forEach(tpl => {
    const cat = getCat(tpl.categoryId);
    let typeText = '';
    if (tpl.repeatType === 'daily') typeText = 'Setiap Hari';
    else if (tpl.repeatType === 'interval') typeText = `Tiap ${tpl.intervalVal} Hari`;
    else if (tpl.repeatType === 'monthly_date') typeText = `Tiap Tgl ${tpl.monthDay}`;
    else if (tpl.repeatType === 'monthly_multiple') typeText = `Tiap Tgl ${tpl.monthDays.join(', ')}`;
    else if (tpl.repeatType === 'days') typeText = tpl.days.map(d => DAY_NAMES[d]).join(', ');

    const item = document.createElement('div');
    item.className = 'recurring-item';
    item.innerHTML = `
      <div class="recurring-info">
          <h4 class="recurring-title">${escapeHtml(tpl.title)}</h4>
          <p class="recurring-meta">🔄 ${typeText} &bull; <span style="color:${cat.color}">${escapeHtml(cat.name)}</span></p>
      </div>
      <button class="btn btn-sm btn-danger" data-stop="${tpl.id}">Hentikan</button>
    `;
    
    item.querySelector('[data-stop]').addEventListener('click', async () => {
      const ok = await confirmDialog('Hentikan siklus tugas berulang ini? Tugas yang sudah tercetak tidak akan terhapus.', { title: 'Hentikan Siklus' });
      if(!ok) return;
      
      store.update(s => { s.templates = s.templates.filter(t => t.id !== tpl.id); });
      renderRecurringList();
    });
    
    list.appendChild(item);
  });
}