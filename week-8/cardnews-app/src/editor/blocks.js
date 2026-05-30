// Block 데이터 모델 — 페이지 위에 자유 배치되는 오버레이 요소.
// type: 'text' | 'image' | 'sticker' | 'shape'
import { CARD_W, CARD_H } from '../design/tokens.js';

export const BLOCK_TYPES = ['text', 'image', 'sticker', 'shape', 'line'];

const uid = (p = 'b') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function newTextBlock(props = {}) {
  return {
    id: uid('blk'),
    type: 'text',
    x: 200,
    y: 540,
    w: 680,
    h: 180,
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    props: {
      html: '여기에 텍스트를 입력하세요',
      fontSize: 30,
      fontWeight: 500,
      color: '#000000',
      align: 'left',
      lineHeight: 1.2,
      fontFamily: 'pretendard',
      letterSpacing: -0.04,
      ...props,
    },
  };
}

export function newImageBlock(props = {}) {
  return {
    id: uid('blk'),
    type: 'image',
    x: 240,
    y: 400,
    w: 600,
    h: 600,
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    props: {
      src: '',
      border: 3,
      borderColor: '#000000',
      borderRadius: 0,
      objectPosition: 'center',
      ...props,
    },
  };
}

export function newStickerBlock(kind = 'subSticker', props = {}) {
  return {
    id: uid('blk'),
    type: 'sticker',
    x: 200,
    y: 600,
    w: 'auto',
    h: 'auto',
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    props: { kind, ...props },
  };
}

// 라인 — 1px 두께, 양 끝에 점, dashed면 20/6 패턴. 가로로 생성되고 회전·리사이즈로 자유롭게 배치.
export function newLineBlock(props = {}) {
  return {
    id: uid('blk'),
    type: 'line',
    x: 240,
    y: 600,
    w: 600,
    h: 20, // 양 끝 점(반경 ~4) 포함 + 라인 1px가 가운데
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    props: {
      style: 'solid',     // 'solid' | 'dashed'
      strokeWidth: 1,
      color: '#000000',
      dotRadius: 4,
      dashLen: 10,        // 기존 20에서 2배 촘촘 (10/3)
      dashGap: 3,
      ...props,
    },
  };
}

export function newShapeBlock(props = {}) {
  return {
    id: uid('blk'),
    type: 'shape',
    x: 300,
    y: 500,
    w: 480,
    h: 320,
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    props: {
      fill: '#AAFF00',
      border: 3,
      borderColor: '#000000',
      borderRadius: 0,
      ...props,
    },
  };
}

// 블록 좌표 정규화 (캔버스 안에 가두기)
export function clampBlock(block) {
  const x = Math.max(-200, Math.min(CARD_W, block.x));
  const y = Math.max(-200, Math.min(CARD_H, block.y));
  return { ...block, x, y };
}

export function uniqId(prefix) {
  return uid(prefix);
}
