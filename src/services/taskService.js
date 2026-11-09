import { store } from '../core/store.js';
import { today } from '../utils/date.js';
import { toast } from '../ui/toast.js';
import { fireConfetti } from '../ui/confetti.js';

export function addManualTask({ title, categoryId, notes, date, deadline }) {
  store.update(state => {
    state.tasks.push({
      id: 't_' + Date.now() + Math.random().toString(16).slice(2),
      date: date || today(),
      status: 'pending',
      duration: 0,
      title,
      categoryId,
      notes,
      deadline
    });
  });
  toast('Tugas disimpan!', 'success');
}

export function completeTask(taskId, duration, finishDateStr) {
  store.update(state => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = 'completed';
    task.duration = duration;
    
    let completedAt;
    if (finishDateStr) {
      const fd = new Date(finishDateStr + 'T00:00:00');
      const now = new Date();
      fd.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      completedAt = fd.toISOString();
    } else {
      completedAt = new Date().toISOString();
    }
    task.completedAt = completedAt;
  });

  fireConfetti();
  toast('Log tercatat! 🎉', 'success');
}

export function undoTask(taskId) {
  store.update(state => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'pending';
      task.duration = 0;
      delete task.completedAt;
    }
  });
}