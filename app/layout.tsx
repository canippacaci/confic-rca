import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConfIC-RCA | Conformal In-Context Reverse Classification Accuracy',
  description: 'Statistically Grounded Efficient Estimation of Medical Image Segmentation Quality (IEEE TMI / arXiv:2503.04522)',
  keywords: ['medical imaging', 'segmentation quality control', 'conformal prediction', 'reverse classification accuracy', 'in-context learning', 'SAM 2', 'UniverSeg'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}

