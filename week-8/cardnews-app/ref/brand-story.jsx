// brand-story.jsx — Type 2: 브랜드 스토리 (UPDATED)
//
//   • Cover: NOVOUND wordmark CENTER-BOTTOM. Top-right shows brand name (text).
//            Page indicator stays on right footer; left text removed.
//   • Body · OVERVIEW: unchanged structure, NOVOUND on bottom-left.
//   • Body · 오버레이 v1: full-bleed bg + 3pt square overlay
//   • Body · 오버레이 v2 (NEW): 2 squares side-by-side + body text below
//   • Body · 오버레이 v3 (NEW): rounded-corner overlay + answer + sub-frame
//   • Selling Point #1, #2: title moved up to match [OVERVIEW] y-position

const BS_PAGE = "3 / 10";
const BS_PROJECT = "푸드웨어 브랜드 '코코라커' DDP POP-UP";
const BS_BRAND = "COCOLOCKER";

/* ─── small helpers ─── */
function BSEyebrow() {
  return <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em">Project Review</Eyebrow>;
}

// Centered NOVOUND wordmark for the cover footer
function NovoundCenterBottom() {
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 96,
      display: "flex", justifyContent: "center",
    }}>
      <img src="assets/novound_logo.png" alt="NOVOUND" style={{ height: 30, display: "block" }} />
    </div>
  );
}

// Brand Story uses Archivo Narrow (formerly Syne)
function BSBrandTopRight({ children = BS_BRAND }) {
  return (
    <span style={{
      position: "absolute", right: 84, top: 106,
      fontFamily: CN_FONT_ARCHIVO,
      fontSize: 26, fontWeight: 500,
      letterSpacing: "0.02em",
      color: "rgba(0,0,0,0.5)",
      lineHeight: 1,
    }}>{children}</span>
  );
}

// NOVOUND wordmark on bottom-left for body cards (page nr stays on right via CardFooter)
function NovoundBottomLeft({ tone = "dark" }) {
  return (
    <img
      src="assets/novound_logo.png"
      alt="NOVOUND"
      style={{
        position: "absolute", left: 84, bottom: 86,
        height: 26, display: "block",
        // If on dark photo, invert so it reads white
        filter: tone === "light" ? "invert(1)" : "none",
      }} />
  );
}

/* ─────────── 표지 ─────────── */
function BSCover() {
  return (
    <Card>
      <BSEyebrow />
      <BSBrandTopRight />

      {/* big neon block accent */}
      <div style={{
        position: "absolute", left: 84, top: 240,
        width: 220, height: 220,
        background: CN_COLORS.neon,
        border: `3px solid ${CN_COLORS.black}`,
      }} />

      <CoverTitle
        x={84}
        y={780}
        w={912}
        title="Color your way!"
        subtitle={BS_PROJECT}
        titleSize={104}
        titleLineHeight={1.05}
      />

      <NovoundCenterBottom />
      {/* Cover: no page indicator (per spec) */}
    </Card>
  );
}

