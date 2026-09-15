import { SITE_NAME, SITE_URL } from "@/lib/site";
import { shortSido, sidoAlias } from "@/lib/sidoAlias";
import type { CollectionPoint, RegionStats, SidoSummary } from "@/lib/regions";

/**
 * JSON-LD를 페이지마다 따로 뿌리면 같은 사이트를 가리키는 WebSite/Organization
 * 노드가 중복 정의된다. @id로 한 번만 정의하고 나머지는 참조만 하도록
 * @graph 한 덩어리를 만드는 헬퍼들.
 */
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const DATASET_ID = `${SITE_URL}/#dataset`;

export const SITE_DESCRIPTION =
  "전국 시군구별 폐휴대폰·중소폐가전 무상 수거함 위치를 동네 이름으로 찾는 공공데이터 기반 검색 서비스입니다.";

export const DATA_SOURCE = "한국환경공단 폐전자제품 수거함 위치정보 (공공데이터포털)";

/** 대형 폐가전 무상방문수거 콜센터 (E-순환거버넌스). */
export const BULKY_PICKUP_TEL = "1599-0903";

export function sidoUrl(sido: string) {
  return `${SITE_URL}/${encodeURIComponent(sido)}`;
}

export function regionUrl(sido: string, sigungu: string) {
  return `${SITE_URL}/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`;
}

export function sidoPath(sido: string) {
  return `/${encodeURIComponent(sido)}`;
}

export function regionPath(sido: string, sigungu: string) {
  return `/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`;
}

export function num(n: number) {
  return n.toLocaleString("ko-KR");
}

type JsonLdNode = Record<string, unknown>;

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    // 구글 로고 권장 최소 112px. 48px /icon 대신 180px apple-icon을 쓴다.
    logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon`, width: 180, height: 180 },
    description: SITE_DESCRIPTION,
    areaServed: { "@type": "Country", name: "대한민국", alternateName: "KR" },
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: ["폐가전 수거함 위치", "폐휴대폰 수거함 찾기"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
  };
}

export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbNode(url: string, crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function webPageNode(opts: {
  url: string;
  name: string;
  description: string;
  hasBreadcrumb?: boolean;
  type?: "WebPage" | "CollectionPage";
  dateModified?: Date;
  keywords?: string[];
}): JsonLdNode {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "ko-KR",
    isPartOf: { "@id": WEBSITE_ID },
    ...(opts.hasBreadcrumb ? { breadcrumb: { "@id": `${opts.url}#breadcrumb` } } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified.toISOString() } : {}),
    ...(opts.keywords ? { keywords: opts.keywords.join(", ") } : {}),
    isAccessibleForFree: true,
    isBasedOn: { "@id": DATASET_ID },
    // 음성 비서·AI 답변이 읽어 갈 요약 영역: h1과 각 페이지의 .speakable 문단.
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".speakable"] },
    sdPublisher: { "@id": ORG_ID },
  };
}

/**
 * 사이트가 가공한 공공데이터 자체를 Dataset으로 밝힌다. 원출처(creator)와 범위가
 * 명시돼 있어야 생성형 검색이 숫자를 인용할 때 출처를 붙일 수 있다.
 * 레이아웃에서 한 번 정의하고 각 WebPage는 isBasedOn으로 참조한다.
 */
export function datasetNode(stats: {
  sidoCount: number;
  regionCount: number;
  pointCount: number;
  phoneCount: number;
  applianceCount: number;
  lastModified: Date;
}): JsonLdNode {
  return {
    "@type": "Dataset",
    "@id": DATASET_ID,
    name: "전국 시군구별 폐휴대폰·중소폐가전 수거함 위치",
    description:
      `${DATA_SOURCE} 공공데이터를 시군구별로 정리한 데이터셋입니다. 전국 ${stats.sidoCount}개 시도 ` +
      `${num(stats.regionCount)}개 시군구에 설치된 폐전자제품 수거함 ${num(stats.pointCount)}곳` +
      `(폐휴대폰 ${num(stats.phoneCount)}곳, 중소폐가전 ${num(stats.applianceCount)}곳)의 ` +
      `상호명·주소·장소구분·수거비용을 담고 있습니다.`,
    url: SITE_URL,
    inLanguage: "ko-KR",
    isAccessibleForFree: true,
    keywords: ["폐가전 수거함", "폐휴대폰 수거함", "중소폐가전", "폐전자제품", "공공데이터"],
    creator: { "@type": "Organization", name: "한국환경공단", url: "https://www.keco.or.kr" },
    publisher: { "@id": ORG_ID },
    isBasedOn: "https://www.data.go.kr",
    spatialCoverage: { "@type": "Country", name: "대한민국", alternateName: "KR" },
    dateModified: stats.lastModified.toISOString(),
    variableMeasured: ["상호명", "수거종류", "수거장소(주소)", "장소구분", "수거비용"],
  };
}

