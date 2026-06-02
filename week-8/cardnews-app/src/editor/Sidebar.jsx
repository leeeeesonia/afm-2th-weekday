// 우측 사이드바 — variant 선택 + props 폼 + 일괄 적용. Meta chrome.
// 캔버스 ↔ 사이드바 양방향 동기 (store가 진실원본이라 자동 반영).
// HTML 보존: textarea엔 strip된 plain text 표시 → 미변경이면 HTML 마크업 그대로 유지.
import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { getTemplate, getVariant, TEMPLATES } from '../templates/registry.js';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { uploadImage } from '../lib/uploadImage.js';
import { STICKER_PLACEHOLDERS } from '../design/stickers.jsx';
import { BLANK_VARIANT_IDS } from '../templates/blankFields.js';

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

// 워드마크 자리(우상단 브랜드/워드마크) 필드 키 — 템플릿별로 이름이 다름
const WORDMARK_FIELD_KEYS = new Set(['wordmark', 'brand', 'topRight']);

export function Sidebar({ project, page, pageIndex }) {
  const updatePageProp = useProjectStore((s) => s.updatePageProp);
  const changeVariant = useProjectStore((s) => s.changeVariant);
  const applyToAllPages = useProjectStore((s) => s.applyToAllPages);
  const setProjectHidePageNumber = useProjectStore((s) => s.setProjectHidePageNumber);
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
            {/* 모든 variant에 자동 주입: 페이지 풀이미지 배경 — 비어있으면 흰 배경, 채우면 사진.
                사진이 있으면 zoom + 4방향 pan 가능 (단일 블록과 동일 UX). */}
            <FieldEditor
              field={{ key: 'bgPhoto', label: '페이지 풀이미지 배경', type: 'image' }}
              value={page.props.bgPhoto ?? ''}
              onChange={(v) => updatePageProp(pageIndex, 'bgPhoto', v)}
              onCommit={(v) => updatePageProp(pageIndex, 'bgPhoto', v, { commit: true })}
              onApplyAll={() => applyToAllPages('bgPhoto', page.props.bgPhoto)}
              positionValue={page.props.bgPhotoPosition}
              scaleValue={page.props.bgPhotoScale}
              onPositionCommit={(v, opts) => updatePageProp(pageIndex, 'bgPhotoPosition', v, opts || {})}
              onScaleCommit={(v, opts) => updatePageProp(pageIndex, 'bgPhotoScale', v, opts || {})}
            />
            {(() => {
              const fields = variant.fields ?? [];
              const hasWordmarkField = fields.some((f) => WORDMARK_FIELD_KEYS.has(f.key));
              const out = [];
              for (const f of fields) {
                // removable 필드 (예: subhead) — `${key}Hidden` 플래그로 숨김/표시 토글, 텍스트 값은 보존
                if (f.removable) {
                  const hideKey = `${f.key}Hidden`;
                  const isHidden = page.props[hideKey] === true;
                  if (isHidden) {
                    out.push(
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => updatePageProp(pageIndex, hideKey, false, { commit: true })}
                        className="w-full border border-dashed border-meta-hairline rounded-xl px-4 py-3 t-cap-b text-meta-steel hover:border-meta-primary hover:text-meta-primary transition-colors"
                      >
                        + {f.label} 추가
                      </button>
                    );
                    continue;
                  }
                  out.push(
                    <div key={f.key} className="relative">
                      <FieldEditor
                        field={f}
                        value={page.props[f.key] ?? ''}
                        onChange={(v) => updatePageProp(pageIndex, f.key, v)}
                        onCommit={(v) => updatePageProp(pageIndex, f.key, v, { commit: true })}
                        onApplyAll={() => applyToAllPages(f.key, page.props[f.key])}
                      />
                      <button
                        type="button"
                        onClick={() => updatePageProp(pageIndex, hideKey, true, { commit: true })}
                        title={`${f.label} 박스 숨기기 (텍스트는 보존됨)`}
                        className="absolute top-0 right-0 -translate-y-0.5 t-cap text-meta-stone hover:text-meta-critical"
                      >
                        × 박스 삭제
                      </button>
                    </div>
                  );
                  continue;
                }
                out.push(
                  <FieldEditor
                    key={f.key}
                    field={f}
                    value={page.props[f.key] ?? ''}
                    onChange={(v) => updatePageProp(pageIndex, f.key, v)}
                    onCommit={(v) => updatePageProp(pageIndex, f.key, v, { commit: true })}
                    onApplyAll={() => applyToAllPages(f.key, page.props[f.key])}
                  />
                );
                // 워드마크 자리(우상단) 바로 아래에 페이지 표시 토글 — 전체 페이지 일괄 (모든 템플릿 공통)
                if (WORDMARK_FIELD_KEYS.has(f.key)) {
                  out.push(<PageNumberToggle key="__page_toggle" project={project} setHide={setProjectHidePageNumber} />);
                }
              }
              // 워드마크 필드가 없는 variant라도(아웃트로 등) 토글은 노출 — 필드 목록 끝에 폴백
              if (!hasWordmarkField) {
                out.push(<PageNumberToggle key="__page_toggle" project={project} setHide={setProjectHidePageNumber} />);
              }
              return out;
            })()}
            {/* 빈 페이지(2/3분할) 전용 — 배경 분할 탭 + 배경 조정 섹션 */}
            {BLANK_VARIANT_IDS.has(page.variantId) && (
              <BlankBgEditor page={page} pageIndex={pageIndex} updatePageProp={updatePageProp} />
            )}
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
              {/* controlled — onChange로 store 즉시 동기(history X), onBlur에서만 history commit.
                  사이드바 타이핑 중 캔버스 클릭해도 최신값이 항상 store에 있음. */}
              <textarea
                className="field"
                rows={3}
                onKeyDown={(e) => e.stopPropagation()}
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
                {/* Pretendard 무게 드랍다운 — Bold(700)/Medium(500)/Regular(400)/Light(300) */}
                <div>
                  <div className="t-cap text-meta-steel mb-1">굵기</div>
                  <select
                    className="field"
                    value={String(block.props.fontWeight ?? 500)}
                    onChange={(e) => setProp('fontWeight', Number(e.target.value), { commit: true })}
                  >
                    <option value="700">Bold</option>
                    <option value="500">Medium</option>
                    <option value="400">Regular</option>
                    <option value="300">Light</option>
                  </select>
                </div>
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
              {/* 글자색 ↔ 레이어 사이 — 텍스트 색상 팔레트 */}
              <TextColorPalette block={block} setProp={setProp} />
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
              {/* 테두리 — 두껍게(3px) / 얇게(1px) / 없음(0) 3단계 */}
              <div>
                <div className="t-cap text-meta-steel mb-1">테두리</div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setProp('border', 3, { commit: true })}
                    className={'pill-tab ' + ((block.props.border ?? 3) === 3 ? 'is-active' : '')}
                  >
                    두껍게
                  </button>
                  <button
                    type="button"
                    onClick={() => setProp('border', 1, { commit: true })}
                    className={'pill-tab ' + ((block.props.border ?? 3) === 1 ? 'is-active' : '')}
                  >
                    얇게
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

        {block.type === 'line' && (
          <div>
            <div className="t-cap-b text-meta-steel mb-2">라인</div>
            <div className="space-y-2">
              <div>
                <div className="t-cap text-meta-steel mb-1">스타일</div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setProp('style', 'solid', { commit: true })}
                    className={'pill-tab ' + ((block.props.style || 'solid') === 'solid' ? 'is-active' : '')}
                  >
                    실선
                  </button>
                  <button
                    type="button"
                    onClick={() => setProp('style', 'dashed', { commit: true })}
                    className={'pill-tab ' + (block.props.style === 'dashed' ? 'is-active' : '')}
                  >
                    점선
                  </button>
                </div>
              </div>
              <ColorInput
                label="색상"
                value={block.props.color}
                onCommit={(v) => setProp('color', v, { commit: true })}
              />
              {/* 텍스트 블록과 동일 팔레트 — color prop 1개만 set하면 됨 */}
              <TextColorPalette block={block} setProp={setProp} />
              <NumberInput
                label="두께(px)"
                value={block.props.strokeWidth ?? 1}
                onCommit={(v) => setProp('strokeWidth', Math.max(1, v || 1), { commit: true })}
              />
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
            {/* subFrame/subSticker는 팔레트로 대체되어 variant pill-tab 숨김 */}
            {block.props.variant !== undefined &&
              block.props.kind !== 'subFrame' &&
              block.props.kind !== 'subSticker' && (
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
            <label className="t-cap text-meta-steel">텍스트 (Enter 줄바꿈)</label>
            {/* controlled — onChange로 store 즉시 동기(히스토리 X), onBlur에서만 history commit.
                race-condition 방지: 사이드바 타이핑 중 캔버스 클릭해도 최신값이 항상 store에 있음. */}
            <textarea
              className="field mt-1.5 min-h-[120px]"
              rows={5}
              placeholder={STICKER_PLACEHOLDERS[block.props.kind] || ''}
              value={block.props.children ?? ''}
              onChange={(e) => setProp('children', e.target.value)}
              onBlur={(e) => setProp('children', e.target.value, { commit: true })}
              onKeyDown={(e) => e.stopPropagation()}
            />
            {/* Sub Sticker — variant 기반 팔레트 (검정/레몬/네온/화이트(outline)) */}
            {block.props.kind === 'subSticker' && (
              <div className="mt-4 pt-4 border-t border-meta-hairline-soft">
                <SubStickerColorPalette block={block} setProp={setProp} />
              </div>
            )}
            {/* Sub Frame / Sub Info — 도형 기능(채움색·팔레트·모서리 둥글기·보더 두께) */}
            {(block.props.kind === 'subFrame' || block.props.kind === 'subInfo') && (
              <div className="mt-4 pt-4 border-t border-meta-hairline-soft space-y-3">
                <div className="t-cap-b text-meta-steel">도형</div>
                <ColorInput
                  label="채움"
                  value={block.props.fill ?? ''}
                  onCommit={(v) => setProp('fill', v, { commit: true })}
                />
                <StickerColorPalette block={block} setProp={setProp} />
                <NumberInput
                  label="모서리 둥글기"
                  value={block.props.borderRadius ?? 0}
                  onCommit={(v) => setProp('borderRadius', v, { commit: true })}
                />
                <div>
                  <div className="t-cap text-meta-steel mb-1">보더 두께</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setProp('border', 3, { commit: true })}
                      className={'pill-tab ' + ((block.props.border ?? 3) === 3 ? 'is-active' : '')}
                    >
                      두껍게
                    </button>
                    <button
                      type="button"
                      onClick={() => setProp('border', 1, { commit: true })}
                      className={'pill-tab ' + ((block.props.border ?? 3) === 1 ? 'is-active' : '')}
                    >
                      얇게
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
            )}
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

/* ─── 이미지 블록 — 미리보기 + 원본 재배치 (얇은 wrapper: 블록 props 매핑) ─── */
function ImagePositionEditor({ block, setProp }) {
  return (
    <PhotoPositionEditor
      src={block.props.src}
      position={block.props.objectPosition}
      scale={block.props.objectScale}
      onPositionChange={(v, opts) => setProp('objectPosition', v, opts)}
      onScaleChange={(v, opts) => setProp('objectScale', v, opts)}
    />
  );
}

/* ─── 범용 사진 위치/확대 에디터 — block overlay & page bgPhoto 양쪽에서 재사용 ───
 * props:
 *   src — 이미지 URL
 *   position — 'x% y%' 또는 'center'
 *   scale — 1.0~4.0
 *   onPositionChange(value, opts) — value는 'x% y%' 문자열
 *   onScaleChange(value, opts)
 *   opts.commit=true면 history에 푸시.
 */
function PhotoPositionEditor({ src, position, scale: rawScale, onPositionChange, onScaleChange }) {
  const ref = useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const pos = parseBgPosition(position);
  const scale = typeof rawScale === 'number' && rawScale >= 1 ? rawScale : 1;
  // 드래그 종료 시 최신 position을 읽기 위한 ref
  const posRef = useRef(pos);
  posRef.current = pos;

  function onPointerDown(e) {
    if (e.target.closest('input[type="range"]')) return;
    e.preventDefault();
    setDragging(true);
    const rect = ref.current.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    function onMove(ev) {
      const dx = ((ev.clientX - start.x) / rect.width) * 100 / scale;
      const dy = ((ev.clientY - start.y) / rect.height) * 100 / scale;
      const nx = Math.max(0, Math.min(100, start.px - dx));
      const ny = Math.max(0, Math.min(100, start.py - dy));
      const next = { x: Math.round(nx), y: Math.round(ny) };
      posRef.current = next;
      onPositionChange(`${next.x}% ${next.y}%`);
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(false);
      const cur = posRef.current;
      onPositionChange(`${cur.x}% ${cur.y}%`, { commit: true });
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
        style={{ height: 140, cursor: dragging ? 'grabbing' : 'grab' }}
        title="드래그해서 잘릴 영역 조절 · 슬라이더로 확대"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
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
      <div className="mt-2 flex items-center gap-2">
        <span className="t-cap text-meta-steel w-7 shrink-0">확대</span>
        <input
          type="range"
          min="1"
          max="4"
          step="0.1"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          onMouseUp={(e) => onScaleChange(Number(e.currentTarget.value), { commit: true })}
          onTouchEnd={(e) => onScaleChange(Number(e.currentTarget.value), { commit: true })}
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
            onPositionChange('center', { commit: true });
            onScaleChange(1, { commit: true });
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

// position/scale 부가 props: image field가 풀이미지로 동작할 때 zoom+pan UI 활성화.
// 사이드바 내에서 다음 입력 필드로 포커스 이동.
// 텍스트 input / textarea / select 만 대상. 파일·컬러·range·버튼은 스킵.
function focusNextField(currentEl) {
  const aside = currentEl?.closest('aside');
  if (!aside) return;
  const candidates = Array.from(
    aside.querySelectorAll('input[type="text"], input[type="number"], input:not([type]), textarea, select')
  ).filter((el) => !el.disabled && el.offsetParent !== null);
  const idx = candidates.indexOf(currentEl);
  if (idx === -1 || idx + 1 >= candidates.length) return;
  const next = candidates[idx + 1];
  next.focus();
  // 텍스트 / textarea는 커서를 끝으로 옮겨 자연스럽게 이어쓰기
  if (typeof next.setSelectionRange === 'function' && typeof next.value === 'string') {
    const end = next.value.length;
    try { next.setSelectionRange(end, end); } catch {}
  }
}

function FieldEditor({ field, value, onChange, onCommit, onApplyAll, positionValue, scaleValue, onPositionCommit, onScaleCommit }) {
  // points-list는 array — 별도 처리 (stripHtml 위로)
  if (field.type === 'points-list') {
    return <PointsListField field={field} value={value} onCommit={onCommit} onApplyAll={onApplyAll} />;
  }
  // summary-rows — bi-body-summary용 행 단위 표 (2~5행)
  if (field.type === 'summary-rows') {
    return <SummaryRowsField field={field} value={value} onCommit={onCommit} />;
  }
  // segment — n-option pill 그룹. value가 ''이면 field.default 사용.
  if (field.type === 'segment') {
    const opts = field.options || [];
    const current = typeof value === 'string' && value !== '' ? value : (field.default ?? opts[0]?.value ?? '');
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>
          {opts.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onCommit(o.value)}
              className={'pill-tab ' + (current === o.value ? 'is-active' : '')}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  // toggle — boolean 켜짐/꺼짐. 구 페이지에서 value가 ''로 들어오면 field.default 사용.
  if (field.type === 'toggle') {
    const current = typeof value === 'boolean' ? value : (field.default ?? false);
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onCommit(true)}
            className={'pill-tab ' + (current ? 'is-active' : '')}
          >
            켜짐
          </button>
          <button
            type="button"
            onClick={() => onCommit(false)}
            className={'pill-tab ' + (!current ? 'is-active' : '')}
          >
            꺼짐
          </button>
        </div>
      </div>
    );
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
    // 사진이 있고 + 위치/확대 핸들러가 전달되면 PhotoPositionEditor 사용 (블록·페이지 풀배경 공통)
    const supportsPanZoom = value && !isVideoSrc && onPositionCommit && onScaleCommit;
    return (
      <div>
        <Label field={field} onApplyAll={onApplyAll} />
        <div className="space-y-2">
          {value ? (
            supportsPanZoom ? (
              <div className="space-y-2">
                <PhotoPositionEditor
                  src={value}
                  position={positionValue}
                  scale={scaleValue}
                  onPositionChange={onPositionCommit}
                  onScaleChange={onScaleCommit}
                />
                <button
                  type="button"
                  onClick={() => { onCommit(''); setLocal(''); }}
                  className="t-cap text-meta-stone hover:text-meta-critical"
                >
                  × 사진 제거
                </button>
              </div>
            ) : (
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
            )
          ) : (
            <div className="surface-card-sm h-36 flex items-center justify-center bg-meta-surface t-body-s text-meta-stone">
              {allowVideo ? '이미지/영상 없음' : '사진 없음'}
            </div>
          )}
          <label className="block">
            <input
              type="file"
              accept={allowVideo ? 'image/*,video/*' : 'image/*'}
              onClick={(e) => { e.currentTarget.value = ''; }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                // 영상은 ImageKit 무료 플랜에서 제약이 있으므로 일단 data URL 경로 유지.
                // 이미지는 ImageKit 직행 → 영구 CDN URL.
                if (file.type.startsWith('image/')) {
                  try {
                    const url = await uploadImage(file, { folder: `cardnews/${field.key}` });
                    onCommit(url);
                    setLocal(url);
                  } catch (err) {
                    console.error('[upload]', err);
                    alert(`업로드 실패: ${err.message}`);
                  }
                  return;
                }
                // 영상 fallback — data URL
                const reader = new FileReader();
                reader.onload = () => { onCommit(reader.result); setLocal(reader.result); };
                reader.onerror = () => console.warn('[upload] reader failed', reader.error);
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
          // textarea는 Enter=줄바꿈 기본. Cmd/Ctrl+Enter → 다음 필드.
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              commitChange();
              focusNextField(e.currentTarget);
            }
          }}
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
          if (e.key === 'Enter') {
            e.preventDefault();
            commitChange();
            focusNextField(e.currentTarget);
          }
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
              <div className="relative overflow-hidden bg-meta-surface" style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}>
                {/* 컬럼 너비에 맞춰 ResizeObserver로 실측 스케일 — 좌상단 기준 fit */}
                <MiniVariantThumb variant={v} />
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

// 페이지 추가 picker 썸네일 — 부모 너비를 ResizeObserver로 실측해 1080x1350 카드를 정확히 fit.
// 기존 transform: scale(156/CARD_W) 고정값이라 컬럼 폭과 안 맞아 우상단 치우침/좌하단 여백 발생했던 이슈 해결.
function MiniVariantThumb({ variant }) {
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
        <MiniVariant variant={variant} />
      </div>
    </div>
  );
}

function PointsListField({ field, value, onCommit, onApplyAll }) {
  const MAX_POINTS = 5;
  const arr = Array.isArray(value) ? value : [];
  function setItem(i, next) {
    const copy = arr.map((v, idx) => (idx === i ? { ...v, ...next } : v));
    onCommit(copy);
  }
  function addRow() {
    if (arr.length >= MAX_POINTS) return;
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
        <button
          onClick={addRow}
          disabled={arr.length >= MAX_POINTS}
          className="btn btn-ghost w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + 행 추가 {arr.length >= MAX_POINTS ? '(최대 5개)' : ''}
        </button>
        <div className="t-cap text-meta-stone">
          💡 행 추가 시 단일 셀링포인트 페이지가 자동 생성/동기됩니다. (최대 5개)
        </div>
      </div>
    </div>
  );
}

/* ─── bi-body-summary 행 단위 표 (2~5행) ───
 * 캔버스에서 라벨·값을 인플레이스 편집하므로, 사이드바는 행 추가/삭제만 담당.
 * 행 갯수 안내 + 표 추가 버튼 + 행 삭제 버튼.
 */
function SummaryRowsField({ field, value, onCommit }) {
  const rows = Array.isArray(value) && value.length > 0
    ? value
    : [{ label: '판매처', value: '' }, { label: '가격', value: '' }, { label: 'Insight', value: '' }];
  const MIN = 2;
  const MAX = 5;
  function addRow() {
    if (rows.length >= MAX) return;
    onCommit([...rows, { label: '항목', value: '' }]);
  }
  function removeRow(i) {
    if (rows.length <= MIN) return;
    onCommit(rows.filter((_, idx) => idx !== i));
  }
  function moveRow(i, di) {
    const j = i + di;
    if (j < 0 || j >= rows.length) return;
    const copy = rows.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onCommit(copy);
  }
  return (
    <div>
      <Label field={field} />
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5 border border-meta-hairline-soft rounded-md px-2 py-1.5">
            <span className="mono w-7 shrink-0 text-center t-cap text-meta-steel">#{i + 1}</span>
            <span className="flex-1 t-cap text-meta-ink-deep truncate" title={row.label}>{row.label || '(빈 라벨)'}</span>
            <button
              onClick={() => moveRow(i, -1)}
              className="border border-meta-hairline-soft rounded-md px-1.5 text-[10px] hover:bg-meta-surface"
              title="위로"
            >▲</button>
            <button
              onClick={() => moveRow(i, 1)}
              className="border border-meta-hairline-soft rounded-md px-1.5 text-[10px] hover:bg-meta-surface"
              title="아래로"
            >▼</button>
            <button
              onClick={() => removeRow(i)}
              disabled={rows.length <= MIN}
              className="border border-meta-hairline-soft rounded-md px-2 text-meta-critical hover:bg-meta-surface disabled:opacity-30 disabled:cursor-not-allowed"
              title={rows.length <= MIN ? `최소 ${MIN}개 유지` : '행 삭제'}
            >×</button>
          </div>
        ))}
        <button
          onClick={addRow}
          disabled={rows.length >= MAX}
          className="btn btn-ghost w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + 표 추가 {rows.length >= MAX ? `(최대 ${MAX})` : `(${rows.length}/${MAX})`}
        </button>
        <div className="t-cap text-meta-stone">
          💡 라벨·값은 캔버스 미리보기에서 직접 클릭해서 수정하세요.
        </div>
      </div>
    </div>
  );
}

