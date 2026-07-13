import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/themeProvide";
import { Toaster } from "sonner";
import { SessionProvider } from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "MentorForge — Connect with Expert Tutors",
  description:
    "MentorForge connects learners with expert tutors. Browse tutor profiles, book sessions, and level up your skills.",
  icons: {
    icon: "/mentorforge-icon.svg",
    shortcut: "/mentorforge-icon.svg",
    apple: "/mentorforge-icon.svg",
  },
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

