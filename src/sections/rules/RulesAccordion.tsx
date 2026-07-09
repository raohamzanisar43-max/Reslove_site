import { useState, type ReactNode } from 'react'
import Reveal from '../../components/Reveal'

const rules: { title: string; body: ReactNode }[] = [
  {
    title: 'Scope & Access',
    body: (
      <>
        <p>
          Resolvo handles Disputes arising from a player complaint that was
          first submitted to the operator and not resolved to the player's
          satisfaction in accordance with the operator's internal complaints
          procedure.
        </p>
        <p className="mt-4">
          Resolvo only handles Disputes for operators who have an{' '}
          <strong>active ADR agreement</strong> with Resolvo and are{' '}
          <strong>CGA-licensed</strong>.
        </p>
        <p className="mt-4">
          The ADR process is <strong>completely free</strong> of charge to
          the player. All ADR costs are borne by the operator.
        </p>
      </>
    ),
  },
  {
    title: 'Preconditions for Intake',
    body: (
      <>
        <p>
          Resolvo may only open an ADR case if <strong>all</strong> of the
          following have been met:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            The complaint has been submitted to the operator and the
            internal process is completed or a final response has been
            issued
          </li>
          <li>The Dispute is not pending before a court or another ADR provider</li>
          <li>The Dispute has not previously been decided by any CGA-certified ADR</li>
          <li>There is no conflict of interest</li>
          <li>
            The case falls within ADR parameters (no manifestly frivolous or
            vexatious matters)
          </li>
        </ul>
        <p className="mt-4">
          <strong>Important:</strong> Responsible gaming breaches (including
          self-exclusion admission complaints) must be addressed{' '}
          <strong>regardless of claim value</strong> — any monetary minimums
          set by operators do not apply in these cases.
        </p>
      </>
    ),
  },
  {
    title: 'Submission Requirements',
    body: (
      <>
        <p>
          To lodge a Dispute with Resolvo, the player must submit via
          Resolvo's online form or e-mail:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Name and residence</li>
          <li>Account ID at the operator</li>
          <li>
            Date of original complaint to the operator and operator's final
            reply (attach copy)
          </li>
          <li>Clear description of the disputed conduct and requested outcome</li>
          <li>Supporting documents / evidence</li>
          <li>Declaration that the matter is not before a court or another ADR</li>
        </ul>
        <p className="mt-4">
          <strong>Accepted languages:</strong> English, French, German,
          Spanish (and any additional languages published by Resolvo, if
          applicable).
        </p>
      </>
    ),
  },
  {
    title: 'Acknowledgement and Case Opening',
    body: (
      <>
        <p>
          Resolvo acknowledges receipt within <strong>7 calendar days</strong>,
          stating whether the file is admissible or whether additional
          information is required.
        </p>
        <p className="mt-4">
          If requested information is not supplied within the specified
          time, Resolvo may decline the case.
        </p>
        <p className="mt-4">
          Upon admissibility, Resolvo informs both parties of case opening
          and the next procedural steps.
        </p>
      </>
    ),
  },
  {
    title: 'Procedure and Standard of Review',
    body: (
      <>
        <p>
          Resolvo conducts an{' '}
          <strong>independent, impartial and evidence-based</strong>{' '}
          assessment.
        </p>
        <p className="mt-4">
          Both parties may submit further evidence within deadlines set by
          Resolvo.
          <br />
          Resolvo may ask targeted questions to elicit relevant facts.
        </p>
        <p className="mt-4">The review applies the relevant regulatory framework:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>LOK</li>
          <li>CGA policies and directives</li>
          <li>Curaçao civil law principles where relevant</li>
        </ul>
        <p className="mt-4">
          Differences in knowledge and power between player and operator are
          considered and mitigated (player accessibility, plain-language
          communication).
        </p>
      </>
    ),
  },
  {
    title: 'Responsible Gaming Matters',
    body: (
      <p>
        Complaints relating to <strong>Responsible Gaming</strong> (including
        self-exclusion, duty-of-care and related breaches) are handled with{' '}
        <strong>priority</strong> and full seriousness, irrespective of claim
        value.
      </p>
    ),
  },
  {
    title: 'Decision and Timeline',
    body: (
      <>
        <p>
          Resolvo will issue a <strong>reasoned written outcome</strong>{' '}
          within <strong>90 days</strong> from referral.
        </p>
        <p className="mt-4">The outcome sets out:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Findings</li>
          <li>Reasons</li>
          <li>Applicable rules</li>
          <li>Required actions for the parties</li>
        </ul>
        <p className="mt-4">
          Per CGA policy, the outcome is{' '}
          <strong>binding on the operator</strong>. Whether it is binding on
          the player depends on the operator's published ADR parameters.
        </p>
      </>
    ),
  },
  {
    title: 'Publicity',
    body: (
      <p>
        Resolvo will state in each case whether publication (anonymised or
        otherwise) is permitted and under what conditions.
      </p>
    ),
  },
  {
    title: 'Closure and Record-Keeping',
    body: (
      <>
        <p>
          Cases are closed upon issuance of the final outcome or upon a
          procedural decline/withdrawal.
        </p>
        <p className="mt-4">
          Resolvo maintains confidential records of all Disputes for at
          least <strong>five years</strong>.
        </p>
        <p className="mt-4">
          Resolvo will report and cooperate with the CGA in line with
          monitoring requirements, including production of files upon
          request.
        </p>
      </>
    ),
  },
  {
    title: 'Escalation Outside ADR',
    body: (
      <>
        <p>
          Resolvo does not replace judicial remedies. Players retain the
          right to seek judicial recourse after ADR, unless limited by
          binding contractual arrangements to the extent enforceable by law.
        </p>
        <p className="mt-4">
          Resolvo does not mediate regulatory complaints; if a player
          believes an operator breached regulation, they may contact the{' '}
          <strong>Curaçao Gaming Authority</strong> separately.
        </p>
      </>
    ),
  },
]

