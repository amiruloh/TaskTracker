/**
 * Modal manager — Promise-based confirm & prompt.
 * Tidak ada global state tersebar; semua dikapsul di sini.
 */
const open = (id) => {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('hidden-modal');
  m.classList.add('active-modal');
};

const close = (id) => {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('hidden-modal');
  m.classList.remove('active-modal');
};

let confirmResolver = null;
let promptResolver = null;

export function confirmDialog(message, { title = 'Konfirmasi', danger = true } = {}) {
  return new Promise((resolve) => {
    confirmResolver = resolve;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    const ok = document.getElementById('btnConfirmOk');
    ok.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    open('confirmModal');
  });
}

export function promptDialog(message, defaultValue = '', { title = 'Edit' } = {}) {
  return new Promise((resolve) => {
    promptResolver = resolve;
    document.getElementById('promptTitle').textContent = title;
    const input = document.getElementById('promptInput');
    input.value = defaultValue;
    open('promptModal');
    setTimeout(() => { input.focus(); input.select(); }, 100);
  });
}

export function openModal(id) { open(id); }
export function closeModal(id) { close(id); }

export function resolveConfirm(result) {
  close('confirmModal');
  confirmResolver?.(result);
  confirmResolver = null;
}

export function resolvePrompt(result) {
  close('promptModal');
  promptResolver?.(result);
  promptResolver = null;
}

export function bindModalEvents() {
  document.getElementById('btnConfirmCancel')
    .addEventListener('click', () => resolveConfirm(false));
  document.getElementById('btnConfirmOk')
    .addEventListener('click', () => resolveConfirm(true));
  document.getElementById('btnPromptCancel')
    .addEventListener('click', () => resolvePrompt(null));
  document.getElementById('btnPromptOk')
    .addEventListener('click', () => resolvePrompt(document.getElementById('promptInput').value));

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => close(btn.dataset.closeModal));
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target !== modal) return;
      if (modal.id === 'confirmModal') resolveConfirm(false);
      else if (modal.id === 'promptModal') resolvePrompt(null);
      else close(modal.id);
    });
  });
}