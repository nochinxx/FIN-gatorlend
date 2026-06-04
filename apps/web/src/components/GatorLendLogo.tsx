// Pixel-art GATORLEND wordmark — same 5×7 glyphs as GatorChase animation.
// Renders as an inline SVG so it scales perfectly at any size.

const GLYPHS: Record<string, number[][]> = {
  G: [[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  A: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  N: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  D: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
};

const TEXT = "GATORLEND";
const D = 4;           // dots → viewBox units (1 dot = 4 units)
const GLYPH_W = 5;
const GLYPH_H = 7;
const CHAR_GAP = 2;
const CHAR_STEP = GLYPH_W + CHAR_GAP;

const VB_W = ((TEXT.length - 1) * CHAR_STEP + GLYPH_W) * D; // 244
const VB_H = GLYPH_H * D;                                    // 28

type GatorLendLogoProps = {
  height?: number;
  color?: string;
  style?: React.CSSProperties;
};

export function GatorLendLogo({ height = 36, color = "#ffffff", style }: GatorLendLogoProps) {
  const rects: React.ReactNode[] = [];

  for (let i = 0; i < TEXT.length; i++) {
    const glyph = GLYPHS[TEXT[i]];
    if (!glyph) continue;
    const cx = i * CHAR_STEP * D;

    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < (glyph[r]?.length ?? 0); c++) {
        if (glyph[r][c]) {
          rects.push(
            <rect key={`${i}-${r}-${c}`} x={cx + c * D} y={r * D} width={D} height={D} />
          );
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      height={height}
      width={(VB_W / VB_H) * height}
      fill={color}
      aria-label="GatorLend"
      role="img"
      style={{ display: "block", imageRendering: "pixelated", ...style }}
    >
      {rects}
    </svg>
  );
}
