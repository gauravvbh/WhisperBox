import type { Metadata } from "next";
import './globals.css'
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'
import NextTopLoader from "nextjs-toploader";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'True Feedback',
  description: 'Real feedback from real people.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <NextTopLoader />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}