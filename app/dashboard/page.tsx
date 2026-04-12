"use client"

// Importamos el componente principal desde tu carpeta de components
import DashboardMain from "@/components/dashboard/dashboard-page"

export default function DashboardPage() {
  return (
    <main>
      {/* Este componente ya debería tener adentro la Sidebar, 
          el Script Editor y la lógica de usuario que usabas antes.
      */}
      <DashboardMain />
    </main>
  )
}