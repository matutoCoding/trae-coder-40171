import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useFeedbackStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Ban,
  ArrowLeft,
  Send,
  Check,
} from 'lucide-react'
import type { FeedbackType } from '@/types'

const feedbackOptions: {
  type: FeedbackType
  label: string
  desc: string
  icon: typeof CheckCircle2
  color: string
  activeBg: string
  activeBorder: string
}[] = [
  {
    type: 'reminded',
    label: '已提醒',
    desc: '已向顾客说明权益内容',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-400',
  },
  {
    type: 'declined',
    label: '顾客不用',
    desc: '顾客了解后选择不使用',
    icon: XCircle,
    color: 'text-amber-500',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-400',
  },
  {
    type: 'inapplicable',
    label: '政策不适用',
    desc: '当前商品/政策不适用该权益',
    icon: Ban,
    color: 'text-slate-500',
    activeBg: 'bg-slate-50',
    activeBorder: 'border-slate-400',
  },
]

export default function FeedbackForm() {
  const [selected, setSelected] = useState<FeedbackType | null>(null)
  const [remark, setRemark] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { member, selectedBenefit, reset } = useAppStore()
  const { submitFeedback } = useFeedbackStore()
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (!selected || !member || !selectedBenefit) return
    submitFeedback(member.id, selectedBenefit.id, selected, remark)
    setSubmitted(true)
    setTimeout(() => {
      reset()
      navigate('/')
    }, 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">反馈已提交</p>
        <p className="mt-1 text-xs text-slate-400">正在返回首页...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回
      </button>

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs text-slate-500">
          会员：<span className="font-medium text-slate-700">{member?.name}</span>
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          权益：<span className="font-medium text-slate-700">{selectedBenefit?.title}</span>
        </p>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          请选择反馈结果
        </h3>
        <div className="space-y-2">
          {feedbackOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = selected === opt.type
            return (
              <button
                key={opt.type}
                onClick={() => setSelected(opt.type)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                  isActive
                    ? `${opt.activeBg} ${opt.activeBorder}`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? opt.color : 'text-slate-300'}`} />
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
                {isActive && (
                  <div className="ml-auto">
                    <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center" style={{ color: opt.activeBorder.replace('border-', '') }}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">备注（选填）</label>
        <input
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="可填写补充说明"
          className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Send className="h-4 w-4" />
        提交反馈
      </button>
    </div>
  )
}
