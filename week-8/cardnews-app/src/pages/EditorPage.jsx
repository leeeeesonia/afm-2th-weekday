// Editor — Toolbar + [Sidebar + Canvas+Strip / Grid]. Meta chrome.
import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore, selectActiveProject, selectActivePage } from '../store/useProjectStore.js';
import { getVariant, getTemplate } from '../templates/registry.js';
import { CARD_W, CARD_H, CN_THEMES } from '../design/tokens.js';
import { Toolbar } from '../editor/Toolbar.jsx';
import { Sidebar } from '../editor/Sidebar.jsx';
import { PageThumbStrip } from '../editor/PageThumbStrip.jsx';
import { Canvas } from '../editor/Canvas.jsx';
import { BgPhotoContext, ThemeContext } from '../design/primitives.jsx';
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

  // 드래그 정렬 상태
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  function handleDrop(toIndex) {
    if (draggingIndex == null || draggingIndex === toIndex) {
      setDraggingIndex(null);
      setOverIndex(null);
      return;
    }
    movePage(draggingIndex, toIndex);
    setDraggingIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="p-10">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="t-cap-b text-meta-steel">GRID VIEW · ⌘1 슬라이드 · 드래그로 페이지 이동</div>
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
          const total = project.pages.length;
          const themeMode = page.themeMode || 'light';
          const props = { ...page.props, page: project.hidePageNumber ? '' : `${i + 1} / ${total}`, themeMode };
          const thumbBg = themeMode === 'dark' ? CN_THEMES.dark.bg
            : themeMode === 'pastel' ? CN_THEMES.pastel.bg
            : '#fff';
          const isDragging = draggingIndex === i;
          const isOver = overIndex === i && draggingIndex !== null && draggingIndex !== i;
          return (
            <article
              key={page.id}
              draggable
              onDragStart={(e) => {
                setDraggingIndex(i);
                e.dataTransfer.effectAllowed = 'move';
                try { e.dataTransfer.setData('text/plain', String(i)); } catch {}
              }}
              onDragEnter={() => {
                if (draggingIndex !== null) setOverIndex(i);
              }}
              onDragOver={(e) => {
                if (draggingIndex !== null) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (overIndex !== i) setOverIndex(i);
                }
              }}
              onDragLeave={(e) => {
                // 자식으로 들어가는 leave는 무시
                if (e.currentTarget.contains(e.relatedTarget)) return;
                if (overIndex === i) setOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(i);
              }}
              onDragEnd={() => {
                setDraggingIndex(null);
                setOverIndex(null);
              }}
              className={
                'surface-card overflow-hidden transition-all cursor-grab active:cursor-grabbing ' +
                (isDragging ? 'opacity-40 ' : '') +
                (isOver ? 'ring-2 ring-meta-primary scale-[1.01] ' : '')
              }
            >
              <button
                onClick={() => {
                  setActivePage(i);
                  setViewMode('slide');
                }}
                onMouseDown={(e) => {
                  // 드래그 의도와 충돌 방지: 부모 article의 draggable이 작동하도록 native default 유지
                  // (button 자체는 draggable=false라 별도 처리는 불필요)
                }}
                className="relative block w-full overflow-hidden rounded-t-[32px] text-left"
                style={{ aspectRatio: `${CARD_W} / ${CARD_H}`, background: thumbBg }}
              >
                <GridThumb page={page} props={props} variant={variant} themeMode={themeMode} />
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

// 그리드 썸네일 — 부모 너비를 ResizeObserver로 실측해 1080x1350 카드를 정확히 fit
function GridThumb({ page, props, variant, themeMode = 'light' }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / CARD_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const Comp = variant.Component;
  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale || 0.0001})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        <ThemeContext.Provider value={themeMode}>
          <BgPhotoContext.Provider value={page.props.bgPhoto ? { src: page.props.bgPhoto, scale: page.props.bgPhotoScale || 1, position: page.props.bgPhotoPosition || 'center' } : null}>
            <Comp {...props} />
          </BgPhotoContext.Provider>
        </ThemeContext.Provider>
        {page.overlays?.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {page.overlays.map((b) => (
              <BlockRenderer key={b.id} block={b} scale={1} isSelected={false} onSelect={() => {}} readonly />
            ))}
          </div>
        )}
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
