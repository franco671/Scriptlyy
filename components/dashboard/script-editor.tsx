
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
  const [isReadingMode, setIsReadingMode] = useState(false)
  const { toast } = useToast()

  const [content, setContent] = useState<ScriptContent>({
    hook: "",
    body: "",
    cta: "",
  })

  const [visualSuggestions, setVisualSuggestions] = useState<string[]>([])

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
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive"
      })
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
      <header className="flex items-center justify-between p-3 md:p-4 border-b bg-card/50">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 overflow-hidden">
            <h1 className="font-semibold text-sm md:text-lg truncate max-w-[100px] xs:max-w-[150px] md:max-w-none">
              {formData.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] md:text-sm text-muted-foreground">
              <Badge variant="secondary" className="px-1 md:px-2 py-0 text-[9px] md:text-[11px]">{formData.tone}</Badge>
              <span className="truncate">• {formData.duration}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReadingMode(true)}
            className="border-primary/30 text-primary hover:bg-primary/10 px-2 md:px-3"
            title="Modo Grabación"
          >
            <Video className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Grabar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="px-2 md:px-3"
            title="Exportar"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="px-2 md:px-3 bg-primary"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 md:mr-2" />
                <span className="hidden xs:inline md:inline">Guardar</span>
              </>
            )}
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
                <h3 className="font-semibold">Desarrollo</h3>
              </div>
              <Textarea value={content.body} onChange={(e) => updateContent("body", e.target.value)} className="min-h-[300px] bg-card text-lg" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-chart-1" />
                <h3 className="font-semibold">CTA</h3>
              </div>
              <Textarea value={content.cta} onChange={(e) => updateContent("cta", e.target.value)} className="min-h-[80px] bg-card text-lg" />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-card/30 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Tiempo est.</span>
                  <span className={`text-sm font-bold text-${durationStatus}`}>
                    {estimatedSeconds}s / {formData.duration}s
                  </span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${durationStatus === 'success' ? 'primary' : 'warning'} transition-all`}
                    style={{ width: `${Math.min((estimatedSeconds / targetDuration) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  ~ {totalWords} palabras (ritmo de 130 ppm)
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Sugerencias Visuales
              </h3>
              <div className="space-y-2">
                {displaySuggestions.map((suggestion, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-card border text-xs leading-relaxed">
                    <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                      {index + 1}
                    </div>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isReadingMode && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col">
          <header className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="font-bold">Modo Grabación</h2>
              <Badge variant="outline" className="animate-pulse border-red-500 text-red-500">
                REC READY
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsReadingMode(false)}>
              <X className="w-6 h-6" />
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 md:p-12 text-center max-w-4xl mx-auto w-full">
            <div className="space-y-12 pb-24">
              <div className="space-y-4">
                <Badge variant="secondary">HOOK</Badge>
                <p className="text-3xl md:text-5xl font-bold leading-tight">{content.hook}</p>
              </div>
              <div className="space-y-4">
                <Badge variant="secondary">CUERPO</Badge>
                <p className="text-2xl md:text-4xl text-muted-foreground leading-relaxed">{content.body}</p>
              </div>
              <div className="space-y-4">
                <Badge variant="secondary">CTA</Badge>
                <p className="text-2xl md:text-4xl font-semibold italic">{content.cta}</p>
              </div>
            </div>
          </div>
          <footer className="p-6 border-t bg-card/50 flex justify-center">
            <div className="flex items-center gap-8 text-muted-foreground">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{estimatedSeconds}s</p>
                <p className="text-xs uppercase tracking-widest">Duración</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalWords}</p>
                <p className="text-xs uppercase tracking-widest">Palabras</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}