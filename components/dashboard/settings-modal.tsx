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
import { User, Mail, ShieldCheck, BadgeCheck } from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ email: string; nombre?: string; es_premium: boolean } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [open])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Traemos los datos extra de la tabla profiles
      const { data } = await supabase
        .from("profiles")
        .select("creditos, es_premium")
        .eq("id", user.id)
        .single()

      setProfile({
        email: user.email || "",
        nombre: user.user_metadata?.full_name || "Creador",
        es_premium: data?.es_premium || false
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
            Gestiona la información de tu perfil en Scriptlyy.
          </DialogDescription>
        </DialogHeader>

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

          {/* Estado de la cuenta */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Estado del Plan
              </div>
              {profile?.es_premium ? (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 uppercase">
                  <BadgeCheck className="w-3 h-3" /> Premium
                </span>
              ) : (
                <span className="text-xs font-bold text-muted-foreground uppercase">Gratis</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tu cuenta está vinculada a nuestro sistema de pagos seguro a través de Stripe.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}