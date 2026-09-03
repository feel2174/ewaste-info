import { getSidoSummaries, getSidoSummary } from "@/lib/regions";
import { num } from "@/lib/seo";
import { OG_CONTENT_TYPE, OG_SIZE, renderRegionOgImage } from "@/lib/ogImage";

export const alt = "시도별 폐가전 · 폐휴대폰 수거함 위치";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getSidoSummaries().map((s) => ({ sido: s.sido }));
}

export default async function Image({ params }: { params: Promise<{ sido: string }> }) {
  const sido = decodeURIComponent((await params).sido);
  const summary = getSidoSummary(sido);

  return renderRegionOgImage({
    heading: `${sido} 폐가전 수거함`,
    sub: summary
      ? `${summary.regionCount}개 시군구 · ${num(summary.pointCount)}곳`
      : "폐휴대폰 · 폐가전 수거함 위치",
  });
}
