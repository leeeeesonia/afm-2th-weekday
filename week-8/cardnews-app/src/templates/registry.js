// 5종 템플릿 레지스트리 — 홈/에디터에서 import해서 사용.
import { ESSAY_TEMPLATE } from './essay.jsx';
import { BS_TEMPLATE } from './brand-story.jsx';
import { BI_TEMPLATE } from './brand-insight.jsx';
import { IV_TEMPLATE } from './interview.jsx';
import { CL_TEMPLATE } from './collection-life.jsx';

export const TEMPLATES = [ESSAY_TEMPLATE, BS_TEMPLATE, BI_TEMPLATE, IV_TEMPLATE, CL_TEMPLATE];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id);
}

export function getVariant(templateId, variantId) {
  const tpl = getTemplate(templateId);
  if (!tpl) return null;
  return tpl.variants.find((v) => v.id === variantId) || null;
}

// 모든 템플릿에서 variantId로 찾기 — 타 템플릿 layout import 지원
export function getVariantGlobal(variantId) {
  for (const t of TEMPLATES) {
    const v = t.variants.find((vv) => vv.id === variantId);
    if (v) return { variant: v, templateId: t.id, template: t };
  }
  return null;
}

// fields 기본값을 합쳐 페이지 props 초기값을 만든다.
export function defaultPropsForVariant(variant) {
  const out = {};
  for (const f of variant.fields || []) {
    out[f.key] = f.default ?? '';
  }
  return out;
}

// variant.defaultOverlays — 함수면 호출, 배열이면 그대로. id는 자동 생성.
function buildDefaultOverlays(variant) {
  const raw = typeof variant?.defaultOverlays === 'function'
    ? variant.defaultOverlays()
    : variant?.defaultOverlays;
  if (!raw) return [];
  return raw.map((b, i) => ({
    id: `blk-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
    rotation: 0,
    z: 10,
    locked: false,
    hidden: false,
    ...b,
  }));
}

// 템플릿의 기본 페이지 배열 생성 (홈에서 "새 프로젝트")
export function buildDefaultPages(templateId) {
  const tpl = getTemplate(templateId);
  if (!tpl) return [];
  return tpl.defaultPages.map((variantId, i) => {
    const variant = getVariant(templateId, variantId);
    return {
      id: `page-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      variantId,
      props: defaultPropsForVariant(variant),
      overlays: buildDefaultOverlays(variant),
    };
  });
}

// 페이지 1개 추가용
export function makePage(templateId, variantId) {
  const variant = getVariant(templateId, variantId);
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variantId,
    props: defaultPropsForVariant(variant),
    overlays: buildDefaultOverlays(variant),
  };
}
