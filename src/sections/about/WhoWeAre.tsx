import aboutImg from '../../assets/goldscale.jpg'
import Reveal from '../../components/Reveal'

export default function WhoWeAre() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-500" />
          <span className="text-xs font-semibold tracking-widest text-gold-600">
            WHO WE ARE
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
          <span className="text-gold-500">Independent.</span>
          <br />
          <span className="text-navy-700">Impartial. </span>
          <span className="text-navy-700 italic">Expert.</span>
        </h2>

        <p className="mt-6 text-gray-600 leading-relaxed max-w-md">
          Resolvo operates independently from both operators and players,
          ensuring every decision is objective, evidence-based, and fully
          transparent — with zero cost to the player.
        </p>
      </Reveal>

      <Reveal delay={150} className="rounded-xl overflow-hidden">
        <img src={aboutImg} alt="Scales of justice" className="w-full h-80 object-cover" />
      </Reveal>
    </div>
  )
}
