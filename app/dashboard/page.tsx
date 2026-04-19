import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardPage } from "@/components/dashboard/dashboard-page"

export default async function DashboardRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Seguridad: si no está logueado, lo mandamos al login
  if (!user) {
    redirect('/login')
  }

  return (
    <main>
      {/* Usamos el componente que ya tenés en la carpeta components */}
      <DashboardPage />
    </main>
  )
}