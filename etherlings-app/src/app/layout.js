// src/app/layout.js
import './globals.css'
import { WalletProvider } from '../lib/wallet'

export const metadata = {
  title: 'EtherLings · $ELING — spirits of the chain',
  description: '32×32 ethereal pixel spirits minted by a Uniswap v4 hook on every swap. Inspired by UniPeg. Experiment project.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
