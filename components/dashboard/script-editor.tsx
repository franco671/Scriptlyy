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
      toast({ title: "