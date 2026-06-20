import './globals.css'
import Nav from './_components/Nav'
import ConnStatus from './_components/ConnStatus'

export const metadata = {
  title: 'Your AI HQ',
  description: 'GLCC Starter — your business in one place',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <aside className="side">
            <div className="brand"><span className="logo" aria-hidden="true" /> Your AI HQ</div>
            <Nav />
            <p className="hint">One <code>records</code> table behind all 8 tabs.</p>
          </aside>
          <main className="main"><ConnStatus />{children}</main>
        </div>
      </body>
    </html>
  )
}
