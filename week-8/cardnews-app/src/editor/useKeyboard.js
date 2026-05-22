// 키보드 단축키 — ⌘Z/⌘⇧Z, ⌘1/⌘2, ⌘D, Delete, P, 화살표
// 블록 선택 시: Delete=삭제, ⌘D=복제, ⌘]/⌘[=z-order, 화살표=이동
import { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore.js';

export function useKeyboard() {
  useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || '').toLowerCase();
      const editing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      const meta = e.metaKey || e.ctrlKey;
      const s = useProjectStore.getState();
      const hasBlockSelection = s.selectedBlockIds.length > 0;

      // ⌘Z / ⌘⇧Z
      if (meta && e.key.toLowerCase() === 'z') {
        if (editing) return;
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }

      // ⌘1 / ⌘2
      if (meta && (e.key === '1' || e.key === '2')) {
        e.preventDefault();
        s.setViewMode(e.key === '1' ? 'slide' : 'grid');
        return;
      }

      // 레이아웃 picker 열려있으면 Esc로 닫기
      if (s.layoutPickerOpen && e.key === 'Escape') {
        e.preventDefault();
        s.closeLayoutPicker();
        return;
      }

      if (editing) return;

      // 블록 단축키 (선택 있을 때 우선)
      if (hasBlockSelection) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          s.removeBlocks(s.selectedBlockIds);
          return;
        }
        if (meta && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          s.duplicateBlocks(s.selectedBlockIds);
          return;
        }
        if (meta && e.key === ']') {
          e.preventDefault();
          s.bringForward(s.selectedBlockIds);
          return;
        }
        if (meta && e.key === '[') {
          e.preventDefault();
          s.sendBackward(s.selectedBlockIds);
          return;
        }
        if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const proj = s.projects.find((p) => p.id === s.activeProjectId);
          const page = proj?.pages[s.activePageIndex];
          const blocks = page?.overlays || [];
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          for (const id of s.selectedBlockIds) {
            const b = blocks.find((bb) => bb.id === id);
            if (!b || b.locked) continue;
            s.updateBlock(id, { x: (b.x || 0) + dx, y: (b.y || 0) + dy });
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          s.clearSelection();
          return;
        }
      }

      // P — 미리보기 토글
      if (e.key === 'p' || e.key === 'P') {
        s.setPreviewMode(!s.previewMode);
        return;
      }

      // ⌘D — 페이지 복제 (블록 선택 없을 때)
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        s.duplicatePage(s.activePageIndex);
        return;
      }

      // Delete / Backspace — 페이지 삭제 (블록 선택 없을 때)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (confirm('현재 페이지를 삭제할까요?')) {
          s.removePage(s.activePageIndex);
        }
        return;
      }

      // ←/→ — 페이지 이동 (블록 선택 없을 때)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        s.setActivePage(Math.max(0, s.activePageIndex - 1));
      }
      if (e.key === 'ArrowRight') {
        const proj = s.projects.find((p) => p.id === s.activeProjectId);
        if (proj) {
          e.preventDefault();
          s.setActivePage(Math.min(proj.pages.length - 1, s.activePageIndex + 1));
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
