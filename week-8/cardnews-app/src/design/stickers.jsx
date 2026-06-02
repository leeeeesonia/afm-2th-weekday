// 스티커 라이브러리 — 디자인 위에 덧붙일 수 있는 재사용 요소.
// 모든 스티커 텍스트 영역은 data-cn-sticker-text="1" 표시 → BlockRenderer가 단일 클릭으로 인라인 편집.
// children 비어있으면 placeholder(데모 텍스트)를 opacity 0.4 (faded gray)로 표시.
import React from 'react';
import { CN_FONT, CN_COLORS } from './tokens.js';

// 스티커별 placeholder(데모) 텍스트 — 사이드바 textarea / 캔버스 모두에서 사용.
export const STICKER_PLACEHOLDERS = {
  questionBox: 'Q. 무슨 일을 하는 사람인가요?',
  questionMiddle: 'Q. 무슨 일을 하는 사람인가요?',
  standardMiddle: '여기에 답변을 작성해주세요',
  subFrame: '서브 프레임 텍스트',
  subSticker: '#1',
  brandInsightCloud: 'Brand Insight',
  subInfo: '무슨 일을 하는 사람인가요?',
};

// SubInfo lines 헬퍼 — children(newline-separated) 또는 lines 배열(레거시) 둘 다 지원.
function getSubInfoLines(children, lines) {
  if (typeof children === 'string' && children.length > 0) {
    return children.split('\n');
  }
  if (Array.isArray(lines) && lines.length > 0) return lines;
  return null; // null = placeholder 사용
}

/* ─── Question box (텍스트에 맞춰 좁게) ─── */
export function QuestionBox({
  children,
  w = 'auto',
  padX = 28,
  padY = 22,
  size = 38,
}) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.questionBox : children;
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
          opacity: isPlaceholder ? 0.4 : 1,
          whiteSpace: 'nowrap',
        }}
        data-cn-sticker-text="1"
        data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
      >
        {text}
      </span>
    </div>
  );
}

/* ─── Question middle (중앙 정렬, 큰 패딩) ─── */
export function QuestionMiddle({ children, w = 720, size = 42 }) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.questionMiddle : children;
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
          opacity: isPlaceholder ? 0.4 : 1,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
        data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
      >
        {text}
      </span>
    </div>
  );
}

/* ─── Standard middle (답변 박스) ─── */
export function StandardMiddle({ children, w = 903, size = 30 }) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.standardMiddle : children;
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
          opacity: isPlaceholder ? 0.4 : 1,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
        data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
      >
        {text}
      </div>
    </div>
  );
}

/* ─── Sub frame (도형 기능 통합: variant 빠른 선택 + fill/border/borderRadius/textColor 커스텀) ─── */
export function SubFrame({
  children,
  variant = 'white',
  w = 'auto',
  size = 28,
  fill,             // 명시되면 variant 무시하고 fill 적용
  border = 3,       // 보더 두께(px). 0이면 없음.
  borderColor,      // 미지정 시 검정
  borderRadius = 0, // 모서리 둥글기
  textColor,        // 명시되면 글씨 색. 미지정이면 검정.
}) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.subFrame : children;
  const variantBg =
    variant === 'neon' ? CN_COLORS.neon : variant === 'lemon' ? CN_COLORS.lemon : CN_COLORS.white;
  const bg = fill || variantBg;
  const borderStr = border > 0 ? `${border}px solid ${borderColor || CN_COLORS.black}` : 'none';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        border: borderStr,
        borderRadius,
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
          color: textColor || CN_COLORS.black,
          opacity: isPlaceholder ? 0.4 : 1,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
        data-cn-sticker-text="1"
        data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
      >
        {text}
      </div>
    </div>
  );
}

