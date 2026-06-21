import { User, Crown, Award, Shield } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const levelIcons: Record<string, typeof Crown> = {
  金卡: Crown,
  银卡: Award,
}

export default function MemberInfo() {
  const { member, reset } = useAppStore()
  if (!member) return null

  const LevelIcon = levelIcons[member.level] || User

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg shadow-blue-600/20">
        <button
          onClick={reset}
          className="absolute right-3 top-3 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/25"
        >
          切换会员
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <LevelIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">{member.name}</h3>
            <p className="text-xs text-blue-100">{member.phone}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
            {member.level}会员
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
            <Shield className="h-3 w-3" />
            {member.insuranceType}
          </span>
        </div>
      </div>
    </div>
  )
}
