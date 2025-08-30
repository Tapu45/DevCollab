import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SignupProvider } from "@/context/SignupContext";
import RouteLayoutWrapper from "@/components/Layout/RootLayoutWrapper";
import QueryProvider from "../context/QueryProvider"; // <-- Use your QueryProvider
import NextAuthProvider from "@/context/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevCollab",
  description: "A collaborative platform for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider> {/* Use the client provider */}
          <QueryProvider>
            <AuthProvider>
              <SignupProvider>
                <RouteLayoutWrapper>{children}</RouteLayoutWrapper>
              </SignupProvider>
            </AuthProvider>
          </QueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}