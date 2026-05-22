// 스티커 라이브러리 — 디자인 위에 덧붙일 수 있는 재사용 요소 7종.
// 원본: cardnews/stickers.jsx
import React from 'react';
import { CN_FONT, CN_COLORS } from './tokens.js';

/* ─── Question box (텍스트에 맞춰 좁게) ─── */
export function QuestionBox({
  children = 'Q. 무슨 일을 하는 사람인가요?',
  w = 'auto',
  padX = 28,
  padY = 22,
  size = 38,
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: CN_COLORS.white,
        border: `3px solid ${CN_COLORS.black}`,
        padding: `${padY}px ${padX}px`,
        width: w,
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: CN_FONT,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '-0.04em',
          lineHeight: 1.3,
          color: CN_COLORS.black,
          whiteSpace: 'nowrap',
        }}
        data-cn-sticker-text="1"
      >
        {children}
      </span>
    </div>
  );
}

/* ─── Question middle (중앙 정렬, 큰 패딩) ─── */
export function QuestionMiddle({ children = 'Q. 무슨 일을 하는 사람인가요?', w = 720, size = 42 }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: CN_COLORS.white,
        border: `3px solid ${CN_COLORS.black}`,
        width: w,
        minHeight: 200,
        padding: '60px 50px',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: CN_FONT,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '-0.04em',
          lineHeight: 1.4,
          color: CN_COLORS.black,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
      >
        {children}
      </span>
    </div>
  );
}

/* ─── Standard middle (답변 박스) ─── */
export function StandardMiddle({ children, w = 903, size = 30 }) {
  return (
    <div
      style={{
        width: w,
        background: CN_COLORS.white,
        border: `3px solid ${CN_COLORS.black}`,
        padding: '60px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: CN_FONT,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.55,
          letterSpacing: '-0.04em',
          color: CN_COLORS.black,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Sub frame (white / neon / lemon) ─── */
export function SubFrame({ children, variant = 'white', w = 'auto', size = 28 }) {
  const bg =
    variant === 'neon' ? CN_COLORS.neon : variant === 'lemon' ? CN_COLORS.lemon : CN_COLORS.white;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        border: `3px solid ${CN_COLORS.black}`,
        padding: '22px 28px',
        width: w,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: CN_FONT,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.5,
          letterSpacing: '-0.04em',
          color: CN_COLORS.black,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Sub info — lemon, 1~3줄 ㄷ-shape 겹침 ─── */
export function SubInfo({
  lines = ['무슨 일을 하는 사람인가요?'],
  size = 28,
  stagger = 'left',
  padX = 22,
  padY = 14,
}) {
  const n = Math.min(lines.length, 3);
  const boxH = Math.round(size * 1.5 + padY * 2);
  const overlapY = Math.round(boxH * 0.15);
  const stepY = boxH - overlapY;
  const indent = Math.round(size * 1.4);

  function offsetFor(i) {
    if (n === 1) return { x: 0, y: 0 };
    if (n === 2) return { x: i === 0 ? 0 : indent / 2, y: i * stepY };
    if (stagger === 'left') {
      const x = i === 1 ? indent : 0;
      return { x, y: i * stepY };
    } else {
      const x = i === 1 ? 0 : indent;
      return { x, y: i * stepY };
    }
  }

  let maxRight = 0;
  const placements = lines.slice(0, n).map((t, i) => ({ t, ...offsetFor(i) }));
  const approxBoxW = (txt) => Math.max(220, txt.length * (size * 0.55) + padX * 2);
  placements.forEach((p) => {
    const w = approxBoxW(p.t);
    if (p.x + w > maxRight) maxRight = p.x + w;
  });
  const totalH = (n - 1) * stepY + boxH;

  return (
    <div style={{ position: 'relative', width: maxRight, height: totalH, display: 'inline-block' }}>
      {[...placements].reverse().map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: CN_COLORS.lemon,
            border: `3px solid ${CN_COLORS.black}`,
            padding: `${padY}px ${padX}px`,
            fontFamily: CN_FONT,
            fontWeight: 500,
            fontSize: size,
            letterSpacing: '-0.04em',
            color: CN_COLORS.black,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {p.t}
        </div>
      ))}
    </div>
  );
}

/* ─── Sub sticker — 매끈한 타원 (border-radius:50%) ─── */
export function SubSticker({ children = '#1', w = 90, h = 56, variant = 'black', size = 28 }) {
  const palette =
    {
      black: { bg: CN_COLORS.black, color: CN_COLORS.neon, border: 'none' },
      lemon: { bg: CN_COLORS.lemon, color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
      neon: { bg: CN_COLORS.neon, color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
    }[variant] ?? { bg: CN_COLORS.black, color: CN_COLORS.neon, border: 'none' };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: w,
        height: h,
        background: palette.bg,
        border: palette.border,
        borderRadius: '50%',
        boxSizing: 'border-box',
        fontFamily: CN_FONT,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: palette.color,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
      data-cn-sticker-text="1"
    >
      {children}
    </div>
  );
}

/* ─── Brand Insight cloud — 네온 그린 블롭 ─── */
export function BrandInsightCloud({
  children = 'Brand Insight',
  size = 28,
  padX = 56,
  padY = 22,
  fill = CN_COLORS.neon,
  color = CN_COLORS.black,
}) {
  const approxTextW = String(children).length * (size * 0.66);
  const w = Math.round(approxTextW + padX * 2);
  const h = Math.round(size * 1.55 + padY * 2);
  const vbW = 200,
    vbH = 100;
  const d = `
    M 12 50
    C 8 28, 28 12, 50 18
    C 56 4, 96 0, 110 16
    C 130 6, 168 14, 178 36
    C 198 44, 198 70, 178 80
    C 168 96, 132 100, 116 88
    C 96 102, 60 96, 50 84
    C 22 90, 4 72, 12 50 Z
  `;
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: w,
        height: h,
      }}
    >
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="none"
        width={w}
        height={h}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <path d={d} fill={fill} />
      </svg>
      <span
        style={{
          position: 'relative',
          fontFamily: CN_FONT,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '-0.02em',
          color,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
        data-cn-sticker-text="1"
      >
        {children}
      </span>
    </div>
  );
}

/* ─── Sticker registry (사이드바에서 드래그 추가용) ─── */
export const STICKER_REGISTRY = [
  { kind: 'questionBox', Component: QuestionBox, label: 'Question Box', defaults: { size: 38 } },
  { kind: 'questionMiddle', Component: QuestionMiddle, label: 'Question (center)', defaults: { w: 720, size: 42 } },
  { kind: 'standardMiddle', Component: StandardMiddle, label: 'Answer (center)', defaults: { w: 903, size: 30 } },
  { kind: 'subFrame', Component: SubFrame, label: 'Sub Frame', defaults: { variant: 'white', size: 28 } },
  { kind: 'subInfo', Component: SubInfo, label: 'Sub Info (lemon)', defaults: { size: 28, stagger: 'left' } },
  { kind: 'subSticker', Component: SubSticker, label: 'Sub Sticker', defaults: { variant: 'black', size: 28 } },
  { kind: 'brandInsightCloud', Component: BrandInsightCloud, label: 'Brand Insight Cloud', defaults: { size: 28 } },
];
