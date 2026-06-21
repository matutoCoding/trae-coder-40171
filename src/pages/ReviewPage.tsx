import { useMemo, useState } from 'react'
import { useFeedbackStore } from '@/store/useAppStore'
import { mockMembers, mockBenefits } from '@/data/mockData'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Ban,
  MinusCircle,
  Filter,
  Calendar,
  Users,
  Tag,
  ChevronDown,
  Search,
  Download,
  Check,
  User,
  Shield,
  Clock,
  ChevronRight,
  Receipt,
  ShoppingBag,
  List,
  Layers,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CalendarClock,
  Phone,
  PhoneCall,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { FeedbackType, FeedbackRecord, Benefit } from '@/types'

const feedbackOptions: {
  type: FeedbackType
  label: string
  icon: typeof CheckCircle2
  badgeBg: string
  badgeText: string
  dot: string
}[] = [
  {
    type: 'reminded',
    label: '已提醒',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    type: 'declined',
    label: '顾客不用',
    icon: XCircle,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    type: 'inapplicable',
    label: '政策不适用',
    icon: Ban,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dot: 'bg-slate-500',
  },
  {
    type: 'not_needed',
    label: '暂不需要',
    icon: MinusCircle,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    dot: 'bg-slate-400',
  },
]

const PROCESSED_TYPES: FeedbackType[] = ['reminded', 'declined', 'not_needed']
const isProcessed = (t: FeedbackType) => PROCESSED_TYPES.includes(t)

type TimeFilter = 'all' | 'today' | 'week'
type ViewMode = 'list' | 'session' | 'shift' | 'followup'

const timeOptions: { key: TimeFilter; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'all', label: '全部' },
]