/* ─────────── Body · OVERVIEW ─────────── */
function BSOverview() {
  return (
    <Card>
      <BSEyebrow />
      <BSBrandTopRight />

      <div style={{
        position: "absolute", left: 84, top: 220,
        fontFamily: CN_FONT, fontWeight: 800, fontSize: 36,
        letterSpacing: "-0.04em",
      }}>[OVERVIEW]</div>

      <BodyText x={84} y={300} w={912} size={32} weight={500} lineHeight={1.6}>
        {`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를
편하게 답변해주세요!

어떠한 기획을 가지고 만들었는지 프로젝트의 개요를 적습니다.`}
      </BodyText>

      <div style={{
        position: "absolute", left: 560, top: 720,
        width: 436, height: 436,
        backgroundImage: `url(assets/photo-01.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxSizing: "border-box",
      }} />

      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

/* The bottom of OVERVIEW's overlay image is at y = 720 + 436 = 1156.
   Use this as the standard-middle bottom anchor for Interview B/C. */
const BS_OVERVIEW_IMG_BOTTOM = 1156;
const BS_OVERVIEW_HEADING_TOP = 220;

/* ─────────── Body · Overlay (v1) ─────────── */
function BSOverlay({ bg = "assets/photo-02.jpeg", fg = "assets/photo-01.jpeg" }) {
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

      <BSEyebrow />
      <BSBrandTopRight />

      <div style={{
        position: "absolute", left: 220, top: 350,
        width: 640, height: 640,
        backgroundImage: `url(${fg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      }} />

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 180,
        background: "linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))",
      }} />
      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

/* ─────────── Body · Overlay v2 — 2-image row + body text ─────────── */
function BSOverlayV2({ left = "assets/photo-01.jpeg", right = "assets/photo-02.jpeg" }) {
  const imgY = 320;
  const imgH = 420;
  return (
    <Card>
      <BSEyebrow />
      <BSBrandTopRight />

      <div style={{
        position: "absolute", left: 84, top: imgY,
        width: 422, height: imgH,
        backgroundImage: `url(${left})`,
        backgroundSize: "cover", backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`, boxSizing: "border-box",
      }} />
      <div style={{
        position: "absolute", right: 84, top: imgY,
        width: 422, height: imgH,
        backgroundImage: `url(${right})`,
        backgroundSize: "cover", backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`, boxSizing: "border-box",
      }} />

      <BodyText x={84} y={imgY + imgH + 80} w={912} size={30} weight={500} lineHeight={1.65}>
        {`팝업 플랜을 세분화하기 위해 사전 질문지를 공유드립니다.
추후 견적 및 킥오프 미팅 진행을 위한 정보이므로 니즈를 편하게
답변해주세요!`}
      </BodyText>

      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

/* ─────────── Body · Overlay v3 — rounded-square overlay + answer ─────────── */
function BSOverlayV3({ photo = "assets/photo-03.jpg" }) {
  return (
    <Card>
      <BSEyebrow />
      <BSBrandTopRight />

      {/* upper-right answer paragraph */}
      <BodyText x={84} y={220} w={912} size={30} weight={500} lineHeight={1.6} align="right">
        {`대답은 똑같이 이렇게 하면 되지. 팝업 플랜을 세분화하기 위해
사전 질문지를 공유드립니다. 추후 견적 및 킥오프 미팅 진행을
위한 정보이므로 니즈를 편하게 답변해주세요!`}
      </BodyText>

      {/* rounded-square overlay image */}
      <div style={{
        position: "absolute", left: 290, top: 540,
        width: 500, height: 500,
        backgroundImage: `url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `3px solid ${CN_COLORS.black}`,
        borderRadius: 56,
        boxSizing: "border-box",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }} />

      {/* small sub-frame at bottom-left with sticker comment */}
      <div style={{ position: "absolute", left: 84, top: 1090 }}>
        <SubFrame variant="white" size={22}>
          {`가장 큰 검은깨를 두 배로 더 쓴다고 생각해봐
그러면 상자도 두 배로 커져야지 이거 왜 안 따라옴?`}
        </SubFrame>
      </div>

      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

/* ─────────── Selling Point single ─────────── */
// Headline raised to y=220 to align with [OVERVIEW] of BSOverview.
function BSSellingPoint({ n = 1, headline = "공간감을 극대화한 컬러 무드", body = `브랜드의 시그니처 컬러를 공간 전반에 확장시켜
방문자가 자연스럽게 브랜드 무드에 몰입할 수 있도록
모든 디테일을 일관된 톤으로 설계했습니다.` }) {
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em">{`Selling Point #${n}`}</Eyebrow>
      <BSBrandTopRight />

      <Heading01 x={84} y={BS_OVERVIEW_HEADING_TOP} w={912} size={62}>
        {headline}
      </Heading01>

      <div style={{
        position: "absolute", left: 84, top: BS_OVERVIEW_HEADING_TOP + 200,
        width: 912, height: 3, background: CN_COLORS.black,
      }} />

      <BodyText x={84} y={BS_OVERVIEW_HEADING_TOP + 260} w={912} size={32} weight={500} lineHeight={1.65}>
        {body}
      </BodyText>

      <div style={{
        position: "absolute", left: 84, bottom: 240,
        display: "flex", gap: 12, alignItems: "center",
      }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: i === n ? 56 : 18,
            height: 18,
            background: i === n ? CN_COLORS.neon : "#E8E8E2",
            border: `3px solid ${CN_COLORS.black}`,
            transition: "width .2s",
          }} />
        ))}
      </div>

      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

/* ─────────── Selling Points summary ─────────── */
function BSPointsSummary() {
  const pts = [
    { n: 1, t: "공간감을 극대화한 컬러 무드" },
    { n: 2, t: "체험형 동선 설계" },
    { n: 3, t: "굿즈 · 포토존 연동 전략" },
  ];
  return (
    <Card>
      <Eyebrow x={84} y={99} font={CN_FONT_ARCHIVO} size={32} tracking="0.04em">Selling Points</Eyebrow>
      <BSBrandTopRight />

      <div style={{
        position: "absolute", left: 84, top: 240,
        fontFamily: CN_FONT, fontWeight: 800, fontSize: 64,
        letterSpacing: "-0.045em", lineHeight: 1.1,
      }}>코코라커 DDP{"\n"}성공의 3가지 이유</div>

      <div style={{
        position: "absolute", left: 84, right: 84, top: 600,
        display: "flex", flexDirection: "column", gap: 28,
      }}>
        {pts.map(p => (
          <div key={p.n} style={{
            display: "flex", alignItems: "center", gap: 28,
            paddingBottom: 24,
            borderBottom: `3px solid ${CN_COLORS.black}`,
          }}>
            <div style={{
              fontFamily: CN_FONT, fontWeight: 800, fontSize: 52,
              letterSpacing: "-0.04em", minWidth: 88,
            }}>#{p.n}</div>
            <div style={{
              fontFamily: CN_FONT, fontWeight: 700, fontSize: 40,
              letterSpacing: "-0.04em", lineHeight: 1.3,
            }}>{p.t}</div>
          </div>
        ))}
      </div>

      <NovoundBottomLeft />
      <div style={{
        position: "absolute", right: 84, bottom: 84,
        fontFamily: CN_FONT_ARCHIVO, fontSize: 28, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
      }}>{BS_PAGE}</div>
    </Card>
  );
}

Object.assign(window, {
  BSCover, BSOverview, BSOverlay, BSOverlayV2, BSOverlayV3,
  BSSellingPoint, BSPointsSummary,
  BS_OVERVIEW_IMG_BOTTOM, BS_OVERVIEW_HEADING_TOP,
});
