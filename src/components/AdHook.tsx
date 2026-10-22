/**
 * 폰가비 광고(PhoneAd) 바로 위에 붙는 후킹 스트립. 폐휴대폰을 버리러 온
 * 맥락("폰 정리")을 "그럼 새 폰은?"으로 이어 받아 광고 클릭을 유도한다.
 * PhoneAd의 <aside> 안 첫 요소로 렌더해 광고와 한 덩어리로 보이게 한다.
 */
export default function AdHook() {
  return (
    <div className="flex items-center gap-2 bg-burgundy px-5 py-3">
      <span aria-hidden="true" className="shrink-0 text-2xl">
        🔥
      </span>
      <p className="text-lg font-extrabold text-cream break-keep">
        폰 정리했으면 바꿀 때! 새 폰은 <span className="text-amber-300">반값 자급제</span>로
      </p>
    </div>
  );
}
