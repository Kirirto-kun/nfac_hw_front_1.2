import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nfac_hw_front_1.2',
  description: 'HomeWork',
  generator: 'nfac_hw_front_1.2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
