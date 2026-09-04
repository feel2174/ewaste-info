import {
  getAllRegionSummaries,
  getRegionData,
  getRegionStats,
  getSidoSummaries,
  getSiteStats,
} from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  homeDescription,
  pageTitle,
  regionMeta,
  regionUrl,
  sidoMeta,
  sidoUrl,
} from "@/lib/seo";

// 데이터가 빌드 타임에만 바뀌므로 sitemap/llms.txt와 같이 정적 파일로 굽는다.
export const dynamic = "force-static";

/**
 * 네이버는 사이트맵과 RSS를 **별개 수집 경로**로 취급한다. sitemap.xml이 이미
 * 있어도 서치어드바이저에 RSS를 따로 제출해야 웹문서 수집 경로가 하나 더 열린다.
 *
 * item의 title/description은 새로 짓지 않고 각 페이지가 실제로 렌더링하는
 * <title>·meta description을 그대로 싣는다(lib/seo.ts의 빌더 공유).
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * RFC-822 날짜. 형식이 틀리면 서치어드바이저가 피드를 반려한다.
 * 빌드 서버의 TZ가 UTC라 toUTCString()을 쓰면 "+0000"이 나오므로,
 * KST만큼 밀어 놓고 UTC 게터로 읽어 +0900을 직접 붙인다.
 */
function rfc822(date: Date): string {
  const d = new Date(date.getTime() + KST_OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${DAYS[d.getUTCDay()]}, ${p(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} +0900`
  );
}

function xml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** CDATA 안에서 "]]>"가 나오면 섹션이 조기 종료되므로 쪼개 준다. */
function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

interface FeedItem {
  title: string;
  url: string;
  description: string;
  lastModified: Date;
}

function itemXml(item: FeedItem): string {
  return [
    "    <item>",
    `      <title>${xml(item.title)}</title>`,
    `      <link>${item.url}</link>`,
    `      <guid isPermaLink="true">${item.url}</guid>`,
    `      <description>${cdata(item.description)}</description>`,
    `      <pubDate>${rfc822(item.lastModified)}</pubDate>`,
    "    </item>",
  ].join("\n");
}

/**
 * 홈 → 시도 → 시군구 순. 전부 검색 수요가 있는 콘텐츠 페이지이고 이 사이트에는
 * 면책조항·약관 같은 별도 고지 페이지가 없어서 제외 대상이 없다. 순서는
 * 검색 수요 우선순위를 그대로 따른다(모든 페이지의 pubDate가 같은 데이터
 * 스냅샷이라 날짜순 정렬은 의미가 없다).
 */
function feedItems(): FeedItem[] {
  const stats = getSiteStats();

  const home: FeedItem = {
    title: HOME_TITLE,
    url: SITE_URL,
    description: homeDescription(stats),
    lastModified: stats.lastModified,
  };

  const sidoItems: FeedItem[] = getSidoSummaries().map((summary) => {
    const { title, description } = sidoMeta(summary);
    return {
      title: pageTitle(title),
      url: sidoUrl(summary.sido),
      description,
      lastModified: summary.lastModified,
    };
  });

  const regionItems: FeedItem[] = getAllRegionSummaries().flatMap((r) => {
    const points = getRegionData(r.sido, r.sigungu)?.e_waste;
    if (!points?.length) return [];
    const { title, description } = regionMeta(r.sido, r.sigungu, getRegionStats(points));
    return [
      {
        title: pageTitle(title),
        url: regionUrl(r.sido, r.sigungu),
        description,
        lastModified: r.lastModified,
      },
    ];
  });

  return [home, ...sidoItems, ...regionItems];
}

export function GET() {
  const items = feedItems();
  const lastBuild = new Date(
    Math.max(...items.map((i) => i.lastModified.getTime()))
  );

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(HOME_TITLE)}</title>`,
    `    <link>${SITE_URL}</link>`,
    `    <description>${cdata(SITE_DESCRIPTION)}</description>`,
    "    <language>ko-KR</language>",
    `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`,
    `    <generator>${xml(SITE_NAME)}</generator>`,
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...items.map(itemXml),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(feed, {
    headers: {
      // vercel.json의 headers는 정적 파일에만 걸리므로 라우트 핸들러에서 직접 준다.
      // 기본값 application/xml로도 대개 통과하지만 서치어드바이저가
      // Content-Type으로 반려하는 사례가 있어 명시한다.
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
