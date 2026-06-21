import { useMemo, useState } from 'react'
import { useFeedbackStore } from '@/store/useAppStore'
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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { FeedbackType } from '@/types'

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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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

export default function ReviewPage() {
  const { submittedFeedbacks } = useFeedbackStore()
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const [memberFilter, setMemberFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all')
  const [keyword, setKeyword] = useState('')

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
          if (
            !f.benefitTitle.toLowerCase().includes(kw) &&
            !f.memberName.toLowerCase().includes(kw) &&
            !f.cashierName.toLowerCase().includes(kw)
          ) {
            return false
          }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
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
          {
            label: '已提醒',
            value: stats.reminded,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            sub: `覆盖 ${stats.coverage}%`,
          },
          {
            label: '顾客不用',
            value: stats.declined,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            sub: '不参与',
          },
          {
            label: '政策不适用',
            value: stats.inapplicable,
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            sub: '不匹配',
          },
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
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="h-3 w-3" />
              时间范围
            </div>
            <div className="flex gap-1.5">
              {timeOptions.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTimeFilter(t.key)}
                  className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    timeFilter === t.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
              <Users className="h-3 w-3" />
              会员
            </div>
            <div className="relative">
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">全部会员</option>
                {members.length === 0 && (
                  <option disabled value="__empty__">（暂无记录）</option>
                )}
                {members.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
              <Tag className="h-3 w-3" />
              反馈结果
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                全部
              </button>
              {feedbackOptions.map((f) => (
                <button
                  key={f.type}
                  onClick={() => setTypeFilter(f.type)}
                  className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                    typeFilter === f.type
                      ? `${f.badgeBg} ${f.badgeText} shadow-sm`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索权益名、会员、收银员..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            服务记录 <span className="ml-1 font-normal text-slate-400">共 {filtered.length} 条</span>
          </h3>
        </div>
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
                <div
                  key={f.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {f.benefitTitle}
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${opt.badgeBg} ${opt.badgeText}`}
                        >
                          <span className={`h-1 w-1 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {f.memberName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {f.cashierName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(f.createdAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {f.remark && (
                    <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">
                      💬 {f.remark}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
