import { store } from '../core/store.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

export function addCategory(name, color) {
  store.update(state => {
    state.categories.push({ id: 'c_' + Date.now(), name, color });
  });
  toast('Kategori ditambahkan!', 'success');
}

export function deleteCategory(id) {
  const ok = confirmDialog('Hapus kategori ini? (Tugas yang sudah memakai kategori ini tidak akan ikut terhapus)', { title: 'Hapus Kategori' });
  if (!ok) return;
  
  store.update(state => {
    state.categories = state.categories.filter(c => c.id !== id);
  });
}