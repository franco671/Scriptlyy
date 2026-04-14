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
  Video
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
  const { toast } = useToast()

  const [content, setContent] = useState<ScriptContent>({
    hook: "",
    body: "",
    cta: "",
  })

  const [visualSuggestions, setVisualSuggestions] = useState<string[]>([])

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

  // FUNCIÓN ACTUALIZADA: Ahora maneja errores de créditos (403)
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

      // Manejo de falta de créditos
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

      // Refrescamos el contador de créditos en el Sidebar
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
    <div className="h-full flex flex-col">
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
              <Textarea value={content.hook} onChange={(e) => updateContent("hook", e.target.value)} className="min-h-[100px] bg-card" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-chart-2" />
                <h3 className="font-semibold">Cuerpo</h3>
              </div>
              <Textarea value={content.body} onChange={(e) => updateContent("body", e.target.value)} className="min-h-[200px] bg-card" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-chart-1" />
                <h3 className="font-semibold">CTA</h3>
              </div>
              <Textarea value={content.cta} onChange={(e) => updateContent("cta", e.target.value)} className="min-h-[80px] bg-card" />
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
              {/* BOTÓN ACTUALIZADO: Texto más claro y deshabilitado durante carga */}
              <Button
                variant="ghost"
                size="xs"
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
    </div>
  )
}