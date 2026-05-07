import { db, delay, uid } from './mock/db.js';
import { authService } from './auth.service.js';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export const contentService = {
  async list({ teacherId, status, search } = {}) {
    await delay(250);
    let items = db.getContents();
    if (teacherId) items = items.filter((c) => c.teacherId === teacherId);
    if (status && status !== 'all') items = items.filter((c) => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          (c.teacherName || '').toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async stats({ teacherId } = {}) {
    await delay(150);
    const items = teacherId
      ? db.getContents().filter((c) => c.teacherId === teacherId)
      : db.getContents();
    return {
      total: items.length,
      pending: items.filter((c) => c.status === 'pending').length,
      approved: items.filter((c) => c.status === 'approved').length,
      rejected: items.filter((c) => c.status === 'rejected').length,
    };
  },

  async create(payload) {
    await delay(500);
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const fileUrl = payload.file ? await fileToDataUrl(payload.file) : null;
    const item = {
      id: uid('c'),
      teacherId: user.id,
      teacherName: user.name,
      title: payload.title,
      subject: payload.subject,
      description: payload.description || '',
      fileName: payload.file?.name || 'file',
      fileType: payload.file?.type || '',
      fileUrl,
      startTime: payload.startTime,
      endTime: payload.endTime,
      rotationDuration: Number(payload.rotationDuration) || 10,
      status: 'pending',
      rejectionReason: null,
      createdAt: new Date().toISOString(),
    };
    const all = db.getContents();
    all.unshift(item);
    db.setContents(all);
    return item;
  },

  async getActiveForTeacher(teacherId) {
    await delay(150);
    const now = Date.now();
    const items = db
      .getContents()
      .filter((c) => c.teacherId === teacherId && c.status === 'approved')
      .filter((c) => new Date(c.startTime).getTime() <= now && new Date(c.endTime).getTime() >= now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items;
  },

  async getUpcomingForTeacher(teacherId, { withinHours = 48 } = {}) {
    await delay(150);
    const now = Date.now();
    const horizon = now + withinHours * 60 * 60 * 1000;
    return db
      .getContents()
      .filter((c) => c.teacherId === teacherId && c.status === 'approved')
      .filter((c) => {
        const s = new Date(c.startTime).getTime();
        return s > now && s <= horizon;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  },
};
