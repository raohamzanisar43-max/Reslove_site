import heroImg from '../../assets/lawyer.jpg'
import StatsBar from './StatsBar'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex flex-col justify-center min-h-[560px] sm:min-h-[640px] scroll-mt-20"
    >
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy-950/80" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-gold-400" />
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            CGA-CERTIFIED ADR PROVIDER
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          <span className="text-white">Resolving Disputes.</span>
          <br />
          <span className="text-gold-400">Restoring Trust.</span>
        </h1>

        <p className="mt-4 max-w-xl text-gray-300 leading-relaxed">
          Resolvo provides independent Alternative Dispute Resolution for
          disputes between CGA-licensed online gaming operators and their
          players — objective, evidence-based, and free to players.
        </p>

        <div className="mt-8">
          <StatsBar />
        </div>
      </div>
    </section>
  )
}
