import { STORAGE_KEY, DEFAULT_CATEGORIES } from '../config/constants.js';

/**
 * Centralized state store dengan pub/sub sederhana.
 */
class Store {
  constructor() {
    this._state = {
      categories: [...DEFAULT_CATEGORIES],
      templates: [],
      tasks: [],
    };
    this._listeners = new Set();
  }

  get state() {
    return this._state;
  }

  /** Replace seluruh state (misal saat import) */
  replace(newState) {
    this._state = {
      categories: newState.categories ?? [],
      templates: newState.templates ?? [],
      tasks: newState.tasks ?? [],
    };
    this._persist();
    this._emit();
  }

  /** Update partial state lewat fungsi mutator */
  update(mutatorFn) {
    mutatorFn(this._state);
    this._persist();
    this._emit();
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _emit() {
    this._listeners.forEach((fn) => fn(this._state));
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (err) {
      console.error('Gagal menyimpan data:', err);
    }
  }

  hydrate() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.replace(parsed);
    } catch (err) {
      console.error('Gagal load data:', err);
    }
  }
}

export const store = new Store();