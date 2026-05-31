// CARDNEWS 디자인 시스템 사양서 — 5종 템플릿별 폰트·위계·여백 정의.
// 작성: NOVOUND 디자인 디렉션 (CARDNEWS V1, 2026)
import React from 'react';
import { TEMPLATES, getVariant } from '../templates/registry.js';
import { CARD_W, CARD_H, CN_FONT, CN_FONT_ARCHIVO, CN_COLORS, PAD, EYEBROW_Y, HEADING_TOP, FOOTER_BOTTOM, TYPE } from '../design/tokens.js';

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-meta-canvas text-meta-ink-deep">
      <Header />
      <main className="mx-auto max-w-[1180px] px-8 pb-32">
        <Hero />
        <Foundations />
        <Templates />
        <Footer />
      </main>
    </div>
  );
}

/* ─── chrome ─── */
function Header() {
  return (
    <header className="border-b border-meta-hairline-soft bg-meta-canvas">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.hash = '')}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-meta-ink-deep"
            title="홈"
          >
            <span className="h-3 w-3 rounded-full bg-cn-neon" />
          </button>
          <span className="t-st-lg">CARDNEWS</span>
          <span className="ml-2 t-cap text-meta-steel">NOVOUND · 디자인 시스템 V1</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => (window.location.hash = '')} className="btn btn-ghost">
            ← 홈
          </button>
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
        DESIGN SYSTEM · CARDNEWS V1 · 2026
      </div>
      <h1 className="t-hero max-w-[860px] text-meta-ink-deep">
        하나의 그리드,<br />다섯 가지 목소리.
      </h1>
      <p className="t-st-md mt-6 max-w-[720px] text-meta-charcoal">
        CARDNEWS는 인스타그램 1080 × 1350 (4:5) 캔버스를 기준으로,
        같은 그리드·여백·타이포 규칙 위에 다섯 가지 콘텐츠 톤(에세이·브랜드 스토리·디깅노트·인터뷰·수집생활)을
        얹은 디자인 시스템입니다. 표지부터 본문, 인덱스, 아웃트로까지 모든 컴포넌트는 동일한 안전 영역과
        타입 위계를 따릅니다.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-meta-hairline-soft pt-8 t-body-s text-meta-steel">
      <div className="mono">
        Copyright © 2026 by NOVOUND, All contents cannot be copied without permission.
      </div>
    </footer>
  );
}

