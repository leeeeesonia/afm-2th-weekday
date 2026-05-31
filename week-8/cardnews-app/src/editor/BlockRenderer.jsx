// BlockRenderer — overlays 블록 1개 렌더링 + 선택/드래그/리사이즈/회전 + 더블클릭 텍스트 편집.
// useRef로 latest 함수 참조 → deps 변경에 의한 cleanup 방지 (drag 끊김 fix).
import React, { useRef, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { STICKER_REGISTRY, STICKER_PLACEHOLDERS, ALL_STICKERS } from '../design/stickers.jsx';
import { CN_COLORS } from '../design/tokens.js';
import { uploadImage } from '../lib/uploadImage.js';

const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', x: 0, y: 0 },
  { id: 'n', cursor: 'ns-resize', x: 0.5, y: 0 },
  { id: 'ne', cursor: 'nesw-resize', x: 1, y: 0 },
  { id: 'e', cursor: 'ew-resize', x: 1, y: 0.5 },
  { id: 'se', cursor: 'nwse-resize', x: 1, y: 1 },
  { id: 's', cursor: 'ns-resize', x: 0.5, y: 1 },
  { id: 'sw', cursor: 'nesw-resize', x: 0, y: 1 },
  { id: 'w', cursor: 'ew-resize', x: 0, y: 0.5 },
];

// 이미지 블록 — 호버 시 카메라 아이콘으로 인플레이스 업로드 (ImageKit 직행)
function ImageBlockContent({ block }) {
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const fileRef = useRef(null);
  const [hover, setHover] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const { props } = block;
  const hasSrc = !!props.src;

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // 동일 파일 재선택 가능하게 리셋
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, { folder: 'cardnews/blocks' });
      updateBlock(block.id, { props: { src: url } }, { commit: true });
    } catch (err) {
      console.error('[upload]', err);
      alert(`업로드 실패: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  // BUG NOTE: React가 `background: undefined`를 시그널로 background 단축을 비우면
  // 같은 스타일 객체에서 먼저 설정된 background-image/size/position까지 함께 지움.
  // → background 단축은 절대 쓰지 말고 background-color 롱핸드만 사용.
  const borderValue = hasSrc
    ? (props.border ?? 3) > 0
      ? `${props.border ?? 3}px solid ${props.borderColor || '#000'}`
      : 'none'
    : `${(props.border ?? 3) || 3}px dashed ${props.borderColor || '#ced0d4'}`;
  // 확대(mask 효과) — 1 = cover 기본, > 1이면 확대.
  const objectScale = typeof props.objectScale === 'number' && props.objectScale >= 1 ? props.objectScale : 1;
  const objectPos = props.objectPosition || 'center';
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: hasSrc ? 'transparent' : '#f1f4f7',
        border: borderValue,
        borderRadius: props.borderRadius || 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 이미지 레이어 — zoom은 transform: scale로 처리 (cover 위에 얹어 추가 확대) */}
      {hasSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${props.src})`,
            backgroundSize: 'cover',
            backgroundPosition: objectPos,
            transform: `scale(${objectScale})`,
            transformOrigin: typeof objectPos === 'string' && objectPos !== 'center' ? objectPos : 'center center',
            pointerEvents: 'none',
          }}
        />
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
      {/* 카메라 아이콘 — 빈 상태에선 항상, 사진 있을 땐 호버 시에만 */}
      {(!hasSrc || hover) && (
        <button
          data-cn-control="camera"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
          title={hasSrc ? '이미지 변경' : '이미지 추가'}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 100,
            background: hasSrc ? 'rgba(10,19,23,0.78)' : 'rgba(10,19,23,0.92)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.14px',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {uploading ? '업로드 중…' : hasSrc ? '변경' : '이미지 추가'}
        </button>
      )}
    </div>
  );
}

