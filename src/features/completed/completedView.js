import { store } from '../../core/store.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { undoTask } from '../../services/taskService.js';
import { confirmDialog } from '../../ui/modal.js';

function getCat(id) {
  return store.state.categories.find(c => c.id === id) || { name: 'Unknown', color: '#64748b' };
}

export function renderCompleted() {
  const container = document.getElementById('completedList');
  container.innerHTML = '';

  const completed = store.state.tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date))
    .slice(0, 50);

  if (completed.length === 0) {
    container.innerHTML = `<p class="empty-state"><span>Belum ada log diselesaikan.</span></p>`;
    return;
  }

  completed.forEach(task => {
    const cat = getCat(task.categoryId);
    const d = new Date(task.completedAt || task.date);
    const timeStr = `${d.getDate()}/${d.getMonth() + 1} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    
    const item = document.createElement('div');
    item.className = 'completed-item';
    item.innerHTML = `
      <div class="completed-info">
          <p class="completed-title">${escapeHtml(task.title)}</p>
          <p class="completed-meta">${timeStr} &bull; <span style="color:${cat.color}">${escapeHtml(cat.name)}</span></p>
      </div>
      <div class="completed-actions">
          <div class="completed-duration">${task.duration} min</div>
          <button class="undo-btn" title="Batalkan Log (Undo)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
          </button>
      </div>
    `;

    item.querySelector('.undo-btn').addEventListener('click', async () => {
      const ok = await confirmDialog('Hapus log penyelesaian tugas ini? Tugas akan kembali ke status pending.', { title: 'Hapus Log' });
      if(ok) undoTask(task.id);
    });
    
    container.appendChild(item);
  });
}