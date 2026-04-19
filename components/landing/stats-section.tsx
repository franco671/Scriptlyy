"use client"

import { FileText, Users, Zap, TrendingUp } from "lucide-react"

const stats = [
  {
    value: "10,000+",
    label: "Guiones generados",
    icon: FileText
  },
  {
    value: "2,500+",
    label: "Creadores activos",
    icon: Users
  },
  {
    value: "< 30s",
    label: "Tiempo promedio",
    icon: Zap
  },
  {
    value: "89%",
    label: "Tasa de retención",
    icon: TrendingUp
  }
]

export function StatsSection() {
  return (
    <section className="py-16 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`text-center opacity-0 animate-fade-in-up ${
                i === 0 ? 'animation-delay-100' : 
                i === 1 ? 'animation-delay-200' : 
                i === 2 ? 'animation-delay-300' :
                'animation-delay-400'
              }`}
            >
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
