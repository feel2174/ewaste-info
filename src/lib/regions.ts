import fs from "node:fs";
import path from "node:path";

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
export function getAllRegionSummaries(): RegionSummary[] {
  return listRegionFiles()
    .map((file) => {
      const stem = file.replace(/\.json$/, "");
      const { sido, sigungu } = parseKey(stem);
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
      const parsed: RegionFile = JSON.parse(raw);
      return {
        sido,
        sigungu,
        slug: { sido, sigungu },
        pointCount: parsed.e_waste?.length ?? 0,
      };
    })
    .filter((r) => r.pointCount > 0);
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
