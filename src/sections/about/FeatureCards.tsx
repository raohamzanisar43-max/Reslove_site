import Reveal from '../../components/Reveal'

const features = [
  {
    icon: (
      <path d="M12 1a1 1 0 0 1 1 1v1.06c1.4.2 2.6.66 3.6 1.24l.5-.5a1 1 0 1 1 1.4 1.42l-.44.44c.2.24.38.5.54.77l3.1-1.03a1 1 0 0 1 .63 1.9l-3.2 1.06c.1.4.16.83.16 1.27 0 2.3-2.24 4.17-5 4.17s-5-1.87-5-4.17c0-.44.06-.86.15-1.27L5.77 7.3a1 1 0 0 1 .63-1.9l3.1 1.03c.16-.27.35-.53.54-.77l-.44-.44a1 1 0 1 1 1.4-1.42l.5.5c1-.58 2.2-1.04 3.6-1.24V2a1 1 0 0 1 1-1Zm-4 9.33c0 1.15 1.3 2.17 3 2.34V8.2c-1.7.17-3 1.16-3 2.13Zm5 2.34c1.7-.17 3-1.19 3-2.34 0-.97-1.3-1.96-3-2.13v4.47ZM4 21a1 1 0 0 1 0-2h16a1 1 0 1 1 0 2H4Z" />
    ),
    title: 'Independent ADR',
    description:
      'We assess facts and issue reasoned written outcomes, avoiding the cost, delay, and reputational impact of court proceedings.',
  },
  {
    icon: (
      <path d="M12 1.5 4 4.6v5.9c0 5.1 3.4 8.9 8 10 4.6-1.1 8-4.9 8-10V4.6L12 1.5Zm-1.2 13.4L7 11l1.4-1.4 2.4 2.4 4.8-4.8L17 8.6l-6.2 6.3Z" />
    ),
    title: 'Regulatory Aligned',
    description:
      "All processes operate in line with Curaçao's regulatory framework and the Gaming Control Authority (CGA) requirements.",
  },
  {
    icon: (
      <path d="M9 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-3.3 0-9 1.66-9 5v2h13.1a5.98 5.98 0 0 1-1.1-3.5c0-1.4.48-2.68 1.28-3.7A14.8 14.8 0 0 0 9 14Zm9-3-5 5-2-2-1.4 1.4L14 20.8l6.4-6.4Z" />
    ),
    title: 'Free for Players',
    description:
      'The ADR process is entirely free of charge to the player. All ADR costs are borne by the operator. No barriers to access.',
  },
  {
    icon: (
      <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z" />
    ),
    title: 'Responsible Gaming',
    description:
      'Complaints relating to responsible gaming, including self-exclusion, are handled with priority regardless of claim value.',
  },
]

export default function FeatureCards() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <Reveal key={f.title} delay={i * 100}>
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute left-0 top-0 h-0 w-1 bg-gold-400 transition-all duration-300 group-hover:h-full" />
            <div className="h-11 w-11 rounded-full bg-navy-700 text-gold-400 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                {f.icon}
              </svg>
            </div>
            <h3 className="font-semibold text-navy-800 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
