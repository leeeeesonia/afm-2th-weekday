// BlockRenderer — overlays 블록 1개 렌더링 + 선택/드래그/리사이즈/회전 + 더블클릭 텍스트 편집.
// useRef로 latest 함수 참조 → deps 변경에 의한 cleanup 방지 (drag 끊김 fix).
import React, { useRef, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { STICKER_REGISTRY } from '../design/stickers.jsx';
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
  if (type === 'sticker') {
    const entry = STICKER_REGISTRY.find((s) => s.kind === props.kind);
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

export function BlockRenderer({ block, allBlocks = [], scale, isSelected, onSelect, readonly = false }) {
  const ref = useRef(null);
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const duplicateBlocks = useProjectStore((s) => s.duplicateBlocks);
  const [editingText, setEditingText] = React.useState(false);

  // 최신 함수/값을 ref로 보관 → useEffect deps 변동으로 인한 cleanup 방지
  const latestRef = useRef({ block, allBlocks, scale, updateBlock, duplicateBlocks, onSelect, isSelected, readonly });
  latestRef.current = { block, allBlocks, scale, updateBlock, duplicateBlocks, onSelect, isSelected, readonly };

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
      e.stopPropagation();
      const { block: b, onSelect, duplicateBlocks } = getLatest();
      onSelect(b.id, { shift: e.shiftKey, alt: e.altKey });
      if (b.locked) return;

      // Alt+드래그 = 복제하여 새 블록 드래그
      if (e.altKey) {
        duplicateBlocks([b.id]);
        // 복제 후 새 블록이 selected 됨. 드래그는 다음 mouseup 이후 새 selection에서 시작.
        // 즉시 드래그 효과는 일단 생략 (구현 복잡, 사용자가 복제본을 직접 드래그하면 됨).
        return;
      }

      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        origX: b.x,
        origY: b.y,
        type: 'move',
        pointerId: e.pointerId,
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
        updateBlock(b.id, { x: newX, y: newY });
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
      }
    }

    function onUp() {
      if (dragState) {
        const { updateBlock, block: b } = getLatest();
        try {
          if (dragState.pointerId != null) el.releasePointerCapture?.(dragState.pointerId);
        } catch {}
        updateBlock(b.id, {}, { commit: true });
        dragState = null;
        publishSnapGuides([]);
      }
      detachDragListeners();
    }

    function onDblClick(e) {
      const { block: b } = getLatest();
      if (b.type === 'text') {
        e.stopPropagation();
        setEditingText(true);
      } else if (b.type === 'sticker') {
        // 스티커 안 텍스트 부분 인플레이스 편집
        const inner = e.target.closest('[data-cn-sticker-text]');
        if (inner) {
          e.stopPropagation();
          const initial = b.props.children || '';
          inner.setAttribute('contenteditable', 'true');
          inner.innerText = initial;
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
            const { updateBlock, block: bb } = getLatest();
            updateBlock(bb.id, { props: { children: inner.innerText } }, { commit: true });
            inner.removeAttribute('contenteditable');
            inner.removeEventListener('blur', onBlur);
            inner.removeEventListener('keydown', onKey);
          }
          function onKey(ev) {
            if (ev.key === 'Escape') {
              inner.innerText = initial;
              inner.blur();
            }
            ev.stopPropagation();
          }
          inner.addEventListener('blur', onBlur);
          inner.addEventListener('keydown', onKey);
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
    inner.addEventListener('blur', onBlur);
    inner.addEventListener('keydown', onKey);
    return () => {
      inner.removeEventListener('blur', onBlur);
      inner.removeEventListener('keydown', onKey);
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
          {HANDLES.map((hh) => (
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
