export type BenefitStatus = 'available' | 'expiring' | 'unavailable'
export type FeedbackType = 'reminded' | 'declined' | 'inapplicable' | 'not_needed'
export type BenefitCategory = 'gift' | 'chronic' | 'family' | 'other'

export interface Member {
  id: string
  name: string
  phone: string
  level: string
  insuranceType: string
}

export interface Benefit {
  id: string
  memberId: string
  title: string
  description: string
  status: BenefitStatus
  expiryDate: string
  category: BenefitCategory
  guide: string
  script: string
  eligibleProducts: string
  needsConfirmation: boolean
  checkoutReminder: string
  minSpend?: number
  applicableKeywords?: string[]
}

export interface FeedbackRecord {
  id: string
  memberId: string
  memberName: string
  benefitId: string
  benefitTitle: string
  type: FeedbackType
  remark: string
  cashierId: string
  cashierName: string
  createdAt: string
  sessionId: string
  coveredAmount: number
  cartItemCount: number
  cartSummary: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  category: '药品' | '医疗器械' | '保健品'
  insuranceCovered: boolean
  keywords?: string[]
}
