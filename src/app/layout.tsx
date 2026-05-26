import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "@carbon/charts-react/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"], variable: "--font-ibm-plex-sans" });
const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans-3" });

export const metadata: Metadata = {
  title: "Org Space Manager",
  description: "Desk assignment policy management for org leaders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${sourceSans3.variable}`}>
      <body>
        <Theme accentColor="blue" grayColor="slate" radius="full" scaling="100%" appearance="light">
          {children}
        </Theme>
      </body>
    </html>
  );
}