export interface Faq {
  q: string;
  a: string;
}

export function faqNode(url: string, faqs: Faq[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** 수거함 한 곳을 Place 노드로. 좌표가 없는 원본이라 주소만 싣는다. */
export function collectionPointNode(
  point: CollectionPoint,
  sido: string,
  sigungu: string,
  position: number
): JsonLdNode {
  return {
    "@type": "ListItem",
    position,
    item: {
      "@type": "Place",
      name: point.상호명,
      description: `${point.장소구분}에 설치된 ${point.수거종류} 수거함 (수거비용 ${point.수거비용})`,
      address: {
        "@type": "PostalAddress",
        streetAddress: point["수거장소(주소)"].trim(),
        addressLocality: sigungu,
        addressRegion: sido,
        addressCountry: "KR",
      },
      publicAccess: !point.장소구분.includes("공동주택"),
      isAccessibleForFree: point.수거비용 === "무상",
    },
  };
}

/** ItemList의 itemListElement 상한. 수거함이 547곳인 청주시까지 HTML을 부풀리지 않도록 자른다. */
const ITEM_LIST_CAP = 100;

export function pointItemListNode(
  url: string,
  name: string,
  points: CollectionPoint[],
  sido: string,
  sigungu: string
): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": `${url}#points`,
    name,
    numberOfItems: points.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: points
      .slice(0, ITEM_LIST_CAP)
      .map((p, i) => collectionPointNode(p, sido, sigungu, i + 1)),
  };
}

