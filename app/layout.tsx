import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/custom-phone-input.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Providers from "@/components/Provider";
import NetworkStatus from "@/components/NetworkStatus";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Docuee",
  description:
    "Streamline all your school-related tasks — from academic projects and assignments to collaboration, supervision, and more. Built for students, instructors, and supervisors. Earn bonuses when your referrals upgrade!",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Simplify School Tasks with Docuee",
    description:
      "Docuee streamlines your academic workflow — from projects and assignments to supervision and collaboration. And this is just the beginning — more tools are on the way. Earn exclusive bonuses when your referrals upgrade!",
    url: `${BASE_URL}`,
    siteName: "Docuee",
    images: [
      {
        url: `${BASE_URL}/assets/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Simplify School Tasks with Docuee",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simplify School Tasks with Docuee",
    description:
      "Manage your academic life — from final year projects to assignments — all in one place. Collaborate, get approvals, and stay organized with Docuee. Earn bonuses when your referrals upgrade!",
    images: [
      `${BASE_URL}/assets/images/og-image.png/assets/images/og-image.png`,
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      // signInFallbackRedirectUrl="/"
      // signUpFallbackRedirectUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3371FF",
          fontSize: "16px",
          colorBackground: "#091832",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-black-100`}>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={300}>
                <NetworkStatus />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
