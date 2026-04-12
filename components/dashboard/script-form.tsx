"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PenTool,
  Clock,
  Zap,
  BookOpen,
  Ghost,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ScriptFormProps {
  onComplete: (data: ScriptFormData) => void
  onCancel: () => void
}

export interface ScriptFormData {
  title: string
  topic: string
  tone: string
  duration: string
  mode: string
  hook?: string
  desarrollo?: string
  cta?: string
}

const tones = [
  { id: "mystery", label: "Misterio", icon: Ghost, description: "Intrigante y cautivador" },
  { id: "energetic", label: "Enérgico", icon: Zap, description: "Dinámico y emocionante" },
  { id: "educational", label: "Educativo", icon: BookOpen, description: "Informativo y claro" },
]

const durations = [
  { id: "30", label: "30s", description: "Hook + dato rápido" },
  { id: "50", label: "50s", description: "Historia completa" },
  { id: "60", label: "60s", description: "Profundidad máxima" },
]

const modes = [
  {
    id: "manual",
    label: "Escritura Manual",
    icon: PenTool,
    description: "Escribe tu guion desde cero con nuestra estructura guiada"
  },
  {
    id: "ai",
    label: "Asistida por IA",
    icon: Sparkles,
    description: "La IA te ayuda a generar ideas y mejorar tu contenido"
  },
]

export function ScriptForm({ onComplete, onCancel }: ScriptFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ScriptFormData>({
    title: "",
    topic: "",
    tone: "mystery",
    duration: "50",
    mode: "ai",
  })

  const updateForm = (field: keyof ScriptFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== "" && formData.topic.trim() !== ""
      case 2:
        return formData.tone !== "" && formData.duration !== ""
      case 3:
        return formData.mode !== ""
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete(formData)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onCancel()
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-16 sm:w-24 h-1 mx-2",
                  s < step ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Tema</span>
          <span>Configuración</span>
          <span>Modo</span>
        </div>
      </div>

      {/* Step 1: Title and Topic */}
      {step === 1 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Título y Temática</CardTitle>
            <CardDescription>
              Define de qué tratará tu Short. Sé específico para mejores resultados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Video</Label>
              <Input
                id="title"
                placeholder="Ej: 5 datos increíbles sobre el cerebro humano"
                value={formData.title}
                onChange={(e) => updateForm("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Temática / Descripción</Label>
              <Textarea
                id="topic"
                placeholder="Describe brevemente el contenido: puntos clave, ángulo único, audiencia objetivo..."
                rows={4}
                value={formData.topic}
                onChange={(e) => updateForm("topic", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Tone and Duration */}
      {step === 2 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Tono y Duración</CardTitle>
            <CardDescription>
              Elige el estilo narrativo y la longitud de tu Short.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label>Tono del Video</Label>
              <RadioGroup
                value={formData.tone}
                onValueChange={(value) => updateForm("tone", value)}
                className="grid gap-3"
              >
                {tones.map((tone) => (
                  <Label
                    key={tone.id}
                    htmlFor={tone.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      formData.tone === tone.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={tone.id} id={tone.id} />
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tone.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-sm text-muted-foreground">{tone.description}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duración Objetivo
              </Label>
              <RadioGroup
                value={formData.duration}
                onValueChange={(value) => updateForm("duration", value)}
                className="grid grid-cols-3 gap-3"
              >
                {durations.map((duration) => (
                  <Label
                    key={duration.id}
                    htmlFor={`duration-${duration.id}`}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all text-center",
                      formData.duration === duration.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={duration.id} id={`duration-${duration.id}`} className="sr-only" />
                    <div className="text-2xl font-bold text-primary">{duration.label}</div>
                    <div className="text-xs text-muted-foreground">{duration.description}</div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Writing Mode */}
      {step === 3 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Modo de Escritura</CardTitle>
            <CardDescription>
              Elige cómo quieres crear tu guion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.mode}
              onValueChange={(value) => updateForm("mode", value)}
              className="grid gap-4"
            >
              {modes.map((mode) => (
                <Label
                  key={mode.id}
                  htmlFor={mode.id}
                  className={cn(
                    "flex items-start gap-4 p-6 rounded-xl border cursor-pointer transition-all",
                    formData.mode === mode.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={mode.id} id={mode.id} className="mt-1" />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <mode.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{mode.label}</div>
                    <div className="text-muted-foreground mt-1">{mode.description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Cancelar" : "Atrás"}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
          {step === 3 ? "Crear Guion" : "Siguiente"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
