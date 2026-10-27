import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarTender UltraLite - Professional Barcode & Label Designer",
  description:
    "Professional barcode label design software inspired by BarTender UltraLite. Features New Document Wizard, multi-label grid layout, high-precision linear and 2D barcode generation, print preview, and data entry forms.",
  keywords: "bartender, barcode generator, label designer, zebra, qr code, code128, ean13",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