// 텍스트 블록 글자색 팔레트 — color만 설정. 정사각형 swatch + 추후 확장용 + 버튼.
function TextColorPalette({ block, setProp }) {
  const SWATCHES = [
    { color: '#000000', label: '블랙' },
    { color: '#FFFFFF', label: '화이트' },
    { color: '#AAFF00', label: '네온그린' },
    { color: '#FFFABA', label: '레몬' },
  ];
  const cur = (block.props.color || '').toLowerCase();
  return (
    <div>
      <div className="t-cap text-meta-steel mb-1.5">색상 팔레트</div>
      <div className="flex gap-2">
        {SWATCHES.map((s) => {
          const active = cur === s.color.toLowerCase();
          return (
            <button
              key={s.color}
              type="button"
              onClick={() => setProp('color', s.color, { commit: true })}
              title={s.label}
              className={
                'h-9 w-9 rounded-md transition-all ' +
                (active
                  ? 'ring-2 ring-meta-primary ring-offset-2'
                  : 'border border-meta-hairline hover:border-meta-stone')
              }
              style={{ background: s.color }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => alert('컬러 팔레트 추가 기능은 추후 지원 예정이에요.')}
          title="팔레트 추가"
          className="h-9 w-9 rounded-md border border-dashed border-meta-hairline hover:border-meta-stone hover:bg-meta-surface text-meta-stone text-base font-bold leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Sub Sticker 색상 팔레트 — variant prop만 설정. 4종 + 확장용 + 버튼.
// 화이트 swatch는 outline 스타일(검정 배경 + 흰 보더 + 흰 글씨)이라 swatch도 그 모양으로 표현.
function SubStickerColorPalette({ block, setProp }) {
  const SWATCHES = [
    { variant: 'black', bg: '#000000', label: '블랙 (네온 글씨)' },
    { variant: 'lemon', bg: '#FFFABA', label: '레몬 (검정 글씨)' },
    { variant: 'neon', bg: '#AAFF00', label: '네온 (검정 글씨)' },
    { variant: 'white', bg: '#000000', outline: true, label: '화이트 (검정 배경 · 흰 테두리/글씨)' },
  ];
  const cur = block.props.variant || 'black';
  return (
    <div>
      <div className="t-cap text-meta-steel mb-1.5">색상 팔레트</div>
      <div className="flex gap-2">
        {SWATCHES.map((s) => {
          const active = cur === s.variant;
          return (
            <button
              key={s.variant}
              type="button"
              onClick={() => setProp('variant', s.variant, { commit: true })}
              title={s.label}
              className={
                'h-9 w-9 rounded-md transition-all ' +
                (active
                  ? 'ring-2 ring-meta-primary ring-offset-2'
                  : 'border border-meta-hairline hover:border-meta-stone')
              }
              style={{
                background: s.bg,
                ...(s.outline ? { boxShadow: 'inset 0 0 0 2px #fff' } : {}),
              }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => alert('컬러 팔레트 추가 기능은 추후 지원 예정이에요.')}
          title="팔레트 추가"
          className="h-9 w-9 rounded-md border border-dashed border-meta-hairline hover:border-meta-stone hover:bg-meta-surface text-meta-stone text-base font-bold leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

// 스티커 색상 팔레트 — fill + textColor 동시 설정. 정사각형 swatch + 추후 확장용 + 버튼.
function StickerColorPalette({ block, setProp }) {
  const SWATCHES = [
    { fill: '#000000', textColor: '#FFFFFF', label: '블랙' },
    { fill: '#FFFABA', textColor: '#000000', label: '레몬' },
    { fill: '#AAFF00', textColor: '#000000', label: '네온그린' },
  ];
  const currentFill = (block.props.fill || '').toLowerCase();
  return (
    <div>
      <div className="t-cap text-meta-steel mb-1.5">색상 팔레트</div>
      <div className="flex gap-2">
        {SWATCHES.map((s) => {
          const active = currentFill === s.fill.toLowerCase();
          return (
            <button
              key={s.fill}
              type="button"
              onClick={() => {
                // fill 즉시 동기 + textColor commit 1회로 history 묶음
                setProp('fill', s.fill);
                setProp('textColor', s.textColor, { commit: true });
              }}
              title={s.label}
              className={
                'h-9 w-9 rounded-md transition-all ' +
                (active
                  ? 'ring-2 ring-meta-primary ring-offset-2'
                  : 'border border-meta-hairline hover:border-meta-stone')
              }
              style={{ background: s.fill }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => alert('컬러 팔레트 추가 기능은 추후 지원 예정이에요.')}
          title="팔레트 추가"
          className="h-9 w-9 rounded-md border border-dashed border-meta-hairline hover:border-meta-stone hover:bg-meta-surface text-meta-stone text-base font-bold leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

// 빈 페이지 전용 — 배경 분할 탭(분할없음/2분할/3분할) + 모든 슬롯 채워지면 배경 조정 섹션.
// bg1/bg2/bg3 개별 사이드바 필드는 제거됨 (캔버스에서 카메라 버튼으로 업로드).
function BlankBgEditor({ page, pageIndex, updatePageProp }) {
  const bgType = page.props.bgType || 'none';
  const scrimMode = page.props.scrim || 'none';
  const TYPES = [
    { v: 'none', label: '분할없음' },
    { v: 'split2', label: '2분할' },
    { v: 'split3', label: '3분할' },
  ];
  const SCRIMS = [
    { v: 'fullscreen', label: '전체화면' },
    { v: 'gradient', label: '그라데이션' },
    { v: 'none', label: '효과없음' },
  ];
  const n = bgType === 'split2' ? 2 : bgType === 'split3' ? 3 : 0;
  const filled = [1, 2, 3].slice(0, n).every((i) => !!page.props[`bg${i}`]);
  return (
    <div className="space-y-3 pt-4 mt-2 border-t border-meta-hairline-soft">
      <div>
        <div className="t-cap-b text-meta-ink-deep mb-1.5">배경 분할</div>
        <div className="grid grid-cols-3 gap-1">
          {TYPES.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => updatePageProp(pageIndex, 'bgType', t.v, { commit: true })}
              className={'pill-tab ' + (bgType === t.v ? 'is-active' : '')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="t-cap-b text-meta-ink-deep mb-1.5">배경 효과</div>
        <div className="grid grid-cols-3 gap-1">
          {SCRIMS.map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => updatePageProp(pageIndex, 'scrim', s.v, { commit: true })}
              className={'pill-tab ' + (scrimMode === s.v ? 'is-active' : '')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {n > 0 && filled && (
        <div className="pt-3 border-t border-meta-hairline-soft space-y-3">
          <div className="t-cap-b text-meta-steel">배경 조정</div>
          {Array.from({ length: n }).map((_, i) => {
            const key = `bg${i + 1}`;
            const posKey = `bg${i + 1}Position`;
            const scaleKey = `bg${i + 1}Scale`;
            return (
              <FieldEditor
                key={key}
                field={{ key, label: `배경 ${i + 1}`, type: 'image' }}
                value={page.props[key] ?? ''}
                onChange={(v) => updatePageProp(pageIndex, key, v)}
                onCommit={(v) => updatePageProp(pageIndex, key, v, { commit: true })}
                positionValue={page.props[posKey]}
                scaleValue={page.props[scaleKey]}
                onPositionCommit={(v, opts) => updatePageProp(pageIndex, posKey, v, opts || {})}
                onScaleCommit={(v, opts) => updatePageProp(pageIndex, scaleKey, v, opts || {})}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// 페이지 표시 (우하단 페이지 번호) 전역 토글 — 라벨은 다른 필드와 동일 t-cap-b
function PageNumberToggle({ project, setHide }) {
  const hide = !!project.hidePageNumber;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="t-cap-b text-meta-ink-deep">페이지 표시</label>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setHide(false)}
          className={'pill-tab ' + (!hide ? 'is-active' : '')}
        >
          표시
        </button>
        <button
          type="button"
          onClick={() => setHide(true)}
          className={'pill-tab ' + (hide ? 'is-active' : '')}
        >
          숨김
        </button>
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
