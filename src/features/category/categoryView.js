import { store } from '../../core/store.js';
import { addCategory, deleteCategory } from '../../services/categoryService.js';
import { openModal, closeModal, promptDialog } from '../../ui/modal.js';
import { escapeHtml } from '../../utils/sanitize.js';

let selectedCatColor = '#10b981';

export function renderCategories() {
  const list = document.getElementById('categoryList');
  const select = document.getElementById('tCategory');
  const filter = document.getElementById('categoryFilter');
  
  if (!list || !select || !filter) return;

  const currentFilter = filter.value;
  list.innerHTML = '';
  select.innerHTML = '';
  filter.innerHTML = '<option value="all">Semua Kategori</option>';

  store.state.categories.forEach(cat => {
    // Render Chip
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.backgroundColor = cat.color;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'chip-name';
    nameSpan.textContent = cat.name;
    // Implement editCategory manually via promptDialog or skip for now
    
    const delBtn = document.createElement('button');
    delBtn.className = 'chip-delete';
    delBtn.innerHTML = '&times;';
    delBtn.onclick = (e) => { e.stopPropagation(); deleteCategory(cat.id); };
    
    chip.appendChild(nameSpan);
    chip.appendChild(delBtn);
    list.appendChild(chip);

    // Render Dropdown
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);

    const fOpt = document.createElement('option');
    fOpt.value = cat.id;
    fOpt.textContent = cat.name;
    filter.appendChild(fOpt);
  });

  filter.value = currentFilter;
}

export function bindCategoryEvents() {
  document.getElementById('btnAddCategory').onclick = () => openModal('catModal');
  
  document.getElementById('btnSaveCategory').onclick = () => {
    const name = document.getElementById('cName').value.trim();
    if (!name) return;
    addCategory(name, selectedCatColor);
    document.getElementById('cName').value = '';
    closeModal('catModal');
  };

  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.onclick = () => {
      selectedCatColor = swatch.dataset.color;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
    };
  });
}