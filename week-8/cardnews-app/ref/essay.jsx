// essay.jsx — Type 1: 에세이 (UPDATED)
//
// Per new spec:
//   • 표지 4종 — all full-bleed photo, alignment variants
//       (bottom-left BASIC, bottom-center, center, top-center)
//   • 본문 1 · text-only         (unchanged)
//   • 본문 2 · 중앙 사진 / 글 위
//   • 본문 2 · 중앙 사진 / 글 아래
//   • 본문 3 · 풀 이미지 + 본문 글 (글 위 / 글 아래)   ← NEW BODY DESIGN
//   • 아웃트로
//
// Top-right of every card: "@oyatlog" in same font (incl. body 3 image cards).
// Bottom: essay name + page number.

const ESSAY_NAME = "피그마 AI 정복기 가능?";
const PAGE = "3 / 10";
const OYATLOG = "@oyatlog";

const ESSAY_BODY_LONG = `팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!

팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!`;

const ESSAY_BODY_SHORT = `팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게 답변해주세요!`;

const ESSAY_BODY3_TEXT = `고미술 상가에 가면 이런 부분이 좋습니다.
이런 것들을 볼 수 있고요. 친절한 사장님들과의 담소가
가장 인상적이었죠. 원하는 디자인 방향에 따라
이렇게 저렇게 고칠 수 있습니다.`;

/* ─────────── shared atoms ─────────── */
function EssayHeader({ color = "#000" }) {
  // Top-right @oyatlog — slightly demoted: smaller size + lower contrast.
  // Dark text → muted gray; white text → semi-transparent white.
  const subColor = color === "#fff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)";
  return (
    <React.Fragment>
      <Eyebrow x={84} y={99} color={color} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Essay</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO,
        fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        color: subColor,
      }}>@oyatlog</span>
    </React.Fragment>
  );
}

/* ─────────── 표지 — full-image, alignment variants ─────────── */
// title can be 1-line or 2-line; subtitle line follows.
// hAlign × vAlign positions the text block. Bottom-left = basic.
function EssayCover({
  hAlign = "left",
  vAlign = "bottom",
  title = "피그마 AI 정복기 가능?",
  subtitle = "이건 그냥 대충 이 정도 느낌",
  photo = "assets/photo-02.jpeg",
  textColor = "#fff",
}) {
  const padX = 84;
  const padY = 140;
  const blockW = 912;

  const horizontal = {
    left:   { left: padX, textAlign: "left",   width: blockW - 100 },
    center: { left: (CARD_W - blockW) / 2, textAlign: "center", width: blockW },
    right:  { left: padX, textAlign: "right",  width: blockW - 100 },
  }[hAlign];

  // Vertical anchor: top/center/bottom of the text block
  const vertical = {
    top:    { top: 200 },
    middle: { top: 0, height: CARD_H, display: "flex", flexDirection: "column", justifyContent: "center" },
    bottom: { bottom: 200 },
  }[vAlign];

  // Scrim for legibility (varies w/ alignment)
  const scrim = vAlign === "bottom"
    ? "linear-gradient(180deg, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.55) 100%)"
    : vAlign === "top"
    ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 50%)"
    : "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)";

  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      <div style={{ position: "absolute", inset: 0, background: scrim }} />

      <EssayHeader color={textColor} />

      <div style={{
        position: "absolute",
        left: horizontal.left,
        width: horizontal.width,
        textAlign: horizontal.textAlign,
        color: textColor,
        fontFamily: CN_FONT,
        ...vertical,
      }}>
        <div style={{
          fontWeight: 800, fontSize: 84, lineHeight: 1.15,
          letterSpacing: "-0.045em",
          textShadow: "0 2px 18px rgba(0,0,0,0.35)",
          whiteSpace: "pre-line",
        }}>{title}</div>
        {subtitle ? (
          <div style={{
            marginTop: 24,
            fontWeight: 500, fontSize: 32,
            lineHeight: 1.5, letterSpacing: "-0.04em",
            textShadow: "0 1px 12px rgba(0,0,0,0.3)",
          }}>{subtitle}</div>
        ) : null}
      </div>

      {/* Cover footer: no left text, no page number (per spec) */}
    </Card>
  );
}

