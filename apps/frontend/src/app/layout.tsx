import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rooster AI',
  description: 'AI-powered staff rostering platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
