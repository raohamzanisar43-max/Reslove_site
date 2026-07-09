import { Link } from 'react-router-dom'
import Reveal from '../../components/Reveal'

export default function TeamCta() {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="rounded-xl bg-navy-900 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Ready to <span className="italic text-gold-400">Resolve</span>?
            </h2>
            <p className="mt-3 text-gray-300 max-w-lg leading-relaxed">
              Submit your dispute today — free, independent, and
              CGA-aligned. Our team will review your case and provide a
              fair, evidence-based written outcome within 90 days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/submit-dispute"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-semibold text-navy-900 hover:bg-gold-500 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              SUBMIT YOUR DISPUTE
            </Link>
            <a
              href="/#process"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              HOW IT WORKS
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
