// Type 5 · 수집생활
// 좌상단 「수집생활」 (Pretendard Bold) · 우상단 「Suji's Life」 (cover) / 「WORKROOM」 (body)
import React from 'react';
import {
  Card,
  CoverTitle,
  Heading01,
  BodyText,
  CardFooter,
  PhotoBox,
  FullBleedPhoto,
  Scrim,
  BackgroundFill,
  useCnTheme,
} from '../design/primitives.jsx';
import { BG_FIELDS, bgItems } from './blankFields.js';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

function CLEyebrow({ eyebrow = '수집생활', color }) {
  const mode = useCnTheme();
  const c = color ?? (mode === 'dark' ? '#fff' : '#000');
  return (
    <span
      data-cn-field="eyebrow"
      style={{
        position: 'absolute',
        left: 84,
        top: 99,
        fontFamily: CN_FONT,
        fontWeight: 700,
        fontSize: 35,
        letterSpacing: '-0.04em',
        lineHeight: 1.2,
        color: c,
      }}
     dangerouslySetInnerHTML={{ __html: typeof eyebrow === 'string' ? eyebrow : '' }} />
  );
}

function CLCoverTopRight({ children = "Suji's Life", topRightLogo }) {
  const mode = useCnTheme();
  const c = mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  if (topRightLogo) {
    return (
      <img
        src={topRightLogo}
        alt={children}
        style={{
          position: 'absolute',
          right: 84,
          top: 106,
          height: 26,
          width: 'auto',
          display: 'block',
          opacity: 0.85,
          filter: mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
        }}
      />
    );
  }
  return (
    <span
      data-cn-field="topRight"
      style={{
        position: 'absolute',
        right: 84,
        top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: 1,
        color: c,
      }}
     dangerouslySetInnerHTML={{ __html: typeof children === 'string' ? children : '' }} />
  );
}

function CLBodyTopRight({ children = 'WORKROOM', color, topRightLogo }) {
  const mode = useCnTheme();
  // color 명시(사진 위 #fff) 우선. 미지정이면 테마 자동.
  const fg = color ?? (mode === 'dark' ? '#fff' : '#000');
  const isWhite = fg === '#fff' || fg === '#FFFFFF';
  const sub = isWhite ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
  if (topRightLogo) {
    return (
      <img
        src={topRightLogo}
        alt={children}
        style={{
          position: 'absolute',
          right: 84,
          top: 106,
          height: 26,
          width: 'auto',
          display: 'block',
          opacity: 0.85,
          filter: isWhite ? 'brightness(0) invert(1)' : 'none',
        }}
      />
    );
  }
  return (
    <span
      data-cn-field="topRight"
      style={{
        position: 'absolute',
        right: 84,
        top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: '0.04em',
        lineHeight: 1,
        color: sub,
      }}
     dangerouslySetInnerHTML={{ __html: typeof children === 'string' ? children : '' }} />
  );
}

const COVER_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: '수집생활' },
  { key: 'topRight', label: "우상단 (영문) — 표지", type: 'text', default: "Suji's Life" },
  { key: 'wordEng', label: '하단 영문', type: 'text', default: "FREEWORKER'S WORKROOM" },
];

const BODY_COMMON = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: '수집생활' },
  { key: 'topRight', label: '우상단 영문', type: 'text', default: 'WORKROOM' },
  { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
];

