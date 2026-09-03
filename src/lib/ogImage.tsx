import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * 지역 페이지용 공유 카드. 전 페이지가 같은 기본 이미지를 쓰면 카카오톡·네이버
 * 공유에서 어느 동네인지 구분이 안 되므로, 지역명과 수거함 개수를 넣어 굽는다.
 * 루트 opengraph-image와 같은 색·구성을 유지한다.
 */
export function renderRegionOgImage(opts: {
  heading: string;
  sub: string;
}) {
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
          padding: "0 80px",
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
        <div
          style={{
            fontSize: opts.heading.length > 12 ? 68 : 88,
            fontWeight: 800,
            color: "#fbf6ee",
            display: "flex",
            textAlign: "center",
          }}
        >
          {opts.heading}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 600,
            color: "#e4d7c3",
            display: "flex",
          }}
        >
          {opts.sub}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            fontSize: 28,
            color: "#e4d7c3",
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
