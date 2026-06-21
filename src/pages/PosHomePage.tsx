import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import IdentifyPage from "@/pages/IdentifyPage"
import BenefitsPage from "@/pages/BenefitsPage"
import DetailPage from "@/pages/DetailPage"
import FeedbackPage from "@/pages/FeedbackPage"
import ReviewPage from "@/pages/ReviewPage"
import CashierPanel from "@/components/CashierPanel"
import { useFeedbackStore } from "@/store/useAppStore"
import {
  BarChart3,
  Receipt,
  LayoutDashboard,
  Layers,
} from "lucide-react"
import { useEffect } from "react"

function seedDemoFeedbacks() {
  const { submitFeedback } = useFeedbackStore.getState()
  if (useFeedbackStore.getState().submittedFeedbacks.length > 0) return
  const members: Array<[string, string]> = [
    ['M001', '张丽华'], ['M002', '王建国'], ['M003', '李秀英'],
  ]
  const benefits: Array<[string, string]> = [
    ['B001', '满额健康礼包'], ['B002', '慢病复购提醒'], ['B003', '家庭账户共享'],
    ['B005', '满额健康礼包'], ['B006', '慢病复购提醒'], ['B007', '家庭账户共享'],
  ]
  const sample: Array<{ m: number; b: number; t: 'reminded' | 'declined' | 'inapplicable'; mins: number; r: string }> = [
    { m: 0, b: 0, t: 'reminded', mins: 120, r: '顾客领取了礼包' },
    { m: 0, b: 2, t: 'declined', mins: 90, r: '不需要共享给家人' },
    { m: 1, b: 3, t: 'reminded', mins: 60, r: '' },
    { m: 1, b: 4, t: 'inapplicable', mins: 40, r: '未带处方' },
    { m: 2, b: 5, t: 'reminded', mins: 20, r: '已使用共济账户' },
  ]
  const base = new Date()
  sample.forEach((s) => {
    const [mid, mname] = members[s.m]
    const [bid, bname] = benefits[s.b]
    const created = new Date(base.getTime() - s.mins * 60 * 1000).toISOString()
    useFeedbackStore.setState((state) => {
      const entry = {
        id: `F_seed_${Math.random().toString(36).slice(2, 7)}`,
        memberId: mid,
        memberName: mname,
        benefitId: bid,
        benefitTitle: bname,
        type: s.t,
        remark: s.r,
        cashierId: 'C001',
        cashierName: '李收银',
        createdAt: created,
      }
      const updated = [...state.submittedFeedbacks, entry]
      localStorage.setItem('feedbacks_v2', JSON.stringify(updated))
      return { submittedFeedbacks: updated }
    })
  })
}

function RightsPanel() {
  const navigate = useNavigate()
  const total = useFeedbackStore((s) => s.submittedFeedbacks.length)
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/20">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">医保个账权益提醒</h1>
              <p className="text-[10px] text-slate-400">收银辅助 · 并排显示</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/review')}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          >
            <BarChart3 className="h-3 w-3" />
            复盘
            {total > 0 && <span className="rounded-full bg-white px-1 text-[10px] font-semibold">{total}</span>}
          </button>
        </div>
      </header>
      <main className="px-4 py-4 pb-8">
        <Routes>
          <Route path="/" element={<IdentifyPage />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/benefit/:id" element={<DetailPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </main>
      </div>
  )
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-slate-100">{children}</div>
}

function DualPaneCashier() {
  return (
    <LayoutShell>
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[1fr_440px]">
        <div className="hidden h-full min-w-0 border-r border-slate-200 bg-white md:block">
          <CashierPanel />
        </div>
        <div className="h-full min-w-0 border-l border-slate-200 md:block">
          <Routes>
            <Route path="/" element={<RightsPanel />} />
            <Route path="/benefits" element={<RightsPanel />} />
            <Route path="/benefit/:id" element={<RightsPanel />} />
            <Route path="/feedback" element={<RightsPanel />} />
          </Routes>
        </div>
        <div className="h-full w-full overflow-y-auto md:hidden">
          <div className="mx-auto max-w-md">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-800">医保个账权益提醒</h1>
                  <p className="text-[10px] text-slate-400">小屏模式</p>
                </div>
              </div>
            </header>
            <main className="px-4 py-4 pb-8">
              <Routes>
                <Route path="/" element={<IdentifyPage />} />
                <Route path="/benefits" element={<BenefitsPage />} />
                <Route path="/benefit/:id" element={<DetailPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}

function ReviewShell() {
  return (
    <LayoutShell>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Receipt className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">收银台</h1>
              <p className="text-[10px] text-slate-400">返回收银开票</p>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">店长复盘工作台</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl">
            <ReviewPage />
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}

export default function PosHomePage() {
  useEffect(() => {
    seedDemoFeedbacks()
  }, [])
  return (
    <Router>
      <Routes>
        <Route path="/review" element={<ReviewShell />} />
        <Route path="*" element={<DualPaneCashier />} />
      </Routes>
    </Router>
  )
}
