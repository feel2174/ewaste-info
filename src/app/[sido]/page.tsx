import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSidoSummaries, getSidoSummary } from "@/lib/regions";
import { shortSido, sidoAlias } from "@/lib/sidoAlias";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  DATA_SOURCE,
  breadcrumbNode,
  faqNode,
  graph,
  num,
  regionPath,
  sidoFaqs,
  sidoMeta,
  sidoPath,
  sidoUrl,
  regionUrl,
  webPageNode,
} from "@/lib/seo";
import FaqSection from "@/components/FaqSection";
import HeroStats from "@/components/HeroStats";
import JsonLd from "@/components/JsonLd";
import PhoneAd from "@/components/PhoneAd";

export function generateStaticParams() {
  return getSidoSummaries().map((s) => ({ sido: s.sido }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[sido]">): Promise<Metadata> {
  const sido = decodeURIComponent((await params).sido);
  const summary = getSidoSummary(sido);
  if (!summary) return { title: "지역 정보 없음", robots: { index: false, follow: true } };

  const alias = sidoAlias(sido);
  const { title, description } = sidoMeta(summary);

  return {
    title,
    description,
    keywords: [
      `${sido} 폐가전 수거함`,
      `${sido} 폐휴대폰 수거함`,
      ...(alias ? [`${alias} 폐가전 수거함`, `${alias} 폐휴대폰 수거함`] : []),
      `${shortSido(sido)} 폐가전 버리는 곳`,
    ],
    alternates: { canonical: sidoPath(sido) },
    openGraph: {
      title,
      description,
      url: sidoUrl(sido),
      locale: "ko_KR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SidoPage({ params }: PageProps<"/[sido]">) {
  const sido = decodeURIComponent((await params).sido);
  const summary = getSidoSummary(sido);
  if (!summary) notFound();

  const alias = sidoAlias(sido);
  const url = sidoUrl(sido);
  const faqs = sidoFaqs(summary);

  const description =
    `${sido} ${summary.regionCount}개 시군구의 폐휴대폰·중소폐가전 무상 수거함 ${num(summary.pointCount)}곳 위치.`;

  const jsonLd = graph([
    breadcrumbNode(url, [
      { name: SITE_NAME, url: SITE_URL },
      { name: sido, url },
    ]),
    {
      ...webPageNode({
        url,
        name: `${sido} 폐가전·폐휴대폰 수거함 위치`,
        description,
        type: "CollectionPage",
        hasBreadcrumb: true,
        dateModified: summary.lastModified,
        keywords: [`${sido} 폐가전 수거함`, `${sido} 폐휴대폰 수거함`],
      }),
      about: {
        "@type": "AdministrativeArea",
        name: sido,
        ...(alias ? { alternateName: alias } : {}),
        containedInPlace: { "@type": "Country", name: "대한민국", alternateName: "KR" },
      },
      mainEntity: { "@id": `${url}#sigungu-list` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#sigungu-list`,
      name: `${sido} 시군구별 폐가전 수거함`,
      numberOfItems: summary.regionCount,
      itemListElement: summary.regions.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${sido} ${r.sigungu} 폐가전 수거함 (${num(r.pointCount)}곳)`,
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
        / <span aria-current="page">{sido}</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {sido} 폐가전 · 폐휴대폰 수거함
        </h1>
        <p className="mt-1 text-xl">
          {alias ? `${alias} ` : ""}
          {summary.regionCount}개 시군구 · 수거함 {num(summary.pointCount)}곳
        </p>
        <HeroStats
          items={[
            { label: "전체", value: `${num(summary.pointCount)}곳` },
            { label: "📱 폐휴대폰", value: `${num(summary.phoneCount)}곳` },
            { label: "🔌 중소폐가전", value: `${num(summary.applianceCount)}곳` },
          ]}
        />
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        {sido}
        {alias ? `(${alias})` : ""}에는 {summary.regionCount}개 시군구에 걸쳐 폐전자제품 수거함{" "}
        <strong>{num(summary.pointCount)}곳</strong>이 설치돼 있습니다. 폐휴대폰 수거함{" "}
        {num(summary.phoneCount)}곳, 중소폐가전 수거함 {num(summary.applianceCount)}곳이며 모두 무상으로
        이용할 수 있습니다. 아래에서 사는 시·군·구를 고르면 수거함 상호명과 주소를 동네별로 볼 수
        있습니다.
      </p>

      <section className="mt-8" aria-labelledby="sigungu-heading">
        <h2 id="sigungu-heading" className="text-2xl font-bold text-burgundy">
          {sido} 시군구별 수거함
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {summary.regions.map((r) => (
            <li key={r.sigungu}>
              <Link
                href={regionPath(r.sido, r.sigungu)}
                className="block min-h-12 rounded-xl border-2 border-copper bg-cream px-4 py-3 text-lg font-semibold text-burgundy hover:bg-copper/20"
              >
                <span className="block">{r.sigungu}</span>
                <span className="block text-lg font-normal text-zinc-600">
                  수거함 {num(r.pointCount)}곳
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PhoneAd />

      <FaqSection faqs={faqs} heading={`${sido} 폐가전 배출 자주 묻는 질문`} />

      <p className="mt-8 text-base text-zinc-600">데이터 출처: {DATA_SOURCE}</p>
    </main>
  );
}
