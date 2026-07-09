import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/Resolvoo.png'

const sectionLinks = [
  { label: 'Home', to: '/#home' },
  { label: 'About', to: '/#about' },
  { label: 'Process', to: '/#process' },
]

const pageLinks = [
  { label: 'Rules', to: '/rules' },
  { label: 'Our Team', to: '/our-team' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Resolvo" className="h-11 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {sectionLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium tracking-wide text-navy-800 hover:text-gold-600 transition-colors"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          {pageLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-gold-600' : 'text-navy-800 hover:text-gold-600'
                }`
              }
            >
              {link.label.toUpperCase()}
            </NavLink>
          ))}
          <Link
            to="/submit-dispute"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-500 transition-colors"
          >
            SUBMIT DISPUTE
          </Link>
        </nav>

        <button
          type="button"
          className="lg:hidden text-navy-800"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-4">
          {sectionLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium tracking-wide text-navy-800"
              onClick={() => setOpen(false)}
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          {pageLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="text-sm font-medium tracking-wide text-navy-800"
              onClick={() => setOpen(false)}
            >
              {link.label.toUpperCase()}
            </NavLink>
          ))}
          <Link
            to="/submit-dispute"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 text-center"
            onClick={() => setOpen(false)}
          >
            SUBMIT DISPUTE
          </Link>
        </div>
      )}
    </header>
  )
}
