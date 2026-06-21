import { create } from 'zustand'
import type { Member, Benefit, FeedbackType } from '@/types'
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
  submittedFeedbacks: Array<{
    memberId: string
    benefitId: string
    type: FeedbackType
    remark: string
    createdAt: string
  }>
  submitFeedback: (memberId: string, benefitId: string, type: FeedbackType, remark: string) => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  submittedFeedbacks: JSON.parse(localStorage.getItem('feedbacks') || '[]'),

  submitFeedback: (memberId, benefitId, type, remark) => {
    const entry = {
      memberId,
      benefitId,
      type,
      remark,
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const updated = [...state.submittedFeedbacks, entry]
      localStorage.setItem('feedbacks', JSON.stringify(updated))
      return { submittedFeedbacks: updated }
    })
  },
}))
