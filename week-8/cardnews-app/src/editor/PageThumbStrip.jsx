// 좌측 페이지 strip — Meta chrome.
import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { getVariant, getTemplate } from '../templates/registry.js';
import { BgPhotoContext } from '../design/primitives.jsx';
import { BlockRenderer } from './BlockRenderer.jsx';

function OverlayPreview({ overlays }) {
  if (!overlays?.length) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {overlays.map((b) => (
        <BlockRenderer key={b.id} block={b} scale={1} isSelected={false} onSelect={() => {}} readonly />
      ))}
    </div>
  );
}

export function PageThumbStrip({ project }) {
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const setActivePage = useProjectStore((s) => s.setActivePage);
  const openLayoutPicker = useProjectStore((s) => s.openLayoutPicker);
  const removePage = useProjectStore((s) => s.removePage);
  const duplicatePage = useProjectStore((s) => s.duplicatePage);
  const movePage = useProjectStore((s) => s.movePage);

  const tpl = getTemplate(project.templateId);
  const total = project.pages.length;

  return (
    <aside className="flex w-[220px] flex-col border-r border-meta-hairline-soft bg-meta-canvas">
      <div className="border-b border-meta-hairline-soft px-5 py-4">
        <div className="t-cap-b text-meta-steel">PAGES</div>
        <div className="t-h-sm text-meta-ink-deep mt-1">{total}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        <ul className="space-y-3">
          {project.pages.map((page, i) => {
            const variant = getVariant(page.templateId || project.templateId, page.variantId);
            if (!variant) return null;
            const Comp = variant.Component;
            const themeMode = page.themeMode || 'light';
            const props = { ...page.props, page: `${i + 1} / ${total}`, themeMode };
            const active = i === activePageIndex;
            const thumbBg = themeMode === 'dark' ? '#0A0A0A' : '#fff';
            return (
              <li key={page.id}>
                <button
                  onClick={() => setActivePage(i)}
                  className={
                    'w-full text-left transition-all rounded-2xl overflow-hidden border ' +
                    (active
                      ? 'border-meta-primary shadow-meta-card'
                      : 'border-meta-hairline-soft hover:border-meta-hairline')
                  }
                  style={{ background: thumbBg }}
                >
                  <div className="relative overflow-hidden" style={{ paddingBottom: `${(CARD_H / CARD_W) * 100}%` }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <div style={{ width: CARD_W, height: CARD_H, transform: 'scale(0.18)', transformOrigin: 'top left', position: 'relative' }}>
                        <BgPhotoContext.Provider value={page.props.bgPhoto || null}>
                          <Comp {...props} />
                        </BgPhotoContext.Provider>
                        <OverlayPreview overlays={page.overlays} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1 border-t border-meta-hairline-soft px-2.5 py-1.5">
                    <span className="mono text-[11px] text-meta-ink-deep">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex items-center gap-0.5">
                      <Mini onClick={(e) => { e.stopPropagation(); movePage(i, i - 1); }} title="위로">▲</Mini>
                      <Mini onClick={(e) => { e.stopPropagation(); movePage(i, i + 1); }} title="아래로">▼</Mini>
                      <Mini onClick={(e) => { e.stopPropagation(); duplicatePage(i); }} title="복제">⎘</Mini>
                      <Mini
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('이 페이지 삭제할까요?')) removePage(i);
                        }}
                        title="삭제"
                        danger
                      >×</Mini>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

      </div>

      <div className="border-t border-meta-hairline-soft p-3">
        <button onClick={() => openLayoutPicker()} className="btn btn-primary w-full">
          + 페이지 추가
        </button>
      </div>
    </aside>
  );
}

function Mini({ children, onClick, title, danger }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e);
      }}
      title={title}
      className={
        'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] cursor-pointer hover:bg-meta-surface ' +
        (danger ? 'text-meta-critical' : 'text-meta-steel')
      }
    >
      {children}
    </span>
  );
}
