import { store } from '../../core/store.js';
import { today } from '../../utils/date.js';
import { toast } from '../../ui/toast.js';
import { backfillRecurring } from '../../services/recurringService.js';

export function exportData() {
  const dataStr = JSON.stringify(store.state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_activity_backup_${today()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup berhasil diunduh.', 'success');
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.categories && parsed.tasks) {
        store.replace(parsed);
        store.update(s => backfillRecurring(s));
        toast('Data berhasil dipulihkan!', 'success');
      } else {
        toast('Format JSON tidak valid.', 'error');
      }
    } catch (err) {
      toast('Error membaca file JSON.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}