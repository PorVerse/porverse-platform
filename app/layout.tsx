import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import './styles/variables.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PorVerse - Sistemul Tău de Operare Spirituală',
    template: '%s | PorVerse',
  },
  description:
    'Prima platformă de transformare personală prin AI avansată. Optimizează-ți sănătatea, finanțele, productivitatea și wellness-ul mental.',
  keywords: [
    'AI',
    'wellness',
    'health',
    'productivity',
    'personal development',
    'transformare personală',
  ],
  authors: [{ name: 'PorVerse Team' }],
  creator: 'PorVerse',
  publisher: 'PorVerse',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://porverse.ro'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://porverse.ro',
    title: 'PorVerse - Sistemul Tău de Operare Spirituală',
    description: 'Prima platformă de transformare personală prin AI avansată.',
    siteName: 'PorVerse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PorVerse - Sistemul Tău de Operare Spirituală',
    description: 'Prima platformă de transformare personală prin AI avansată.',
    creator: '@porverse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Dacă ai faviconuri, Next le servește automat din /public
  // (nu e nevoie să le pui manual aici)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}

        {/* Analytics (prod only). Înlocuiește GA_TRACKING_ID cu realul tău ID. */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
              async
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GA_TRACKING_ID', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
