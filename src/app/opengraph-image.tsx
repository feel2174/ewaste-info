import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
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
          alignItems: "center",
          justifyContent: "center",
          background: "#6b1e2e",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 140,
            height: 140,
            borderRadius: "9999px",
            background: "#9c5b33",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            width: 100,
            height: 100,
            borderRadius: "9999px",
            background: "#e4d7c3",
          }}
        />
        <div style={{ fontSize: 88, fontWeight: 800, color: "#fbf6ee", display: "flex" }}>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 40, fontWeight: 600, color: "#e4d7c3", display: "flex" }}>
          폐휴대폰 · 폐가전 수거함 위치
        </div>
      </div>
    ),
    { ...size }
  );
}
