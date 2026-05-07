import { db, delay } from './mock/db.js';

export const approvalService = {
  async approve(id) {
    await delay(300);
    const all = db.getContents();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Content not found');
    all[idx] = { ...all[idx], status: 'approved', rejectionReason: null };
    db.setContents(all);
    return all[idx];
  },

  async reject(id, reason) {
    await delay(300);
    if (!reason || !reason.trim()) throw new Error('Rejection reason is required');
    const all = db.getContents();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Content not found');
    all[idx] = { ...all[idx], status: 'rejected', rejectionReason: reason.trim() };
    db.setContents(all);
    return all[idx];
  },
};
