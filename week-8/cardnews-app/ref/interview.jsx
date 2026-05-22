// interview.jsx — Type 4: 인터뷰
//
// Cover copy (all 4 variants):
//   • SELF INTERVIEW (eyebrow)
//   • 브랜드기획자 이수지를 소개합니다. (main title)
//   • 2026 ver (sub-line)
//   • @oyatlog (wordmark)
//
// All 4 covers are FULL-BLEED PHOTO based. No extra labels, Q-boxes, page nrs on cover.

const IV_PAGE = "3 / 10";
const IV_COVER_EYEBROW = "SELF INTERVIEW";
const IV_COVER_TITLE = "브랜드기획자 이수지를\n소개합니다.";
const IV_COVER_SUB = "2026 ver";
const IV_WORDMARK = "@oyatlog";

const IV_A_LONG = `A. 대답은 똑같이 이렇게 하면 되지.
팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!`;

const IV_A_SHORT = `가장 큰 검은깨를 두 배로 더 쓴다고 생각해봐
그러면 상자도 두 배로 커져야지 이거 왜 안 따라옴?`;

/* ─── shared: top-right @oyatlog wordmark — demoted ─── */
function IVTopRight({ color = "#000" }) {
  const subColor = color === "#fff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)";
  return (
    <span style={{
      position: "absolute", right: 84, top: 106,
      fontFamily: CN_FONT_ARCHIVO,
      fontSize: 26, fontWeight: 500,
      letterSpacing: "0.02em",
      lineHeight: 1,
      color: subColor,
    }}>@oyatlog</span>
  );
}

function IVPageOnly({ page = IV_PAGE, color = "#000" }) {
  return (
    <div style={{
      position: "absolute", right: 84, bottom: 84,
      fontFamily: CN_FONT_ARCHIVO,
      fontSize: 28, fontWeight: 500,
      letterSpacing: "0.04em",
      fontVariantNumeric: "tabular-nums",
      color,
    }}>{page}</div>
  );
}

function BottomAnchoredCenter({ bottomY = 1156, children }) {
  return (
    <div style={{
      position: "absolute",
      left: 0, right: 0,
      bottom: CARD_H - bottomY,
      display: "flex",
      justifyContent: "center",
    }}>{children}</div>
  );
}

/* ════════════════════════════════════════════════════════════
   표지 시안 — 모두 풀이미지 기반, 동일 문구
   ════════════════════════════════════════════════════════════ */

/* ─────────── V1 · 풀이미지 + 하단 화이트 카드 (magazine) ─────────── */
// Photo fills entire canvas; bottom card holds only the main title.
// Top-right: 2026 VER. · Bottom-right: @oyatlog
function IVCoverFullCard({ photo = "assets/interview-01.jpeg" }) {
  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />

      {/* Top-left eyebrow */}
      <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">{IV_COVER_EYEBROW}</Eyebrow>

      {/* Top-right: 2026 VER. */}
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
        letterSpacing: "0.08em", lineHeight: 1,
        color: "rgba(255,255,255,0.85)",
      }}>{IV_COVER_SUB.toUpperCase()}.</span>

      {/* bottom white card */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: 420,
        background: "#fff",
        borderTop: `3px solid ${CN_COLORS.black}`,
        padding: "70px 84px 84px",
        boxSizing: "border-box",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: CN_FONT, fontWeight: 800, fontSize: 84,
          lineHeight: 1.12, letterSpacing: "-0.045em",
          whiteSpace: "pre-line",
        }}>{IV_COVER_TITLE}</div>

        {/* Bottom-right @oyatlog (inside the white card area) */}
        <div style={{
          alignSelf: "flex-end",
          fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
          letterSpacing: "0.02em",
          color: "rgba(0,0,0,0.55)",
        }}>{IV_WORDMARK}</div>
      </div>
    </Card>
  );
}

/* ─────────── V2 · 풀이미지 + 모든 텍스트 사진 위 오버레이 ─────────── */
// All text sits on the photo. Bottom-left aligned, white text, soft scrim.
function IVCoverOverlay({ photo = "assets/interview-02.jpeg" }) {
  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {/* bottom scrim */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 800,
        background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)",
      }} />

      <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">{IV_COVER_EYEBROW}</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em", lineHeight: 1,
        color: "rgba(255,255,255,0.7)",
      }}>{IV_WORDMARK}</span>

      {/* bottom-left text block */}
      <div style={{
        position: "absolute", left: 84, right: 84, bottom: 180,
        color: "#fff",
      }}>
        <div style={{
          fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.8)",
          marginBottom: 26,
        }}>{IV_COVER_SUB.toUpperCase()}</div>

        <div style={{
          fontFamily: CN_FONT, fontWeight: 800, fontSize: 92,
          lineHeight: 1.1, letterSpacing: "-0.045em",
          whiteSpace: "pre-line",
          textShadow: "0 2px 18px rgba(0,0,0,0.35)",
        }}>{IV_COVER_TITLE}</div>
      </div>
    </Card>
  );
}

