import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlaceFacet, getPlaceFacets, PLACE_FACETS } from "@/lib/regions";
import { shortSido } from "@/lib/sidoAlias";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  DATA_SOURCE,
  breadcrumbNode,
  faqNode,
  graph,
  num,
  placeFaqs,
  placeMeta,
  placePath,
  placeUrl,
  regionPath,
  regionUrl,
  sidoPath,
  SELL_GUIDE_PATH,
  PLACES_HUB_PATH,
  PLACES_HUB_URL,
  webPageNode,
} from "@/lib/seo";
import FaqSection from "@/components/FaqSection";
import HeroStats from "@/components/HeroStats";
import JsonLd from "@/components/JsonLd";
import PhoneAd from "@/components/PhoneAd";

export function generateStaticParams() {
  return PLACE_FACETS.map((f) => ({ place: f.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/place/[place]">): Promise<Metadata> {
  const slug = decodeURIComponent((await params).place);
  const facet = getPlaceFacet(slug);
  if (!facet) return { title: "장소 정보 없음", robots: { index: false, follow: true } };

  const { title, description } = placeMeta(facet);
  return {
    title,
    description,
    keywords: [
      `${facet.label} 폐가전 수거함`,
      `${facet.label} 폐휴대폰`,
      `우리동네 ${facet.label}`,
      `${facet.label} 위치`,
    ],
    alternates: { canonical: placePath(slug) },
    openGraph: { title, description, url: placeUrl(slug), locale: "ko_KR", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PlacePage({ params }: PageProps<"/place/[place]">) {
  const slug = decodeURIComponent((await params).place);
  const facet = getPlaceFacet(slug);
  if (!facet) notFound();

  const url = placeUrl(slug);
  const faqs = placeFaqs(facet);
  const topSido = facet.sidos[0];

  const description =
    `${facet.label}에 설치된 폐휴대폰·중소폐가전 무상 수거함 전국 ${num(facet.total)}곳의 지역별 위치.`;

  const jsonLd = graph([
    breadcrumbNode(url, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "장소별 수거함", url: PLACES_HUB_URL },
      { name: facet.label, url },
    ]),
    {
      ...webPageNode({
        url,
        name: `전국 ${facet.label} 폐가전·폐휴대폰 수거함 위치`,
        description,
        type: "CollectionPage",
        hasBreadcrumb: true,
        keywords: [`${facet.label} 폐가전 수거함`, `${facet.label} 폐휴대폰 수거함`],
      }),
      mainEntity: { "@id": `${url}#regions` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#regions`,
      name: `${facet.label} 수거함이 있는 시군구`,
      numberOfItems: facet.regionCount,
      itemListElement: facet.sidos
        .flatMap((s) => s.regions)
        .slice(0, 100)
        .map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${r.sido} ${r.sigungu} ${facet.label} 수거함 (${num(r.count)}곳)`,
          url: regionUrl(r.sido, r.sigungu),
        })),
    },
    faqNode(url, faqs),
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        /{" "}
        <Link
          href={PLACES_HUB_PATH}
          className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark"
        >
          장소별 수거함
        </Link>{" "}
        / <span aria-current="page">{facet.label}</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          전국 {facet.label} 폐가전 수거함
        </h1>
        <p className="mt-1 text-xl">폐휴대폰 · 중소폐가전 무상 배출 {num(facet.total)}곳</p>
        <HeroStats
          items={[
            { label: "수거함", value: `${num(facet.total)}곳` },
            { label: "시도", value: `${facet.sidoCount}개` },
            { label: "시군구", value: `${num(facet.regionCount)}개` },
          ]}
        />
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        {facet.label}에 설치된 폐전자제품 수거함은 전국 <strong>{num(facet.total)}곳</strong>으로,{" "}
        {facet.sidoCount}개 시도 {num(facet.regionCount)}개 시군구에 있습니다.
        {topSido ? ` ${shortSido(topSido.sido)}가 ${num(topSido.count)}곳으로 가장 많습니다.` : ""}{" "}
        아래에서 사는 지역을 고르면 해당 시군구 수거함의 상호명과 주소를 볼 수 있습니다. 등록된 수거함은
        모두 무상입니다.
      </p>

      {slug === "mintit" && (
        <aside className="mt-6 rounded-2xl border-2 border-copper bg-copper/10 px-5 py-4">
          <p className="text-lg font-bold text-charcoal">💰 쓸 만한 폰이면, 버리기 전에 한 번 더</p>
          <p className="mt-1 text-lg text-zinc-700">
            민팃ATM은 버리는 수거함이자 그 자리에서 매입해 현금으로 주는 기기이기도 합니다.
          </p>
          <Link
            href={SELL_GUIDE_PATH}
            className="mt-3 inline-flex min-h-12 items-center rounded-xl bg-burgundy px-5 text-lg font-bold text-cream hover:bg-burgundy-dark"
          >
            폐휴대폰 버릴까 팔까? 가이드 보기 →
          </Link>
        </aside>
      )}

      {facet.sidos.map((s, i) => (
        <section key={s.sido} className="mt-8" aria-labelledby={`sido-${i}`}>
          <h2 id={`sido-${i}`} className="flex items-baseline justify-between gap-2">
            <Link href={sidoPath(s.sido)} className="text-2xl font-bold text-burgundy hover:underline">
              {s.sido}
            </Link>
            <span className="shrink-0 text-lg font-semibold text-copper">{num(s.count)}곳</span>
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {s.regions.map((r) => (
              <li key={r.sigungu}>
                <Link
                  href={regionPath(r.sido, r.sigungu)}
                  className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-copper bg-cream px-4 py-2 text-lg font-semibold text-burgundy hover:bg-copper/20"
                >
                  {r.sigungu}
                  <span className="font-normal text-zinc-600">{num(r.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <PhoneAd />

      <FaqSection faqs={faqs} heading={`${facet.label} 수거함 자주 묻는 질문`} />

      <nav className="mt-10" aria-label="다른 장소 보기">
        <h2 className="text-2xl font-bold text-burgundy">다른 장소에서 찾기</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {getPlaceFacets()
            .filter((f) => f.slug !== slug)
            .map((f) => (
              <li key={f.slug}>
                <Link
                  href={placePath(f.slug)}
                  className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-burgundy/20 bg-white px-4 py-2 text-lg font-semibold text-burgundy hover:border-burgundy"
                >
                  {f.label}
                  <span className="font-normal text-zinc-600">{num(f.total)}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <p className="mt-8 text-base text-zinc-600">데이터 출처: {DATA_SOURCE}</p>
    </main>
  );
}