export function graph(nodes: JsonLdNode[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

// ---------------------------------------------------------------------------
// FAQ 본문. AEO/GEO에서 인용되려면 답변 한 문장이 문맥 없이도 성립해야 하므로
// 지역명·숫자·전화번호를 답변 안에 그대로 박아 넣는다.
// ---------------------------------------------------------------------------

const BULKY_ANSWER =
  `냉장고·세탁기·에어컨·TV처럼 큰 폐가전은 수거함에 넣을 수 없습니다. ` +
  `E-순환거버넌스의 폐가전제품 무상방문수거(${BULKY_PICKUP_TEL})에 예약하면 집 앞에서 무료로 가져가고, ` +
  `업체 방문이 어려우면 관할 시·군·구청에 대형폐기물 배출 신고를 한 뒤 스티커를 붙여 내놓으면 됩니다.`;

const WHAT_ANSWER =
  "폐휴대폰(스마트폰·피처폰)과 드라이어, 전기밥솥, 선풍기, 청소기, 다리미 같은 중소형 폐가전을 넣을 수 있습니다. " +
  "수거함 투입구보다 큰 제품이나 냉장고·세탁기·TV 등 대형 가전은 별도 무상방문수거를 이용해야 합니다.";

const PRIVACY_ANSWER =
  "휴대폰을 배출하기 전에 공장 초기화를 하고 USIM 칩과 SD 메모리 카드를 반드시 분리하세요. " +
  "민팃ATM처럼 기기를 즉시 파쇄하거나 데이터를 삭제해 주는 수거함도 있지만, 초기화는 배출자가 직접 하는 것이 가장 안전합니다.";

export function siteFaqs(stats: {
  regionCount: number;
  pointCount: number;
  phoneCount: number;
  applianceCount: number;
}): Faq[] {
  return [
    {
      q: "폐휴대폰과 폐가전은 어디에 버려야 하나요?",
      a:
        `전국 시·군·구에 설치된 폐전자제품 수거함에 넣으면 됩니다. ` +
        `${SITE_NAME}에는 ${num(stats.regionCount)}개 시군구, 총 ${num(stats.pointCount)}곳의 수거함 위치가 정리돼 있습니다. ` +
        `수거함은 주로 민팃ATM, 행정복지센터·구청, 롯데하이마트·삼성디지털프라자·LG베스트샵 같은 가전 매장, 아파트 단지 안에 있습니다.`,
    },
    {
      q: "폐가전 수거함 이용은 무료인가요?",
      a: `네, 무료입니다. 공공데이터에 등록된 수거함 ${num(stats.pointCount)}곳 모두 수거비용이 '무상'으로 표기돼 있어, 배출 스티커나 별도 요금 없이 그냥 넣으면 됩니다.`,
    },
    { q: "수거함에 넣을 수 있는 물건은 무엇인가요?", a: WHAT_ANSWER },
    { q: "냉장고·세탁기 같은 대형 폐가전은 어떻게 버리나요?", a: BULKY_ANSWER },
    { q: "폐휴대폰을 버릴 때 개인정보는 안전한가요?", a: PRIVACY_ANSWER },
    {
      q: "이 사이트의 수거함 정보는 어디서 가져온 것인가요?",
      a:
        `${DATA_SOURCE} 공공데이터를 가공해 보여 줍니다. 현재 폐휴대폰 수거함 ${num(stats.phoneCount)}곳, ` +
        `중소폐가전 수거함 ${num(stats.applianceCount)}곳이 등록돼 있습니다. 참고용 정보이므로 방문 전 운영 여부를 확인해 주세요.`,
    },
  ];
}

export function sidoFaqs(summary: SidoSummary): Faq[] {
  const { sido } = summary;
  const alias = sidoAlias(sido);
  const label = alias ? `${sido}(${alias})` : sido;
  return [
    {
      q: `${sido}에 폐가전 수거함이 몇 곳 있나요?`,
      a:
        `${label}에는 ${summary.regionCount}개 시군구에 걸쳐 총 ${num(summary.pointCount)}곳의 폐전자제품 수거함이 있습니다. ` +
        `이 가운데 폐휴대폰 수거함이 ${num(summary.phoneCount)}곳, 중소폐가전 수거함이 ${num(summary.applianceCount)}곳입니다.`,
    },
    {
      q: `${sido}에서 우리 동네 수거함은 어떻게 찾나요?`,
      a: `이 페이지의 시군구 목록에서 사는 곳을 고르면 ${sido} 해당 시군구의 수거함 상호명과 주소를 동네별로 볼 수 있고, 각 수거함은 네이버지도로 바로 연결됩니다.`,
    },
    { q: `${sido}에서 대형 폐가전은 어떻게 버리나요?`, a: BULKY_ANSWER },
    { q: "수거함 이용 요금이 있나요?", a: `아니요. ${sido}에 등록된 수거함 ${num(summary.pointCount)}곳 모두 무상으로 이용할 수 있습니다.` },
  ];
}

export function regionFaqs(sido: string, sigungu: string, stats: RegionStats): Faq[] {
  const alias = sidoAlias(sido);
  const where = alias ? `${sido}(${alias}) ${sigungu}` : `${sido} ${sigungu}`;
  const topPlaces = stats.byPlace.slice(0, 3);
  const placeSentence = topPlaces
    .map((p) => `${p.name} ${num(p.count)}곳`)
    .join(", ");

  return [
    {
      q: `${sido} ${sigungu}에 폐가전 수거함이 몇 곳 있나요?`,
      a:
        `${where}에는 총 ${num(stats.total)}곳의 폐전자제품 수거함이 있습니다. ` +
        `폐휴대폰 수거함 ${num(stats.phoneCount)}곳, 중소폐가전 수거함 ${num(stats.applianceCount)}곳이며 ` +
        `${sigungu} 안 ${stats.areaCount}개 동·도로에 나뉘어 설치돼 있습니다.`,
    },
    {
      q: `${sigungu}에서 폐휴대폰은 어디에 버리나요?`,
      a:
        `${sigungu}의 수거함은 ${placeSentence} 순으로 많습니다. ` +
        (stats.sampleNames.length
          ? `예를 들어 ${stats.sampleNames.join(", ")} 등에 설치돼 있습니다. `
          : "") +
        "배출 전에 휴대폰을 공장 초기화하고 USIM과 SD 카드를 빼 주세요.",
    },
    {
      q: `${sigungu} 폐가전 수거함 이용 요금은 얼마인가요?`,
      a: stats.allFree
        ? `무료입니다. ${where}에 등록된 수거함 ${num(stats.total)}곳 모두 수거비용이 '무상'이라 별도 스티커나 요금 없이 넣을 수 있습니다.`
        : `대부분 무상으로 운영되지만 일부 수거함은 비용이 다를 수 있으니 목록의 수거비용 표시를 확인해 주세요.`,
    },
    { q: "수거함에 넣을 수 있는 물건은 무엇인가요?", a: WHAT_ANSWER },
    { q: `${sigungu}에서 냉장고·세탁기 같은 대형 폐가전은 어떻게 버리나요?`, a: BULKY_ANSWER },
  ];
}

// ---------------------------------------------------------------------------
// 페이지 제목·설명 빌더.
//
// 네이버 RSS(app/rss.xml)는 "각 페이지의 실제 <title>·meta description"을 그대로
// 실어야 한다. generateMetadata 안에 문자열이 인라인으로 박혀 있으면 RSS 쪽에서
// 같은 문장을 한 번 더 쓰게 되고, 한쪽만 고치는 순간 피드와 페이지가 어긋난다.
// 양쪽이 같은 함수를 부르도록 여기로 끌어올린다.
// ---------------------------------------------------------------------------

/** layout.tsx의 title.default. 홈은 title을 덮어쓰지 않아 이 값이 그대로 <title>이 된다. */
export const HOME_TITLE = `${SITE_NAME} | 폐휴대폰 · 폐가전 수거함 위치`;

/** layout.tsx의 title.template(`%s | 사이트명`)이 렌더링한 최종 <title>. */
export function pageTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

export interface PageMeta {
  title: string;
  description: string;
}

export function homeDescription(stats: {
  regionCount: number;
  pointCount: number;
}) {
  return (
    `전국 ${num(stats.regionCount)}개 시군구, 총 ${num(stats.pointCount)}곳의 폐휴대폰·중소폐가전 무상 수거함 위치를 ` +
    `동네 이름으로 검색하세요. 민팃ATM, 행정복지센터, 하이마트 등 수거함 주소를 지도로 바로 확인할 수 있습니다.`
  );
}

export function sidoMeta(summary: SidoSummary): PageMeta {
  const { sido } = summary;
  const alias = sidoAlias(sido);
  return {
    title: `${shortSido(sido)} 폐가전·폐휴대폰 수거함 위치 ${num(summary.pointCount)}곳`,
    description:
      `${sido}${alias ? `(${alias})` : ""} ${summary.regionCount}개 시군구의 폐휴대폰·중소폐가전 무상 수거함 ` +
      `${num(summary.pointCount)}곳 위치를 시군구별로 확인하세요. 폐휴대폰 ${num(summary.phoneCount)}곳, ` +
      `중소폐가전 ${num(summary.applianceCount)}곳.`,
  };
}

export function regionMeta(sido: string, sigungu: string, stats: RegionStats): PageMeta {
  const alias = sidoAlias(sido);
  // 제목에는 검색량이 많은 축약형("서울시 마포구")을, 설명·본문에는 정식 명칭을
  // 함께 실어 두 표기 모두 매칭되게 한다.
  return {
    title: `${shortSido(sido)} ${sigungu} 폐가전·폐휴대폰 수거함 ${num(stats.total)}곳`,
    description:
      `${sido}${alias ? `(${alias})` : ""} ${sigungu}의 폐휴대폰·중소폐가전 무상 수거함 ${num(stats.total)}곳 위치와 주소. ` +
      `폐휴대폰 ${num(stats.phoneCount)}곳, 중소폐가전 ${num(stats.applianceCount)}곳이 ${stats.areaCount}개 동·도로에 나뉘어 있습니다.` +
      (stats.byPlace.length
        ? ` 주요 설치 장소: ${stats.byPlace.slice(0, 3).map((p) => p.name).join(", ")}.`
        : ""),
  };
}
