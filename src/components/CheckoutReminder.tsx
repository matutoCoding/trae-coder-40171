import { useAppStore, useCartStore, useFeedbackStore } from '@/store/useAppStore'
import { useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
  MinusCircle,
  ShoppingBag,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { Benefit, FeedbackType } from '@/types'

interface Suggestion {
  benefit: Benefit
  matchReason: string
  thresholdMet: boolean
  remainingAmount: number
  existingFeedback: FeedbackType | null
}

const confirmOptions: {
  type: FeedbackType
  label: string
  icon: typeof CheckCircle2
  btnBg: string
  btnText: string
  btnBorder: string
}[] = [
  { type: 'reminded', label: '已提醒', icon: CheckCircle2, btnBg: 'bg-emerald-50 hover:bg-emerald-100', btnText: 'text-emerald-700', btnBorder: 'border-emerald-200' },
  { type: 'declined', label: '顾客不用', icon: XCircle, btnBg: 'bg-amber-50 hover:bg-amber-100', btnText: 'text-amber-700', btnBorder: 'border-amber-200' },
  { type: 'not_needed', label: '暂不需要', icon: MinusCircle, btnBg: 'bg-slate-50 hover:bg-slate-100', btnText: 'text-slate-600', btnBorder: 'border-slate-200' },
]

const feedbackLabels: Record<FeedbackType, { label: string; icon: typeof CheckCircle2; color: string }> = {
  reminded: { label: '已提醒', icon: CheckCircle2, color: 'text-emerald-600' },
  declined: { label: '顾客不用', icon: XCircle, color: 'text-amber-600' },
  inapplicable: { label: '政策不适用', icon: Ban, color: 'text-slate-500' },
  not_needed: { label: '暂不需要', icon: MinusCircle, color: 'text-slate-500' },
}

interface CheckoutReminderProps {
  onFeedbackClick: (benefit: Benefit) => void
  confirmations: Record<string, FeedbackType>
  onConfirm: (benefitId: string, type: FeedbackType) => void
}

export default function CheckoutReminder({ onFeedbackClick, confirmations, onConfirm }: CheckoutReminderProps) {
  const { member, benefits } = useAppStore()
  const { items, totalCovered } = useCartStore()
  const { submittedFeedbacks } = useFeedbackStore()

  const suggestions = useMemo(() => {
    if (!member || benefits.length === 0 || items.length === 0) return []

    const hasInsuredItems = items.some((i) => i.insuranceCovered)
    const coveredTotal = totalCovered
    const cartKeywords = items.flatMap((i) => i.keywords || [])

    const sessionFeedbacks = submittedFeedbacks.filter(
      (f) => f.memberId === member.id && f.sessionId === useCartStore.getState().sessionId
    )
    const feedbackMap = new Map<string, FeedbackType>()
    sessionFeedbacks.forEach((f) => feedbackMap.set(f.benefitId, f.type))

    return benefits
      .filter((b) => b.status !== 'unavailable')
      .map((b): Suggestion | null => {
        if (b.category === 'gift') {
          if (!hasInsuredItems) return null
          const threshold = b.minSpend || 150
          const met = coveredTotal >= threshold
          const remaining = threshold - coveredTotal
          return {
            benefit: b,
            matchReason: met
              ? `医保目录内已满¥${threshold}，可领取`
              : `差¥${remaining.toFixed(0)}达标（当前¥${coveredTotal.toFixed(0)}）`,
            thresholdMet: met,
            remainingAmount: remaining,
            existingFeedback: feedbackMap.get(b.id) || null,
          }
        }

        if (b.category === 'chronic') {
          if (!hasInsuredItems) return null
          const keywords = b.applicableKeywords || []
          const matched = keywords.length > 0
            ? keywords.some((k) => cartKeywords.includes(k))
            : true
          if (!matched) return null
          const matchedKeyword = keywords.find((k) => cartKeywords.includes(k))
          return {
            benefit: b,
            matchReason: matchedKeyword
              ? `购物车含${matchedKeyword}相关药品`
              : '慢病用药复购提醒',
            thresholdMet: true,
            remainingAmount: 0,
            existingFeedback: feedbackMap.get(b.id) || null,
          }
        }

        if (!hasInsuredItems) return null
        return {
          benefit: b,
          matchReason: b.category === 'family' ? '家庭共济可用' : '医保权益可用',
          thresholdMet: true,
          remainingAmount: 0,
          existingFeedback: feedbackMap.get(b.id) || null,
        }
      })
      .filter((s): s is Suggestion => s !== null)
  }, [member, benefits, items, totalCovered, submittedFeedbacks])

  if (!member || suggestions.length === 0) return null

  const pendingCount = suggestions.filter((s) => !s.existingFeedback && !confirmations[s.benefit.id]).length
  const doneCount = suggestions.filter((s) => s.existingFeedback || confirmations[s.benefit.id]).length

  return (
    <div
      className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-3.5 shadow-sm"
      style={{ animation: 'fadeSlideIn 0.3s ease' }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Bell className="h-3.5 w-3.5" />
          结账前提醒清单
        </div>
        <div className="flex gap-1.5 text-[10px]">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
              {pendingCount} 项待确认
            </span>
          )}
          {doneCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
              {doneCount} 项已处理
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {suggestions.map(({ benefit, matchReason, thresholdMet, existingFeedback }) => {
          const confirmed = existingFeedback || confirmations[benefit.id]
          const fb = confirmed ? feedbackLabels[confirmed] : null
          const FbIcon = fb?.icon || Bell

          return (
            <div
              key={benefit.id}
              className={`rounded-lg border px-2.5 py-2 transition-all ${
                confirmed
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-amber-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`truncate text-xs font-medium ${confirmed ? 'text-slate-500' : 'text-slate-800'}`}>
                      {benefit.title}
                    </p>
                    {confirmed ? (
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium ${fb?.color}`}>
                        <FbIcon className="h-2.5 w-2.5" />
                        {fb?.label}
                      </span>
                    ) : (
                      <StatusBadge status={benefit.status} />
                    )}
                  </div>
                  <p className={`mt-0.5 text-[10px] ${thresholdMet ? 'text-slate-400' : 'text-amber-500'}`}>
                    {matchReason}
                  </p>
                </div>
              </div>

              {!confirmed && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {confirmOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.type}
                        onClick={() => onConfirm(benefit.id, opt.type)}
                        className={`inline-flex items-center gap-0.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${opt.btnBg} ${opt.btnText} ${opt.btnBorder}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {opt.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => onFeedbackClick(benefit)}
                    className="ml-auto text-[10px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    详细反馈 →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pendingCount > 0 && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
          <p className="text-[10px] leading-relaxed text-amber-700">
            还有 {pendingCount} 项权益未确认，结账前请向顾客说明或标记处理结果
          </p>
        </div>
      )}

      {doneCount > 0 && pendingCount === 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2">
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
          <p className="text-[10px] leading-relaxed text-emerald-700">
            本单所有权益提醒已确认，可以结算
          </p>
        </div>
      )}

      {doneCount > 0 && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            <ShoppingBag className="h-3 w-3" />
            本单确认小结
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(({ benefit, existingFeedback }) => {
              const c = existingFeedback || confirmations[benefit.id]
              if (!c) return null
              const fb = feedbackLabels[c]
              return (
                <span
                  key={benefit.id}
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${fb?.color}`}
                >
                  <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                  {benefit.title}：{fb?.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
