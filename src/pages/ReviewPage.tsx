import { useMemo, useState } from 'react'
import { useFeedbackStore } from '@/store/useAppStore'
import { mockMembers, mockBenefits } from '@/data/mockData'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Ban,
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
  FileText,
  MessageSquare,
  Clock,
  ChevronRight,
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
]

type TimeFilter = 'all' | 'today' | 'week'

const timeOptions: { key: TimeFilter; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'all', label: '全部' },
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

      <div className="rounded-xl border-2 bg-white p-4 shadow-sm" style={{ borderColor: opt.dot === 'bg-emerald-500' ? '#16a34a' : opt.dot === 'bg-amber-500' ? '#eab308' : '#dc2626' }}>
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
        {record.remark && (
          <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
            <p className="text-[10px] text-blue-400">备注</p>
            <p className="mt-0.5 text-xs text-blue-700">{record.remark}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function exportCSV(records: FeedbackRecord[]) {
  const header = '会员,会员ID,权益,权益ID,反馈结果,备注,收银员,收银员ID,时间'
  const rows = records.map((r) => {
    const opt = feedbackOptions.find((o) => o.type === r.type)
    return [
      r.memberName,
      r.memberId,
      r.benefitTitle,
      r.benefitId,
      opt?.label || r.type,
      r.remark || '',
      r.cashierName,
      r.cashierId,
      new Date(r.createdAt).toLocaleString('zh-CN'),
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
  const [exportToast, setExportToast] = useState(false)

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
        if (keyword.trim()) {
          const kw = keyword.trim().toLowerCase()
          if (!f.benefitTitle.toLowerCase().includes(kw) && !f.memberName.toLowerCase().includes(kw) && !f.cashierName.toLowerCase().includes(kw)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [submittedFeedbacks, timeFilter, memberFilter, typeFilter, keyword])

  const stats = useMemo(() => {
    const total = filtered.length
    const reminded = filtered.filter((f) => f.type === 'reminded').length
    const declined = filtered.filter((f) => f.type === 'declined').length
    const inapplicable = filtered.filter((f) => f.type === 'inapplicable').length
    const coverage = total > 0 ? Math.round((reminded / total) * 100) : 0
    return { total, reminded, declined, inapplicable, coverage }
  }, [filtered])

  const handleExport = () => {
    exportCSV(filtered)
    setExportToast(true)
    setTimeout(() => setExportToast(false), 2500)
  }

  if (detailRecord) {
    return <RecordDetail record={detailRecord} onBack={() => setDetailRecord(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
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
          { label: '政策不适用', value: stats.inapplicable, bg: 'bg-slate-50', text: 'text-slate-600', sub: '不匹配' },
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5" />
          筛选条件
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
          <div>
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500"><Tag className="h-3 w-3" />反馈结果</div>
            <div className="flex gap-1.5">
              <button onClick={() => setTypeFilter('all')} className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${typeFilter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>全部</button>
              {feedbackOptions.map((f) => (
                <button key={f.type} onClick={() => setTypeFilter(f.type)} className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${typeFilter === f.type ? `${f.badgeBg} ${f.badgeText} shadow-sm` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />{f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索权益名、会员、收银员..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            服务记录 <span className="ml-1 font-normal text-slate-400">共 {filtered.length} 条</span>
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
        ) : (
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
                  {f.remark && (
                    <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">💬 {f.remark}</div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
