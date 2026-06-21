import MemberSearch from '@/components/MemberSearch'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { Shield, ChevronRight } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'

export default function IdentifyPage() {
  const { member, benefits } = useAppStore()
  const navigate = useNavigate()

  if (member && benefits.length > 0) {
    return (
      <div className="space-y-4">
        <MemberSearch />
        <div
          className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]"
          onClick={() => navigate('/benefits')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">发现 {benefits.length} 项权益</p>
                <div className="mt-1 flex gap-1.5">
                  {benefits.filter((b) => b.status === 'available').length > 0 && (
                    <StatusBadge status="available" />
                  )}
                  {benefits.filter((b) => b.status === 'expiring').length > 0 && (
                    <StatusBadge status="expiring" />
                  )}
                  {benefits.filter((b) => b.status === 'unavailable').length > 0 && (
                    <StatusBadge status="unavailable" />
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/60" />
          </div>
        </div>
      </div>
    )
  }

  if (member && benefits.length === 0) {
    return (
      <div className="space-y-4">
        <MemberSearch />
        <div className="rounded-xl bg-slate-50 py-8 text-center">
          <p className="text-sm text-slate-400">该会员暂无医保个账相关权益</p>
        </div>
      </div>
    )
  }

  return <MemberSearch />
}
