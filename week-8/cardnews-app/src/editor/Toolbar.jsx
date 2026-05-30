// Toolbar — Meta chrome
import React, { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { exportPagesToZip, exportPageToImage, exportPageToPng } from '../export/exportImage.js';
import { TEMPLATES } from '../templates/registry.js';
import { newTextBlock, newImageBlock, newStickerBlock, newLineBlock } from './blocks.js';
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
  const guideMode = useProjectStore((s) => s.guideMode);
  const setGuideMode = useProjectStore((s) => s.setGuideMode);
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
  async function handleExportCurrentPng(scale = 2, transparent = false) {
    const idx = useProjectStore.getState().activePageIndex;
    const pageId = project.pages[idx]?.id;
    if (!pageId) return;
    await exportPageToPng(pageId, scale, `${project.name}-${String(idx + 1).padStart(2, '0')}`, transparent);
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

        {/* 가이드 — 안전 영역(84px bleed) 네온 표시. 토글. */}
        <button
          onClick={() => setGuideMode(!guideMode)}
          className={'pill-tab ' + (guideMode ? 'is-active' : '')}
          title="안전 영역 가이드 (84px bleed)"
        >
          가이드
        </button>

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
          onSet={(m) => setPageTheme(activePageIndex, m)}
          onApplyAllAs={(m) => applyThemeAllPages(m)}
        />

        <div className="mx-1 h-7 w-px bg-meta-hairline" />

        <button
          onClick={() => setStatus(project.id, project.status === 'draft' ? 'done' : 'draft')}
          className={'pill-tab ' + (project.status === 'done' ? 'is-active' : '')}
          title="작업중 ↔ 완료"
        >
          {project.status === 'done' ? '완료' : '작업중'}
        </button>

        <ExportMenu onCurrent={handleExportCurrent} onCurrentPng={handleExportCurrentPng} onAll={handleExportAll} />
      </div>
    </header>
  );
}

// 미리보기 박스 — 기존 300×220 → 약 70% (210×154)
const PREVIEW_W = 210;
const PREVIEW_INNER_W = 188;
const PREVIEW_INNER_H = 126;
const PREVIEW_PAD = 12;
// 라벨(14) + mb-2(8) + 상하 패딩 + 내부 박스 → 전체 ≈ 172
const PREVIEW_H = PREVIEW_PAD * 2 + 14 + 8 + PREVIEW_INNER_H;

