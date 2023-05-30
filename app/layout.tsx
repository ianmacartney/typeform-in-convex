import './globals.css'
import { Inter } from 'next/font/google'
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dog Spotter',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>

    </ConvexClientProvider>
  )
}
