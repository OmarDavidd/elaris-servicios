import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Users, CheckCircle, Clock } from 'lucide-react'

interface Stats {
  totalAdmision: number
  pendientesAdmision: number
  aprobadasAdmision: number
  totalInscripcion: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAdmision: 0,
    pendientesAdmision: 0,
    aprobadasAdmision: 0,
    totalInscripcion: 0,
  })

  const loadStats = async () => {
    const [
      { count: totalAdmision },
      { count: pendientesAdmision },
      { count: aprobadasAdmision },
      { count: totalInscripcion },
    ] = await Promise.all([
      supabase.from('ficha').select('*', { count: 'exact', head: true }),
      supabase.from('ficha').select('*', { count: 'exact', head: true }).eq('estado', 'registrado'),
      supabase.from('ficha').select('*', { count: 'exact', head: true }).eq('estado', 'aprobada'),
      supabase.from('inscripciones').select('*', { count: 'exact', head: true }),
    ])

    setStats({
      totalAdmision: totalAdmision || 0,
      pendientesAdmision: pendientesAdmision || 0,
      aprobadasAdmision: aprobadasAdmision || 0,
      totalInscripcion: totalInscripcion || 0,
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats()
  }, [])

  const cards = [
    {
      title: 'Total Fichas Admisión',
      value: stats.totalAdmision,
      icon: FileText,
      bgColor: 'bg-green-50',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
    {
      title: 'Pendientes',
      value: stats.pendientesAdmision,
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Aprobadas',
      value: stats.aprobadasAdmision,
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
    {
      title: 'Inscripciones',
      value: stats.totalInscripcion,
      icon: Users,
      bgColor: 'bg-green-50',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F172A]">Dashboard</h2>
        <p className="text-[#64748B] mt-1">Resumen general del sistema</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md hover:border-[#E2E8F0] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">{card.title}</p>
                <p className={`text-4xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <card.icon className={card.iconColor} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
