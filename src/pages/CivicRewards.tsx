import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"
import { useNotifications } from "@/contexts/NotificationContext"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/services/api"

const HOW_TO_EARN = [
  { icon: "bug_report", action: "Report an Issue", points: "+15 pts", desc: "File a verified civic report" },
  { icon: "assignment_turned_in", action: "Apply for Service", points: "+20 pts", desc: "Submit municipal application" },
  { icon: "verified_user", action: "Aadhaar KYC", points: "+100 pts", desc: "Verify e-Aadhaar identity" },
  { icon: "volunteer_activism", action: "Civic Participation", points: "+50 pts", desc: "Participate in planning town halls" },
]

export function CivicRewards() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()

  const userId = user?.id || 1;

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: api.getRewards
  })

  const { data: balanceData } = useQuery({
    queryKey: ['rewards-balance', userId],
    queryFn: () => api.getRewardsBalance(userId)
  })

  const points = balanceData?.points ?? 350;
  
  const [redeemingReward, setRedeemingReward] = useState<any | null>(null)
  const [lastVoucher, setLastVoucher] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  const handleRedeem = (reward: any) => {
    if (points < reward.points_cost) {
      addNotification({
        title: "Insufficient Points",
        message: `You need ${reward.points_cost} points but only have ${points}. Report issues or apply for services to earn more!`,
        type: "warning",
        group: "system"
      })
      return
    }
    setRedeemingReward(reward)
  }

  const confirmRedeem = async (reward: any) => {
    setIsRedeeming(true)
    try {
      const res = await api.redeemReward({ rewardId: reward.id, userId })
      queryClient.invalidateQueries({ queryKey: ['rewards-balance', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', userId] })
      setLastVoucher(res.voucherCode)
      setRedeemingReward(null)

      addNotification({
        title: "Reward Redeemed!",
        message: `${reward.title} voucher claimed. Code: ${res.voucherCode}`,
        type: "success",
        group: "message"
      })
    } catch (err: any) {
      alert("Failed to redeem reward: " + err.message)
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 relative z-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <Headline level={1}>Civic Rewards Programme</Headline>
        <BodyText className="text-on-surface-variant max-w-lg mx-auto">
          Earn points for contributing to your city. Redeem them for real civic benefits.
        </BodyText>
      </div>

      {/* Points Balance Card */}
      <GlassPanel className="p-8 rounded-3xl border border-primary/20 shadow-[0_0_40px_rgba(192,193,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <span className="material-symbols-outlined text-[200px] text-primary">stars</span>
        </div>
        <div className="flex items-center justify-between relative z-10 flex-wrap gap-6">
          <div>
            <Label className="text-on-surface-variant block mb-2">Your Points Balance</Label>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-headline-md font-extrabold text-primary">{points}</span>
              <span className="text-on-surface-variant font-label-sm text-sm">PTS</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              {points >= 250 ? "🎉 You have enough for premium rewards!" : `Earn ${250 - points} more points to unlock premium rewards.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 ai-orb rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">emoji_events</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Voucher Flash Banner */}
      <AnimatePresence>
        {lastVoucher && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-400 text-2xl">celebration</span>
              <div>
                <p className="text-sm font-bold text-green-400">Voucher Claimed!</p>
                <p className="text-xs text-on-surface-variant">Your voucher code: <strong className="font-label-sm text-foreground">{lastVoucher}</strong></p>
              </div>
            </div>
            <button onClick={() => setLastVoucher(null)} className="text-on-surface-variant hover:text-foreground">
              <span className="material-symbols-outlined">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Earn */}
      <div>
        <Headline level={3} className="mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">trending_up</span>
          How to Earn Points
        </Headline>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HOW_TO_EARN.map((item, idx) => (
            <GlassPanel key={idx} hover className="p-5 rounded-2xl text-center space-y-2">
              <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
              <p className="font-bold text-sm text-foreground">{item.action}</p>
              <p className="text-primary font-bold text-lg font-label-sm">{item.points}</p>
              <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div>
        <Headline level={3} className="mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">redeem</span>
          Redeem Rewards
        </Headline>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward: any) => (
            <GlassPanel key={reward.id} hover className="p-6 rounded-2xl space-y-4 relative overflow-hidden group">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", reward.color_theme || "text-primary bg-primary/10")}>
                  <span className="material-symbols-outlined text-2xl">{reward.icon || "stars"}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">{reward.title}</h4>
                  <p className="text-primary font-bold font-label-sm">{reward.points_cost} PTS</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{reward.description}</p>
              <Button
                className={cn(
                  "w-full font-bold transition-all",
                  points >= reward.points_cost
                    ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
                    : "bg-foreground/5 text-on-surface-variant cursor-not-allowed border border-foreground/10"
                )}
                onClick={() => handleRedeem(reward)}
                disabled={points < reward.points_cost}
              >
                {points >= reward.points_cost ? "Redeem" : `Need ${reward.points_cost - points} more pts`}
              </Button>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {redeemingReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setRedeemingReward(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md"
            >
              <GlassPanel className="p-8 rounded-3xl border border-primary/30 shadow-2xl bg-surface-container/90 text-center space-y-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", redeemingReward.color_theme || "text-primary bg-primary/10")}>
                  <span className="material-symbols-outlined text-3xl">{redeemingReward.icon || "stars"}</span>
                </div>
                <Headline level={3}>Confirm Redemption</Headline>
                <BodyText className="text-on-surface-variant">
                  Redeem <strong className="text-primary">{redeemingReward.points_cost} points</strong> for <strong className="text-foreground">{redeemingReward.title}</strong>?
                </BodyText>
                <p className="text-xs text-on-surface-variant">
                  Your remaining balance will be <strong>{points - redeemingReward.points_cost} pts</strong>.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setRedeemingReward(null)}>Cancel</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold" 
                    disabled={isRedeeming}
                    onClick={() => confirmRedeem(redeemingReward)}
                  >
                    {isRedeeming ? "Redeeming..." : "Confirm"}
                  </Button>
                </div>
              </GlassPanel>
            </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  )
}
