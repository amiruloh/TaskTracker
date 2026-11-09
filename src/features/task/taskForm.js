import { store } from '../../core/store.js';
import { REPEAT_TYPES } from '../../config/constants.js';
import { today } from '../../utils/date.js';
import { addManualTask } from '../../services/taskService.js';
import { toast } from '../../ui/toast.js';

export function toggleRepeatConfig() {
  const val = document.getElementById('tRepeatType').value;
  document.querySelectorAll('[data-repeat]').forEach(el => {
    el.classList.toggle('active', el.dataset.repeat === val);
  });
}

export function bindTaskFormEvents() {
  const form = document.getElementById('taskForm');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (store.state.categories.length === 0) {
      toast('Silahkan buat minimal 1 Kategori terlebih dahulu!', 'error');
      return;
    }

    const title = document.getElementById('tName').value;
    const categoryId = document.getElementById('tCategory').value;
    const notes = document.getElementById('tNotes').value;
    const repeatType = document.getElementById('tRepeatType').value;
    const deadline = document.getElementById('tDeadline').value;

    if (repeatType === REPEAT_TYPES.ONCE) {
      addManualTask({ title, categoryId, notes, date: today(), deadline });
    } 
    else if (repeatType === REPEAT_TYPES.SPECIFIC_DATE) {
      const spDate = document.getElementById('tSpecificDate').value;
      if (!spDate) { toast('Pilih tanggal!', 'error'); return; }
      addManualTask({ title, categoryId, notes, date: spDate, deadline });
    } 
    else {
      // Logika untuk Tugas Berulang (Template)
      const tplId = 'tpl_' + Date.now();
      const tpl = { id: tplId, title, categoryId, notes, repeatType, deadline, createdAt: today() };

      let shouldInstantiateToday = false;
      const todayObj = new Date();

      if (repeatType === REPEAT_TYPES.DAILY) {
        shouldInstantiateToday = true;
      } else if (repeatType === REPEAT_TYPES.INTERVAL) {
        tpl.intervalVal = parseInt(document.getElementById('tInterval').value) || 2;
        shouldInstantiateToday = true;
      } else if (repeatType === REPEAT_TYPES.DAYS) {
        const cbs = document.querySelectorAll('.day-cb:checked');
        tpl.days = Array.from(cbs).map(cb => parseInt(cb.value));
        if (tpl.days.length === 0) { toast('Pilih minimal 1 hari!', 'error'); return; }
        if (tpl.days.includes(todayObj.getDay())) shouldInstantiateToday = true;
      } else if (repeatType === REPEAT_TYPES.MONTHLY_DATE) {
        tpl.monthDay = parseInt(document.getElementById('tMonthDay').value) || 1;
        if (tpl.monthDay === todayObj.getDate()) shouldInstantiateToday = true;
      } else if (repeatType === REPEAT_TYPES.MONTHLY_MULTIPLE) {
        const rawDays = document.getElementById('tMonthDays').value;
        tpl.monthDays = rawDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 1 && d <= 31);
        if (tpl.monthDays.length === 0) { toast('Masukkan minimal 1 tanggal valid (1-31)!', 'error'); return; }
        if (tpl.monthDays.includes(todayObj.getDate())) shouldInstantiateToday = true;
      }

      store.update(state => {
        if (shouldInstantiateToday) {
          tpl.lastGenerated = today();
          state.tasks.push({
            id: 't_' + Date.now() + Math.random().toString(16).slice(2),
            date: today(),
            status: 'pending',
            duration: 0,
            title: tpl.title,
            categoryId: tpl.categoryId,
            notes: tpl.notes,
            templateId: tpl.id,
            deadline: tpl.deadline
          });
        }
        state.templates.push(tpl);
      });
      toast('Tugas berulang disimpan!', 'success');
    }

    // Reset form
    form.reset();
    document.getElementById('tSpecificDate').value = today();
    document.getElementById('tDeadline').value = '';
    toggleRepeatConfig();
    document.getElementById('plannerDate').value = today();
  });

  document.getElementById('tRepeatType').addEventListener('change', toggleRepeatConfig);
}