export const CL_VARIANTS = [
  /* ── Cover 1 line ── */
  {
    id: 'cl-cover-1line',
    label: '표지 · 1줄 타이틀',
    category: 'cover',
    fields: [
      ...COVER_FIELDS,
      { key: 'title', label: '메인 타이틀', type: 'text', default: '추구미와 현재형이 공존하는 홈오피스' },
    ],
    // 클라우드 스티커·우하단 페이지표기 제거. T1 좌하단 패턴 (bottom 200) + title 88 + wordEng 32.
    Component: ({ eyebrow, topRight, topRightLogo, wordEng, title, themeMode }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      return (
        <Card>
          <CLEyebrow eyebrow={eyebrow} />
          <CLCoverTopRight topRightLogo={topRightLogo}>{topRight}</CLCoverTopRight>
          <div style={{ position: 'absolute', left: 84, width: 812, bottom: 200, fontFamily: CN_FONT, color: fg }}>
            <div
              data-cn-field="title"
              data-cn-multiline="1"
              style={{
                fontWeight: 800,
                fontSize: 88,
                lineHeight: 1.15,
                letterSpacing: '-0.045em',
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
                overflowWrap: 'anywhere',
              }}
              dangerouslySetInnerHTML={{ __html: typeof title === 'string' ? title : '' }}
            />
            <div
              data-cn-field="wordEng"
              style={{
                marginTop: 30,
                fontFamily: CN_FONT_ARCHIVO,
                fontWeight: 500,
                fontSize: 32,
                letterSpacing: '0.16em',
                lineHeight: 1,
              }}
             dangerouslySetInnerHTML={{ __html: typeof wordEng === 'string' ? wordEng : '' }} />
          </div>
        </Card>
      );
    },
  },

  /* ── Cover 2 line ── */
  {
    id: 'cl-cover-2line',
    label: '표지 · 2줄 타이틀',
    category: 'cover',
    fields: [
      ...COVER_FIELDS,
      { key: 'title', label: '메인 타이틀 (2줄)', type: 'textarea', default: '추구미와 현재형이\n공존하는 홈오피스' },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, wordEng, title, themeMode }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      return (
        <Card>
          <CLEyebrow eyebrow={eyebrow} />
          <CLCoverTopRight topRightLogo={topRightLogo}>{topRight}</CLCoverTopRight>
          <div style={{ position: 'absolute', left: 84, width: 812, bottom: 200, fontFamily: CN_FONT, color: fg }}>
            <div
              data-cn-field="title"
              data-cn-multiline="1"
              style={{
                fontWeight: 800,
                fontSize: 84,
                lineHeight: 1.15,
                letterSpacing: '-0.045em',
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
                overflowWrap: 'anywhere',
              }}
              dangerouslySetInnerHTML={{ __html: typeof title === 'string' ? title : '' }}
            />
            <div
              data-cn-field="wordEng"
              style={{
                marginTop: 30,
                fontFamily: CN_FONT_ARCHIVO,
                fontWeight: 500,
                fontSize: 32,
                letterSpacing: '0.16em',
                lineHeight: 1,
              }}
             dangerouslySetInnerHTML={{ __html: typeof wordEng === 'string' ? wordEng : '' }} />
          </div>
        </Card>
      );
    },
  },

  /* ── Body text — 큰 제목 / 소제목 / 본문 — T3 bi-body-text와 동일 패턴 ── */
  {
    id: 'cl-body-text',
    label: '본문 · 큰 제목 + 소제목 + 본문',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'heading', label: '큰 제목', type: 'textarea', default: '추구미와 현재형이\n공존하는 책상 한 칸' },
      { key: 'subhead', label: '소제목', type: 'textarea', default: '오래 곁에 둘 물건들로만 채운 공간, 그 안에 담긴 취향.' },
      { key: 'body', label: '본문', type: 'textarea', default:
`작업과 휴식의 경계를 부드럽게 풀어주는 홈오피스.
오랫동안 곁에 둘 물건들만 골라 두고, 매일 손이 가는
도구만 책상 위에 남겼습니다.

좋아하는 무드와 일하는 모드가 함께 머무는 공간.` },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, heading, subhead, highlight, highlightRest, body, themeMode }) => {
      // 기존 highlight/highlightRest 분리 데이터 → subhead로 자동 마이그레이션
      const subheadHtml = subhead || (
        highlight || highlightRest
          ? `${highlight ? `<mark class="cn-hl">${highlight}</mark>` : ''}${highlightRest || ''}`
          : ''
      );
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      return (
        <Card>
          <CLEyebrow eyebrow={eyebrow} />
          <CLBodyTopRight topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
          <Heading01 x={84} y={220} w={912} size={56} field="heading">
            {heading}
          </Heading01>
          {/* 소제목 — 형광·볼드는 드래그 후 floating bar로 직접 적용. 색은 테마 따름. */}
          <div
            data-cn-field="subhead"
            data-cn-multiline="1"
            style={{
              position: 'absolute',
              left: 84,
              top: 470,
              width: 912,
              fontFamily: CN_FONT,
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: '-0.04em',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              color: fg,
            }}
            dangerouslySetInnerHTML={{ __html: subheadHtml }}
          />
          <BodyText x={84} y={620} w={912} size={32} weight={500} lineHeight={1.7} field="body">
            {body}
          </BodyText>
          <CardFooter left={caption} right={page} leftField="caption" />
        </Card>
      );
    },
  },

  /* ── Body overlay (자유 드래그) ── */
  {
    id: 'cl-body-overlay',
    label: '본문 · 풀배경 + 정사각 사진 (자유 드래그)',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'bg', label: '풀배경 사진', type: 'image', default: '' },
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 180, y: 380, w: 720, h: 720, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, bg, scrim, gradient }) => {
      const sm = scrim || (gradient === false ? 'none' : 'gradient');
      return (
      <Card>
        <FullBleedPhoto src={bg} />
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))" />}
        <CLEyebrow eyebrow={eyebrow} />
        <CLBodyTopRight topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
        {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" />}
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
      );
    },
  },

  /* ── Body connected (사진 자유 드래그, 꺽쇠 라인은 고정) ── */
  {
    id: 'cl-body-connected',
    label: '본문 · 꺽쇠 연결 사진 2장 (자유 드래그)',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'body', label: '우상단 본문', type: 'textarea', default:
`작업과 휴식의 경계를 부드럽게 풀어주는 홈오피스. 오랫동안 곁에 둘 물건들만 골라 두고, 매일 손이 가는 도구만 책상 위에 남겼습니다.` },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 420, w: 280, h: 265, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
      { type: 'image', x: 716, y: 880, w: 320, h: 305, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, body, themeMode }) => {
      const a = { x: 84, y: 420, w: 280, h: 265 };
      const b = { x: 716, y: 880, w: 320, h: 305 };
      const a1 = { x: a.x + a.w, y: a.y + a.h };
      const elbow1 = { x: a1.x + 70, y: a1.y + 150 };
      const end1 = { x: elbow1.x + 200, y: elbow1.y };
      const b1 = { x: b.x, y: b.y };
      const elbow2 = { x: b1.x - 70, y: b1.y - 100 };
      const end2 = { x: elbow2.x - 200, y: elbow2.y };
      const stroke = themeMode === 'dark' ? CN_COLORS.white : CN_COLORS.black;
      return (
        <Card>
          <CLEyebrow />
          <CLBodyTopRight topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
          <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.6} align="right" field="body">
            {body}
          </BodyText>
          <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
            <polyline
              points={`${a1.x},${a1.y} ${elbow1.x},${elbow1.y} ${end1.x},${end1.y}`}
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <polyline
              points={`${b1.x},${b1.y} ${elbow2.x},${elbow2.y} ${end2.x},${end2.y}`}
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
          <CardFooter left={caption} right={page} leftField="caption" />
        </Card>
      );
    },
  },

  /* ── Body image (풀 이미지 + 글 아래) ── */
  {
    id: 'cl-body-image-bottom',
    label: '본문 · 풀이미지 + 글 아래',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'photo', label: '배경 사진', type: 'image', default: '' },
      { key: 'body', label: '본문', type: 'textarea', default:
`오랫동안 곁에 둘 물건들로 채운 책상 한 칸.
좋아하는 무드와 일하는 모드가 함께 머물고,
매일 손이 닿는 도구만 자리를 지킵니다.` },
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
      { key: 'textShadow', label: '글씨 그림자', type: 'toggle', default: false },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, photo, body, scrim, gradient, textShadow = false, themeMode }) => {
      const sm = scrim || (gradient === false ? 'none' : 'gradient');
      const isDark = themeMode === 'dark';
      const fg = isDark ? '#fff' : '#000';
      const shadowMain = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)';
      const shadowGlow = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)';
      return (
      <Card>
        <FullBleedPhoto src={photo} />
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
        <CLEyebrow eyebrow={eyebrow} color={fg} />
        <CLBodyTopRight color={fg} topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
        <div
          data-cn-field="body"
          data-cn-multiline="1"
          style={{
            position: 'absolute',
            left: 84,
            right: 84,
            bottom: 200,
            fontFamily: CN_FONT,
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.65,
            letterSpacing: '-0.04em',
            color: fg,
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            textShadow: textShadow ? `0 1px 3px ${shadowMain}, 0 2px 12px ${shadowGlow}` : 'none',
          }}
         dangerouslySetInnerHTML={{ __html: typeof body === 'string' ? body : '' }} />
        <CardFooter left={caption} right={page} color={fg} leftField="caption" />
      </Card>
      );
    },
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'cl-blank',
    label: '빈 페이지 · 2/3분할',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: '수집생활' },
      { key: 'topRight', label: '우상단 영문', type: 'text', default: 'WORKROOM' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
    ],
    Component: (props) => {
      const { eyebrow = '수집생활', topRight, topRightLogo, caption, page } = props;
      const bgType = props.bgType || 'none';
      const sm = props.scrim || 'none';
      const onPhoto = bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={props.bgDir || 'h'} items={bgItems(props)} />
          {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
          {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
          <CLEyebrow eyebrow={eyebrow} color={onPhoto ? '#fff' : '#000'} />
          <CLBodyTopRight color={onPhoto ? '#fff' : '#000'} topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
          <CardFooter left={caption} right={page} color={onPhoto ? '#fff' : '#000'} leftField="caption" />
        </Card>
      );
    },
  },
];

export const CL_TEMPLATE = {
  id: 'collection-life',
  name: 'Type 5 · 수집생활',
  tagline: 'Suji’s Life · 홈오피스 로그',
  wordmarkDefault: 'WORKROOM',
  variants: CL_VARIANTS,
  defaultPages: ['cl-cover-2line', 'cl-body-text', 'cl-body-overlay', 'cl-body-image-bottom'],
};
