// Type 4 · 인터뷰
// 4종 표지 (풀이미지) + 본문 4종 (Q-박스)
import React from 'react';
import {
  Card,
  Eyebrow,
  BodyText,
  FullBleedPhoto,
  Scrim,
  BackgroundFill,
} from '../design/primitives.jsx';
import { BG_FIELDS, bgItems } from './blankFields.js';
import { QuestionBox, QuestionMiddle, StandardMiddle } from '../design/stickers.jsx';
import { CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS } from '../design/tokens.js';

const COVER_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow (영문)', type: 'text', default: 'SELF INTERVIEW' },
  { key: 'sub', label: 'Sub (줄바꿈 가능)', type: 'textarea', default: '2026 ver' },
  { key: 'title', label: '메인 타이틀', type: 'textarea', default: '브랜드기획자 이수지를\n소개합니다.' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
  { key: 'photo', label: '배경 사진', type: 'image', default: '' },
];

const BODY_COMMON = [
  { key: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'Interview' },
  { key: 'wordmark', label: '워드마크', type: 'text', default: '@oyatlog' },
];

function IVTopRight({ wordmark, color = '#000', wordmarkLogo }) {
  const subColor = color === '#fff' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)';
  if (wordmarkLogo) {
    return (
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
        color: subColor,
      }}
    >
      {wordmark}
    </span>
  );
}

function IVPageOnly({ page, color = '#000' }) {
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
        color,
      }}
    >
      {page}
    </div>
  );
}

