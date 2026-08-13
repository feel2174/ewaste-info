import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "전국 시군구별 폐휴대폰·중소폐가전 수거함 위치를 확인하세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#6b1e2e",
    lang: "ko",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
