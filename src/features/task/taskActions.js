import { store } from '../../core/store.js';
import { today } from '../../utils/date.js';
import { completeTask, undoTask } from '../../services/taskService.js';
import { confirmDialog, openModal, closeModal } from '../../ui/modal.js';

let pendingTaskId = null;
let pendingCardEl = null;

export async function handleCheckboxToggle(taskId, checkboxEl, isCurrentlyCompleted) {
  if (isCurrentlyCompleted) {
    const ok = await confirmDialog('Batalkan status selesai untuk tugas ini? Log waktu akan dihapus.', { title: 'Batalkan Selesai' });
    if (!ok) { checkboxEl.checked = true; return; }
    undoTask(taskId);
  } else {
    triggerFinish(taskId, checkboxEl);
  }
}

function triggerFinish(taskId, checkboxEl) {
  pendingTaskId = taskId;
  pendingCardEl = checkboxEl.closest('.task-card');
  const task = store.state.tasks.find(t => t.id === taskId);
  const info = document.getElementById('finishTaskInfo');
  
  if (task) {
    const isPast = task.date < today();
    info.textContent = isPast ? `⚠️ Tugas tanggal ${task.date} (terlewat)` : `Tugas tanggal ${task.date}`;
    document.getElementById('finishDate').value = today();
    document.getElementById('finishDuration').value = task.duration || 30;
  }
  
  openModal('timeModal');
  setTimeout(() => document.getElementById('finishDuration').focus(), 100);
}

export function cancelFinish() {
  closeModal('timeModal');
  if (pendingCardEl) {
    const cb = pendingCardEl.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = false;
  }
  pendingTaskId = null;
  pendingCardEl = null;
}

export function confirmFinish() {
  const dur = parseInt(document.getElementById('finishDuration').value) || 0;
  const finishDateVal = document.getElementById('finishDate').value;
  
  completeTask(pendingTaskId, dur, finishDateVal);
  
  closeModal('timeModal');
  if (pendingCardEl) {
    pendingCardEl.classList.add('task-completing');
  }
  pendingTaskId = null;
  pendingCardEl = null;
}

export function bindTaskActions() {
  document.getElementById('btnCancelFinish').addEventListener('click', cancelFinish);
  document.getElementById('btnConfirmFinish').addEventListener('click', confirmFinish);
}