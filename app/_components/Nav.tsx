'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Add a tab? Add one line here + a matching app/<name>/page.tsx. That's it.
const TABS = [
  { href: '/', label: 'Dashboard' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/money', label: 'Money' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/projects', label: 'Projects' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/content', label: 'Content' },
  { href: '/agents', label: 'Agents' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="nav">
      {TABS.map(t => (
        <Link key={t.href} href={t.href} className={path === t.href ? 'active' : ''}>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
