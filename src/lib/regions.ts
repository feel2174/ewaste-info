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

export function getAllRegionSummaries(): RegionSummary[] {
  return listRegionFiles().map((file) => {
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
  });
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
