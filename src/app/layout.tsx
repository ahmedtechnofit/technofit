import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechnoFit - Tech × Fitness × Nutrition",
  description: "منصة شخصية احترافية تجمع بين التكنولوجيا، كمال الأجسام، والتغذية. نقدم تحليلات رياضية ذكية وخطط غذائية مخصصة.",
  keywords: ["تشنوفيت", "TechnoFit", "تكنولوجيا رياضية", "كمال أجسام", "تغذية", "خطط غذائية", "تحليل رياضي", "تطوير مواقع"],
  authors: [{ name: "TechnoFit Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "TechnoFit - Tech × Fitness × Nutrition",
    description: "منصة شخصية احترافية تجمع بين التكنولوجيا، كمال الأجسام، والتغذية",
    url: "https://technofit.vercel.app",
    siteName: "TechnoFit",
    type: "website",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechnoFit - Tech × Fitness × Nutrition",
    description: "منصة شخصية احترافية تجمع بين التكنولوجيا، كمال الأجسام، والتغذية",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
