// brand-insight.jsx — Type 3: 브랜드 인사이트 (UPDATED)
//
// Cover redesign per spec:
//   • Removed: page indicator on cover, lemon sub-info box, cloud sticker
//   • Title height aligned with Type 1 essay cover (eyebrow Y=99 + title block bottom anchored)
//   • Two title variants for cover: 1-line vs 2-line
// Body / overlay / CTA: largely unchanged.

const BI_PAGE = "3 / 10";

/* ─────────── 표지 — 1-line title ─────────── */
function BICoverOneLine() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>사적인 디깅노트-</span>

      {/* Title block bottom-anchored (matches Essay cover y≈940 baseline w/ 1 line of 88px) */}
      <CoverTitle
        x={84}
        y={940}
        w={912}
        title="포터 클래식의 미학"
        titleSize={88}
        titleLineHeight={1.15}
      />
      <div style={{
        position: "absolute", left: 84, top: 1078,
        fontFamily: CN_FONT_ARCHIVO,
        fontWeight: 500, fontSize: 34,
        letterSpacing: "0.18em",
        color: "#000",
        lineHeight: 1,
      }}>PORTER CLASSIC STORY</div>

      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>1 / 10</div>
    </Card>
  );
}

/* ─────────── 표지 — 2-line title ─────────── */
function BICoverTwoLine() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>사적인 디깅노트-</span>

      <CoverTitle
        x={84}
        y={830}
        w={912}
        title={"오래 사랑받는 옷,\n포터 클래식의 미학"}
        titleSize={86}
        titleLineHeight={1.15}
      />
      <div style={{
        position: "absolute", left: 84, top: 1078,
        fontFamily: CN_FONT_ARCHIVO,
        fontWeight: 500, fontSize: 34,
        letterSpacing: "0.18em",
        color: "#000",
        lineHeight: 1,
      }}>PORTER CLASSIC STORY</div>

      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>1 / 10</div>
    </Card>
  );
}

/* ─────────── Body — text-heavy ─────────── */
function BIBodyText() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>PORTER CLASSIC</span>

      <Heading01 x={84} y={220} w={912} size={56}>
        장인의 손맛이{"\n"}브랜드의 정체성이 될 때
      </Heading01>

      <div style={{
        position: "absolute", left: 84, top: 470, width: 912,
        fontFamily: CN_FONT, fontWeight: 700, fontSize: 32,
        letterSpacing: "-0.04em", lineHeight: 1.5,
      }}>
        <span style={{ background: `linear-gradient(transparent 62%, ${CN_COLORS.neon} 62%)`, padding: "0 4px" }}>
          오래 입을수록 진가가 드러나는 옷
        </span>
        <span>, 그 안에 담긴 철학.</span>
      </div>

      <BodyText x={84} y={620} w={912} size={32} weight={500} lineHeight={1.7}>
        {`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!

팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!`}
      </BodyText>

      <CardFooter left="@oyatlog" right={BI_PAGE} />
    </Card>
  );
}

/* ─────────── Body — overlay image (3pt border) ─────────── */
function BIBodyOverlay({ bg = "assets/photo-02.jpeg", fg = "assets/photo-03.jpg" }) {
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

      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>PORTER CLASSIC</span>

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
      <CardFooter left="@oyatlog" right={BI_PAGE} />
    </Card>
  );
}

/* ─────────── Body — 꺽쇠 라인 연결 (2 images + L-brackets) ─────────── */
// Modeled on Figma Group 3: 우상단 정렬 본문 + 좌상단 작은 이미지 +
// 우하단 큰 이미지 + 두 이미지를 잇는 꺽쇠(L-bracket) 라인 2개.
function BIBodyConnected({
  eyebrow = "Insight Note",
  wordmark = "PORTER CLASSIC",
  body = "대답은 똑같이 이렇게 하면 되지. 팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다. 추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게 답변해주세요!",
  img1 = "assets/photo-01.jpeg",
  img2 = "assets/photo-02.jpeg",
  wordmarkFont = CN_FONT_ARCHIVO,
}) {
  // Image rectangles (anchored to Group3 proportions, adjusted to 1080 canvas)
  const a = { x: 84,  y: 420, w: 280, h: 265 };   // upper-left
  const b = { x: 716, y: 880, w: 320, h: 305 };   // lower-right

  // Bracket 1: from img1 bottom-right corner ↓↘ to an elbow, then → right
  const a1 = { x: a.x + a.w, y: a.y + a.h };       // (364, 685)
  const elbow1 = { x: a1.x + 70, y: a1.y + 150 };  // (434, 835)
  const end1 = { x: elbow1.x + 200, y: elbow1.y }; // (634, 835)

  // Bracket 2: from img2 top-left corner ↖↑ to an elbow, then ← left
  const b1 = { x: b.x, y: b.y };                   // (716, 880)
  const elbow2 = { x: b1.x - 70, y: b1.y - 100 };  // (646, 780)
  const end2 = { x: elbow2.x - 200, y: elbow2.y }; // (446, 780)

  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">{eyebrow}</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: wordmarkFont,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>{wordmark}</span>

      {/* right-aligned body text at top */}
      <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.6} align="right">
        {body}
      </BodyText>

      {/* SVG with bracket lines — sits behind images */}
      <svg
        width={CARD_W} height={CARD_H}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {/* Bracket 1 — img1 bottom-right → diagonal → horizontal right */}
        <polyline
          points={`${a1.x},${a1.y} ${elbow1.x},${elbow1.y} ${end1.x},${end1.y}`}
          fill="none"
          stroke={CN_COLORS.black}
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        {/* Bracket 2 — img2 top-left → diagonal → horizontal left */}
        <polyline
          points={`${b1.x},${b1.y} ${elbow2.x},${elbow2.y} ${end2.x},${end2.y}`}
          fill="none"
          stroke={CN_COLORS.black}
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>

      {/* Image 1 (upper-left, small) */}
      <div style={{
        position: "absolute", left: a.x, top: a.y,
        width: a.w, height: a.h,
        backgroundImage: `url(${img1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxSizing: "border-box",
      }} />

      {/* Image 2 (lower-right, larger) */}
      <div style={{
        position: "absolute", left: b.x, top: b.y,
        width: b.w, height: b.h,
        backgroundImage: `url(${img2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxSizing: "border-box",
      }} />

      <CardFooter left="@oyatlog" right={BI_PAGE} />
    </Card>
  );
}

