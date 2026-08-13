"use client";

import { useMemo, useState } from "react";
import type { CollectionPoint } from "@/lib/regions";

const TYPES = ["전체", "폐휴대폰", "중소폐가전"] as const;
type TypeFilter = (typeof TYPES)[number];

const TYPE_ICON: Record<string, string> = {
  폐휴대폰: "📱",
  중소폐가전: "🔌",
};

function extractDong(address: string): string {
  const inline = address.match(/(?:시|군|구)\s+([가-힣0-9]{1,4}(동|읍|면|리|가))/);
  if (inline) return inline[1];
  return "기타";
}

function naverMapUrl(address: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address.trim())}`;
}

export default function CollectionPointList({ items }: { items: CollectionPoint[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("전체");
  const [query, setQuery] = useState("");
  const [openDong, setOpenDong] = useState<string | null>(null);

  const typeFiltered = useMemo(
    () => (typeFilter === "전체" ? items : items.filter((i) => i.수거종류 === typeFilter)),
    [items, typeFilter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, CollectionPoint[]>();
    for (const item of typeFiltered) {
      const dong = extractDong(item["수거장소(주소)"]);
      if (!map.has(dong)) map.set(dong, []);
      map.get(dong)!.push(item);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [typeFiltered]);

  const hasQuery = query.trim().length > 0;

  const filteredGrouped = useMemo(() => {
    const q = query.trim();
    if (!q) return grouped;
    return grouped
      .map(([dong, list]): [string, CollectionPoint[]] => [
        dong,
        list.filter(
          (item) =>
            item.상호명.includes(q) ||
            item["수거장소(주소)"].includes(q) ||
            dong.includes(q)
        ),
      ])
      .filter(([, list]) => list.length > 0);
  }, [grouped, query]);

  const hasApartment = typeFiltered.some((i) => i.장소구분.includes("공동주택"));

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="수거종류 선택">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            aria-pressed={typeFilter === t}
            className={
              typeFilter === t
                ? "min-h-12 rounded-xl border-2 border-burgundy bg-burgundy px-5 py-3 text-lg font-bold text-cream"
                : "min-h-12 rounded-xl border-2 border-burgundy bg-cream px-5 py-3 text-lg font-bold text-burgundy hover:bg-burgundy/10"
            }
          >
            {t !== "전체" ? `${TYPE_ICON[t]} ` : ""}
            {t}
          </button>
        ))}
      </div>

      <label htmlFor="point-search" className="sr-only">
        상호명이나 동네 이름으로 검색
      </label>
      <input
        id="point-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="상호명이나 동네 이름으로 검색 (예: 하이마트, 삼성동)"
        className="mt-4 w-full rounded-xl border-2 border-burgundy bg-white px-5 py-4 text-lg font-medium text-charcoal outline-none placeholder:text-zinc-400 focus:border-copper focus:ring-2 focus:ring-copper"
      />

      {hasApartment && (
        <p className="mt-3 rounded-xl border-2 border-copper bg-copper/10 px-4 py-3 text-base font-medium text-charcoal">
          🏢 공동주택(아파트) 수거함은 단지명까지만 확인되며, 외부인 이용이 제한될 수 있습니다.
        </p>
      )}

      <p className="mt-3 text-base font-semibold text-burgundy">
        {grouped.length}개 동네에 총 {typeFiltered.length}곳
      </p>

      <div className="mt-3 space-y-2">
        {filteredGrouped.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-lg text-zinc-500">일치하는 수거함이 없어요.</p>
        )}
        {filteredGrouped.map(([dong, list]) => {
          const isOpen = hasQuery || openDong === dong;
          return (
            <div key={dong} className="overflow-hidden rounded-xl border-2 border-burgundy bg-white">
              <button
                type="button"
                onClick={() => setOpenDong(openDong === dong ? null : dong)}
                aria-expanded={isOpen}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream"
              >
                <span className="min-w-0 break-words text-xl font-bold text-charcoal">{dong}</span>
                <span className="shrink-0 text-lg text-burgundy">
                  {list.length}곳 {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <ul className="divide-y-2 divide-cream border-t-2 border-cream">
                  {list.map((item, i) => (
                    <li key={i}>
                      <a
                        href={naverMapUrl(item["수거장소(주소)"])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 hover:bg-cream"
                      >
                        <p className="text-lg font-bold text-charcoal">
                          {TYPE_ICON[item.수거종류] ?? ""} {item.상호명}
                        </p>
                        <p className="mt-1 text-base text-zinc-600">{item["수거장소(주소)"]}</p>
                        <p className="mt-1 inline-block rounded-full border border-copper px-2 py-0.5 text-sm font-semibold text-copper">
                          {item.장소구분}
                        </p>
                        <p className="mt-1 text-sm font-bold text-copper">네이버지도에서 보기 ↗</p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
