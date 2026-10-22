import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  BATTERY_GUIDE_PATH,
  BATTERY_GUIDE_URL,
  breadcrumbNode,
  faqNode,
  graph,
  webPageNode,
  type Faq,
} from "@/lib/seo";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";

const TITLE = "폐건전지·폐형광등 버리는 법: 전용 수거함 분리배출";
const DESCRIPTION =
  "다 쓴 건전지, 보조배터리, 형광등·LED는 일반 쓰레기로 버리면 안 됩니다. 아파트·행정복지센터의 전용 수거함에 분리배출하는 방법을 정리했습니다.";

const FAQS: Faq[] = [
  {
    q: "다 쓴 건전지는 어디에 버리나요?",
    a: "폐건전지는 일반 종량제봉투에 버리면 안 되고, 아파트 단지나 주민센터·행정복지센터에 설치된 폐건전지 전용 수거함에 넣어야 합니다. 수은·중금속이 들어 있어 분리 배출과 재활용이 필요합니다.",
  },
  {
    q: "보조배터리나 소형 2차전지도 전용 수거함에 버리나요?",
    a: "네. 보조배터리, 휴대폰·노트북에서 분리한 리튬 배터리 같은 소형 2차전지도 폐건전지 수거함에 배출합니다. 부풀거나 손상된 배터리는 합선·화재 위험이 있으니 단자를 테이프로 감싸 배출하세요.",
  },
  {
    q: "형광등과 LED 전구는 어떻게 버리나요?",
    a: "형광등은 수은이 들어 있어 폐형광등 전용 수거함(아파트·주민센터)에 깨지지 않게 배출합니다. LED 전구는 수은이 없어 지자체 안내에 따라 배출하며, 깨진 형광등은 신문지 등에 싸서 전용함에 넣습니다.",
  },
  {
    q: "전용 수거함은 어디에 있나요?",
    a: "대부분의 아파트 단지, 주민센터·행정복지센터, 일부 대형마트에 폐건전지·폐형광등 수거함이 설치돼 있습니다. 정확한 위치는 거주지 시·군·구청이나 관리사무소에 문의하면 안내받을 수 있습니다.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "폐건전지 버리는 법",
    "건전지 버리는 곳",
    "형광등 버리는 법",
    "보조배터리 버리는 법",
    "폐형광등 수거함",
    "소형 2차전지 배출",
  ],
  alternates: { canonical: BATTERY_GUIDE_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: BATTERY_GUIDE_URL, locale: "ko_KR", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function BatteryLampDisposalPage() {
  const jsonLd = graph([
    breadcrumbNode(BATTERY_GUIDE_URL, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "폐건전지·형광등 버리는 법", url: BATTERY_GUIDE_URL },
    ]),
    webPageNode({
      url: BATTERY_GUIDE_URL,
      name: TITLE,
      description: DESCRIPTION,
      type: "WebPage",
      hasBreadcrumb: true,
      keywords: ["폐건전지 버리는 법", "형광등 버리는 법"],
    }),
    faqNode(BATTERY_GUIDE_URL, FAQS),
  ]);

  const rows = [
    { item: "🔋 폐건전지", where: "폐건전지 전용 수거함 (아파트·주민센터)", warn: "종량제봉투 금지" },
    { item: "🔌 보조배터리·소형 2차전지", where: "폐건전지 수거함", warn: "단자를 테이프로 감싸기" },
    { item: "💡 형광등", where: "폐형광등 전용 수거함", warn: "깨지지 않게 배출" },
    { item: "💡 LED 전구", where: "지자체 안내에 따라 배출", warn: "수은 없음" },
  ];

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        / <span aria-current="page">폐건전지·형광등 버리는 법</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">폐건전지·폐형광등 버리는 법</h1>
        <p className="mt-2 text-xl">건전지·보조배터리·형광등은 전용 수거함에 분리배출</p>
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        다 쓴 <strong>건전지·보조배터리·형광등</strong>은 일반 쓰레기(종량제봉투)로 버리면 안 됩니다.
        수은·중금속이 들어 있어, 아파트 단지나 주민센터·행정복지센터에 설치된{" "}
        <strong>전용 수거함</strong>에 분리배출해야 합니다.
      </p>

      <section className="mt-8" aria-labelledby="t-heading">
        <h2 id="t-heading" className="text-2xl font-bold text-burgundy">
          품목별 배출 방법
        </h2>
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.item} className="rounded-xl border-2 border-cream bg-white px-4 py-3">
              <p className="text-lg font-bold text-charcoal">{r.item}</p>
              <p className="mt-1 text-lg text-zinc-700">{r.where}</p>
              <p className="mt-1 inline-block rounded-full border border-copper px-2 py-0.5 text-sm font-semibold text-copper">
                {r.warn}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <FaqSection faqs={FAQS} heading="폐건전지·형광등 자주 묻는 질문" />

      <p className="mt-10 text-lg">
        <Link href="/" className="font-bold text-burgundy hover:underline">
          ← 우리동네 폐가전 수거함 위치 찾으러 가기
        </Link>
      </p>
    </main>
  );
}
