import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/Resolvoo.png'

const quickLinks = [
  { label: 'Home', to: '/#home' },
  { label: 'About', to: '/#about' },
  { label: 'Process', to: '/#process' },
  { label: 'Rules', to: '/rules' },
  { label: 'Our Team', to: '/our-team' },
]

const legalLinks = [
  'Privacy Policy',
  'Terms & Conditions',
  'Complaint Procedure',
  'Regulatory Compliance',
]

const socials = [
  {
    label: 'LinkedIn',
    icon: (
      <path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H18v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H10z" />
    ),
  },
  {
    label: 'Twitter',
    icon: (
      <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1c.5 1.6 2 2.8 3.8 2.9A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z" />
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.6 3.65 15.4 3.5 14 3.5c-2.7 0-4.5 1.65-4.5 4.7v2.7H6.8V14h2.7v7Z" />
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm0 6.3a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm4.9-6.5a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0ZM21 7.2c0-1.6-.3-2.7-.8-3.6a5.2 5.2 0 0 0-2.3-2.3c-.9-.5-2-.8-3.6-.8H9.7c-1.6 0-2.7.3-3.6.8A5.2 5.2 0 0 0 3.8 3.6c-.5.9-.8 2-.8 3.6v9.6c0 1.6.3 2.7.8 3.6a5.2 5.2 0 0 0 2.3 2.3c.9.5 2 .8 3.6.8h9.6c1.6 0 2.7-.3 3.6-.8a5.2 5.2 0 0 0 2.3-2.3c.5-.9.8-2 .8-3.6Zm-1.9 9.6c0 1.4-.3 2.2-.5 2.7a4 4 0 0 1-1.5 1.5c-.5.2-1.3.5-2.7.5H9.7c-1.4 0-2.2-.3-2.7-.5a4 4 0 0 1-1.5-1.5c-.2-.5-.5-1.3-.5-2.7V7.2c0-1.4.3-2.2.5-2.7a4 4 0 0 1 1.5-1.5c.5-.2 1.3-.5 2.7-.5h9.6c1.4 0 2.2.3 2.7.5a4 4 0 0 1 1.5 1.5c.2.5.5 1.3.5 2.7Z" />
    ),
  },
]

const badges = [
  {
    label: 'Licensed Provider',
    icon: (
      <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5Z" />
    ),
  },
  {
    label: 'Confidential',
    icon: (
      <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm2 0h8V8a4 4 0 1 0-8 0Z" />
    ),
  },
  {
    label: 'Binding Outcomes',
    icon: <path d="M13 2 3 14h7l-1 8 10-12h-7z" />,
  },
]

function ContactIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 shrink-0 text-gold-400"
    >
      {children}
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-navy-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <img src={logo} alt="Resolvo" className="h-11 w-auto mb-3 brightness-0 invert" />
          <p className="text-white font-medium mb-3">Independent. Impartial. Expert.</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Resolvo provides independent Alternative Dispute Resolution for disputes
            between licensed online gaming operators and their players —
            objective, transparent, and free for players.
          </p>
          <div className="flex gap-3 mt-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-gold-400 text-xs font-semibold tracking-widest mb-4">
            QUICK LINKS
          </h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="hover:text-gold-400 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-gold-400 text-xs font-semibold tracking-widest mb-4">
            LEGAL
          </h3>
          <ul className="space-y-2 text-sm">
            {legalLinks.map((label) => (
              <li key={label}>
                <a href="#" className="hover:text-gold-400 transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-gold-400 text-xs font-semibold tracking-widest mb-4">
            CONTACT
          </h3>
          <ul className="space-y-3 text-sm mb-6">
            <li className="flex items-center gap-2">
              <ContactIcon>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18v12H3zM3 6l9 7 9-7"
                />
              </ContactIcon>
              info@resolvocuracao.com
            </li>
            <li className="flex items-center gap-2">
              <ContactIcon>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4c0 1-1 2-2 2C10.5 21 3 13.5 3 6c0-1 1-2 1-2Z"
                />
              </ContactIcon>
              +599 9675 3176
            </li>
            <li className="flex items-center gap-2">
              <ContactIcon>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
                />
                <circle cx="12" cy="10" r="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </ContactIcon>
              Hydraweg 3, Curaçao
            </li>
          </ul>
          <h3 className="text-gold-400 text-xs font-semibold tracking-widest mb-3">
            SUBSCRIBE
          </h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex rounded-md overflow-hidden"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 min-w-0 bg-white text-navy-900 text-sm px-3 py-2 outline-none"
            />
            <button
              type="submit"
              className="bg-gold-400 px-3 flex items-center justify-center text-navy-900"
              aria-label="Subscribe"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Resolvo. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 text-xs rounded-full border border-gray-600 px-3 py-1 text-gray-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-gold-400">
                  {b.icon}
                </svg>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
