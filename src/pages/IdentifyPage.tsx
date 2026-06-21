import MemberSearch from '@/components/MemberSearch'
import MemberInfo from '@/components/MemberInfo'
import BenefitList from '@/components/BenefitList'
import { useAppStore } from '@/store/useAppStore'

export default function IdentifyPage() {
  const { member, benefits } = useAppStore()

  if (!member) {
    return <MemberSearch />
  }

  return (
    <div className="space-y-4">
      <MemberSearch />
      <div
        style={{
          animation: 'fadeSlideIn 0.3s ease',
        }}
      >
        <MemberInfo />
      </div>
      {benefits.length > 0 ? (
        <div
          style={{
            animation: 'fadeSlideIn 0.35s ease 0.05s backwards',
          }}
        >
          <BenefitList />
        </div>
      ) : (
        <div
          className="rounded-xl bg-slate-50 py-8 text-center"
          style={{ animation: 'fadeSlideIn 0.35s ease 0.05s backwards' }}
        >
          <p className="text-sm text-slate-400">该会员暂无医保个账相关权益</p>
        </div>
      )}
    </div>
  )
}
