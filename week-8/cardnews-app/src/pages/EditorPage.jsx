// Editor — Toolbar + [Sidebar + Canvas+Strip / Grid]. Meta chrome.
import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore, selectActiveProject, selectActivePage } from '../store/useProjectStore.js';
import { getVariant, getTemplate } from '../templates/registry.js';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { Toolbar } from '../editor/Toolbar.jsx';
import { Sidebar } from '../editor/Sidebar.jsx';
import { PageThumbStrip } from '../editor/PageThumbStrip.jsx';
import { Canvas } from '../editor/Canvas.jsx';
import { BgPhotoContext } from '../design/primitives.jsx';
import { BlockRenderer } from '../editor/BlockRenderer.jsx';
import { useKeyboard } from '../editor/useKeyboard.js';

export function EditorPage({ projectId }) {
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const proj = useProjectStore(selectActiveProject);
  const page = useProjectStore(selectActivePage);
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const viewMode = useProjectStore((s) => s.viewMode);
  const previewMode = useProjectStore((s) => s.previewMode);

  useEffect(() => {
    if (projectId) setActiveProject(projectId);
  }, [projectId, setActiveProject]);

  useKeyboard();

  if (!proj) {
    return (
      <div className="flex h-screen items-center justify-center bg-meta-canvas">
        <div className="text-center">
          <div className="t-h-sm text-meta-ink-deep">프로젝트를 찾을 수 없어요.</div>
          <button onClick={() => (window.location.hash = '#/')} className="btn btn-primary mt-6">
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-meta-canvas">
      <Toolbar project={proj} />
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'slide' && <PageThumbStrip project={proj} />}
        <main className="flex-1 overflow-auto bg-meta-surface">
          {viewMode === 'slide' ? (
            <SlideView project={proj} page={page} pageIndex={activePageIndex} previewMode={previewMode} />
          ) : (
            <GridView project={proj} previewMode={previewMode} />
          )}
        </main>
        {viewMode === 'slide' && <Sidebar project={proj} page={page} pageIndex={activePageIndex} />}
      </div>
    </div>
  );
}

/* ─── Slide view ─── */
function SlideView({ project, page, pageIndex, previewMode }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.55);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - 80;
      const h = el.clientHeight - 120;
      const s = Math.min(w / CARD_W, h / CARD_H);
      setScale(Math.max(0.2, Math.min(0.85, s)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center text-meta-stone">
        페이지가 없어요. + 버튼으로 추가하세요.
      </div>
    );
  }

  const variant = getVariant(project.templateId, page.variantId);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-auto">
      {!previewMode && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-meta-hairline-soft bg-meta-canvas/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="badge bg-meta-ink-deep text-white">
              {String(pageIndex + 1).padStart(2, '0')} / {String(project.pages.length).padStart(2, '0')}
            </span>
            <span className="t-body-s text-meta-ink-deep font-bold">{variant?.label}</span>
            <span className="t-cap text-meta-stone hidden md:inline">
              · 텍스트를 클릭하면 슬라이드 위에서 바로 편집할 수 있어요
            </span>
          </div>
          <div className="t-cap text-meta-stone mono">{(scale * 100).toFixed(0)}%</div>
        </div>
      )}

      <div className="flex min-h-full items-center justify-center p-10">
        <Canvas project={project} page={page} pageIndex={pageIndex} scale={scale} editable={!previewMode} />
      </div>
    </div>
  );
}

/* ─── Grid view ─── */
function GridView({ project, previewMode }) {
  const setActivePage = useProjectStore((s) => s.setActivePage);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const removePage = useProjectStore((s) => s.removePage);
  const duplicatePage = useProjectStore((s) => s.duplicatePage);
  const movePage = useProjectStore((s) => s.movePage);

  return (
    <div className="p-10">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="t-cap-b text-meta-steel">GRID VIEW · ⌘1 슬라이드</div>
          <h2 className="t-h-lg text-meta-ink-deep mt-1">{project.name}</h2>
        </div>
        <div className="t-cap text-meta-stone">
          {project.pages.length}P · {getTemplate(project.templateId)?.name}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {project.pages.map((page, i) => {
          const variant = getVariant(page.templateId || project.templateId, page.variantId);
          if (!variant) return null;
          const Comp = variant.Component;
          const total = project.pages.length;
          const props = { ...page.props, page: `${i + 1} / ${total}` };
          return (
            <article key={page.id} className="surface-card overflow-hidden">
              <button
                onClick={() => {
                  setActivePage(i);
                  setViewMode('slide');
                }}
                className="relative w-full overflow-hidden rounded-t-[32px] bg-meta-surface text-left"
                style={{ paddingBottom: `${(CARD_H / CARD_W) * 100}%` }}
              >
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: CARD_W,
                      height: CARD_H,
                      transform: `scale(${1 / 3.6})`,
                      transformOrigin: 'top left',
                      position: 'relative',
                    }}
                  >
                    <BgPhotoContext.Provider value={page.props.bgPhoto || null}>
                      <Comp {...props} />
                    </BgPhotoContext.Provider>
                    {page.overlays?.length > 0 && (
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        {page.overlays.map((b) => (
                          <BlockRenderer key={b.id} block={b} scale={1} isSelected={false} onSelect={() => {}} readonly />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="absolute top-3 left-3 badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
              {!previewMode && (
                <div className="flex items-center justify-between gap-2 border-t border-meta-hairline-soft px-3 py-2.5">
                  <span className="t-cap text-meta-steel truncate">{variant.label}</span>
                  <div className="flex gap-1">
                    <IconBtn onClick={() => movePage(i, i - 1)} title="앞으로">▲</IconBtn>
                    <IconBtn onClick={() => movePage(i, i + 1)} title="뒤로">▼</IconBtn>
                    <IconBtn onClick={() => duplicatePage(i)} title="복제">⎘</IconBtn>
                    <IconBtn
                      onClick={() => {
                        if (confirm('이 페이지 삭제할까요?')) removePage(i);
                      }}
                      title="삭제"
                      danger
                    >
                      ×
                    </IconBtn>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        'inline-flex h-6 w-6 items-center justify-center rounded-full border border-meta-hairline text-[11px] font-bold hover:bg-meta-surface ' +
        (danger ? 'text-meta-critical' : 'text-meta-ink')
      }
    >
      {children}
    </button>
  );
}
