// Zustand 스토어 — 프로젝트 CRUD + 페이지 편집 + 블록(overlays) + 가벼운 undo 스냅샷.
// localStorage 자동 저장 (key: cardnews-store-v1).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { buildDefaultPages, makePage, defaultPropsForVariant, getVariant, getTemplate } from '../templates/registry.js';
import { clampBlock, uniqId } from '../editor/blocks.js';

const HISTORY_LIMIT = 50;
const newId = (prefix = 'p') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// 머릿말/꼬릿말 등 페이지 간 공유되는 키. 한 페이지에서 바꾸면 같은 키 가진 모든 페이지에 자동 적용.
// 요약 페이지 points 변경 → bs-selling-point 페이지들과 동기 + 부족 시 자동 생성
function syncSellingPointsFromSummary(proj, summaryIndex) {
  const summary = proj.pages[summaryIndex];
  const points = summary?.props?.points || [];
  // 기존 bs-selling-point 페이지들 (n=1,2,3,...) 모음
  const existing = proj.pages
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.variantId === 'bs-selling-point')
    .sort((a, b) => (a.p.props.n || 0) - (b.p.props.n || 0));

  // 각 n에 대해 headline 동기
  for (let i = 0; i < points.length; i++) {
    const n = i + 1;
    const hl = points[i].headline || '';
    const found = existing.find(({ p }) => p.props.n === n);
    if (found) {
      if (found.p.props.headline !== hl) found.p.props.headline = hl;
    } else {
      // 자동 생성: 요약 페이지 앞에 삽입
      const variant = getVariant('brand-story', 'bs-selling-point');
      const defaults = {};
      for (const f of variant.fields || []) defaults[f.key] = f.default ?? '';
      const newPage = {
        id: `page-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        variantId: 'bs-selling-point',
        props: { ...defaults, n, headline: hl },
        overlays: [],
      };
      proj.pages.splice(summaryIndex, 0, newPage);
      // summary 인덱스가 변경됨에 따라 summaryIndex 재계산
      summaryIndex = proj.pages.indexOf(summary);
    }
  }
}

// 단일 셀링포인트 페이지의 headline/n 변경 → 요약 페이지의 points 동기
function syncSummaryFromSellingPoint(proj) {
  const summary = proj.pages.find((p) => p.variantId === 'bs-points-summary');
  if (!summary) return;
  if (!Array.isArray(summary.props.points)) summary.props.points = [];
  const sps = proj.pages.filter((p) => p.variantId === 'bs-selling-point');
  // n 값 기준 점 (n=1 → index 0)
  for (const sp of sps) {
    const n = sp.props.n;
    if (typeof n !== 'number' || n < 1) continue;
    while (summary.props.points.length < n) summary.props.points.push({ headline: '' });
    if (summary.props.points[n - 1].headline !== sp.props.headline) {
      summary.props.points[n - 1] = { ...summary.props.points[n - 1], headline: sp.props.headline };
    }
  }
}

const AUTO_SYNC_KEYS = new Set([
  'eyebrow',         // 좌상단 라벨
  'brand',           // 우상단 브랜드 텍스트
  'brandLogo',       // 우상단 브랜드 로고 PNG (Type 2)
  'wordmark',        // @oyatlog 등 우상단 워드마크 (Type 1/3/4)
  'wordmarkLogo',    // 워드마크 자리 PNG (Type 1/3/4)
  'caption',         // 하단 좌측 캡션
  'topRight',        // 우상단 영문 (Type 5)
  'topRightLogo',    // 우상단 PNG (Type 5)
  'pointLabel',      // Selling Point 라벨
  'overviewLabel',   // [OVERVIEW] 라벨
]);

function newProject({ templateId, name, status = 'draft' }) {
  const tpl = getTemplate(templateId);
  return {
    id: newId('proj'),
    name: name || `${tpl?.name ?? '프로젝트'} 초안`,
    templateId,
    status, // 'draft' | 'done'
    pages: buildDefaultPages(templateId),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // ─── State ───
      projects: [],            // 모든 프로젝트
      activeProjectId: null,
      activePageIndex: 0,
      viewMode: 'slide',       // 'slide' | 'grid'
      lastSavedAt: null,
      historyPast: [],         // [{snapshot, label}]
      historyFuture: [],
      previewMode: false,      // export 가이드선 숨김
      selectedBlockIds: [],    // 캔버스 위 선택된 블록 IDs
      layoutPickerOpen: false, // 사이드바를 레이아웃 picker로 전환

      // ─── Helpers ───
      _pushHistory: (label) => {
        const { projects, historyPast } = get();
        const snap = JSON.stringify(projects);
        const next = [...historyPast.slice(-HISTORY_LIMIT + 1), { snap, label, t: Date.now() }];
        set({ historyPast: next, historyFuture: [] });
      },
      undo: () => {
        const { historyPast, historyFuture, projects } = get();
        if (historyPast.length === 0) return;
        const prev = historyPast[historyPast.length - 1];
        const restored = JSON.parse(prev.snap);
        set({
          projects: restored,
          historyPast: historyPast.slice(0, -1),
          historyFuture: [{ snap: JSON.stringify(projects), label: prev.label, t: Date.now() }, ...historyFuture],
        });
      },
      redo: () => {
        const { historyPast, historyFuture, projects } = get();
        if (historyFuture.length === 0) return;
        const next = historyFuture[0];
        const restored = JSON.parse(next.snap);
        set({
          projects: restored,
          historyPast: [...historyPast, { snap: JSON.stringify(projects), label: next.label, t: Date.now() }],
          historyFuture: historyFuture.slice(1),
        });
      },

      // ─── Project CRUD ───
      createProject: ({ templateId, name } = {}) => {
        get()._pushHistory('새 프로젝트');
        const proj = newProject({ templateId, name });
        set(produce((s) => {
          s.projects.unshift(proj);
          s.activeProjectId = proj.id;
          s.activePageIndex = 0;
          s.lastSavedAt = Date.now();
        }));
        return proj.id;
      },

      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return;
        get()._pushHistory('복제');
        const copy = {
          ...JSON.parse(JSON.stringify(src)),
          id: newId('proj'),
          name: `${src.name} (복사본)`,
          status: 'draft',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        copy.pages = copy.pages.map((p) => ({ ...p, id: newId('page') }));
        set(produce((s) => {
          s.projects.unshift(copy);
          s.activeProjectId = copy.id;
          s.activePageIndex = 0;
          s.lastSavedAt = Date.now();
        }));
        return copy.id;
      },

      deleteProject: (id) => {
        get()._pushHistory('삭제');
        set(produce((s) => {
          s.projects = s.projects.filter((p) => p.id !== id);
          if (s.activeProjectId === id) {
            s.activeProjectId = null;
            s.activePageIndex = 0;
          }
          s.lastSavedAt = Date.now();
        }));
      },

      renameProject: (id, name) => {
        get()._pushHistory('이름 변경');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === id);
          if (p) {
            p.name = name;
            p.updatedAt = Date.now();
          }
          s.lastSavedAt = Date.now();
        }));
      },

      setProjectStatus: (id, status) => {
        get()._pushHistory('상태 변경');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === id);
          if (p) {
            p.status = status;
            p.updatedAt = Date.now();
          }
          s.lastSavedAt = Date.now();
        }));
      },

      // ─── Active project / page ───
      setActiveProject: (id) => set({ activeProjectId: id, activePageIndex: 0, selectedBlockIds: [] }),
      setActivePage: (index) => set({ activePageIndex: index, selectedBlockIds: [] }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setPreviewMode: (on) => set({ previewMode: !!on }),

      // ─── Page CRUD ───
      addPage: (variantId, atIndex, templateId) => {
        const proj = get().projects.find((p) => p.id === get().activeProjectId);
        if (!proj) return;
        get()._pushHistory('페이지 추가');
        const tplId = templateId || proj.templateId;
        const page = makePage(tplId, variantId);
        // 다른 템플릿의 variant를 가져온 경우 페이지에 templateId 저장 (렌더 시 override)
        if (tplId !== proj.templateId) page.templateId = tplId;
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          const idx = typeof atIndex === 'number' ? atIndex : p.pages.length;
          p.pages.splice(idx, 0, page);
          p.updatedAt = Date.now();
          s.activePageIndex = idx;
          s.lastSavedAt = Date.now();
          s.layoutPickerOpen = false;
        }));
      },

      duplicatePage: (index) => {
        get()._pushHistory('페이지 복제');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p || !p.pages[index]) return;
          const src = p.pages[index];
          const copy = { ...JSON.parse(JSON.stringify(src)), id: newId('page') };
          p.pages.splice(index + 1, 0, copy);
          p.updatedAt = Date.now();
          s.activePageIndex = index + 1;
          s.lastSavedAt = Date.now();
        }));
      },

      removePage: (index) => {
        get()._pushHistory('페이지 삭제');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p || !p.pages[index]) return;
          p.pages.splice(index, 1);
          p.updatedAt = Date.now();
          if (s.activePageIndex >= p.pages.length) {
            s.activePageIndex = Math.max(0, p.pages.length - 1);
          }
          s.lastSavedAt = Date.now();
        }));
      },

      movePage: (from, to) => {
        get()._pushHistory('페이지 순서 변경');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          if (to < 0 || to >= p.pages.length) return;
          const [moved] = p.pages.splice(from, 1);
          p.pages.splice(to, 0, moved);
          p.updatedAt = Date.now();
          s.activePageIndex = to;
          s.lastSavedAt = Date.now();
        }));
      },

      changeVariant: (pageIndex, variantId) => {
        const proj = get().projects.find((p) => p.id === get().activeProjectId);
        if (!proj) return;
        const newVariant = getVariant(proj.templateId, variantId);
        if (!newVariant) return;
        get()._pushHistory('variant 변경');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          const oldProps = p.pages[pageIndex].props || {};
          // 같은 key는 유지, 새 키는 default
          const merged = { ...defaultPropsForVariant(newVariant) };
          for (const k of Object.keys(merged)) {
            if (oldProps[k] !== undefined && oldProps[k] !== '') merged[k] = oldProps[k];
          }
          p.pages[pageIndex].variantId = variantId;
          p.pages[pageIndex].props = merged;
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      // 페이지 themeMode 토글 ('light' ↔ 'dark')
      setPageTheme: (pageIndex, mode) => {
        get()._pushHistory('테마 변경');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p || !p.pages[pageIndex]) return;
          p.pages[pageIndex].themeMode = mode;
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      // 프로젝트 전체 themeMode 일괄 적용
      applyThemeAllPages: (mode) => {
        get()._pushHistory('테마 일괄');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          for (const page of p.pages) page.themeMode = mode;
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      updatePageProp: (pageIndex, key, value, opts = {}) => {
        if (opts.commit) get()._pushHistory(`편집 · ${key}`);
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p || !p.pages[pageIndex]) return;
          const cur = p.pages[pageIndex];
          cur.props[key] = value;
          // AUTO_SYNC: 같은 키 가진 모든 페이지에 자동 적용
          if (AUTO_SYNC_KEYS.has(key)) {
            for (const page of p.pages) {
              if (page.props && Object.prototype.hasOwnProperty.call(page.props, key)) {
                page.props[key] = value;
              }
            }
          }
          // Selling Points 양방향 동기
          if (key === 'points' && cur.variantId === 'bs-points-summary') {
            syncSellingPointsFromSummary(p, pageIndex);
          }
          if ((key === 'headline' || key === 'n') && cur.variantId === 'bs-selling-point') {
            syncSummaryFromSellingPoint(p);
          }
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      // ─── Blocks (overlays) CRUD ───
      addBlock: (block) => {
        get()._pushHistory('블록 추가');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          const page = p.pages[s.activePageIndex];
          if (!page) return;
          if (!page.overlays) page.overlays = [];
          page.overlays.push(block);
          p.updatedAt = Date.now();
          s.selectedBlockIds = [block.id];
          s.lastSavedAt = Date.now();
        }));
      },

      updateBlock: (blockId, updates, opts = {}) => {
        if (opts.commit) get()._pushHistory('블록 편집');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          const page = p.pages[s.activePageIndex];
          if (!page?.overlays) return;
          const b = page.overlays.find((x) => x.id === blockId);
          if (!b) return;
          // props는 머지(기존 키 보존), 나머지 top-level 키만 덮어씀.
          // BUG-FIX: 과거에는 Object.assign으로 props 전체를 통째로 교체해 border/borderRadius/objectPosition 등이 유실됐음.
          const { props: nextProps, ...rest } = updates;
          Object.assign(b, rest);
          if (nextProps) b.props = { ...(b.props || {}), ...nextProps };
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      removeBlocks: (blockIds) => {
        get()._pushHistory('블록 삭제');
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          const page = p.pages[s.activePageIndex];
          if (!page?.overlays) return;
          page.overlays = page.overlays.filter((b) => !blockIds.includes(b.id));
          s.selectedBlockIds = s.selectedBlockIds.filter((id) => !blockIds.includes(id));
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      duplicateBlocks: (blockIds) => {
        get()._pushHistory('블록 복제');
        const newIds = [];
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          const page = p.pages[s.activePageIndex];
          if (!page?.overlays) return;
          for (const id of blockIds) {
            const src = page.overlays.find((b) => b.id === id);
            if (!src) continue;
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = uniqId('blk');
            copy.x = (src.x || 0) + 20;
            copy.y = (src.y || 0) + 20;
            page.overlays.push(copy);
            newIds.push(copy.id);
          }
          s.selectedBlockIds = newIds;
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },

      bringForward: (blockIds) => {
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          const page = p?.pages[s.activePageIndex];
          if (!page?.overlays) return;
          for (const id of blockIds) {
            const b = page.overlays.find((x) => x.id === id);
            if (b) b.z = (b.z || 0) + 1;
          }
        }));
      },
      sendBackward: (blockIds) => {
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          const page = p?.pages[s.activePageIndex];
          if (!page?.overlays) return;
          for (const id of blockIds) {
            const b = page.overlays.find((x) => x.id === id);
            if (b) b.z = (b.z || 0) - 1;
          }
        }));
      },

      openLayoutPicker: () => set({ layoutPickerOpen: true }),
      closeLayoutPicker: () => set({ layoutPickerOpen: false }),

      setSelectedBlocks: (ids) => set({ selectedBlockIds: ids }),
      toggleSelectBlock: (id) => set((s) => ({
        selectedBlockIds: s.selectedBlockIds.includes(id)
          ? s.selectedBlockIds.filter((x) => x !== id)
          : [...s.selectedBlockIds, id],
      })),
      clearSelection: () => set({ selectedBlockIds: [] }),

      // 모든 페이지 일괄 props 변경 (예: 워드마크 전역 변경, 전체 배경 사진 일괄)
      // 키가 없는 페이지에도 생성해서 set한다. (bgPhoto처럼 universal 필드 일괄 적용 케이스를 지원)
      applyToAllPages: (key, value) => {
        get()._pushHistory(`일괄 · ${key}`);
        set(produce((s) => {
          const p = s.projects.find((x) => x.id === s.activeProjectId);
          if (!p) return;
          for (const page of p.pages) {
            if (!page.props) page.props = {};
            page.props[key] = value;
          }
          p.updatedAt = Date.now();
          s.lastSavedAt = Date.now();
        }));
      },
    }),
    {
      name: 'cardnews-store-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        projects: s.projects,
        activeProjectId: s.activeProjectId,
        activePageIndex: s.activePageIndex,
        viewMode: s.viewMode,
      }),
    },
  ),
);

// ─── Selectors ───
export const selectActiveProject = (s) => s.projects.find((p) => p.id === s.activeProjectId) || null;
export const selectActivePage = (s) => {
  const proj = selectActiveProject(s);
  if (!proj) return null;
  return proj.pages[s.activePageIndex] || null;
};
