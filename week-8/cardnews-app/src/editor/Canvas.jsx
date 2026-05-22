// Canvas — 1080×1350 페이지 렌더 + [data-cn-field] 인플레이스 편집.
// 키 단축키: Cmd+B 볼드 토글 / Cmd+Shift+H 형광 토글 / Enter 단일행 커밋 / Escape 원복.
// blur 시 innerHTML 저장 (서식 보존).
import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';
import { getVariant } from '../templates/registry.js';
import { CARD_W, CARD_H, CN_THEMES } from '../design/tokens.js';
import { ThemeContext, BgPhotoContext } from '../design/primitives.jsx';
import { BlockRenderer } from './BlockRenderer.jsx';

/* ───── selection helpers ───── */
function isSelectionInside(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  return el.contains(range.commonAncestorContainer);
}

function toggleHighlight() {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  // 이미 mark.cn-hl 안에 있으면 해제
  let node = range.commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentElement;
  const marker = node?.closest?.('mark.cn-hl');
  if (marker) {
    const parent = marker.parentNode;
    while (marker.firstChild) parent.insertBefore(marker.firstChild, marker);
    parent.removeChild(marker);
    parent.normalize();
    return;
  }
  // 새로 감싸기
  const mark = document.createElement('mark');
  mark.className = 'cn-hl';
  try {
    range.surroundContents(mark);
  } catch {
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);
  }
  // selection 보존
  const newRange = document.createRange();
  newRange.selectNodeContents(mark);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/* ───── HTML → plain (sidebar 표시용에서도 사용됨, 여기선 commit-time normalize) ───── */
function normalizeHtml(html, multiline) {
  // <div>나 <p> 줄바꿈을 <br>로, 그 외 허용 태그(b/strong/i/em/mark)만 유지.
  // 단순 sanitize: 허용 태그 외 모두 제거. iframe/script 등 차단.
  const ALLOW = new Set(['B', 'STRONG', 'I', 'EM', 'MARK', 'BR', 'SPAN']);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // <div> / <p> → <br>로 평면화 (contentEditable이 만든 줄바꿈)
  function flatten(node) {
    const children = Array.from(node.childNodes);
    for (const c of children) {
      if (c.nodeType === 1) {
        if (c.tagName === 'DIV' || c.tagName === 'P') {
          flatten(c);
          // 앞에 br 삽입 (첫 번째 줄 제외)
          if (c.previousSibling) c.parentNode.insertBefore(document.createElement('br'), c);
          // children을 부모로 옮김
          while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c);
          c.parentNode.removeChild(c);
        } else if (!ALLOW.has(c.tagName)) {
          // 허용 태그 외 unwrap
          while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c);
          c.parentNode.removeChild(c);
        } else {
          // mark의 경우 class도 정리
          if (c.tagName === 'MARK') {
            const isHl = c.classList.contains('cn-hl');
            for (const attr of Array.from(c.attributes)) c.removeAttribute(attr.name);
            if (isHl) c.className = 'cn-hl';
          }
          // span은 무의미하면 unwrap
          if (c.tagName === 'SPAN' && !c.className) {
            while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c);
            c.parentNode.removeChild(c);
            continue;
          }
          flatten(c);
        }
      }
    }
  }
  flatten(wrapper);

  let out = wrapper.innerHTML;
  if (!multiline) {
    out = out.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
  }
  // 끝에 빈 <br> 제거
  out = out.replace(/(<br\s*\/?>)+$/i, '');
  return out;
}

/* ───── Floating format toolbar ───── */
function FormatBar({ target }) {
  const [pos, setPos] = useState(null);
  const [state, setState] = useState({ b: false, hl: false });

  useEffect(() => {
    function update() {
      const sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) {
        setPos(null);
        return;
      }
      if (!target || !isSelectionInside(target)) {
        setPos(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return setPos(null);
      setPos({ left: rect.left + rect.width / 2, top: rect.top - 8 });
      // 활성 상태 감지
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;
      setState({
        b: !!node?.closest?.('b, strong'),
        hl: !!node?.closest?.('mark.cn-hl'),
      });
    }
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, [target]);

  if (!pos) return null;
  return (
    <div className="cn-format-bar" style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -100%)' }}>
      <button
        title="볼드 (⌘B)"
        className={state.b ? 'is-active' : ''}
        onMouseDown={(e) => {
          e.preventDefault();
          document.execCommand('bold');
        }}
      >
        B
      </button>
      <button
        title="형광 (⌘⇧H)"
        className={state.hl ? 'is-active' : ''}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleHighlight();
        }}
      >
        H
      </button>
    </div>
  );
}

