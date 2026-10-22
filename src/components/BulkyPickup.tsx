import { BULKY_PICKUP_TEL, BULKY_PICKUP_URL } from "@/lib/seo";

/**
 * 대형 폐가전(냉장고·세탁기·TV 등) 무상방문수거 안내 콜아웃.
 * 수거함에 "넣을 수 없는" 품목을 설명하는 곳 바로 옆에 둬서, 막다른 느낌 없이
 * E-순환거버넌스 온라인 신청·전화로 바로 연결한다.
 */
export default function BulkyPickup() {
  return (
    <aside
      aria-label="대형 폐가전 무상방문수거 안내"
      className="mt-8 rounded-2xl border-2 border-copper bg-copper/10 px-5 py-4"
    >
      <p className="text-lg font-bold text-charcoal break-keep">
        🚚 냉장고·세탁기·TV 같은 대형 가전은 수거함에 넣을 수 없어요
      </p>
      <p className="mt-1 text-lg text-zinc-700">
        E-순환거버넌스 폐가전 무상방문수거를 신청하면 집 앞에서 무료로 가져갑니다.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a
          href={BULKY_PICKUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-burgundy px-5 text-lg font-bold text-cream hover:bg-burgundy-dark"
        >
          무상방문수거 온라인 신청 ↗
        </a>
        <a
          href={`tel:${BULKY_PICKUP_TEL}`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-burgundy px-5 text-lg font-bold text-burgundy hover:bg-burgundy/10"
        >
          ☎ {BULKY_PICKUP_TEL}
        </a>
      </div>
    </aside>
  );
}
