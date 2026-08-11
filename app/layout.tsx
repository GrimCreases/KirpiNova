import type { Metadata } from "next";
import "./globals.css";
import {ServiceWorkerRegistration} from "@/components/service-worker-registration";

export const viewport = {themeColor:"#0f5b57"};

export const metadata: Metadata = {
  title: "KirpiNova",
  description: "Your life, organized in one encrypted workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* THESIS: KirpiNova reveals life by horizon—Now, Next, and Later—and refuses the equal-card dashboard wall.
            OWN-WORLD: Cool teal fields, precise FORT-led typography, tonal surfaces, and restrained geometric linework.
            STORY: Sign in, understand today, act on what is next, and retain sight of the month without losing focus.
            FIRST VIEWPORT: Stable navigation at left, date and actions above, today’s agenda leading, supporting tasks and finance beside it.
            FORM: Life horizon, assigned structure 3, seed 7cf3eca7.
            FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
        <ServiceWorkerRegistration/>
        {children}
      </body>
    </html>
  );
}