/* ─── 0. Foundations ─── */
function Foundations() {
  return (
    <section className="mt-20">
      <SectionTitle eyebrow="00 · FOUNDATIONS" title="기반 토큰" />

      <Grid3>
        <SpecCard
          label="Canvas"
          rows={[
            ['Format', 'Instagram 1080 × 1350 (4:5)'],
            ['Aspect', '0.8'],
            ['Resolution', '@1x export · PNG'],
            ['Color space', 'sRGB'],
          ]}
        />
        <SpecCard
          label="Safe area"
          rows={[
            ['Outer padding', `${PAD} px (좌/우)`],
            ['Eyebrow Y', `${EYEBROW_Y} px (상단)`],
            ['Heading top', `${HEADING_TOP} px`],
            ['Footer bottom', `${FOOTER_BOTTOM} px`],
            ['Cover bottom block', '200 px (b/L 좌하단 패턴)'],
          ]}
        />
        <SpecCard
          label="Grid"
          rows={[
            ['Cover column', '812 px (CARD_W − PAD×2 − 옵셔널 56)'],
            ['Body column', '912 px (CARD_W − PAD×2)'],
            ['Sticker max W', '903 ~ 830 px'],
            ['Bleed', '0 (셀프 마진 외 풀-블리드)'],
          ]}
        />
      </Grid3>

      <Grid2 className="mt-6">
        <div>
          <SubTitle>Typography · 패밀리</SubTitle>
          <SpecTable
            rows={[
              ['Display / Body', 'Pretendard Variable', 'CN_FONT', '한글·국문 본문 전반'],
              ['Mono / Sub', 'Archivo Narrow', 'CN_FONT_ARCHIVO', '숫자·라벨·Eyebrow·페이지'],
            ]}
            cols={['Role', 'Family', 'Token', '사용']}
          />
          <p className="t-body-s mt-3 text-meta-steel">
            기존 JetBrains Mono / Montserrat 자리는 모두 <b>Archivo Narrow</b>로 통일.
            본문 한글은 Pretendard Variable 100~900 wght 단일.
          </p>
        </div>

        <div>
          <SubTitle>Typography · 위계 (TYPE 토큰)</SubTitle>
          <SpecTable
            cols={['Token', 'Size', 'Weight', 'Tracking', '용도']}
            rows={[
              ['titleCover', `${TYPE.titleCover.size}px`, String(TYPE.titleCover.weight), '-0.045em', '표지 메인 타이틀 (1줄)'],
              ['titleCover · 2줄', '84px', String(TYPE.titleCover.weight), '-0.045em', '표지 메인 타이틀 (2줄)'],
              ['heading01', `${TYPE.heading01.size}px`, String(TYPE.heading01.weight), '-0.04em', '본문 H1'],
              ['heading02', `${TYPE.heading02.size}px`, String(TYPE.heading02.weight), '-0.04em', '본문 H2 / 부제'],
              ['captionQuestion', `${TYPE.captionQuestion.size}px`, String(TYPE.captionQuestion.weight), '-0.04em', 'Q 박스 텍스트'],
              ['bodyDefault', `${TYPE.bodyDefault.size}px`, String(TYPE.bodyDefault.weight), '-0.04em', '본문'],
              ['bodySub', `${TYPE.bodySub.size}px`, String(TYPE.bodySub.weight), '-0.04em', '캡션 / 보조 본문'],
              ['captionDefault', `${TYPE.captionDefault.size}px`, String(TYPE.captionDefault.weight), '0.04em', 'Eyebrow / 페이지 번호'],
            ]}
          />
        </div>
      </Grid2>

      <Grid2 className="mt-6">
        <div>
          <SubTitle>Color</SubTitle>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(CN_COLORS).map(([k, v]) => (
              <Swatch key={k} name={k} hex={v} />
            ))}
            <Swatch name="theme.light.bg" hex="#FFFFFF" />
            <Swatch name="theme.pastel.bg" hex="#CFD9E1" />
            <Swatch name="theme.dark.bg" hex="#0A0A0A" />
          </div>
          <p className="t-body-s mt-3 text-meta-steel">
            라이트/<b>파스텔</b>/다크 3-mood를 에디터에서 페이지별 또는 전체 일괄 토글합니다.
            파스텔은 그레이시 소라색(<b>#CFD9E1</b>) 배경 + 크라프트지 SVG 노이즈(<b>multiply blend</b>) 오버레이로
            구성됩니다. 네온·레몬은 액센트로만 사용하고 본문 색상으로는 쓰지 않습니다.
          </p>
        </div>
        <div>
          <SubTitle>Color Palette (Sidebar)</SubTitle>
          <p className="t-body-s text-meta-steel mb-3">
            Sub Frame / Sub Info / Text 블록은 4-swatch 팔레트로 한 번에 채움+글씨 색을 토글합니다.
          </p>
          <div className="grid grid-cols-4 gap-2">
            <Swatch name="블랙" hex="#000000" />
            <Swatch name="화이트" hex="#FFFFFF" />
            <Swatch name="네온" hex="#AAFF00" />
            <Swatch name="레몬" hex="#FFFABA" />
          </div>
          <p className="t-cap text-meta-stone mt-3">
            Sub Sticker 변형: 블랙(네온글씨) · 레몬 · 네온 · 화이트(검정bg + 흰테/흰글)
          </p>
        </div>
      </Grid2>

      <Grid2 className="mt-6">
        <div>
          <SubTitle>Stickers (단일블록)</SubTitle>
          <SpecTable
            cols={['Component', 'Font', 'Size', 'Weight', '여백(pad)', '비고']}
            rows={[
              ['QuestionBox', 'Pretendard', '38px', '700 Bold', 'padY 22 · padX 28', 'auto W · 1줄 nowrap'],
              ['QuestionMiddle', 'Pretendard', '42px', '700 Bold', '60×50', 'W 720 · minH 200 · pre-line'],
              ['StandardMiddle (Answer)', 'Pretendard', '30px', '500 Medium', '60×40', 'W 903 · 중앙'],
              ['SubFrame', 'Pretendard', '28px', '500 Medium', '22×28', '도형(채움/모서리/보더) + 팔레트'],
              ['SubInfo (lemon)', 'Pretendard', '24px', '400 Regular', 'padY 14 · padX 22', '줄단위 박스 · 1~3줄'],
              ['SubSticker', 'Pretendard', '24px', '500 Medium', '0 (90×56)', '타원 · variant 4종'],
            ]}
          />
          <p className="t-cap text-meta-stone mt-3">
            공통: letterSpacing <b>-0.04em</b> (Sub Sticker는 -0.02em) · 빈 children은 placeholder opacity 0.4
          </p>
        </div>
        <div>
          <SubTitle>Blocks (기본)</SubTitle>
          <SpecTable
            cols={['Type', '기본 size', '특징']}
            rows={[
              ['Text', 'fontSize 30 · weight 500', '단일 클릭 인라인 편집 · 굵기 드랍다운(Bold/Medium/Regular/Light)'],
              ['Image', 'border 3px (3/1/0)', '카메라 버튼 업로드 · 위치+확대 조정'],
              ['Line (실선/점선)', 'stroke 1px · dot r=4', '끝점 1개 · start/end 드래그로 길이+회전 동시'],
              ['Line (점선 dash)', '10 / 3', '기존 20에서 2× 촘촘'],
            ]}
          />
        </div>
      </Grid2>

      <Grid2 className="mt-6">
        <div>
          <SubTitle>배경 효과 (Scrim) · 3옵션</SubTitle>
          <SpecTable
            cols={['Mode', 'CSS', '용도']}
            rows={[
              ['전체화면', 'rgba(0,0,0,0.45) 단색', '밝은 사진 위 텍스트 가독성 강화'],
              ['그라데이션', 'variant별 linear-gradient', '디폴트 — 가장자리 페이드'],
              ['효과없음', '—', '사진/배경 그대로 노출'],
            ]}
          />
          <p className="t-cap text-meta-stone mt-3">
            적용 variant: essay 표지 4 + 풀이미지 2 / brand-story 오버레이 v1 /
            brand-insight 오버레이·풀이미지 글위/아래 / interview 표지 2 / collection-life 오버레이·풀이미지
          </p>
        </div>
        <div>
          <SubTitle>Guide (Bleed)</SubTitle>
          <SpecTable
            cols={['Spec', 'Value']}
            rows={[
              ['Safe margin', '84px 좌·우·상·하'],
              ['Safe area', '(84, 84) ~ (996, 1266)'],
              ['Guide line', '네온 #AAFF00 · 2px dashed'],
              ['Bleed zone bg', 'rgba(170,255,0,0.22) — 블록 이탈 시'],
            ]}
          />
          <p className="t-cap text-meta-stone mt-3">
            툴바 '가이드' 토글로 ON/OFF. 84px 마진은 모든 템플릿(eyebrow / 캡션 / 페이지표기) 공통 기준.
          </p>
        </div>
      </Grid2>
    </section>
  );
}

