import type { ReactNode } from 'react'
import Reveal from '../../components/Reveal'
import navidPhoto from '../../assets/Navid.jpeg'
import daniellePhoto from '../../assets/danielle.jpeg'
import heraldPhoto from '../../assets/heralds.png'

const lead = {
  tag: 'PANEL LEAD',
  firstName: 'Seyed',
  lastName: 'Navid Zahedi',
  role: 'ADJUDICATOR',
  photo: navidPhoto,
  bio: "An internationally registered arbitrator and negotiator with 10 years of experience as a lawyer, admitted to the Bar across Curaçao, Aruba, Bonaire, Sint Maarten, St. Eustatius and Saba. Navid began his career at VanEps Kunneman VanDoorne, specialising in corporate litigation and criminal law. Through roles as legal counsel at a trust service provider and as a litigator for both operators and industry parties, he built deep expertise in the gaming sector. His postgraduate studies in financial criminal law give him a firm command of regulatory frameworks and financial crime — enabling him to tackle disputes involving compliance, financial misconduct, and operational matters with precision.",
  pills: ['Bar Accredited', 'FinCrime Certified', 'EN / DE / NL'],
  linkedin: 'https://www.linkedin.com/in/seyednavidzahedi/',
}

const panel = [
  {
    tag: 'ADJUDICATOR',
    firstName: 'Danielle',
    lastName: 'Palm',
    role: 'ADJUDICATOR',
    photo: daniellePhoto,
    bio: 'An internationally registered arbitrator and negotiator with eighteen years of experience as a lawyer, Danielle has a solid track record in the gaming industry advising operators in contentious and advisory matters. Her dual background in economics and law, combined with over fourteen years of entrepreneurial experience, enables her to bring commercially informed and pragmatic approach to dispute resolution involving regulatory compliance, operational practices and cross-border elements.',
    pills: ['Bar Accredited', 'Corporate | R&I', 'EN / NL / ES'],
    linkedin: 'https://www.linkedin.com/in/daniellepalmcuracao',
  },
  {
    tag: 'REGULATORY',
    firstName: 'Herald',
    lastName: 'Martis',
    role: 'LEGAL CONSULTANT & PARALEGAL',
    photo: heraldPhoto,
    bio: "With 15+ years across civil, administrative, and criminal law, Herald is a litigation support and compliance specialist. His career spans both sides of the gaming industry — from in-house fraud management (AML, Licence compliance, KYC) to external legal consulting for Curaçao's leading law firms. He holds an LL.B. and is completing an LL.M. with an ADR focus. His executive experience as CEO and cooperative Chairman, coupled with fluency in Dutch, English, and Spanish, brings a uniquely broad perspective to every matter.",
    pills: ['LL.B. / LL.M. (Pursuing)', 'AML / KYC Expert', 'EN / NL / ES'],
    linkedin: 'https://www.linkedin.com/in/herald-martis-ba306211/',
  },
]

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <a
      href="#"
      className="h-8 w-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </a>
  )
}

function MemberCard({
  member,
  large,
}: {
  member: (typeof panel)[number] | typeof lead
  large?: boolean
}) {
  const linkedinIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H18v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H10z" />
    </svg>
  )
  const mailIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18v12H3zM3 6l9 7 9-7" />
    </svg>
  )

  return (
    <div
      className={`group overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col sm:flex-row ${
        large ? 'bg-navy-900' : 'bg-white border border-gray-200'
      }`}
    >
      <div className={`relative shrink-0 ${large ? 'sm:w-56' : 'sm:w-48'}`}>
        <img
          src={member.photo}
          alt={`${member.firstName} ${member.lastName}`}
          className="w-full h-56 sm:h-full object-cover object-top"
        />
        {!large && (
          <span className="absolute top-0 left-0 bg-gold-400 text-navy-900 text-xs font-semibold tracking-wide px-3 py-1">
            {member.tag}
          </span>
        )}
      </div>

      <div className={large ? 'p-6 sm:p-7 flex-1' : 'p-6 flex-1'}>
        {large && (
          <span className="inline-flex items-center gap-1.5 w-fit rounded bg-gold-400 text-navy-900 text-xs font-semibold tracking-wide px-3 py-1 mb-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="m12 2 2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6Z" />
            </svg>
            {member.tag}
          </span>
        )}
        <h3 className={large ? 'text-xl font-semibold text-white' : 'text-lg font-semibold text-navy-800'}>
          {member.firstName} <span className="italic text-gold-400">{member.lastName}</span>
        </h3>
        <p className={`text-xs font-semibold tracking-widest mt-1 ${large ? 'text-gold-400' : 'text-gold-600'}`}>
          {member.role}
        </p>

        <p className={`mt-3 text-sm leading-relaxed ${large ? 'text-gray-300' : 'text-gray-600'}`}>
          {member.bio}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {member.pills.map((pill) => (
            <span
              key={pill}
              className={`text-xs rounded px-3 py-1 border ${
                large
                  ? 'border-gold-400/50 text-gold-300'
                  : 'border-gold-500/40 text-gold-600'
              }`}
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          {large ? (
            <>
              <a href={member.linkedin} target="_blank" rel="noreferrer">
                <SocialIcon>{linkedinIcon}</SocialIcon>
              </a>
              <SocialIcon>{mailIcon}</SocialIcon>
            </>
          ) : (
            <>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-navy-700 hover:bg-navy-700 hover:text-white transition-colors"
              >
                {linkedinIcon}
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-navy-700 hover:bg-navy-700 hover:text-white transition-colors"
              >
                {mailIcon}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TeamPanel() {
  return (
    <section className="bg-white pt-4 pb-16 sm:pt-6 sm:pb-20">
      <Reveal className="text-center max-w-2xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-500" />
          <span className="text-xs font-semibold tracking-widest text-gold-600">
            OUR PEOPLE
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold">
          <span className="text-navy-800">The Panel & </span>
          <span className="italic text-blue-700">Leadership</span>
        </h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Each member of Resolvo's team is independently appointed and held
          to the highest standards of impartiality, professional conduct,
          and regulatory knowledge.
        </p>
      </Reveal>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Reveal>
          <MemberCard member={lead} large />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {panel.map((member, i) => (
            <Reveal key={member.firstName} delay={i * 100}>
              <MemberCard member={member} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
