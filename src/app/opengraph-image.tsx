import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
// 2x resolution (120:63 ratio) — vector-sourced, stays crisp when scaled up.
export const size = { width: 2400, height: 1260 };
export const contentType = "image/png";

export default async function Image() {
  const [extrabold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/pt-extrabold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/pt-medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 200px",
          background: "#2A0E15",
          backgroundImage:
            "radial-gradient(circle at 80% 26%, rgba(156,91,51,0.55), transparent 52%), radial-gradient(circle at 12% 98%, rgba(228,215,195,0.14), transparent 46%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 130,
            width: 620,
            height: 620,
            borderRadius: 620,
            background:
              "radial-gradient(circle at 38% 34%, rgba(212,163,115,0.50), rgba(156,91,51,0.06) 62%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 250,
            right: 250,
            width: 420,
            height: 420,
            borderRadius: 420,
            border: "3px solid rgba(228,215,195,0.24)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: 176,
            height: 176,
            borderRadius: 42,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(150deg, #8f2a3b 0%, #6b1e2e 100%)",
            boxShadow: "0 46px 88px rgba(107,30,46,0.6), inset 0 3px 0 rgba(255,255,255,0.35)",
            marginBottom: 52,
            fontFamily: "Pretendard",
            fontWeight: 800,
            fontSize: 104,
            color: "#FBF6EE",
          }}
        >
          폐
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            background: "rgba(156,91,51,0.20)",
            border: "1px solid rgba(228,215,195,0.35)",
            padding: "14px 30px",
            marginBottom: 32,
            fontSize: 40,
            fontFamily: "Pretendard",
            fontWeight: 500,
            color: "#E4D7C3",
          }}
        >
          폐가전 · 폐휴대폰 · 무상 방문수거
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 148,
            fontFamily: "Pretendard",
            fontWeight: 800,
            color: "#FBF6EE",
            letterSpacing: -5,
            lineHeight: 1.06,
            wordBreak: "keep-all",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 58,
            fontFamily: "Pretendard",
            fontWeight: 500,
            color: "#C9B7A3",
            maxWidth: 1600,
            lineHeight: 1.35,
            wordBreak: "keep-all",
          }}
        >
          폐휴대폰 · 폐가전 수거함 위치
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: extrabold, weight: 800, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
