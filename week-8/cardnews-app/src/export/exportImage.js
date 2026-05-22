// html-to-image 래퍼 — 단일 페이지/전체 ZIP, 1x/2x/3x scale 지원.
import { toJpeg } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { getVariant } from '../templates/registry.js';

// 페이지 DOM은 transform: scale(...)으로 줄여 표시되므로,
// 원본 1080x1350 요소를 직접 찾아서 export. data-page-id 속성으로.
function findOriginalEl(pageId) {
  // slide 뷰에서 id="page-canvas-<pageId>" 사용 (1080x1350 원본 노드)
  const el = document.getElementById(`page-canvas-${pageId}`);
  return el || null;
}

async function ensureFonts() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }
}

async function renderPageToBlob(pageId, scale = 2) {
  await ensureFonts();
  const el = findOriginalEl(pageId);
  if (!el) throw new Error('현재 페이지를 찾을 수 없습니다 (slide 뷰에서 export 가능)');

  // transform을 끄고 픽셀 단위로 캡처
  const prevTransform = el.style.transform;
  const prevOrigin = el.style.transformOrigin;
  el.style.transform = 'none';
  el.style.transformOrigin = 'top left';

  try {
    const dataUrl = await toJpeg(el, {
      width: CARD_W,
      height: CARD_H,
      canvasWidth: CARD_W * scale,
      canvasHeight: CARD_H * scale,
      pixelRatio: scale,
      quality: 0.95,
      backgroundColor: '#FFFFFF',
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } finally {
    el.style.transform = prevTransform;
    el.style.transformOrigin = prevOrigin;
  }
}

export async function exportPageToImage(pageId, scale = 2, filename = 'cardnews') {
  const blob = await renderPageToBlob(pageId, scale);
  saveAs(blob, `${filename}.jpg`);
}

// 전체 페이지 ZIP — slide 뷰에서만 동작.
// 모든 페이지를 한 번에 캡처하기 위해 임시 hidden 컨테이너에 렌더.
export async function exportPagesToZip(project, scale = 2) {
  await ensureFonts();

  const { setActivePage, viewMode, setViewMode } = (await import('../store/useProjectStore.js')).useProjectStore.getState();

  // 임시: slide 뷰 강제
  const prevView = viewMode;
  if (prevView !== 'slide') setViewMode('slide');

  // 임시 hidden 렌더 컨테이너 만들기
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${CARD_W}px`;
  container.style.height = `${CARD_H}px`;
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const zip = new JSZip();

  try {
    // React 인라인 렌더는 어렵기 때문에, slide 뷰에서 active page를 바꿔가며 캡처.
    const total = project.pages.length;
    for (let i = 0; i < total; i++) {
      setActivePage(i);
      // DOM update wait
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 60));
      const pageId = project.pages[i].id;
      const blob = await renderPageToBlob(pageId, scale);
      const name = `${project.name}-${String(i + 1).padStart(2, '0')}.jpg`.replace(/[\\/:*?"<>|]/g, '_');
      zip.file(name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${project.name}.zip`.replace(/[\\/:*?"<>|]/g, '_'));
  } finally {
    container.remove();
    if (prevView !== 'slide') setViewMode(prevView);
  }
}
