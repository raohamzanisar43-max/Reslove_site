import Reveal from '../../components/Reveal'

const steps = [
  {
    tag: 'ELIGIBILITY',
    title: 'Internal Complaint First',
    description:
      "The player must first submit their complaint directly to the operator and complete the operator's internal complaints procedure before approaching Resolvo.",
  },
  {
    tag: 'SUBMISSION',
    title: 'Lodge Your Dispute',
    description:
      "Submit via Resolvo's online form with your name, account ID, original complaint date, operator's final reply, description, supporting documents, and declaration.",
  },
  {
    tag: '7 DAYS',
    title: 'Acknowledgement',
    description:
      'Resolvo acknowledges receipt within 7 calendar days, confirming whether the case is admissible or requesting any additional information needed.',
  },
  {
    tag: 'ASSESSMENT',
    title: 'Independent Review',
    description:
      'Resolvo conducts an impartial, evidence-based review applying the applicable regulatory framework — including applicable regulatory policies and civil law where relevant.',
  },
  {
    tag: '90 DAYS',
    title: 'Written Outcome',
    description:
      'A reasoned written outcome is issued within 90 days from referral. Per regulatory requirements, the outcome is binding on the operator.',
  },
]

export default function ProcessTimeline() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-500" />
          <span className="text-xs font-semibold tracking-widest text-gold-600">
            HOW IT WORKS
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold">
          <span className="text-gold-500">The ADR </span>
          <span className="text-navy-700 italic">Process</span>
        </h2>
        <p className="mt-4 text-gray-600">
          A clear, structured path from complaint to resolution — designed to
          be fair, accessible, and timely.
        </p>
      </div>

      <div className="relative">
        <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />

        <div className="space-y-6 sm:space-y-0">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <Reveal
                key={step.title}
                delay={(i % 3) * 100}
                className="sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6 mb-0 sm:mb-16 last:mb-0"
              >
                <div>{isLeft && <StepCard step={step} number={i + 1} />}</div>

                <div className="hidden sm:flex justify-center">
                  <span className="relative z-10 h-12 w-12 rounded-full bg-navy-700 text-gold-400 ring-4 ring-white flex items-center justify-center font-bold text-xl">
                    {i + 1}
                  </span>
                </div>

                <div>{!isLeft && <StepCard step={step} number={i + 1} />}</div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepCard({
  step,
  number,
}: {
  step: (typeof steps)[number]
  number: number
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <span className="sm:hidden inline-flex h-7 w-7 rounded-full bg-navy-700 text-gold-400 items-center justify-center font-semibold text-xs mb-3">
        {number}
      </span>
      <span className="block rounded-full bg-gold-300/40 text-gold-600 text-xs font-semibold tracking-wide px-3 py-1 mb-3 w-fit">
        {step.tag}
      </span>
      <h3 className="font-semibold text-navy-800 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
    </div>
  )
}
