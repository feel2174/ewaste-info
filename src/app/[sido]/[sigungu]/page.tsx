import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRegionSummaries, getRegionData } from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import CollectionPointList from "@/components/CollectionPointList";

export async function generateStaticParams() {
  return getAllRegionSummaries().map((r) => ({
    sido: r.sido,
    sigungu: r.sigungu,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}): Promise<Metadata> {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) return { title: "지역 정보 없음" };

  const alias = sidoAlias(sido);
  const aliasSuffix = alias ? `(${alias})` : "";

  const title = `${sido}${aliasSuffix} ${sigungu} 폐가전 수거함 · 폐휴대폰 수거함 위치`;
  const description = `${sido}${aliasSuffix} ${sigungu}의 폐휴대폰·중소폐가전 수거함 위치를 한눈에 확인하세요.`;
  const keywords = [
    `${sido} ${sigungu} 폐가전 수거함`,
    `${sido} ${sigungu} 폐휴대폰 수거함`,
    ...(alias ? [`${alias} ${sigungu} 폐가전 수거함`, `${alias} ${sigungu} 폐휴대폰 수거함`] : []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/${sido}/${sigungu}` },
    openGraph: { title, description, locale: "ko_KR", type: "website" },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) notFound();

  const points = data.e_waste ?? [];
  const alias = sidoAlias(sido);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: sido, item: `${SITE_URL}/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}` },
      { "@type": "ListItem", position: 3, name: sigungu, item: `${SITE_URL}/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}` },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy hover:underline">
          우리동네 폐가전 수거함
        </Link>{" "}
        / {sido} / {sigungu}
      </nav>

      <div className="rounded-2xl bg-burgundy px-6 py-6 text-cream">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {sido} {sigungu}
        </h1>
        <p className="mt-1 text-xl">
          {alias ? `${alias} ${sigungu} ` : ""}폐휴대폰 · 폐가전 수거함
        </p>
      </div>

      <section className="mt-8">
        {points.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-4 text-lg text-zinc-600">등록된 수거함이 없습니다.</p>
        ) : (
          <CollectionPointList items={points} />
        )}
      </section>
    </main>
  );
}
