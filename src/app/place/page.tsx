import type { Metadata } from "next";
import Link from "next/link";
import { getPlaceFacets, getSiteStats } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  DATA_SOURCE,
  breadcrumbNode,
  graph,
  num,
  placePath,
  placeUrl,
  PLACES_HUB_PATH,
  PLACES_HUB_URL,
  webPageNode,
} from "@/lib/seo";
import GuideLinks from "@/components/GuideLinks";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "장소별 폐가전 수거함: 민팃ATM·하이마트·베스트샵·지자체",
  description:
    "폐휴대폰·중소폐가전 수거함을 민팃ATM, 롯데하이마트, 삼성디지털프라자, LG베스트샵, KT대리점, 지자체 등 설치 장소별로 찾아보세요. 우리동네 수거함 위치를 장소 종류로 모아 봅니다.",
  alternates: { canonical: PLACES_HUB_PATH },
  openGraph: { url: PLACES_HUB_URL, locale: "ko_KR", type: "website" },
};

export default function PlacesHubPage() {
  const facets = getPlaceFacets();
  const stats = getSiteStats();

  const jsonLd = graph([
    breadcrumbNode(PLACES_HUB_URL, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "장소별 수거함", url: PLACES_HUB_URL },
    ]),
    {
      ...webPageNode({
        url: PLACES_HUB_URL,
        name: "장소별 폐가전·폐휴대폰 수거함",
        description:
          "폐전자제품 수거함을 민팃ATM·가전 매장·지자체 등 설치 장소 종류별로 모아 보는 색인입니다.",
        type: "CollectionPage",
        hasBreadcrumb: true,
        dateModified: stats.lastModified,
      }),
      mainEntity: { "@id": `${PLACES_HUB_URL}#list` },
    },
    {
      "@type": "ItemList",
      "@id": `${PLACES_HUB_URL}#list`,
      name: "장소 종류별 수거함",
      numberOfItems: facets.length,
      itemListElement: facets.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${f.label} 폐가전 수거함 (${num(f.total)}곳)`,
        url: placeUrl(f.slug),
      })),
    },
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        / <span aria-current="page">장소별 수거함</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">장소별 폐가전 수거함 찾기</h1>
        <p className="mt-2 text-xl">
          민팃ATM, 가전 매장, 지자체 등 수거함이 놓인 장소 종류로 모아 봅니다
        </p>
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        폐휴대폰·중소폐가전 수거함은 주로 민팃ATM, 롯데하이마트·삼성디지털프라자·LG베스트샵 같은 가전
        매장, KT대리점, 구청·행정복지센터 같은 지자체 시설에 설치돼 있습니다. 전국{" "}
        <strong>{num(stats.pointCount)}곳</strong> 가운데 찾는 장소 종류를 아래에서 고르세요.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {facets.map((f) => (
          <li key={f.slug}>
            <Link
              href={placePath(f.slug)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border-2 border-copper bg-cream px-5 py-4 hover:bg-copper/20"
            >
              <span className="min-w-0 text-xl font-bold text-burgundy">{f.label}</span>
              <span className="shrink-0 text-lg font-semibold text-copper">{num(f.total)}곳</span>
            </Link>
          </li>
        ))}
      </ul>

      <GuideLinks />

      <p className="mt-8 text-base text-zinc-600">데이터 출처: {DATA_SOURCE}</p>
    </main>
  );
}