/* ─────────── 본문 1 · text-only ─────────── */
function EssayBody1() {
  return (
    <Card>
      <EssayHeader />
      <Heading01 x={84} y={220} w={912} size={56}>
        피그마 AI{"\n"}정복기 가능?
      </Heading01>
      <BodyText x={84} y={520} w={912} size={32} weight={500} lineHeight={1.7}>
        {ESSAY_BODY_LONG}
      </BodyText>
      <CardFooter left={ESSAY_NAME} right={PAGE} />
    </Card>
  );
}

/* ─────────── 본문 2 · 중앙 사진 / 글 위 ─────────── */
function EssayBody2Top({ photo = "assets/photo-03.jpg" }) {
  return (
    <Card>
      <EssayHeader />
      <BodyText x={84} y={220} w={912} size={32} weight={500} lineHeight={1.65}>
        {ESSAY_BODY_SHORT}
      </BodyText>
      <div style={{
        position: "absolute", left: 84, top: 580,
        width: 912, height: 580,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxSizing: "border-box",
      }} />
      <CardFooter left={ESSAY_NAME} right={PAGE} />
    </Card>
  );
}

/* ─────────── 본문 2 · 중앙 사진 / 글 아래 ─────────── */
function EssayBody2Bottom({ photo = "assets/photo-01.jpeg" }) {
  return (
    <Card>
      <EssayHeader />
      <div style={{
        position: "absolute", left: 84, top: 210,
        width: 912, height: 580,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxSizing: "border-box",
      }} />
      <BodyText x={84} y={840} w={912} size={32} weight={500} lineHeight={1.65}>
        {ESSAY_BODY_SHORT}
      </BodyText>
      <CardFooter left={ESSAY_NAME} right={PAGE} />
    </Card>
  );
}

/* ─────────── 본문 3 · 풀 이미지 + 글 (위 / 아래) ─────────── */
// Full-bleed photo background + long body paragraph overlaid in white
// with a scrim to keep it legible.
function EssayBody3({ position = "bottom", photo = "assets/photo-02.jpeg" }) {
  const isTop = position === "top";
  // Scrim weighted on the text side
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

      <EssayHeader color="#fff" />

      <div style={{
        position: "absolute",
        left: 84,
        right: 84,
        ...(isTop ? { top: 200 } : { bottom: 200 }),
        fontFamily: CN_FONT,
        fontWeight: 500,
        fontSize: 32,
        lineHeight: 1.65,
        letterSpacing: "-0.04em",
        color: "#fff",
        whiteSpace: "pre-line",
        textShadow: "0 1px 12px rgba(0,0,0,0.35)",
      }}>{ESSAY_BODY3_TEXT}</div>

      <CardFooter left={ESSAY_NAME} right={PAGE} color="#fff" />
    </Card>
  );
}

/* ─────────── 아웃트로 ─────────── */
function EssayOutro() {
  return (
    <Card>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 99,
        textAlign: "center",
        fontFamily: CN_FONT_ARCHIVO, fontSize: 32, fontWeight: 700,
        letterSpacing: "0.16em", color: "#000",
      }}>ESSAY · @OYATLOG</div>

      <div style={{
        position: "absolute", left: 0, right: 0, top: 540,
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          padding: "0 18px",
          background: `linear-gradient(transparent 60%, ${CN_COLORS.neon} 60%)`,
          fontFamily: CN_FONT, fontWeight: 800, fontSize: 88,
          lineHeight: 1.15, letterSpacing: "-0.045em",
        }}>피그마 AI</div>
        <div style={{
          marginTop: 8,
          fontFamily: CN_FONT, fontWeight: 800, fontSize: 88,
          lineHeight: 1.15, letterSpacing: "-0.045em",
        }}>정복기 가능?</div>
        <div style={{
          marginTop: 36,
          fontFamily: CN_FONT, fontWeight: 500, fontSize: 32,
          letterSpacing: "-0.04em", color: "#000",
        }}>이건 그냥 대충 이 정도 느낌</div>
      </div>

      <CardFooter left={ESSAY_NAME} right={PAGE} />
    </Card>
  );
}

Object.assign(window, {
  EssayCover, EssayBody1, EssayBody2Top, EssayBody2Bottom, EssayBody3, EssayOutro,
  ESSAY_NAME, PAGE,
});
