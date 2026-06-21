import { create } from 'zustand'
import type { Member, Benefit, FeedbackType, FeedbackRecord, CartItem } from '@/types'
import { findMemberByPhone, findMemberByCode, getBenefitsByMemberId } from '@/data/mockData'

interface AppState {
  member: Member | null
  benefits: Benefit[]
  selectedBenefit: Benefit | null
  loading: boolean
  searchByPhone: (phone: string) => void
  searchByCode: (code: string) => void
  selectBenefit: (benefit: Benefit | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  member: null,
  benefits: [],
  selectedBenefit: null,
  loading: false,

  searchByPhone: (phone: string) => {
    set({ loading: true })
    setTimeout(() => {
      const member = findMemberByPhone(phone)
      const benefits = member ? getBenefitsByMemberId(member.id) : []
      set({ member: member ?? null, benefits, loading: false, selectedBenefit: null })
    }, 600)
  },

  searchByCode: (code: string) => {
    set({ loading: true })
    setTimeout(() => {
      const member = findMemberByCode(code)
      const benefits = member ? getBenefitsByMemberId(member.id) : []
      set({ member: member ?? null, benefits, loading: false, selectedBenefit: null })
    }, 400)
  },

  selectBenefit: (benefit: Benefit | null) => {
    set({ selectedBenefit: benefit })
  },

  reset: () => {
    set({ member: null, benefits: [], selectedBenefit: null, loading: false })
  },
}))

interface FeedbackState {
  submittedFeedbacks: FeedbackRecord[]
  submitFeedback: (
    member: Member,
    benefit: Benefit,
    type: FeedbackType,
    remark: string
  ) => void
}

const CURRENT_CASHIER = { cashierId: 'C001', cashierName: '李收银' }

export const useFeedbackStore = create<FeedbackState>((set) => ({
  submittedFeedbacks: JSON.parse(localStorage.getItem('feedbacks_v2') || '[]'),

  submitFeedback: (member, benefit, type, remark) => {
    const entry: FeedbackRecord = {
      id: `F${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      benefitId: benefit.id,
      benefitTitle: benefit.title,
      type,
      remark,
      cashierId: CURRENT_CASHIER.cashierId,
      cashierName: CURRENT_CASHIER.cashierName,
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const updated = [...state.submittedFeedbacks, entry]
      localStorage.setItem('feedbacks_v2', JSON.stringify(updated))
      return { submittedFeedbacks: updated }
    })
  },
}))

interface CashierState {
  cashierId: string
  cashierName: string
}
export const useCashierStore = create<CashierState>(() => CURRENT_CASHIER)

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  total: number
  totalCovered: number
  totalUncovered: number
}

const seedCart: CartItem[] = [
  { id: 'P001', name: '氨氯地平片（高血压）', price: 28.5, qty: 2, category: '药品', insuranceCovered: true },
  { id: 'P002', name: '电子体温计', price: 45.0, qty: 1, category: '医疗器械', insuranceCovered: true },
  { id: 'P003', name: '维生素C泡腾片', price: 32.0, qty: 1, category: '保健品', insuranceCovered: false },
]

export const useCartStore = create<CartState>((set, get) => ({
  items: seedCart,

  addItem: (item) =>
    set((state) => {
      const exist = state.items.find((i) => i.id === item.id)
      if (exist) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
          ),
        }
      }
      return { items: [...state.items, { ...item, qty: item.qty ?? 1 }] }
    }),

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    })),

  clear: () => set({ items: [] }),

  get total() {
    return get().items.reduce((s, i) => s + i.price * i.qty, 0)
  },
  get totalCovered() {
    return get().items.filter((i) => i.insuranceCovered).reduce((s, i) => s + i.price * i.qty, 0)
  },
  get totalUncovered() {
    return get().items.filter((i) => !i.insuranceCovered).reduce((s, i) => s + i.price * i.qty, 0)
  },
}))
