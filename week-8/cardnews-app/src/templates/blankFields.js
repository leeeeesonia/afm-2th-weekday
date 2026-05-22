// 빈 페이지(내지) 공통 배경 필드.
// 5종 템플릿이 모두 import.

export const BG_FIELDS = [
  {
    key: 'bgType',
    label: '배경',
    type: 'select',
    options: [
      { value: 'none', label: '비워두기 (흰색)' },
      { value: 'fullimage', label: '풀이미지/영상 1장' },
      { value: 'split2', label: '2분할' },
      { value: 'split3', label: '3분할' },
    ],
    default: 'none',
  },
  {
    key: 'bgDir',
    label: '분할 방향 (2/3분할일 때)',
    type: 'select',
    options: [
      { value: 'v', label: '세로 분할 (가로 나란히)' },
      { value: 'h', label: '가로 분할 (세로 쌓임)' },
    ],
    default: 'v',
  },
  { key: 'bg1', label: '배경 1 (이미지/영상)', type: 'media', default: '' },
  { key: 'bg2', label: '배경 2 (이미지/영상)', type: 'media', default: '' },
  { key: 'bg3', label: '배경 3 (이미지/영상)', type: 'media', default: '' },
];

// 머릿말/꼬릿말 필드 (템플릿마다 다르므로 helper만 제공)
export const BLANK_FIELDS = BG_FIELDS;

// Component에서 props.bg1/bg2/bg3을 items 배열로 변환
export function bgItems({ bg1, bg2, bg3 }) {
  return [{ src: bg1 }, { src: bg2 }, { src: bg3 }];
}
