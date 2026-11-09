import { store } from '../../core/store.js';
import { escapeHtml } from '../../utils/sanitize.js';

export function openTaskDetail(taskId, templateData = null) {
    const content = document.getElementById('taskDetailContent');
    if (!content) return;

    // Ambil data dari Store
    const task = taskId ? store.state.tasks.find(t => t.id === taskId) : null;
    const sourceData = task || templateData;
    
    // Jika tidak ada data (misal saat pertama load)
    if (!sourceData) {
        content.innerHTML = `
            <div class="empty-state" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0.5;">
                <span class="empty-emoji" style="font-size: 40px; margin-bottom: 16px;">👈</span>
                <p style="text-align: center; color: var(--text-muted);">Klik judul tugas di sebelah kiri untuk melihat detailnya di sini.</p>
            </div>
        `;
        return;
    }

    const cat = store.state.categories.find(c => c.id === sourceData.categoryId);

    // Format tenggat waktu
    let deadlineHtml = '';
    if (sourceData.deadline) {
        const d = new Date(sourceData.deadline);
        deadlineHtml = `
        <div class="detail-group">
            <p class="detail-label">Tenggat Waktu</p>
            <p class="detail-value text-amber-400">⏰ ${d.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>`;
    }

    // Info Selesai
    let completedHtml = '';
    if (task && task.status === 'completed') {
        const cDate = new Date(task.completedAt);
        completedHtml = `
        <div class="detail-group">
            <p class="detail-label">Status</p>
            <p class="detail-value text-emerald-400">✅ Selesai pada ${cDate.toLocaleDateString('id-ID')} (${task.duration} menit)</p>
        </div>`;
    }

    // Info Tugas Berulang
    let recurringHtml = '';
    if (templateData || (task && task.templateId)) {
        recurringHtml = `
        <div class="detail-group">
            <p class="detail-label">Tipe Tugas</p>
            <p class="detail-value">🔄 Tugas Berulang (Rutin)</p>
        </div>`;
    }

    // Render HTML
    content.innerHTML = `
        <div class="detail-group">
            <h3 class="detail-title">${escapeHtml(sourceData.title)}</h3>
            <span class="badge badge-category" style="background-color:${cat?.color || '#64748b'}; font-size: 12px; padding: 4px 10px;">
                ${escapeHtml(cat?.name || 'Tanpa Kategori')}
            </span>
        </div>
        
        <div class="detail-group">
            <p class="detail-label">Tanggal Tugas</p>
            <p class="detail-value">📅 ${task ? task.date : 'Jadwal Masa Depan'}</p>
        </div>

        ${deadlineHtml}
        ${recurringHtml}
        ${completedHtml}

        <div class="detail-group">
            <p class="detail-label">Catatan / Target</p>
            <p class="detail-value" style="white-space: pre-wrap; min-height: 60px;">${escapeHtml(sourceData.notes || 'Tidak ada catatan.')}</p>
        </div>
    `;
}

export function closeTaskDetail() {
    // Fungsi ini sekarang hanya mengosongkan panel (kembali ke teks default)
    const content = document.getElementById('taskDetailContent');
    if (content) {
        content.innerHTML = `
            <div class="empty-state" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0.5;">
                <span class="empty-emoji" style="font-size: 40px; margin-bottom: 16px;">👈</span>
                <p style="text-align: center; color: var(--text-muted);">Klik judul tugas di sebelah kiri untuk melihat detailnya di sini.</p>
            </div>
        `;
    }
}

// Bind tombol close
document.addEventListener('DOMContentLoaded', () => {
    const btnClose = document.getElementById('btnCloseDetail');
    if (btnClose) {
        btnClose.addEventListener('click', closeTaskDetail);
    }
});