import type { Metadata } from "next";
import Link from "next/link";
import { getSiteStats, getPlaceFacet } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  BULKY_PICKUP_TEL,
  breadcrumbNode,
  faqNode,
  graph,
  num,
  placePath,
  webPageNode,
  SELL_GUIDE_PATH,
  SELL_GUIDE_URL,
  type Faq,
} from "@/lib/seo";
import BulkyPickup from "@/components/BulkyPickup";
import FaqSection from "@/components/FaqSection";
import GuideLinks from "@/components/GuideLinks";
import JsonLd from "@/components/JsonLd";
import PhoneAd from "@/components/PhoneAd";

const TITLE = "폐휴대폰 버리는 법: 버릴까 팔까? (개인정보 삭제 포함)";
const DESCRIPTION =
  "안 쓰는 폐휴대폰, 수거함에 무료로 버리는 법과 민팃ATM으로 바로 현금 받고 파는 법을 비교합니다. 공장 초기화·USIM 분리 등 배출 전 개인정보 삭제 3단계도 정리했습니다.";

// 개인정보 삭제 단계(HowTo). 화면의 <ol>과 JSON-LD가 같은 문장을 공유한다.
const WIPE_STEPS = [
  {
    name: "중요한 데이터 백업",
    text: "사진·연락처·인증서 등 필요한 자료를 다른 기기나 클라우드에 옮깁니다. 초기화하면 복구할 수 없습니다.",
  },
  {
    name: "계정 로그아웃 후 공장 초기화",
    text: "구글·애플·삼성 계정에서 로그아웃하고 설정에서 '공장 초기화(전체 재설정)'를 실행합니다. 계정이 남아 있으면 다음 사용자가 활성화 잠금에 걸립니다.",
  },
  {
    name: "USIM·SD 카드 분리",
    text: "유심(USIM) 칩과 외장 SD 메모리 카드를 반드시 빼냅니다. 두 카드에는 초기화로 지워지지 않는 정보가 남을 수 있습니다.",
  },
];

