const stats = [
  { value: '90', label: 'DAY RESOLUTION' },
  { value: '3', label: 'LANGUAGES' },
  { value: '0', label: 'COST TO PLAYERS' },
]

export default function StatsBar() {
  return (
    <div className="flex gap-10 sm:gap-16">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-4xl sm:text-5xl font-bold text-gold-400">{s.value}</p>
          <p className="text-xs tracking-widest text-gray-300 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
