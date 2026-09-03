import type { MetadataRoute } from "next";
import { getAllRegionSummaries, getSidoSummaries, getSiteStats } from "@/lib/regions";
import { SITE_URL as baseUrl } from "@/lib/site";
import { regionUrl, sidoUrl } from "@/lib/seo";

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

  return [home, ...sidoPages, ...regionPages];
}
