import { useState } from 'react'
import type { Benefit, BenefitStatus } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import BenefitCard from './BenefitCard'
import StatusBadge from './StatusBadge'
import { FileCheck } from 'lucide-react'

type FilterKey = 'all' | BenefitStatus

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'available', label: '可用' },
  { key: 'expiring', label: '即将过期' },
  { key: 'unavailable', label: '暂不可用' },
]

export default function BenefitList() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { benefits, member, selectBenefit } = useAppStore()
  const navigate = useNavigate()

  const filtered = filter === 'all' ? benefits : benefits.filter((b) => b.status === filter)

  const counts = {
    all: benefits.length,
    available: benefits.filter((b) => b.status === 'available').length,
    expiring: benefits.filter((b) => b.status === 'expiring').length,
    unavailable: benefits.filter((b) => b.status === 'unavailable').length,
  }

  const handleBenefitClick = (benefit: Benefit) => {
    selectBenefit(benefit)
    navigate(`/benefit/${benefit.id}`)
  }

  if (!member) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">权益列表</h2>
        <button
          onClick={() => {
            selectBenefit(null)
            navigate('/feedback')
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          <FileCheck className="h-3.5 w-3.5" />
          提交反馈
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f.label}
            <span className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] ${
              filter === f.key ? 'bg-white/20' : 'bg-slate-200'
            }`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-400">
          该分类下暂无权益
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((benefit, i) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              onClick={() => handleBenefitClick(benefit)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
