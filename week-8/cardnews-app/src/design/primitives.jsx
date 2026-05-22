// 프리미티브 — Card, Eyebrow, CoverTitle, Heading01, BodyText, CardFooter.
// children이 string이면 dangerouslySetInnerHTML로 렌더 → <b>/<mark> 등 서식 보존.
// children이 React element면 그대로.
import React from 'react';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS, CN_THEMES } from './tokens.js';

const fieldAttr = (field) => (field ? { 'data-cn-field': field } : {});
const ml = (field, isMulti) => (field && isMulti ? { 'data-cn-multiline': '1' } : {});

/* ─────────── Theme Context — Card가 셋팅, 자식 프리미티브가 소비 ─────────── */
export const ThemeContext = React.createContext('light');
export function useCnTheme() {
  return React.useContext(ThemeContext);
}

/* ─────────── BgPhoto Context — Canvas가 셋팅, Card가 소비해서 풀이미지 배경 자동 적용 ─────────── */
export const BgPhotoContext = React.createContext(null);
// '검정' 계열 색상이면 true → 다크 모드에서 흰색으로 자동 전환됨.
// #fff/#FFFFFF 같은 흰색이거나 rgba 반투명 등은 사진 위 흰글씨이므로 그대로.
function isBlackish(c) {
  if (!c) return true;
  const s = String(c).trim().toLowerCase().replace(/\s+/g, '');
  return s === '#000' || s === '#000000' || s === 'rgb(0,0,0)' || s === 'black';
}
export function resolveTextColor(mode, explicit) {
  if (isBlackish(explicit)) {
    return mode === 'dark' ? CN_THEMES.dark.text : CN_COLORS.black;
  }
  return explicit; // 사진 위 흰글씨, 회색, rgba 등은 그대로
}
export function themeSub(mode) {
  return mode === 'dark' ? CN_THEMES.dark.textSub : CN_THEMES.light.textSub;
}

// children → string(HTML 해석) or React node(그대로)
function richChildren(children) {
  if (typeof children === 'string') return { dangerouslySetInnerHTML: { __html: children } };
  return { children };
}

/* ─────────── Card ─────────── */
// themeMode='light'|'dark' — 카드 배경/기본 텍스트색을 결정. ThemeContext로 자식에 전달.
// bgPhoto — 페이지 전체에 깔리는 풀이미지 배경. set이면 흰 배경 대신 사진이 깔림.
// 두 prop 모두 미지정 시 부모 Provider(Canvas에서 set)에서 상속.
export function Card({ children, themeMode: explicitTheme, bgPhoto: explicitBg, style, ...rest }) {
  const inheritedTheme = React.useContext(ThemeContext);
  const inheritedBg = React.useContext(BgPhotoContext);
  const mode = explicitTheme || inheritedTheme || 'light';
  const bgPhoto = explicitBg !== undefined ? explicitBg : inheritedBg;
  const themeBg = mode === 'dark' ? CN_THEMES.dark.bg : CN_THEMES.light.bg;
  return (
    <ThemeContext.Provider value={mode}>
      <div
        data-cn-theme={mode}
        style={{
          position: 'relative',
          width: CARD_W,
          height: CARD_H,
          // bgPhoto가 있으면 카드 자체 배경은 비워서 사진이 보이게.
          background: bgPhoto ? 'transparent' : themeBg,
          overflow: 'hidden',
          ...style,
        }}
        {...rest}
      >
        {/* bgPhoto 레이어 — 모든 children 뒤에 깔림. variant가 자체 FullBleedPhoto를 가지면 그 위에 덮어씌워짐. */}
        {bgPhoto ? <FullBleedPhoto src={bgPhoto} /> : null}
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/* ─────────── Eyebrow ─────────── */
export function Eyebrow({
  x = 84,
  y = 99,
  color,
  font = CN_FONT_ARCHIVO,
  size = 32,
  weight = 700,
  tracking = '0.04em',
  field,
  children,
}) {
  const mode = useCnTheme();
  // color가 명시되었고 검정이 아니면(사진 위 흰글씨 등) 그대로. 검정/미지정이면 테마 따름.
  const resolved = resolveTextColor(mode, color);
  return (
    <span
      {...fieldAttr(field)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 1,
        color: resolved,
        whiteSpace: 'pre',
      }}
      {...richChildren(children)}
    />
  );
}

/* ─────────── CoverTitle ─────────── */
export function CoverTitle({
  x = 84,
  y = 940,
  w = 912,
  title,
  subtitle,
  titleSize = 88,
  titleLineHeight = 1.15,
  subtitleSize = 32,
  color,
  align = 'left',
  titleField,
  subtitleField,
}) {
  const mode = useCnTheme();
  const resolved = resolveTextColor(mode, color);
  const titleProps = typeof title === 'string'
    ? { dangerouslySetInnerHTML: { __html: title } }
    : { children: title };
  const subProps = typeof subtitle === 'string'
    ? { dangerouslySetInnerHTML: { __html: subtitle } }
    : { children: subtitle };
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        fontFamily: CN_FONT,
        color: resolved,
        textAlign: align,
      }}
    >
      <div
        {...fieldAttr(titleField)}
        {...ml(titleField, true)}
        style={{
          fontWeight: 800,
          fontSize: titleSize,
          lineHeight: titleLineHeight,
          letterSpacing: '-0.045em',
          whiteSpace: 'pre-line',
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        }}
        {...titleProps}
      />
      {subtitle ? (
        <div
          {...fieldAttr(subtitleField)}
          {...ml(subtitleField, true)}
          style={{
            marginTop: 18,
            fontWeight: 500,
            fontSize: subtitleSize,
            lineHeight: 1.45,
            letterSpacing: '-0.04em',
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
          }}
          {...subProps}
        />
      ) : null}
    </div>
  );
}

