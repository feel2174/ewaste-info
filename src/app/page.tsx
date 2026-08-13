import { getAllRegionSummaries } from "@/lib/regions";
import RegionSearch from "@/components/RegionSearch";

export default function Home() {
  const regions = getAllRegionSummaries();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-burgundy px-6 py-8 text-center text-cream">
        <h1 className="text-3xl font-extrabold sm:text-4xl">우리동네 폐가전 수거함</h1>
        <p className="mt-3 text-xl">폐휴대폰, 폐가전 버리는 수거함 위치를 동네 이름으로 찾아보세요</p>
      </div>

      <h2 className="mt-8 text-center text-2xl font-bold text-burgundy">지역을 검색해보세요</h2>
      <RegionSearch regions={regions} />
    </main>
  );
}
