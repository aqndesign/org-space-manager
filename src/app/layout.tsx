import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans-3" });

export const metadata: Metadata = {
  title: "Org Space Manager",
  description: "Desk assignment policy management for org leaders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans3.variable}`}>
      <body>
        <Theme accentColor="blue" grayColor="slate" radius="full" scaling="100%" appearance="light">
          {children}
        </Theme>
      </body>
    </html>
  );
}
