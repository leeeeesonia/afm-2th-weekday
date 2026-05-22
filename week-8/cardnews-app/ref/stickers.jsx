// stickers.jsx — reusable on-card sticker elements
//
// Updated per user feedback:
//   • BrandInsightCloud → simple blob, NEON green fill, NO border
//   • SubSticker → rice-grain pointed oval (3 color combos)
//   • SubInfo → 5% overlap, bottom rendered BEHIND (lower z), 3-line in ㄷ shape (left / right ver)

/* ─── Question box (thin, sized to text) ─── */
function QuestionBox({ children = "Q. 무슨 일을 하는 사람인가요?", w = "auto", padX = 28, padY = 22, size = 38 }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: CN_COLORS.white,
      border: `3px solid ${CN_COLORS.black}`,
      padding: `${padY}px ${padX}px`,
      width: w,
      boxSizing: "border-box",
    }}>
      <span style={{
        fontFamily: CN_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.04em",
        lineHeight: 1.3,
        color: CN_COLORS.black,
        whiteSpace: "nowrap",
      }}>{children}</span>
    </div>
  );
}

/* ─── Question-middle (centered, padded) ─── */
function QuestionMiddle({ children = "Q. 무슨 일을 하는 사람인가요?", w = 720, size = 42 }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: CN_COLORS.white,
      border: `3px solid ${CN_COLORS.black}`,
      width: w,
      minHeight: 200,
      padding: "60px 50px",
      boxSizing: "border-box",
    }}>
      <span style={{
        fontFamily: CN_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.04em",
        lineHeight: 1.4,
        color: CN_COLORS.black,
        textAlign: "center",
        whiteSpace: "pre-line",
      }}>{children}</span>
    </div>
  );
}

/* ─── Standard-middle (wide answer box, fixed width, height grows with text) ─── */
function StandardMiddle({ children, w = 903, size = 30 }) {
  return (
    <div style={{
      width: w,
      background: CN_COLORS.white,
      border: `3px solid ${CN_COLORS.black}`,
      padding: "60px 40px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        fontFamily: CN_FONT,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.55,
        letterSpacing: "-0.04em",
        color: CN_COLORS.black,
        textAlign: "center",
        whiteSpace: "pre-line",
      }}>{children}</div>
    </div>
  );
}

/* ─── Sub-frame (white / neon / lemon) ─── */
function SubFrame({ children, variant = "white", w = "auto", size = 28 }) {
  const bg = variant === "neon" ? CN_COLORS.neon
    : variant === "lemon" ? CN_COLORS.lemon
    : CN_COLORS.white;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: bg,
      border: `3px solid ${CN_COLORS.black}`,
      padding: "22px 28px",
      width: w,
      boxSizing: "border-box",
    }}>
      <div style={{
        fontFamily: CN_FONT,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.5,
        letterSpacing: "-0.04em",
        color: CN_COLORS.black,
        textAlign: "center",
        whiteSpace: "pre-line",
      }}>{children}</div>
    </div>
  );
}

