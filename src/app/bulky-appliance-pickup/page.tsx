import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  BULKY_GUIDE_PATH,
  BULKY_GUIDE_URL,
  BULKY_PICKUP_TEL,
  BULKY_PICKUP_URL,
  breadcrumbNode,
  faqNode,
  graph,
  webPageNode,
  type Faq,
} from "@/lib/seo";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";

const TITLE = "대형 폐가전 무상수거 신청 방법: 냉장고·세탁기·에어컨·TV";
const DESCRIPTION =
  "냉장고·세탁기·에어컨·TV 같은 대형 폐가전은 E-순환거버넌스 무상방문수거로 무료로 버립니다. 온라인(15990903.or.kr)·전화(1599-0903) 신청 방법과 대상 품목을 정리했습니다.";

const STEPS = [
  {
    name: "온라인 또는 전화로 신청",
    text: `E-순환거버넌스 무상방문수거 사이트(${BULKY_PICKUP_URL}) 또는 전화(${BULKY_PICKUP_TEL})로 신청합니다. 품목과 수거 희망일, 주소를 입력합니다.`,
  },
  {
    name: "수거 날짜 예약",
    text: "접수 후 방문 가능한 날짜를 안내받아 예약합니다. 대개 신청일로부터 며칠 안에 방문합니다.",
  },
  {
    name: "집 앞에 내놓고 무료 수거",
    text: "예약일에 품목을 집 앞이나 지정한 장소에 내놓으면 수거 기사가 방문해 무료로 가져갑니다. 스티커나 비용이 필요 없습니다.",
  },
];

const FAQS: Faq[] = [
  {
    q: "냉장고·세탁기는 어떻게 무료로 버리나요?",
    a: `냉장고·세탁기·에어컨·TV 같은 대형 폐가전은 E-순환거버넌스 무상방문수거로 무료 배출합니다. 온라인(${BULKY_PICKUP_URL}) 또는 전화(${BULKY_PICKUP_TEL})로 신청하면 예약한 날에 집 앞에서 무료로 수거해 갑니다.`,
  },
  {
    q: "어떤 품목을 무상방문수거로 버릴 수 있나요?",
    a: "냉장고, 세탁기, 에어컨, TV, 건조기, 오디오, 전기오븐 등 대형 가전이 대상입니다. 전자레인지·청소기 같은 소형 가전도 여러 개를 함께 내놓으면 같이 수거됩니다. 정확한 대상은 신청 시 확인하세요.",
  },
  {
    q: "무상방문수거 비용이 정말 무료인가요?",
    a: "네, 무료입니다. 대형폐기물 스티커를 사거나 별도 요금을 낼 필요 없이 E-순환거버넌스가 무료로 수거해 재활용합니다.",
  },
  {
    q: "방문수거가 어려우면 어떻게 하나요?",
    a: "지역이나 상황에 따라 방문이 어려우면, 관할 시·군·구청에 대형폐기물 배출 신고를 하고 수수료를 낸 뒤 스티커를 붙여 지정 장소에 내놓는 방법도 있습니다.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "대형 폐가전 무상수거",
    "냉장고 무료 수거",
    "세탁기 버리는 법",
    "폐가전 무상방문수거 신청",
    "에어컨 버리는 법",
    "TV 버리는 법",
  ],
  alternates: { canonical: BULKY_GUIDE_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: BULKY_GUIDE_URL, locale: "ko_KR", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function BulkyAppliancePickupPage() {
  const jsonLd = graph([
    breadcrumbNode(BULKY_GUIDE_URL, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "대형 폐가전 무상수거 신청", url: BULKY_GUIDE_URL },
    ]),
    webPageNode({
      url: BULKY_GUIDE_URL,
      name: TITLE,
      description: DESCRIPTION,
      type: "WebPage",
      hasBreadcrumb: true,
      keywords: ["대형 폐가전 무상수거", "냉장고 무료 수거"],
    }),
    {
      "@type": "HowTo",
      "@id": `${BULKY_GUIDE_URL}#howto`,
      name: "대형 폐가전 무상방문수거 신청 방법",
      description: "냉장고·세탁기 등 대형 폐가전을 무료로 수거 신청하는 3단계.",
      step: STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    faqNode(BULKY_GUIDE_URL, FAQS),
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        / <span aria-current="page">대형 폐가전 무상수거 신청</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">대형 폐가전 무상수거 신청 방법</h1>
        <p className="mt-2 text-xl">냉장고·세탁기·에어컨·TV를 무료로 집 앞에서 수거</p>
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        냉장고·세탁기·에어컨·TV 같은 <strong>대형 폐가전은 수거함에 넣을 수 없습니다</strong>.
        E-순환거버넌스 <strong>무상방문수거</strong>를 신청하면 스티커나 비용 없이 집 앞에서 무료로
        가져갑니다.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <a
          href={BULKY_PICKUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-burgundy px-5 py-3 text-xl font-extrabold text-cream hover:bg-burgundy-dark"
        >
          무상방문수거 온라인 신청 ↗
        </a>
        <a
          href={`tel:${BULKY_PICKUP_TEL}`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-burgundy px-5 py-3 text-xl font-extrabold text-burgundy hover:bg-burgundy/10"
        >
          ☎ {BULKY_PICKUP_TEL}
        </a>
      </div>

      <section className="mt-10" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-2xl font-bold text-burgundy">
          신청 3단계
        </h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.name} className="flex gap-3 rounded-xl border-2 border-cream bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-burgundy text-xl font-extrabold text-cream">
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-bold text-charcoal">{s.name}</p>
                <p className="mt-1 text-lg text-zinc-700">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <FaqSection faqs={FAQS} heading="대형 폐가전 무상수거 자주 묻는 질문" />

      <p className="mt-10 text-lg">
        <Link href="/" className="font-bold text-burgundy hover:underline">
          ← 우리동네 폐가전 수거함 위치 찾으러 가기
        </Link>
      </p>
    </main>
  );
}
