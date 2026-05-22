// 우측 사이드바 — variant 선택 + props 폼 + 일괄 적용. Meta chrome.
// 캔버스 ↔ 사이드바 양방향 동기 (store가 진실원본이라 자동 반영).
// HTML 보존: textarea엔 strip된 plain text 표시 → 미변경이면 HTML 마크업 그대로 유지.
import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { getTemplate, getVariant, TEMPLATES } from '../templates/registry.js';
import { CARD_W, CARD_H } from '../design/tokens.js';

// HTML → plain text (br → \n, 나머지 태그 제거)
function stripHtml(html) {
  if (html === null || html === undefined) return '';
  if (typeof html !== 'string') return String(html);
  if (!/[<&]/.test(html)) return html; // plain
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return tmp.textContent || '';
}

function hasMarkup(html) {
  if (typeof html !== 'string') return false;
  return /<(b|strong|mark|i|em|span)(\s|>)/i.test(html);
}

export function Sidebar({ project, page, pageIndex }) {
  const updatePageProp = useProjectStore((s) => s.updatePageProp);
  const changeVariant = useProjectStore((s) => s.changeVariant);
  const applyToAllPages = useProjectStore((s) => s.applyToAllPages);
  const selectedBlockIds = useProjectStore((s) => s.selectedBlockIds);
  const [tab, setTab] = useState('edit');

  // 레이아웃 picker 모드 — sidebar 자리에 LayoutPicker 렌더
  const layoutPickerOpen = useProjectStore.getState ? useProjectStore((s) => s.layoutPickerOpen) : false;
  if (layoutPickerOpen) {
    return <LayoutPicker project={project} pageIndex={pageIndex} />;
  }
  if (!page) return <aside className="w-[420px] border-l border-meta-hairline-soft bg-meta-canvas" />;
  const tplId = page.templateId || project.templateId;
  const tpl = getTemplate(tplId);
  const variant = getVariant(tplId, page.variantId);
  if (!variant) return null;

  // 블록 선택 시 → 블록 속성 패널
  if (selectedBlockIds.length > 0) {
    return <BlockSidebar page={page} pageIndex={pageIndex} selectedIds={selectedBlockIds} />;
  }

  return (
    <aside className="flex w-[420px] flex-col border-l border-meta-hairline-soft bg-meta-canvas">
      <div className="border-b border-meta-hairline-soft px-5 py-4">
        <div className="t-cap-b text-meta-steel">PAGE {String(pageIndex + 1).padStart(2, '0')} / {String(project.pages.length).padStart(2, '0')}</div>
        <div className="t-h-sm text-meta-ink-deep mt-1">{variant.label}</div>
      </div>
      <div className="flex gap-2 border-b border-meta-hairline-soft px-5 py-3">
        {[
          { k: 'edit', label: '편집' },
          { k: 'variant', label: '레이아웃 변경' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={'pill-tab flex-1 ' + (tab === t.k ? 'is-active' : '')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        {tab === 'edit' && (
          <>
            <p className="t-cap text-meta-steel">
              💡 슬라이드 위 텍스트를 클릭해도 바로 편집할 수 있어요.
            </p>
            {/* 모든 variant에 자동 주입: 페이지 풀이미지 배경 — 비어있으면 흰 배경, 채우면 사진. */}
            <FieldEditor
              field={{ key: 'bgPhoto', label: '페이지 풀이미지 배경', type: 'image' }}
              value={page.props.bgPhoto ?? ''}
              onChange={(v) => updatePageProp(pageIndex, 'bgPhoto', v)}
              onCommit={(v) => updatePageProp(pageIndex, 'bgPhoto', v, { commit: true })}
              onApplyAll={() => applyToAllPages('bgPhoto', page.props.bgPhoto)}
            />
            {(variant.fields ?? []).map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                value={page.props[f.key] ?? ''}
                onChange={(v) => updatePageProp(pageIndex, f.key, v)}
                onCommit={(v) => updatePageProp(pageIndex, f.key, v, { commit: true })}
                onApplyAll={() => applyToAllPages(f.key, page.props[f.key])}
              />
            ))}
          </>
        )}

        {tab === 'variant' && (
          <VariantPicker
            template={tpl}
            currentVariantId={page.variantId}
            onPick={(vid) => changeVariant(pageIndex, vid)}
          />
        )}
      </div>
    </aside>
  );
}

/* ─── Block 속성 사이드바 ─── */
function BlockSidebar({ page, pageIndex, selectedIds }) {
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const removeBlocks = useProjectStore((s) => s.removeBlocks);
  const duplicateBlocks = useProjectStore((s) => s.duplicateBlocks);
  const bringForward = useProjectStore((s) => s.bringForward);
  const sendBackward = useProjectStore((s) => s.sendBackward);
  const clearSelection = useProjectStore((s) => s.clearSelection);
  const block = (page.overlays || []).find((b) => b.id === selectedIds[0]);
  if (!block) return null;
  const setProp = (k, v, opts) => updateBlock(block.id, { props: { [k]: v } }, opts);
  const setAttr = (k, v, opts) => updateBlock(block.id, { [k]: v }, opts);

  return (
    <aside className="flex w-[420px] flex-col border-l border-meta-hairline-soft bg-meta-canvas">
      <div className="border-b border-meta-hairline-soft px-5 py-4 flex items-start justify-between">
        <div>
          <div className="t-cap-b text-meta-steel">BLOCK · {block.type.toUpperCase()}</div>
          <div className="t-h-sm text-meta-ink-deep mt-1">
            {selectedIds.length > 1 ? `${selectedIds.length}개 선택됨` : '단일 블록'}
          </div>
        </div>
        <button onClick={clearSelection} className="btn-icon-circle btn" title="선택 해제 (Esc)">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        {/* 위치/크기/회전 */}
        <div>
          <div className="t-cap-b text-meta-steel mb-2">위치 · 크기 · 회전</div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="X" value={Math.round(block.x)} onCommit={(v) => setAttr('x', v, { commit: true })} />
            <NumberInput label="Y" value={Math.round(block.y)} onCommit={(v) => setAttr('y', v, { commit: true })} />
            <NumberInput
              label="W"
              value={block.w === 'auto' ? '' : Math.round(block.w)}
              onCommit={(v) => setAttr('w', v, { commit: true })}
            />
            <NumberInput
              label="H"
              value={block.h === 'auto' ? '' : Math.round(block.h)}
              onCommit={(v) => setAttr('h', v, { commit: true })}
            />
            <NumberInput
              label="회전°"
              value={Math.round(block.rotation || 0)}
              onCommit={(v) => setAttr('rotation', v, { commit: true })}
            />
            <NumberInput
              label="Z"
              value={block.z || 0}
              onCommit={(v) => setAttr('z', v, { commit: true })}
            />
          </div>
        </div>

        {block.type === 'text' && (
          <div>
            <div className="t-cap-b text-meta-steel mb-2">텍스트</div>
            <div className="space-y-2">
              <textarea
                className="field"
                rows={3}
                value={(block.props.html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')}
                onChange={(e) => setProp('html', e.target.value.replace(/\n/g, '<br>'))}
                onBlur={(e) => setProp('html', e.target.value.replace(/\n/g, '<br>'), { commit: true })}
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="크기"
                  value={block.props.fontSize}
                  onCommit={(v) => setProp('fontSize', v, { commit: true })}
                />
                <NumberInput
                  label="굵기"
                  value={block.props.fontWeight}
                  onCommit={(v) => setProp('fontWeight', v, { commit: true })}
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                {['left', 'center', 'right'].map((a) => (
                  <button
                    key={a}
                    onClick={() => setProp('align', a, { commit: true })}
                    className={'pill-tab ' + (block.props.align === a ? 'is-active' : '')}
                  >
                    {a === 'left' ? '⇤' : a === 'center' ? '⇔' : '⇥'}
                  </button>
                ))}
              </div>
              <ColorInput
                label="글자색"
                value={block.props.color}
                onCommit={(v) => setProp('color', v, { commit: true })}
              />
            </div>
          </div>
        )}

        {block.type === 'image' && (
          <div>
            <div className="t-cap-b text-meta-steel mb-2">이미지</div>
            <div className="space-y-2">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => setProp('src', r.result, { commit: true });
                    r.readAsDataURL(f);
                  }}
                  className="hidden"
                />
                <span className="btn btn-secondary w-full justify-center">이미지 업로드</span>
              </label>
              {block.props.src && (
                <ImagePositionEditor block={block} setProp={setProp} />
              )}
              <NumberInput
                label="모서리 둥글기"
                value={block.props.borderRadius || 0}
                onCommit={(v) => setProp('borderRadius', v, { commit: true })}
              />
              {/* 테두리 — 있음/없음 토글. 있음=3px 검정 기본 */}
              <div>
                <div className="t-cap text-meta-steel mb-1">테두리</div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setProp('border', 3, { commit: true })}
                    className={'pill-tab ' + ((block.props.border ?? 3) > 0 ? 'is-active' : '')}
                  >
                    있음
                  </button>
                  <button
                    type="button"
                    onClick={() => setProp('border', 0, { commit: true })}
                    className={'pill-tab ' + ((block.props.border ?? 3) === 0 ? 'is-active' : '')}
                  >
                    없음
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {block.type === 'shape' && (
          <div>
            <div className="t-cap-b text-meta-steel mb-2">도형</div>
            <div className="space-y-2">
              <ColorInput label="채움" value={block.props.fill} onCommit={(v) => setProp('fill', v, { commit: true })} />
              <NumberInput
                label="모서리 둥글기"
                value={block.props.borderRadius || 0}
                onCommit={(v) => setProp('borderRadius', v, { commit: true })}
              />
              <NumberInput
                label="보더 두께"
                value={block.props.border || 0}
                onCommit={(v) => setProp('border', v, { commit: true })}
              />
            </div>
          </div>
        )}

        {block.type === 'sticker' && (
          <div onMouseDown={(e) => e.stopPropagation()}>
            <div className="t-cap-b text-meta-steel mb-2">스티커 — {block.props.kind}</div>
            {block.props.variant !== undefined && (
              <div className="mt-2 mb-3 flex gap-1">
                {['black', 'lemon', 'neon', 'white'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProp('variant', v, { commit: true });
                    }}
                    className={'pill-tab flex-1 ' + (block.props.variant === v ? 'is-active' : '')}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
            <label className="t-cap text-meta-steel">텍스트 (Shift+Enter 줄바꿈)</label>
            <textarea
              className="field mt-1.5 min-h-[120px]"
              rows={5}
              defaultValue={block.props.children ?? ''}
              onBlur={(e) => setProp('children', e.target.value, { commit: true })}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <div>
          <div className="t-cap-b text-meta-steel mb-2">레이어</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => bringForward(selectedIds)} className="btn btn-ghost">▲ 앞으로</button>
            <button onClick={() => sendBackward(selectedIds)} className="btn btn-ghost">▼ 뒤로</button>
            <button onClick={() => duplicateBlocks(selectedIds)} className="btn btn-ghost">⎘ 복제</button>
            <button onClick={() => removeBlocks(selectedIds)} className="btn btn-ghost text-meta-critical">× 삭제</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── 이미지 블록 — 미리보기 + 원본 재배치 (background-position 드래그 + zoom 슬라이더) ─── */
function ImagePositionEditor({ block, setProp }) {
  const ref = useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // objectPosition은 'x% y%' 형식. 기본 'center' = '50% 50%'
  const pos = parseBgPosition(block.props.objectPosition);
  // objectScale은 1 = cover 기본, > 1이면 확대.
  const scale = typeof block.props.objectScale === 'number' && block.props.objectScale >= 1
    ? block.props.objectScale
    : 1;

  function previewPos(p) {
    setProp('objectPosition', `${p.x}% ${p.y}%`);
  }

  function onPointerDown(e) {
    // 슬라이더 클릭 시 드래그 막기
    if (e.target.closest('input[type="range"]')) return;
    e.preventDefault();
    setDragging(true);
    const rect = ref.current.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    function onMove(ev) {
      // 줌이 클수록 동일 드래그가 더 적게 움직이도록 scale로 나눠줌 → 직관적인 팬 감각
      const dx = ((ev.clientX - start.x) / rect.width) * 100 / scale;
      const dy = ((ev.clientY - start.y) / rect.height) * 100 / scale;
      const nx = Math.max(0, Math.min(100, start.px - dx));
      const ny = Math.max(0, Math.min(100, start.py - dy));
      previewPos({ x: Math.round(nx), y: Math.round(ny) });
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(false);
      // 마지막 값을 history와 함께 commit
      const cur = parseBgPosition(
        useProjectStore.getState().projects
          .find((p) => p.id === useProjectStore.getState().activeProjectId)
          ?.pages[useProjectStore.getState().activePageIndex]
          ?.overlays?.find((b) => b.id === block.id)?.props?.objectPosition
      );
      setProp('objectPosition', `${cur.x}% ${cur.y}%`, { commit: true });
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return (
    <div>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        className="relative surface-card-sm overflow-hidden"
        style={{
          height: 140,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        title="드래그해서 잘릴 영역 조절 · 슬라이더로 확대"
      >
        {/* zoom은 inner div의 transform: scale로 처리 — bg cover 위에 자연스럽게 얹힘 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${block.props.src})`,
            backgroundSize: 'cover',
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            transform: `scale(${scale})`,
            transformOrigin: `${pos.x}% ${pos.y}%`,
          }}
        />
        <span className="absolute top-1.5 left-1.5 mono text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
          {pos.x}% · {pos.y}% · {scale.toFixed(1)}x
        </span>
      </div>
      {/* 확대 슬라이더 */}
      <div className="mt-2 flex items-center gap-2">
        <span className="t-cap text-meta-steel w-7 shrink-0">확대</span>
        <input
          type="range"
          min="1"
          max="4"
          step="0.1"
          value={scale}
          onChange={(e) => setProp('objectScale', Number(e.target.value))}
          onMouseUp={(e) => setProp('objectScale', Number(e.currentTarget.value), { commit: true })}
          onTouchEnd={(e) => setProp('objectScale', Number(e.currentTarget.value), { commit: true })}
          className="flex-1 accent-meta-primary"
        />
        <span className="mono text-[10px] text-meta-steel w-8 text-right tabular-nums">
          {scale.toFixed(1)}x
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="t-cap text-meta-stone">드래그=위치 · 슬라이더=확대</div>
        <button
          type="button"
          onClick={() => {
            setProp('objectPosition', 'center', { commit: true });
            setProp('objectScale', 1, { commit: true });
          }}
          className="t-cap text-meta-steel hover:text-meta-primary"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

function parseBgPosition(str) {
  if (!str || str === 'center') return { x: 50, y: 50 };
  const m = String(str).match(/(\d+)%\s+(\d+)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: Number(m[1]), y: Number(m[2]) };
}

function NumberInput({ label, value, onCommit }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  // 라이브 업데이트 — 입력할 때마다 즉시 commit해서 캔버스에 반영.
  // Enter도 명시적 commit로 처리(input은 키 다시 받는 게 정상).
  function handleChange(e) {
    const raw = e.target.value;
    const v = raw === '' ? '' : Number(raw);
    setLocal(v);
    if (typeof v === 'number' && !Number.isNaN(v)) {
      onCommit(v);
    }
  }
  return (
    <label className="block">
      <div className="t-cap text-meta-steel mb-1">{label}</div>
      <input
        type="number"
        value={local ?? ''}
        onChange={handleChange}
        onBlur={() => {
          if (typeof local === 'number' && local !== value) onCommit(local);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="field"
      />
    </label>
  );
}

function ColorInput({ label, value, onCommit }) {
  const [local, setLocal] = useState(value || '#000000');
  useEffect(() => setLocal(value || '#000000'), [value]);
  return (
    <label className="block">
      <div className="t-cap text-meta-steel mb-1">{label}</div>
      <div className="flex gap-2">
        <input
          type="color"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => onCommit(local)}
          className="h-9 w-12 cursor-pointer rounded-md border border-meta-hairline"
        />
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => onCommit(local)}
          className="field flex-1"
        />
      </div>
    </label>
  );
}

function FieldEditor({ field, value, onChange, onCommit, onApplyAll }) {
  // points-list는 array — 별도 처리 (stripHtml 위로)
  if (field.type === 'points-list') {
    return <PointsListField field={field} value={value} onCommit={onCommit} onApplyAll={onApplyAll} />;
  }

  // 텍스트 필드는 plain text로 보여주되, 미변경 시 원본 HTML 보존.
  const plain = stripHtml(value);
  const [local, setLocal] = useState(plain);
  const lastPlainRef = useRef(plain);
  useEffect(() => {
    const p = stripHtml(value);
    setLocal(p);
    lastPlainRef.current = p;
  }, [value]);

  const markupWarning = hasMarkup(value);

  function commitChange() {
    if (local === lastPlainRef.current) return;
    onCommit(local);
  }

  if (field.type === 'image' || field.type === 'media') {
    const allowVideo = field.type === 'media';
    const isVideoSrc = typeof value === 'string' && (value.startsWith('data:video/') || /\.(mp4|webm|mov)(\?|$)/i.test(value));
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <div className="space-y-2">
          {value ? (
            <div className="relative surface-card-sm overflow-hidden">
              {isVideoSrc ? (
                <video src={value} className="block w-full h-36 object-cover" muted autoPlay loop playsInline />
              ) : (
                <img src={value} alt="" className="block w-full h-36 object-cover" />
              )}
              <button
                onClick={() => {
                  onCommit('');
                  setLocal('');
                }}
                className="absolute top-2 right-2 btn-icon-circle btn shadow-meta-card"
                title="제거"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="surface-card-sm h-36 flex items-center justify-center bg-meta-surface t-body-s text-meta-stone">
              {allowVideo ? '이미지/영상 없음' : '사진 없음'}
            </div>
          )}
          <label className="block">
            <input
              type="file"
              accept={allowVideo ? 'image/*,video/*' : 'image/*'}
              // 같은 파일을 한 번 더 선택해도 onChange가 발화하도록 click 직전 value 리셋.
              // 그리고 reader가 끝나기 전에 input.value를 비워두면 다음 업로드도 즉시 가능.
              onClick={(e) => { e.currentTarget.value = ''; }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const input = e.target;
                const reader = new FileReader();
                reader.onload = () => {
                  onCommit(reader.result);
                  setLocal(reader.result);
                  input.value = '';
                };
                reader.onerror = () => {
                  console.warn('[upload] FileReader failed', reader.error);
                  input.value = '';
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            <span className="btn btn-secondary w-full justify-center">
              {allowVideo ? '이미지·영상 업로드' : '파일 업로드'}
            </span>
          </label>
          <input
            type="text"
            placeholder="또는 URL 붙여넣기"
            value={typeof local === 'string' && local.startsWith('http') ? local : ''}
            onChange={(e) => {
              setLocal(e.target.value);
              onChange(e.target.value);
            }}
            onBlur={commitChange}
            className="field"
          />
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <select
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            onCommit(e.target.value);
          }}
          className="field"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    const rows = Math.max(2, Math.min(10, String(local || '').split('\n').length + 1));
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <textarea
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            // 미변경이면 onChange도 호출 안 함 (HTML 보존)
            if (e.target.value !== lastPlainRef.current) onChange(e.target.value);
          }}
          onBlur={commitChange}
          rows={rows}
          className="field"
        />
        {markupWarning && (
          <div className="t-cap text-meta-stone mt-1">
            ⚠ 형광·볼드 서식이 있어요. 여기서 편집하면 서식이 사라집니다.
          </div>
        )}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <input
          type="number"
          value={local}
          min={field.min}
          max={field.max}
          onChange={(e) => {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            setLocal(v);
            onChange(v);
          }}
          onBlur={commitChange}
          className="field"
        />
      </div>
    );
  }

  return (
    <div>
      <Label field={field} onApplyAll={onApplyAll} />
      <input
        type="text"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          if (e.target.value !== lastPlainRef.current) onChange(e.target.value);
        }}
        onBlur={commitChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="field"
      />
      {markupWarning && (
        <div className="t-cap text-meta-stone mt-1">
          ⚠ 형광·볼드 서식 있음 — 변경하면 서식 사라짐
        </div>
      )}
    </div>
  );
}

/* ─── LayoutPicker — '+ 페이지 추가' 누르면 사이드바 자리에 노출 ─── */
function LayoutPicker({ project, pageIndex }) {
  const addPage = useProjectStore((s) => s.addPage);
  const closeLayoutPicker = useProjectStore((s) => s.closeLayoutPicker);
  const [activeTemplate, setActiveTemplate] = useState(project.templateId);

  // 카드 클릭 = 즉시 페이지 추가. addPage 내부에서 picker가 자동으로 닫힘.
  function onPick(variantId, templateId) {
    addPage(variantId, pageIndex + 1, templateId);
  }

  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate);

  return (
    <aside className="relative flex w-[420px] flex-col border-l border-meta-hairline-soft bg-meta-canvas">
      <div className="border-b border-meta-hairline-soft px-5 py-4 flex items-start justify-between">
        <div>
          <div className="t-cap-b text-meta-steel">+ 페이지 추가</div>
          <div className="t-h-sm text-meta-ink-deep mt-1">레이아웃 — 클릭해서 추가</div>
        </div>
        <button onClick={closeLayoutPicker} className="btn-icon-circle btn" title="닫기 (Esc)">×</button>
      </div>

      {/* 템플릿 탭 */}
      <div className="flex flex-wrap gap-1.5 border-b border-meta-hairline-soft px-4 py-3 overflow-x-auto no-scrollbar">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={'pill-tab whitespace-nowrap ' + (activeTemplate === t.id ? 'is-active' : '')}
            title={t.tagline}
          >
            {t.name.replace('Type ', 'T')}
            {t.id === project.templateId && <span className="ml-1 opacity-60">·현재</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="grid grid-cols-2 gap-2.5">
          {(currentTemplate?.variants ?? []).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onPick(v.id, currentTemplate.id)}
              className="group text-left border border-meta-hairline-soft rounded-xl overflow-hidden hover:border-meta-primary hover:shadow-meta-card transition-all bg-meta-canvas cursor-pointer"
              title={`클릭해서 "${v.label}" 추가`}
            >
              <div className="relative overflow-hidden bg-meta-surface" style={{ paddingBottom: `${(CARD_H / CARD_W) * 100}%` }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${156 / CARD_W})`, transformOrigin: 'top left' }}>
                    <MiniVariant variant={v} />
                  </div>
                </div>
                {/* 호버 시 + 추가 오버레이 — 클릭 가능함을 시각적으로 강조 */}
                <div
                  className="absolute inset-0 bg-meta-ink-deep/0 group-hover:bg-meta-ink-deep/45 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                  aria-hidden
                >
                  <span className="bg-meta-canvas text-meta-ink-deep t-cap-b px-3 py-1.5 rounded-full shadow">
                    + 이 레이아웃 추가
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-2">
                <div className="t-cap-b text-meta-ink-deep truncate">{v.label}</div>
                <div className="mono text-[9px] text-meta-stone mt-0.5">{v.category.toUpperCase()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// variant의 default props로 Component를 렌더 — 미리보기용
function MiniVariant({ variant }) {
  const props = {};
  for (const f of variant.fields ?? []) props[f.key] = f.default ?? '';
  props.page = '01 / 10';
  const Comp = variant.Component;
  return (
    <div style={{ pointerEvents: 'none' }}>
      <Comp {...props} />
    </div>
  );
}

function PointsListField({ field, value, onCommit, onApplyAll }) {
  const arr = Array.isArray(value) ? value : [];
  function setItem(i, next) {
    const copy = arr.map((v, idx) => (idx === i ? { ...v, ...next } : v));
    onCommit(copy);
  }
  function addRow() {
    const copy = [...arr, { headline: `포인트 ${arr.length + 1}` }];
    onCommit(copy);
  }
  function removeRow(i) {
    const copy = arr.filter((_, idx) => idx !== i);
    onCommit(copy);
  }
  function move(i, di) {
    const j = i + di;
    if (j < 0 || j >= arr.length) return;
    const copy = arr.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onCommit(copy);
  }
  return (
    <div>
      <Label field={field} onApplyAll={onApplyAll} />
      <div className="space-y-2">
        {arr.map((row, i) => (
          <div key={i} className="flex items-stretch gap-1.5">
            <span className="mono w-7 shrink-0 flex items-center justify-center t-cap text-meta-steel">#{i + 1}</span>
            <input
              type="text"
              defaultValue={row.headline || ''}
              onBlur={(e) => setItem(i, { headline: e.target.value })}
              className="field flex-1"
              placeholder="셀링 포인트 헤드라인"
            />
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(i, -1)} className="border border-meta-hairline-soft rounded-md px-1.5 text-[10px] hover:bg-meta-surface" title="위로">▲</button>
              <button onClick={() => move(i, 1)} className="border border-meta-hairline-soft rounded-md px-1.5 text-[10px] hover:bg-meta-surface" title="아래로">▼</button>
            </div>
            <button onClick={() => removeRow(i)} className="border border-meta-hairline-soft rounded-md px-2 text-meta-critical hover:bg-meta-surface" title="삭제">×</button>
          </div>
        ))}
        <button onClick={addRow} className="btn btn-ghost w-full justify-center">+ 행 추가</button>
        <div className="t-cap text-meta-stone">
          💡 행 추가 시 단일 셀링포인트 페이지가 자동 생성/동기됩니다.
        </div>
      </div>
    </div>
  );
}

function Label({ field, onApplyAll }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="t-cap-b text-meta-ink-deep">{field.label}</label>
      <button
        onClick={onApplyAll}
        title="모든 페이지에 동일 값 적용"
        className="t-cap text-meta-steel hover:text-meta-primary"
      >
        모두 적용
      </button>
    </div>
  );
}

function VariantPicker({ template, currentVariantId, onPick }) {
  const groups = { cover: [], body: [], outro: [] };
  for (const v of template.variants) (groups[v.category] ?? groups.body).push(v);
  return (
    <div className="space-y-5">
      {[
        { k: 'cover', label: 'COVER · 표지' },
        { k: 'body', label: 'BODY · 본문' },
        { k: 'outro', label: 'OUTRO · 아웃트로' },
      ].map((g) => {
        if (!groups[g.k].length) return null;
        return (
          <div key={g.k}>
            <div className="t-cap-b text-meta-steel mb-2">{g.label}</div>
            <div className="space-y-2">
              {groups[g.k].map((v) => (
                <button
                  key={v.id}
                  onClick={() => onPick(v.id)}
                  className={
                    'block w-full text-left px-4 py-3 t-body-s-b border rounded-2xl transition-colors ' +
                    (v.id === currentVariantId
                      ? 'border-meta-primary bg-meta-surface text-meta-ink-deep'
                      : 'border-meta-hairline-soft bg-meta-canvas text-meta-ink hover:bg-meta-surface')
                  }
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
