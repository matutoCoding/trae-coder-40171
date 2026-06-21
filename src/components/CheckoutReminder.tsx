import { useAppStore, useCartStore, useFeedbackStore } from '@/store/useAppStore'
import { useMemo } from 'react'
import {
  Bell,
  CheckCircle2,
  XCircle,
  Ban,
  ShoppingCart,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { Benefit, FeedbackType } from '@/types'

const feedbackLabels: Record<FeedbackType, { label: string; icon: typeof CheckCircle2; color: string }> = {
  reminded: { label: '已提醒', icon: CheckCircle2, color: 'text-emerald-600' },
  declined: { label: '顾客不用', icon: XCircle, color: 'text-amber-600' },
  inapplicable: { label: '政策不适用', icon: Ban, color: 'text-slate-500' },
}

interface CheckoutReminderProps {
  onFeedbackClick: (benefit: Benefit) => void
}

export default function CheckoutReminder({ onFeedbackClick }: CheckoutReminderProps) {
  const { member, benefits } = useAppStore()
  const { items } = useCartStore()
  const { submittedFeedbacks } = useFeedbackStore()

  const suggestions = useMemo(() => {
    if (!member || benefits.length === 0 || items.length === 0) return []

    const hasInsuredItems = items.some((i) => i.insuranceCovered)
    const memberFeedbacks = submittedFeedbacks.filter((f) => f.memberId === member.id)
    const feedbackMap = new Map<string, FeedbackType>()
    memberFeedbacks.forEach((f) => feedbackMap.set(f.benefitId, f.type))

    return benefits
      .filter((b) => {
        if (b.status === 'unavailable') return false
        if (!hasInsuredItems && b.category !== 'gift') return false
        return true
      })
      .map((b) => {
        const existingFeedback = feedbackMap.get(b.id)
        return {
          benefit: b,
          feedbackType: existingFeedback || null,
        }
      })
  }, [member, benefits, items, submittedFeedbacks])

  if (!member || suggestions.length === 0) return null

  const pendingCount = suggestions.filter((s) => !s.feedbackType).length
  const doneCount = suggestions.filter((s) => s.feedbackType).length

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
              {pendingCount} 项待提醒
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
        {suggestions.map(({ benefit, feedbackType }) => {
          const fb = feedbackType ? feedbackLabels[feedbackType] : null
          const FbIcon = fb?.icon || Bell

          return (
            <div
              key={benefit.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
                feedbackType
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-amber-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`truncate text-xs font-medium ${feedbackType ? 'text-slate-500' : 'text-slate-800'}`}>
                    {benefit.title}
                  </p>
                  {feedbackType ? (
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium ${fb?.color}`}>
                      <FbIcon className="h-2.5 w-2.5" />
                      {fb?.label}
                    </span>
                  ) : (
                    <StatusBadge status={benefit.status} />
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {feedbackType ? benefit.checkoutReminder : benefit.guide}
                </p>
              </div>
              {!feedbackType && (
                <button
                  onClick={() => onFeedbackClick(benefit)}
                  className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  提醒
                </button>
              )}
            </div>
          )
        })}
      </div>

      {pendingCount > 0 && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
          <p className="text-[10px] leading-relaxed text-amber-700">
            还有 {pendingCount} 项权益未提醒，结账前请向顾客说明
          </p>
        </div>
      )}
    </div>
  )
}
