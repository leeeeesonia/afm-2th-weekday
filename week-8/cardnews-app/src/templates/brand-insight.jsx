// Type 3 · 사적인 디깅노트 (Brand Insight)
// Eyebrow: Insight Note · 워드마크: 브랜드명 (대문자)
import React from 'react';
import {
  Card,
  Eyebrow,
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
import { StandardMiddle } from '../design/stickers.jsx';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

function BIEyebrow({ eyebrow = 'Insight Note', color = '#000' }) {
  return (
    <Eyebrow x={84} y={99} color={color} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
      {eyebrow}
    </Eyebrow>
  );
}

function BIWordmark({ children = 'PORTER CLASSIC', color, wordmarkLogo }) {
  if (wordmarkLogo) {
    const onDark = color && color.includes('255');
    return (
      <img
        src={wordmarkLogo}
        alt={children}
        style={{
          position: 'absolute',
          right: 84,
          top: 106,
          height: 26,
          width: 'auto',
          display: 'block',
          opacity: 0.85,
          filter: onDark ? 'brightness(0) invert(1)' : 'none',
        }}
      />
    );
  }
  return (
    <span
      data-cn-field="wordmark"
      style={{
        position: 'absolute',
        right: 84,
        top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: 1,
        color: color ?? 'rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </span>
  );
}

const COMMON = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Insight Note' },
  { key: 'wordmark', label: '브랜드 (우상단)', type: 'text', default: 'PORTER CLASSIC' },
  { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
];

export const BI_VARIANTS = [
  /* ── 표지 ── */
  {
    id: 'bi-cover-1line',
    label: '표지 · 1줄 타이틀',
    category: 'cover',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Insight Note' },
      { key: 'eyebrowSub', label: '한글 부제 (우상단)', type: 'text', default: '사적인 디깅노트' },
      { key: 'title', label: '메인 타이틀', type: 'text', default: '포터 클래식의 미학' },
      { key: 'wordEng', label: '하단 영문', type: 'text', default: 'PORTER CLASSIC STORY' },
    ],
    Component: ({ eyebrow = 'Insight Note', eyebrowSub, title, wordEng }) => (
      <Card>
        <BIEyebrow eyebrow={eyebrow} />
        <span
          data-cn-field="eyebrowSub"
          style={{
            position: 'absolute',
            right: 84,
            top: 106,
            fontFamily: CN_FONT,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'rgba(0,0,0,0.5)',
          }}
        >
          {eyebrowSub}
        </span>
        <CoverTitle x={84} y={940} w={912} title={title} titleSize={88} titleLineHeight={1.15} titleField="title" />
        <div
          data-cn-field="wordEng"
          style={{
            position: 'absolute',
            left: 84,
            top: 1078,
            fontFamily: CN_FONT_ARCHIVO,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: '0.18em',
            color: '#000',
            lineHeight: 1,
          }}
        >
          {wordEng}
        </div>
      </Card>
    ),
  },
  {
    id: 'bi-cover-2line',
    label: '표지 · 2줄 타이틀',
    category: 'cover',
    fields: [
      { key: 'eyebrowSub', label: '한글 부제 (우상단)', type: 'text', default: '사적인 디깅노트' },
      { key: 'title', label: '메인 타이틀 (2줄)', type: 'textarea', default: '오래 사랑받는 옷,\n포터 클래식의 미학' },
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Insight Note' },
      { key: 'wordEng', label: '하단 영문', type: 'text', default: 'PORTER CLASSIC STORY' },
    ],
    Component: ({ eyebrow = 'Insight Note', eyebrowSub, title, wordEng }) => (
      <Card>
        <BIEyebrow eyebrow={eyebrow} />
        <span
          data-cn-field="eyebrowSub"
          style={{
            position: 'absolute',
            right: 84,
            top: 106,
            fontFamily: CN_FONT,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'rgba(0,0,0,0.5)',
          }}
        >
          {eyebrowSub}
        </span>
        {/* 2줄 타이틀 — 하단 정렬. bottom 기준으로 잡아서 한 줄이든 두 줄이든 wordEng와 안 겹침.
            wordEng는 top:1078 (높이 ~34) → 약 y=1112까지 차지. 그 위로 28px 여백 두고 타이틀 끝점을 y=1050에 둠. */}
        <div
          data-cn-field="title"
          data-cn-multiline="1"
          style={{
            position: 'absolute',
            left: 84,
            bottom: 300,    // 1350 - 1050 = 300
            width: 912,
            fontFamily: CN_FONT,
            fontWeight: 800,
            fontSize: 86,
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
            position: 'absolute',
            left: 84,
            top: 1078,
            fontFamily: CN_FONT_ARCHIVO,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: '0.18em',
            color: '#000',
            lineHeight: 1,
          }}
        >
          {wordEng}
        </div>
      </Card>
    ),
  },

  /* ── Body · text heavy (큰 제목 / 소제목 / 본문) — 형광·볼드는 본문 드래그 시 floating bar ── */
  {
    id: 'bi-body-text',
    label: '본문 · 큰 제목 + 소제목 + 본문',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'heading', label: '큰 제목', type: 'textarea', default: '장인의 손맛이\n브랜드의 정체성이 될 때' },
      { key: 'subhead', label: '소제목', type: 'textarea',
        default: '오래 입을수록 진가가 드러나는 옷, 그 안에 담긴 철학.' },
      { key: 'body', label: '본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!

팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!` },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, heading, subhead, highlight, highlightRest, body }) => {
      // 기존 프로젝트 호환: highlight + highlightRest 분리 필드가 있던 시절 데이터 → subhead HTML로 합치기
      const subheadHtml = subhead || (
        highlight || highlightRest
          ? `${highlight ? `<mark class="cn-hl">${highlight}</mark>` : ''}${highlightRest || ''}`
          : ''
      );
      return (
        <Card>
          <BIEyebrow eyebrow={eyebrow} />
          <BIWordmark wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
          <Heading01 x={84} y={220} w={912} size={56} field="heading">
            {heading}
          </Heading01>
          {/* 소제목 — 형광·볼드는 캔버스에서 드래그 후 floating bar로 적용 */}
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

  /* ── Body · overlay (자유 드래그) ── */
  {
    id: 'bi-body-overlay',
    label: '본문 · 풀배경 + 정사각 오버레이 (자유 드래그)',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'bg', label: '풀배경 사진', type: 'image', default: '' },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 180, y: 380, w: 720, h: 720, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, wordmark, caption, page, bg }) => (
      <Card>
        <FullBleedPhoto src={bg} />
        <Scrim gradient="linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))" />
        <BIEyebrow eyebrow={eyebrow} />
        <BIWordmark>{wordmark}</BIWordmark>
        <Scrim gradient="linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" />
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
  },

  /* ── Body · 꺽쇠 connected (사진 자유 드래그, 꺽쇠 라인은 고정) ── */
  {
    id: 'bi-body-connected',
    label: '본문 · 꺽쇠 연결 사진 2장 (자유 드래그)',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'body', label: '우상단 본문', type: 'textarea', default:
`대답은 똑같이 이렇게 하면 되지. 팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다. 추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게 답변해주세요!` },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 420, w: 280, h: 265, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
      { type: 'image', x: 716, y: 880, w: 320, h: 305, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, wordmark, caption, page, body }) => {
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
          <BIEyebrow />
          <BIWordmark>{wordmark}</BIWordmark>
          <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.6} align="right" field="body">
            {body}
          </BodyText>
          <svg
            width={CARD_W}
            height={CARD_H}
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
          >
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

  /* ── Body · CTA quote ── */
  {
    id: 'bi-body-cta',
    label: '본문 · CTA 인용',
    category: 'body',
    fields: [
      ...COMMON,
      // 단일 타이틀 — 형광·볼드는 캔버스에서 드래그 후 floating bar(B/H)로 적용.
      // 줄바꿈은 Shift+Enter(또는 \n).
      { key: 'title', label: '메인 카피', type: 'textarea', default: '피그마 AI 정복기 가능?' },
      { key: 'body', label: '하단 인용', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!` },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, title, highlight, rest, body }) => {
      // 기존 highlight/rest 두 필드 데이터 → 단일 title로 합치기 (호환성)
      const titleHtml = title || (
        highlight || rest
          ? `${highlight || ''}${highlight && rest ? '\n' : ''}${rest || ''}`
          : ''
      );
      return (
        <Card>
          <BIEyebrow eyebrow={eyebrow} />
          <BIWordmark wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
          {/* 메인 타이틀 — 단일 박스, 형광·볼드는 드래그로 사용자가 직접 */}
          <div
            data-cn-field="title"
            data-cn-multiline="1"
            style={{
              position: 'absolute',
              left: 84,
              right: 84,
              top: 320,
              textAlign: 'center',
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 80,
              lineHeight: 1.2,
              letterSpacing: '-0.045em',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              overflowWrap: 'anywhere',
            }}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          {/* 하단 인용 — StandardMiddle 스티커 안 텍스트도 인플레이스 편집 가능하게.
              StandardMiddle은 children을 그대로 렌더하므로, 내부에 data-cn-field 보유한 div를 직접 넣음. */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center' }}>
            <StandardMiddle w={830} size={30}>
              <span data-cn-field="body" data-cn-multiline="1" style={{ display: 'inline-block', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                {body}
              </span>
            </StandardMiddle>
          </div>
          <CardFooter left={caption} right={page} leftField="caption" />
        </Card>
      );
    },
  },

  /* ── Body · full image ── */
  {
    id: 'bi-body-image-bottom',
    label: '본문 · 풀이미지 + 글 아래',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'photo', label: '배경 사진', type: 'image', default: '' },
      { key: 'body', label: '본문', type: 'textarea', default:
`장인의 손맛이 브랜드의 정체성이 될 때,
오래 입을수록 진가가 드러나는 옷을 만드는 구도에
포터 클래식의 철학이 담겨 있습니다.` },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, photo, body }) => (
      <Card>
        <FullBleedPhoto src={photo} />
        <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />
        <BIEyebrow color="#fff" />
        <BIWordmark color="rgba(255,255,255,0.65)" wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
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

  /* ── Body · summary — 행 단위 표(2~5행) + 인플레이스 편집 ── */
  {
    id: 'bi-body-summary',
    label: '본문 · 정보 요약 (행 단위 표)',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'brand', label: '브랜드 큰 글씨', type: 'text', default: '포터 클래식' },
      { key: 'subtitle', label: '서브카피', type: 'text', default: '이제 어디서 만날 수 있을까?' },
      { key: 'rows', label: '표 행 (2~5개)', type: 'summary-rows', default: [
        { label: '판매처', value: '서울시 용산구 한강대로 5·\nPORTER STORE @porter.classic' },
        { label: '가격', value: '메신저 토트백 198,000원~' },
        { label: 'Insight', value: '100년의 지혜를 담은 일본 교토의\n대표적 클래식 워크웨어 브랜드.' },
      ] },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, brand, subtitle, rows, where, price, summary }) => {
      // 기존 where/price/summary 분리 필드 데이터 → rows 배열로 자동 마이그레이션 (호환성)
      const resolvedRows = Array.isArray(rows) && rows.length > 0
        ? rows
        : [
            { label: '판매처', value: where || '' },
            { label: '가격', value: price || '' },
            { label: 'Insight', value: summary || '' },
          ];
      return (
        <Card>
          <BIEyebrow eyebrow={eyebrow} />
          <BIWordmark wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 240,
              textAlign: 'center',
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1.15,
              letterSpacing: '-0.045em',
            }}
          >
            {/* 브랜드 — 형광 강제 제거. 필요하면 사용자가 드래그 → floating bar로 직접 적용. */}
            <span data-cn-field="brand">{brand}</span>
            <div
              data-cn-field="subtitle"
              style={{ marginTop: 12, fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em' }}
            >
              {subtitle}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 84,
              right: 84,
              top: 540,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {resolvedRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  border: `3px solid ${CN_COLORS.black}`,
                  background: '#fff',
                  minHeight: 120,
                }}
              >
                {/* 라벨 셀 — 인플레이스 편집. data-cn-field에 dotted path 사용 → store가 rows[i].label로 업데이트 */}
                <div
                  data-cn-field={`rows.${i}.label`}
                  style={{
                    minWidth: 180,
                    background: CN_COLORS.lemon,
                    borderRight: `3px solid ${CN_COLORS.black}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: CN_FONT,
                    fontWeight: 800,
                    fontSize: 30,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {row.label}
                </div>
                {/* 값 셀 — 인플레이스 편집 */}
                <div
                  data-cn-field={`rows.${i}.value`}
                  data-cn-multiline="1"
                  style={{
                    flex: 1,
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: CN_FONT,
                    fontWeight: 500,
                    fontSize: 28,
                    lineHeight: 1.45,
                    letterSpacing: '-0.04em',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
          <CardFooter left={caption} right={page} leftField="caption" />
        </Card>
      );
    },
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'bi-blank',
    label: '빈 페이지 · 머릿말/꼬릿말 유지',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Insight Note' },
      { key: 'wordmark', label: '브랜드 (우상단)', type: 'text', default: 'PORTER CLASSIC' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
      ...BG_FIELDS,
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, bgType, bgDir, bg1, bg2, bg3 }) => {
      const onPhoto = bgType && bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={bgDir} items={bgItems({ bg1, bg2, bg3 })} />
          <BIEyebrow eyebrow={eyebrow} color={onPhoto ? '#fff' : '#000'} />
          <BIWordmark color={onPhoto ? 'rgba(255,255,255,0.7)' : undefined} wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
          <CardFooter left={caption} right={page} color={onPhoto ? '#fff' : '#000'} leftField="caption" />
        </Card>
      );
    },
  },
];

export const BI_TEMPLATE = {
  id: 'brand-insight',
  name: 'Type 3 · 사적인 디깅노트',
  tagline: 'Brand Insight · 디깅 리뷰',
  wordmarkDefault: 'PORTER CLASSIC',
  variants: BI_VARIANTS,
  defaultPages: [
    'bi-cover-1line',
    'bi-body-text',
    'bi-body-overlay',
    'bi-body-cta',
    'bi-body-summary',
  ],
};
