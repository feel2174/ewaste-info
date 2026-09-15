import fs from "node:fs";
import path from "node:path";
import AdImage from "@/components/AdImage";

/**
 * 폰가비 CPA 광고 (텐핑). 폐휴대폰을 버리러 온 사람에게 "새 폰은 중고로" 맥락이 이어진다.
 *
 * - 소재 교체: public/ads/ 에 정사각형 이미지를 넣거나 빼고 다시 빌드하면 끝. 코드 수정 없음.
 * - 표시광고법·구글 정책상 광고임을 화면에 밝히고(“광고” 배지), 링크는 rel="sponsored"로
 *   검색엔진에 유료 링크임을 알린다. 광고 문구는 사이트 JSON-LD에 넣지 않는다.
 */
const AD_URL = "https://iryan.kr/t8g3vmbrn9";
const ADS_DIR = path.join(process.cwd(), "public", "ads");

const KEYWORDS = [
  "폰가비",
  "중고폰",
  "중고폰구매",
  "아이폰공기계",
  "갤럭시공기계",
  "자급제중고폰",
  "자급제아이폰",
  "자급제갤럭시",
];

function adImages() {
  if (!fs.existsSync(ADS_DIR)) return [];
  return fs
    .readdirSync(ADS_DIR)
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .map((f) => `/ads/${f}`);
}

export default function PhoneAd() {
  const srcs = adImages();

  return (
    <aside aria-label="광고" className="mt-12 overflow-hidden rounded-2xl border-2 border-tan bg-white">
      <a
        href={AD_URL}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="group block sm:flex"
      >
        {srcs.length > 0 && (
          <div className="relative aspect-square w-full bg-tan/40 sm:w-60 sm:shrink-0">
            <AdImage srcs={srcs} alt="폰가비 S급 중고폰 · 자급제 아이폰 · 갤럭시 공기계 광고" />
          </div>
        )}
        <div className="flex flex-col p-5">
          <p className="flex items-center gap-2 text-base font-semibold text-zinc-600">
            <span className="rounded border border-zinc-500 px-1.5 text-sm font-bold leading-6">광고</span>
            폐휴대폰 정리하고 새 폰이 필요하다면
          </p>
          <p className="mt-2 text-xl font-bold text-charcoal sm:text-2xl">
            S급 중고 디바이스 최저가구매, 폰가비
          </p>
          <p className="mt-2 text-lg text-zinc-700">
            유통 거품을 뺀 가격에, 초기화와 검수를 마친 아이폰공기계·갤럭시공기계를 판매합니다. 고가
            요금제 대신 자급제아이폰·자급제갤럭시 같은 자급제중고폰을 알아보고 있다면 참고해 보세요.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-base text-blue-800">
            {KEYWORDS.map((k) => (
              <li key={k}>#{k}</li>
            ))}
          </ul>
          <span className="mt-4 inline-flex min-h-12 items-center justify-between gap-3 self-start rounded-xl bg-blue-700 px-5 text-lg font-bold text-white group-hover:bg-blue-800">
            폰가비 상담 신청하기 <span aria-hidden="true">»</span>
          </span>
        </div>
      </a>
    </aside>
  );
}
