import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FININT | Multi-Agent Financial Intelligence',
  description: 'Autonomous financial intelligence platform for retail investors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-fin-bg text-fin-text antialiased selection:bg-fin-accentDim selection:text-fin-accent">
        {children}
      </body>
    </html>
  );
}