function AddBlockMenu() {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('basic');
  // hoverState: { kind, top } — top은 wrapper 기준 상대 px (호버된 행 중앙에 미리보기 중앙 정렬)
  const [hoverState, setHoverState] = useState({ kind: null, top: 0 });
  const addBlock = useProjectStore((s) => s.addBlock);

  function add(b) {
    addBlock(b);
    setOpen(false);
    setHoverState({ kind: null, top: 0 });
  }

  function onRowEnter(e, kind) {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) {
      setHoverState({ kind, top: 0 });
      return;
    }
    const wrapperRect = wrapperEl.getBoundingClientRect();
    const rowRect = e.currentTarget.getBoundingClientRect();
    const rowCenterY = rowRect.top + rowRect.height / 2;
    // 행 중앙에 미리보기 카드 중앙 맞춤 — wrapper top 기준
    const desired = rowCenterY - wrapperRect.top - PREVIEW_H / 2;
    setHoverState({ kind, top: Math.max(8, desired) });
  }
  function onRowLeave(kind) {
    setHoverState((s) => (s.kind === kind ? { kind: null, top: 0 } : s));
  }

  const hoveredEntry = hoverState.kind ? STICKER_REGISTRY.find((s) => s.kind === hoverState.kind) : null;
  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn btn-secondary" title="블록 추가">
        + 블록
      </button>
      {open && (
        <>
          <div
            className="absolute right-0 mt-2 w-[320px] surface-card overflow-hidden"
            style={{ zIndex: 100 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex border-b border-meta-hairline-soft">
              {[
                { k: 'basic', label: '기본' },
                { k: 'sticker', label: '단일블록' },
              ].map((t) => (
                <button
                  key={t.k}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTab(t.k);
                    setHoverState({ kind: null, top: 0 });
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
                <BlockBtn onClick={() => add(newLineBlock({ style: 'solid' }))}>━●  실선</BlockBtn>
                <BlockBtn onClick={() => add(newLineBlock({ style: 'dashed' }))}>┄●  점선</BlockBtn>
              </div>
            )}
            {tab === 'sticker' && (
              <div className="p-3 grid grid-cols-1 gap-1.5 max-h-[320px] overflow-y-auto no-scrollbar">
                {STICKER_REGISTRY.map((s) => (
                  <div
                    key={s.kind}
                    onMouseEnter={(e) => onRowEnter(e, s.kind)}
                    onMouseLeave={() => onRowLeave(s.kind)}
                  >
                    <BlockBtn onClick={() => add(newStickerBlock(s.kind, s.defaults || {}))}>
                      {s.label}
                    </BlockBtn>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 스티커 호버 미리보기 — 행 중앙에 따라 세로 이동, 메뉴 왼쪽 고정 */}
          {tab === 'sticker' && hoveredEntry && (
            <div
              className="absolute surface-card pointer-events-none"
              style={{
                right: 332,
                top: hoverState.top,
                zIndex: 101,
                width: PREVIEW_W,
                padding: PREVIEW_PAD,
                background: '#fff',
                transition: 'top 120ms ease-out',
              }}
            >
              <div className="t-cap-b text-meta-steel mb-2">{hoveredEntry.label}</div>
              <div
                style={{
                  width: PREVIEW_INNER_W,
                  height: PREVIEW_INNER_H,
                  background: '#FAFAFA',
                  border: '1px solid #ECECEC',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <StickerPreviewBody entry={hoveredEntry} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 호버 미리보기 본체 — 스티커 종류별 자연 크기에 맞춰 통일된 scale 적용
function StickerPreviewBody({ entry }) {
  const Comp = entry.Component;
  // 스티커별 미리보기 scale — 작은 스티커는 키우고 큰 스티커는 줄여 통일감
  // 박스가 약 30% 축소됨에 따라 안쪽 스티커도 0.7배 축소 (비율 유지)
  const SCALE = {
    questionBox: 0.32,
    questionMiddle: 0.22,
    standardMiddle: 0.20,
    subFrame: 0.42,
    subInfo: 0.30,
    subSticker: 0.7,
  };
  const s = SCALE[entry.kind] ?? 0.5;
  return (
    <div style={{ transform: `scale(${s})`, transformOrigin: 'center', display: 'inline-block' }}>
      <Comp {...(entry.defaults || {})} />
    </div>
  );
}

// 단일 버튼 — 현재 페이지 모드를 표시. 클릭 시 드랍다운에서 모드 × (단일/전체) 6개 선택.
function ThemeToggle({ mode, onSet, onApplyAllAs }) {
  const [open, setOpen] = useState(false);
  const MODES = [
    { v: 'light', label: '라이트', emoji: '☀' },
    { v: 'pastel', label: '파스텔', emoji: '🌫' },
    { v: 'dark', label: '다크', emoji: '🌙' },
  ];
  const current = MODES.find((m) => m.v === mode) || MODES[0];
  // 외부 클릭 시 닫기
  React.useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (!e.target.closest('[data-theme-menu]')) setOpen(false);
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);
  return (
    <div className="relative" data-theme-menu>
      <button
        onClick={() => setOpen((o) => !o)}
        className={'pill-tab ' + (open ? 'is-active' : '')}
        title="무드 변경"
      >
        {current.emoji} {current.label}
        <span className="ml-1.5 text-meta-stone">▾</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[300px] surface-card overflow-hidden"
          style={{ zIndex: 100 }}
        >
          <div className="px-4 py-2.5 t-cap-b text-meta-steel border-b border-meta-hairline-soft">
            무드 — 단일 / 전체
          </div>
          {MODES.map((t) => {
            const active = mode === t.v;
            return (
              <div key={t.v} className="grid grid-cols-2 border-b border-meta-hairline-soft last:border-b-0">
                <button
                  type="button"
                  onClick={() => { onSet(t.v); setOpen(false); }}
                  className={
                    'px-4 py-2.5 t-body-s-b text-left hover:bg-meta-surface border-r border-meta-hairline-soft ' +
                    (active ? 'bg-meta-surface text-meta-primary' : 'text-meta-ink-deep')
                  }
                  title={`현재 페이지만 ${t.label}로`}
                >
                  {t.emoji} {t.label}
                </button>
                <button
                  type="button"
                  onClick={() => { onApplyAllAs(t.v); setOpen(false); }}
                  className="px-4 py-2.5 t-body-s-b text-left hover:bg-meta-surface text-meta-ink-deep"
                  title={`모든 페이지에 ${t.label} 적용`}
                >
                  {t.emoji} {t.label} 전체
                </button>
              </div>
            );
          })}
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

function ExportMenu({ onCurrent, onCurrentPng, onAll }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [transparent, setTransparent] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn btn-buy">
        ⤓ Export
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[320px] surface-card overflow-hidden">
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
          {/* PNG 행 + 투명 체크박스 */}
          <div className="flex items-stretch border-b border-meta-hairline-soft">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onCurrentPng(scale, transparent);
                setBusy(false);
                setOpen(false);
              }}
              className="flex-1 px-5 py-3 text-left t-body-s-b text-meta-ink-deep hover:bg-meta-surface disabled:opacity-50"
            >
              현재 페이지 PNG 저장
            </button>
            <label
              className="flex items-center gap-1.5 px-3 t-cap text-meta-steel hover:bg-meta-surface cursor-pointer border-l border-meta-hairline-soft select-none"
              title="라이트=흰 / 다크=검정 단색 배경을 빼고 알파 PNG로 저장. 페이지 풀이미지가 있으면 유지."
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="accent-meta-primary"
              />
              투명
            </label>
          </div>
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