/* ─────────── V3 · 사진 상단 / 텍스트 하단 (가로 split) ─────────── */
// Photo occupies the top portion; text sits on white space below.
// The seam between photo and text is a sharp black 3pt line.
function IVCoverHSplit({ photo = "assets/interview-01.jpeg" }) {
  const photoH = 820;  // photo occupies top portion
  return (
    <Card>
      {/* photo top */}
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0,
        height: photoH,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {/* horizontal black seam */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: photoH,
        height: 3, background: CN_COLORS.black,
      }} />

      {/* top-left eyebrow on photo */}
      <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">{IV_COVER_EYEBROW}</Eyebrow>
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em", lineHeight: 1,
        color: "rgba(255,255,255,0.7)",
      }}>{IV_WORDMARK}</span>

      {/* bottom text area */}
      <div style={{
        position: "absolute", left: 84, right: 84,
        top: photoH + 50, bottom: 70,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: CN_FONT, fontWeight: 800, fontSize: 76,
          lineHeight: 1.12, letterSpacing: "-0.045em",
          whiteSpace: "pre-line",
        }}>{IV_COVER_TITLE}</div>

        <div style={{
          fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
          letterSpacing: "0.08em",
          color: "rgba(0,0,0,0.55)",
        }}>{IV_COVER_SUB.toUpperCase()}</div>
      </div>
    </Card>
  );
}

/* ─────────── V4 · 풀이미지 + 네온 타이틀 박스 (center-TOP) ─────────── */
// MAIN cover. Title box moved to center-top.
// Top-right: 2026 VER. · Bottom-right: @oyatlog
function IVCoverPoster({ photo = "assets/interview-02.jpeg" }) {
  return (
    <Card>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {/* top scrim for eyebrow */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 280,
        background: "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0) 100%)",
      }} />
      {/* bottom scrim for @oyatlog */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 220,
        background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
      }} />

      <Eyebrow x={84} y={99} color="#fff" font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">{IV_COVER_EYEBROW}</Eyebrow>

      {/* Top-right: 2026 VER. */}
      <span style={{
        position: "absolute", right: 84, top: 106,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
        letterSpacing: "0.08em", lineHeight: 1,
        color: "rgba(255,255,255,0.85)",
      }}>{IV_COVER_SUB.toUpperCase()}.</span>

      {/* Title block — moved to center-TOP */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 220,
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          background: CN_COLORS.neon,
          padding: "30px 56px",
          border: `3px solid ${CN_COLORS.black}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: CN_FONT, fontWeight: 800, fontSize: 70,
            lineHeight: 1.1, letterSpacing: "-0.045em",
            whiteSpace: "pre-line",
            color: "#000",
          }}>{IV_COVER_TITLE}</div>
        </div>
      </div>

      {/* Bottom-right @oyatlog */}
      <div style={{
        position: "absolute", right: 84, bottom: 96,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 26, fontWeight: 500,
        letterSpacing: "0.02em",
        color: "rgba(255,255,255,0.9)",
      }}>{IV_WORDMARK}</div>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════
   본문 (변경 없음)
   ════════════════════════════════════════════════════════════ */

function IVBodyA() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Interview</Eyebrow>
      <IVTopRight />

      <div style={{ position: "absolute", left: 84, top: 220 }}>
        <QuestionBox size={38}>Q. 무슨 일을 하는 사람인가요?</QuestionBox>
      </div>

      <BodyText x={84} y={420} w={912} size={32} weight={500} lineHeight={1.7}>
        {IV_A_LONG}
      </BodyText>

      <IVPageOnly />
    </Card>
  );
}

function IVBodyABottom() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Interview</Eyebrow>
      <IVTopRight />

      <div style={{ position: "absolute", left: 84, top: 720 }}>
        <QuestionBox size={38}>Q. 무슨 일을 하는 사람인가요?</QuestionBox>
      </div>

      <BodyText x={84} y={920} w={912} size={32} weight={500} lineHeight={1.7}>
        {IV_A_LONG}
      </BodyText>

      <IVPageOnly />
    </Card>
  );
}

function IVBodyB() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Interview</Eyebrow>
      <IVTopRight />

      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
        <QuestionMiddle w={780} size={42}>Q. 무슨 일을 하는 사람인가요?</QuestionMiddle>
      </div>

      <BottomAnchoredCenter bottomY={1156}>
        <StandardMiddle w={830} size={30}>
{`A. 대답은 똑같이 이렇게 하면 되지.
팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로
니즈를 편하게 답변해주세요!`}
        </StandardMiddle>
      </BottomAnchoredCenter>

      <IVPageOnly />
    </Card>
  );
}

function IVBodyC() {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} weight={700} tracking="0.04em">Interview</Eyebrow>
      <IVTopRight />

      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
        <QuestionMiddle w={780} size={42}>{`Q. 가장 인상 깊었던
프로젝트는 무엇인가요?`}</QuestionMiddle>
      </div>

      <BottomAnchoredCenter bottomY={1156}>
        <StandardMiddle w={830} size={32}>{IV_A_SHORT}</StandardMiddle>
      </BottomAnchoredCenter>

      <IVPageOnly />
    </Card>
  );
}

Object.assign(window, {
  IVCoverFullCard, IVCoverOverlay, IVCoverHSplit, IVCoverPoster,
  IVBodyA, IVBodyABottom, IVBodyB, IVBodyC,
});
