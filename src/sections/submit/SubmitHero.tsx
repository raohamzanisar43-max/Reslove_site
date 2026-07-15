import submitHero from '../../assets/fileSubmits.jpg'

export default function SubmitHero() {
  return (
    <section className="relative flex items-center justify-center min-h-96 sm:min-h-120">
      <img
        src={submitHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy-950/85" />

      <div className="relative text-center px-4 max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-gold-400" />
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            WE'RE HERE TO HELP
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold">
          <span className="text-white">Submit a </span>
          <span className="text-gold-400">Dispute</span>
        </h1>
        <p className="mt-6 text-lg text-gray-300 leading-relaxed">
          File your dispute or get in touch with Resolvo — free, independent,
          and regulatory-aligned.
        </p>
      </div>
    </section>
  )
}
