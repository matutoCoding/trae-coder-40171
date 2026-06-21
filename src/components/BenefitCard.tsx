import type { Benefit } from '@/types'
import { Gift, Pill, Users, FileText, ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'

const categoryConfig: Record<string, { icon: typeof Gift; color: string }> = {
  gift: { icon: Gift, color: 'text-purple-500 bg-purple-50' },
  chronic: { icon: Pill, color: 'text-blue-500 bg-blue-50' },
  family: { icon: Users, color: 'text-teal-500 bg-teal-50' },
  other: { icon: FileText, color: 'text-slate-500 bg-slate-50' },
}

const statusBorder: Record<string, string> = {
  available: 'border-l-emerald-500',
  expiring: 'border-l-amber-500',
  unavailable: 'border-l-red-400',
}

interface BenefitCardProps {
  benefit: Benefit
  onClick: () => void
  index: number
}

export default function BenefitCard({ benefit, onClick, index }: BenefitCardProps) {
  const cat = categoryConfig[benefit.category] || categoryConfig.other
  const Icon = cat.icon

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-slate-200 border-l-4 bg-white p-3.5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 active:scale-[0.99]"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'fadeSlideIn 0.3s ease forwards',
        opacity: 0,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-slate-800">{benefit.title}</h4>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">{benefit.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <StatusBadge status={benefit.status} />
            <span className="text-xs text-slate-400">到期 {benefit.expiryDate}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
