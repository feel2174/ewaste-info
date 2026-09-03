// 주소 문자열에서 목록 그룹핑에 쓸 "세부 지역" 이름을 뽑는다.
// 서버(통계·본문·JSON-LD)와 클라이언트(아코디언 그룹핑) 양쪽에서 쓰이므로
// node:fs를 import하는 regions.ts가 아니라 별도 모듈에 둔다.
//
// 원본 12,827건 중 지번 주소(동/읍/면)는 2,700여 건뿐이고 나머지는 도로명
// 주소다. 동 이름만 찾던 이전 구현은 마포구 126곳 중 122곳을 "기타" 한 덩어리로
// 몰아넣어서, 목록의 소제목이 지역 정보를 전혀 담지 못했다. 도로명("성암로",
// "월드컵북로")까지 잡으면 99.9%가 실제 지명이 붙은 그룹으로 나뉜다.

const DONG = /(?:시|군|구)\s+([가-힣0-9]{1,4}(?:동|읍|면|리|가))(?:\s|\d|$)/;
// "불당 26로", "두정고 8길"처럼 도로명 중간에 공백+숫자가 끼는 표기도 받는다.
const ROAD = /([가-힣A-Za-z0-9]{1,8}(?:\s?\d{1,3})?(?:대로|로|길))(?:\s|\d|$)/;

export function extractArea(address: string): string {
  const a = address.trim();
  const dong = a.match(DONG);
  if (dong) return dong[1];
  const road = a.match(ROAD);
  if (road) return road[1].replace(/\s+/g, "");
  return "기타";
}
