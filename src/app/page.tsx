import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'MoveShopify Bridge',
  description: 'Shopify to tradingWEB migration bridge',
};

export default function Home() {
  redirect('/admin/migration');
}
