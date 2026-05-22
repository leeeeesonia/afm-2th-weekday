// collection-life.jsx — Type 5: 수집생활
//
// Top-left + top-right wordmarks:
//   • Cover  → 좌상단 「수집생활」 (Pretendard Bold) · 우상단 「Suji's Life」 (Archivo Narrow)
//   • Body   → 좌상단 「수집생활」 (Pretendard Bold) · 우상단 「WORKROOM」 (Archivo Narrow)
//
// Cover cloud sticker: "LIFE › HOME › WORKROOM" placed directly above title.
// Demo cover title: 추구미와 현재형이 공존하는 홈오피스 / FREEWORKER'S WORKROOM

const CL_PAGE = "3 / 10";

/* ─── shared atoms ─── */
function CLEyebrow({ color = "#000" }) {
  // Korean wordmark — use Pretendard Bold
  return (
    <span style={{
      position: "absolute", left: 84, top: 99,
      fontFamily: CN_FONT,
      fontWeight: 700, fontSize: 35,
      letterSpacing: "-0.04em",
      lineHeight: 1.2,
      color,
    }}>수집생활</span>
  );
}

function CLCoverTopRight() {
  return (
    <span style={{
      position: "absolute", right: 84, top: 106,
      fontFamily: CN_FONT_ARCHIVO,
      fontSize: 26, fontWeight: 500,
      letterSpacing: "0.02em",
      lineHeight: 1,
      color: "rgba(0,0,0,0.5)",
    }}>Suji's Life</span>
  );
}

function CLBodyTopRight({ color = "#000" }) {
  const subColor = color === "#fff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  return (
    <span style={{
      position: "absolute", right: 84, top: 106,
      fontFamily: CN_FONT_ARCHIVO,
      fontSize: 26, fontWeight: 500,
      letterSpacing: "0.04em",
      lineHeight: 1,
      color: subColor,
    }}>WORKROOM</span>
  );
}

/* ─────────── 표지 — 1줄 ─────────── */
function CLCoverOneLine() {
  return (
    <Card>
      <CLEyebrow />
      <CLCoverTopRight />

      {/* Cloud sticker — placed directly above title */}
      <div style={{ position: "absolute", left: 84, top: 850 }}>
        <BrandInsightCloud size={28}>LIFE  ›  HOME  ›  WORKROOM</BrandInsightCloud>
      </div>

      <CoverTitle
        x={84}
        y={950}
        w={912}
        title="추구미와 현재형이 공존하는 홈오피스"
        titleSize={68}
        titleLineHeight={1.18}
      />
      <div style={{
        position: "absolute", left: 84, top: 1170,
        fontFamily: CN_FONT_ARCHIVO,
        fontWeight: 500, fontSize: 30,
        letterSpacing: "0.16em",
        color: "#000",
        lineHeight: 1,
      }}>FREEWORKER'S WORKROOM</div>

      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500,
        letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>1 / 10</div>
    </Card>
  );
}

/* ─────────── 표지 — 2줄 ─────────── */
function CLCoverTwoLine() {
  return (
    <Card>
      <CLEyebrow />
      <CLCoverTopRight />

      {/* Cloud sticker — placed directly above 2-line title */}
      <div style={{ position: "absolute", left: 84, top: 740 }}>
        <BrandInsightCloud size={28}>LIFE  ›  HOME  ›  WORKROOM</BrandInsightCloud>
      </div>

      <CoverTitle
        x={84}
        y={840}
        w={912}
        title={"추구미와 현재형이\n공존하는 홈오피스"}
        titleSize={86}
        titleLineHeight={1.15}
      />
      <div style={{
        position: "absolute", left: 84, top: 1100,
        fontFamily: CN_FONT_ARCHIVO,
        fontWeight: 500, fontSize: 30,
        letterSpacing: "0.16em",
        color: "#000",
        lineHeight: 1,
      }}>FREEWORKER'S WORKROOM</div>

      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500,
        letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>1 / 10</div>
    </Card>
  );
}

/* ─────────── Body — 줄글 ─────────── */
function CLBodyText() {
  return (
    <Card>
      <CLEyebrow />
      <CLBodyTopRight />

      <Heading01 x={84} y={220} w={912} size={56}>
        추구미와 현재형이{"\n"}공존하는 책상 한 칸
      </Heading01>

      <div style={{
        position: "absolute", left: 84, top: 470, width: 912,
        fontFamily: CN_FONT, fontWeight: 700, fontSize: 32,
        letterSpacing: "-0.04em", lineHeight: 1.5,
      }}>
        <span style={{ background: `linear-gradient(transparent 62%, ${CN_COLORS.neon} 62%)`, padding: "0 4px" }}>
          오래 곁에 둘 물건들로만 채운 공간
        </span>
        <span>, 그 안에 담긴 취향.</span>
      </div>

      <BodyText x={84} y={620} w={912} size={32} weight={500} lineHeight={1.7}>
        {`작업과 휴식의 경계를 부드럽게 풀어주는 홈오피스.
오랫동안 곁에 둘 물건들만 골라 두고, 매일 손이 가는
도구만 책상 위에 남겼습니다.

좋아하는 무드와 일하는 모드가 함께 머무는 공간.`}
      </BodyText>

      <CardFooter left="@oyatlog" right={CL_PAGE} />
    </Card>
  );
}

