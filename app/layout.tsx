import type { Metadata } from "next";
import "../styles/globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "NexviaTech | Enterprise Engineering Solutions",
  description:
    "NexviaTech helps enterprise teams modernize platforms, reduce cloud costs, and deliver secure digital products faster.",
  icons: {
    icon: "/nextviatechbgblue.png",
    shortcut: "/nextviatechbgblue.png",
    apple: "/nextviatechbgblue.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

