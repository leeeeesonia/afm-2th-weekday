// type-system.jsx — Design System documentation cards
//
// 4 reference cards rendered in the design canvas:
//   1. 폰트 시스템 (메인 + 서브 매핑)
//   2. 타이틀 위계
//   3. 컬러 시스템
//   4. 레이아웃 그리드

/* ─── Section heading inside a card ─── */
function SysSection({ children, top = 0 }) {
  return (
    <div style={{
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      fontSize: 11,
      letterSpacing: "0.08em",
      color: "rgba(0,0,0,0.45)",
      textTransform: "uppercase",
      marginBottom: 10,
      marginTop: top,
    }}>{children}</div>
  );
}

const sysCardStyle = {
  width: 760,
  height: 540,
  background: "#fff",
  boxSizing: "border-box",
  padding: "32px 36px",
  fontFamily: CN_FONT,
  letterSpacing: "-0.04em",
  overflow: "hidden",
  borderTop: `6px solid ${CN_COLORS.neon}`,
};

/* ────────────────────────────────────────────────────────────
   CARD 1 · 폰트 시스템
   ──────────────────────────────────────────────────────────── */
function SysFonts() {
  return (
    <div style={sysCardStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.045em" }}>01 · 폰트 시스템</div>
        <div style={{ fontFamily: CN_FONT_ARCHIVO, fontSize: 14, fontWeight: 500, color: "#666", letterSpacing: "0.08em" }}>TYPE / SUB-TYPE</div>
      </div>

      <SysSection>MAIN · 모든 한글 본문/타이틀</SysSection>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
        <div style={{ fontFamily: CN_FONT, fontWeight: 800, fontSize: 36, letterSpacing: "-0.045em" }}>Pretendard</div>
        <div style={{ fontSize: 12, color: "#666" }}>ExtraBold · Bold · Medium · Regular</div>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#444", marginBottom: 22 }}>
        <span style={{ fontFamily: CN_FONT, fontWeight: 400 }}>가나다 Regular</span>
        <span style={{ fontFamily: CN_FONT, fontWeight: 500 }}>가나다 Medium</span>
        <span style={{ fontFamily: CN_FONT, fontWeight: 700 }}>가나다 Bold</span>
        <span style={{ fontFamily: CN_FONT, fontWeight: 800 }}>가나다 ExtraBold</span>
      </div>

      <SysSection>SUB · 영문 워드마크 · 페이지번호 · eyebrow 카테고리</SysSection>
      <div style={{ padding: 18, border: `2px solid ${CN_COLORS.black}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: CN_FONT_ARCHIVO, fontWeight: 700, fontSize: 26, letterSpacing: "0.02em" }}>Archivo Narrow</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2, letterSpacing: 0 }}>condensed industrial · masthead 단단함</div>
          </div>
          <div style={{ fontFamily: CN_FONT_ARCHIVO, fontSize: 36, fontWeight: 700, letterSpacing: "0.02em" }}>@OYATLOG · 01 / 10</div>
        </div>
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee",
          fontSize: 12, color: "#444",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px",
        }}>
          <div>· Type 1 · 에세이</div>
          <div>· Type 2 · 브랜드 스토리 (NOVOUND)</div>
          <div>· Type 3 · 사적인 디깅노트</div>
          <div>· Type 4 · 인터뷰</div>
          <div>· Type 5 · 수집생활</div>
        </div>
        <div style={{
          marginTop: 12, fontSize: 11, color: "#666", lineHeight: 1.5,
        }}>
          ※ Type 5 수집생활 · 본문 우상단 워드마크는 한글 「수집생활」 → Pretendard Medium 사용.
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD 2 · 타이틀 위계
   ──────────────────────────────────────────────────────────── */
function SysHierarchy() {
  const rows = [
    { tag: "Title / cover",    size: 88, weight: 800, sample: "피그마 AI 정복기", note: "Pretendard ExtraBold · 표지 메인 타이틀" },
    { tag: "Heading / 01",     size: 56, weight: 800, sample: "장인의 손맛이 정체성이 될 때", note: "Pretendard ExtraBold · 본문 큰 타이틀" },
    { tag: "Heading / 02",     size: 35, weight: 700, sample: "Brand Insight", note: "Pretendard Bold · 카테고리 / eyebrow" },
    { tag: "Caption / question", size: 42, weight: 700, sample: "Q. 무슨 일을 하는 사람인가요?", note: "Pretendard Bold · Q-박스 전용" },
    { tag: "Body / default",   size: 32, weight: 500, sample: "고미술 상가에 가면 이런 부분이 좋습니다.", note: "Pretendard Medium · 본문 paragraph" },
    { tag: "Body / sub",       size: 28, weight: 500, sample: "어떤 가치를 추구하나요?", note: "Pretendard Medium · 보조 본문" },
    { tag: "Caption / default",size: 28, weight: 400, sample: "피그마 AI 정복기 가능?", note: "Pretendard Regular · footer · caption" },
  ];

  return (
    <div style={sysCardStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.045em" }}>02 · 타이틀 위계</div>
        <div style={{ fontFamily: CN_FONT_ARCHIVO, fontSize: 14, fontWeight: 500, color: "#666", letterSpacing: "0.08em" }}>TYPE SCALE</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map(r => (
          <div key={r.tag} style={{
            display: "grid", gridTemplateColumns: "120px 1fr 60px",
            alignItems: "center", gap: 14,
            padding: "7px 0",
            borderBottom: "1px solid #eee",
          }}>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 10, color: "#666", letterSpacing: "0.04em",
            }}>{r.tag}</div>
            <div style={{
              fontFamily: CN_FONT,
              fontWeight: r.weight,
              fontSize: Math.min(r.size * 0.4, 28),
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{r.sample}</div>
            <div style={{
              fontFamily: CN_FONT_ARCHIVO,
              fontWeight: 500, fontSize: 12,
              color: "#222", textAlign: "right",
              letterSpacing: "0.04em",
            }}>{r.size}/{r.weight}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD 3 · 컬러 시스템
   ──────────────────────────────────────────────────────────── */
function SysColors() {
  const colors = [
    { c: CN_COLORS.black, n: "Black", h: "#000000", role: "텍스트 · 외곽선 · 사진 박스 3pt 테두리", inv: true },
    { c: CN_COLORS.white, n: "White", h: "#FFFFFF", role: "배경 · 박스 내부", border: true },
    { c: CN_COLORS.neon,  n: "Neon Green", h: "#AAFF00", role: "포인트 · 하이라이트 · sub-sticker / cloud" },
    { c: CN_COLORS.lemon, n: "Lemon",      h: "#FFFABA", role: "sub-info · 보조 강조" },
  ];

  return (
    <div style={sysCardStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.045em" }}>03 · 컬러 시스템</div>
        <div style={{ fontFamily: CN_FONT_ARCHIVO, fontSize: 14, fontWeight: 500, color: "#666", letterSpacing: "0.08em" }}>PALETTE</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {colors.map(s => (
          <div key={s.n} style={{ display: "grid", gridTemplateColumns: "100px 130px 1fr 90px", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 100, height: 70,
              background: s.c,
              border: s.border ? "1px solid #ccc" : "none",
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{
                fontFamily: CN_FONT_ARCHIVO, fontSize: 13, fontWeight: 500,
                color: "#555", letterSpacing: "0.04em", marginTop: 2,
              }}>{s.h}</div>
            </div>
            <div style={{ fontSize: 13, color: "#333", lineHeight: 1.45 }}>{s.role}</div>
            <div style={{
              fontFamily: CN_FONT_ARCHIVO, fontSize: 12, fontWeight: 500,
              letterSpacing: "0.04em", textAlign: "right", color: "#888",
            }}>CN_COLORS<br/>{`.${s.n.toLowerCase().split(' ')[0]}`}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: "10px 14px", background: "#F1EFEA", fontSize: 12, color: "#444", lineHeight: 1.55 }}>
        <strong>사용 원칙</strong> — 한 카드 안에서 포인트 컬러는 최대 1종만.<br />
        Neon Green = 강조 / Lemon = 정보 보조. 둘은 같은 카드에서 동시 사용 지양.
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD 4 · 레이아웃 그리드
   ──────────────────────────────────────────────────────────── */
function SysGrid() {
  // Tiny 1080x1350 schematic, scaled down
  const W = 270;  // schematic width
  const H = 338;  // schematic height (4:5)
  const scale = W / 1080;
  const pad = 84 * scale;

  return (
    <div style={sysCardStyle}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.045em" }}>04 · 레이아웃 그리드</div>
        <div style={{ fontFamily: CN_FONT_ARCHIVO, fontSize: 14, fontWeight: 500, color: "#666", letterSpacing: "0.08em" }}>1080 × 1350 · 4:5</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `${W + 40}px 1fr`, gap: 30, alignItems: "start" }}>
        {/* Schematic */}
        <div style={{ position: "relative", width: W, height: H, background: "#fff", border: `1.5px solid ${CN_COLORS.black}` }}>
          {/* safe area outline */}
          <div style={{
            position: "absolute", left: pad, right: pad, top: pad, bottom: pad,
            border: `1px dashed ${CN_COLORS.neon}`,
            opacity: 0.9,
          }} />
          {/* Eyebrow line at y=99 */}
          <div style={{
            position: "absolute", left: pad, top: 99 * scale,
            background: CN_COLORS.neon, height: 6, width: 50, opacity: 0.85,
          }} />
          <div style={{
            position: "absolute", right: pad, top: 99 * scale,
            background: CN_COLORS.neon, height: 6, width: 50, opacity: 0.85,
          }} />
          {/* Image-bottom anchor y=1156 */}
          <div style={{
            position: "absolute", left: pad, right: pad, top: 1156 * scale,
            borderTop: `1.5px dashed ${CN_COLORS.black}`, opacity: 0.6,
          }} />
          {/* Footer bottom=84 */}
          <div style={{
            position: "absolute", left: pad, right: pad, bottom: pad,
            height: 6, background: CN_COLORS.black, opacity: 0.5,
          }} />

          {/* labels */}
          <span style={{ position: "absolute", left: 4, top: 99 * scale - 6, fontSize: 9, color: "#777" }}>99</span>
          <span style={{ position: "absolute", left: 4, top: 1156 * scale - 6, fontSize: 9, color: "#777" }}>1156</span>
          <span style={{ position: "absolute", left: 4, bottom: pad - 6, fontSize: 9, color: "#777" }}>84</span>
          <span style={{ position: "absolute", left: pad - 14, bottom: 4, fontSize: 9, color: "#777" }}>84</span>
          <span style={{ position: "absolute", right: pad - 14, bottom: 4, fontSize: 9, color: "#777" }}>84</span>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, lineHeight: 1.5 }}>
          {[
            { k: "캔버스",        v: "1080 × 1350 · 4:5 비율" },
            { k: "Safe padding", v: "좌·우·상·하 84px" },
            { k: "Eyebrow 위치", v: "Top 99px · 좌측 카테고리 / 우측 워드마크" },
            { k: "본문 헤딩",     v: "Top 220px (= [OVERVIEW] 라인 / Selling Point 타이틀)" },
            { k: "이미지 하단 anchor", v: "Bottom y = 1156px (Overlay 사각 사진 / standard-middle 정렬 기준)" },
            { k: "Footer",       v: "Bottom 84px · 좌측 caption · 우측 page (서브폰트 + tabular-nums)" },
            { k: "사진 박스 테두리", v: "검정 3pt · 모든 사진 placeholder 공통" },
          ].map(r => (
            <div key={r.k} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
              <div style={{
                fontFamily: CN_FONT_ARCHIVO, fontWeight: 500, fontSize: 12,
                letterSpacing: "0.04em", color: "#555",
              }}>{r.k}</div>
              <div style={{ fontWeight: 500, color: "#222" }}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypeSystemSection() {
  return (
    <DCSection
      id="type-system"
      title="디자인 시스템"
      subtitle="폰트 · 타이틀 위계 · 컬러 · 레이아웃 그리드"
    >
      <DCArtboard id="sys-fonts"     label="01 · 폰트 시스템"   width={760} height={540}><SysFonts /></DCArtboard>
      <DCArtboard id="sys-hierarchy" label="02 · 타이틀 위계"   width={760} height={540}><SysHierarchy /></DCArtboard>
      <DCArtboard id="sys-colors"    label="03 · 컬러 시스템"   width={760} height={540}><SysColors /></DCArtboard>
      <DCArtboard id="sys-grid"      label="04 · 레이아웃 그리드" width={760} height={540}><SysGrid /></DCArtboard>
    </DCSection>
  );
}

Object.assign(window, { TypeSystemSection });
