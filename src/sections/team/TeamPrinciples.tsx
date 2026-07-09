import Reveal from '../../components/Reveal'

const principles = [
  {
    icon: (
      <path d="M12 3v18M4 8l4-3 4 3-4 8-4-8Zm12 0l4-3 4 3-4 8-4-8ZM4 21h16" />
    ),
    title: 'Impartiality',
    description:
      'Every decision is made without favour to operator or player — guided solely by evidence and applicable law.',
  },
  {
    icon: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    title: 'Transparency',
    description:
      'All outcomes are fully reasoned and in writing — no black-box decisions, no unexplained conclusions.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    title: 'Timeliness',
    description:
      'Resolutions within 90 days. Acknowledgements within 7. Deadlines are commitments, not targets.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
    title: 'Accessibility',
    description:
      'Free to players, multi-lingual, and structured to be navigated without legal representation.',
  },
]

export default function TeamPrinciples() {
  return (
    <section className="bg-navy-900 py-16 sm:py-20">
      <div className="text-center max-w-2xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-400" />
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            WHAT GUIDES US
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold">
          <span className="text-white">Our Core </span>
          <span className="italic text-gold-400">Principles</span>
        </h2>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 100}>
            <div className="group rounded-xl border border-white/10 bg-white/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:bg-white/10">
              <div className="h-14 w-14 mx-auto rounded-full bg-white/10 group-hover:bg-gold-400 flex items-center justify-center mb-4 transition-colors duration-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6 text-gold-400 group-hover:text-navy-900 transition-colors duration-300"
                >
                  {p.icon}
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{p.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
