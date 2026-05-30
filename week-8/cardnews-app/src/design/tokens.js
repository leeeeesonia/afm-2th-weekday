// 디자인 토큰 — 카드 캔버스에서 inline style로 직접 참조.
// Pretendard Variable + Archivo Narrow 두 폰트만.

export const CARD_W = 1080;
export const CARD_H = 1350;

export const CN_FONT = "'Pretendard Variable', Pretendard, system-ui, sans-serif";
export const CN_FONT_ARCHIVO = "'Archivo Narrow', sans-serif";

export const CN_COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  neon: '#AAFF00',
  lemon: '#FFFABA',
};

// 다크/라이트/파스텔 테마 — 사용자가 에디터에서 토글
// 파스텔: 그레이시 소라색 배경 + 라이트와 동일한 텍스트 컬러 + 크라프트지 텍스처(Card에서 오버레이)
export const CN_THEMES = {
  light: {
    bg: '#FFFFFF',
    text: '#000000',
    textSub: 'rgba(0,0,0,0.5)',
    scrim: 'rgba(0,0,0,0.35)',
  },
  pastel: {
    bg: '#CFD9E1',
    text: '#000000',
    textSub: 'rgba(0,0,0,0.5)',
    scrim: 'rgba(0,0,0,0.35)',
  },
  dark: {
    bg: '#0A0A0A',
    text: '#FFFFFF',
    textSub: 'rgba(255,255,255,0.65)',
    scrim: 'rgba(255,255,255,0.18)',
  },
};

// 타이틀 위계 토큰 (UX_CHECKLIST 기준)
export const TYPE = {
  titleCover: { size: 88, weight: 800 },
  heading01: { size: 56, weight: 800 },
  heading02: { size: 35, weight: 700 },
  captionQuestion: { size: 42, weight: 700 },
  bodyDefault: { size: 32, weight: 500 },
  bodySub: { size: 28, weight: 500 },
  captionDefault: { size: 28, weight: 400 },
};

// Safe area
export const PAD = 84;
export const EYEBROW_Y = 99;
export const HEADING_TOP = 220;
export const FOOTER_BOTTOM = 84;
