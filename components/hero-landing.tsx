"use client"

import { useRouter } from "next/navigation"
import { ParticleHero } from "@/components/ui/animated-hero"

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
      <div className="text-center max-w-6xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-8xl md:text-[10rem] lg:text-[14rem] xl:text-[16rem] font-black tracking-tighter leading-[0.8] mb-8">
            <span className="bg-linear-to-b from-orange-300 via-orange-500 to-orange-800 bg-clip-text text-transparent drop-shadow-2xl">
              Mercurius
            </span>
          </h1>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-thin text-orange-200/90 tracking-[0.2em] uppercase">
              Ephemeral. Secure. Private.
            </h2>
            <div className="w-24 h-px bg-linear-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
          </div>
        </div>
        
        <div className="mb-20">
          <p className="text-lg md:text-xl lg:text-2xl text-orange-100/60 font-light max-w-3xl mx-auto leading-relaxed">
            Private, self-destructing chat rooms that disappear after 10 minutes. No accounts, no history, just secure conversations.
          </p>
        </div>
        
        <div className="space-y-8 mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => router.push("/create")}
              className="group relative px-12 py-6 bg-transparent border border-orange-500/30 hover:border-orange-400 text-orange-200 hover:text-white font-medium text-lg tracking-wider uppercase transition-all duration-500 overflow-hidden"
            >
              <span className="relative z-10">Create Room</span>
              <div className="absolute inset-0 bg-linear-to-r from-orange-600/0 via-orange-500/20 to-orange-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-orange-400/40 text-sm uppercase tracking-[0.3em]">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-orange-500/30"></div>
            <span className="animate-pulse">Move to Create</span>
            <div className="w-12 h-px bg-linear-to-l from-transparent to-orange-500/30"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-orange-500/20">
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