function BottomCenter({ bottomY = 1156, children }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: CARD_H - bottomY,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

export const IV_VARIANTS = [
  /* ── Cover 1 — bottom white card ── */
  {
    id: 'iv-cover-card',
    label: '표지 1 · 하단 화이트 카드',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: ({ eyebrow, sub, title, wordmark, wordmarkLogo, photo }) => (
      <Card>
        <FullBleedPhoto src={photo} />
        <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">
          {eyebrow}
        </Eyebrow>
        <span
          style={{
            position: 'absolute',
            right: 84,
            top: 106,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '0.08em',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {sub.toUpperCase()}.
        </span>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 420,
            background: '#fff',
            borderTop: `3px solid ${CN_COLORS.black}`,
            padding: '70px 84px 84px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 84,
              lineHeight: 1.12,
              letterSpacing: '-0.045em',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </div>
          <div
            style={{
              alignSelf: 'flex-end',
              fontFamily: CN_FONT_ARCHIVO,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'rgba(0,0,0,0.55)',
            }}
          >
            {wordmark}
          </div>
        </div>
      </Card>
    ),
  },

  /* ── Cover 2 — overlay text ── */
  {
    id: 'iv-cover-overlay',
    label: '표지 2 · 사진 위 오버레이',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: ({ eyebrow, sub, title, wordmark, wordmarkLogo, photo }) => (
      <Card>
        <FullBleedPhoto src={photo} />
        <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)" />
        <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">
          {eyebrow}
        </Eyebrow>
        <span
          style={{
            position: 'absolute',
            right: 84,
            top: 106,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {wordmark}
        </span>
        <div style={{ position: 'absolute', left: 84, right: 84, bottom: 180, color: '#fff' }}>
          <div
            style={{
              fontFamily: CN_FONT_ARCHIVO,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 26,
            }}
          >
            {sub.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: CN_FONT,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.1,
              letterSpacing: '-0.045em',
              whiteSpace: 'pre-line',
              wordBreak: 'keep-all',
              textShadow: '0 2px 18px rgba(0,0,0,0.35)',
            }}
          >
            {title}
          </div>
        </div>
      </Card>
    ),
  },

  /* ── Cover 3 — horizontal split ── */
  {
    id: 'iv-cover-hsplit',
    label: '표지 3 · 가로 split',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: ({ eyebrow, sub, title, wordmark, wordmarkLogo, photo }) => {
      const photoH = 820;
      return (
        <Card>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              height: photoH,
              backgroundImage: photo ? `url(${photo})` : undefined,
              backgroundColor: photo ? undefined : '#3a3a3a',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: photoH, height: 3, background: CN_COLORS.black }} />
          <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">
            {eyebrow}
          </Eyebrow>
          <span
            style={{
              position: 'absolute',
              right: 84,
              top: 106,
              fontFamily: CN_FONT_ARCHIVO,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: '0.02em',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {wordmark}
          </span>
          <div
            style={{
              position: 'absolute',
              left: 84,
              right: 84,
              top: photoH + 50,
              bottom: 70,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontFamily: CN_FONT,
                fontWeight: 800,
                fontSize: 76,
                lineHeight: 1.12,
                letterSpacing: '-0.045em',
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: CN_FONT_ARCHIVO,
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              {sub.toUpperCase()}
            </div>
          </div>
        </Card>
      );
    },
  },

  /* ── Cover 4 — neon poster (MAIN) ── */
  {
    id: 'iv-cover-poster',
    label: '표지 4 · 네온 박스 (MAIN)',
    category: 'cover',
    fields: COVER_FIELDS,
    Component: ({ eyebrow, sub, title, wordmark, wordmarkLogo, photo }) => (
      <Card>
        <FullBleedPhoto src={photo} />
        <Scrim gradient="linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)" />
        <Scrim gradient="linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" />
        <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">
          {eyebrow}
        </Eyebrow>
        <span
          style={{
            position: 'absolute',
            right: 84,
            top: 106,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '0.08em',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {sub.toUpperCase()}.
        </span>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              background: CN_COLORS.neon,
              padding: '30px 56px',
              border: `3px solid ${CN_COLORS.black}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: CN_FONT,
                fontWeight: 800,
                fontSize: 70,
                lineHeight: 1.1,
                letterSpacing: '-0.045em',
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all',
                color: '#000',
              }}
            >
              {title}
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 84,
            bottom: 96,
            fontFamily: CN_FONT_ARCHIVO,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {wordmark}
        </div>
      </Card>
    ),
  },

  /* ── Body A — Q top + body ── */
  {
    id: 'iv-body-a-top',
    label: '본문 A · Q 상단 + 본문',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'q', label: 'Q 문구', type: 'text', default: 'Q. 무슨 일을 하는 사람인가요?' },
      { key: 'qSize', label: 'Q 폰트 사이즈', type: 'number', default: 38, min: 24, max: 60 },
      { key: 'a', label: '본문 답변', type: 'textarea', default:
`A. 대답은 똑같이 이렇게 하면 되지.
팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!` },
    ],
    Component: ({ eyebrow = 'Interview', wordmark, wordmarkLogo, page, q, qSize, a }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
          {eyebrow}
        </Eyebrow>
        <IVTopRight wordmark={wordmark} wordmarkLogo={wordmarkLogo} />
        <div style={{ position: 'absolute', left: 84, top: 220 }}>
          <QuestionBox size={qSize}>{q}</QuestionBox>
        </div>
        <BodyText x={84} y={420} w={912} size={32} weight={500} lineHeight={1.7} field="a">
          {a}
        </BodyText>
        <IVPageOnly page={page} />
      </Card>
    ),
  },

  /* ── Body A bottom — Q at bottom ── */
  {
    id: 'iv-body-a-bottom',
    label: '본문 A · Q 하단 + 본문 아래',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'q', label: 'Q 문구', type: 'text', default: 'Q. 무슨 일을 하는 사람인가요?' },
      { key: 'qSize', label: 'Q 폰트 사이즈', type: 'number', default: 38, min: 24, max: 60 },
      { key: 'a', label: '본문 답변', type: 'textarea', default:
`A. 대답은 똑같이 이렇게 하면 되지.
팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.` },
    ],
    Component: ({ eyebrow = 'Interview', wordmark, wordmarkLogo, page, q, qSize, a }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
          {eyebrow}
        </Eyebrow>
        <IVTopRight wordmark={wordmark} wordmarkLogo={wordmarkLogo} />
        <div style={{ position: 'absolute', left: 84, top: 720 }}>
          <QuestionBox size={qSize}>{q}</QuestionBox>
        </div>
        <BodyText x={84} y={920} w={912} size={32} weight={500} lineHeight={1.7} field="a">
          {a}
        </BodyText>
        <IVPageOnly page={page} />
      </Card>
    ),
  },

  /* ── Body B — Q center + A middle box ── */
  {
    id: 'iv-body-b',
    label: '본문 B · Q 중앙 + A 박스',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'q', label: 'Q 문구', type: 'textarea', default: 'Q. 무슨 일을 하는 사람인가요?' },
      { key: 'a', label: 'A 답변 (중앙)', type: 'textarea', default:
`A. 대답은 똑같이 이렇게 하면 되지.
팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!` },
    ],
    Component: ({ eyebrow = 'Interview', wordmark, wordmarkLogo, page, q, a }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
          {eyebrow}
        </Eyebrow>
        <IVTopRight wordmark={wordmark} wordmarkLogo={wordmarkLogo} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center' }}>
          <QuestionMiddle w={780} size={42}>
            {q}
          </QuestionMiddle>
        </div>
        <BottomCenter bottomY={1156}>
          <StandardMiddle w={830} size={30}>
            {a}
          </StandardMiddle>
        </BottomCenter>
        <IVPageOnly page={page} />
      </Card>
    ),
  },

  /* ── Body C — Q + short A ── */
  {
    id: 'iv-body-c',
    label: '본문 C · Q 2줄 + 짧은 A',
    category: 'body',
    fields: [
      ...BODY_COMMON,
      { key: 'q', label: 'Q 문구 (2줄)', type: 'textarea', default: 'Q. 가장 인상 깊었던\n프로젝트는 무엇인가요?' },
      { key: 'a', label: 'A 답변 (짧음)', type: 'textarea', default:
`가장 큰 검은깨를 두 배로 더 쓴다고 생각해봐
그러면 상자도 두 배로 커져야지 이거 왜 안 따라옴?` },
    ],
    Component: ({ eyebrow = 'Interview', wordmark, wordmarkLogo, page, q, a }) => (
      <Card>
        <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em" field="eyebrow">
          {eyebrow}
        </Eyebrow>
        <IVTopRight wordmark={wordmark} wordmarkLogo={wordmarkLogo} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center' }}>
          <QuestionMiddle w={780} size={42}>
            {q}
          </QuestionMiddle>
        </div>
        <BottomCenter bottomY={1156}>
          <StandardMiddle w={830} size={32}>
            {a}
          </StandardMiddle>
        </BottomCenter>
        <IVPageOnly page={page} />
      </Card>
    ),
  },

  /* ── 빈 페이지 (내지) ── */
  {
    id: 'iv-blank',
    label: '빈 페이지 · 머릿말/꼬릿말 유지',
    category: 'body',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (좌상단)', type: 'text', default: 'Interview' },
      { key: 'wordmark', label: '워드마크 (우상단)', type: 'text', default: '@oyatlog' },
      ...BG_FIELDS,
    ],
    Component: ({ eyebrow = 'Interview', wordmark, wordmarkLogo, page, bgType, bgDir, bg1, bg2, bg3 }) => {
      const onPhoto = bgType && bgType !== 'none';
      return (
        <Card>
          <BackgroundFill type={bgType} dir={bgDir} items={bgItems({ bg1, bg2, bg3 })} />
          <Eyebrow
            x={84}
            y={99}
            color={onPhoto ? '#fff' : '#000'}
            font={CN_FONT_ARCHIVO}
            size={32}
            weight={700}
            tracking="0.04em"
            field="eyebrow"
          >
            {eyebrow}
          </Eyebrow>
          <IVTopRight wordmark={wordmark} wordmarkLogo={wordmarkLogo} color={onPhoto ? '#fff' : '#000'} />
          <IVPageOnly page={page} color={onPhoto ? '#fff' : '#000'} />
        </Card>
      );
    },
  },
];

export const IV_TEMPLATE = {
  id: 'interview',
  name: 'Type 4 · 인터뷰',
  tagline: 'Self Interview · Q&A 카드',
  wordmarkDefault: '@oyatlog',
  variants: IV_VARIANTS,
  defaultPages: ['iv-cover-poster', 'iv-body-a-top', 'iv-body-b', 'iv-body-c'],
};
