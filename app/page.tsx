"use client"

import { useState } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { FAQSection } from "@/components/landing/faq-section"
import { AuthModal } from "@/components/landing/auth-modal"
import { Footer } from "@/components/landing/footer"

interface LandingPageProps {
  onAuthSuccess: () => void
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* El Navbar ahora abre el modal y tiene los links activos */}
      <Navbar onLogin={() => setAuthModalOpen(true)} />

      <main>
        {/* El Hero también abre el modal al hacer clic en "Comenzar Gratis" */}
        <Hero onGetStarted={() => setAuthModalOpen(true)} />

        {/* Aquí puedes agregar otras secciones si las tienes, como Stats o Features */}
        <Features />

        {/* La sección de FAQ que ahora sí responderá al ID #faq */}
        <FAQSection />
      </main>

      <Footer />

      {/* Este es el modal que recuperamos hoy del archivo auth-modal.tsx */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={() => {
          setAuthModalOpen(false)
          onAuthSuccess()
        }}
      />
    </div>
  )
}