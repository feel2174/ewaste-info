import Link from "next/link";
import type { SidoSummary } from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import { num, regionPath, sidoPath } from "@/lib/seo";

/**
 * 전체 시군구를 시도별로 묶어 항상 서버에서 렌더하는 색인.
 *
 * 기존 홈은 검색어를 입력해야만 지역 링크가 생기는 클라이언트 컴포넌트뿐이라,
 * 크롤러가 받는 HTML에 하위 페이지로 가는 내부 링크가 하나도 없었다(사이트맵에만
 * 존재). 225개 시군구 페이지가 색인은 되더라도 링크 자산을 전혀 못 받는 구조여서,
 * 사람이 쓰기에도 편한 A~Z 색인 형태로 초기 HTML에 링크를 노출한다.
 */
export default function RegionDirectory({ sidos }: { sidos: SidoSummary[] }) {
  return (
    <div className="mt-4 space-y-6">
      {sidos.map((s) => {
        const alias = sidoAlias(s.sido);
        return (
          <section key={s.sido} aria-labelledby={`sido-${s.sido}`}>
            <h3 id={`sido-${s.sido}`} className="text-xl font-bold text-burgundy">
              <Link href={sidoPath(s.sido)} className="hover:underline">
                {s.sido}
                {alias ? ` (${alias})` : ""}
              </Link>{" "}
              <span className="text-base font-normal text-zinc-600">
                {s.regionCount}개 시군구 · 수거함 {num(s.pointCount)}곳
              </span>
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {s.regions.map((r) => (
                <li key={`${r.sido}_${r.sigungu}`}>
                  <Link
                    href={regionPath(r.sido, r.sigungu)}
                    className="block rounded-lg border-2 border-copper bg-cream px-3 py-2 text-lg font-semibold text-burgundy hover:bg-copper/20"
                    title={`${s.sido} ${r.sigungu} 폐가전·폐휴대폰 수거함 ${num(r.pointCount)}곳`}
                  >
                    {r.sigungu}{" "}
                    <span className="font-normal text-zinc-600">{num(r.pointCount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
