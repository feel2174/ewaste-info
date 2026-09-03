import fs from "node:fs";
import path from "node:path";
import { extractArea } from "@/lib/area";
import { SIDO_ORDER } from "@/lib/sidoAlias";

const DATA_DIR = path.join(process.cwd(), "data", "by_region");

export interface CollectionPoint {
  순번: string;
  상호명: string;
  수거종류: string;
  수거방법: string;
  "수거장소(주소)": string;
  장소구분: string;
  수거비용: string;
}

export interface RegionFile {
  e_waste?: CollectionPoint[];
}

export interface RegionSummary {
  sido: string;
  sigungu: string;
  slug: { sido: string; sigungu: string };
  pointCount: number;
  phoneCount: number;
  applianceCount: number;
  /** 데이터 파일 mtime. sitemap의 lastmod를 빌드 시각이 아닌 데이터 갱신 시각에 묶는다. */
  lastModified: Date;
}

export interface SidoSummary {
  sido: string;
  regionCount: number;
  pointCount: number;
  phoneCount: number;
  applianceCount: number;
  lastModified: Date;
  regions: RegionSummary[];
}

export interface RegionStats {
  total: number;
  phoneCount: number;
  applianceCount: number;
  /** 수거함이 나뉘어 있는 동·도로 구역 수 */
  areaCount: number;
  /** 장소구분별 개수, 많은 순 */
  byPlace: { name: string; count: number }[];
  /** 대표 상호명 몇 개 (AEO용 구체 예시) */
  sampleNames: string[];
  allFree: boolean;
}

function parseKey(fileStem: string): { sido: string; sigungu: string } {
  const idx = fileStem.indexOf("_");
  if (idx === -1) return { sido: fileStem, sigungu: fileStem };
  return { sido: fileStem.slice(0, idx), sigungu: fileStem.slice(idx + 1) };
}

let cachedFiles: string[] | null = null;

function listRegionFiles(): string[] {
  if (!cachedFiles) {
    cachedFiles = fs.existsSync(DATA_DIR)
      ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))
      : [];
  }
  return cachedFiles;
}

// data/by_region은 local-data-pipeline의 5개 소스가 함께 쓰는 공유 디렉터리라
// 전체 242개 파일 중 e_waste 키가 있는 건 225개뿐이다. 나머지 17개는 다른
// 소스(parking, waste_info 등)만 들어있는 지역이라, 걸러내지 않으면 "등록된
// 수거함이 없습니다"만 뜨는 빈 페이지가 검색 결과·sitemap·SSG에 그대로
// 노출된다 ("세종특별자치시 없음", "경상북도 영덕군청" 같은 무의미한 이름이나,
// "경기도 남양주"처럼 실제 지역인 "경기도 남양주시"와 검색어가 겹쳐 사용자를
// 막다른 페이지로 보내는 경우 포함). parking-lot의 getAllRegionSummaries와
// 동일하게 이 사이트가 쓰는 키가 있는 지역만 남긴다.
//
// 225개 시군구 페이지 + 17개 시도 페이지를 SSG로 뽑는 동안 페이지마다 242개
// 파일을 다시 읽으면 빌드가 O(n^2)이 되므로 결과를 모듈 스코프에 메모이즈한다.
let cachedSummaries: RegionSummary[] | null = null;

export function getAllRegionSummaries(): RegionSummary[] {
  if (cachedSummaries) return cachedSummaries;

  cachedSummaries = listRegionFiles()
    .map((file) => {
      const stem = file.replace(/\.json$/, "");
      const { sido, sigungu } = parseKey(stem);
      const full = path.join(DATA_DIR, file);
      const raw = fs.readFileSync(full, "utf-8");
      const parsed: RegionFile = JSON.parse(raw);
      const points = parsed.e_waste ? dedupePoints(parsed.e_waste) : [];
      return {
        sido,
        sigungu,
        slug: { sido, sigungu },
        pointCount: points.length,
        phoneCount: points.filter((p) => p.수거종류 === "폐휴대폰").length,
        applianceCount: points.filter((p) => p.수거종류 === "중소폐가전").length,
        lastModified: fs.statSync(full).mtime,
      };
    })
    .filter((r) => r.pointCount > 0);

  return cachedSummaries;
}

let cachedSidoSummaries: SidoSummary[] | null = null;

