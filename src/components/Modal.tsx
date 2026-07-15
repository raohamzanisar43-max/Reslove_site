import { Link } from 'react-router-dom'

export default function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl rounded-xl overflow-hidden bg-white shadow-2xl">
        <div className="relative bg-navy-900 px-8 py-7 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 text-white/70 hover:text-white cursor-pointer transition-colors"
          >
            ✕
          </button>
          <h2 className="text-gold-400 text-2xl sm:text-3xl font-semibold">
            Ready to Resolve Your Dispute?
          </h2>
        </div>

        <div className="px-8 py-10 text-center">
          <p className="text-navy-800 text-lg">
            Submit your case to Resolvo —{' '}
            <span className="text-gold-600">free, independent, and regulatory-aligned</span>.
            <br />
            Get a fair, evidence-based resolution in as little as{' '}
            <span className="font-semibold">90 days</span>.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Thousands of players trust us to restore balance — no cost to you,
            binding on operators.
          </p>

          <Link
            to="/submit-dispute"
            onClick={onClose}
            className="inline-block mt-8 rounded-full bg-gold-400 px-10 py-4 font-semibold text-navy-900 hover:bg-gold-500 hover:-translate-y-1 transition-all"
          >
            Submit Your Dispute Now
          </Link>

          <p className="text-xs text-gray-400 mt-3">
            Your information is confidential • certified process
          </p>
        </div>

        <div className="bg-navy-900 px-8 py-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/30 px-6 py-2.5 text-sm text-white hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
