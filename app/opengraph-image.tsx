import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Actionora — Know what needs your attention";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#f7f9fc",
          color: "#0b1736",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: "#0b1736", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
          Actionora
        </div>
        <div style={{ marginTop: 55, fontSize: 68, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.04em", maxWidth: 930 }}>
          Know what needs your attention.
        </div>
        <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#475569", maxWidth: 850 }}>
          Client follow-ups, payments and next actions — in one focused workspace.
        </div>
      </div>
    ),
    { ...size }
  );
}
