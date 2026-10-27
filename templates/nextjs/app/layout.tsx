import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoherynUI — Next.js App Router Starter',
  description: 'Official CoherynUI Next.js starter featuring server-safe cascade layers and accessible touch ergonomics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-surface fg-primary">{children}</body>
    </html>
  );
}
