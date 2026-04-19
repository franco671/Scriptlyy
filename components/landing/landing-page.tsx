"use client"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Hero } from "./hero"
import { HowItWorks } from "./how-it-works"
import { PricingSection } from "./pricing-section"
import { FAQSection } from "./faq-section"
import { AuthModal } from "./auth-modal"

interface LandingPageProps {
  onAuthSuccess: () => void
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogin={() => setAuthModalOpen(true)} />

      <main className="pt-16">
        <Hero onGetStarted={() => setAuthModalOpen(true)} />

        <section id="features" className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para crear contenido viral
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
              Herramientas profesionales diseñadas específicamente para creadores de Shorts
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { title: "Editor Inteligente", desc: "Estructura optimizada con Hook, Cuerpo y CTA" },
                { title: "Análisis en Tiempo Real", desc: "Tiempo de lectura y métricas instantáneas" },
                { title: "Sugerencias de B-roll", desc: "Ideas visuales basadas en tu contenido" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:border-primary/50"
                >
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        <PricingSection />

        <FAQSection />
      </main>

      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-bold text-xl">Scriptlyy</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; 2026 Scriptlyy. Potenciando creadores en Reconquista y el mundo.
          </p>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={onAuthSuccess}
      />
    </div>
  )
}