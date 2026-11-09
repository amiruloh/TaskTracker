import { store } from '../../core/store.js';
import { today, formatDeadline } from '../../utils/date.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { willTriggerOn, createTaskFromTemplate } from '../../services/recurringService.js';
import { handleCheckboxToggle } from '../task/taskActions.js';
import { openRecurringModal } from '../recurring/recurringView.js';
import { openTaskDetail } from '../task/taskDetailView.js'; // <-- Import Panel Detail Baru
import { toast } from '../../ui/toast.js';

function getCat(id) {
  return store.state.categories.find(c => c.id === id) || { name: 'Unknown', color: '#64748b' };
}

export function renderPlanner() {
  const container = document.getElementById('taskList');
  const empty = document.getElementById('emptyTask');
  const emptyText = document.getElementById('emptyTaskText');

  const selectedDateStr = document.getElementById('plannerDate').value;
  const filterVal = document.getElementById('categoryFilter').value;
  const hideRecurring = document.getElementById('hideRecurring').checked;
  const todayStr = today();

  container.innerHTML = '';
  const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');

  // 1. Ambil tugas manual/tersimpan
  let manualTasks = store.state.tasks.filter(t =>
    t.date === selectedDateStr && (filterVal === 'all' || t.categoryId === filterVal)
  );
  if (hideRecurring) manualTasks = manualTasks.filter(t => !t.templateId);
  manualTasks.sort((a, b) => (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0));

  // 2. Cek forecast template (tugas berulang yang belum di-generate)
  const forecastedTemplates = [];
  if (!hideRecurring) {
    store.state.templates.forEach(tpl => {
      if (filterVal !== 'all' && tpl.categoryId !== filterVal) return;
      const hasInstance = store.state.tasks.some(t => t.templateId === tpl.id && t.date === selectedDateStr);
      if (!hasInstance && willTriggerOn(tpl, selectedDateObj)) {
        forecastedTemplates.push(tpl);
      }
    });
  }

  if (manualTasks.length === 0 && forecastedTemplates.length === 0) {
    empty.classList.remove('hidden');
    emptyText.innerHTML = selectedDateStr < todayStr 
      ? 'Tidak ada riwayat tugas di tanggal ini.<br>Dan tidak ada template berulang yang cocok.'
      : 'Tidak ada tugas untuk tanggal ini.<br>Istirahat atau tambahkan jadwal baru!';
    return;
  }
  empty.classList.add('hidden');

  // Render Tugas
  manualTasks.forEach(task => {
    const cat = getCat(task.categoryId);
    const isCompleted = task.status === 'completed';
    const canInteract = selectedDateStr <= todayStr;
    const isPast = selectedDateStr < todayStr;
    const isMissed = isPast && !isCompleted;

    const card = document.createElement('div');
    card.className = `task-card ${isCompleted ? 'completed' : ''} ${isMissed ? 'missed' : ''}`;
    
    // Susun HTML kartu
    card.innerHTML = `
      <div class="task-checkbox-wrap">
          <label class="${canInteract ? '' : 'disabled'}">
              <input type="checkbox" class="task-checkbox-input" ${isCompleted ? 'checked' : ''} ${canInteract ? '' : 'disabled'}>
              <span class="task-checkbox-visual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></span>
          </label>
      </div>
      <div class="task-content">
          <div class="task-title-row">
              <h3 class="task-title ${isCompleted ? 'done' : ''}">${escapeHtml(task.title)}</h3>
              ${task.templateId ? '<span class="task-icon" title="Berulang">🔄</span>' : ''}
              ${isMissed ? '<span class="badge badge-missed">⚠️ Terlewat</span>' : ''}
          </div>
          <div class="task-meta">
              <span class="badge badge-category" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
              ${task.deadline ? `<span class="badge badge-deadline">⏰ ${formatDeadline(task.deadline)}</span>` : ''}
              ${isCompleted ? `<span class="badge badge-done">Selesai: ${task.duration}m</span>` : ''}
          </div>
          ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ''}
      </div>
      <button class="task-delete" title="Hapus tugas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
    `;

    // Pasang event
    const cb = card.querySelector('.task-checkbox-input');
    if (cb) cb.addEventListener('change', (e) => handleCheckboxToggle(task.id, e.target, isCompleted));
    
    // Buka panel detail saat judul di-klik
    card.querySelector('.task-title').addEventListener('click', () => openTaskDetail(task.id));

    // Hapus tugas
    card.querySelector('.task-delete').addEventListener('click', async () => {
      if(confirm('Hapus tugas ini?')) {
        store.update(s => { s.tasks = s.tasks.filter(t => t.id !== task.id); });
      }
    });

    container.appendChild(card);
  });

  // Render Forecast Templates (Belum digenerate)
  forecastedTemplates.forEach(tpl => {
    const cat = getCat(tpl.categoryId);
    const isPast = selectedDateStr < todayStr;
    const card = document.createElement('div');
    card.className = `task-card forecast ${isPast ? 'forecast-past' : 'forecast-future'}`;
    
    card.innerHTML = `
      <div class="forecast-icon">${isPast ? '⚠️' : '🔒'}</div>
      <div class="task-content">
          <div class="task-title-row">
              <h3 class="task-title">${escapeHtml(tpl.title)}</h3>
              <span class="task-icon">🔄</span>
              ${isPast ? '<span class="badge badge-backfill">Belum Tercatat</span>' : ''}
          </div>
          <div class="task-meta">
              <span class="badge badge-category" style="background-color:${cat.color}">${escapeHtml(cat.name)}</span>
          </div>
          <p class="forecast-hint">${isPast ? 'Tugas ini seharusnya ada di tanggal ini tapi belum dibuat.' : 'Tugas ini akan aktif pada tanggal tersebut.'}</p>
          ${isPast ? `<button class="btn btn-sm btn-warn" data-backfill>📝 Buat & Catat Sekarang</button>` : ''}
      </div>
    `;

    if (isPast) {
      card.querySelector('[data-backfill]').addEventListener('click', () => {
        store.update(state => {
          const newTask = createTaskFromTemplate(tpl, selectedDateStr);
          state.tasks.push(newTask);
        });
        toast('Tugas berhasil dibuat.', 'success');
      });
    }

    // Klik judul forecast untuk melihat detail template
    card.querySelector('.task-title').addEventListener('click', () => openTaskDetail(null, tpl));

    container.appendChild(card);
  });
}

export function bindPlannerEvents() {
  document.getElementById('plannerDate').addEventListener('change', renderPlanner);
  document.getElementById('btnManageRecurring').addEventListener('click', openRecurringModal);
}