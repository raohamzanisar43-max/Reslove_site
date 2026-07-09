import rulesHero from '../../assets/rules.jpg'

export default function RulesHero() {
  return (
    <section className="relative flex items-center justify-center min-h-80 sm:min-h-96">
      <img
        src={rulesHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy-950/80" />

      <div className="relative text-center px-4 max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold-400" />
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            CGA-ALIGNED PROCEDURE
          </span>
          <span className="h-px w-8 bg-gold-400" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold">
          <span className="text-white">Rules of </span>
          <span className="text-gold-400">Procedure</span>
        </h1>
        <p className="mt-4 text-gray-300 leading-relaxed">
          Transparent, structured and impartial framework for resolving
          disputes between players and CGA-licensed operators.
        </p>
      </div>
    </section>
  )
}
