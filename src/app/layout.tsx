import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const koddiUD = localFont({
  src: [
    { path: "./fonts/KoddiUDOnGothic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KoddiUDOnGothic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-koddiud",
  display: "swap",
});

const TITLE = `${SITE_NAME} | 폐휴대폰 · 폐가전 수거함 위치`;
const DESCRIPTION = "전국 시군구별 폐휴대폰·중소폐가전 수거함 위치를 확인하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: "ko-KR",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${koddiUD.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