/* ─── Sub info — lemon, 1~3줄 ㄷ-shape 겹침 ─── */
// 데이터 모델: children(newline-separated 문자열) 우선. 레거시 lines 배열도 지원.
// 각 lemon 박스는 data-cn-sticker-line-idx={원본 인덱스}로 인라인 클릭 편집 대상.
export function SubInfo({
  children,
  lines: legacyLines,
  size = 24,
  stagger = 'left',
  padX = 22,
  padY = 14,
  fill,             // 명시되면 lemon 대신 fill
  border = 3,       // 보더 두께
  borderColor,      // 미지정 시 검정
  borderRadius = 0, // 모서리 둥글기
  textColor,        // 명시되면 글씨 색. 미지정이면 검정.
}) {
  const userLines = getSubInfoLines(children, legacyLines);
  const isPlaceholder = userLines === null;
  const lines = isPlaceholder ? [STICKER_PLACEHOLDERS.subInfo] : userLines;
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
  const placements = lines.slice(0, n).map((t, i) => ({ t, i, ...offsetFor(i) }));
  const approxBoxW = (txt) => Math.max(220, String(txt || '').length * (size * 0.55) + padX * 2);
  placements.forEach((p) => {
    const w = approxBoxW(p.t);
    if (p.x + w > maxRight) maxRight = p.x + w;
  });
  const totalH = (n - 1) * stepY + boxH;

  const bg = fill || CN_COLORS.lemon;
  const borderStr = border > 0 ? `${border}px solid ${borderColor || CN_COLORS.black}` : 'none';
  return (
    <div style={{ position: 'relative', width: maxRight, height: totalH, display: 'inline-block' }}>
      {[...placements].reverse().map((p) => (
        <div
          key={p.i}
          data-cn-sticker-text="1"
          data-cn-sticker-line-idx={p.i}
          data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bg,
            border: borderStr,
            borderRadius,
            padding: `${padY}px ${padX}px`,
            fontFamily: CN_FONT,
            fontWeight: 400,
            fontSize: size,
            letterSpacing: '-0.04em',
            color: textColor || CN_COLORS.black,
            opacity: isPlaceholder ? 0.4 : 1,
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

/* ─── Sub sticker — 매끈한 타원 (border-radius:50%, 고정 90x56) ─── */
export function SubSticker({ children, w = 90, h = 56, variant = 'black', size = 24 }) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.subSticker : children;
  // white variant — 검정 배경 + 흰 도형 테두리 + 흰 글씨 (사용자 지정 outline 스타일)
  const palette =
    {
      black: { bg: CN_COLORS.black, color: CN_COLORS.neon, border: 'none' },
      lemon: { bg: CN_COLORS.lemon, color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
      neon: { bg: CN_COLORS.neon, color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
      white: { bg: CN_COLORS.black, color: CN_COLORS.white, border: `3px solid ${CN_COLORS.white}` },
      sky: { bg: '#7599fb', color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
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
        opacity: isPlaceholder ? 0.4 : 1,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
      data-cn-sticker-text="1"
      data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
    >
      {text}
    </div>
  );
}

/* ─── Brand Insight cloud — 네온 그린 블롭 ─── */
export function BrandInsightCloud({
  children,
  size = 28,
  padX = 56,
  padY = 22,
  fill = CN_COLORS.neon,
  color = CN_COLORS.black,
}) {
  const isPlaceholder = !children;
  const text = isPlaceholder ? STICKER_PLACEHOLDERS.brandInsightCloud : children;
  const approxTextW = String(text).length * (size * 0.66);
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
          opacity: isPlaceholder ? 0.4 : 1,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
        data-cn-sticker-text="1"
        data-cn-sticker-placeholder={isPlaceholder ? '1' : '0'}
      >
        {text}
      </span>
    </div>
  );
}

/* ─── Sticker registry (사이드바에서 드래그 추가용) ─── */
// BrandInsightCloud은 +블록 메뉴에서 제외(컴포넌트는 레거시 호환용으로 export 유지).
export const STICKER_REGISTRY = [
  { kind: 'questionBox', Component: QuestionBox, label: 'Question Box', defaults: { size: 38 }, placeholder: STICKER_PLACEHOLDERS.questionBox },
  { kind: 'questionMiddle', Component: QuestionMiddle, label: 'Question (center)', defaults: { w: 720, size: 42 }, placeholder: STICKER_PLACEHOLDERS.questionMiddle },
  { kind: 'standardMiddle', Component: StandardMiddle, label: 'Answer (center)', defaults: { w: 903, size: 30 }, placeholder: STICKER_PLACEHOLDERS.standardMiddle },
  { kind: 'subFrame', Component: SubFrame, label: 'Sub Frame', defaults: { variant: 'white', size: 28 }, placeholder: STICKER_PLACEHOLDERS.subFrame },
  { kind: 'subInfo', Component: SubInfo, label: 'Sub Info', defaults: { size: 24, stagger: 'left' }, placeholder: STICKER_PLACEHOLDERS.subInfo },
  { kind: 'subSticker', Component: SubSticker, label: 'Sub Sticker', defaults: { variant: 'black', size: 24 }, placeholder: STICKER_PLACEHOLDERS.subSticker },
];

// 레거시 — 기존 페이지에 brandInsightCloud 블록이 있을 수 있으므로 BlockRenderer가 찾을 수 있도록 별도 맵 제공.
export const ALL_STICKERS = [
  ...STICKER_REGISTRY,
  { kind: 'brandInsightCloud', Component: BrandInsightCloud, label: 'Brand Insight Cloud', defaults: { size: 28 }, placeholder: STICKER_PLACEHOLDERS.brandInsightCloud },
];

export function getStickerEntry(kind) {
  return ALL_STICKERS.find((s) => s.kind === kind) || null;
}