const GUIDE_FAQS: Faq[] = [
  {
    q: "폐휴대폰은 그냥 버려도 되나요?",
    a: "일반 쓰레기로 버리면 안 됩니다. 배터리와 기판에 금속·유해물질이 있어 폐전자제품 수거함(민팃ATM, 행정복지센터, 가전 매장 등)에 무료로 넣어야 합니다. 배출 전 공장 초기화와 USIM·SD 카드 분리는 필수입니다.",
  },
  {
    q: "폐휴대폰을 버리지 않고 팔 수도 있나요?",
    a: "네. 민팃ATM은 그 자리에서 기기를 진단해 매입가를 현금으로 주고 데이터를 자동 삭제합니다. 액정·배터리 상태가 괜찮은 폰이면 버리기 전에 매입가를 먼저 확인해 보세요. 가격이 마음에 들지 않으면 돌려받을 수 있습니다.",
  },
  {
    q: "폐휴대폰을 버릴 때 개인정보는 안전한가요?",
    a: "공장 초기화를 하고 USIM과 SD 카드를 분리하면 안전합니다. 계정 로그아웃까지 마치면 다음 사용자가 기기를 활성화할 수 없습니다. 민팃ATM처럼 투입 즉시 데이터를 삭제해 주는 수거함도 있습니다.",
  },
  {
    q: "큰 가전(냉장고·세탁기)은 어디에 버리나요?",
    a: `휴대폰 수거함에는 넣을 수 없습니다. 폐가전 무상방문수거(${BULKY_PICKUP_TEL})에 예약하면 집 앞에서 무료로 가져갑니다.`,
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "폐휴대폰 버리는 법",
    "폐휴대폰 버리는 곳",
    "안쓰는 핸드폰 처리",
    "휴대폰 개인정보 삭제",
    "공장 초기화",
    "민팃 ATM 현금",
    "중고폰 팔기",
  ],
  alternates: { canonical: SELL_GUIDE_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SELL_GUIDE_URL, locale: "ko_KR", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function SellGuidePage() {
  const stats = getSiteStats();
  const mintit = getPlaceFacet("mintit");

  const jsonLd = graph([
    breadcrumbNode(SELL_GUIDE_URL, [
      { name: SITE_NAME, url: SITE_URL },
      { name: "폐휴대폰 버리는 법", url: SELL_GUIDE_URL },
    ]),
    webPageNode({
      url: SELL_GUIDE_URL,
      name: TITLE,
      description: DESCRIPTION,
      type: "WebPage",
      hasBreadcrumb: true,
      dateModified: stats.lastModified,
      keywords: ["폐휴대폰 버리는 법", "휴대폰 개인정보 삭제"],
    }),
    {
      "@type": "HowTo",
      "@id": `${SELL_GUIDE_URL}#wipe`,
      name: "폐휴대폰 배출 전 개인정보 삭제하는 법",
      description: "폐휴대폰을 버리거나 팔기 전에 개인정보를 안전하게 지우는 3단계.",
      step: WIPE_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    faqNode(SELL_GUIDE_URL, GUIDE_FAQS),
  ]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <nav aria-label="현재 위치" className="mb-4 text-lg font-medium text-zinc-600">
        <Link href="/" className="text-burgundy underline underline-offset-4 hover:text-burgundy-dark">
          {SITE_NAME}
        </Link>{" "}
        / <span aria-current="page">폐휴대폰 버리는 법</span>
      </nav>

      <div className="rounded-2xl bg-burgundy px-5 py-6 text-cream sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">폐휴대폰, 버릴까 팔까?</h1>
        <p className="mt-2 text-xl">
          안 쓰는 휴대폰을 무료로 버리는 법과 바로 현금 받고 파는 법을 비교합니다
        </p>
      </div>

      <p className="speakable mt-6 text-lg text-zinc-700">
        안 쓰는 휴대폰은 일반 쓰레기로 버리면 안 되고, 전국{" "}
        <strong>{num(stats.phoneCount)}곳</strong>의 폐휴대폰 수거함에 <strong>무료</strong>로 넣으면
        됩니다. 액정·배터리가 멀쩡한 폰이라면 버리는 대신 민팃ATM에서 그 자리에서 현금을 받고 팔 수도
        있습니다. 어느 쪽이든 배출 전 개인정보 삭제는 꼭 필요합니다.
      </p>

      {/* 두 선택지를 375px에서도 겹치지 않게 세로 카드로 쌓고, 넓은 화면에서만 2열. */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="폐휴대폰 처리 방법">
        <div className="flex flex-col rounded-2xl border-2 border-copper bg-white p-5">
          <p className="text-xl font-extrabold text-burgundy">🗑️ 무료로 버린다</p>
          <p className="mt-2 text-lg text-zinc-700">
            폐전자제품 수거함에 넣으면 끝. 비용은 전혀 없습니다. 민팃ATM·행정복지센터·가전 매장 등에
            설치돼 있습니다.
          </p>
          <ul className="mt-3 space-y-1 text-lg text-zinc-700">
            <li>· 비용: <strong className="text-burgundy">무료</strong></li>
            <li>· 걸리는 시간: 수거함에 투입 즉시</li>
            <li>· 보상: 없음</li>
          </ul>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-burgundy px-4 text-lg font-bold text-burgundy hover:bg-burgundy/10"
          >
            우리동네 수거함 찾기 →
          </Link>
        </div>

        <div className="flex flex-col rounded-2xl border-2 border-burgundy bg-burgundy/5 p-5">
          <p className="text-xl font-extrabold text-burgundy">💰 현금 받고 판다</p>
          <p className="mt-2 text-lg text-zinc-700">
            민팃ATM은 기기를 그 자리에서 진단해 매입가를 현금으로 주고, 투입 즉시 데이터를 자동
            삭제합니다. 가격이 안 맞으면 되돌려 받습니다.
          </p>
          <ul className="mt-3 space-y-1 text-lg text-zinc-700">
            <li>· 비용: 무료</li>
            <li>· 걸리는 시간: ATM에서 5~10분</li>
            <li>· 보상: <strong className="text-burgundy">기기 상태만큼 현금</strong></li>
          </ul>
          {mintit && (
            <Link
              href={placePath("mintit")}
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-burgundy px-4 text-lg font-bold text-cream hover:bg-burgundy-dark"
            >
              전국 민팃ATM {num(mintit.total)}곳 보기 →
            </Link>
          )}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="wipe-heading">
        <h2 id="wipe-heading" className="text-2xl font-bold text-burgundy">
          배출 전 개인정보 삭제 3단계
        </h2>
        <ol className="mt-4 space-y-3">
          {WIPE_STEPS.map((s, i) => (
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

      <BulkyPickup />

      <PhoneAd />

      <FaqSection faqs={GUIDE_FAQS} heading="폐휴대폰 처리 자주 묻는 질문" />

      <GuideLinks exclude={SELL_GUIDE_PATH} heading="다른 버리는 법 가이드" />

      <p className="mt-10 text-lg">
        <Link href="/" className="font-bold text-burgundy hover:underline">
          ← 우리동네 폐가전 수거함 위치 찾으러 가기
        </Link>
      </p>
    </main>
  );
}
