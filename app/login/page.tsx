"use client"

import { AuthModal } from "@/components/landing/auth-modal"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  // Esta función se ejecuta cuando el usuario se loguea con éxito
  const handleSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Forzamos el modal a estar abierto siempre con open={true} */}
        <AuthModal
          open={true}
          onOpenChange={() => router.push("/")}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}