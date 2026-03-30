import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const paramFont = localFont({
  src: [
    { path: "../../public/fonts/Param-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/Param-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Param-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Param-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Param-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-param",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assessment Center | Param",
  description: "İnsan Kaynakları Değerlendirme Merkezi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${paramFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
