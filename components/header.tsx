// components/header.tsx

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from './theme-provider'
import { Moon, Sun, Menu, X, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pesanan', label: 'Pesanan' },
  { href: '/customer', label: 'Customer' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/report', label: 'Report' },
  { href: '/settings', label: 'Settings' },
]

export default function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
    toast.success('Berhasil logout')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-semibold">
            {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{session?.user?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}