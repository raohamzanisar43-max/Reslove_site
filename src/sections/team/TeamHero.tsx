import teamHero from '../../assets/teams.jpg'

export default function TeamHero() {
  return (
    <section className="relative flex items-center min-h-96 sm:min-h-120">
      <img src={teamHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy-950/80" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-400" />
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            MEET THE EXPERTS
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold max-w-xl">
          <span className="text-white">Our </span>
          <span className="text-gold-400 italic">Team</span>
        </h1>
        <p className="mt-4 max-w-xl text-gray-300 leading-relaxed">
          The professionals in alternative dispute resolution, regulatory
          compliance, and online gaming law — committed to impartial,
          expert-led outcomes.
        </p>
      </div>
    </section>
  )
}
