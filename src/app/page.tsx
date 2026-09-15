import type { Metadata } from "next";
import { getSidoSummaries, getSiteStats } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  DATA_SOURCE,
  breadcrumbNode,
  faqNode,
  graph,
  homeDescription,
  num,
  sidoUrl,
  siteFaqs,
  webPageNode,
} from "@/lib/seo";
import RegionSearch from "@/components/RegionSearch";
import RegionDirectory from "@/components/RegionDirectory";
import FaqSection from "@/components/FaqSection";
import HeroStats from "@/components/HeroStats";
import JsonLd from "@/components/JsonLd";
import PhoneAd from "@/components/PhoneAd";

export function generateMetadata(): Metadata {
  const stats = getSiteStats();
  const description = homeDescription(stats);

  return {
    description,
    alternates: { canonical: "/" },
    openGraph: { description, url: SITE_URL },
    twitter: { card: "summary_large_image", description },
  };
}

export default function Home() {
  const sidos = getSidoSummaries();
  const stats = getSiteStats();
  const faqs = siteFaqs(stats);

  const description =
    `전국 ${num(stats.regionCount)}개 시군구의 폐휴대폰·중소폐가전 무상 수거함 ${num(stats.pointCount)}곳을 동네 이름으로 찾는 서비스.`;

  const jsonLd = graph([
    breadcrumbNode(SITE_URL, [{ name: SITE_NAME, url: SITE_URL }]),
    {
      ...webPageNode({
        url: SITE_URL,
        name: `${SITE_NAME} | 폐휴대폰 · 폐가전 수거함 위치`,
        description,
        type: "CollectionPage",
        hasBreadcrumb: true,
        dateModified: stats.lastModified,
        keywords: [
          "폐가전 수거함",
          "폐휴대폰 수거함",
          "중소폐가전 배출",
          "폐가전 무상수거",
          "민팃ATM 위치",
        ],
      }),
      mainEntity: { "@id": `${SITE_URL}#sido-list` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}#sido-list`,
      name: "시도별 폐가전 수거함 목록",
      numberOfItems: sidos.length,
      itemListElement: sidos.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${s.sido} 폐가전 수거함 (${num(s.pointCount)}곳)`,
        url: sidoUrl(s.sido),
      })),
    },
    faqNode(SITE_URL, faqs),
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <div className="rounded-2xl bg-burgundy px-5 py-8 text-center text-cream sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">우리동네 폐가전 수거함</h1>
        <p className="mt-3 text-xl">
          폐휴대폰, 폐가전 버리는 수거함 위치를 동네 이름으로 찾아보세요
        </p>
        <HeroStats
          items={[
            { label: "시군구", value: num(stats.regionCount) },
            { label: "수거함", value: `${num(stats.pointCount)}곳` },
            { label: "이용요금", value: "무료" },
          ]}
        />
      </div>

      <h2 className="mt-8 text-center text-2xl font-bold text-burgundy">지역을 검색해보세요</h2>
      <RegionSearch regions={sidos.flatMap((s) => s.regions)} />

      {/* 검색·목록만 있으면 페이지에 고유 텍스트가 거의 없어 AI 검색·스니펫이 인용할
          문장이 없다. 숫자와 출처가 들어간, 문맥 없이도 성립하는 요약 문단을 둔다. */}
      <section className="mt-10" aria-labelledby="intro-heading">
        <h2 id="intro-heading" className="text-2xl font-bold text-burgundy">
          전국 폐가전 수거함 {num(stats.pointCount)}곳
        </h2>
        <p className="speakable mt-3 text-lg text-zinc-700">
          {SITE_NAME}은 {DATA_SOURCE} 공공데이터를 가공해, 전국{" "}
          <strong>{stats.sidoCount}개 시도 {num(stats.regionCount)}개 시군구</strong>에 설치된 폐전자제품
          수거함 <strong>{num(stats.pointCount)}곳</strong>의 위치를 보여 줍니다. 이 가운데 폐휴대폰
          수거함이 {num(stats.phoneCount)}곳, 중소폐가전 수거함이 {num(stats.applianceCount)}곳이며,
          등록된 수거함은 <strong>모두 무상</strong>으로 이용할 수 있습니다.
        </p>
        <ul className="mt-4 space-y-2 text-lg text-zinc-700">
          <li>
            <strong className="text-burgundy">📱 폐휴대폰</strong> — 스마트폰·피처폰은 민팃ATM, 통신사
            대리점, 행정복지센터에 설치된 수거함에 넣습니다. 배출 전 공장 초기화와 USIM·SD 카드 분리는
            필수입니다.
          </li>
          <li>
            <strong className="text-burgundy">🔌 중소폐가전</strong> — 드라이어, 전기밥솥, 선풍기,
            청소기처럼 수거함 투입구에 들어가는 소형 가전이 대상입니다.
          </li>
          <li>
            <strong className="text-burgundy">🚚 대형 폐가전</strong> — 냉장고·세탁기·에어컨·TV는
            수거함에 넣을 수 없습니다. 폐가전 무상방문수거(
            <a href="tel:1599-0903" className="font-bold text-burgundy underline underline-offset-4">
              1599-0903
            </a>
            )에 예약하면 무료로 가져갑니다.
          </li>
        </ul>
      </section>

      <PhoneAd />

      <section className="mt-10" aria-labelledby="directory-heading">
        <h2 id="directory-heading" className="text-2xl font-bold text-burgundy">
          시도별 전체 지역 보기
        </h2>
        <p className="mt-2 text-lg text-zinc-700">
          시도 이름을 누르면 해당 시도의 시군구 목록이, 시군구를 누르면 수거함 주소가 나옵니다. 지역
          이름 옆 숫자는 등록된 수거함 개수입니다.
        </p>
        <RegionDirectory sidos={sidos} />
      </section>

      <FaqSection faqs={faqs} heading="자주 묻는 질문" />
    </main>
  );
}
