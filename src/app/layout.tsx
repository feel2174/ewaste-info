import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { HOME_TITLE as TITLE, SITE_DESCRIPTION, graph, organizationNode, websiteNode } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { SIBLINGS } from "@/components/SiblingSites";
import "./globals.css";

const koddiUD = localFont({
  src: [
    { path: "./fonts/KoddiUDOnGothic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KoddiUDOnGothic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-koddiud",
  display: "swap",
});

export const metadata: Metadata = {
  // 하위 페이지는 지역명이 들어간 고유 제목을 쓰고 브랜드는 template로 붙인다.
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  category: "환경·생활정보",
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
const siteJsonLd = graph([organizationNode(), websiteNode()]);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${koddiUD.variable} h-full antialiased`}>
      <head>
        <JsonLd data={siteJsonLd} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9196149361612087"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
        <footer className="mt-auto border-t-4 border-burgundy bg-white px-4 py-6 text-center text-sm text-zinc-500">
          <p className="max-w-2xl mx-auto">
            <span className="font-bold text-zinc-700">면책조항:</span> 본 사이트가 제공하는
            수거함 위치 정보는 공공데이터포털이 제공하는 공공데이터를 가공하여 보여주는
            참고용 정보이며, 실제 정보와 다를 수 있습니다. 방문 전 운영 여부를 다시 확인해
            주세요. 본 사이트는 정보의 정확성, 최신성에 대해 어떠한 법적 책임도 지지
            않습니다.
          </p>
          <p className="mt-3">
            데이터 출처: 한국환경공단 폐전자제품 수거함 위치정보 (공공데이터포털) · 폰트:
            KoddiUD 온고딕 (한국장애인개발원 · 윤디자인그룹)
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
