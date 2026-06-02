// Type 1 · 에세이 — 풀이미지 표지 4종 + 본문 5종 + 아웃트로
import React from 'react';
import {
  Card,
  Eyebrow,
  Heading01,
  BodyText,
  CardFooter,
  Highlight,
  PhotoBox,
  FullBleedPhoto,
  Scrim,
  BackgroundFill,
} from '../design/primitives.jsx';
import { BG_FIELDS, bgItems } from './blankFields.js';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

function EssayHeader({ eyebrow = 'Essay', color = '#000', wordmark = '@oyatlog', wordmarkLogo }) {
  const subColor = color === '#fff' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)';
  return (
    <>
      <Eyebrow x={84} y={99} color={color} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
        {eyebrow}
      </Eyebrow>
      {wordmarkLogo ? (
        <img
          src={wordmarkLogo}
          alt={wordmark}
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
      ) : (
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
            color: subColor,
          }}
         dangerouslySetInnerHTML={{ __html: typeof wordmark === 'string' ? wordmark : '' }} />
      )}
    </>
  );
}

/* ─────────── 표지 (4 variants) ─────────── */
function EssayCoverBase({ hAlign, vAlign, title, subtitle, photo, textColor = '#fff', wordmark, wordmarkLogo, eyebrow, scrim, gradient, textShadow = false }) {
  // backward compat: gradient(boolean) → scrim(enum)
  const sm = scrim || (gradient === false ? 'none' : 'gradient');
  const padX = 84;
  const blockW = 912;
  const horizontal = {
    left: { left: padX, textAlign: 'left', width: blockW - 100 },
    center: { left: (CARD_W - blockW) / 2, textAlign: 'center', width: blockW },
    right: { left: padX, textAlign: 'right', width: blockW - 100 },
  }[hAlign];
  const vertical = {
    top: { top: 200 },
    middle: { top: 0, height: CARD_H, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    bottom: { bottom: 200 },
  }[vAlign];
  const scrimCss =
    vAlign === 'bottom'
      ? 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'
      : vAlign === 'top'
      ? 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)';
  return (
    <Card>
      <FullBleedPhoto src={photo} />
      {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
      {sm === 'gradient' && <Scrim gradient={scrimCss} />}
      <EssayHeader color={textColor} wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
      <div
        style={{
          position: 'absolute',
          left: horizontal.left,
          width: horizontal.width,
          textAlign: horizontal.textAlign,
          color: textColor,
          fontFamily: CN_FONT,
          ...vertical,
        }}
      >
        <div
          data-cn-field="title"
          data-cn-multiline="1"
          style={{
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.15,
            letterSpacing: '-0.045em',
            textShadow: textShadow ? '0 1px 3px rgba(0,0,0,0.65), 0 2px 18px rgba(0,0,0,0.35)' : 'none',
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
          }}
         dangerouslySetInnerHTML={{ __html: typeof title === 'string' ? title : '' }} />
        {subtitle ? (
          <div
            data-cn-field="subtitle"
            data-cn-multiline="1"
            style={{
              marginTop: 30,
              fontWeight: 500,
              fontSize: 32,
              lineHeight: 1.5,
              letterSpacing: '-0.04em',
              textShadow: textShadow ? '0 1px 2px rgba(0,0,0,0.6), 0 1px 12px rgba(0,0,0,0.3)' : 'none',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
            }}
           dangerouslySetInnerHTML={{ __html: typeof subtitle === 'string' ? subtitle : '' }} />
        ) : null}
      </div>
    </Card>
  );
}

const COVER_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Essay' },
  { key: 'title', label: '메인 타이틀', type: 'textarea', default: '피그마 AI 정복기 가능?' },
  { key: 'subtitle', label: '서브 타이틀 (줄바꿈 가능)', type: 'textarea', default: '이건 그냥 대충 이 정도 느낌' },
  { key: 'photo', label: '배경 사진', type: 'image', default: '' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
  { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
  { key: 'textShadow', label: '글씨 그림자', type: 'toggle', default: false },
];

const BODY_FIELDS_TEXTONLY = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Essay' },
  { key: 'heading', label: '본문 큰 제목', type: 'textarea', default: '피그마 AI\n정복기 가능?' },
  { key: 'body', label: '본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!

팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!` },
  { key: 'caption', label: '하단 캡션', type: 'text', default: '피그마 AI 정복기 가능?' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
];

const BODY_FIELDS_IMG = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Essay' },
  { key: 'body', label: '본문', type: 'textarea', default:
`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게 답변해주세요!` },
  { key: 'caption', label: '하단 캡션', type: 'text', default: '피그마 AI 정복기 가능?' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
];

const BODY3_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Essay' },
  { key: 'photo', label: '배경 사진', type: 'image', default: '' },
  { key: 'body', label: '본문', type: 'textarea', default:
`고미술 상가에 가면 이런 부분이 좋습니다.
이런 것들을 볼 수 있고요. 친절한 사장님들과의 담소가
가장 인상적이었죠. 원하는 디자인 방향에 따라
이렇게 저렇게 고칠 수 있습니다.` },
  { key: 'caption', label: '하단 캡션', type: 'text', default: '피그마 AI 정복기 가능?' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
  { key: 'scrim', label: '배경 효과', type: 'segment', default: 'gradient', options: [{ value: 'fullscreen', label: '전체화면' }, { value: 'gradient', label: '그라데이션' }, { value: 'none', label: '효과없음' }] },
  { key: 'textShadow', label: '글씨 그림자', type: 'toggle', default: false },
];

export const ESSAY_VARIANTS = [
  /* ── 표지 4종 ── */
  {
    id: 'essay-cover-bottom-left',
    label: '표지 · 좌하단 (basic)',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: (p) => <EssayCoverBase {...p} hAlign="left" vAlign="bottom" />,
  },
  {
    id: 'essay-cover-bottom-center',
    label: '표지 · 중앙 하단',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: (p) => <EssayCoverBase {...p} hAlign="center" vAlign="bottom" />,
  },
  {
    id: 'essay-cover-center',
    label: '표지 · 정중앙',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: (p) => <EssayCoverBase {...p} hAlign="center" vAlign="middle" />,
  },
  {
    id: 'essay-cover-top-center',
    label: '표지 · 중앙 상단',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: (p) => <EssayCoverBase {...p} hAlign="center" vAlign="top" />,
  },

  /* ── 본문 5종 ── */
  {
    id: 'essay-body-text',
    label: '본문 1 · 텍스트',
    category: 'body',
    fields: BODY_FIELDS_TEXTONLY,
    Component: ({ eyebrow, heading, body, caption, page, wordmark, wordmarkLogo }) => (
      <Card>
        <EssayHeader wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
        <Heading01 x={84} y={220} w={912} size={56} field="heading">
          {heading}
        </Heading01>
        <BodyText x={84} y={520} w={912} size={32} weight={500} lineHeight={1.7} field="body">
          {body}
        </BodyText>
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
  },
  {
    id: 'essay-body-img-top',
    label: '본문 2 · 글 위 / 사진 아래 (자유 드래그)',
    category: 'body',
    fields: BODY_FIELDS_IMG,
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 580, w: 912, h: 580, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, body, caption, page, wordmark, wordmarkLogo }) => (
      <Card>
        <EssayHeader wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
        <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.65} field="body">
          {body}
        </BodyText>
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
  },
  {
    id: 'essay-body-img-bottom',
    label: '본문 2 · 사진 위 / 글 아래 (자유 드래그)',
    category: 'body',
    fields: BODY_FIELDS_IMG,
    defaultOverlays: () => [
      { type: 'image', x: 84, y: 210, w: 912, h: 580, props: { src: '', border: 3, borderColor: '#000000', borderRadius: 0 } },
    ],
    Component: ({ eyebrow, body, caption, page, wordmark, wordmarkLogo }) => (
      <Card>
        <EssayHeader wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
        <BodyText x={84} y={840} w={912} size={32} weight={500} lineHeight={1.65} field="body">
          {body}
        </BodyText>
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
    ),
  },
  {
    id: 'essay-body-fullimg-top',
    label: '본문 3 · 풀이미지 + 글 위',
    category: 'body',
    fields: BODY3_FIELDS,
    Component: ({ eyebrow, photo, body, caption, page, wordmark, wordmarkLogo, scrim, gradient, textShadow = false, themeMode }) => {
      const sm = scrim || (gradient === false ? 'none' : 'gradient');
      const isDark = themeMode === 'dark';
      const fg = isDark ? '#fff' : '#000';
      const shadowMain = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)';
      const shadowGlow = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)';
      return (
      <Card>
        <FullBleedPhoto src={photo} />
        {sm === 'fullscreen' && <Scrim gradient="rgba(0,0,0,0.45)" />}
        {sm === 'gradient' && <Scrim gradient="linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" />}
        <EssayHeader color={fg} wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
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
  {
    id: 'essay-body-fullimg-bottom',
    label: '본문 3 · 풀이미지 + 글 아래',
    category: 'body',
    fields: BODY3_FIELDS,
    Component: ({ eyebrow, photo, body, caption, page, wordmark, wordmarkLogo, scrim, gradient, textShadow = false, themeMode }) => {
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
        <EssayHeader color={fg} wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
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

  /* ── 아웃트로 ── */
  {
    id: 'essay-outro',
    label: '아웃트로 · 메인 카피',
    category: 'outro',
    fields: [
      { key: 'eyebrow', label: '상단 라벨', type: 'text', default: 'ESSAY · @OYATLOG' },
      { key: 'title', label: '메인 카피 (드래그→형광/볼드)', type: 'textarea', default: '<mark class="cn-hl">피그마 AI</mark>\n정복기 가능?' },
      { key: 'subtitle', label: '서브카피', type: 'text', default: '이건 그냥 대충 이 정도 느낌' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '피그마 AI 정복기 가능?' },
    ],
    Component: ({ eyebrow, title, titleHighlight, titleRest, subtitle, caption, page, themeMode }) => {
      // 기존 프로젝트 호환: titleHighlight/titleRest 두 필드를 단일 title HTML로 합쳐줌
      const titleHtml = title || (
        titleHighlight || titleRest
          ? `${titleHighlight ? `<mark class="cn-hl">${titleHighlight}</mark>` : ''}${titleHighlight && titleRest ? '\n' : ''}${titleRest || ''}`
          : ''
      );
      const fg = themeMode === 'dark' ? '#fff' : '#000';
      return (
      <Card>
        {/* 상단 라벨 — 다크/라이트 테마 자동 대응 */}
        <div
          data-cn-field="eyebrow"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 99,
            textAlign: 'center',
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: fg,
          }}
         dangerouslySetInnerHTML={{ __html: typeof eyebrow === 'string' ? eyebrow : '' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center' }}>
          <div
            data-cn-field="title"
            data-cn-multiline="1"
            style={{
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 88,
              lineHeight: 1.2,
              letterSpacing: '-0.045em',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              padding: '0 60px',
              color: fg,
            }}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          <div
            data-cn-field="subtitle"
            style={{
              marginTop: 36,
              fontFamily: CN_FONT,
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: '-0.04em',
              color: fg,
            }}
           dangerouslySetInnerHTML={{ __html: typeof subtitle === 'string' ? subtitle : '' }} />
        </div>
        <CardFooter left={caption} right={page} leftField="caption" />
      </Card>
      );
    },
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'essay-blank',
    label: '빈 페이지 · 2/3분할',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Essay' },
      { key: 'wordmark', label: '워드마크 (우상단)', type: 'text', default: '@oyatlog' },
      { key: 'caption', label: '하단 캡션', type: 'text', default: '피그마 AI 정복기 가능?' },
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
          <EssayHeader color={onPhoto ? '#fff' : '#000'} wordmark={wordmark} wordmarkLogo={wordmarkLogo} eyebrow={eyebrow} />
          <CardFooter left={caption} right={page} color={onPhoto ? '#fff' : '#000'} leftField="caption" />
        </Card>
      );
    },
  },
];

export const ESSAY_TEMPLATE = {
  id: 'essay',
  name: 'Type 1 · 에세이',
  tagline: '풀이미지 표지 + 자유 본문',
  wordmarkDefault: '@oyatlog',
  variants: ESSAY_VARIANTS,
  defaultPages: [
    'essay-cover-bottom-left',
    'essay-body-text',
    'essay-body-img-top',
    'essay-body-fullimg-bottom',
    'essay-outro',
  ],
};