/* ─────────── Body — 오버레이 이미지 ─────────── */
function CLBodyOverlay({ bg = "assets/photo-02.jpeg", fg = "assets/photo-03.jpg" }) {
  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 240,
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
      }} />

      <CLEyebrow />
      <CLBodyTopRight />

      <div style={{
        position: "absolute", left: 180, top: 380,
        width: 720, height: 720,
        backgroundImage: `url(${fg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
      }} />

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 180,
        background: "linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))",
      }} />
      <CardFooter left="@oyatlog" right={CL_PAGE} />
    </Card>
  );
}

/* ─────────── Body — 꺽쇠 라인 연결 (2 images) ─────────── */
// We can't reuse BIBodyConnected here because Type 5 needs Korean Eyebrow
// + WORKROOM top-right. Inline a copy with our own header atoms.
function CLBodyConnected({
  img1 = "assets/photo-01.jpeg",
  img2 = "assets/photo-02.jpeg",
  body = "작업과 휴식의 경계를 부드럽게 풀어주는 홈오피스. 오랫동안 곁에 둘 물건들만 골라 두고, 매일 손이 가는 도구만 책상 위에 남겼습니다.",
}) {
  const a = { x: 84,  y: 420, w: 280, h: 265 };
  const b = { x: 716, y: 880, w: 320, h: 305 };

  const a1 = { x: a.x + a.w, y: a.y + a.h };
  const elbow1 = { x: a1.x + 70, y: a1.y + 150 };
  const end1 = { x: elbow1.x + 200, y: elbow1.y };

  const b1 = { x: b.x, y: b.y };
  const elbow2 = { x: b1.x - 70, y: b1.y - 100 };
  const end2 = { x: elbow2.x - 200, y: elbow2.y };

  return (
    <Card>
      <CLEyebrow />
      <CLBodyTopRight />

      <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.6} align="right">
        {body}
      </BodyText>

      <svg width={CARD_W} height={CARD_H}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <polyline points={`${a1.x},${a1.y} ${elbow1.x},${elbow1.y} ${end1.x},${end1.y}`}
          fill="none" stroke={CN_COLORS.black} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <polyline points={`${b1.x},${b1.y} ${elbow2.x},${elbow2.y} ${end2.x},${end2.y}`}
          fill="none" stroke={CN_COLORS.black} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>

      <div style={{
        position: "absolute", left: a.x, top: a.y,
        width: a.w, height: a.h,
        backgroundImage: `url(${img1})`,
        backgroundSize: "cover", backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`, boxSizing: "border-box",
      }} />
      <div style={{
        position: "absolute", left: b.x, top: b.y,
        width: b.w, height: b.h,
        backgroundImage: `url(${img2})`,
        backgroundSize: "cover", backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`, boxSizing: "border-box",
      }} />

      <CardFooter left="@oyatlog" right={CL_PAGE} />
    </Card>
  );
}

/* ─────────── Body — 이미지형 (풀 이미지 + 글) ─────────── */
function CLBodyImage({ position = "bottom", photo = "assets/photo-02.jpeg" }) {
  const isTop = position === "top";
  const scrim = isTop
    ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 55%)"
    : "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 55%)";

  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      <div style={{ position: "absolute", inset: 0, background: scrim }} />

      <CLEyebrow color="#fff" />
      <CLBodyTopRight color="#fff" />

      <div style={{
        position: "absolute",
        left: 84, right: 84,
        ...(isTop ? { top: 200 } : { bottom: 200 }),
        fontFamily: CN_FONT,
        fontWeight: 500,
        fontSize: 32,
        lineHeight: 1.65,
        letterSpacing: "-0.04em",
        color: "#fff",
        whiteSpace: "pre-line",
        textShadow: "0 1px 12px rgba(0,0,0,0.35)",
      }}>{`오랫동안 곁에 둘 물건들로 채운 책상 한 칸.
좋아하는 무드와 일하는 모드가 함께 머물고,
매일 손이 닿는 도구만 자리를 지킵니다.`}</div>

      <CardFooter left="@oyatlog" right={CL_PAGE} color="#fff" />
    </Card>
  );
}

Object.assign(window, {
  CLCoverOneLine, CLCoverTwoLine,
  CLBodyText, CLBodyOverlay, CLBodyConnected, CLBodyImage,
});
