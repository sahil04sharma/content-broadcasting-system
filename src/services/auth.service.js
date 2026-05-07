import { db, delay } from './mock/db.js';

const TOKEN_KEY = 'cbs_token';
const USER_KEY = 'cbs_user';

// NOTE: This is a mock service-layer. To swap to a real backend,
// replace the bodies with `http.post('/auth/login', ...)` etc.
export const authService = {
  async login({ email, password }) {
    await delay(400);
    const user = db.getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || user.password !== password) {
      const err = new Error('Invalid email or password');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = `mock.${btoa(user.id)}.${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    return { user: safeUser, token };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  getToken() { return localStorage.getItem(TOKEN_KEY); },
};