function BlockContent({ block, editingText }) {
  const { type, props } = block;
  if (type === 'text') {
    const baseStyle = {
      width: '100%',
      height: '100%',
      padding: '4px 8px',
      boxSizing: 'border-box',
      color: props.color || '#000',
      fontSize: props.fontSize || 32,
      fontWeight: props.fontWeight || 500,
      fontFamily: props.fontFamily === 'archivo' ? "'Archivo Narrow', sans-serif" : "'Pretendard Variable', Pretendard, sans-serif",
      textAlign: props.align || 'left',
      lineHeight: props.lineHeight || 1.4,
      letterSpacing: `${props.letterSpacing ?? -0.04}em`,
      whiteSpace: 'pre-wrap',
      wordBreak: 'keep-all',
      overflowWrap: 'anywhere',
      outline: editingText ? `2px solid ${CN_COLORS.neon}` : 'none',
      outlineOffset: 0,
      cursor: editingText ? 'text' : 'inherit',
    };
    if (editingText) {
      // contentEditable 모드 — dangerouslySetInnerHTML 사용 안 함 (사용자 입력이 매 렌더마다 덮어쓰여지는 버그 회피).
      // 초기 innerHTML은 BlockRenderer useEffect에서 설정.
      return (
        <div
          data-block-text="1"
          contentEditable
          suppressContentEditableWarning
          style={baseStyle}
        />
      );
    }
    return (
      <div
        data-block-text="1"
        style={baseStyle}
        dangerouslySetInnerHTML={{ __html: props.html || '' }}
      />
    );
  }
  if (type === 'image') {
    return <ImageBlockContent block={block} />;
  }
  if (type === 'shape') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: props.fill || '#AAFF00',
          border: props.border ? `${props.border}px solid ${props.borderColor || '#000'}` : 'none',
          borderRadius: props.borderRadius || 0,
          boxSizing: 'border-box',
        }}
      />
    );
  }
  if (type === 'line') {
    const w = typeof block.w === 'number' ? block.w : 200;
    const h = typeof block.h === 'number' ? block.h : 20;
    const sw = props.strokeWidth || 1;
    const color = props.color || '#000000';
    const dotR = props.dotRadius || 4;
    const cy = h / 2;
    const dashed = props.style === 'dashed';
    const startX = dotR;
    const endX = Math.max(dotR, w - dotR);
    const HIT_R = 10; // endpoint 드래그 hit zone (visible dot보다 큼)
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* 본체 hit-area — 빈 공간 클릭으로 라인 선택/이동 */}
        <rect width={w} height={h} fill="transparent" />
        <line
          x1={startX}
          y1={cy}
          x2={endX}
          y2={cy}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          {...(dashed ? { strokeDasharray: `${props.dashLen || 10} ${props.dashGap || 3}` } : {})}
        />
        {/* 끝점에만 동그라미 표시 (시작점은 점 없음) */}
        <circle cx={endX} cy={cy} r={dotR} fill={color} />
        {/* 시작점 hit zone — 동그라미 없지만 드래그로 잡을 수 있게 투명 원 */}
        <circle
          cx={startX}
          cy={cy}
          r={HIT_R}
          fill="transparent"
          pointerEvents="all"
          data-line-endpoint="start"
          style={{ cursor: 'crosshair' }}
        />
        {/* 끝점 hit zone — 동그라미 위에 더 큰 투명 원 */}
        <circle
          cx={endX}
          cy={cy}
          r={HIT_R}
          fill="transparent"
          pointerEvents="all"
          data-line-endpoint="end"
          style={{ cursor: 'crosshair' }}
        />
      </svg>
    );
  }
  if (type === 'sticker') {
    // 레거시 brandInsightCloud 포함 — ALL_STICKERS로 검색
    const entry = ALL_STICKERS.find((s) => s.kind === props.kind);
    if (!entry) return null;
    const Comp = entry.Component;
    const { kind, ...rest } = props;
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Comp {...rest} />
      </div>
    );
  }
  return null;
}

