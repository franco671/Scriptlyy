"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Download,
  Clock,
  Sparkles,
  ArrowLeft,
  Lightbulb,
  Target,
  MessageSquare,
  RefreshCw,
  Loader2,
  Video,
  X
} from "lucide-react"
import type { ScriptFormData } from "./script-form"

interface ScriptEditorProps {
  formData: ScriptFormData
  onBack: () => void
  onSaveSuccess?: () => void
}

interface ScriptContent {
  hook: string
  body: string
  cta: string
}

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const calculateTime = (words: number): number => {
  return Math.round((words / 130) * 60)
}

const generateFallbackSuggestions = (content: ScriptContent): string[] => {
  const suggestions: string[] = []
  if (content.hook.toLowerCase().includes("increíble")) suggestions.push("Persona con expresión de asombro")
  if (content.body.toLowerCase().includes("dato")) suggestions.push("Infografía con estadísticas")

  if (suggestions.length === 0) {
    return ["B-roll dinámico", "Primer plano del narrador", "Transiciones rápidas"]
  }
  return suggestions
}

export function ScriptEditor({ formData, onBack, onSaveSuccess }: ScriptEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReadingMode, setIsReadingMode] = useState(false) // NUEVO: Estado para el Teleprompter
  const { toast } = useToast()

  const [content, setContent] = useState<ScriptContent>({
    hook: "",
    body: "",
    cta: "",
  })

  const [visualSuggestions, setVisualSuggestions] = useState<string[]>([])

  // NUEVO: Cerrar modo lectura con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsReadingMode(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (formData.mode === "ai" && !content.hook && !content.body && !content.cta) {
      generateAIContent()
    }
  }, [formData.mode])

  useEffect(() => {
    if (formData.hook || formData.desarrollo || formData.cta) {
      setContent({
        hook: formData.hook || "",
        body: formData.desarrollo || "",
        cta: formData.cta || "",
      })
      if (formData.visual_suggestions) {
        setVisualSuggestions(formData.visual_suggestions)
      }
    }
  }, [formData])

  const generateAIContent = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          topic: formData.topic,
          tone: formData.tone,
          duration: formData.duration,
        }),
      })

      if (response.status === 403) {
        toast({
          title: "Créditos insuficientes",
          description: "No tienes créditos suficientes para generar o regenerar este guion.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) throw new Error("Error al generar")

      const data = await response.json()

      setContent({
        hook: data.hook || "",
        body: data.desarrollo || "",
        cta: data.cta || "",
      })

      if (data.visual_suggestions) {
        setVisualSuggestions(data.visual_suggestions)
      }

      toast({
        title: "Guion actualizado",
        description: "La IA ha procesado tu solicitud con éxito.",
      })

      if (onSaveSuccess) onSaveSuccess()

    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateContent = (field: keyof ScriptContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  const totalWords = useMemo(() => {
    return countWords(content.hook) + countWords(content.body) + countWords(content.cta)
  }, [content])

  const estimatedSeconds = useMemo(() => {
    return calculateTime(totalWords)
  }, [totalWords])

  const displaySuggestions = useMemo(() => {
    if (visualSuggestions.length > 0) return visualSuggestions
    return generateFallbackSuggestions(content)
  }, [content, visualSuggestions])

  const targetDuration = parseInt(formData.duration)
  const durationStatus = estimatedSeconds <= targetDuration ? "success" : "warning"

  const handleSave = async () => {
    if (!content.hook.trim() || !content.body.trim()) {
      toast({ title: "Error", description: "Campos incompletos", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/guiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.title,
          nicho: formData.topic,
          hook: content.hook,
          desarrollo: content.body,
          cta: content.cta,
          segundos: estimatedSeconds,
          visual_suggestion: displaySuggestions
        }),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({ title: "Guion guardado", description: "Se guardó correctamente." })
      if (onSaveSuccess) onSaveSuccess()
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const fullScript = `# ${formData.title}\n\n## Sugerencias Visuales\n- ${displaySuggestions.join('\n- ')}\n\n## Hook\n${content.hook}\n\n## Cuerpo\n${content.body}\n\n## CTA\n${content.cta}`
    const blob = new Blob([fullScript], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.title.toLowerCase()}.md`
    a.click()
  }

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h2 className="font-semibold text-lg">Escribiendo guion y planeando escenas...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      <header className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="font-semibold text-lg">{formData.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{formData.tone}</Badge>
              <span>• {formData.duration}s objetivo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* BOTÓN NUEVO: Modo Grabación */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReadingMode(true)}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Video className="w-4 h-4 mr-2" />
            Modo Grabación
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Exportar</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-chart-5" />
                <h3 className="font-semibold">Hook</h3>
              </div>
              <Textarea value={content.hook} onChange={(e) => updateContent("hook", e.target.value)} className="min-h-[100px] bg-card text-lg" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-chart-2" />
                <h3 className="font-semibold">Cuerpo</h3>
              </div>
              <Textarea value={content.body} onChange={(e) => updateContent("body", e.target.value)} className="min-h-[200px] bg-card text-lg" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-chart-1" />
                <h3 className="font-semibold">CTA</h3>
              </div>
              <Textarea value={content.cta} onChange={(e) => updateContent("cta", e.target.value)} className="min-h-[80px] bg-card text-lg italic" />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 border-t lg:border-l bg-card/50 p-4 space-y-4 overflow-y-auto">
          <Card className="bg-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" />Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-4xl font-bold ${durationStatus === "success" ? "text-green-500" : "text-orange-500"}`}>
                {estimatedSeconds}s
              </span>
              <p className="text-xs text-muted-foreground mt-1">Límite: {targetDuration}s</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Video className="w-4 h-4" />Escenas Sugeridas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {displaySuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded bg-background/50 text-xs">
                  <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5" />
                  <span>{suggestion}</span>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[10px] hover:bg-secondary/50"
                onClick={generateAIContent}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerar todo (1 crédito)
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* --- MODAL DE MODO LECTURA (TELEPROMPTER) --- */}
      {isReadingMode && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col p-6 md:p-12 animate-in fade-in duration-300 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-10 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Teleprompter Activo</h2>
              </div>
              <h1 className="text-2xl font-bold">{formData.title}</h1>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsReadingMode(false)}
              className="rounded-full shadow-sm"
            >
              <X className="w-4 h-4 mr-2" /> Salir (Esc)
            </Button>
          </div>

          <div className="flex-1 max-w-5xl mx-auto w-full overflow-y-auto space-y-20 pb-40 pr-6 custom-scrollbar">
            <div className="space-y-6">
              <Badge className="bg-chart-5/20 text-chart-5 border-none px-4 py-1 text-sm uppercase font-black">Gancho (Hook)</Badge>
              <p className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tight">
                {content.hook}
              </p>
            </div>

            <div className="space-y-6">
              <Badge className="bg-chart-2/20 text-chart-2 border-none px-4 py-1 text-sm uppercase font-black">Desarrollo</Badge>
              <p className="text-3xl md:text-5xl font-semibold leading-[1.4] text-muted-foreground">
                {content.body}
              </p>
            </div>

            <div className="space-y-6">
              <Badge className="bg-chart-1/20 text-chart-1 border-none px-4 py-1 text-sm uppercase font-black">Cierre (CTA)</Badge>
              <p className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tight text-primary italic">
                {content.cta}
              </p>
            </div>
          </div>

          {/* Estadísticas de apoyo al pie */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-xl border border-border px-10 py-5 rounded-full shadow-2xl flex gap-12 items-center z-[101]">
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Tiempo Est.</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-2xl font-black">{estimatedSeconds}s</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Objetivo</span>
              <span className="text-2xl font-black text-muted-foreground">{formData.duration}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
