"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface HeroProps {
  onGetStarted: () => void
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8 opacity-0 animate-fade-in-up animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-primary animate-float" />
          <span className="text-sm text-primary font-medium">Potenciado por IA</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance opacity-0 animate-fade-in-up animation-delay-100">
          Guiones de Shorts que{" "}
          <span className="text-primary relative">
            retienen audiencia
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 animate-shimmer rounded-full" />
          </span>
          <br />
          en segundos
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty opacity-0 animate-fade-in-up animation-delay-200">
          Crea scripts profesionales para YouTube Shorts con asistencia de IA.
          Hooks irresistibles, storytelling efectivo y CTAs que convierten.
        </p>

        {/* CTA Button - Centered */}
        <div className="flex justify-center opacity-0 animate-fade-in-up animation-delay-300">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-lg px-10 py-7 gap-2 group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
          >
            Comenzar Gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  )
}