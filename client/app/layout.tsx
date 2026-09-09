import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://weather-eat.com"),
  title: "웨더잇 - 날씨 기반 식당 추천 & 예약 플랫폼",
  description: "실시간 날씨 데이터를 바탕으로 오늘 분위기에 가장 잘 어울리는 주변 식당을 추천하고 예약할 수 있는 서비스입니다.",
  keywords: ["날씨", "맛집", "식당 추천", "실시간 예약", "웨더잇", "데이트 코스", "모임 장소"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "웨더잇 - 날씨 기반 식당 추천 & 예약 플랫폼",
    description: "실시간 날씨 데이터를 바탕으로 오늘 분위기에 가장 잘 어울리는 주변 식당을 추천하고 예약할 수 있는 서비스입니다.",
    url: "https://weather-eat.com",
    siteName: "웨더잇",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "웨더잇 미리보기 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "웨더잇 - 날씨 기반 식당 추천 & 예약 플랫폼",
    description: "실시간 날씨 데이터를 바탕으로 오늘 분위기에 가장 잘 어울리는 주변 식당을 추천하고 예약할 수 있는 서비스입니다.",
    images: ["/icon.png"],
  },
  referrer: "no-referrer",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

