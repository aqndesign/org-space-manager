import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Org Space Manager",
  description: "Desk assignment policy management for org leaders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <Theme accentColor="blue" grayColor="slate" radius="full" scaling="100%" appearance="light">
          {children}
        </Theme>
      </body>
    </html>
  );
}
