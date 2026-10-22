export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import {
  getAllRegionSummaries,
  getPlaceFacets,
  getSidoSummaries,
  getSiteStats,
} from "@/lib/regions";
import { SITE_URL as baseUrl } from "@/lib/site";
import { placeUrl, regionUrl, sidoUrl, EXTRA_GUIDES, PLACES_HUB_URL, SELL_GUIDE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const stats = getSiteStats();

  const home: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    // 예전에는 빌드 시각(new Date())을 넣어서 데이터가 그대로여도 재배포 때마다
    // 전체 URL의 lastmod가 바뀌었다. 데이터 파일 mtime을 쓰면 실제로 갱신된
    // 지역만 새 lastmod를 갖는다.
    lastModified: stats.lastModified,
    changeFrequency: "weekly",
    priority: 1,
  };

  const sidoPages: MetadataRoute.Sitemap = getSidoSummaries().map((s) => ({
    url: sidoUrl(s.sido),
    lastModified: s.lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const regionPages: MetadataRoute.Sitemap = getAllRegionSummaries().map((r) => ({
    url: regionUrl(r.sido, r.sigungu),
    lastModified: r.lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const placesHub: MetadataRoute.Sitemap[number] = {
    url: PLACES_HUB_URL,
    lastModified: stats.lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  };

  const placePages: MetadataRoute.Sitemap = getPlaceFacets().map((f) => ({
    url: placeUrl(f.slug),
    lastModified: stats.lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const guides: MetadataRoute.Sitemap = [
    SELL_GUIDE_URL,
    ...EXTRA_GUIDES.map((g) => `${baseUrl}${g.path}`),
  ].map((url) => ({
    url,
    lastModified: stats.lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [home, ...sidoPages, ...regionPages, placesHub, ...placePages, ...guides];
}
