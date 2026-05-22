import React, { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { EditorPage } from './pages/EditorPage.jsx';
import { useProjectStore } from './store/useProjectStore.js';
import {
  scheduleProjectSync,
  deleteProjectRemote,
  pullAllFromServer,
  pullProjectDetail,
  flushPending,
} from './lib/sync.js';

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return { route: 'home' };
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'edit' && parts[1]) return { route: 'editor', projectId: parts[1] };
  return { route: 'home' };
}

export default function App() {
  const [r, setR] = useState(parseHash());
  useSyncEngine();
  useEffect(() => {
    const f = () => setR(parseHash());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  if (r.route === 'editor') return <EditorPage projectId={r.projectId} />;
  return <HomePage />;
}

/* ─── 자동 동기 엔진 ─── */
// mount 시 서버 pull + projects 변경 감지 후 자동 PUT/DELETE
function useSyncEngine() {
  useEffect(() => {
    let prev = useProjectStore.getState().projects;

    // 1) mount 시 서버에서 메타데이터 pull → merge
    (async () => {
      try {
        const remote = await pullAllFromServer();
        const local = useProjectStore.getState().projects;
        const localMap = new Map(local.map((p) => [p.id, p]));
        const toLoad = []; // 서버에만 있거나 서버가 더 새 → detail load
        for (const r of remote) {
          const l = localMap.get(r.id);
          if (!l) {
            toLoad.push(r.id);
          } else if (r.updatedAt > (l.updatedAt || 0) + 1000) {
            // 1초 정도 차이는 클라가 더 신선했을 수 있으니 무시
            toLoad.push(r.id);
          }
        }
        // detail load 후 store에 반영
        for (const id of toLoad) {
          try {
            const detail = await pullProjectDetail(id);
            useProjectStore.setState((s) => {
              const idx = s.projects.findIndex((p) => p.id === id);
              if (idx === -1) {
                return { projects: [detail, ...s.projects] };
              }
              const next = s.projects.slice();
              next[idx] = { ...next[idx], ...detail };
              return { projects: next };
            });
          } catch {}
        }
        prev = useProjectStore.getState().projects;
      } catch (e) {
        console.warn('[sync] mount pull failed:', e.message);
      }
    })();

    // 2) projects 변경 감지 → debounced PUT
    const unsubscribe = useProjectStore.subscribe((s) => {
      const curr = s.projects;
      if (curr === prev) return;
      // 추가/수정
      for (const p of curr) {
        const old = prev.find((x) => x.id === p.id);
        if (!old || old.updatedAt !== p.updatedAt) {
          scheduleProjectSync(p);
        }
      }
      // 삭제
      for (const p of prev) {
        if (!curr.find((x) => x.id === p.id)) {
          deleteProjectRemote(p.id);
        }
      }
      prev = curr;
    });

    // 3) 페이지 떠나기 전 pending 즉시 flush
    const onBeforeUnload = () => {
      flushPending();
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);
}
