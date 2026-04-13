"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LandingPage } from "@/components/landing/landing-page"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { Loader2 } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <DashboardPage onLogout={() => setUser(null)} />
  }

  return (
    <LandingPage onAuthSuccess={() => {
      // Re-check user after auth success
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    }} />
  )
}