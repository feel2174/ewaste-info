// zucca100 "우리동네" 묶음의 형제 사이트로 가는 교차 링크.
// 세 사이트(dongne-info·ewaste-info·parking-for-all)는 지역 키(시도/시군구)가 같아서
// 같은 지역 페이지로 바로 연결한다. 서버 렌더 <a>라 최초 HTML에 포함된다.
export const SIBLINGS = [
  {
    name: "우리동네 생활정보",
    url: "https://dongne-info.zucca100.com",
    topic: "재활용 쓰레기 버리는 날·종량제봉투 파는 곳",
  },
  {
    name: "우리동네 주차장 정보",
    url: "https://parking-for-all.zucca100.com",
    topic: "공영주차장·거주자우선주차구역",
  },
];

// ponytail: 이 4개 지역은 ewaste 데이터에만 있고(개편 전 행정구역명) 형제 사이트엔 페이지가 없어
// 형제 사이트 홈으로 보낸다. 지역 데이터를 갱신하면 세 사이트의 data/by_region 파일명을 다시 비교할 것.
const NOT_IN_SIBLINGS = new Set([
  "경상남도_의창구",
  "경상북도_군위군",
  "세종특별자치시_장군",
  "인천광역시_남구",
]);

export default function SiblingSites({ sido, sigungu }: { sido: string; sigungu: string }) {
  const hasSiblingPage = !NOT_IN_SIBLINGS.has(`${sido}_${sigungu}`);
  const path = hasSiblingPage ? `/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}` : "";

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-burgundy break-keep">
        🏘️ {sido} {sigungu} 생활정보 더보기
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {SIBLINGS.map((s) => (
          <li key={s.url}>
            <a
              href={`${s.url}${path}`}
              className="block rounded-2xl border-2 border-burgundy/20 bg-white p-5 transition-colors hover:border-burgundy"
            >
              <span className="block text-lg font-bold text-zinc-900 break-keep">
                {hasSiblingPage ? `${sigungu} ${s.topic}` : `전국 ${s.topic}`}
              </span>
              <span className="mt-1 block text-base text-zinc-600">{s.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