/* ─────────── Heading01 ─────────── */
export function Heading01({
  x = 84,
  y = 220,
  w = 912,
  size = 56,
  weight = 800,
  color,
  align = 'left',
  field,
  children,
}) {
  const mode = useCnTheme();
  const resolved = resolveTextColor(mode, color);
  return (
    <div
      {...fieldAttr(field)}
      {...ml(field, true)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        fontFamily: CN_FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.045em',
        lineHeight: 1.2,
        color: resolved,
        textAlign: align,
        whiteSpace: 'pre-line',
        wordBreak: 'keep-all',
        overflowWrap: 'anywhere',
      }}
      {...richChildren(children)}
    />
  );
}

/* ─────────── BodyText ─────────── */
export function BodyText({
  x = 84,
  y = 520,
  w = 912,
  size = 32,
  weight = 500,
  lineHeight = 1.65,
  color,
  align = 'left',
  field,
  children,
}) {
  const mode = useCnTheme();
  const resolved = resolveTextColor(mode, color);
  return (
    <div
      {...fieldAttr(field)}
      {...ml(field, true)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        fontFamily: CN_FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.04em',
        lineHeight,
        color: resolved,
        textAlign: align,
        whiteSpace: 'pre-line',
        wordBreak: 'keep-all',
        overflowWrap: 'anywhere',
      }}
      {...richChildren(children)}
    />
  );
}

/* ─────────── CardFooter ─────────── */
export function CardFooter({ left, right, color, leftField, rightField }) {
  const mode = useCnTheme();
  const resolved = resolveTextColor(mode, color);
  return (
    <>
      {left !== undefined && left !== null && left !== '' ? (
        <div
          {...fieldAttr(leftField)}
          style={{
            position: 'absolute',
            left: 84,
            bottom: 84,
            fontFamily: CN_FONT,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: resolved,
          }}
          {...richChildren(left)}
        />
      ) : null}
      {right !== undefined && right !== null && right !== '' ? (
        <div
          {...fieldAttr(rightField)}
          style={{
            position: 'absolute',
            right: 84,
            bottom: 84,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '0.04em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: resolved,
          }}
        >
          {right}
        </div>
      ) : null}
    </>
  );
}

/* ─────────── Highlight (네온 형광펜 — 명시적 사용용) ─────────── */
export function Highlight({ children, color = CN_COLORS.neon, padX = 4, lineY = '62%' }) {
  return (
    <span
      style={{
        background: `linear-gradient(transparent ${lineY}, ${color} ${lineY})`,
        padding: `0 ${padX}px`,
      }}
    >
      {children}
    </span>
  );
}

/* ─────────── PhotoBox ─────────── */
export function PhotoBox({
  x,
  y,
  w,
  h,
  src,
  borderRadius,
  shadow,
  position = 'center',
  border = `3px solid ${CN_COLORS.black}`,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: position,
        backgroundColor: src ? undefined : '#E8E6DF',
        border,
        boxShadow: shadow,
        borderRadius,
        boxSizing: 'border-box',
      }}
    />
  );
}

/* ─────────── FullBleedPhoto + scrim ─────────── */
// src 비어있으면 transparent — 카드의 bgPhoto / 테마 bg가 그대로 보임.
// (이전 #3a3a3a 폴백은 cover에 사진이 없을 때 빈 자리로 깔리던 디버그 색이었는데,
//  page-level bgPhoto 기능이 추가된 뒤로는 사용자가 원하는 배경을 가렸음 → 제거.)
export function FullBleedPhoto({ src, position = 'center' }) {
  if (!src) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: position,
      }}
    />
  );
}

export function Scrim({ gradient }) {
  return <div style={{ position: 'absolute', inset: 0, background: gradient }} />;
}

/* ─────────── BackgroundFill — 빈 페이지 배경 (이미지/영상, 풀/2분할/3분할) ─────────── */
// type: 'none' | 'fullimage' | 'split2' | 'split3'
// dir:  'h' | 'v'  (split2/split3 분할 방향)
// items: [{ src }] — 이미지 또는 mp4 data URL
export function BackgroundFill({ type = 'none', dir = 'v', items = [] }) {
  if (type === 'none') return null;

  function Cell({ src, style }) {
    if (!src) {
      return <div style={{ ...style, background: '#f1f4f7', border: '1px dashed #ced0d4', boxSizing: 'border-box' }} />;
    }
    const isVideo = /^data:video\//.test(src) || /\.(mp4|webm|mov)(\?|$)/i.test(src);
    if (isVideo) {
      return (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          style={{ ...style, objectFit: 'cover' }}
        />
      );
    }
    return (
      <div
        style={{
          ...style,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  if (type === 'fullimage') {
    return <Cell src={items[0]?.src} style={{ position: 'absolute', inset: 0 }} />;
  }

  const n = type === 'split2' ? 2 : 3;
  const cells = [];
  for (let i = 0; i < n; i++) {
    const style = { position: 'absolute' };
    if (dir === 'v') {
      // 수직 분할 = 가로로 나란히
      style.top = 0;
      style.bottom = 0;
      style.left = `${(100 / n) * i}%`;
      style.width = `${100 / n}%`;
    } else {
      // 수평 분할 = 세로로 쌓임
      style.left = 0;
      style.right = 0;
      style.top = `${(100 / n) * i}%`;
      style.height = `${100 / n}%`;
    }
    cells.push(<Cell key={i} src={items[i]?.src} style={style} />);
  }
  return <>{cells}</>;
}

/* ─────────── re-export tokens ─────────── */
export { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS, CN_THEMES };
