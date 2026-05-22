// 자동 동기 매니저 — debounce 2s 후 서버 PUT.
// 같은 프로젝트의 연속 변경은 단일 PUT으로 통합.
import { apiSaveProject, apiDeleteProject, apiListProjects, apiLoadProject } from './api.js';

const SAVE_DEBOUNCE_MS = 2000;
const timers = new Map(); // projectId → timeoutId
const pending = new Map(); // projectId → 최신 project 스냅샷

const statusListeners = new Set();
let currentStatus = { phase: 'idle' }; // 'idle' | 'syncing' | 'saved' | 'error'

export function onSyncStatus(fn) {
  statusListeners.add(fn);
  fn(currentStatus);
  return () => statusListeners.delete(fn);
}
function emit(s) {
  currentStatus = s;
  for (const fn of statusListeners) fn(s);
}

export function scheduleProjectSync(project) {
  pending.set(project.id, project);
  if (timers.has(project.id)) clearTimeout(timers.get(project.id));
  const t = setTimeout(async () => {
    timers.delete(project.id);
    const proj = pending.get(project.id);
    pending.delete(project.id);
    if (!proj) return;
    try {
      emit({ phase: 'syncing', id: proj.id });
      await apiSaveProject(proj);
      emit({ phase: 'saved', id: proj.id, t: Date.now() });
    } catch (e) {
      emit({ phase: 'error', id: proj.id, error: e.message });
    }
  }, SAVE_DEBOUNCE_MS);
  timers.set(project.id, t);
}

export async function deleteProjectRemote(id) {
  // pending이 있으면 취소
  if (timers.has(id)) clearTimeout(timers.get(id));
  timers.delete(id);
  pending.delete(id);
  try {
    emit({ phase: 'syncing', id });
    await apiDeleteProject(id);
    emit({ phase: 'saved', id, t: Date.now() });
  } catch (e) {
    emit({ phase: 'error', id, error: e.message });
  }
}

// 즉시 flush (페이지 떠나기 전 등)
export async function flushPending() {
  const ids = Array.from(pending.keys());
  for (const id of ids) {
    if (timers.has(id)) clearTimeout(timers.get(id));
    timers.delete(id);
  }
  const projects = ids.map((id) => pending.get(id));
  pending.clear();
  for (const proj of projects) {
    if (!proj) continue;
    try {
      await apiSaveProject(proj);
    } catch {}
  }
}

// 서버에서 모든 메타데이터 가져옴 (mount 시 호출)
export async function pullAllFromServer() {
  const { projects = [] } = await apiListProjects();
  // 서버 응답은 snake_case → camelCase 매핑 + Date 정규화
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    templateId: p.template_id,
    status: p.status,
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
    _serverMeta: true,
  }));
}

// 단일 프로젝트 detail 로드
export async function pullProjectDetail(id) {
  const { project } = await apiLoadProject(id);
  const d = project.data || {};
  return {
    id: project.id,
    name: project.name,
    templateId: project.templateId,
    status: project.status,
    pages: d.pages || [],
    createdAt: new Date(project.createdAt).getTime(),
    updatedAt: new Date(project.updatedAt).getTime(),
  };
}
