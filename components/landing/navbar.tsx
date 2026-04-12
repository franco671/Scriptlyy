"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface NavbarProps {
  onLogin: () => void
}

export function Navbar({ onLogin }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Scriptly</span>
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Características
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onLogin}>
            Iniciar Sesión
          </Button>
          <Button onClick={onLogin}>
            Comenzar
          </Button>
        </div>
      </nav>
    </header>
  )
}
