import { getSidoSummaries, getSiteStats } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  BULKY_PICKUP_TEL,
  DATA_SOURCE,
  SITE_DESCRIPTION,
  num,
  regionUrl,
  sidoUrl,
} from "@/lib/seo";

// 데이터가 빌드 타임에만 바뀌므로 정적 파일로 굽는다.
export const dynamic = "force-static";

/**
 * llms.txt — 생성형 검색 엔진/LLM 에이전트가 사이트 구조와 핵심 사실을
 * 한 번에 읽을 수 있게 하는 규약. 구글 검색은 무시하지만 ChatGPT·Perplexity
 * 계열 도구가 참조하며, 사람이 읽어도 사이트 전체 색인 역할을 한다.
 */
export function GET() {
  const stats = getSiteStats();
  const sidos = getSidoSummaries();

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## 핵심 사실",
    "",
    `- 사이트 URL: ${SITE_URL}`,
    `- 언어: 한국어 (ko-KR), 대상 지역: 대한민국`,
    `- 수록 범위: ${stats.sidoCount}개 시도, ${num(stats.regionCount)}개 시군구`,
    `- 등록된 폐전자제품 수거함: 총 ${num(stats.pointCount)}곳 (폐휴대폰 ${num(
      stats.phoneCount
    )}곳, 중소폐가전 ${num(stats.applianceCount)}곳)`,
    `- 수거 비용: 등록된 수거함 전부 무상(무료). 배출 스티커나 별도 요금이 필요 없습니다.`,
    `- 수거 방법: 수거함 설치 방식. 주요 설치 장소는 민팃ATM, 공동주택(아파트), 행정복지센터·구청, 롯데하이마트, KT대리점, LG베스트샵, 삼성디지털프라자입니다.`,
    `- 수거함에 넣을 수 있는 것: 폐휴대폰(스마트폰·피처폰), 드라이어·전기밥솥·선풍기·청소기 같은 중소형 폐가전.`,
    `- 수거함에 넣을 수 없는 것: 냉장고·세탁기·에어컨·TV 등 대형 폐가전. 폐가전 무상방문수거(${BULKY_PICKUP_TEL}) 또는 지자체 대형폐기물 신고를 이용해야 합니다.`,
    `- 데이터 출처: ${DATA_SOURCE}`,
    `- 데이터 기준 시각: ${stats.lastModified.toISOString()}`,
    `- 주의: 공공데이터를 가공한 참고용 정보이므로 방문 전 운영 여부 확인이 필요합니다.`,
    "",
    "## 페이지 구조",
    "",
    `- \`/\` — 전국 요약과 시도·시군구 전체 색인`,
    `- \`/{시도}\` — 시도별 시군구 목록과 수거함 개수`,
    `- \`/{시도}/{시군구}\` — 해당 시군구 수거함의 상호명·주소·장소구분 전체 목록`,
    `- \`/sitemap.xml\` — 전체 URL 목록`,
    "",
    "## 시도별 색인",
    "",
  ];

  for (const s of sidos) {
    lines.push(
      `### ${s.sido} (${s.regionCount}개 시군구, 수거함 ${num(s.pointCount)}곳)`,
      "",
      `- [${s.sido} 전체](${sidoUrl(s.sido)})`
    );
    for (const r of s.regions) {
      lines.push(
        `- [${s.sido} ${r.sigungu}](${regionUrl(r.sido, r.sigungu)}): 수거함 ${num(
          r.pointCount
        )}곳 (폐휴대폰 ${num(r.phoneCount)}, 중소폐가전 ${num(r.applianceCount)})`
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
