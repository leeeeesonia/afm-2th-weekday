// 홈 — 템플릿 갤러리 + 작업중/작업완료 탭. Meta 디자인 시스템 chrome.
import React, { useState, useMemo } from 'react';
import { TEMPLATES, getVariant } from '../templates/registry.js';
import { useProjectStore } from '../store/useProjectStore.js';
import { CARD_W, CARD_H } from '../design/tokens.js';
import { computedPageNumber } from '../lib/pageNumbering.js';

const TAB_LABEL = { template: '템플릿', draft: '작업중', done: '작업완료' };

export function HomePage() {
  const [tab, setTab] = useState('template');
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  function start(templateId) {
    const id = createProject({ templateId });
    window.location.hash = `#/edit/${id}`;
  }

  return (
    <div className="min-h-screen bg-meta-canvas text-meta-ink-deep">
      <Header />
      <main className="mx-auto max-w-[1280px] px-8 pb-32">
        <Hero />

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
        </nav>

        {tab === 'template' && <TemplateGallery onPick={start} />}
        {tab === 'draft' && <ProjectGallery status="draft" />}
        {tab === 'done' && <ProjectGallery status="done" />}
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
          <span className="t-st-lg">Cardnews</span>
          <span className="ml-2 t-cap text-meta-steel">Novound · @oyatlog</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost">DESIGN.md</button>
          <button className="btn btn-primary">새 카드뉴스</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-16">
      <div className="t-cap-b mb-4 inline-flex items-center gap-2 rounded-pill border border-meta-hairline px-3 py-1.5 text-meta-steel">
        <span className="h-1.5 w-1.5 rounded-full bg-meta-primary" />
        INSTAGRAM · 1080 × 1350 · 4:5
      </div>
      <h1 className="t-hero max-w-[820px] text-meta-ink-deep">
        텍스트만 바꾸세요.<br />
        디자인은 완성되어 있습니다.
      </h1>
      <p className="t-st-md mt-6 max-w-[640px] text-meta-charcoal">
        5종 디자인 시스템과 7종 스티커. 표지부터 아웃트로까지 완성된 페이지를 골라
        텍스트·이미지·페이지 번호를 자동 채우세요.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary">
          템플릿 둘러보기
        </button>
        <button className="btn btn-secondary">디자인 시스템 보기</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-meta-hairline-soft px-8 py-10">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 t-body-s text-meta-steel">
        <div>Pretendard Variable · Archivo Narrow · Montserrat</div>
        <div className="mono">© NOVOUND 2026 · BUILD 0.2</div>
      </div>
    </footer>
  );
}

/* ─── Template gallery ─── */
function TemplateGallery({ onPick }) {
  return (
    <div id="template-gallery" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {TEMPLATES.map((tpl) => (
        <TemplateCard key={tpl.id} tpl={tpl} onPick={() => onPick(tpl.id)} />
      ))}
    </div>
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
function ProjectGallery({ status }) {
  const projects = useProjectStore((s) => s.projects.filter((p) => p.status === status));
  const dup = useProjectStore((s) => s.duplicateProject);
  const del = useProjectStore((s) => s.deleteProject);
  const setStatus = useProjectStore((s) => s.setProjectStatus);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          onOpen={() => (window.location.hash = `#/edit/${p.id}`)}
          onDuplicate={() => dup(p.id)}
          onDelete={() => {
            if (confirm(`"${p.name}" 삭제할까요?`)) del(p.id);
          }}
          onToggleStatus={() => setStatus(p.id, p.status === 'draft' ? 'done' : 'draft')}
        />
      ))}
    </div>
  );
}

function ProjectCard({ project, onOpen, onDuplicate, onDelete, onToggleStatus }) {
  const tpl = useMemo(() => TEMPLATES.find((t) => t.id === project.templateId), [project.templateId]);
  const firstPage = project.pages[0];
  const variant = firstPage ? getVariant(project.templateId, firstPage.variantId) : null;
  const Comp = variant?.Component;
  const props = { ...(firstPage?.props ?? {}), page: computedPageNumber(0, project.pages.length) };
  return (
    <article className="surface-card overflow-hidden flex flex-col">
      <button onClick={onOpen} className="relative overflow-hidden rounded-t-[32px] bg-meta-surface text-left">
        <ThumbScaled w={CARD_W} h={CARD_H} containerH={420}>
          {Comp ? <Comp {...props} /> : null}
        </ThumbScaled>
        <span className="absolute top-4 left-4 badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
          {(tpl?.id ?? '').toUpperCase()}
        </span>
        <span className="absolute top-4 right-4 badge bg-meta-ink-deep text-white">{project.pages.length}P</span>
      </button>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <div className="t-h-sm text-meta-ink-deep truncate">{project.name}</div>
          <div className="mt-1 t-cap text-meta-steel">
            {tpl?.name} · {new Date(project.updatedAt).toLocaleString('ko-KR')}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onOpen} className="btn btn-primary flex-1">편집</button>
          <button onClick={onDuplicate} className="btn btn-ghost" title="복제">복제</button>
          <button onClick={onToggleStatus} className="btn btn-ghost" title="상태 변경">
            {project.status === 'draft' ? '완료로' : '작업중으로'}
          </button>
          <button onClick={onDelete} className="btn btn-ghost text-meta-critical" title="삭제">삭제</button>
        </div>
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