/* ─────────── Body — CTA / quote ─────────── */
function BIBodyCTA() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>PORTER CLASSIC</span>

      <div style={{
        position: "absolute", left: 0, right: 0, top: 320,
        textAlign: "center",
        fontFamily: CN_FONT, fontWeight: 800, fontSize: 80,
        lineHeight: 1.2, letterSpacing: "-0.045em",
        whiteSpace: "pre-line",
      }}>
        <span style={{ background: `linear-gradient(transparent 62%, ${CN_COLORS.neon} 62%)`, padding: "0 14px" }}>피그마 AI</span>{"\n"}
        정복기 가능?
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center" }}>
        <StandardMiddle w={830} size={30}>
          {`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!`}
        </StandardMiddle>
      </div>

      <CardFooter left="@oyatlog" right={BI_PAGE} />
    </Card>
  );
}

/* ─────────── Body — 이미지형 (풀 이미지 + 글) ─────────── */
// Brand Insight version of Essay Body 3 — full-bleed photo + body text.
function BIBodyImage({ position = "bottom", photo = "assets/photo-02.jpeg" }) {
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

      <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(255,255,255,0.65)",
      }}>PORTER CLASSIC</span>

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
      }}>{`장인의 손맛이 브랜드의 정체성이 될 때,
오래 입을수록 진가가 드러나는 옷을 만드는 구도에
포터 클래식의 철학이 담겨 있습니다.`}</div>

      <CardFooter left="@oyatlog" right={BI_PAGE} color="#fff" />
    </Card>
  );
}

/* ─────────── Body — 요약 (정보 요약 카드) ─────────── */
// Variation of BIBodyCTA — three labeled rows for 판매처 / 가격 / Insight summary.
function BIBodySummary({
  brand = "포터 클래식",
  where = `서울시 용산구 한강대로 5·
PORTER STORE @porter.classic`,
  price = "메신저 토트백 198,000원~",
  summary = `100년의 지혜를 담은 일본 교토의
대표적 클래식 워크웨어 브랜드.`,
}) {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Insight Note</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: "rgba(0,0,0,0.5)",
      }}>PORTER CLASSIC</span>

      <div style={{
        position: "absolute", left: 0, right: 0, top: 240,
        textAlign: "center",
        fontFamily: CN_FONT, fontWeight: 800, fontSize: 64,
        lineHeight: 1.15, letterSpacing: "-0.045em",
      }}>
        <span style={{ background: `linear-gradient(transparent 60%, ${CN_COLORS.neon} 60%)`, padding: "0 12px" }}>{brand}</span>
        <div style={{ marginTop: 12, fontSize: 32, fontWeight: 500, letterSpacing: "-0.04em" }}>
          이제 어디서 만난 수 있을까?
        </div>
      </div>

      {/* Three info rows — bordered boxes with label inside on left, content on right */}
      <div style={{
        position: "absolute", left: 84, right: 84, top: 540,
        display: "flex", flexDirection: "column", gap: 24,
      }}>
        {[
          { label: "판매처", value: where },
          { label: "가격", value: price },
          { label: "Insight", value: summary },
        ].map((row) => (
          <div key={row.label} style={{
            display: "flex", alignItems: "stretch",
            border: `3px solid ${CN_COLORS.black}`,
            background: "#fff",
            minHeight: 120,
          }}>
            <div style={{
              minWidth: 180,
              background: CN_COLORS.lemon,
              borderRight: `3px solid ${CN_COLORS.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: CN_FONT, fontWeight: 800, fontSize: 30,
              letterSpacing: "-0.04em",
            }}>{row.label}</div>
            <div style={{
              flex: 1,
              padding: "24px 32px",
              display: "flex", alignItems: "center",
              fontFamily: CN_FONT, fontWeight: 500, fontSize: 28,
              lineHeight: 1.45, letterSpacing: "-0.04em",
              whiteSpace: "pre-line",
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      <CardFooter left="@oyatlog" right={BI_PAGE} />
    </Card>
  );
}

Object.assign(window, {
  BICoverOneLine, BICoverTwoLine,
  BIBodyText, BIBodyOverlay, BIBodyCTA,
  BIBodyImage, BIBodySummary, BIBodyConnected,
});
