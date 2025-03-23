import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import "./globals.css";
import PageLayout from "@/components/pageLayout";
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Maggie's shop",
  description: "Shop for clothes, accessories, materials and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <PageLayout>
              {children}
            </PageLayout>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