/* ───── Canvas root ───── */
export function Canvas({ project, page, pageIndex, scale, editable = true, idPrefix = 'page-canvas' }) {
  const ref = useRef(null);
  const updatePageProp = useProjectStore((s) => s.updatePageProp);
  const setSelectedBlocks = useProjectStore((s) => s.setSelectedBlocks);
  const toggleSelectBlock = useProjectStore((s) => s.toggleSelectBlock);
  const clearSelection = useProjectStore((s) => s.clearSelection);
  const selectedBlockIds = useProjectStore((s) => s.selectedBlockIds);
  const initialRef = useRef('');
  const [activeEl, setActiveEl] = useState(null);
  const [marquee, setMarquee] = useState(null); // { x, y, w, h } 캔버스 좌표
  // 스냅 가이드 라인 — BlockRenderer가 publish, Canvas가 렌더
  const [snapGuides, setSnapGuides] = useState([]); // [{type:'v'|'h', pos}]
  React.useEffect(() => {
    function on(e) {
      setSnapGuides(e.detail || []);
    }
    window.addEventListener('cn-snap-guides', on);
    return () => window.removeEventListener('cn-snap-guides', on);
  }, []);

  useEffect(() => {
    if (!editable) return;
    const root = ref.current;
    if (!root) return;

    function findTarget(e) {
      // 1) 상승: e.target에서 root까지 [data-cn-field] 탐색
      let el = e.target;
      while (el && el !== root) {
        if (el.dataset && el.dataset.cnField) return el;
        el = el.parentElement;
      }
      // 2) 폴백: 좌표 아래 모든 요소에서 [data-cn-field] 탐색
      //    (오버레이/스크림 등 투명 레이어가 e.target을 가로채는 경우 대비)
      if (typeof document !== 'undefined' && document.elementsFromPoint) {
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        for (const node of els) {
          if (!root.contains(node)) continue;
          // 블록 오버레이 자식(드래그 가능 블록)이면 스킵 — 별도 핸들러
          if (node.closest?.('[data-block-overlay] > div')) continue;
          const field = node.closest?.('[data-cn-field]');
          if (field && root.contains(field)) return field;
        }
      }
      return null;
    }

    function commit(el) {
      const key = el.dataset.cnField;
      if (!key) return;
      const multi = !!el.dataset.cnMultiline;
      const html = normalizeHtml(el.innerHTML, multi);
      updatePageProp(pageIndex, key, html, { commit: true });
      el.removeAttribute('contenteditable');
      setActiveEl(null);
    }

    function onMouseDown(e) {
      const el = findTarget(e);
      if (!el) {
        // 다른 곳 클릭 → 기존 editing blur
        const active = root.querySelector('[contenteditable="true"]');
        if (active) active.blur();
        const isBlockClick = e.target.closest('[data-block-overlay] > div');
        if (!isBlockClick) {
          // 블록 위 아닌 빈 곳 → marquee 시작 (Shift 누른 상태면 기존 선택 유지)
          if (!e.shiftKey) clearSelection();
          startMarquee(e);
          return;
        }
        return;
      }
      if (el.getAttribute('contenteditable') === 'true') return;
      const prevActive = root.querySelector('[contenteditable="true"]');
      if (prevActive && prevActive !== el) prevActive.blur();
      el.setAttribute('contenteditable', 'true');
      initialRef.current = el.innerHTML;
      setActiveEl(el);
      requestAnimationFrame(() => {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    }

    function onBlur(e) {
      const el = e.target;
      if (!el?.dataset?.cnField) return;
      if (el.getAttribute('contenteditable') !== 'true') return;
      // toolbar 버튼 클릭 시 blur가 발생하는데, 그 경우는 e.relatedTarget이 toolbar 안.
      const rel = e.relatedTarget;
      if (rel && rel.closest?.('.cn-format-bar')) return; // ignore
      commit(el);
    }

    function onKey(e) {
      const el = document.activeElement;
      if (!el?.dataset?.cnField || el.getAttribute('contenteditable') !== 'true') return;
      const meta = e.metaKey || e.ctrlKey;
      // 형광 (⌘⇧H)
      if (meta && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleHighlight();
        return;
      }
      // 볼드 (⌘B) — 브라우저 기본 execCommand 동작도 있지만 명시
      if (meta && !e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        document.execCommand('bold');
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        el.innerHTML = initialRef.current;
        el.removeAttribute('contenteditable');
        setActiveEl(null);
        el.blur();
      } else if (e.key === 'Enter' && !el.dataset.cnMultiline && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
    }

    /* ─── Marquee ─── */
    function startMarquee(e) {
      const rect = root.getBoundingClientRect();
      const sc = scale || 1;
      const sx = (e.clientX - rect.left) / sc;
      const sy = (e.clientY - rect.top) / sc;
      let cur = { x: sx, y: sy, w: 0, h: 0 };
      setMarquee(cur);
      function onMove(ev) {
        const cx = (ev.clientX - rect.left) / sc;
        const cy = (ev.clientY - rect.top) / sc;
        cur = {
          x: Math.min(sx, cx),
          y: Math.min(sy, cy),
          w: Math.abs(cx - sx),
          h: Math.abs(cy - sy),
        };
        setMarquee(cur);
      }
      function onUp(ev) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        // Selection 적용
        const overlays = (page.overlays || []);
        const hit = [];
        for (const b of overlays) {
          const bx = b.x, by = b.y;
          const bw = typeof b.w === 'number' ? b.w : 100;
          const bh = typeof b.h === 'number' ? b.h : 100;
          const intersect = !(bx + bw < cur.x || bx > cur.x + cur.w || by + bh < cur.y || by > cur.y + cur.h);
          if (intersect && cur.w > 4 && cur.h > 4) hit.push(b.id);
        }
        if (hit.length > 0) {
          if (ev.shiftKey) {
            const merged = Array.from(new Set([...selectedBlockIds, ...hit]));
            setSelectedBlocks(merged);
          } else {
            setSelectedBlocks(hit);
          }
        }
        setMarquee(null);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('blur', onBlur, true);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('mousedown', onMouseDown);
      root.removeEventListener('blur', onBlur, true);
      root.removeEventListener('keydown', onKey);
    };
  }, [editable, pageIndex, updatePageProp, page?.overlays, scale, selectedBlockIds, setSelectedBlocks, clearSelection]);

  if (!page) return null;
  const tplId = page.templateId || project.templateId;
  const variant = getVariant(tplId, page.variantId);
  if (!variant) {
    return (
      <div className="flex h-full items-center justify-center text-meta-critical">
        ⚠ variant를 찾을 수 없습니다: {page.variantId}
      </div>
    );
  }
  const Comp = variant.Component;

  // 페이지 번호 자동 주입
  const total = project.pages.length;
  const pageStr = `${pageIndex + 1} / ${total}`;
  const themeMode = page.themeMode || 'light';
  const computedProps = { ...page.props, page: pageStr, themeMode };
  const overlays = page.overlays || [];

  const sc = scale ?? 1;
  const canvasBg = themeMode === 'dark' ? CN_THEMES.dark.bg : '#fff';

  function handleSelectBlock(id, { shift }) {
    if (shift) toggleSelectBlock(id);
    else setSelectedBlocks([id]);
  }

  return (
    <div className="relative" style={{ width: CARD_W * sc, height: CARD_H * sc }}>
      <div
        id={`${idPrefix}-${page.id}`}
        data-page-id={page.id}
        data-cn-theme={themeMode}
        ref={ref}
        style={{
          transform: `scale(${sc})`,
          transformOrigin: 'top left',
          width: CARD_W,
          height: CARD_H,
          position: 'absolute',
          left: 0,
          top: 0,
          background: canvasBg,
          boxShadow: '0 1px 4px 0 rgba(20, 22, 26, 0.16), 0 30px 80px -30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <ThemeContext.Provider value={themeMode}>
          <BgPhotoContext.Provider value={page.props.bgPhoto || null}>
            <Comp {...computedProps} />
          </BgPhotoContext.Provider>
        </ThemeContext.Provider>
        {/* Overlays — 부모는 클릭 패스스루(자식 블록만 잡음) */}
        {overlays.length > 0 && (
          <div data-block-overlay="1" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {overlays.map((b) => (
              <BlockRenderer
                key={b.id}
                block={b}
                allBlocks={overlays}
                scale={sc}
                isSelected={selectedBlockIds.includes(b.id)}
                onSelect={handleSelectBlock}
              />
            ))}
          </div>
        )}
        {/* Marquee */}
        {marquee && (
          <div
            style={{
              position: 'absolute',
              left: marquee.x,
              top: marquee.y,
              width: marquee.w,
              height: marquee.h,
              border: `2px dashed ${(0, '#0064e0')}`,
              background: 'rgba(0,100,224,0.08)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {/* 스냅 가이드 */}
        {snapGuides.map((g, i) => (
          <div
            key={i}
            style={
              g.type === 'v'
                ? { position: 'absolute', left: g.pos, top: 0, bottom: 0, width: 1, background: '#0064e0', pointerEvents: 'none', zIndex: 999 }
                : { position: 'absolute', top: g.pos, left: 0, right: 0, height: 1, background: '#0064e0', pointerEvents: 'none', zIndex: 999 }
            }
          />
        ))}
      </div>
      {editable && <FormatBar target={activeEl} />}
    </div>
  );
}
