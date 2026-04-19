"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Sparkles, CreditCard, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ email: string; nombre?: string; creditos: number } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [open])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("creditos")
        .eq("id", user.id)
        .single()

      setProfile({
        email: user.email || "",
        nombre: user.user_metadata?.full_name || "Creador",
        creditos: data?.creditos || 0
      })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración de Cuenta</DialogTitle>
          <DialogDescription>
            Gestiona tu información y revisa tus créditos disponibles.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Información de Usuario */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Nombre
                </Label>
                <Input id="name" value={profile?.nombre || ""} disabled className="bg-muted" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Correo Electrónico
                </Label>
                <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
              </div>
            </div>

            {/* Balance de Créditos (Sustituye a la caja de Stripe) */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="w-4 h-4" />
                  Balance de Créditos
                </div>
                <span className="text-2xl font-black text-primary">
                  {profile?.creditos}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cada guion generado o regenerado consume 1 crédito. Tus pagos se procesan de forma segura mediante PayPal.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2 border-primary/30 hover:bg-primary/10"
                onClick={() => {
                  onOpenChange(false)
                  router.push("/pricing")
                }}
              >
                <CreditCard className="w-4 h-4" />
                Cargar más créditos
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}