import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata = {
  title: {
    default: 'PorVerse - Sistemul Tău de Operare Spirituală',
    template: '%s | PorVerse'
  },
  description: 'Prima platformă de transformare personală prin AI avancată. Optimizează-ți sănătatea, finanțele, productivitatea și wellness-ul mental.',
  keywords: ['AI', 'wellness', 'health', 'productivity', 'personal development', 'transformare personală'],
  authors: [{ name: 'PorVerse Team' }],
  creator: 'PorVerse',
  publisher: 'PorVerse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://porverse.ro'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://porverse.ro',
    title: 'PorVerse - Sistemul Tău de Operare Spirituală',
    description: 'Prima platformă de transformare personală prin AI avancată.',
    siteName: 'PorVerse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PorVerse - Sistemul Tău de Operare Spirituală',
    description: 'Prima platformă de transformare personală prin AI avancată.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={inter.variable}>
      <head>
        {/* Preconnect pentru performanță */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* SF Pro Display pentru headers premium */}
        <link 
          href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Favicon și icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Meta tags pentru viewport și theme */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#00ff88" />
        <meta name="color-scheme" content="dark" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/sf-pro-display.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Background gradients pentru consistență */}
        <div id="__next">
          {children}
        </div>
        
        {/* Scripts pentru analytics (când e gata) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'GA_TRACKING_ID');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}