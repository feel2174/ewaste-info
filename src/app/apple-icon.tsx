import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6b1e2e",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, color: "#fbf6ee", display: "flex" }}>폐</div>
      </div>
    ),
    { ...size }
  );
}
