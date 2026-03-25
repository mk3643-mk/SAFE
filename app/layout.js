import './globals.css'

export const metadata = {
  title: 'KOSHA Safety Management System',
  description: 'Integrated HR Pool and Site Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
