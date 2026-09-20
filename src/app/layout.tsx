import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MoveShopify Bridge',
    template: '%s | MoveShopify Bridge',
  },
  description: 'Shopify to tradingWEB migration bridge.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'MoveShopify Bridge',
    description: 'Shopify to tradingWEB migration bridge.',
    siteName: 'MoveShopify',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
