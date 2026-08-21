import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default async function Icon() {
  const bold = await readFile(join(process.cwd(), "assets/fonts/pt-extrabold.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #8f2a3b 0%, #6b1e2e 100%)",
          borderRadius: 11,
          fontFamily: "Pretendard",
          fontSize: 30,
          fontWeight: 800,
          color: "#FBF6EE",
        }}
      >
        폐
      </div>
    ),
    { ...size, fonts: [{ name: "Pretendard", data: bold, weight: 800, style: "normal" }] }
  );
}
