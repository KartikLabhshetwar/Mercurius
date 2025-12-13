"use client"

import { useRouter } from "next/navigation"
import { ParticleHero } from "@/components/ui/animated-hero"
import { GitHubStarButton } from "@/components/github-star-button"

export function HeroLanding() {
  const router = useRouter()

  return (
    <ParticleHero
      title="Mercurius"
      subtitle="Ephemeral. Secure. Private."
      description="Private, self-destructing chat rooms that disappear after 10 minutes. No accounts, no history, just secure conversations."
      primaryButton={{
        text: "Create Room",
        onClick: () => router.push("/create")
      }}
      interactiveHint="Move to Create"
      particleCount={12}
    >
      <div className="text-center max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] xl:text-[14rem] 2xl:text-[16rem] font-black tracking-tighter leading-[0.8] mb-4 sm:mb-6 md:mb-8">
            <span className="bg-linear-to-b from-orange-300 via-orange-500 to-orange-800 bg-clip-text text-transparent drop-shadow-2xl">
              Mercurius
            </span>
          </h1>
          
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-thin text-orange-200/90 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
              Ephemeral. Secure. Private.
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-px bg-linear-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
          </div>
        </div>
        
        <div className="mb-12 sm:mb-16 md:mb-20">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-orange-100/60 font-light max-w-3xl mx-auto leading-relaxed px-2">
            Private, self-destructing chat rooms that disappear after 10 minutes. No accounts, no history, just secure conversations.
          </p>
        </div>
        
        <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16 md:mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => router.push("/create")}
              className="group relative px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 bg-transparent border border-orange-500/30 hover:border-orange-400 text-orange-200 hover:text-white font-medium text-sm sm:text-base md:text-lg tracking-wider uppercase transition-all duration-500 overflow-hidden w-full sm:w-auto"
            >
              <span className="relative z-10">Create Room</span>
              <div className="absolute inset-0 bg-linear-to-r from-orange-600/0 via-orange-500/20 to-orange-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <GitHubStarButton variant="hero" />
          </div>
          
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-orange-400/40 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            <div className="w-8 sm:w-10 md:w-12 h-px bg-linear-to-r from-transparent to-orange-500/30"></div>
            <span className="animate-pulse">Move to Create</span>
            <div className="w-8 sm:w-10 md:w-12 h-px bg-linear-to-l from-transparent to-orange-500/30"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-orange-500/20">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-orange-200">Self-Destructing</h3>
            <p className="text-xs text-orange-100/60">
              Rooms automatically expire after 10 minutes
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-orange-200">No Accounts</h3>
            <p className="text-xs text-orange-100/60">
              Start chatting immediately without registration
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-orange-200">Real-Time</h3>
            <p className="text-xs text-orange-100/60">
              Instant message delivery with live updates
            </p>
          </div>
        </div>
      </div>
    </ParticleHero>
  )
}
