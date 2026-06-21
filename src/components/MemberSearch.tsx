import { useState } from 'react'
import { Search, ScanLine, Loader2, UserCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import MemberInfo from './MemberInfo'

export default function MemberSearch() {
  const [phone, setPhone] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [activeTab, setActiveTab] = useState<'phone' | 'scan'>('phone')
  const [notFound, setNotFound] = useState(false)
  const { member, loading, searchByPhone, searchByCode } = useAppStore()

  const handlePhoneSearch = () => {
    if (phone.length === 11) {
      setNotFound(false)
      searchByPhone(phone)
      setTimeout(() => {
        const m = useAppStore.getState().member
        if (!m) setNotFound(true)
      }, 700)
    }
  }

  const handleScanSearch = () => {
    if (scanCode.trim()) {
      setNotFound(false)
      searchByCode(scanCode.trim())
      setTimeout(() => {
        const m = useAppStore.getState().member
        if (!m) setNotFound(true)
      }, 500)
    }
  }

  if (member) {
    return <MemberInfo />
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => { setActiveTab('phone'); setNotFound(false) }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
            activeTab === 'phone'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            手机号查询
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('scan'); setNotFound(false) }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
            activeTab === 'scan'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <ScanLine className="h-3.5 w-3.5" />
            会员码扫描
          </span>
        </button>
      </div>

      {activeTab === 'phone' ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setPhone(v)
                setNotFound(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePhoneSearch()}
              placeholder="请输入11位手机号"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-center text-lg tracking-[0.25em] font-mono placeholder:tracking-normal placeholder:text-sm placeholder:font-sans placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
            {phone.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {phone.length}/11
              </span>
            )}
          </div>
          <button
            onClick={handlePhoneSearch}
            disabled={phone.length !== 11 || loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                查询中...
              </span>
            ) : (
              '查询会员权益'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition-colors"
            onClick={() => document.getElementById('scan-input')?.focus()}
          >
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            ) : (
              <ScanLine className="h-10 w-10 text-slate-400" />
            )}
            <p className="mt-2 text-sm text-slate-400">
              {loading ? '识别中...' : '请使用扫码枪扫描会员码'}
            </p>
          </div>
          <input
            id="scan-input"
            type="text"
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScanSearch()}
            placeholder="或手动输入会员码"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleScanSearch}
            disabled={!scanCode.trim() || loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
          >
            查询会员权益
          </button>
        </div>
      )}

      {notFound && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          未找到该会员信息，请确认手机号或会员码是否正确
        </div>
      )}

      <div className="rounded-xl bg-blue-50/60 px-4 py-3">
        <p className="text-xs text-blue-600 font-medium mb-1">测试账号</p>
        <div className="space-y-1 text-xs text-blue-500/80">
          <p>13800138001 — 张丽华（金卡 · 职工医保）</p>
          <p>13900139002 — 王建国（银卡 · 居民医保）</p>
          <p>13700137003 — 李秀英（普通 · 职工医保）</p>
          <p>会员码：M001 / M002 / M003</p>
        </div>
      </div>
    </div>
  )
}
