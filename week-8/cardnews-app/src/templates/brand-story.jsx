// Type 2 · 브랜드 스토리 (NOVOUND 포트폴리오)
// 워드마크: COCOLOCKER (예시) · 중앙 하단 NOVOUND 로고
import React, { useState, useEffect } from 'react';
import {
  Card,
  Eyebrow,
  CoverTitle,
  Heading01,
  BodyText,
  PhotoBox,
  FullBleedPhoto,
  Scrim,
  BackgroundFill,
} from '../design/primitives.jsx';
import { BG_FIELDS, bgItems } from './blankFields.js';
import { SubFrame } from '../design/stickers.jsx';
import { CARD_W, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

function BSEyebrow({ eyebrow = 'Project Review' }) {
  return (
    <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em" field="eyebrow">
      {eyebrow}
    </Eyebrow>
  );
}

// brandLogo가 있으면 PNG, 없으면 텍스트. 로고 크기는 텍스트 높이(26px)와 동일.
function BSBrandTopRight({ children, brandLogo }) {
  if (brandLogo) {
    return (
      <img
        src={brandLogo}
        alt={children || 'brand'}
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
      data-cn-field="brand"
      style={{
        position: 'absolute',
        right: 84,
        top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: '0.02em',
        color: 'rgba(0,0,0,0.5)',
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

// NOVOUND 로고 — PNG의 흰 배경 픽셀을 1회 투명화 (사용자 보고: 풀배경 위에서 흰 사각형으로 보임).
// 처리된 dataURL을 모듈 레벨 캐시 → 모든 인스턴스 공유.
let novoundSrcCache = '/assets/novound_logo.png'; // 첫 렌더는 원본
let novoundCacheLoading = null;

function ensureTransparentNovound() {
  if (novoundCacheLoading) return novoundCacheLoading;
  novoundCacheLoading = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height);
        for (let i = 0; i < data.data.length; i += 4) {
          const r = data.data[i];
          const g = data.data[i + 1];
          const b = data.data[i + 2];
          // 흰색 근방 픽셀 = 배경. alpha 0.
          if (r > 240 && g > 240 && b > 240) {
            data.data[i + 3] = 0;
          } else if (r > 200 && g > 200 && b > 200) {
            // 회색 가장자리는 부드러운 alpha 감쇠 (anti-aliasing 보존)
            const avg = (r + g + b) / 3;
            data.data[i + 3] = Math.round(((255 - avg) / 55) * 255);
          }
        }
        ctx.putImageData(data, 0, 0);
        novoundSrcCache = c.toDataURL('image/png');
        resolve(novoundSrcCache);
      } catch {
        resolve(novoundSrcCache);
      }
    };
    img.onerror = () => resolve(novoundSrcCache);
    img.src = '/assets/novound_logo.png';
  });
  return novoundCacheLoading;
}

function NovoundMark({ width = 130, tone = 'dark' }) {
  const [src, setSrc] = React.useState(novoundSrcCache);
  React.useEffect(() => {
    let alive = true;
    ensureTransparentNovound().then((s) => {
      if (alive) setSrc(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <img
      src={src}
      alt="NOVOUND"
      style={{
        width,
        height: 'auto',
        display: 'block',
        filter: tone === 'light' ? 'brightness(0) invert(1)' : 'none',
      }}
    />
  );
}

function NovoundCenterBottom({ tone = 'dark' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <NovoundMark width={170} tone={tone} />
    </div>
  );
}

function NovoundBottomLeft({ tone = 'dark' }) {
  return (
    <div style={{ position: 'absolute', left: 84, bottom: 86 }}>
      <NovoundMark width={130} tone={tone} />
    </div>
  );
}

function PageRight({ page }) {
  return (
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
  );
}

const COMMON_HEADER_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Project Review' },
  { key: 'brand', label: '브랜드명 (우상단 텍스트)', type: 'text', default: 'COCOLOCKER' },
  { key: 'brandLogo', label: '브랜드 로고 (우상단 PNG — 우선 적용)', type: 'image', default: '' },
];

export const BS_VARIANTS = [
  /* ── Cover ── */
  {
    id: 'bs-cover',
    label: '표지 · 네온 박스 + 타이틀',
    category: 'cover',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Project Review' },
      { key: 'brand', label: '브랜드명 (우상단 텍스트)', type: 'text', default: 'COCOLOCKER' },
      { key: 'brandLogo', label: '브랜드 로고 (우상단 PNG — 우선 적용)', type: 'image', default: '' },
      { key: 'title', label: '메인 타이틀', type: 'text', default: 'Color your way!' },
      { key: 'subtitle', label: '서브 (프로젝트명)', type: 'textarea', default: '푸드웨어 브랜드 \'코코라커\' DDP POP-UP' },
    ],
    // 좌상단 정사각형 이미지 박스 — 자유 드래그/리사이즈/카메라 아이콘으로 이미지 추가
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 240, w: 220, h: 220, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow = 'Project Review', brand, brandLogo, title, subtitle }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em" field="eyebrow">
          {eyebrow}
        </Eyebrow>
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        <CoverTitle x={84} y={780} w={912} title={title} subtitle={subtitle} titleSize={104} titleLineHeight={1.05} titleField="title" subtitleField="subtitle" />
        <NovoundCenterBottom />
      </Card>
    ),
  },

  /* ── Overview ── */
  {
    id: 'bs-overview',
    label: 'OVERVIEW · 텍스트 + 사진',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'overviewLabel', label: 'OVERVIEW 라벨', type: 'text', default: '[OVERVIEW]' },
      { key: 'body', label: 'OVERVIEW 본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를
편하게 답변해주세요!

어떠한 기획을 가지고 만들었는지 프로젝트의 개요를 적습니다.` },
    ],
    // 우하단 사진을 자유 드래그 가능한 overlay image block으로
    defaultOverlays: () => [
      { type: 'image', x: 560, y: 720, w: 436, h: 436, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, brand, brandLogo, page, body, overviewLabel = '[OVERVIEW]' }) => (
      <Card>
        <BSEyebrow eyebrow={eyebrow} />
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        <div
          data-cn-field="overviewLabel"
          style={{
            position: 'absolute',
            left: 76,
            top: 212,
            padding: '4px 12px',
            fontFamily: CN_FONT,
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: '-0.04em',
            display: 'inline-block',
            minHeight: 48,
          }}
        >
          {overviewLabel}
        </div>
        <BodyText x={84} y={300} w={912} size={32} weight={500} lineHeight={1.6} field="body">
          {body}
        </BodyText>
        <NovoundBottomLeft />
        <PageRight page={page} />
      </Card>
    ),
  },

  /* ── Overlay v1 ── */
  {
    id: 'bs-overlay-v1',
    label: '오버레이 · 풀배경 + 정사각 사진',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'bg', label: '풀배경 사진', type: 'image', default: '' },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 220, y: 350, w: 640, h: 640, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, brand, brandLogo, page, bg }) => (
      <Card>
        <FullBleedPhoto src={bg} />
        <Scrim gradient="linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))" />
        <BSEyebrow eyebrow={eyebrow} />
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        <Scrim gradient="linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" />
        <NovoundBottomLeft />
        <PageRight page={page} />
      </Card>
    ),
  },

  /* ── Overlay v2 ── */
  {
    id: 'bs-overlay-v2',
    label: '오버레이 v2 · 사진 2장 + 본문',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'body', label: '본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!` },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 320, w: 422, h: 420, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
      { type: 'image', x: CARD_W - 84 - 422, y: 320, w: 422, h: 420, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, brand, brandLogo, page, body }) => (
      <Card>
        <BSEyebrow eyebrow={eyebrow} />
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        <BodyText x={84} y={820} w={912} size={30} weight={500} lineHeight={1.65} field="body">
          {body}
        </BodyText>
        <NovoundBottomLeft />
        <PageRight page={page} />
      </Card>
    ),
  },

  /* ── Overlay v3 ── */
  {
    id: 'bs-overlay-v3',
    label: '오버레이 v3 · 라운드 사진 + 코멘트',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'body', label: '우상단 본문', type: 'textarea', default:
`대답은 똑같이 이렇게 하면 되지. 팝업 플랜을 세분화하기 위해
사전 질문지를 공유드립니다. 추후 견적 및 킥오프 미팅 진행을
위한 정보이므로 니즈를 편하게 답변해주세요!` },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 290, y: 540, w: 500, h: 500, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 56 } },
      { type: 'sticker', x: 84, y: 1090, w: 'auto', h: 'auto', props: { kind: 'subFrame', variant: 'white', size: 22, children: '가장 큰 검은깨를 두 배로 더 쓴다고 생각해봐\n그러면 상자도 두 배로 커져야지 이거 왜 안 따라옴?' } },
    ],
    Component: ({ eyebrow, brand, brandLogo, page, body }) => (
      <Card>
        <BSEyebrow eyebrow={eyebrow} />
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        <BodyText x={84} y={220} w={912} size={30} weight={500} lineHeight={1.6} align="right" field="body">
          {body}
        </BodyText>
        <NovoundBottomLeft />
        <PageRight page={page} />
      </Card>
    ),
  },

  /* ── Selling Point ── */
  {
    id: 'bs-selling-point',
    label: 'Selling Point (단일)',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'pointLabel', label: '포인트 라벨', type: 'text', default: 'Selling Point' },
      { key: 'n', label: '포인트 번호 (1~3)', type: 'number', default: 1, min: 1, max: 3 },
      { key: 'headline', label: '헤드라인 (1~2줄, 자동 수직 정렬)', type: 'textarea', default: '공간감을 극대화한 컬러 무드' },
      { key: 'body', label: '본문', type: 'textarea', default:
`브랜드의 시그니처 컬러를 공간 전반에 확장시켜
방문자가 자연스럽게 브랜드 무드에 몰입할 수 있도록
모든 디테일을 일관된 톤으로 설계했습니다.` },
    ],
    Component: ({ brand, brandLogo, page, pointLabel = 'Selling Point', n, headline, body }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em" field="pointLabel">
          {`${pointLabel} #${n}`}
        </Eyebrow>
        <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
        {/* 헤드라인 컨테이너: 2줄 기준 높이로 fixed + flex center → 1줄이면 자동으로 수직 중앙 */}
        <div
          data-cn-field="headline"
          data-cn-multiline="1"
          style={{
            position: 'absolute',
            left: 84,
            top: 220,
            width: 912,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            fontFamily: CN_FONT,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: '-0.045em',
            lineHeight: 1.2,
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            overflowWrap: 'anywhere',
          }}
          dangerouslySetInnerHTML={typeof headline === 'string' ? { __html: headline } : undefined}
        >
          {typeof headline !== 'string' ? headline : undefined}
        </div>
        <div style={{ position: 'absolute', left: 84, top: 420, width: 912, height: 3, background: CN_COLORS.black }} />
        <BodyText x={84} y={480} w={912} size={32} weight={500} lineHeight={1.65} field="body">
          {body}
        </BodyText>
        <div
          style={{
            position: 'absolute',
            left: 84,
            bottom: 240,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: i === n ? 56 : 18,
                height: 18,
                background: i === n ? CN_COLORS.neon : '#E8E8E2',
                border: `3px solid ${CN_COLORS.black}`,
                transition: 'width .2s',
              }}
            />
          ))}
        </div>
        <NovoundBottomLeft />
        <PageRight page={page} />
      </Card>
    ),
  },

  /* ── Points summary ── */
  {
    id: 'bs-points-summary',
    label: 'Selling Points · 요약 3행',
    category: 'body',
    fields: [
      ...COMMON_HEADER_FIELDS,
      { key: 'title', label: '제목', type: 'textarea', default: '코코라커 DDP\n성공의 3가지 이유' },
      { key: 'points', label: '셀링 포인트 리스트', type: 'points-list', default: [
        { headline: '공간감을 극대화한 컬러 무드' },
        { headline: '체험형 동선 설계' },
        { headline: '굿즈 · 포토존 연동 전략' },
      ]},
    ],
    Component: ({ brand, brandLogo, page, title, points = [] }) => {
      const pts = points.map((p, i) => ({ n: i + 1, t: p.headline || '' }));
      return (
        <Card>
          <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em">
            Selling Points
          </Eyebrow>
          <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
          <div
            data-cn-field="title"
            data-cn-multiline="1"
            style={{
              position: 'absolute',
              left: 84,
              top: 240,
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 64,
              letterSpacing: '-0.045em',
              lineHeight: 1.1,
              whiteSpace: 'pre-line',
            }}
          >
            {title}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 84,
              right: 84,
              top: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            {pts.map((p) => (
              <div
                key={p.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  paddingBottom: 24,
                  borderBottom: `3px solid ${CN_COLORS.black}`,
                }}
              >
                <div
                  style={{
                    fontFamily: CN_FONT,
                    fontWeight: 800,
                    fontSize: 52,
                    letterSpacing: '-0.04em',
                    minWidth: 88,
                  }}
                >
                  #{p.n}
                </div>
                <div
                  style={{
                    fontFamily: CN_FONT,
                    fontWeight: 700,
                    fontSize: 40,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.3,
                  }}
                >
                  {p.t}
                </div>
              </div>
            ))}
          </div>
          <NovoundBottomLeft />
          <PageRight page={page} />
        </Card>
      );
    },
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'bs-blank',
    label: '빈 페이지 · 머릿말/꼬릿말 유지',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Project Review' },
      { key: 'brand', label: '브랜드 (우상단)', type: 'text', default: 'COCOLOCKER' },
      ...BG_FIELDS,
    ],
    Component: ({ eyebrow, brand, brandLogo, page, bgType, bgDir, bg1, bg2, bg3 }) => {
      const onPhoto = bgType && bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={bgDir} items={bgItems({ bg1, bg2, bg3 })} />
          <BSEyebrow eyebrow={eyebrow} />
          <BSBrandTopRight brandLogo={brandLogo}>{brand}</BSBrandTopRight>
          <NovoundBottomLeft tone={onPhoto ? 'light' : 'dark'} />
          <PageRight page={page} />
        </Card>
      );
    },
  },
];

export const BS_TEMPLATE = {
  id: 'brand-story',
  name: 'Type 2 · 브랜드 스토리',
  tagline: 'NOVOUND 포트폴리오 · 프로젝트 리뷰',
  wordmarkDefault: 'COCOLOCKER',
  variants: BS_VARIANTS,
  defaultPages: ['bs-cover', 'bs-overview', 'bs-overlay-v1', 'bs-selling-point', 'bs-points-summary'],
};