export function BlockRenderer({ block, allBlocks = [], selectedBlockIds = [], scale, isSelected, onSelect, readonly = false }) {
  const ref = useRef(null);
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const duplicateBlocks = useProjectStore((s) => s.duplicateBlocks);
  const [editingText, setEditingText] = React.useState(false);

  // 최신 함수/값을 ref로 보관 → useEffect deps 변동으로 인한 cleanup 방지
  const latestRef = useRef({ block, allBlocks, selectedBlockIds, scale, updateBlock, duplicateBlocks, onSelect, isSelected, readonly });
  latestRef.current = { block, allBlocks, selectedBlockIds, scale, updateBlock, duplicateBlocks, onSelect, isSelected, readonly };

  // readonly면 모든 인터랙션 차단 — 썸네일/그리드 미리보기용
  useEffect(() => {
    if (readonly) return;
    const el = ref.current;
    if (!el) return;

    let dragState = null;

    function getLatest() {
      return latestRef.current;
    }

    function onPointerDown(e) {
      // 텍스트 편집 중이면 drag 안 함
      if (e.target.closest('[data-block-text]') && e.target.getAttribute('contenteditable') === 'true') {
        return;
      }
      if (e.target.closest('[data-cn-sticker-text]') && e.target.getAttribute('contenteditable') === 'true') {
        return;
      }
      // 카메라 버튼 / 인플레이스 컨트롤 위 클릭이면 drag 시작 안 함
      if (e.target.closest('[data-cn-control]')) return;
      if (e.defaultPrevented) return;

      const handle = e.target.closest('[data-handle]');
      if (handle) {
        startResize(e, handle.dataset.handle);
        return;
      }
      const rotate = e.target.closest('[data-rotate]');
      if (rotate) {
        startRotate(e);
        return;
      }
      // 라인 endpoint 드래그 — 시작점/끝점을 잡아당겨 길이 + 회전 동시 조정
      const lineEndpoint = e.target.closest('[data-line-endpoint]');
      if (lineEndpoint && latestRef.current.block.type === 'line') {
        startLineEndpointDrag(e, lineEndpoint.dataset.lineEndpoint);
        return;
      }
      e.stopPropagation();
      const { block: b, onSelect, duplicateBlocks, selectedBlockIds, allBlocks } = getLatest();
      // 이미 멀티 선택된 블록을 클릭하면 selection 유지 (그룹 드래그 진입용).
      // shift+클릭은 항상 onSelect로 토글 처리.
      const inMulti = Array.isArray(selectedBlockIds) && selectedBlockIds.length > 1 && selectedBlockIds.includes(b.id);
      if (!inMulti || e.shiftKey) {
        onSelect(b.id, { shift: e.shiftKey, alt: e.altKey });
      }
      if (b.locked) return;

      // Alt+드래그 = 복제하여 새 블록 드래그
      if (e.altKey) {
        duplicateBlocks([b.id]);
        // 복제 후 새 블록이 selected 됨. 드래그는 다음 mouseup 이후 새 selection에서 시작.
        // 즉시 드래그 효과는 일단 생략 (구현 복잡, 사용자가 복제본을 직접 드래그하면 됨).
        return;
      }

      // 스티커 텍스트 / 텍스트 블록 영역 클릭 — 단일 클릭으로 인라인 편집 진입(움직임 없을 때).
      // 움직이면 드래그 이동, 안 움직이면 onUp에서 편집 모드로 전환.
      const stickerTextEl = b.type === 'sticker' ? e.target.closest('[data-cn-sticker-text]') : null;
      const textBlockEl = b.type === 'text' ? e.target.closest('[data-block-text]') : null;

      // 멀티 선택 상태 → 그룹 드래그용 원본 위치 기록 (선택된 모든 블록의 x/y).
      // 인라인 편집 진입과 충돌 방지 위해, 그룹 모드일 땐 텍스트 hit 무시.
      const groupOriginals = inMulti
        ? allBlocks.filter((blk) => selectedBlockIds.includes(blk.id) && !blk.locked)
            .map((blk) => ({ id: blk.id, x: blk.x, y: blk.y }))
        : null;

      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        origX: b.x,
        origY: b.y,
        type: 'move',
        pointerId: e.pointerId,
        stickerTextEl: groupOriginals ? null : stickerTextEl,
        textBlockEl: groupOriginals ? null : textBlockEl,
        groupOriginals,
        didMove: false,
      };
      attachDragListeners(e.pointerId);
    }

    function startResize(e, handleId) {
      e.stopPropagation();
      const { block: b } = getLatest();
      const w = b.w === 'auto' ? el.offsetWidth : b.w;
      const h = b.h === 'auto' ? el.offsetHeight : b.h;
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        origX: b.x,
        origY: b.y,
        origW: w,
        origH: h,
        handle: handleId,
        type: 'resize',
        pointerId: e.pointerId,
      };
      attachDragListeners(e.pointerId);
    }

    function startRotate(e) {
      e.stopPropagation();
      const { block: b } = getLatest();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      dragState = {
        cx,
        cy,
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) - ((b.rotation || 0) * Math.PI) / 180,
        type: 'rotate',
        pointerId: e.pointerId,
      };
      attachDragListeners(e.pointerId);
    }

    // 라인 endpoint 드래그 — start 또는 end 점을 마우스로 이동.
    // 반대편 endpoint는 고정, 드래그하는 점이 마우스를 따라감 → 길이/회전이 함께 갱신.
    function startLineEndpointDrag(e, which) {
      e.stopPropagation();
      const { block: b, onSelect } = getLatest();
      onSelect(b.id, { shift: e.shiftKey });
      if (b.locked) return;
      const w = typeof b.w === 'number' ? b.w : 200;
      const h = typeof b.h === 'number' ? b.h : 20;
      const dotR = b.props.dotRadius || 4;
      const halfL = (w - 2 * dotR) / 2;
      const cx = b.x + w / 2;
      const cy = b.y + h / 2;
      const rad = ((b.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const startPt = { x: cx - halfL * cos, y: cy - halfL * sin };
      const endPt = { x: cx + halfL * cos, y: cy + halfL * sin };
      const other = which === 'end' ? startPt : endPt;
      const dragged = which === 'end' ? endPt : startPt;
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        otherX: other.x,
        otherY: other.y,
        origDraggedX: dragged.x,
        origDraggedY: dragged.y,
        h,
        dotR,
        which,
        type: 'line-endpoint',
        pointerId: e.pointerId,
      };
      attachDragListeners(e.pointerId);
    }

    // 드래그 listener 부착 — pointerup이 안 오는 케이스(브라우저 밖 release, alt-tab, 컨텍스트메뉴 등)에
    // 대비해 pointercancel / lostpointercapture / mouseup / window blur까지 모두 잡음.
    function attachDragListeners(pointerId) {
      try {
        el.setPointerCapture?.(pointerId);
      } catch {}
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('blur', onUp);
      el.addEventListener('lostpointercapture', onUp);
    }
    function detachDragListeners() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('blur', onUp);
      el.removeEventListener('lostpointercapture', onUp);
    }

    function publishSnapGuides(guides) {
      window.dispatchEvent(new CustomEvent('cn-snap-guides', { detail: guides }));
    }

    // 스냅 — 다른 블록 + 캔버스(0, 540, 1080 v / 0, 675, 1350 h)와의 정렬 검사
    function snapPosition(b, newX, newY) {
      const { allBlocks } = getLatest();
      const TH = 6; // 6px 임계 (캔버스 좌표)
      const bw = typeof b.w === 'number' ? b.w : 100;
      const bh = typeof b.h === 'number' ? b.h : 100;
      const cx = newX + bw / 2;
      const cy = newY + bh / 2;
      const right = newX + bw;
      const bottom = newY + bh;

      const vTargets = [0, 540, 1080]; // canvas left/center/right
      const hTargets = [0, 675, 1350];
      for (const other of allBlocks) {
        if (other.id === b.id) continue;
        const ow = typeof other.w === 'number' ? other.w : 100;
        const oh = typeof other.h === 'number' ? other.h : 100;
        vTargets.push(other.x, other.x + ow / 2, other.x + ow);
        hTargets.push(other.y, other.y + oh / 2, other.y + oh);
      }

      const guides = [];
      let dx = 0, dy = 0;
      // V — left, center, right
      for (const t of vTargets) {
        if (Math.abs(newX - t) <= TH) { dx = t - newX; guides.push({ type: 'v', pos: t }); break; }
        if (Math.abs(cx - t) <= TH) { dx = t - cx; guides.push({ type: 'v', pos: t }); break; }
        if (Math.abs(right - t) <= TH) { dx = t - right; guides.push({ type: 'v', pos: t }); break; }
      }
      // H — top, middle, bottom
      for (const t of hTargets) {
        if (Math.abs(newY - t) <= TH) { dy = t - newY; guides.push({ type: 'h', pos: t }); break; }
        if (Math.abs(cy - t) <= TH) { dy = t - cy; guides.push({ type: 'h', pos: t }); break; }
        if (Math.abs(bottom - t) <= TH) { dy = t - bottom; guides.push({ type: 'h', pos: t }); break; }
      }
      return { x: newX + dx, y: newY + dy, guides };
    }

    function onMove(e) {
      if (!dragState) return;
      // 안전장치: pointerup이 어떤 이유로든 누락되어도 버튼이 떼진 상태(e.buttons === 0)면 즉시 드래그 종료.
      // 일부 환경(트랙패드, OS 다이얼로그 개입 등)에서 pointerup이 손실되는 케이스 방어.
      if (typeof e.buttons === 'number' && e.buttons === 0) {
        onUp();
        return;
      }
      const { scale: sc = 1, updateBlock, block: b } = getLatest();
      if (dragState.type === 'move') {
        const dx = (e.clientX - dragState.startX) / sc;
        const dy = (e.clientY - dragState.startY) / sc;
        // 스티커/텍스트 블록 텍스트 클릭은 click vs drag 구분 — 4px 이내는 클릭, 위치 안 바꿈
        if ((dragState.stickerTextEl || dragState.textBlockEl) && !dragState.didMove) {
          if (Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY) < 4) return;
          dragState.didMove = true;
        }
        const sx = e.shiftKey ? (Math.abs(dx) > Math.abs(dy) ? dx : 0) : dx;
        const sy = e.shiftKey ? (Math.abs(dy) >= Math.abs(dx) ? dy : 0) : dy;
        let newX = dragState.origX + sx;
        let newY = dragState.origY + sy;
        if (!e.shiftKey) {
          const sn = snapPosition(b, newX, newY);
          newX = sn.x;
          newY = sn.y;
          publishSnapGuides(sn.guides);
        } else {
          publishSnapGuides([]);
        }
        // 그룹 드래그 — 그랩한 블록 기준 snap-adjusted delta를 모든 선택 블록에 동일하게 적용
        if (Array.isArray(dragState.groupOriginals) && dragState.groupOriginals.length > 1) {
          const finalDx = newX - dragState.origX;
          const finalDy = newY - dragState.origY;
          for (const orig of dragState.groupOriginals) {
            updateBlock(orig.id, { x: orig.x + finalDx, y: orig.y + finalDy });
          }
        } else {
          updateBlock(b.id, { x: newX, y: newY });
        }
      } else if (dragState.type === 'resize') {
        const dx = (e.clientX - dragState.startX) / sc;
        const dy = (e.clientY - dragState.startY) / sc;
        let { origX, origY, origW, origH, handle } = dragState;
        let x = origX,
          y = origY,
          w = origW,
          h = origH;
        if (handle.includes('e')) w = origW + dx;
        if (handle.includes('w')) {
          w = origW - dx;
          x = origX + dx;
        }
        if (handle.includes('s')) h = origH + dy;
        if (handle.includes('n')) {
          h = origH - dy;
          y = origY + dy;
        }
        if (e.shiftKey) {
          const ratio = origW / origH;
          if (Math.abs(dx) > Math.abs(dy)) h = w / ratio;
          else w = h * ratio;
          if (handle.includes('w')) x = origX + (origW - w);
          if (handle.includes('n')) y = origY + (origH - h);
        }
        w = Math.max(20, w);
        h = Math.max(20, h);
        updateBlock(b.id, { x, y, w, h });
      } else if (dragState.type === 'rotate') {
        const ang = Math.atan2(e.clientY - dragState.cy, e.clientX - dragState.cx) - dragState.startAngle;
        let deg = (ang * 180) / Math.PI;
        if (e.shiftKey) deg = Math.round(deg / 15) * 15;
        updateBlock(b.id, { rotation: deg });
      } else if (dragState.type === 'line-endpoint') {
        const dx = (e.clientX - dragState.startX) / sc;
        const dy = (e.clientY - dragState.startY) / sc;
        const draggedX = dragState.origDraggedX + dx;
        const draggedY = dragState.origDraggedY + dy;
        const { otherX, otherY, h: bh, dotR, which } = dragState;
        const startX_pt = which === 'end' ? otherX : draggedX;
        const startY_pt = which === 'end' ? otherY : draggedY;
        const endX_pt = which === 'end' ? draggedX : otherX;
        const endY_pt = which === 'end' ? draggedY : otherY;
        const len = Math.hypot(endX_pt - startX_pt, endY_pt - startY_pt);
        const angleDeg = (Math.atan2(endY_pt - startY_pt, endX_pt - startX_pt) * 180) / Math.PI;
        const newCx = (startX_pt + endX_pt) / 2;
        const newCy = (startY_pt + endY_pt) / 2;
        const newW = Math.max(20, len + 2 * dotR);
        updateBlock(b.id, {
          x: newCx - newW / 2,
          y: newCy - bh / 2,
          w: newW,
          rotation: angleDeg,
        });
      }
    }

    function onUp() {
      if (dragState) {
        const { updateBlock, block: b } = getLatest();
        try {
          if (dragState.pointerId != null) el.releasePointerCapture?.(dragState.pointerId);
        } catch {}
        // 스티커 텍스트 클릭 — 움직임 없었으면 인라인 편집 모드 진입
        if (dragState.stickerTextEl && !dragState.didMove) {
          startStickerEdit(dragState.stickerTextEl);
          dragState = null;
          publishSnapGuides([]);
          detachDragListeners();
          return;
        }
        // 텍스트 블록 클릭 — 움직임 없었으면 contentEditable 편집 모드 진입
        if (dragState.textBlockEl && !dragState.didMove) {
          // 사이드바 textarea가 포커스 중이면 먼저 flush
          const focused = document.activeElement;
          if (focused && (focused.tagName === 'TEXTAREA' || focused.tagName === 'INPUT')) {
            focused.blur();
          }
          setEditingText(true);
          dragState = null;
          publishSnapGuides([]);
          detachDragListeners();
          return;
        }
        updateBlock(b.id, {}, { commit: true });
        dragState = null;
        publishSnapGuides([]);
      }
      detachDragListeners();
    }

    // 스티커 텍스트 인라인 편집 — children 또는 line-idx 모드 지원.
    //
    // 처리 순서가 중요:
    //   1) 사이드바 textarea/input이 포커스 중이면 먼저 blur → onChange/onBlur 핸들러가 최신값을 store에 커밋
    //   2) store에서 직접 최신 block 읽기 (React render 지연으로 latestRef가 stale일 수 있음)
    //   3) placeholder 클릭은 inner를 비우고 hasInput 플래그로 실제 타이핑 여부 추적
    //   4) commit 시 빈 결과면 DOM을 placeholder 상태로 직접 복구 (React vDOM이 동일해서 reconcile 스킵하는 케이스 방어)
    function startStickerEdit(inner) {
      // 1) 다른 입력 강제 flush
      const focused = document.activeElement;
      if (focused && focused !== inner && (focused.tagName === 'TEXTAREA' || focused.tagName === 'INPUT')) {
        focused.blur();
      }

      // 2) store에서 직접 최신 block 읽기
      const state = useProjectStore.getState();
      const proj = state.projects.find((p) => p.id === state.activeProjectId);
      const pg = proj?.pages[state.activePageIndex];
      const myId = latestRef.current.block.id;
      const liveBlock = pg?.overlays.find((bb) => bb.id === myId) || latestRef.current.block;

      const lineIdxStr = inner.dataset.cnStickerLineIdx;
      const isLineMode = lineIdxStr != null && lineIdxStr !== '';
      const lineIdx = isLineMode ? Number(lineIdxStr) : -1;
      const wasPlaceholder = inner.dataset.cnStickerPlaceholder === '1';
      const stickerKind = liveBlock.props.kind;
      const placeholderText = STICKER_PLACEHOLDERS[stickerKind] || '';

      let initial = '';
      if (!wasPlaceholder) {
        if (isLineMode) {
          const raw = liveBlock.props.children;
          if (typeof raw === 'string' && raw.length > 0) {
            initial = raw.split('\n')[lineIdx] || '';
          } else if (Array.isArray(liveBlock.props.lines)) {
            initial = liveBlock.props.lines[lineIdx] || '';
          }
        } else {
          initial = liveBlock.props.children || '';
        }
      }

      inner.setAttribute('contenteditable', 'true');
      inner.setAttribute('data-cn-sticker-placeholder', '0');
      inner.style.opacity = '1';
      // 3) placeholder 클릭은 비워서 새로 입력 시작, 실제 텍스트는 그대로 표시
      inner.innerText = wasPlaceholder ? '' : initial;

      let hasInput = false;
      function onInput() { hasInput = true; }

      requestAnimationFrame(() => {
        inner.focus();
        if (!wasPlaceholder && initial) {
          const range = document.createRange();
          range.selectNodeContents(inner);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });

      function commit() {
        // 실제 텍스트 편집 — inner.innerText 그대로 (사용자가 명시적으로 지웠으면 '').
        // placeholder 클릭 후 아무것도 안 친 경우만 hasInput=false로 빈 commit (= placeholder 복귀).
        // 이 분기 없이 무조건 hasInput을 보면, 기존 텍스트 위 클릭하고 안 친 채 blur할 때 텍스트가 사라지는 버그.
        const text = wasPlaceholder
          ? (hasInput ? inner.innerText : '')
          : inner.innerText;
        const { updateBlock: ub, block: bb } = getLatest();
        if (isLineMode) {
          let arr;
          if (typeof bb.props.children === 'string' && bb.props.children.length > 0) {
            arr = bb.props.children.split('\n');
          } else if (Array.isArray(bb.props.lines)) {
            arr = bb.props.lines.slice();
          } else {
            arr = [];
          }
          while (arr.length <= lineIdx) arr.push('');
          arr[lineIdx] = text;
          while (arr.length > 1 && arr[arr.length - 1] === '') arr.pop();
          ub(bb.id, { props: { children: arr.join('\n'), lines: undefined } }, { commit: true });
        } else {
          ub(bb.id, { props: { children: text } }, { commit: true });
        }
        inner.removeAttribute('contenteditable');
        inner.removeEventListener('blur', commit);
        inner.removeEventListener('keydown', onKey);
        inner.removeEventListener('input', onInput);

        // 4) 빈 commit이면 DOM을 placeholder 상태로 복구
        //    React vDOM은 {children=''} → !children === true → placeholder 그대로라 DOM 업데이트 스킵.
        //    수동 복구하지 않으면 박스가 빈 채 박제됨.
        if (!text && placeholderText) {
          inner.innerText = placeholderText;
          inner.style.opacity = '0.4';
          inner.setAttribute('data-cn-sticker-placeholder', '1');
        }
      }
      function onKey(ev) {
        if (ev.key === 'Escape') {
          hasInput = false;
          inner.blur();
        } else if (ev.key === 'Enter' && !ev.shiftKey && inner.style.whiteSpace === 'nowrap') {
          ev.preventDefault();
          inner.blur();
        }
        ev.stopPropagation();
      }
      // 외부 텍스트 복붙 시 source 폰트/사이즈 따라오는 문제 차단 → plain text만 삽입
      function onPaste(ev) {
        ev.preventDefault();
        const text = ev.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
        hasInput = true;
      }
      inner.addEventListener('input', onInput);
      inner.addEventListener('blur', commit);
      inner.addEventListener('keydown', onKey);
      inner.addEventListener('paste', onPaste);
    }

    function onDblClick(e) {
      const { block: b } = getLatest();
      if (b.type === 'text') {
        e.stopPropagation();
        setEditingText(true);
      } else if (b.type === 'sticker') {
        // 스티커는 단일 클릭으로도 진입 가능하지만 dblclick도 호환 유지
        const inner = e.target.closest('[data-cn-sticker-text]');
        if (inner) {
          e.stopPropagation();
          startStickerEdit(inner);
        }
      }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('dblclick', onDblClick);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('dblclick', onDblClick);
      detachDragListeners();
    };
    // ↓ deps 비움 — mount 시 한 번만. latest는 ref로 접근.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 텍스트 편집 진입 시: innerHTML 1회 set + focus + caret 끝
  useEffect(() => {
    if (!editingText) return;
    const inner = ref.current?.querySelector('[data-block-text]');
    if (!inner) return;
    inner.innerHTML = block.props.html || '';
    requestAnimationFrame(() => {
      inner.focus();
      const range = document.createRange();
      range.selectNodeContents(inner);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });

    function onBlur() {
      const html = inner.innerHTML;
      latestRef.current.updateBlock(block.id, { props: { html } }, { commit: true });
      setEditingText(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        inner.blur();
      }
    }
    function onPaste(e) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    }
    inner.addEventListener('blur', onBlur);
    inner.addEventListener('keydown', onKey);
    inner.addEventListener('paste', onPaste);
    return () => {
      inner.removeEventListener('blur', onBlur);
      inner.removeEventListener('keydown', onKey);
      inner.removeEventListener('paste', onPaste);
    };
  }, [editingText, block.id]);

  if (block.hidden) return null;
  const w = block.w === 'auto' ? 'auto' : block.w;
  const h = block.h === 'auto' ? 'auto' : block.h;

  // 선택 인디케이터 — 실제 border와 혼동되지 않도록 점선 + 블록 borderRadius 따라감
  const selectionRadius = block.type === 'image' ? (block.props?.borderRadius || 0) : 0;
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: block.x,
        top: block.y,
        width: w,
        height: h,
        transform: `rotate(${block.rotation || 0}deg)`,
        transformOrigin: 'center center',
        zIndex: 100 + (block.z || 0),
        cursor: readonly ? 'inherit' : block.locked ? 'default' : editingText ? 'text' : 'move',
        // readonly = 썸네일/그리드 미리보기 — 클릭이 부모 버튼으로 통과되어야 함
        pointerEvents: readonly ? 'none' : 'auto',
        userSelect: editingText ? 'text' : 'none',
      }}
    >
      <BlockContent block={block} editingText={editingText} />
      {/* 선택 인디케이터 — 점선 + borderRadius 따라가는 별도 레이어. 클릭 패스스루. */}
      {isSelected && !editingText && (
        <div
          style={{
            position: 'absolute',
            inset: -3,
            border: `2px dashed ${CN_COLORS.neon}`,
            borderRadius: selectionRadius + 3,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      {isSelected && !block.locked && !editingText && (
        <>
          {/* 라인은 box resize 핸들 대신 endpoint 핸들(SVG 안)로 길이/회전 동시 조정 */}
          {block.type !== 'line' && HANDLES.map((hh) => (
            <span
              key={hh.id}
              data-handle={hh.id}
              style={{
                position: 'absolute',
                left: `${hh.x * 100}%`,
                top: `${hh.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                background: '#fff',
                border: `2px solid ${CN_COLORS.neon}`,
                borderRadius: 2,
                cursor: hh.cursor,
              }}
            />
          ))}
          <span
            data-rotate="1"
            style={{
              position: 'absolute',
              left: '50%',
              top: -28,
              transform: 'translateX(-50%)',
              width: 14,
              height: 14,
              background: CN_COLORS.neon,
              border: `2px solid ${CN_COLORS.black}`,
              borderRadius: '50%',
              cursor: 'grab',
            }}
          />
        </>
      )}
    </div>
  );
}
