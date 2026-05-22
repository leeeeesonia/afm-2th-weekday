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
} from '../design/primitives.jsx';
import { BG_FIELDS, bgItems } from './blankFields.js';
import { BrandInsightCloud } from '../design/stickers.jsx';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

function CLEyebrow({ eyebrow = '수집생활', color = '#000' }) {
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
        color,
      }}
    >
      {eyebrow}
    </span>
  );
}

function CLCoverTopRight({ children = "Suji's Life", topRightLogo }) {
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
        color: 'rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </span>
  );
}

function CLBodyTopRight({ children = 'WORKROOM', color = '#000', topRightLogo }) {
  const sub = color === '#fff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
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
          filter: color === '#fff' ? 'brightness(0) invert(1)' : 'none',
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
    >
      {children}
    </span>
  );
}

const COVER_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: '수집생활' },
  { key: 'topRight', label: "우상단 (영문) — 표지", type: 'text', default: "Suji's Life" },
  { key: 'cloudText', label: '클라우드 스티커 문구', type: 'text', default: 'LIFE  ›  HOME  ›  WORKROOM' },
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
    Component: ({ eyebrow, topRight, topRightLogo, cloudText, wordEng, page, title }) => (
      <Card>
        <CLEyebrow eyebrow={eyebrow} />
        <CLCoverTopRight topRightLogo={topRightLogo}>{topRight}</CLCoverTopRight>
        <div style={{ position: 'absolute', left: 84, top: 850 }}>
          <BrandInsightCloud size={28}>{cloudText}</BrandInsightCloud>
        </div>
        <CoverTitle x={84} y={950} w={912} title={title} titleSize={68} titleLineHeight={1.18} titleField="title" />
        <div
          style={{
            position: 'absolute',
            left: 84,
            top: 1170,
            fontFamily: CN_FONT_ARCHIVO,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: '0.16em',
            color: '#000',
            lineHeight: 1,
          }}
        >
          {wordEng}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 84,
            bottom: 84,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {page}
        </div>
      </Card>
    ),
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
    Component: ({ eyebrow, topRight, topRightLogo, cloudText, wordEng, page, title }) => (
      <Card>
        <CLEyebrow eyebrow={eyebrow} />
        <CLCoverTopRight topRightLogo={topRightLogo}>{topRight}</CLCoverTopRight>
        <div style={{ position: 'absolute', left: 84, top: 740 }}>
          <BrandInsightCloud size={28}>{cloudText}</BrandInsightCloud>
        </div>
        <CoverTitle x={84} y={840} w={912} title={title} titleSize={86} titleLineHeight={1.15} titleField="title" />
        <div
          style={{
            position: 'absolute',
            left: 84,
            top: 1100,
            fontFamily: CN_FONT_ARCHIVO,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: '0.16em',
            color: '#000',
            lineHeight: 1,
          }}
        >
          {wordEng}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 84,
            bottom: 84,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {page}
        </div>
      </Card>
    ),
  },

  /* ── Body text ── */
  {
    id: 'cl-body-text',
    label: '본문 · 큰 제목 + 형광 + 본문',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'heading', label: '큰 제목', type: 'textarea', default: '추구미와 현재형이\n공존하는 책상 한 칸' },
      { key: 'highlight', label: '형광 강조', type: 'text', default: '오래 곁에 둘 물건들로만 채운 공간' },
      { key: 'highlightRest', label: '강조 뒤 텍스트', type: 'text', default: ', 그 안에 담긴 취향.' },
      { key: 'body', label: '본문', type: 'textarea', default:
`작업과 휴식의 경계를 부드럽게 풀어주는 홈오피스.
오랫동안 곁에 둘 물건들만 골라 두고, 매일 손이 가는
도구만 책상 위에 남겼습니다.

좋아하는 무드와 일하는 모드가 함께 머무는 공간.` },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, heading, highlight, highlightRest, body }) => (
      <Card>
        <CLEyebrow eyebrow={eyebrow} />
        <CLBodyTopRight topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
        <Heading01 x={84} y={220} w={912} size={56} field="heading">
          {heading}
        </Heading01>
        <div
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
          }}
        >
          <span style={{ background: `linear-gradient(transparent 62%, ${CN_COLORS.neon} 62%)`, padding: '0 4px' }}>
            {highlight}
          </span>
          <span>{highlightRest}</span>
        </div>
        <BodyText x={84} y={620} w={912} size={32} weight={500} lineHeight={1.7} field="body">
          {body}
        </BodyText>
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
  },

  /* ── Body overlay (자유 드래그) ── */
  {
    id: 'cl-body-overlay',
    label: '본문 · 풀배경 + 정사각 사진 (자유 드래그)',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'bg', label: '풀배경 사진', type: 'image', default: '' },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 180, y: 380, w: 720, h: 720, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, bg }) => (
      <Card>
        <FullBleedPhoto src={bg} />
        <Scrim gradient="linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))" />
        <CLEyebrow eyebrow={eyebrow} />
        <CLBodyTopRight topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
        <Scrim gradient="linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" />
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
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
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, body }) => {
      const a = { x: 84, y: 420, w: 280, h: 265 };
      const b = { x: 716, y: 880, w: 320, h: 305 };
      const a1 = { x: a.x + a.w, y: a.y + a.h };
      const elbow1 = { x: a1.x + 70, y: a1.y + 150 };
      const end1 = { x: elbow1.x + 200, y: elbow1.y };
      const b1 = { x: b.x, y: b.y };
      const elbow2 = { x: b1.x - 70, y: b1.y - 100 };
      const end2 = { x: elbow2.x - 200, y: elbow2.y };
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
              stroke={CN_COLORS.black}
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <polyline
              points={`${b1.x},${b1.y} ${elbow2.x},${elbow2.y} ${end2.x},${end2.y}`}
              fill="none"
              stroke={CN_COLORS.black}
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
    ],
    Component: ({ eyebrow, topRight, topRightLogo, caption, page, photo, body }) => (
      <Card>
        <FullBleedPhoto src={photo} />
        <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />
        <CLEyebrow eyebrow={eyebrow} color="#fff" />
        <CLBodyTopRight color="#fff" topRightLogo={topRightLogo}>{topRight}</CLBodyTopRight>
        <div
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
            color: '#fff',
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            textShadow: '0 1px 12px rgba(0,0,0,0.35)',
          }}
        >
          {body}
        </div>
        <CardFooter left={caption} right={page} color="#fff" leftField="caption" />
      </Card>
    ),
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'cl-blank',
    label: '빈 페이지 · 머릿말/꼬릿말 유지',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: '수집생활' },
      { key: 'topRight', label: '우상단 영문', type: 'text', default: 'WORKROOM' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
      ...BG_FIELDS,
    ],
    Component: ({ eyebrow = '수집생활', topRight, topRightLogo, caption, page, bgType, bgDir, bg1, bg2, bg3 }) => {
      const onPhoto = bgType && bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={bgDir} items={bgItems({ bg1, bg2, bg3 })} />
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
