"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Region = { sido: string; sigungu: string };

// 시도명 끝 행정 접미사를 떼어 느슨하게 비교한다. BigDataCloud가 "강원특별자치도"
// 또는 "강원도" 어느 쪽을 주더라도 우리 데이터 키와 맞도록.
function stripSido(s: string) {
  return (s || "").replace(/(특별자치도|특별자치시|특별시|광역시|도)$/, "");
}
function sidoMatches(a: string, b: string) {
  const x = stripSido(a);
  const y = stripSido(b);
  return !!x && (x === y || x.startsWith(y) || y.startsWith(x));
}

// 역지오코딩 결과(시도 + 시군구 후보들)를 실제 지역 목록에 맞춘다.
// 내보내서 간단 셀프체크(아래 demo)에서도 재사용한다.
export function matchRegion(
  regions: Region[],
  sido: string,
  sigunguCandidates: string[]
): { kind: "region"; region: Region } | { kind: "sido"; sido: string } | null {
  for (const c of sigunguCandidates) {
    if (!c) continue;
    const hits = regions.filter((r) => r.sigungu === c);
    if (hits.length === 1) return { kind: "region", region: hits[0] };
    if (hits.length > 1) {
      // 동명이군(동구·중구·남구 등)은 시도로 가린다.
      const inSido = hits.find((r) => sidoMatches(r.sido, sido));
      return { kind: "region", region: inSido ?? hits[0] };
    }
  }
  // 시군구를 못 맞췄으면 시도 페이지라도.
  const sidoHit = regions.find((r) => sidoMatches(r.sido, sido));
  return sidoHit ? { kind: "sido", sido: sidoHit.sido } : null;
}

type BdcAdmin = { adminLevel?: number; name?: string };
type BdcResponse = {
  principalSubdivision?: string;
  city?: string;
  locality?: string;
  localityInfo?: { administrative?: BdcAdmin[] };
};

function regionHref(sido: string, sigungu: string) {
  return `/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`;
}

export default function NearMe({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  function locate() {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("이 브라우저에서는 위치 찾기를 지원하지 않아요. 아래에서 직접 선택해 주세요.");
      return;
    }
    setStatus("locating");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=ko`;
          const data: BdcResponse = await fetch(url).then((r) => r.json());
          const admin = data.localityInfo?.administrative ?? [];
          const candidates = [
            ...admin.filter((a) => a.adminLevel === 6).map((a) => a.name ?? ""),
            data.city ?? "",
            data.locality ?? "",
          ];
          const hit = matchRegion(regions, data.principalSubdivision ?? "", candidates);
          if (hit?.kind === "region") {
            router.push(regionHref(hit.region.sido, hit.region.sigungu));
          } else if (hit?.kind === "sido") {
            router.push(`/${encodeURIComponent(hit.sido)}`);
          } else {
            setStatus("error");
            setMessage("현재 위치의 동네를 찾지 못했어요. 아래에서 직접 선택해 주세요.");
          }
        } catch {
          setStatus("error");
          setMessage("위치를 확인하지 못했어요. 잠시 후 다시 시도하거나 아래에서 선택해 주세요.");
        }
      },
      (err) => {
        setStatus("error");
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "위치 접근이 거부됐어요. 아래에서 동네를 직접 선택할 수 있어요."
            : "위치를 가져오지 못했어요. 아래에서 직접 선택해 주세요."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  // 이미 위치 권한을 허용한 사용자는 접속 즉시 우리동네로 보낸다(한 번만).
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const perms = navigator.permissions;
    if (!perms?.query) return;
    perms
      .query({ name: "geolocation" as PermissionName })
      .then((res) => {
        if (res.state === "granted") locate();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={locate}
        disabled={status === "locating"}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-burgundy px-5 py-3 text-xl font-extrabold text-cream hover:bg-burgundy-dark disabled:opacity-70"
      >
        {status === "locating" ? (
          "위치 확인 중…"
        ) : (
          <>
            <span aria-hidden="true">📍</span> 내 위치로 우리동네 수거함 찾기
          </>
        )}
      </button>
      <p className="mt-2 text-center text-base text-zinc-600">
        {status === "error" ? (
          <span className="text-burgundy">{message}</span>
        ) : (
          "위치는 우리동네를 찾는 데에만 쓰이고 저장하지 않아요."
        )}
      </p>
    </div>
  );
}

// ponytail: 매칭 규칙 셀프체크. import.meta나 프레임워크 없이 눈으로 확인.
export function demo() {
  const regions: Region[] = [
    { sido: "서울특별시", sigungu: "강남구" },
    { sido: "부산광역시", sigungu: "중구" },
    { sido: "대구광역시", sigungu: "중구" },
    { sido: "강원특별자치도", sigungu: "춘천시" },
  ];
  const a = matchRegion(regions, "서울특별시", ["강남구", "역삼동"]);
  console.assert(a?.kind === "region" && a.region.sigungu === "강남구", "exact sigungu");
  const b = matchRegion(regions, "대구광역시", ["중구"]);
  console.assert(b?.kind === "region" && b.region.sido === "대구광역시", "동명이군 disambiguate by sido");
  const c = matchRegion(regions, "강원도", ["없는구"]);
  console.assert(c?.kind === "sido" && c.sido === "강원특별자치도", "fallback to sido via alias");
  const d = matchRegion(regions, "제주특별자치도", ["제주시"]);
  console.assert(d === null, "unknown region → null");
}