/* ─── Sub-info — lemon, 1-3 line stacked overlap ───
   • 15% overlap between adjacent boxes (85% of each box visible)
   • bottom box rendered FIRST (lowest z-index)
   • 3-line: ㄷ shape — "left" = top/bottom at left, middle shifts right
                       "right" = top/bottom at right, middle shifts left
*/
function SubInfo({ lines = ["무슨 일을 하는 사람인가요?"], size = 28, stagger = "left", padX = 22, padY = 14 }) {
  const n = Math.min(lines.length, 3);
  // Approx box height for the chosen font size (visible part = ~85%)
  const boxH = Math.round(size * 1.5 + padY * 2);   // height of a single line box
  const overlapY = Math.round(boxH * 0.15);          // 15% of height overlaps with next
  const stepY = boxH - overlapY;                     // vertical step between lines
  const indent = Math.round(size * 1.4);             // horizontal indent for ㄷ shape

  // Layout per index
  function offsetFor(i) {
    if (n === 1) return { x: 0, y: 0 };
    if (n === 2) return { x: i === 0 ? 0 : indent / 2, y: i * stepY };
    // n === 3 — ㄷ shape
    if (stagger === "left") {
      // top(0) left, middle(1) right, bottom(2) left
      const x = i === 1 ? indent : 0;
      return { x, y: i * stepY };
    } else {
      // right ver — top right, middle left, bottom right
      const x = i === 1 ? 0 : indent;
      return { x, y: i * stepY };
    }
  }

  // Compute bounding box so the component takes proper layout space
  let maxRight = 0;
  const placements = lines.slice(0, n).map((t, i) => ({ t, ...offsetFor(i) }));
  // estimate box width from text length — text-driven, but ok for layout
  const approxBoxW = (txt) => Math.max(220, txt.length * (size * 0.55) + padX * 2);
  placements.forEach(p => {
    const w = approxBoxW(p.t);
    if (p.x + w > maxRight) maxRight = p.x + w;
  });
  const totalH = (n - 1) * stepY + boxH;

  return (
    <div style={{ position: "relative", width: maxRight, height: totalH, display: "inline-block" }}>
      {/* render bottom-to-top so lower indices end up in front  →  reverse the array */}
      {[...placements].reverse().map((p, idx) => {
        // p.y / p.x are world offsets; place via absolute
        return (
          <div key={idx} style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: CN_COLORS.lemon,
            border: `3px solid ${CN_COLORS.black}`,
            padding: `${padY}px ${padX}px`,
            fontFamily: CN_FONT,
            fontWeight: 500,
            fontSize: size,
            letterSpacing: "-0.04em",
            color: CN_COLORS.black,
            whiteSpace: "nowrap",
            boxSizing: "border-box",
          }}>{p.t}</div>
        );
      })}
    </div>
  );
}

/* ─── Sub-sticker — smooth ellipse (border-radius: 50%) ─── */
// Matches Figma Ellipse 12 / Group 1 reference: w=89, h=55, border-radius:50%
// Pretendard Medium text.
//   black → bg black, neon green text, no border
//   lemon → bg lemon, black text, 3pt black border
//   neon  → bg neon,  black text, 3pt black border
function SubSticker({ children = "#1", w = 90, h = 56, variant = "black", size = 28 }) {
  const palette = {
    black: { bg: CN_COLORS.black, color: CN_COLORS.neon,  border: "none" },
    lemon: { bg: CN_COLORS.lemon, color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
    neon:  { bg: CN_COLORS.neon,  color: CN_COLORS.black, border: `3px solid ${CN_COLORS.black}` },
  }[variant] ?? { bg: CN_COLORS.black, color: CN_COLORS.neon, border: "none" };

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: w, height: h,
      background: palette.bg,
      border: palette.border,
      borderRadius: "50%",        // ← smooth ellipse, matches Figma ref
      boxSizing: "border-box",
      fontFamily: CN_FONT,
      fontWeight: 500,            // Pretendard Medium
      fontSize: size,
      letterSpacing: "-0.02em",
      color: palette.color,
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

/* ─── Brand Insight cloud sticker — neon green, NO border, simple blob ─── */
// Per reference: rounder, no outline, single-color neon green blob.
function BrandInsightCloud({ children = "Brand Insight", size = 28, padX = 56, padY = 22 }) {
  // Estimate sizing from text. Use a generous multiplier so wide capitals
  // (M, W) and the › symbol don't clip past the blob edges.
  const approxTextW = String(children).length * (size * 0.66);
  const w = Math.round(approxTextW + padX * 2);
  const h = Math.round(size * 1.55 + padY * 2);

  // Simple 3-bump organic blob path, normalized to 200×100 viewbox
  // Top has 2 soft bumps, bottom one big bump — gives it a "cloud-y" feel
  // No stroke, just neon fill
  const vbW = 200, vbH = 100;
  const d = `
    M 12 50
    C 8 28, 28 12, 50 18
    C 56 4, 96 0, 110 16
    C 130 6, 168 14, 178 36
    C 198 44, 198 70, 178 80
    C 168 96, 132 100, 116 88
    C 96 102, 60 96, 50 84
    C 22 90, 4 72, 12 50 Z
  `;

  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: w,
      height: h,
    }}>
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="none"
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <path d={d} fill={CN_COLORS.neon} />
      </svg>
      <span style={{
        position: "relative",
        fontFamily: CN_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.02em",
        color: CN_COLORS.black,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}>{children}</span>
    </div>
  );
}

Object.assign(window, {
  QuestionBox, QuestionMiddle, StandardMiddle,
  SubFrame, SubInfo, SubSticker, BrandInsightCloud,
});
