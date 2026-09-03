import { getAllRegionSummaries, getRegionData, getRegionStats } from "@/lib/regions";
import { num } from "@/lib/seo";
import { OG_CONTENT_TYPE, OG_SIZE, renderRegionOgImage } from "@/lib/ogImage";

export const alt = "시군구별 폐가전 · 폐휴대폰 수거함 위치";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllRegionSummaries().map((r) => ({ sido: r.sido, sigungu: r.sigungu }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const points = getRegionData(sido, sigungu)?.e_waste ?? [];
  const stats = getRegionStats(points);

  return renderRegionOgImage({
    heading: `${sido} ${sigungu}`,
    sub: `폐가전 · 폐휴대폰 수거함 ${num(stats.total)}곳`,
  });
}
