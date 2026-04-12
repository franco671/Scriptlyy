"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "./sidebar"
import { ScriptForm, type ScriptFormData } from "./script-form"
import { ScriptEditor } from "./script-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  Crown
} from "lucide-react"

type DashboardView = "home" | "form" | "editor"

interface Guion {
  id: string
  titulo: string
  nicho: string
  hook: string
  desarrollo: string
  cta: string
  segundos: number
  created_at: string
}

interface GuionesMeta {
  count: number
  limit: number
  es_premium: boolean
  can_create: boolean
}

interface DashboardPageProps {
  onLogout: () => void
}

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

// Count words helper
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [currentView, setCurrentView] = useState<DashboardView>("home")
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [formData, setFormData] = useState<ScriptFormData | null>(null)
  const [guiones, setGuiones] = useState<Guion[]>([])
  const [meta, setMeta] = useState<GuionesMeta>({
    count: 0,
    limit: 5,
    es_premium: false,
    can_create: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchGuiones()
  }, [refreshTrigger])

  const fetchGuiones = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/guiones")
      if (response.ok) {
        const data = await response.json()
        setGuiones(data.guiones || [])
        if (data.meta) {
          setMeta(data.meta)
        }
      }
    } catch (error) {
      console.error("Error fetching guiones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewScript = () => {
    setCurrentView("form")
    setSelectedScript(null)
    setFormData(null)
  }

  const handleSelectScript = (guion: Guion) => {
    setSelectedScript(guion.id)
    setFormData({
      title: guion.titulo,
      topic: guion.nicho,
      tone: "mystery", // Default, since we don't store this
      duration: String(guion.segundos),
      mode: "manual",
      hook: guion.hook,
      desarrollo: guion.desarrollo,
      cta: guion.cta
    })
    setCurrentView("editor")
  }

  const handleFormComplete = (data: ScriptFormData) => {
    setFormData(data)
    setCurrentView("editor")
  }

  const handleFormCancel = () => {
    setCurrentView("home")
  }

  const handleEditorBack = () => {
    setCurrentView("home")
    setFormData(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Calculate stats
  const totalGuiones = guiones.length
  const thisMonthGuiones = guiones.filter(g => {
    const date = new Date(g.created_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const totalWords = guiones.reduce((acc, g) => {
    return acc + countWords(g.hook) + countWords(g.desarrollo) + countWords(g.cta)
  }, 0)
  const estimatedTimeSaved = Math.round((totalWords / 150) / 60 * 3) // Rough estimate: 3x time saved

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        onNewScript={handleNewScript}
        onSelectScript={handleSelectScript}
        selectedScript={selectedScript}
        onLogout={onLogout}
        refreshTrigger={refreshTrigger}
      />

      <main className="flex-1 lg:ml-0 overflow-hidden">
        {currentView === "home" && (
          <div className="p-4 lg:p-8 pt-16 lg:pt-8 overflow-y-auto h-screen">
            <div className="max-w-4xl mx-auto">
              {/* Welcome header */}
              <div className="mb-8 opacity-0 animate-fade-in-up">
                <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
                <p className="text-muted-foreground">
                  Continúa donde lo dejaste o crea un nuevo guion.
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { 
                    label: meta.es_premium ? "Guiones (Ilimitados)" : `Guiones (${meta.count}/${meta.limit})`, 
                    value: totalGuiones.toString(), 
                    icon: FileText 
                  },
                  { label: "Este mes", value: thisMonthGuiones.toString(), icon: TrendingUp },
                  { label: "Tiempo ahorrado", value: `${estimatedTimeSaved}h`, icon: Clock },
                  { label: "Total palabras", value: totalWords.toLocaleString(), icon: Sparkles },
                ].map((stat, i) => (
                  <Card key={i} className={`bg-card border-border opacity-0 animate-fade-in-up transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 ${
                    i === 0 ? 'animation-delay-100' : 
                    i === 1 ? 'animation-delay-200' : 
                    i === 2 ? 'animation-delay-300' :
                    'animation-delay-400'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick action or Premium upgrade */}
              {!meta.can_create && !meta.es_premium ? (
                <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 mb-8 opacity-0 animate-fade-in-up animation-delay-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-lg">Has alcanzado el límite gratuito</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Has creado {meta.count} de {meta.limit} guiones. Pasa a Premium para crear guiones ilimitados.
                      </p>
                    </div>
                    <Button 
                      className="gap-2 whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Crown className="w-4 h-4" />
                      Pasar a Premium
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-primary/10 border-primary/20 mb-8 opacity-0 animate-fade-in-up animation-delay-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Crea tu próximo viral</h3>
                      <p className="text-muted-foreground text-sm">
                        {meta.es_premium 
                          ? "Como usuario Premium, tienes guiones ilimitados. Usa IA para generar contenido viral."
                          : `Tienes ${meta.limit - meta.count} guiones disponibles. Usa IA para generar contenido que retiene audiencia.`
                        }
                      </p>
                    </div>
                    <Button onClick={handleNewScript} className="gap-2 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25">
                      <Plus className="w-4 h-4" />
                      Nuevo Guion
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recent scripts */}
              <Card className="bg-card border-border opacity-0 animate-fade-in-up animation-delay-600">
                <CardHeader>
                  <CardTitle className="text-lg">Guiones recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : guiones.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No tienes guiones aún</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crea tu primer guion con ayuda de la IA
                      </p>
                      {meta.can_create ? (
                        <Button onClick={handleNewScript} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Crear primer guion
                        </Button>
                      ) : (
                        <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                          <Crown className="w-4 h-4" />
                          Pasar a Premium
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guiones.slice(0, 5).map((guion) => (
                        <button
                          key={guion.id}
                          onClick={() => handleSelectScript(guion)}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 text-left group hover:translate-x-1 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium group-hover:text-primary transition-colors">
                                {guion.titulo}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatRelativeTime(guion.created_at)} • {guion.segundos}s • {countWords(guion.hook) + countWords(guion.desarrollo) + countWords(guion.cta)} palabras
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === "form" && (
          <div className="h-screen overflow-y-auto pt-16 lg:pt-0">
            <ScriptForm
              onComplete={handleFormComplete}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {currentView === "editor" && formData && (
          <ScriptEditor
            formData={formData}
            onBack={handleEditorBack}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </main>
    </div>
  )
}
