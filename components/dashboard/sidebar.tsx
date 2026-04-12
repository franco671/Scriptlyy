"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  Plus,
  FileText,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Guion {
  id: string
  titulo: string
  nicho: string
  segundos: number
  hook: string
  desarrollo: string
  cta: string
}

interface SidebarProps {
  onNewScript: () => void
  onSelectScript: (guion: Guion) => void
  selectedScript: string | null
  onLogout: () => void
  refreshTrigger?: number
}



export function DashboardSidebar({
  onNewScript,
  onSelectScript,
  selectedScript,
  onLogout,
  refreshTrigger = 0
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [guiones, setGuiones] = useState<Guion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchGuiones()
  }, [refreshTrigger])

  const fetchGuiones = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/guiones")
      if (response.ok) {
        const data = await response.json()
        setGuiones(data)
      }
    } catch (error) {
      console.error("Error fetching guiones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Scriptlyy</span>
        </div>
      </div>

      {/* New Script Button */}
      <div className="p-4">
        <Button
          onClick={() => {
            onNewScript()
            setIsMobileOpen(false)
          }}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Guion
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Quick access */}
        <div className="mb-4">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Acceso Rápido
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground transition-colors">
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Scripts from database */}
        <div className="mb-4">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mis Guiones ({guiones.length})
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : guiones.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No tienes guiones aún.
              <br />
              <button
                onClick={() => {
                  onNewScript()
                  setIsMobileOpen(false)
                }}
                className="text-primary hover:underline mt-1"
              >
                Crea tu primero
              </button>
            </div>
          ) : (
            guiones.map(guion => (
              <button
                key={guion.id}
                onClick={() => {
                  onSelectScript(guion)
                  setIsMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedScript === guion.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 text-left truncate">
                  <div className="truncate font-medium">{guion.titulo}</div>
                  <div className="text-xs opacity-60">
                    {guion.nicho} • {guion.segundos}s
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Bottom actions */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground transition-colors">
          <Settings className="w-4 h-4" />
          Configuración
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-muted-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