const viewTabs: { key: ViewMode; label: string; icon: typeof List }[] = [
  { key: 'list', label: '按记录', icon: List },
  { key: 'session', label: '按收银单', icon: Layers },
  { key: 'shift', label: '交班汇总', icon: UserCheck },
  { key: 'followup', label: '待跟进', icon: AlertCircle },
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isThisWeek(d: Date) {
  const now = new Date()
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = day === 0 ? 6 : day - 1
  weekStart.setDate(weekStart.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)
  return d >= weekStart
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCompletion(records: FeedbackRecord[]): { processed: number; total: number; pct: number } {
  const processed = records.filter((r) => isProcessed(r.type)).length
  const total = records.length
  return { processed, total, pct: total > 0 ? Math.round((processed / total) * 100) : 0 }
}

interface SessionGroup {
  sessionId: string
  records: FeedbackRecord[]
  memberName: string
  memberId: string
  cashierName: string
  cashierId: string
  createdAt: string
  coveredAmount: number
  cartItemCount: number
  cartSummary: string
  completion: ReturnType<typeof getCompletion>
}

interface ShiftSummary {
  dateKey: string
  dateLabel: string
  cashierId: string
  cashierName: string
  sessions: number
  totalFeedbacks: number
  reminded: number
  declined: number
  inapplicable: number
  notNeeded: number
  processed: number
  completionPct: number
  declinedPct: number
  coveredAmountTotal: number
  sessionGroups: SessionGroup[]
}

interface FollowupItem {
  record: FeedbackRecord
  memberName: string
  benefitId: string
  benefitTitle: string
  expiryDate: string
  daysLeft: number
  feedbackType: FeedbackType
  createdAt: string
  memberPhone?: string
  benefitDescription?: string
}

function RecordDetail({ record, onBack }: { record: FeedbackRecord; onBack: () => void }) {
  const opt = feedbackOptions.find((o) => o.type === record.type)!
  const Icon = opt.icon
  const member = mockMembers.find((m) => m.id === record.memberId)
  const benefit = mockBenefits.find((b) => b.id === record.benefitId)

  return (
    <div className="space-y-4" style={{ animation: 'fadeSlideIn 0.25s ease' }}>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回服务记录列表
      </button>

      <div className="rounded-xl border-2 bg-white p-4 shadow-sm" style={{ borderColor: opt.dot === 'bg-emerald-500' ? '#16a34a' : opt.dot === 'bg-amber-500' ? '#eab308' : opt.dot === 'bg-slate-400' ? '#94a3b8' : '#dc2626' }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">{record.benefitTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">{record.memberName}</p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${opt.badgeBg} ${opt.badgeText}`}>
            <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
            {opt.label}
          </span>
        </div>
      </div>

      {member && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <User className="h-3.5 w-3.5" />
            会员信息
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '姓名', value: member.name },
              { label: '手机号', value: member.phone },
              { label: '会员等级', value: member.level },
              { label: '医保类型', value: member.insuranceType },
            ].map((r) => (
              <div key={r.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">{r.label}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-700">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {benefit && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            权益说明
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">{benefit.description}</p>
          <div className="mt-3 space-y-1.5">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400">可参与商品</p>
              <p className="mt-0.5 text-xs text-slate-700">{benefit.eligibleProducts}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400">操作指引</p>
              <p className="mt-0.5 text-xs text-slate-700">{benefit.guide}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" />
          反馈结果
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">反馈类型</p>
            <p className={`mt-0.5 text-xs font-medium ${opt.badgeText}`}>{opt.label}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">收银员</p>
            <p className="mt-0.5 text-xs font-medium text-slate-700">{record.cashierName}（{record.cashierId}）</p>
          </div>
          <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">反馈时间</p>
            <p className="mt-0.5 text-xs font-medium text-slate-700">
              {new Date(record.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
          <p className="text-[10px] text-blue-400">备注</p>
          <p className="mt-0.5 text-xs text-blue-700">{record.remark || '暂无备注'}</p>
        </div>
      </div>

      {record.cartSummary && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <ShoppingBag className="h-3.5 w-3.5" />
            本单信息
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400">医保内金额</p>
              <p className="mt-0.5 text-xs font-medium text-blue-600">¥{record.coveredAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400">商品数量</p>
              <p className="mt-0.5 text-xs font-medium text-slate-700">{record.cartItemCount} 件</p>
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">商品概览</p>
            <p className="mt-0.5 text-xs text-slate-700">{record.cartSummary}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionDetail({ group, onBack }: { group: SessionGroup; onBack: () => void }) {
  const { processed, total, pct } = group.completion
  return (
    <div className="space-y-4" style={{ animation: 'fadeSlideIn 0.25s ease' }}>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回收银单列表
      </button>

      <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">收银单 {group.sessionId.slice(-6)}</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(group.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            pct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {pct === 100 ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            提醒处理 {pct}%
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <ShoppingBag className="h-3.5 w-3.5" />
          本单概况
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">会员</p>
            <p className="mt-0.5 text-xs font-medium text-slate-700">{group.memberName}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">收银员</p>
            <p className="mt-0.5 text-xs font-medium text-slate-700">{group.cashierName}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] text-slate-400">医保内金额</p>
            <p className="mt-0.5 text-xs font-medium text-blue-600">¥{group.coveredAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-400">商品概览（{group.cartItemCount}件）</p>
          <p className="mt-0.5 text-xs text-slate-700">{group.cartSummary || '无记录'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <List className="h-3.5 w-3.5" />
          权益反馈明细（{processed}/{total} 已处理）
        </h3>
        <div className="space-y-2">
          {group.records.map((r) => {
            const rOpt = feedbackOptions.find((o) => o.type === r.type)!
            const RIcon = rOpt.icon
            return (
              <div key={r.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${rOpt.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium text-slate-800">{r.benefitTitle}</p>
                      <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium ${rOpt.badgeBg} ${rOpt.badgeText}`}>
                        <RIcon className="h-2.5 w-2.5" />
                        {rOpt.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 ml-4 rounded-md bg-blue-50 px-2.5 py-1.5">
                  <p className="text-[10px] text-blue-400">备注</p>
                  <p className="mt-0.5 text-[11px] text-blue-700">{r.remark || '暂无备注'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function exportCSV(records: FeedbackRecord[]) {
  const header = '会员,会员ID,权益,权益ID,反馈结果,备注,收银员,收银员ID,时间,收银单号,医保内金额,提醒完成状态'
  const rows = records.map((r) => {
    const opt = feedbackOptions.find((o) => o.type === r.type)
    return [
      r.memberName,
      r.memberId,
      r.benefitTitle,
      r.benefitId,
      opt?.label || r.type,
      r.remark || '暂无备注',
      r.cashierName,
      r.cashierId,
      new Date(r.createdAt).toLocaleString('zh-CN'),
      r.sessionId,
      r.coveredAmount.toFixed(2),
      isProcessed(r.type) ? '已处理' : '未处理',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  })
  const bom = '\uFEFF'
  const csv = bom + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `服务记录_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReviewPage() {
  const { submittedFeedbacks } = useFeedbackStore()
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const [memberFilter, setMemberFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [detailRecord, setDetailRecord] = useState<FeedbackRecord | null>(null)
  const [detailSession, setDetailSession] = useState<SessionGroup | null>(null)
  const [exportToast, setExportToast] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterCashierId, setFilterCashierId] = useState<string | null>(null)

  const members = useMemo(() => {
    const set = new Map<string, string>()
    submittedFeedbacks.forEach((f) => set.set(f.memberId, f.memberName))
    return Array.from(set.entries())
  }, [submittedFeedbacks])

  const filtered = useMemo(() => {
    const now = new Date()
    return submittedFeedbacks
      .filter((f) => {
        const d = new Date(f.createdAt)
        if (timeFilter === 'today' && !isSameDay(d, now)) return false
        if (timeFilter === 'week' && !isThisWeek(d)) return false
        if (memberFilter !== 'all' && f.memberId !== memberFilter) return false
        if (typeFilter !== 'all' && f.type !== typeFilter) return false
        if (filterCashierId && f.cashierId !== filterCashierId) return false
        if (keyword.trim()) {
          const kw = keyword.trim().toLowerCase()
          if (!f.benefitTitle.toLowerCase().includes(kw) && !f.memberName.toLowerCase().includes(kw) && !f.cashierName.toLowerCase().includes(kw)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [submittedFeedbacks, timeFilter, memberFilter, typeFilter, keyword, filterCashierId])

  const sessionGroups = useMemo((): SessionGroup[] => {
    const groups = new Map<string, FeedbackRecord[]>()
    filtered.forEach((f) => {
      const existing = groups.get(f.sessionId) || []
      existing.push(f)
      groups.set(f.sessionId, existing)
    })
    return Array.from(groups.entries())
      .map(([sessionId, records]) => {
        const sorted = records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        return {
          sessionId,
          records: sorted,
          memberName: sorted[0].memberName,
          memberId: sorted[0].memberId,
          cashierName: sorted[0].cashierName,
          cashierId: sorted[0].cashierId,
          createdAt: sorted[0].createdAt,
          coveredAmount: sorted[0].coveredAmount,
          cartItemCount: sorted[0].cartItemCount,
          cartSummary: sorted[0].cartSummary,
          completion: getCompletion(sorted),
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [filtered])

  const shiftSummaries = useMemo((): ShiftSummary[] => {
    const map = new Map<string, ShiftSummary>()
    sessionGroups.forEach((sg) => {
      const d = new Date(sg.createdAt)
      const dk = dateKey(d)
      const key = `${dk}|${sg.cashierId}`
      const existing = map.get(key)
      if (existing) {
        existing.sessions++
        existing.totalFeedbacks += sg.records.length
        sg.records.forEach((r) => {
          if (r.type === 'reminded') existing.reminded++
          else if (r.type === 'declined') existing.declined++
          else if (r.type === 'inapplicable') existing.inapplicable++
          else if (r.type === 'not_needed') existing.notNeeded++
          if (isProcessed(r.type)) existing.processed++
        })
        existing.coveredAmountTotal += sg.coveredAmount
        existing.sessionGroups.push(sg)
      } else {
          const records = sg.records
          map.set(key, {
            dateKey: dk,
            dateLabel: new Date(dk).toLocaleDateString('zh-CN'),
            cashierId: sg.cashierId,
            cashierName: sg.cashierName,
            sessions: 1,
            totalFeedbacks: records.length,
            reminded: records.filter((r) => r.type === 'reminded').length,
            declined: records.filter((r) => r.type === 'declined').length,
            inapplicable: records.filter((r) => r.type === 'inapplicable').length,
            notNeeded: records.filter((r) => r.type === 'not_needed').length,
            processed: records.filter((r) => isProcessed(r.type)).length,
            completionPct: 0,
            declinedPct: 0,
            coveredAmountTotal: sg.coveredAmount,
            sessionGroups: [sg],
          })
        }
    })
    return Array.from(map.values()).map((s) => {
      s.completionPct = s.totalFeedbacks > 0 ? Math.round((s.processed / s.totalFeedbacks) * 100) : 0
      s.declinedPct = s.totalFeedbacks > 0 ? Math.round((s.declined / s.totalFeedbacks) * 100) : 0
      return s
    }).sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.cashierId.localeCompare(b.cashierId))
  }, [sessionGroups])

  const followupItems = useMemo((): FollowupItem[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const benefitExpiry = new Map<string, string>()
    mockBenefits.forEach((b) => benefitExpiry.set(b.id, b.expiryDate))
    return filtered
      .filter((r) => r.type === 'declined' || r.type === 'not_needed')
      .map((r): FollowupItem | null => {
        const expiry = benefitExpiry.get(r.benefitId)
        if (!expiry) return null
        const ed = new Date(expiry)
        const daysLeft = Math.ceil((ed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysLeft > 30) return null
        const member = mockMembers.find((m) => m.id === r.memberId)
        const benefit = mockBenefits.find((b) => b.id === r.benefitId)
        return {
          record: r,
          memberName: r.memberName,
          benefitId: r.benefitId,
          benefitTitle: r.benefitTitle,
          expiryDate: expiry,
          daysLeft,
          feedbackType: r.type,
          createdAt: r.createdAt,
          memberPhone: member?.phone,
          benefitDescription: benefit?.description,
        }
      })
      .filter((x): x is FollowupItem => x !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [filtered])

  const stats = useMemo(() => {
    const total = filtered.length
    const reminded = filtered.filter((f) => f.type === 'reminded').length
    const declined = filtered.filter((f) => f.type === 'declined').length
    const inapplicable = filtered.filter((f) => f.type === 'inapplicable').length
    const notNeeded = filtered.filter((f) => f.type === 'not_needed').length
    const processed = reminded + declined + notNeeded
    const coverage = total > 0 ? Math.round((processed / total) * 100) : 0
    return { total, reminded, declined, inapplicable, notNeeded, processed, coverage }
  }, [filtered])

  const handleExport = () => {
    exportCSV(filtered)
    setExportToast(true)
    setTimeout(() => setExportToast(false), 2500)
  }

  if (detailRecord) {
    return <RecordDetail record={detailRecord} onBack={() => setDetailRecord(null)} />
  }

  if (detailSession) {
    return <SessionDetail group={detailSession} onBack={() => setDetailSession(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { navigate('/'); setFilterCashierId(null) }} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回收银台
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1">
          <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-600">店长复盘</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '总记录', value: stats.total, bg: 'bg-blue-50', text: 'text-blue-600', sub: '条' },
          { label: '已提醒', value: stats.reminded, bg: 'bg-emerald-50', text: 'text-emerald-600', sub: `覆盖 ${stats.coverage}%` },
          { label: '顾客不用', value: stats.declined, bg: 'bg-amber-50', text: 'text-amber-600', sub: '不参与' },
          { label: '其他', value: stats.inapplicable + stats.notNeeded, bg: 'bg-slate-50', text: 'text-slate-600', sub: '不适用/不需要' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} p-3`}>
            <p className="text-[10px] font-medium text-slate-500">{s.label}</p>
            <p className={`mt-0.5 text-xl font-bold ${s.text}`}>
              {s.value}
              <span className="ml-0.5 text-[10px] font-normal text-slate-400">{s.sub}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            筛选条件
          </div>
          <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
            {viewTabs.map((t) => {
              const TIcon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => { setViewMode(t.key); setFilterCashierId(null) }}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${viewMode === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <TIcon className="h-3 w-3" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-2.5">
          <div>
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500"><Calendar className="h-3 w-3" />时间范围</div>
            <div className="flex gap-1.5">
              {timeOptions.map((t) => (
                <button key={t.key} onClick={() => setTimeFilter(t.key)} className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${timeFilter === t.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500"><Users className="h-3 w-3" />会员</div>
            <div className="relative">
              <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-blue-500 focus:outline-none">
                <option value="all">全部会员</option>
                {members.map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          {viewMode !== 'shift' && viewMode !== 'followup' && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500"><Tag className="h-3 w-3" />反馈结果</div>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => setTypeFilter('all')} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${typeFilter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>全部</button>
                {feedbackOptions.map((f) => (
                  <button key={f.type} onClick={() => setTypeFilter(f.type)} className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${typeFilter === f.type ? `${f.badgeBg} ${f.badgeText} shadow-sm` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />{f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索权益名、会员、收银员..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'shift' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              交班汇总 <span className="ml-1 font-normal text-slate-400">共 {shiftSummaries.length} 班次</span>
              {filterCashierId && (
                <span className="ml-2 text-blue-600">· 已筛选收银员：{shiftSummaries.find(s => s.cashierId === filterCashierId)?.cashierName || filterCashierId}</span>
              )}
            </h3>
            {filterCashierId && (
              <button onClick={() => setFilterCashierId(null)} className="text-[11px] font-medium text-slate-500 hover:text-slate-700">清除筛选</button>
            )}
          </div>
          {shiftSummaries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <UserCheck className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">当前筛选条件下暂无交班数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {shiftSummaries.map((s) => (
                <button
                  key={`${s.dateKey}-${s.cashierId}`}
                  onClick={() => setFilterCashierId(s.cashierId)}
                  className="group rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-indigo-500" />
                        <p className="text-sm font-semibold text-slate-800">{s.cashierName}</p>
                        <span className="text-[10px] text-slate-400">· {s.dateLabel}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><Receipt className="h-3 w-3" />{s.sessions} 笔收银单</span>
                        <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{s.totalFeedbacks} 条权益</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div className="rounded-md bg-emerald-50 px-2 py-1.5">
                          <p className="text-[9px] text-emerald-600">提醒处理率</p>
                          <p className="text-xs font-bold text-emerald-700">{s.completionPct}%</p>
                        </div>
                        <div className="rounded-md bg-amber-50 px-2 py-1.5">
                          <p className="text-[9px] text-amber-600">顾客不用占</p>
                          <p className="text-xs font-bold text-amber-700">{s.declinedPct}%</p>
                        </div>
                        <div className="rounded-md bg-blue-50 px-2 py-1.5">
                          <p className="text-[9px] text-blue-600">医保内</p>
                          <p className="text-xs font-bold text-blue-700">¥{s.coveredAmountTotal.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'followup' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              待跟进列表 <span className="ml-1 font-normal text-slate-400">共 {followupItems.length} 条（30天内到期且顾客不用/暂不需要）</span>
            </h3>
          </div>
          {followupItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">暂无需要跟进的权益</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followupItems.map((item) => {
                const fopt = feedbackOptions.find((o) => o.type === item.feedbackType)!
                const FIcon = fopt.icon
                const expirySoon = item.daysLeft <= 7
                const expiryDanger = item.daysLeft <= 3
                return (
                  <button
                    key={item.record.id}
                    onClick={() => setDetailRecord(item.record)}
                    className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-slate-800">{item.benefitTitle}</p>
                          <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${fopt.badgeBg} ${fopt.badgeText}`}>
                            <FIcon className="h-2.5 w-2.5" />
                            {fopt.label}
                          </span>
                          {expiryDanger ? (
                            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                              <AlertCircle className="h-2.5 w-2.5" />
                              紧急 剩{item.daysLeft}天
                            </span>
                          ) : expirySoon ? (
                            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                              <Clock className="h-2.5 w-2.5" />
                              剩{item.daysLeft}天
                            </span>
                          ) : (
                            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                              剩{item.daysLeft}天
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{item.memberName}</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />到期 {item.expiryDate}</span>
                          {item.memberPhone && (
                            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{item.memberPhone}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {(viewMode === 'list' || viewMode === 'session') && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {viewMode === 'list' ? '服务记录' : '收银单记录'} <span className="ml-1 font-normal text-slate-400">共 {viewMode === 'list' ? filtered.length : sessionGroups.length} {viewMode === 'list' ? '条' : '单'}</span>
            </h3>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Download className="h-3.5 w-3.5" />
              导出报表
            </button>
          </div>

          {exportToast && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 shadow-sm" style={{ animation: 'fadeSlideIn 0.25s ease' }}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700">导出成功</p>
                <p className="text-[11px] text-emerald-600">已导出 {filtered.length} 条服务记录到 CSV 文件</p>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">当前筛选条件下暂无记录</p>
              <p className="mt-0.5 text-[11px] text-slate-400">先去收银台提交一些反馈吧</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {filtered.map((f) => {
                const opt = feedbackOptions.find((o) => o.type === f.type)!
                const Icon = opt.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setDetailRecord(f)}
                    className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-slate-800">{f.benefitTitle}</p>
                          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${opt.badgeBg} ${opt.badgeText}`}>
                            <span className={`h-1 w-1 rounded-full ${opt.dot}`} />{opt.label}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{f.memberName}</span>
                          <span className="inline-flex items-center gap-1"><Icon className="h-3 w-3" />{f.cashierName}</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(f.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </div>
                    {(f.remark || f.coveredAmount > 0) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {f.remark && (
                          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">💬 {f.remark}</span>
                        )}
                        {f.coveredAmount > 0 && (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] text-blue-600">医保内 ¥{f.coveredAmount.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {sessionGroups.map((group) => (
                <button
                  key={group.sessionId}
                  onClick={() => setDetailSession(group)}
                  className="group w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-semibold text-slate-800">收银单 {group.sessionId.slice(-6)}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          group.completion.pct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {group.completion.pct === 100 ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                          处理 {group.completion.pct}%
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{group.memberName}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(group.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{group.cartItemCount}件商品</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {group.coveredAmount > 0 && (
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">医保内 ¥{group.coveredAmount.toFixed(2)}</span>
                        )}
                        {group.records.slice(0, 3).map((r) => {
                          const rOpt = feedbackOptions.find((o) => o.type === r.type)!
                          return (
                            <span key={r.id} className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${rOpt.badgeBg} ${rOpt.badgeText}`}>
                              <span className={`h-1 w-1 rounded-full ${rOpt.dot}`} />
                              {r.benefitTitle.slice(0, 6)}
                            </span>
                          )
                        })}
                        {group.records.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{group.records.length - 3}项</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
