import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KINE3D — Understand movement',
  description:
    'An interactive, bilingual knee biomechanics learning workspace. Original simplified anatomy, movement comparisons, and source-transparent education.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