/** 시도 → 시군구 계층. 홈의 크롤 가능한 전체 색인과 /[sido] 페이지가 함께 쓴다. */
export function getSidoSummaries(): SidoSummary[] {
  if (cachedSidoSummaries) return cachedSidoSummaries;

  const map = new Map<string, RegionSummary[]>();
  for (const r of getAllRegionSummaries()) {
    if (!map.has(r.sido)) map.set(r.sido, []);
    map.get(r.sido)!.push(r);
  }

  cachedSidoSummaries = [...map.entries()]
    .map(([sido, regions]) => {
      regions.sort((a, b) => a.sigungu.localeCompare(b.sigungu, "ko"));
      return {
        sido,
        regionCount: regions.length,
        pointCount: regions.reduce((s, r) => s + r.pointCount, 0),
        phoneCount: regions.reduce((s, r) => s + r.phoneCount, 0),
        applianceCount: regions.reduce((s, r) => s + r.applianceCount, 0),
        lastModified: new Date(
          Math.max(...regions.map((r) => r.lastModified.getTime()))
        ),
        regions,
      };
    })
    .sort((a, b) => {
      // 행정구역 관례 순서(서울→제주)를 따르고, 별칭표에 없는 시도는 뒤로 보낸다.
      const ai = SIDO_ORDER.indexOf(a.sido);
      const bi = SIDO_ORDER.indexOf(b.sido);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.sido.localeCompare(b.sido, "ko");
    });

  return cachedSidoSummaries;
}

export function getSidoSummary(sido: string): SidoSummary | null {
  return getSidoSummaries().find((s) => s.sido === sido) ?? null;
}

/** 전국 합계. 홈/llms.txt의 "인용 가능한 사실" 문장에 쓰인다. */
export function getSiteStats() {
  const sidos = getSidoSummaries();
  const regions = getAllRegionSummaries();
  return {
    sidoCount: sidos.length,
    regionCount: regions.length,
    pointCount: regions.reduce((s, r) => s + r.pointCount, 0),
    phoneCount: regions.reduce((s, r) => s + r.phoneCount, 0),
    applianceCount: regions.reduce((s, r) => s + r.applianceCount, 0),
    lastModified: new Date(
      Math.max(...regions.map((r) => r.lastModified.getTime()))
    ),
  };
}

// 원본 CSV에 상호명+주소+수거종류가 완전히 같은 행이 소수(약 20건) 중복돼
// 있어서 그대로 노출하면 같은 수거함이 목록에 두 번 뜬다. 세 필드 기준으로
// 대표 1건만 남긴다.
function dedupePoints(items: CollectionPoint[]): CollectionPoint[] {
  const seen = new Set<string>();
  const result: CollectionPoint[] = [];
  for (const item of items) {
    const key = `${item.상호명}|${item["수거장소(주소)"]}|${item.수거종류}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function getRegionData(sido: string, sigungu: string): RegionFile | null {
  const file = path.join(DATA_DIR, `${sido}_${sigungu}.json`);
  if (!fs.existsSync(file)) return null;
  const parsed: RegionFile = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (parsed.e_waste) {
    parsed.e_waste = dedupePoints(parsed.e_waste);
  }
  return parsed;
}

export function getRegionLastModified(sido: string, sigungu: string): Date | null {
  return (
    getAllRegionSummaries().find((r) => r.sido === sido && r.sigungu === sigungu)
      ?.lastModified ?? null
  );
}

/** 지역 페이지 본문·FAQ·JSON-LD가 공유하는 집계. */
export function getRegionStats(points: CollectionPoint[]): RegionStats {
  const placeMap = new Map<string, number>();
  const areas = new Set<string>();
  for (const p of points) {
    placeMap.set(p.장소구분, (placeMap.get(p.장소구분) ?? 0) + 1);
    areas.add(extractArea(p["수거장소(주소)"]));
  }

  return {
    total: points.length,
    phoneCount: points.filter((p) => p.수거종류 === "폐휴대폰").length,
    applianceCount: points.filter((p) => p.수거종류 === "중소폐가전").length,
    areaCount: areas.size,
    byPlace: [...placeMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    sampleNames: points.slice(0, 3).map((p) => p.상호명),
    allFree: points.length > 0 && points.every((p) => p.수거비용 === "무상"),
  };
}
