"use client";

import { useMemo, useState } from "react";
import type { RegionSummary } from "@/lib/regions";

export default function RegionSearch({ regions }: { regions: RegionSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().replace(/\s/g, "");
    if (!q) return [];
    return regions.filter((r) => `${r.sido}${r.sigungu}`.includes(q));
  }, [query, regions]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="mt-6">
      <label htmlFor="region-search" className="sr-only">
        동네 이름 검색
      </label>
      <input
        id="region-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="동네 이름으로 검색 (예: 안양, 해운대구)"
        className="w-full rounded-2xl border-2 border-burgundy bg-white px-5 py-5 text-xl font-medium text-charcoal outline-none placeholder:text-zinc-400 focus:border-copper focus:ring-2 focus:ring-copper"
      />

      {hasQuery && (
        <div className="mt-4">
          <p className="text-lg font-bold text-burgundy">{filtered.length}개 지역 찾음</p>
          <div className="mt-2 max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-lg text-zinc-500">일치하는 지역이 없어요.</p>
            )}
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map((r) => (
                <li key={`${r.sido}_${r.sigungu}`}>
                  <a
                    href={`/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`}
                    className="block min-h-12 rounded-xl border-2 border-copper bg-cream px-4 py-3 text-lg font-semibold text-burgundy hover:bg-copper/20"
                  >
                    <span className="block">{r.sigungu}</span>
                    <span className="block text-base font-normal text-zinc-500">{r.sido}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
