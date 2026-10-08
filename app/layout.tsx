import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "MyLinks - The Professional Link-in-Bio Platform",
    template: "%s | MyLinks",
  },
  description:
    "Claim your personalized bio link. Share your portfolio, social networks, projects, and connect with your audience seamlessly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} dark h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0A0A0A] text-white`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  );
}
