export type BenefitStatus = 'available' | 'expiring' | 'unavailable'
export type FeedbackType = 'reminded' | 'declined' | 'inapplicable'
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
}

export interface Feedback {
  id: string
  memberId: string
  benefitId: string
  type: FeedbackType
  remark: string
  cashierId: string
  createdAt: string
}
