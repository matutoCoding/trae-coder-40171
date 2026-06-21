import { useAppStore, useCartStore, useCashierStore, useFeedbackStore } from '@/store/useAppStore'
import {
  Scan,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  BadgeCheck,
  X,
  Sparkles,
  Pill,
  Stethoscope,
  Leaf,
  Check,
  Receipt,
  BarChart3,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { CartItem, Benefit } from '@/types'
import MemberSearch from './MemberSearch'
import CheckoutReminder from './CheckoutReminder'

const QUICK_ITEMS: Array<Omit<CartItem, 'qty'>> = [
  { id: 'P010', name: '复方感冒灵颗粒', price: 18.0, category: '药品', insuranceCovered: true },
  { id: 'P011', name: '硝苯地平缓释片', price: 22.5, category: '药品', insuranceCovered: true },
  { id: 'P012', name: '欧姆龙电子血压计', price: 258.0, category: '医疗器械', insuranceCovered: true },
  { id: 'P013', name: '汤臣倍健蛋白粉', price: 198.0, category: '保健品', insuranceCovered: false },
  { id: 'P014', name: '碘伏棉签', price: 12.0, category: '医疗器械', insuranceCovered: true },
  { id: 'P015', name: '健胃消食片', price: 15.5, category: '药品', insuranceCovered: true },
]

const CAT_ICON: Record<string, typeof Pill> = {
  药品: Pill,
  医疗器械: Stethoscope,
  保健品: Leaf,
}

export default function CashierPanel() {
  const { member, selectBenefit } = useAppStore()
  const { items, addItem, removeItem, updateQty, clear, totalCovered, totalUncovered, total } = useCartStore()
  const { cashierName } = useCashierStore()
  const { submittedFeedbacks } = useFeedbackStore()
  const navigate = useNavigate()
  const [scanInput, setScanInput] = useState('')
  const [checkoutToast, setCheckoutToast] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const handleQuickAdd = (it: Omit<CartItem, 'qty'>) => {
    addItem(it)
    setShowSearch(false)
  }

  const handleCheckout = () => {
    setCheckoutToast(true)
    setTimeout(() => {
      setCheckoutToast(false)
      clear()
    }, 1800)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
            <Receipt className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">收银开票台</h2>
            <p className="text-[10px] text-slate-400">
              工号 {useCashierStore.getState().cashierId} · {cashierName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {member ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">{member.name} 已识别</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">待识别会员</span>
            </div>
          )}
          <button
            onClick={() => navigate('/review')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
            title="店长复盘"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            复盘 {submittedFeedbacks.length > 0 && <span className="rounded-full bg-white/80 px-1.5 text-[10px]">{submittedFeedbacks.length}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-500">扫码/手输条码</label>
          <div className="relative">
            <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && scanInput.trim()) {
                  const quick = QUICK_ITEMS.find(
                    (q) => q.id.toLowerCase() === scanInput.trim().toLowerCase()
                  )
                  if (quick) handleQuickAdd(quick)
                  else
                    addItem({
                      id: scanInput.trim(),
                      name: `商品 ${scanInput.trim()}`,
                      price: 20 + Math.floor(Math.random() * 80),
                      category: '药品',
                      insuranceCovered: Math.random() > 0.3,
                    })
                  setScanInput('')
                }
              }}
              placeholder="扫描条码或输入后回车..."
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="mt-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700"
          >
            {showSearch ? '收起快捷选品' : '+ 快捷选品（模拟扫码）'}
          </button>

          {showSearch && (
            <div
              className="mt-2 grid grid-cols-2 gap-1.5"
              style={{ animation: 'fadeSlideIn 0.2s ease' }}
            >
              {QUICK_ITEMS.map((q) => {
                const Icon = CAT_ICON[q.category] || Pill
                return (
                  <button
                    key={q.id}
                    onClick={() => handleQuickAdd(q)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        q.insuranceCovered ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-700">{q.name}</p>
                      <p className="text-[10px] text-slate-400">
                        ¥{q.price.toFixed(2)}
                        {q.insuranceCovered ? ' · 可医保' : ' · 自付'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <ShoppingCart className="h-3.5 w-3.5" />
              购物清单 <span className="font-normal text-slate-400">{items.length} 项</span>
            </div>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" /> 清空
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center">
              <ShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">暂无商品</p>
              <p className="text-[11px] text-slate-400">扫码或点快捷选品开始</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {items.map((it) => {
                const Icon = CAT_ICON[it.category] || Pill
                return (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        it.insuranceCovered ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-medium text-slate-800">{it.name}</p>
                        {it.insuranceCovered ? (
                          <span className="shrink-0 rounded bg-blue-50 px-1.5 py-px text-[9px] font-medium text-blue-600">
                            医保
                          </span>
                        ) : (
                          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-px text-[9px] font-medium text-amber-600">
                            自付
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">{it.category} · ¥{it.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          it.qty === 1 ? removeItem(it.id) : updateQty(it.id, it.qty - 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
                      >
                        {it.qty === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-xs font-semibold text-slate-700">
                        {it.qty}
                      </span>
                      <button
                        onClick={() => updateQty(it.id, it.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <p className="ml-1 w-14 text-right text-xs font-semibold text-slate-700">
                        ¥{(it.price * it.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            会员信息
          </p>
          <MemberSearch />
        </div>

        <CheckoutReminder
          onFeedbackClick={(benefit: Benefit) => {
            selectBenefit(benefit)
            navigate('/feedback')
          }}
        />
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-3">
        <div className="mb-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">医保目录内</span>
            <span className="font-medium text-blue-600">¥{totalCovered.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">医保目录外</span>
            <span className="font-medium text-amber-600">¥{totalUncovered.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
            <span className="text-xs font-semibold text-slate-700">合计应收</span>
            <span className="text-lg font-bold text-slate-900">¥{total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={items.length === 0 || checkoutToast}
          className="relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-blue-600 active:scale-[0.99] disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none"
        >
          {checkoutToast ? (
            <>
              <Check className="h-4 w-4" />
              结账完成，小票已打印
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              合计 ¥{total.toFixed(2)} · 去结算
            </>
          )}
          {checkoutToast && (
            <X className="absolute right-3 top-3 h-3.5 w-3.5 text-white/60" onClick={(e) => { e.stopPropagation(); setCheckoutToast(false) }} />
          )}
        </button>
      </div>
    </div>
  )
}
