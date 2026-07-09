import Reveal from '../../components/Reveal'

const stats = [
  { value: '90', label: 'DAY MAX RESOLUTION' },
  { value: '0', label: 'COST TO PLAYERS' },
  { value: '3', label: 'LANGUAGES SUPPORTED' },
  { value: '100%', label: 'BINDING ON OPERATORS' },
]

const credentials = ['CGA Certified', 'CEDR Trained', 'Civil Law Experts']

function CredentialPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-navy-800">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-gold-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
      {label}
    </span>
  )
}

export default function TeamStats() {
  return (
    <section className="bg-gray-50 pt-16 pb-4 sm:pt-20 sm:pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold-500" />
            <span className="text-xs font-semibold tracking-widest text-gold-600">
              WHO WE ARE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
            <span className="text-navy-800">Independent Minds.</span>
            <br />
            <span className="italic text-blue-700">Collective Expertise.</span>
          </h2>
          <p className="mt-6 text-gray-600 leading-relaxed max-w-md">
            Resolvo's panel combines decades of experience across dispute
            resolution, gaming regulation, consumer law, and civil
            procedure. Every member operates with strict independence from
            operators and players alike — ensuring outcomes grounded purely
            in evidence and law.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {credentials.map((c) => (
              <CredentialPill key={c} label={c} />
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-4xl font-bold text-gold-500">{s.value}</p>
                <p className="text-xs tracking-widest text-gray-500 mt-2">{s.label}</p>
                <span className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-navy-700 to-gold-400 transition-all duration-500 ease-out group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
