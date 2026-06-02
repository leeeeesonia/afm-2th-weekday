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
  useCnTheme,
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
  const mode = useCnTheme();
  // color가 명시되면 그대로 (사진 위 흰글씨 케이스 등). 미지정이면 테마 따라 자동.
  const resolved =
    color ?? (mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)');
  if (wordmarkLogo) {
    const onDark = resolved.includes('255'); // 흰계열이면 로고 반전
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
        color: resolved,
      }}
    >
      {children}
    </span>
  );
}

function BIEyebrowSub({ children }) {
  const mode = useCnTheme();
  const c = mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  return (
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
        color: c,
      }}
      dangerouslySetInnerHTML={{ __html: typeof children === 'string' ? children : '' }}
    />
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
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'none', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
    ],
    Component: ({ eyebrow = 'Insight Note', eyebrowSub, title, wordEng, themeMode, scrim }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      const sm = scrim || 'none';
      return (
        <Card>
          {/* 텍스트가 하단(bottom 200)에 위치 → 그라데이션은 아래쪽이 어둡고 위로 페이드 (0deg) */}
          {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
          {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 55%)" />}
          <BIEyebrow eyebrow={eyebrow} />
          <BIEyebrowSub>{eyebrowSub}</BIEyebrowSub>
          {/* T1 좌하단 패턴 — bottom anchored 블록. color는 wrapper에 한 번만 → 자식 상속. */}
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
                letterSpacing: '0.18em',
                lineHeight: 1,
                color: '#7599fb',
              }}
              dangerouslySetInnerHTML={{ __html: typeof wordEng === 'string' ? wordEng : '' }}
            />
          </div>
        </Card>
      );
    },
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
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'none', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
    ],
    Component: ({ eyebrow = 'Insight Note', eyebrowSub, title, wordEng, themeMode, scrim }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      const sm = scrim || 'none';
      return (
        <Card>
          {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
          {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 55%)" />}
          <BIEyebrow eyebrow={eyebrow} />
          <BIEyebrowSub>{eyebrowSub}</BIEyebrowSub>
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
                letterSpacing: '0.18em',
                lineHeight: 1,
                color: '#7599fb',
              }}
              dangerouslySetInnerHTML={{ __html: typeof wordEng === 'string' ? wordEng : '' }}
            />
          </div>
        </Card>
      );
    },
  },

  /* ── Body · text heavy (큰 제목 / 소제목 / 본문) — 형광·볼드는 본문 드래그 시 floating bar ── */
  {
    id: 'bi-body-text',
    label: '본문 · 큰 제목 + 소제목 + 본문',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'heading', label: '큰 제목', type: 'textarea', default: '장인의 손맛이\n브랜드의 정체성이 될 때' },
      // removable — 사이드바에서 X 버튼으로 숨김/표시 토글 (subheadHidden 플래그). 텍스트는 보존.
      { key: 'subhead', label: '소제목', type: 'textarea', removable: true,
        default: '오래 입을수록 진가가 드러나는 옷, 그 안에 담긴 철학.' },
      { key: 'body', label: '본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!

팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!` },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, heading, subhead, subheadHidden, highlight, highlightRest, body, themeMode }) => {
      // 기존 프로젝트 호환: highlight + highlightRest 분리 필드가 있던 시절 데이터 → subhead HTML로 합치기
      const subheadHtml = subhead || (
        highlight || highlightRest
          ? `${highlight ? `<mark class="cn-hl">${highlight}</mark>` : ''}${highlightRest || ''}`
          : ''
      );
      const showSubhead = !subheadHidden && typeof subheadHtml === 'string' && subheadHtml.trim() !== '';
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      // 반응형 레이아웃: 큰 제목 줄 수에 따라 자동 흐름. 절대 좌표(y=470, y=620) 대신 marginTop 사용.
      // - 큰 제목 → marginTop 0
      // - 소제목 → marginTop 60 (큰 제목 1줄/2줄 무관, 동일 간격 유지)
      // - 본문   → marginTop 50 (소제목 다음) 또는 60 (소제목 숨김 시 그 자리로 올라감)
      return (
        <Card>
          <BIEyebrow eyebrow={eyebrow} />
          <BIWordmark wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
          <div style={{ position: 'absolute', left: 84, right: 84, top: 220 }}>
            <div
              data-cn-field="heading"
              data-cn-multiline="1"
              style={{
                fontFamily: CN_FONT,
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1.2,
                letterSpacing: '-0.045em',
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
                color: fg,
              }}
              dangerouslySetInnerHTML={{ __html: typeof heading === 'string' ? heading : '' }}
            />
            {showSubhead && (
              <div
                data-cn-field="subhead"
                data-cn-multiline="1"
                style={{
                  marginTop: 60,
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
            )}
            <div
              data-cn-field="body"
              data-cn-multiline="1"
              style={{
                marginTop: showSubhead ? 50 : 60,
                fontFamily: CN_FONT,
                fontWeight: 500,
                fontSize: 32,
                letterSpacing: '-0.04em',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
                color: fg,
              }}
              dangerouslySetInnerHTML={{ __html: typeof body === 'string' ? body : '' }}
            />
          </div>
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
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
    ],
    defaultOverlays: () => [
      { type: 'image', x: 180, y: 380, w: 720, h: 720, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, wordmark, caption, page, bg, scrim, gradient }) => {
      const sm = scrim || (gradient === false ? 'none' : 'gradient');
      return (
      <Card>
        <FullBleedPhoto src={bg} />
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))" />}
        <BIEyebrow eyebrow={eyebrow} />
        <BIWordmark>{wordmark}</BIWordmark>
        {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" />}
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
      );
    },
  },

  /* ── Body · full image + 글 위 (이전 '꺽쇠 연결' 변형 — 꺽쇠/사진블록 제거, 풀이미지 모드로 전환) ── */
  // id는 기존 'bi-body-connected' 유지 — 기존 프로젝트 페이지가 깨지지 않도록.
  {
    id: 'bi-body-connected',
    label: '본문 · 풀이미지 + 글 위',
    category: 'body',
    fields: [
      ...COMMON,
      { key: 'photo', label: '배경 사진', type: 'image', default: '' },
      { key: 'body', label: '본문', type: 'textarea', default:
`장인의 손맛이 브랜드의 정체성이 될 때,
오래 입을수록 진가가 드러나는 옷을 만드는 구도에
포터 클래식의 철학이 담겨 있습니다.` },
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
      { key: 'textShadow', label: '글씨 그림자', type: 'toggle', default: false },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, photo, body, scrim, gradient, textShadow = false }) => { const sm = scrim || (gradient === false ? 'none' : 'gradient'); return (
      <Card>
        <FullBleedPhoto src={photo} />
        {/* 위쪽이 어둡고 아래로 페이드 — '글 위' 카피 가독성 확보 (글 아래 변형의 거울상) */}
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
        <BIEyebrow color="#fff" />
        <BIWordmark color="rgba(255,255,255,0.65)" wordmarkLogo={wordmarkLogo}>{wordmark}</BIWordmark>
        <div
          data-cn-field="body"
          data-cn-multiline="1"
          style={{
            position: 'absolute',
            left: 84,
            right: 84,
            top: 200,
            fontFamily: CN_FONT,
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.65,
            letterSpacing: '-0.04em',
            color: '#fff',
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            // 미세 드랍섀도우 — 밝은 사진 위에서도 텍스트 가독성 확보. 그라디언트 OFF일 때 가장 유용.
            textShadow: textShadow ? '0 1px 3px rgba(0,0,0,0.65), 0 2px 12px rgba(0,0,0,0.35)' : 'none',
          }}
        >
          {body}
        </div>
        <CardFooter left={caption} right={page} color="#fff" leftField="caption" />
      </Card>
      ); },
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
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, title, highlight, rest, body, themeMode }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
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
              color: fg,
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
      { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
      { key: 'textShadow', label: '글씨 그림자', type: 'toggle', default: false },
    ],
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, photo, body, scrim, gradient, textShadow = false }) => { const sm = scrim || (gradient === false ? 'none' : 'gradient'); return (
      <Card>
        <FullBleedPhoto src={photo} />
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
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
            // 미세 드랍섀도우 — 그라디언트 OFF + 밝은 사진에서도 텍스트 가독성 확보
            textShadow: textShadow ? '0 1px 3px rgba(0,0,0,0.65), 0 2px 12px rgba(0,0,0,0.35)' : 'none',
          }}
        >
          {body}
        </div>
        <CardFooter left={caption} right={page} color="#fff" leftField="caption" />
      </Card>
      ); },
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
    Component: ({ eyebrow, wordmark, wordmarkLogo, caption, page, brand, subtitle, rows, where, price, summary, themeMode }) => {
      const fg = themeMode === 'dark' ? '#fff' : '#000';
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
              color: fg,
            }}
          >
            {/* 브랜드 — 형광 강제 제거. 필요하면 사용자가 드래그 → floating bar로 직접 적용. */}
            <span data-cn-field="brand" dangerouslySetInnerHTML={{ __html: typeof brand === 'string' ? brand : '' }} />
            <div
              data-cn-field="subtitle"
              style={{ marginTop: 12, fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em' }}
              dangerouslySetInnerHTML={{ __html: typeof subtitle === 'string' ? subtitle : '' }}
            />
          </div>
          {/* 표 영역 — 서브카피 아래(top 440)와 하단 캡션/페이지 표기 위(bottom 180) 사이에서 행 수에 따라 자동 가운데 정렬.
              2/3/4/5행 모두 빈 공간을 균등하게 차지 (justify-content: center). */}
          <div
            style={{
              position: 'absolute',
              left: 84,
              right: 84,
              top: 440,
              bottom: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
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
                {/* 라벨 셀 — flex 가운데 정렬은 외곽이 담당, 안쪽 div가 인플레이스 편집 대상 */}
                <div
                  style={{
                    minWidth: 180,
                    background: CN_COLORS.lemon,
                    borderRight: `3px solid ${CN_COLORS.black}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    data-cn-field={`rows.${i}.label`}
                    style={{
                      fontFamily: CN_FONT,
                      fontWeight: 800,
                      fontSize: 30,
                      letterSpacing: '-0.04em',
                      textAlign: 'center',
                    }}
                    dangerouslySetInnerHTML={{ __html: typeof row.label === 'string' ? row.label : '' }}
                  />
                </div>
                {/* 값 셀 — 외곽은 flex 가운데 정렬, 안쪽 div가 실제 인플레이스 편집 대상.
                    contentEditable이 직접 flex 컨테이너에 붙으면 줄바꿈/볼드/정렬이 깨지는 문제 회피. */}
                <div
                  style={{
                    flex: 1,
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    data-cn-field={`rows.${i}.value`}
                    data-cn-multiline="1"
                    style={{
                      width: '100%',
                      fontFamily: CN_FONT,
                      fontWeight: 500,
                      fontSize: 28,
                      lineHeight: 1.45,
                      letterSpacing: '-0.04em',
                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                      textAlign: 'left',
                    }}
                    dangerouslySetInnerHTML={{ __html: typeof row.value === 'string' ? row.value : '' }}
                  />
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
    label: '빈 페이지 · 2/3분할',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Insight Note' },
      { key: 'wordmark', label: '브랜드 (우상단)', type: 'text', default: 'PORTER CLASSIC' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '@oyatlog' },
    ],
    Component: (props) => {
      const { eyebrow, wordmark, wordmarkLogo, caption, page } = props;
      const bgType = props.bgType || 'none';
      const sm = props.scrim || 'none';
      const onPhoto = bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={props.bgDir || 'h'} items={bgItems(props)} />
          {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
          {sm === 'gradient' && <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
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
