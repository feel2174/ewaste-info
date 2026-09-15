import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllRegionSummaries,
  getRegionData,
  getRegionLastModified,
  getRegionStats,
  getSidoSummary,
} from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import {
  DATA_SOURCE,
  breadcrumbNode,
  faqNode,
  graph,
  num,
  pointItemListNode,
  regionFaqs,
  regionMeta,
  regionPath,
  regionUrl,
  sidoPath,
  sidoUrl,
  webPageNode,
} from "@/lib/seo";
import CollectionPointList from "@/components/CollectionPointList";
import FaqSection from "@/components/FaqSection";
import HeroStats from "@/components/HeroStats";
import JsonLd from "@/components/JsonLd";
import PhoneAd from "@/components/PhoneAd";
import SiblingSites from "@/components/SiblingSites";

export function generateStaticParams() {
  return getAllRegionSummaries().map((r) => ({
    sido: r.sido,
    sigungu: r.sigungu,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[sido]/[sigungu]">): Promise<Metadata> {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data?.e_waste?.length) {
    return { title: "지역 정보 없음", robots: { index: false, follow: true } };
  }

  const stats = getRegionStats(data.e_waste);
  const alias = sidoAlias(sido);
  const { title, description } = regionMeta(sido, sigungu, stats);

  const keywords = [
    `${sido} ${sigungu} 폐가전 수거함`,
    `${sido} ${sigungu} 폐휴대폰 수거함`,
    ...(alias ? [`${alias} ${sigungu} 폐가전 수거함`, `${alias} ${sigungu} 폐휴대폰 수거함`] : []),
    `${sigungu} 폐가전 버리는 곳`,
    `${sigungu} 폐휴대폰 버리는 곳`,
    `${sigungu} 중소폐가전 배출`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: regionPath(sido, sigungu) },
    openGraph: {
      title,
      description,
      url: regionUrl(sido, sigungu),
      locale: "ko_KR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RegionPage({ params }: PageProps<"/[sido]/[sigungu]">) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) notFound();

  const points = data.e_waste ?? [];
  const alias = sidoAlias(sido);
  const stats = getRegionStats(points);
  const url = regionUrl(sido, sigungu);
  const faqs = regionFaqs(sido, sigungu, stats);
  const sidoSummary = getSidoSummary(sido);
  const siblings = (sidoSummary?.regions ?? []).filter((r) => r.sigungu !== sigungu);

  const description =
    `${sido} ${sigungu}의 폐휴대폰·중소폐가전 무상 수거함 ${num(stats.total)}곳 위치와 주소.`;

  const jsonLd = graph([
    // 기존 브레드크럼은 2·3단계가 모두 같은 시군구 URL을 가리켜 계층이 없었다.
    // 시도 페이지가 생겼으므로 홈 → 시도 → 시군구로 실제 경로를 만든다.
    breadcrumbNode(url, [
      { name: SITE_NAME, url: SITE_URL },
      { name: sido, url: sidoUrl(sido) },
      { name: sigungu, url },
    ]),
    {
      ...webPageNode({
        url,
        name: `${sido} ${sigungu} 폐가전·폐휴대폰 수거함 위치`,
        description,
        type: "CollectionPage",
        hasBreadcrumb: true,
        dateModified: getRegionLastModified(sido, sigungu) ?? undefined,
        keywords: [
          `${sido} ${sigungu} 폐가전 수거함`,
          `${sigungu} 폐휴대폰 수거함`,
        ],
      }),
      about: {
        "@type": "AdministrativeArea",
        name: `${sido} ${sigungu}`,
        alternateName: alias ? `${alias} ${sigungu}` : sigungu,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: sido,
          ...(alias ? { alternateName: alias } : {}),
        },
      },
      mainEntity: { "@id": `${url}#points` },
    },
    pointItemListNode(url, `${sido} ${sigungu} 폐전자제품 수거함`, points, sido, sigungu),
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
          href={sidoPath(sido)}
          className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark"
        >
          {sido}
        </Link>{" "}
        / <span aria-current="page">{sigungu}</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {sido} {sigungu} 폐가전 · 폐휴대폰 수거함
        </h1>
        <p className="mt-1 text-xl">
          {alias ? `${alias} ${sigungu} ` : ""}수거함 {num(stats.total)}곳 · 무상 배출
        </p>
        <HeroStats
          items={[
            { label: "전체", value: `${num(stats.total)}곳` },
            { label: "📱 폐휴대폰", value: `${num(stats.phoneCount)}곳` },
            { label: "🔌 중소폐가전", value: `${num(stats.applianceCount)}곳` },
          ]}
        />
      </div>

      {points.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-4 text-lg text-zinc-600">
          등록된 수거함이 없습니다.
        </p>
      ) : (
        <>
          {/* AI 검색·스니펫이 그대로 인용할 수 있도록 지역명과 숫자가 모두 들어간
              자립형 요약 문단. 목록만 있을 때는 이 페이지에 고유 문장이 없었다. */}
          <section className="mt-6" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              {sido} {sigungu} 수거함 요약
            </h2>
            <p className="speakable text-lg text-zinc-700">
              {sido}
              {alias ? `(${alias})` : ""} {sigungu}에는 폐전자제품 수거함{" "}
              <strong>{num(stats.total)}곳</strong>이 있습니다. 폐휴대폰 수거함{" "}
              {num(stats.phoneCount)}곳, 중소폐가전 수거함 {num(stats.applianceCount)}곳이{" "}
              {stats.areaCount}개 동·도로에 나뉘어 설치돼 있으며,{" "}
              {stats.allFree ? "모두 무상으로 이용할 수 있습니다" : "대부분 무상으로 이용할 수 있습니다"}.
            </p>
            <h3 className="mt-4 text-xl font-bold text-burgundy">
              {sigungu} 수거함이 설치된 장소
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {stats.byPlace.map((p) => (
                <li
                  key={p.name}
                  className="rounded-full border-2 border-copper bg-white px-3 py-1 text-base font-semibold text-charcoal"
                >
                  {p.name} {num(p.count)}곳
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8" aria-labelledby="list-heading">
            <h2 id="list-heading" className="text-2xl font-bold text-burgundy">
              {sido} {sigungu} 수거함 위치 전체 목록
            </h2>
            <CollectionPointList items={points} />
          </section>
        </>
      )}

      <PhoneAd />

      <FaqSection faqs={faqs} heading={`${sigungu} 폐가전 배출 자주 묻는 질문`} />

      {siblings.length > 0 && (
        <section className="mt-10" aria-labelledby="nearby-heading">
          <h2 id="nearby-heading" className="text-2xl font-bold text-burgundy">
            {sido}의 다른 지역
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {siblings.map((r) => (
              <li key={r.sigungu}>
                <Link
                  href={regionPath(r.sido, r.sigungu)}
                  className="block rounded-lg border-2 border-copper bg-cream px-3 py-2 text-lg font-semibold text-burgundy hover:bg-copper/20"
                >
                  {r.sigungu}{" "}
                  <span className="font-normal text-zinc-600">{num(r.pointCount)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-lg">
            <Link href={sidoPath(sido)} className="font-bold text-burgundy hover:underline">
              {sido} 전체 수거함 보기 →
            </Link>
          </p>
        </section>
      )}

      <SiblingSites sido={sido} sigungu={sigungu} />

      <p className="mt-8 text-base text-zinc-600">데이터 출처: {DATA_SOURCE}</p>
    </main>
  );
}
