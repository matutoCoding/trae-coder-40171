import type { Benefit } from '@/types'
import { Gift, Pill, Users, FileText, ChevronRight, MessageSquareText } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

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
  const navigate = useNavigate()
  const { selectBenefit } = useAppStore()
  const borderCls = statusBorder[benefit.status] || ''

  const handleQuickFeedback = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectBenefit(benefit)
    navigate('/feedback')
  }

  return (
    <div
      className={`w-full text-left rounded-xl border border-slate-200 ${borderCls} bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300`}
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'fadeSlideIn 0.3s ease forwards',
        opacity: 0,
      }}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-3.5 group"
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
      <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-100 px-3 py-2 bg-slate-50/60 rounded-b-xl">
        <span className="text-[10px] text-slate-400">点击卡片查看操作指引与话术</span>
        <button
          onClick={handleQuickFeedback}
          className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          <MessageSquareText className="h-3 w-3" />
          提交反馈
        </button>
      </div>
    </div>
  )
}
