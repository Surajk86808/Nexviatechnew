import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import Providers from "./providers";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Nexviatech | AI & Automation Solutions",
  description:
    "Nexviatech provides AI and automation solutions that help teams modernize operations, launch digital products faster, and scale with confidence.",
  icons: {
    icon: "/nexviatech-icon.png.png",
    shortcut: "/nexviatech-icon.png.png",
    apple: "/nexviatech-icon.png.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Nexviatech",
              url: "https://nexviatech.online/",
              logo: "https://nexviatech.online/nexviatech-icon.png.png",
              sameAs: [
                "https://www.linkedin.com/company/nexviatech1/posts/?feedView=all",
                "https://www.instagram.com/nexviatech_solutions/",
                "https://x.com/nexviatech1",
                "https://clutch.co/profile/nexviatech",
              ],
            }),
          }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z9Q50ZD943');
          `,
          }}
        />
      </head>
      <body className="nexviatech-site overflow-x-hidden">
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
