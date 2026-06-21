import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import IdentifyPage from "@/pages/IdentifyPage"
import BenefitsPage from "@/pages/BenefitsPage"
import DetailPage from "@/pages/DetailPage"
import FeedbackPage from "@/pages/FeedbackPage"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-md">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800">医保个账权益提醒</h1>
                <p className="text-[10px] text-slate-400">药店收银辅助工具</p>
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
    </Router>
  )
}
