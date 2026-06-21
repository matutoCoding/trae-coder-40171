import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  UserCheck,
  Bell,
  Gift,
  Pill,
  Users,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import ScriptBubble from './ScriptBubble'

const categoryLabels: Record<string, { label: string; icon: typeof Gift }> = {
  gift: { label: '健康礼包', icon: Gift },
  chronic: { label: '慢病复购', icon: Pill },
  family: { label: '家庭共享', icon: Users },
  other: { label: '其他权益', icon: FileText },
}

export default function BenefitDetail() {
  const { selectedBenefit } = useAppStore()
  const navigate = useNavigate()

  if (!selectedBenefit) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText className="h-10 w-10 mb-3" />
        <p className="text-sm">未选择权益</p>
      </div>
    )
  }

  const cat = categoryLabels[selectedBenefit.category] || categoryLabels.other

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/benefits')}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回权益列表
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">{selectedBenefit.title}</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{selectedBenefit.description}</p>
          </div>
          <StatusBadge status={selectedBenefit.status} size="md" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <cat.icon className="h-3.5 w-3.5" />
          <span>{cat.label}</span>
          <span className="text-slate-300">|</span>
          <span>到期 {selectedBenefit.expiryDate}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">操作指引</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">可参与商品</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{selectedBenefit.eligibleProducts}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">
                会员确认
                {selectedBenefit.needsConfirmation && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    需要
                  </span>
                )}
                {!selectedBenefit.needsConfirmation && (
                  <span className="ml-1.5 text-emerald-600">不需要</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedBenefit.needsConfirmation
                  ? '操作前需征得顾客确认'
                  : '无需额外确认，可直接操作'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">结算提醒</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{selectedBenefit.checkoutReminder}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">标准话术</h3>
        <ScriptBubble script={selectedBenefit.script} />
      </div>

      <button
        onClick={() => navigate('/feedback')}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
      >
        前往提交反馈
      </button>
    </div>
  )
}
