import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import {
  HOME_TITLE as TITLE,
  DATA_AS_OF,
  SITE_DESCRIPTION,
  datasetNode,
  graph,
  organizationNode,
  websiteNode,
} from "@/lib/seo";
import { getSiteStats } from "@/lib/regions";
import JsonLd from "@/components/JsonLd";
import { SIBLINGS } from "@/components/SiblingSites";
import "./globals.css";

// Pretendard. 두 굵기(Medium·ExtraBold)만 받아서, 본문(400~500)은 Medium,
// 굵은 글자(600~800: font-semibold/bold/extrabold)는 ExtraBold로 매핑한다.
// 가변 구간을 weight 범위로 지정해 두면 그 사이 값은 브라우저가 합성한다.
const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Medium.ttf", weight: "400 500", style: "normal" },
    { path: "./fonts/Pretendard-ExtraBold.ttf", weight: "600 800", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  // 하위 페이지는 지역명이 들어간 고유 제목을 쓰고 브랜드는 template로 붙인다.
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  category: "환경·생활정보",
  // 애드센스 자동광고: 계정 소유 확인용 메타. 실제 자동광고 노출 ON/OFF는
  // AdSense 대시보드에서 토글한다. 로더 스크립트는 아래 <head>에 있다.
  other: { "google-adsense-account": "ca-pub-9196149361612087" },
  keywords: [
    "폐가전 수거함",
    "폐휴대폰 수거함",
    "중소폐가전 배출",
    "폐가전 버리는 곳",
    "폐가전 무상수거",
    "민팃ATM 위치",
    "소형가전 배출",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "ylRZwQXQH9ZVegPDqDJGKHanYBIwb2fDMD_NWF917FI",
    other: {
      "naver-site-verification": "787f94d972f5e30465cd2e811b46e3f6dde23186",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#6b1e2e",
  // 시스템 다크모드와 무관하게 밝은 톤 고정(globals.css)이라 브라우저에도 알려 준다.
  colorScheme: "light",
};

// Organization/WebSite는 사이트 전역 엔티티라 레이아웃에서 한 번만 정의하고,
// 각 페이지의 @graph는 @id로 참조만 한다.
const siteJsonLd = graph([organizationNode(), websiteNode(), datasetNode(getSiteStats())]);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <head>
        <JsonLd data={siteJsonLd} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9196149361612087"
          crossOrigin="anonymous"
        />
        {/* Google Ads 전환 태그. next/script는 preload 링크를 붙여서 raw 태그로 둔다.
            외부 클릭 전환: 다른 도메인 링크 클릭을 위임 리스너로 잡는다. 이동은 막지 않고
            beacon으로 보내서 네이버지도 현재 탭 이동(전면광고 노출)을 그대로 둔다. */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18398101283" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18398101283');
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.host===location.host||!/^https?:$/.test(a.protocol))return;gtag('event','conversion',{send_to:'AW-18398101283/VrL8CJHk4fscEKP-8sRE',value:1.0,currency:'KRW',transport_type:'beacon'});},true);`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-burgundy focus:px-4 focus:py-2 focus:text-cream"
        >
          본문 바로가기
        </a>
        {children}
        <footer className="mt-auto border-t-4 border-burgundy bg-white px-4 py-6 text-center text-sm text-zinc-600">
          <p className="max-w-2xl mx-auto">
            <span className="font-bold text-zinc-700">면책조항:</span> 본 사이트가 제공하는
            수거함 위치 정보는 공공데이터포털이 제공하는 공공데이터를 가공하여 보여주는
            참고용 정보이며, 실제 정보와 다를 수 있습니다. 방문 전 운영 여부를 다시 확인해
            주세요. 본 사이트는 정보의 정확성, 최신성에 대해 어떠한 법적 책임도 지지
            않습니다.
          </p>
          <p className="mt-3">
            데이터 출처: 한국환경공단 폐전자제품 수거함 위치정보 (공공데이터포털) · 데이터 기준일:{" "}
            {DATA_AS_OF} · 폰트: Pretendard (길형진, SIL Open Font License)
          </p>
          <nav aria-label="우리동네 정보 사이트" className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {SIBLINGS.map((s) => (
              <a
                key={s.url}
                href={s.url}
                className="font-semibold text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
              >
                {s.name}
              </a>
            ))}
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
