import { Link } from 'react-router-dom'
import Reveal from '../../components/Reveal'

const cards = [
  {
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
    title: 'Players',
    description: (
      <>
        Submit disputes via our secure online form. Please follow the
        requirements outlined in the{' '}
        <Link to="/rules" className="text-blue-700 underline">
          Rules of Procedure
        </Link>
        .
      </>
    ),
  },
  {
    icon: (
      <>
        <path d="M4 21V7l8-4 8 4v14" />
        <path d="M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
      </>
    ),
    title: 'Operators',
    description:
      'Questions about ADR agreements, case administration, registration process, or becoming a Resolvo-registered operator.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    title: 'General Enquiries',
    description:
      'Request more information about Resolvo’s services or guidance on how to prepare and submit a dispute.',
  },
]

export default function SubmitContactCards() {
  return (
    <section className="bg-gray-50 pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 100}>
            <div className="group rounded-xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg [perspective:600px]">
              <div className="h-14 w-14 mx-auto rounded-full bg-navy-700 flex items-center justify-center mb-4 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-gold-400"
                >
                  {c.icon}
                </svg>
              </div>
              <h3 className="font-semibold text-navy-800 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
