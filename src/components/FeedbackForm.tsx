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
  ChevronRight,
  FileCheck,
  ListChecks,
} from 'lucide-react'
import type { FeedbackType, Benefit } from '@/types'
import StatusBadge from './StatusBadge'

const feedbackOptions: {
  type: FeedbackType
  label: string
  desc: string
  icon: typeof CheckCircle2
  activeBg: string
  activeBorder: string
  activeText: string
  badgeBg: string
  badgeText: string
}[] = [
  {
    type: 'reminded',
    label: '已提醒',
    desc: '已向顾客说明权益内容',
    icon: CheckCircle2,
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-400',
    activeText: 'text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  {
    type: 'declined',
    label: '顾客不用',
    desc: '顾客了解后选择不使用',
    icon: XCircle,
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-400',
    activeText: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  {
    type: 'inapplicable',
    label: '政策不适用',
    desc: '当前商品/政策不适用该权益',
    icon: Ban,
    activeBg: 'bg-slate-50',
    activeBorder: 'border-slate-400',
    activeText: 'text-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
]

const typeLabel = (t: FeedbackType) => feedbackOptions.find((o) => o.type === t)?.label || t

export default function FeedbackForm() {
  const [step, setStep] = useState<'select' | 'feedback' | 'done'>('select')
  const [pickedBenefit, setPickedBenefit] = useState<Benefit | null>(null)
  const [selected, setSelected] = useState<FeedbackType | null>(null)
  const [remark, setRemark] = useState('')
  const { member, benefits, selectedBenefit: preselectedBenefit } = useAppStore()
  const { submitFeedback, submittedFeedbacks } = useFeedbackStore()
  const navigate = useNavigate()

  const initialBenefit = pickedBenefit || preselectedBenefit
  const currentStep = step === 'select' && initialBenefit ? 'feedback' : step

  const myFeedbacks = member
    ? submittedFeedbacks.filter((f) => f.memberId === member.id).slice(-5).reverse()
    : []

  if (!member) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回识别会员
        </button>
        <div className="rounded-xl bg-slate-50 py-10 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">请先识别会员再提交反馈</p>
        </div>
      </div>
    )
  }

  const handlePickBenefit = (b: Benefit) => {
    setPickedBenefit(b)
    setStep('feedback')
  }

  const handleSubmit = () => {
    const b = pickedBenefit || preselectedBenefit
    if (!selected || !b) return
    submitFeedback(member, b, selected, remark)
    setStep('done')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回
        </button>
        <div className="flex items-center gap-1 text-xs">
          <span className={`rounded-full px-2 py-0.5 ${currentStep === 'select' || currentStep === 'feedback' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            1 选权益
          </span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className={`rounded-full px-2 py-0.5 ${currentStep === 'feedback' || currentStep === 'done' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            2 选反馈
          </span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className={`rounded-full px-2 py-0.5 ${currentStep === 'done' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            3 完成
          </span>
        </div>
      </div>

      {currentStep === 'select' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-blue-50/70 px-3.5 py-2.5">
            <p className="text-xs text-blue-700">
              会员：<span className="font-semibold">{member.name}</span>
              <span className="mx-2 text-blue-300">·</span>
              共 <span className="font-semibold">{benefits.length}</span> 项权益可选
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              请选择要反馈的权益
            </h3>
            <div className="space-y-2">
              {benefits.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handlePickBenefit(b)}
                  className="group w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">{b.title}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">到期 {b.expiryDate}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'feedback' && initialBenefit && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
            <p className="text-xs text-slate-500">当前反馈的权益</p>
            <div className="mt-1 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">{initialBenefit.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">会员：{member.name}</p>
              </div>
              <StatusBadge status={initialBenefit.status} />
            </div>
            <button
              onClick={() => {
                setPickedBenefit(null)
                setStep('select')
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              ← 换一项权益
            </button>
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
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? opt.activeText : 'text-slate-300'}`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? 'text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                    {isActive && (
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${opt.badgeBg}`}
                      >
                        <Check className={`h-3 w-3 ${opt.badgeText}`} />
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
      )}

      {currentStep === 'done' && initialBenefit && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 shadow-sm shadow-emerald-200">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="mt-3 text-sm font-semibold text-emerald-700">反馈已提交并记录</p>
            <p className="mt-1 text-xs text-emerald-600/70">
              {initialBenefit.title} · {typeLabel(selected!)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <FileCheck className="mr-1 inline h-3.5 w-3.5" />
                本次会员最近反馈记录
              </h3>
              <span className="text-xs text-slate-400">共 {myFeedbacks.length} 条</span>
            </div>
            {myFeedbacks.length === 0 ? (
              <div className="rounded-xl bg-slate-50 py-6 text-center text-xs text-slate-400">
                暂无历史记录
              </div>
            ) : (
              <div className="space-y-2">
                {myFeedbacks.map((f) => {
                  const opt = feedbackOptions.find((o) => o.type === f.type)!
                  return (
                    <div
                      key={f.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {f.benefitTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {new Date(f.createdAt).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · {f.cashierName}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${opt.badgeBg} ${opt.badgeText}`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      {f.remark && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
                          备注：{f.remark}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep('select')
                setPickedBenefit(null)
                setSelected(null)
                setRemark('')
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              继续反馈其他权益
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              返回收银
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
