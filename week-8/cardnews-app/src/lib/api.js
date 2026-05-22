// 서버 API fetch wrapper. dev에선 vite proxy(/api → :3001), prod에선 같은 origin.
const BASE = '';

async function jsonFetch(url, options = {}) {
  const r = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return r.json();
}

export async function apiListProjects() {
  return jsonFetch('/api/projects');
}

export async function apiLoadProject(id) {
  return jsonFetch(`/api/projects/${id}`);
}

export async function apiSaveProject(p) {
  return jsonFetch(`/api/projects/${p.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: p.name,
      templateId: p.templateId,
      status: p.status,
      data: {
        pages: p.pages,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    }),
  });
}

export async function apiDeleteProject(id) {
  return jsonFetch(`/api/projects/${id}`, { method: 'DELETE' });
}
