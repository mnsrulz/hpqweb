import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import 'instantsearch.css/themes/algolia.css';
import './globals.css'
import { AppNavBar } from './navBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'H1B analysis',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppNavBar />
        {children}
      </body>
      
    </html>
  )
}
