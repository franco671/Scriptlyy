import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardPage } from "@/components/dashboard/dashboard-page"

export default async function DashboardRoute() {
  const supabase = await createClient()

  // Revisamos si el usuario tiene una sesión activa
  const { data: { user }, error } = await supabase.auth.getUser()

  // Si no hay usuario o hay error, lo mandamos al login
  if (error || !user) {
    redirect('/login') // O la ruta donde tengas tu formulario de inicio de sesión
  }

  // Si hay usuario, cargamos el dashboard
  return (
    <main>
      <DashboardPage />
    </main>
  )
}