// Toolbar — Meta chrome
import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { exportPagesToZip, exportPageToImage } from '../export/exportImage.js';
import { TEMPLATES } from '../templates/registry.js';
import { newTextBlock, newImageBlock, newStickerBlock, newShapeBlock } from './blocks.js';
import { STICKER_REGISTRY } from '../design/stickers.jsx';
import { onSyncStatus } from '../lib/sync.js';

export function Toolbar({ project }) {
  const renameProject = useProjectStore((s) => s.renameProject);
  const setStatus = useProjectStore((s) => s.setProjectStatus);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const setPreviewMode = useProjectStore((s) => s.setPreviewMode);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const historyPast = useProjectStore((s) => s.historyPast);
  const historyFuture = useProjectStore((s) => s.historyFuture);
  const viewMode = useProjectStore((s) => s.viewMode);
  const previewMode = useProjectStore((s) => s.previewMode);
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt);
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const setPageTheme = useProjectStore((s) => s.setPageTheme);
  const applyThemeAllPages = useProjectStore((s) => s.applyThemeAllPages);
  const activeTheme = project.pages[activePageIndex]?.themeMode || 'light';
  const [name, setName] = useState(project.name);
  useEffect(() => setName(project.name), [project.id, project.name]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);
  const savedAgo = lastSavedAt ? Math.max(1, Math.round((now - lastSavedAt) / 1000)) : null;

  // 서버 동기 상태
  const [syncStatus, setSyncStatus] = useState({ phase: 'idle' });
  useEffect(() => onSyncStatus(setSyncStatus), []);
  const serverAgo = syncStatus.t ? Math.max(1, Math.round((now - syncStatus.t) / 1000)) : null;
  const serverLabel = syncStatus.phase === 'syncing'
    ? 'syncing…'
    : syncStatus.phase === 'error'
    ? '⚠ ' + (syncStatus.error || 'sync failed')
    : serverAgo
    ? `synced ${serverAgo}s ago`
    : 'idle';
  const tpl = TEMPLATES.find((t) => t.id === project.templateId);

  async function handleExportAll(scale = 2) {
    await exportPagesToZip(project, scale);
  }
  async function handleExportCurrent(scale = 2) {
    const idx = useProjectStore.getState().activePageIndex;
    const pageId = project.pages[idx]?.id;
    if (!pageId) return;
    await exportPageToImage(pageId, scale, `${project.name}-${String(idx + 1).padStart(2, '0')}`);
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-meta-hairline-soft bg-meta-canvas px-6 py-3">
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={() => (window.location.hash = '#/')} className="btn-icon-circle btn" title="홈">
          <span className="text-[18px] leading-none">←</span>
        </button>
        <div className="flex flex-col min-w-0">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== project.name && renameProject(project.id, name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setName(project.name);
                e.currentTarget.blur();
              }
            }}
            className="t-st-lg bg-transparent text-meta-ink-deep focus:outline-none w-[360px] max-w-full"
          />
          <div className="t-cap text-meta-steel mt-0.5">
            {tpl?.name} · {project.pages.length} pages
            {savedAgo !== null && <span className="ml-2 text-meta-stone">local {savedAgo}s ago</span>}
            <span
              className={
                'ml-2 ' +
                (syncStatus.phase === 'error' ? 'text-meta-critical' : syncStatus.phase === 'syncing' ? 'text-meta-primary' : 'text-meta-stone')
              }
              title="서버 동기 상태"
            >
              · {serverLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={undo} disabled={historyPast.length === 0} className="btn-icon-circle btn" title="실행 취소 (⌘Z)">
          ↶
        </button>
        <button onClick={redo} disabled={historyFuture.length === 0} className="btn-icon-circle btn" title="다시 실행 (⌘⇧Z)">
          ↷
        </button>

        <div className="mx-1 h-7 w-px bg-meta-hairline" />

        <AddBlockMenu />

        <div className="mx-1 h-7 w-px bg-meta-hairline" />

        <button
          onClick={() => setViewMode('slide')}
          className={'pill-tab ' + (viewMode === 'slide' ? 'is-active' : '')}
          title="슬라이드 뷰 (⌘1)"
        >
          슬라이드
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={'pill-tab ' + (viewMode === 'grid' ? 'is-active' : '')}
          title="그리드 뷰 (⌘2)"
        >
          그리드
        </button>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={'pill-tab ' + (previewMode ? 'is-active' : '')}
          title="미리보기 (P)"
        >
          미리보기
        </button>

        <div className="mx-1 h-7 w-px bg-meta-hairline" />

        <ThemeToggle
          mode={activeTheme}
          onToggle={() => setPageTheme(activePageIndex, activeTheme === 'dark' ? 'light' : 'dark')}
          onApplyAll={() => applyThemeAllPages(activeTheme)}
        />

        <div className="mx-1 h-7 w-px bg-meta-hairline" />

        <button
          onClick={() => setStatus(project.id, project.status === 'draft' ? 'done' : 'draft')}
          className={'pill-tab ' + (project.status === 'done' ? 'is-active' : '')}
          title="작업중 ↔ 완료"
        >
          {project.status === 'done' ? '완료' : '작업중'}
        </button>

        <ExportMenu onCurrent={handleExportCurrent} onAll={handleExportAll} />
      </div>
    </header>
  );
}

function AddBlockMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('basic');
  const addBlock = useProjectStore((s) => s.addBlock);

  function add(b) {
    addBlock(b);
    setOpen(false);
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn btn-secondary" title="블록 추가">
        + 블록
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-[320px] surface-card overflow-hidden"
          style={{ zIndex: 100 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex border-b border-meta-hairline-soft">
            {[
              { k: 'basic', label: '기본' },
              { k: 'sticker', label: '스티커' },
            ].map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTab(t.k);
                }}
                className={
                  'flex-1 px-3 py-2.5 t-body-s-b ' +
                  (tab === t.k ? 'bg-meta-surface text-meta-ink-deep' : 'text-meta-steel hover:bg-meta-surface')
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'basic' && (
            <div className="p-3 grid grid-cols-2 gap-2">
              <BlockBtn onClick={() => add(newTextBlock())}>T · 텍스트</BlockBtn>
              <BlockBtn onClick={() => add(newImageBlock())}>🖼 · 이미지</BlockBtn>
              <BlockBtn onClick={() => add(newShapeBlock())}>▣ · 네온 박스</BlockBtn>
              <BlockBtn onClick={() => add(newShapeBlock({ fill: '#FFFABA' }))}>▣ · 레몬 박스</BlockBtn>
            </div>
          )}
          {tab === 'sticker' && (
            <div className="p-3 grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto no-scrollbar">
              {STICKER_REGISTRY.map((s) => (
                <BlockBtn key={s.kind} onClick={() => add(newStickerBlock(s.kind, s.defaults || {}))}>
                  {s.label}
                </BlockBtn>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ mode, onToggle, onApplyAll }) {
  const [open, setOpen] = useState(false);
  const isDark = mode === 'dark';
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        title={`현재 페이지 ${isDark ? '라이트' : '다크'}로 전환 (우클릭: 전체 적용)`}
        className={'pill-tab ' + (isDark ? 'is-active' : '')}
      >
        {isDark ? '🌙 다크' : '☀ 라이트'}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="ml-1.5 inline-flex items-center text-meta-stone hover:text-meta-ink"
          title="옵션"
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-[220px] surface-card overflow-hidden"
          style={{ zIndex: 100 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onApplyAll();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-3 t-body-s-b text-meta-ink-deep hover:bg-meta-surface border-b border-meta-hairline-soft"
          >
            모든 페이지에 {isDark ? '🌙 다크' : '☀ 라이트'} 적용
          </button>
          <div className="px-4 py-2.5 t-cap text-meta-stone">
            💡 클릭 = 현재 페이지만 토글
            <br />우클릭 = 옵션 열기
          </div>
        </div>
      )}
    </div>
  );
}

function BlockBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="border border-meta-hairline-soft rounded-xl px-3 py-2.5 t-body-s-b text-meta-ink-deep hover:bg-meta-surface text-left"
    >
      {children}
    </button>
  );
}

function ExportMenu({ onCurrent, onAll }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn btn-buy">
        ⤓ Export
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[300px] surface-card overflow-hidden">
          <div className="border-b border-meta-hairline-soft p-4">
            <div className="t-cap-b text-meta-steel mb-2">해상도</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={'pill-tab flex-1 ' + (scale === s ? 'is-active' : '')}
                >
                  {s}x · {1080 * s}
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onCurrent(scale);
              setBusy(false);
              setOpen(false);
            }}
            className="block w-full px-5 py-3 text-left t-body-s-b text-meta-ink-deep hover:bg-meta-surface disabled:opacity-50 border-b border-meta-hairline-soft"
          >
            현재 페이지 JPG 저장
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onAll(scale);
              setBusy(false);
              setOpen(false);
            }}
            className="block w-full px-5 py-3 text-left t-body-s-b text-meta-ink-deep hover:bg-meta-surface disabled:opacity-50"
          >
            전체 JPG 일괄 (ZIP)
          </button>
          {busy && <div className="px-5 py-2 t-cap text-meta-steel">⏳ 렌더링 중…</div>}
        </div>
      )}
    </div>
  );
}
