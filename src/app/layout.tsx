import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/themeProvide";
import { Toaster } from "sonner";
import { SessionProvider } from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "SkillBridge — Connect with Expert Tutors",
  description:
    "SkillBridge connects learners with expert tutors. Browse tutor profiles, book sessions, and level up your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div className="flex flex-col min-h-screen">
              {children}
              <Toaster richColors closeButton />
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

