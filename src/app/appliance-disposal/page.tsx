import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  APPLIANCE_GUIDE_PATH,
  APPLIANCE_GUIDE_URL,
  BULKY_GUIDE_PATH,
  breadcrumbNode,
  faqNode,
  graph,
  webPageNode,
  type Faq,
} from "@/lib/seo";
import BulkyPickup from "@/components/BulkyPickup";
import FaqSection from "@/components/FaqSection";
import GuideLinks from "@/components/GuideLinks";
import JsonLd from "@/components/JsonLd";

const TITLE = "소형 가전 버리는 법: 전자레인지·밥솥·선풍기·청소기";
const DESCRIPTION =
  "전자레인지, 전기밥솥, 선풍기, 청소기, 드라이어, 노트북 같은 소형 가전 버리는 법을 품목별로 정리했습니다. 수거함에 넣는 것과 무상방문수거를 구분하세요.";

// 품목별 배출 분류. 수거함 투입구에 들어가면 무료 수거함, 아니면 방문수거/대형폐기물.
const ITEMS: { name: string; how: "수거함" | "방문수거"; note: string }[] = [
  { name: "드라이어·고데기", how: "수거함", note: "투입구에 들어가는 소형" },
  { name: "전기밥솥·토스터", how: "수거함", note: "소형이면 수거함 가능" },
  { name: "선풍기(탁상·소형)", how: "수거함", note: "큰 스탠드형은 방문수거" },
  { name: "다리미·전기포트", how: "수거함", note: "소형 생활가전" },
  { name: "청소기(핸디·소형)", how: "수거함", note: "대형 캐니스터는 방문수거" },
  { name: "노트북·태블릿", how: "수거함", note: "데이터 삭제 후 배출" },
  { name: "전자레인지", how: "방문수거", note: "투입구보다 커 수거함 불가" },
  { name: "전기장판·온수매트", how: "방문수거", note: "부피가 커 방문수거" },
  { name: "공기청정기·가습기(대형)", how: "방문수거", note: "크기에 따라 방문수거" },
];

const FAQS: Faq[] = [
  {
    q: "전자레인지는 어떻게 버리나요?",
    a: "전자레인지는 수거함 투입구보다 커서 넣을 수 없습니다. 폐가전 무상방문수거(전화 1599-0903, 온라인 15990903.or.kr)에 신청하면 집 앞에서 무료로 가져갑니다. 여러 소형 가전을 함께 내놓으면 같이 수거됩니다.",
  },
  {
    q: "수거함에 넣을 수 있는 소형 가전과 아닌 것은 어떻게 구분하나요?",
    a: "수거함 투입구에 들어가는 크기(드라이어·전기밥솥·선풍기·다리미·소형 청소기 등)는 무료 수거함에 넣으면 됩니다. 투입구보다 큰 전자레인지·전기장판·대형 청소기 등은 무상방문수거를 이용하세요.",
  },
  {
    q: "노트북이나 태블릿도 폐가전 수거함에 넣어도 되나요?",
    a: "네. 다만 버리기 전에 반드시 데이터를 삭제(초기화)하고 저장장치를 분리하세요. 중고 가치가 있으면 중고 매입을 알아보는 것도 방법입니다.",
  },
  {
    q: "소형 가전을 버릴 때 비용이 드나요?",
    a: "폐전자제품 수거함 배출과 E-순환거버넌스 무상방문수거 모두 무료입니다. 별도 스티커나 요금이 필요 없습니다.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "소형가전 버리는 법",
    "작은 가전 버리는 법",
    "전자레인지 버리는 법",
    "전기밥솥 버리는 법",
    "선풍기 버리는 법",
    "청소기 버리는 법",
    "로봇청소기 버리는 법",
    "노트북 버리는 법",
    "모니터 버리는 법",
    "드라이어 버리는 법",
    "가습기 버리는 법",
    "전기장판 버리는 법",
  ],
  alternates: { canonical: APPLIANCE_GUIDE_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: APPLIANCE_GUIDE_URL, locale: "ko_KR", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function ApplianceDisposalPage() {
  const jsonLd = graph([
    breadcrumbNode(APPLIANCE_GUIDE_URL, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "소형 가전 버리는 법", url: APPLIANCE_GUIDE_URL },
    ]),
    webPageNode({
      url: APPLIANCE_GUIDE_URL,
      name: TITLE,
      description: DESCRIPTION,
      type: "WebPage",
      hasBreadcrumb: true,
      keywords: ["소형가전 버리는 법", "전자레인지 버리는 법"],
    }),
    faqNode(APPLIANCE_GUIDE_URL, FAQS),
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        / <span aria-current="page">소형 가전 버리는 법</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">소형 가전, 품목별로 버리는 법</h1>
        <p className="mt-2 text-xl">전자레인지·밥솥·선풍기·청소기, 수거함에 넣을지 방문수거할지 한눈에</p>
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        소형 가전은 <strong>수거함 투입구에 들어가면 무료 수거함</strong>에 넣고, 투입구보다 크면{" "}
        <strong>무상방문수거</strong>를 이용합니다. 드라이어·전기밥솥·선풍기·다리미처럼 작은 가전은
        수거함에, 전자레인지·전기장판처럼 큰 가전은 방문수거로 배출하세요. 어느 쪽이든 비용은 없습니다.
      </p>

      <section className="mt-8" aria-labelledby="table-heading">
        <h2 id="table-heading" className="text-2xl font-bold text-burgundy">
          품목별 배출 방법
        </h2>
        <ul className="mt-4 space-y-2">
          {ITEMS.map((it) => (
            <li
              key={it.name}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-cream bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-lg font-bold text-charcoal">{it.name}</p>
                <p className="text-base text-zinc-600">{it.note}</p>
              </div>
              <span
                className={
                  it.how === "수거함"
                    ? "shrink-0 rounded-full border-2 border-copper bg-copper/10 px-3 py-1 text-base font-bold text-copper"
                    : "shrink-0 rounded-full border-2 border-burgundy bg-burgundy/10 px-3 py-1 text-base font-bold text-burgundy"
                }
              >
                {it.how === "수거함" ? "🔌 수거함" : "🚚 방문수거"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-base text-zinc-600">
          크기는 기준의 예시이며, 실제 투입구 크기에 따라 달라질 수 있습니다.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-burgundy px-5 text-lg font-bold text-cream hover:bg-burgundy-dark"
        >
          우리동네 수거함 위치 찾기 →
        </Link>
        <Link
          href={BULKY_GUIDE_PATH}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-burgundy px-5 text-lg font-bold text-burgundy hover:bg-burgundy/10"
        >
          대형 가전 무상수거 신청 →
        </Link>
      </div>

      <BulkyPickup />

      <FaqSection faqs={FAQS} heading="소형 가전 배출 자주 묻는 질문" />

      <GuideLinks exclude={APPLIANCE_GUIDE_PATH} heading="다른 버리는 법 가이드" />

      <p className="mt-10 text-lg">
        <Link href="/" className="font-bold text-burgundy hover:underline">
          ← 우리동네 폐가전 수거함 위치 찾으러 가기
        </Link>
      </p>
    </main>
  );
}