/* ─── 1~5. Templates ─── */
function Templates() {
  return (
    <section className="mt-24">
      <SectionTitle eyebrow="01–05 · TEMPLATES" title="템플릿별 디자인 사양" />

      <div className="space-y-16">
        {TEMPLATES.map((tpl, i) => (
          <TemplateSpec key={tpl.id} tpl={tpl} index={i + 1} spec={SPEC[tpl.id]} />
        ))}
      </div>
    </section>
  );
}

function TemplateSpec({ tpl, index, spec }) {
  const cover = tpl.variants.find((v) => v.category === 'cover') ?? tpl.variants[0];
  const CoverComp = cover.Component;
  const previewProps = {};
  for (const f of cover.fields ?? []) previewProps[f.key] = f.default ?? '';
  previewProps.page = `1 / ${tpl.defaultPages.length}`;

  return (
    <article className="surface-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[440px_1fr] gap-0">
        {/* Preview */}
        <div className="relative bg-meta-surface border-b md:border-b-0 md:border-r border-meta-hairline-soft">
          <ThumbScaled w={CARD_W} h={CARD_H} containerH={520}>
            <CoverComp {...previewProps} />
          </ThumbScaled>
          <span className="absolute top-4 left-4 badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
            {tpl.id.toUpperCase()}
          </span>
        </div>

        {/* Spec body */}
        <div className="p-8 md:p-10">
          <div className="t-cap-b text-meta-steel">
            TYPE {index}
          </div>
          <h3 className="t-h-lg mt-1 text-meta-ink-deep">{tpl.name}</h3>
          <p className="mt-2 t-body-s text-meta-steel">{tpl.tagline}</p>

          <div className="mt-6 space-y-5">
            <Spec label="컨셉 · 톤" body={spec.concept} />

            <div>
              <SpecLabel>폰트</SpecLabel>
              <SpecTable
                cols={['Role', 'Family', 'Size', 'Weight', 'Tracking', 'Use']}
                rows={spec.fonts}
              />
            </div>

            <div>
              <SpecLabel>레이아웃 · 위계</SpecLabel>
              <ol className="list-decimal pl-5 space-y-2 t-body-s text-meta-charcoal">
                {spec.layout.map((l, i) => (
                  <li key={i}>
                    <span className="font-semibold text-meta-ink-deep">{l.name}</span>
                    <span className="text-meta-steel"> — {l.coords}</span>
                    {l.note && <div className="text-meta-steel">{l.note}</div>}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <SpecLabel>여백 · 그리드</SpecLabel>
              <SpecTable
                cols={['항목', '값', '비고']}
                rows={spec.margins}
              />
            </div>

            <div>
              <SpecLabel>변형 (Variants · {tpl.variants.length}개)</SpecLabel>
              <ul className="flex flex-wrap gap-2">
                {tpl.variants.map((v) => (
                  <li key={v.id} className="badge bg-meta-canvas text-meta-ink-deep border border-meta-hairline">
                    {v.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── primitives ─── */
function SectionTitle({ eyebrow, title }) {
  return (
    <header className="mb-10 border-b border-meta-hairline-soft pb-6">
      <div className="t-cap-b text-meta-steel">{eyebrow}</div>
      <h2 className="t-h-lg mt-2 text-meta-ink-deep">{title}</h2>
    </header>
  );
}

function SubTitle({ children }) {
  return <h4 className="t-h-sm mb-3 text-meta-ink-deep">{children}</h4>;
}

function SpecLabel({ children }) {
  return (
    <div className="t-cap-b mb-2 text-meta-steel uppercase tracking-wider">
      {children}
    </div>
  );
}

function Spec({ label, body }) {
  return (
    <div>
      <SpecLabel>{label}</SpecLabel>
      <p className="t-body text-meta-charcoal">{body}</p>
    </div>
  );
}

function SpecCard({ label, rows }) {
  return (
    <div className="surface-card p-6">
      <div className="t-cap-b text-meta-steel mb-3">{label}</div>
      <dl className="space-y-2 t-body-s">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-meta-hairline-soft pb-2 last:border-0 last:pb-0">
            <dt className="text-meta-steel">{k}</dt>
            <dd className="mono text-meta-ink-deep">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SpecTable({ cols, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-meta-hairline-soft">
      <table className="w-full t-body-s">
        <thead className="bg-meta-surface">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left t-cap text-meta-steel font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-meta-hairline-soft">
              {r.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${j === 0 ? 'text-meta-ink-deep font-semibold' : 'text-meta-charcoal mono'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Swatch({ name, hex }) {
  const isDark = ['#000000', '#0A0A0A'].includes(hex);
  return (
    <div className="rounded-xl border border-meta-hairline overflow-hidden">
      <div className="h-16 flex items-end justify-between px-3 pb-2" style={{ background: hex }}>
        <span className="t-cap" style={{ color: isDark ? '#fff' : '#000' }}>{name}</span>
      </div>
      <div className="px-3 py-2 mono t-body-s">{hex}</div>
    </div>
  );
}

function Grid2({ children, className = '' }) {
  return <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>{children}</div>;
}
function Grid3({ children, className = '' }) {
  return <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>{children}</div>;
}

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

/* ──────────────────────────────────────
   템플릿 사양 데이터 (디자인 디렉션)
   ────────────────────────────────────── */
const SPEC = {
  essay: {
    concept:
      '풀-블리드 사진 위에 좌하단 정렬 타이포그래피를 얹은 매거진 표지 톤. ' +
      '주제어를 시각의 무게중심 아래쪽에 두고, 본문은 큰 호흡(1.7 line-height)으로 읽히게 한다. ' +
      '에디토리얼·다이어리·여행 기록에 적합.',
    fonts: [
      ['Eyebrow', 'Archivo Narrow', '32', '700', '0.04em', '상단 라벨'],
      ['Cover title (1줄)', 'Pretendard Variable', '88', '800', '-0.045em', '표지 메인'],
      ['Cover title (2줄)', 'Pretendard Variable', '84', '800', '-0.045em', '표지 메인 (2줄)'],
      ['Sub / WordEng', 'Archivo Narrow', '32', '500', '0.08em', '하단 영문'],
      ['Body', 'Pretendard Variable', '32', '500', '-0.04em', '본문 단락'],
      ['Caption', 'Archivo Narrow', '28', '500', '0.04em', '캡션 · 페이지'],
    ],
    layout: [
      { name: '①  Eyebrow', coords: 'x = 84, y = 99 · 색 #FFF (사진 위) / #000 (단색)' },
      { name: '②  Cover title block', coords: 'left = 84, width = 812, bottom = 200 · 좌하단 정렬', note: '1줄·2줄 시 메인 폰트만 88/84로 가변, 위치 고정.' },
      { name: '③  Sub (영문/한글)', coords: '메인 타이틀 하단 marginTop = 30, size = 32' },
      { name: '④  Body block', coords: 'x = 84, y = 220~620, width = 912' },
      { name: '⑤  Footer caption / 페이지', coords: 'bottom = 84, left = 84 / right = 84' },
    ],
    margins: [
      ['Outer padding', `${PAD} px`, '좌/우 동일'],
      ['Cover bottom margin', '200 px', '좌하단 패턴 기준'],
      ['Title → sub gap', '30 px', '서브타이틀과의 시각적 호흡'],
      ['Bleed', '0', '풀-블리드 사진 표지'],
      ['Grid', 'Single column 812 / 912', '표지 / 본문'],
    ],
  },

  'brand-story': {
    concept:
      'NOVOUND 포트폴리오·프로젝트 리뷰를 위한 카드형 레이아웃. ' +
      '브랜드 컬러(블랙·네온·화이트)와 그리드를 강하게 노출시켜 ' +
      '"기획 결과물"의 무게를 시각화한다.',
    fonts: [
      ['Eyebrow', 'Archivo Narrow', '32', '700', '0.04em', '상단 라벨'],
      ['Cover title', 'Pretendard Variable', '76 ~ 88', '800', '-0.045em', '프로젝트명'],
      ['Section H1', 'Pretendard Variable', '56', '800', '-0.04em', '본문 H1'],
      ['Section H2', 'Pretendard Variable', '35', '700', '-0.04em', '본문 H2'],
      ['Body', 'Pretendard Variable', '32', '500', '-0.04em', '본문'],
      ['Label / Tag', 'Archivo Narrow', '28', '500', '0.04em', '메타 정보'],
    ],
    layout: [
      { name: '①  Eyebrow + Wordmark', coords: '좌 x=84 / 우 right=84, y=99~106' },
      { name: '②  Cover title', coords: '중앙 또는 좌측 정렬, 풀 너비 912' },
      { name: '③  Hero photo', coords: '풀-블리드 또는 카드 인셋 (margin 84)' },
      { name: '④  Section block', coords: 'x=84, w=912, 단락별 24px 간격' },
      { name: '⑤  Footer 페이지 / 출처', coords: 'bottom=84' },
    ],
    margins: [
      ['Outer padding', `${PAD} px`, ''],
      ['Section gap', '24 px', '문단 사이'],
      ['Card inset', '24 px', '내부 카드 컴포넌트'],
      ['Grid', '단일 컬럼 912', '본문'],
    ],
  },

  'brand-insight': {
    concept:
      '읽는 사람의 "디깅 기록"을 시각화하는 톤. ' +
      '표지 좌하단 패턴은 에세이와 동일하되, 본문은 소제목+드래그-하이라이트, ' +
      '서머리 표(가격·판매처·인사이트)로 정보를 구조화한다.',
    fonts: [
      ['Eyebrow', 'Archivo Narrow', '32', '700', '0.04em', '상단 라벨'],
      ['Eyebrow sub (우상단)', 'Pretendard Variable', '24', '600', '-0.02em', '한글 부제'],
      ['Cover title (1줄)', 'Pretendard Variable', '88', '800', '-0.045em', '표지 메인'],
      ['Cover title (2줄)', 'Pretendard Variable', '84', '800', '-0.045em', '표지 메인 (2줄)'],
      ['Sub English', 'Archivo Narrow', '32', '500', '0.08em', '하단 영문'],
      ['Subhead', 'Pretendard Variable', '32', '700', '-0.04em', '본문 소제목 (드래그 하이라이트)'],
      ['Body', 'Pretendard Variable', '32', '500', '-0.04em', '본문'],
      ['Summary row label', 'Archivo Narrow', '24', '600', '0.04em', '서머리 표 라벨'],
    ],
    layout: [
      { name: '①  Eyebrow + Eyebrow Sub', coords: '좌 (영문) / 우 (한글 부제) y=99~106' },
      { name: '②  Cover title block', coords: 'left=84, w=812, bottom=200 (T1 패턴 공유)' },
      { name: '③  Subhead (소제목)', coords: 'x=84, y=470, w=912, size=32, weight=700', note: '드래그 → <mark class="cn-hl"> 형광 하이라이트.' },
      { name: '④  Body', coords: 'x=84, y=620, w=912, line-height=1.7' },
      { name: '⑤  Summary table', coords: 'Row 단위 (label / value), 라인 구분' },
      { name: '⑥  CTA (StandardMiddle)', coords: '중앙 정렬, w=830~903' },
    ],
    margins: [
      ['Outer padding', `${PAD} px`, ''],
      ['Subhead → body gap', '150 px', 'y 470 → 620'],
      ['Cover bottom margin', '200 px', 'T1과 통일'],
      ['Title → sub gap', '30 px', ''],
      ['Highlight color', 'CN_COLORS.neon', 'mark.cn-hl 배경'],
    ],
  },

  interview: {
    concept:
      '셀프 인터뷰 · Q&A 형식. 표지는 풀-블리드 인물 사진과 큰 타이포의 충돌, ' +
      '본문은 Q 박스 스티커로 화자의 발화를 분리한다. ' +
      '대화·소개·FAQ에 사용.',
    fonts: [
      ['Eyebrow', 'Archivo Narrow', '32', '700', '0.04em', '상단 라벨'],
      ['Cover title (대형)', 'Pretendard Variable', '70 ~ 92', '800', '-0.045em', '표지별 가변'],
      ['Q (QuestionBox · 좌상단)', 'Pretendard Variable', '38', '700', '-0.04em', '본문 A 박스'],
      ['Q (QuestionMiddle · 중앙)', 'Pretendard Variable', '42', '700', '-0.04em', '본문 B/C 박스'],
      ['A (Body)', 'Pretendard Variable', '32', '500', '-0.04em', 'A 답변 본문'],
      ['A (StandardMiddle)', 'Pretendard Variable', '30 ~ 32', '500', '-0.04em', '중앙 정렬 답변'],
      ['Wordmark', 'Archivo Narrow', '26', '500', '0.02em', '우상단 핸들'],
      ['Page', 'Archivo Narrow', '28', '500', '0.04em', '우하단 페이지'],
    ],
    layout: [
      { name: '①  Eyebrow + Wordmark', coords: '좌 x=84 / 우 right=84, y=99~106' },
      { name: '②  Cover title', coords: '4종 표지: 하단 화이트 카드 · 오버레이 · 가로 split · 네온 포스터' },
      { name: '③  Q box (Body A · 상/하단)', coords: 'left=84, top=220 or 720 · padding 22/28, 흰 박스 + 3px 블랙 보더' },
      { name: '④  A (Body A)', coords: 'x=84, w=912, line-height=1.7' },
      { name: '⑤  Q middle (Body B/C)', coords: '중앙 정렬, w=780, padding 60/50' },
      { name: '⑥  A middle (StandardMiddle)', coords: '중앙 정렬, w=830, bottom anchor 1156' },
    ],
    margins: [
      ['Outer padding', `${PAD} px`, ''],
      ['Cover bottom card', '420 px', '표지 1 하단 흰 카드 높이'],
      ['QuestionBox stroke', '3 px solid #000', '스티커 보더 통일'],
      ['Q ↔ A vertical gap', '200 px', '상단 Q 기준 (top 220 → body 420)'],
      ['Bottom anchor', '1156 px', 'A middle 정렬 기준선'],
    ],
  },

  'collection-life': {
    concept:
      '수집·홈오피스·일상 로그 톤. 표지는 에세이/디깅노트와 동일한 좌하단 패턴을 따라가되, ' +
      '본문은 소제목+본문 + 캡션이라는 가장 단순한 위계로 일상 기록의 가독성을 우선한다.',
    fonts: [
      ['Eyebrow', 'Archivo Narrow', '32', '700', '0.04em', '상단 라벨'],
      ['Cover title (1줄)', 'Pretendard Variable', '88', '800', '-0.045em', '표지 메인'],
      ['Cover title (2줄)', 'Pretendard Variable', '84', '800', '-0.045em', '표지 메인 (2줄)'],
      ['Sub English', 'Archivo Narrow', '32', '500', '0.08em', '하단 영문'],
      ['Heading01', 'Pretendard Variable', '56', '800', '-0.04em', '본문 H1'],
      ['Subhead', 'Pretendard Variable', '32', '700', '-0.04em', '본문 소제목 (T3와 동일 패턴)'],
      ['Body', 'Pretendard Variable', '32', '500', '-0.04em', '본문'],
      ['Caption', 'Archivo Narrow', '28', '500', '0.04em', '좌하단 캡션'],
    ],
    layout: [
      { name: '①  Eyebrow + Top right', coords: '좌 x=84 / 우 right=84, y=99~106' },
      { name: '②  Cover title block', coords: 'left=84, w=812, bottom=200 (T1·T3 공유)' },
      { name: '③  Heading01', coords: 'x=84, y=220, w=912, size=56' },
      { name: '④  Subhead', coords: 'x=84, y=470, w=912, size=32, weight=700', note: '다크 모드 시 #FFF로 자동 반전.' },
      { name: '⑤  Body', coords: 'x=84, y=620, w=912, line-height=1.7' },
      { name: '⑥  Footer caption', coords: 'left=84, bottom=84' },
    ],
    margins: [
      ['Outer padding', `${PAD} px`, ''],
      ['Cover bottom margin', '200 px', 'T1·T3과 통일'],
      ['Heading → subhead gap', '250 px', 'y 220 → 470'],
      ['Subhead → body gap', '150 px', 'y 470 → 620'],
      ['Bleed', '0', '표지 외 풀-블리드 없음'],
    ],
  },
};
