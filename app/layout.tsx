import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathoro — Find your way.",
  description:
    "The living landscape that helps you discover, plan, and take real steps toward what's next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <body className="min-h-full bg-cream font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
