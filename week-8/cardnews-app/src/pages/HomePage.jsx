// 홈 — 템플릿 갤러리 + 작업중/작업완료 탭. Meta 디자인 시스템 chrome.
import React, { useState, useMemo, useEffect } from 'react';
import { TEMPLATES, getVariant } from '../templates/registry.js';
import { useProjectStore } from '../store/useProjectStore.js';
import { PAMM_BRAND_INSIGHT_PRESET } from '../seed/pammBrandInsight.js';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { computedPageNumber } from '../lib/pageNumbering.js';

const TAB_LABEL = { template: '템플릿', draft: '작업중', done: '작업완료' };

export function HomePage() {
  const [tab, setTab] = useState('template');
  const [bulkMode, setBulkMode] = useState(false);
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const createProjectFromPreset = useProjectStore((s) => s.createProjectFromPreset);

  // 탭 전환 시 일괄 모드 자동 종료
  useEffect(() => {
    setBulkMode(false);
  }, [tab]);

  function start(templateId) {
    const id = createProject({ templateId });
    window.location.hash = `#/edit/${id}`;
  }

  function startPreset(preset) {
    const id = createProjectFromPreset(preset);
    if (id) window.location.hash = `#/edit/${id}`;
  }

  return (
    <div className="min-h-screen bg-meta-canvas text-meta-ink-deep">
      <Header />
      <main className="mx-auto max-w-[1280px] px-8 pb-32">
        <Hero onPreset={() => startPreset(PAMM_BRAND_INSIGHT_PRESET)} />

        <nav className="mt-16 mb-8 flex flex-wrap items-center gap-2">
          {Object.entries(TAB_LABEL).map(([k, v]) => {
            const active = tab === k;
            const count =
              k === 'template'
                ? TEMPLATES.length
                : projects.filter((p) => (k === 'draft' ? p.status === 'draft' : p.status === 'done')).length;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={'pill-tab ' + (active ? 'is-active' : '')}
              >
                {v}
                <span className="ml-2 t-cap opacity-60">{count}</span>
              </button>
            );
          })}
          {/* 일괄 수정 — 작업중/작업완료 탭에서만 노출 */}
          {tab !== 'template' && (
            <button
              onClick={() => setBulkMode((b) => !b)}
              className={'pill-tab ml-auto ' + (bulkMode ? 'is-active' : '')}
              title="여러 카드뉴스를 한꺼번에 삭제/상태 변경"
            >
              {bulkMode ? '일괄 수정 종료' : '✓ 일괄 수정'}
            </button>
          )}
        </nav>

        {tab === 'template' && <TemplateGallery onPick={start} />}
        {tab === 'draft' && <ProjectGallery status="draft" bulkMode={bulkMode} />}
        {tab === 'done' && <ProjectGallery status="done" bulkMode={bulkMode} />}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-meta-hairline-soft bg-meta-canvas">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-meta-ink-deep">
            <span className="h-3 w-3 rounded-full bg-cn-neon" />
          </span>
          <span className="t-st-lg">CARDNEWS</span>
          <span className="ml-2 t-cap text-meta-steel">NOVOUND · @oyatlog</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => (window.location.hash = '#/design-system')}
          >
            디자인 시스템
          </button>
          <button className="btn btn-primary">새 카드뉴스</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onPreset }) {
  return (
    <section className="pt-16">
      <div className="t-cap-b mb-4 inline-flex items-center gap-2 rounded-pill border border-meta-hairline px-3 py-1.5 text-meta-steel">
        <span className="h-1.5 w-1.5 rounded-full bg-meta-primary" />
        INSTAGRAM · 1080 × 1350 · 4:5
      </div>
      <h1 className="t-hero max-w-[820px] text-meta-ink-deep">
        소니아의 카드뉴스 작업실
      </h1>
      <p className="t-st-md mt-6 max-w-[640px] text-meta-charcoal">
        각 카테고리에 맞는 디자인 템플릿과 세부 블록이 준비되어 있습니다.
        양식은 관리자를 통헤 상시 업데이트됩니다.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary">
          템플릿 둘러보기
        </button>
        <button className="btn btn-secondary">카드뉴스 튜토리얼</button>
        {onPreset && (
          <button onClick={onPreset} className="btn btn-secondary">
            ✨ PAMM 샘플 채우기 (Type 3)
          </button>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-meta-hairline-soft px-8 py-10">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-end gap-3 t-body-s text-meta-steel">
        <div className="mono">
          Copyright © 2026 by NOVOUND, All contents cannot be copied without permission.
        </div>
      </div>
    </footer>
  );
}

/* ─── Template gallery ─── */
function TemplateGallery({ onPick }) {
  const customTemplates = useProjectStore((s) => s.customTemplates || []);
  const createFromPreset = useProjectStore((s) => s.createProjectFromPreset);
  const deleteCustom = useProjectStore((s) => s.deleteCustomTemplate);

  function pickCustom(ctpl) {
    // 사용자 템플릿 → 페이지 스냅샷으로 새 프로젝트 생성
    const id = createFromPreset({
      templateId: ctpl.baseTemplateId,
      name: `${ctpl.name} 사본`,
      buildPages: () => ctpl.pagesSnapshot,
    });
    if (id) window.location.hash = `#/edit/${id}`;
  }

  return (
    <div id="template-gallery">
      {customTemplates.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="t-h-sm text-meta-ink-deep">내 템플릿</h3>
            <span className="t-cap text-meta-stone">{customTemplates.length}개 저장됨</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {customTemplates.map((ctpl) => (
              <CustomTemplateCard
                key={ctpl.id}
                ctpl={ctpl}
                onPick={() => pickCustom(ctpl)}
                onDelete={() => {
                  if (confirm(`"${ctpl.name}" 템플릿을 삭제할까요?`)) deleteCustom(ctpl.id);
                }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TEMPLATES.map((tpl) => (
          <TemplateCard key={tpl.id} tpl={tpl} onPick={() => onPick(tpl.id)} />
        ))}
      </div>
    </div>
  );
}

function CustomTemplateCard({ ctpl, onPick, onDelete }) {
  const firstPage = ctpl.pagesSnapshot?.[0];
  const variant = firstPage ? getVariant(ctpl.baseTemplateId, firstPage.variantId) : null;
  const Comp = variant?.Component;
  const props = { ...(firstPage?.props ?? {}), page: computedPageNumber(0, ctpl.pagesSnapshot?.length || 1) };
  return (
    <article
      onClick={onPick}
      className="surface-card group cursor-pointer overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-[2px] ring-2 ring-meta-primary/40"
    >
      <div className="relative overflow-hidden rounded-t-[32px] bg-meta-surface">
        <ThumbScaled w={CARD_W} h={CARD_H} containerH={440}>
          {Comp ? <Comp {...props} /> : null}
        </ThumbScaled>
        <span className="absolute top-4 left-4 badge bg-meta-primary text-white">MY</span>
        <span className="absolute top-4 right-4 badge bg-meta-ink-deep text-white">{ctpl.pagesSnapshot?.length ?? 0}P</span>
      </div>
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="t-h-sm text-meta-ink-deep truncate">{ctpl.name}</h3>
          <p className="mt-1 t-body-s text-meta-steel">
            {TEMPLATES.find((t) => t.id === ctpl.baseTemplateId)?.name || '커스텀'} · {new Date(ctpl.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onPick(); }}
            className="btn btn-primary"
          >
            사용하기
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn btn-ghost text-meta-critical text-xs"
            title="템플릿 삭제"
          >
            × 삭제
          </button>
        </div>
      </div>
    </article>
  );
}

function TemplateCard({ tpl, onPick }) {
  const cover = tpl.variants.find((v) => v.category === 'cover') ?? tpl.variants[0];
  const CoverComp = cover.Component;
  const previewProps = {};
  for (const f of cover.fields ?? []) previewProps[f.key] = f.default ?? '';
  // 페이지 번호 자동 (커버는 보통 "1/10")
  previewProps.page = '1 / 10';

  // 카드 전체가 클릭 가능하지만, 내부 '시작하기' 버튼은 stopPropagation으로 이중 발화 방지.
  // (전에는 article과 button 모두 onClick={onPick}이라 한 번 클릭 시 createProject가 두 번 호출됐음.)
  return (
    <article
      onClick={onPick}
      className="surface-card group cursor-pointer overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-[2px]"
    >
      <div className="relative overflow-hidden rounded-t-[32px] bg-meta-surface">
        <ThumbScaled w={CARD_W} h={CARD_H} containerH={440}>
          <CoverComp {...previewProps} />
        </ThumbScaled>
        <span className="absolute top-4 left-4 badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
          {tpl.id.toUpperCase()}
        </span>
      </div>
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="t-h-sm text-meta-ink-deep">{tpl.name}</h3>
          <p className="mt-1 t-body-s text-meta-steel">{tpl.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 t-cap text-meta-stone">
            <span>{tpl.variants.length} variants</span>
            <span className="h-1 w-1 rounded-full bg-meta-stone" />
            <span>{tpl.defaultPages.length} pages</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
          className="btn btn-primary shrink-0"
        >
          시작하기
        </button>
      </div>
    </article>
  );
}

/* ─── Project gallery ─── */
function ProjectGallery({ status, bulkMode = false }) {
  const projects = useProjectStore((s) => s.projects.filter((p) => p.status === status));
  const dup = useProjectStore((s) => s.duplicateProject);
  const del = useProjectStore((s) => s.deleteProject);
  const setStatus = useProjectStore((s) => s.setProjectStatus);
  const saveAsTemplate = useProjectStore((s) => s.saveProjectAsTemplate);
  const [selected, setSelected] = useState(() => new Set());

  // bulkMode 종료 시 선택 초기화
  useEffect(() => {
    if (!bulkMode) setSelected(new Set());
  }, [bulkMode]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelected(new Set(projects.map((p) => p.id)));
  }
  function clearSel() {
    setSelected(new Set());
  }
  function bulkDelete() {
    const n = selected.size;
    if (n === 0) return;
    if (!confirm(`선택한 ${n}개 카드뉴스를 삭제할까요?`)) return;
    for (const id of selected) del(id);
    setSelected(new Set());
  }
  function bulkToggleStatus() {
    if (selected.size === 0) return;
    const target = status === 'draft' ? 'done' : 'draft';
    for (const id of selected) setStatus(id, target);
    setSelected(new Set());
  }

  if (projects.length === 0) {
    return (
      <div className="surface-card p-16 text-center">
        <div className="t-h-sm text-meta-ink-deep">
          {status === 'draft' ? '아직 작업 중인 카드뉴스가 없어요' : '완료된 카드뉴스가 없어요'}
        </div>
        <div className="mt-2 t-body-s text-meta-steel">템플릿 탭에서 새로 시작해보세요.</div>
      </div>
    );
  }

  const allSelected = selected.size > 0 && selected.size === projects.length;
  return (
    <>
      {bulkMode && (
        <div className="surface-card flex flex-wrap items-center gap-3 px-5 py-3 mb-4">
          <button
            type="button"
            onClick={allSelected ? clearSel : selectAll}
            className="btn btn-ghost"
          >
            {allSelected ? '전체 해제' : '전체 선택'}
          </button>
          <span className="t-cap text-meta-stone">
            {selected.size}개 선택됨 · 전체 {projects.length}개
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={bulkToggleStatus}
              disabled={selected.size === 0}
              className="btn btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'draft' ? '✓ 완료로' : '↩ 작업중으로'}
            </button>
            <button
              type="button"
              onClick={bulkDelete}
              disabled={selected.size === 0}
              className="btn btn-ghost text-meta-critical disabled:opacity-40 disabled:cursor-not-allowed"
            >
              × 선택 삭제
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            bulkMode={bulkMode}
            selected={selected.has(p.id)}
            onToggleSelect={() => toggle(p.id)}
            onOpen={() => (window.location.hash = `#/edit/${p.id}`)}
            onDuplicate={() => dup(p.id)}
            onDelete={() => {
              if (confirm(`"${p.name}" 삭제할까요?`)) del(p.id);
            }}
            onToggleStatus={() => setStatus(p.id, p.status === 'draft' ? 'done' : 'draft')}
            onSaveAsTemplate={() => {
              const name = window.prompt('템플릿 이름을 입력하세요', p.name);
              if (name === null) return; // 취소
              const trimmed = name.trim();
              if (!trimmed) return;
              saveAsTemplate(p.id, trimmed);
              alert(`"${trimmed}" 템플릿으로 저장되었어요!\n템플릿 탭에서 확인하세요.`);
            }}
          />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ project, bulkMode = false, selected = false, onToggleSelect, onOpen, onDuplicate, onDelete, onToggleStatus, onSaveAsTemplate }) {
  const tpl = useMemo(() => TEMPLATES.find((t) => t.id === project.templateId), [project.templateId]);
  const firstPage = project.pages[0];
  const variant = firstPage ? getVariant(project.templateId, firstPage.variantId) : null;
  const Comp = variant?.Component;
  const props = { ...(firstPage?.props ?? {}), page: computedPageNumber(0, project.pages.length) };
  // 일괄 수정 모드에선 카드 클릭 = 선택 토글
  const handleCardClick = bulkMode ? onToggleSelect : onOpen;
  return (
    <article
      className={
        'surface-card overflow-hidden flex flex-col transition-all ' +
        (bulkMode && selected ? 'ring-2 ring-meta-primary' : '')
      }
    >
      <button
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-t-[32px] bg-meta-surface text-left"
      >
        <ThumbScaled w={CARD_W} h={CARD_H} containerH={420}>
          {Comp ? <Comp {...props} /> : null}
        </ThumbScaled>
        <span className="absolute top-4 left-4 badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
          {(tpl?.id ?? '').toUpperCase()}
        </span>
        <span className="absolute top-4 right-4 badge bg-meta-ink-deep text-white">{project.pages.length}P</span>
        {/* 일괄 모드 — 체크박스 표시 */}
        {bulkMode && (
          <span
            className={
              'absolute top-3 left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all shadow ' +
              (selected
                ? 'bg-meta-primary border-meta-primary text-white'
                : 'bg-meta-canvas border-meta-hairline text-transparent')
            }
            aria-hidden
          >
            ✓
          </span>
        )}
      </button>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <div className="t-h-sm text-meta-ink-deep truncate">{project.name}</div>
          <div className="mt-1 t-cap text-meta-steel">
            {tpl?.name} · {new Date(project.updatedAt).toLocaleString('ko-KR')}
          </div>
        </div>
        {/* 일괄 모드에선 개별 액션 숨김 (상단 액션바로 일괄 처리) */}
        {!bulkMode && (
          <div className="flex flex-wrap gap-2">
            <button onClick={onOpen} className="btn btn-primary flex-1">편집</button>
            <button onClick={onDuplicate} className="btn btn-ghost" title="복제">복제</button>
            <button onClick={onToggleStatus} className="btn btn-ghost" title="상태 변경">
              {project.status === 'draft' ? '완료로' : '작업중으로'}
            </button>
            <button onClick={onDelete} className="btn btn-ghost text-meta-critical" title="삭제">삭제</button>
            {/* 작업완료 카드뉴스만 — 디자인을 템플릿으로 추가 */}
            {project.status === 'done' && onSaveAsTemplate && (
              <button onClick={onSaveAsTemplate} className="btn btn-ghost" title="이 디자인을 템플릿으로 추가">
                ⊕ 템플릿으로
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Thumbnail scaler ─── */
function ThumbScaled({ w, h, containerH, children }) {
  return (
    <div className="relative w-full" style={{ height: containerH }}>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: w,
            height: h,
            transform: `scale(${(containerH / h) * 0.88})`,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
