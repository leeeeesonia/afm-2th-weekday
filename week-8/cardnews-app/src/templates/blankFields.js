// 빈 페이지(내지) 공통 — sidebar 필드는 BlankBgEditor가 직접 관리.
// variant.fields에 bgType 등을 더 이상 노출하지 않음 (Sidebar에 전용 분할 탭 + 배경 조정 섹션).
//
// 저장 키: page.props.{ bgType, bgDir, bg1, bg2, bg3, bg{i}Position, bg{i}Scale }
//   - bgType: 'none' | 'split2' | 'split3' (default 'none')
//   - bgDir:  'v' | 'h' (default 'v' = 세로 분할 = 가로 나란히)
//   - bg{1..3}: 각 슬롯 이미지 URL
//   - bg{i}Position / bg{i}Scale: PhotoPositionEditor용

export const BG_FIELDS = [];

export const BLANK_VARIANT_IDS = new Set([
  'essay-blank', 'bs-blank', 'bi-blank', 'iv-blank', 'cl-blank',
]);

// Component에서 props 전체를 받아 슬롯 배열로 변환 — 각 슬롯에 src/position/scale 포함
export function bgItems(props) {
  return [
    { src: props.bg1, position: props.bg1Position, scale: props.bg1Scale },
    { src: props.bg2, position: props.bg2Position, scale: props.bg2Scale },
    { src: props.bg3, position: props.bg3Position, scale: props.bg3Scale },
  ];
}