const glance = [
  { value: '7 Days', label: 'Acknowledgement' },
  { value: '90 Days', label: 'Decision Timeline' },
  { value: 'EN • FR • DE • ES', label: 'Supported Languages' },
  { value: '5+ Years', label: 'Record Retention' },
  { value: 'Free', label: 'for Players — All costs borne by operator' },
  { value: 'Binding', label: 'on Operator — Per CGA rules' },
]

export default function RulesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <Reveal className="text-center max-w-2xl mx-auto px-4 mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold">
          <span className="text-navy-800">Fair Play, </span>
          <span className="text-gold-500">Powered by Precision</span>
        </h2>
        <p className="mt-4 text-gold-600/80 leading-relaxed">
          Crystal-clear rules. Lightning-fast resolutions. Total impartiality.
          <br />
          Built to meet — and exceed — Curaçao Gaming Control Authority
          standards.
        </p>
      </Reveal>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <Reveal className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {rules.map((rule, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={rule.title}
                className={`transition-colors ${isOpen ? 'bg-blue-50' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer ${
                    isOpen ? 'border border-blue-200' : ''
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="h-7 w-7 shrink-0 rounded-full bg-gold-400 text-navy-900 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-navy-800">{rule.title}</span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-5 w-5 shrink-0 text-navy-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pt-4 pb-5 text-sm text-gray-600 leading-relaxed">
                      {rule.body}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>

        <Reveal delay={150} className="rounded-xl border border-gray-200 bg-white p-8">
          <h3 className="text-gold-500 font-semibold text-lg mb-2">At a Glance</h3>
          <div className="h-px bg-gray-200 mb-6" />
          <ul className="space-y-7">
            {glance.map((g) => (
              <li key={g.label} className="border-l-2 border-gold-400 pl-5">
                <p className="font-bold text-navy-800 text-xl">{g.value}</p>
                <p className="text-base text-gray-500">{g.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
