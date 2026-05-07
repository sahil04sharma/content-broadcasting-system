// Lightweight in-browser mock DB backed by localStorage.
// Easy to replace with real HTTP services — see services/http.js.

const KEYS = {
  users: 'cbs_users',
  contents: 'cbs_contents',
  seeded: 'cbs_seeded_v1',
};

export const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];

// Build the demo content list using *current* time so the live page
// always has an active broadcast no matter when the demo is opened.
function buildSeedContents() {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  return [
    {
      id: 'c_1', seed: true,
      teacherId: 'u_teacher_1', teacherName: 'Asha Verma',
      title: 'Algebra Basics', subject: 'Mathematics', description: 'Intro slides',
      fileName: 'algebra.png', fileType: 'image/png',
      fileUrl: placeholderImage('Algebra Basics', '#2a59db'),
      startTime: new Date(now - hour).toISOString(),
      endTime: new Date(now + 3 * hour).toISOString(),
      rotationDuration: 15,
      status: 'approved', rejectionReason: null,
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: 'c_2', seed: true,
      teacherId: 'u_teacher_1', teacherName: 'Asha Verma',
      title: 'Photosynthesis', subject: 'Science', description: 'Lab notes',
      fileName: 'photosynthesis.png', fileType: 'image/png',
      fileUrl: placeholderImage('Photosynthesis', '#16a34a'),
      startTime: new Date(now + hour).toISOString(),
      endTime: new Date(now + 5 * hour).toISOString(),
      rotationDuration: 10,
      status: 'pending', rejectionReason: null,
      createdAt: new Date(now - hour).toISOString(),
    },
    {
      id: 'c_3', seed: true,
      teacherId: 'u_teacher_2', teacherName: 'Rahul Singh',
      title: 'World War II', subject: 'History', description: 'Timeline',
      fileName: 'ww2.png', fileType: 'image/png',
      fileUrl: placeholderImage('World War II', '#b45309'),
      startTime: new Date(now - 3 * hour).toISOString(),
      endTime: new Date(now - hour).toISOString(),
      rotationDuration: 20,
      status: 'rejected', rejectionReason: 'Please add citations.',
      createdAt: new Date(now - 4 * hour).toISOString(),
    },
  ];
}

export function seedMockData() {
  const users = [
    { id: 'u_principal_1', name: 'Dr. Principal', email: 'principal@school.edu', password: 'password', role: 'principal' },
    { id: 'u_teacher_1', name: 'Asha Verma', email: 'teacher@school.edu', password: 'password', role: 'teacher' },
    { id: 'u_teacher_2', name: 'Rahul Singh', email: 'rahul@school.edu', password: 'password', role: 'teacher' },
  ];

  if (!localStorage.getItem(KEYS.seeded)) {
    // First run: insert users + seed contents.
    localStorage.setItem(KEYS.users, JSON.stringify(users));
    localStorage.setItem(KEYS.contents, JSON.stringify(buildSeedContents()));
    localStorage.setItem(KEYS.seeded, '1');
    return;
  }

  // Subsequent runs: refresh ONLY the demo time-windows on seed items so
  // /live always has an active broadcast. Preserve user-driven changes
  // (e.g. principal approvals/rejections) by keeping existing status,
  // rejectionReason, etc. User-uploaded items (no `seed` flag) untouched.
  const existing = JSON.parse(localStorage.getItem(KEYS.contents) || '[]');
  const fresh = buildSeedContents();
  const freshById = new Map(fresh.map((c) => [c.id, c]));
  const seedIds = new Set(freshById.keys());

  // 1) Update existing seed rows in place (refresh times only).
  // 2) Keep user-uploaded rows as-is.
  // 3) Add any seed rows that were missing (e.g. user deleted them).
  const updated = existing.map((c) => {
    if (c.seed || seedIds.has(c.id)) {
      const f = freshById.get(c.id);
      if (!f) return c;
      return {
        ...c,
        seed: true,
        startTime: f.startTime,
        endTime: f.endTime,
        createdAt: f.createdAt,
      };
    }
    return c;
  });
  const presentIds = new Set(updated.map((c) => c.id));
  for (const f of fresh) if (!presentIds.has(f.id)) updated.push(f);

  localStorage.setItem(KEYS.contents, JSON.stringify(updated));
}

function placeholderImage(text, bg = '#3b6ef5') {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 360'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-size='32' font-weight='700'>${escapeXml(text)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

export const db = {
  getUsers() { return JSON.parse(localStorage.getItem(KEYS.users) || '[]'); },
  setUsers(v) { localStorage.setItem(KEYS.users, JSON.stringify(v)); },
  getContents() { return JSON.parse(localStorage.getItem(KEYS.contents) || '[]'); },
  setContents(v) { localStorage.setItem(KEYS.contents, JSON.stringify(v)); },
};

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
