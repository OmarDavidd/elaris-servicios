import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { FichaAdmision, FichaStatus } from '../types'
import { Search } from 'lucide-react'

export default function FichasAdmision() {
  const [fichas, setFichas] = useState<FichaAdmision[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const FILTERS = [
    { value: '', label: 'Todas' },
    { value: 'registrado', label: 'Registrado' },
    { value: 'en_revision', label: 'En revisión' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
  ] as const

  useEffect(() => {
    loadFichas()
  }, [])

  type RawFicha = {
    id_ficha: string
    id_alumno: string
    id_carrera: string
    fecha_registro: string
    estado: FichaStatus
    alumno: {
      id_persona: string
      curp: string
      sexo: string | null
      correo: string | null
      persona: {
        nombre: string
        apellido_paterno: string | null
        apellido_materno: string | null
        fecha_nacimiento: string | null
        telefono: string | null
      } | null
    } | null
    carrera: {
      nombre: string
    } | null
    examen_admision: {
      resultado: string | null
      calificacion: number | null
    }[] | null
  }

  const loadFichas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ficha')
        .select(`
          id_ficha,
          id_alumno,
          id_carrera,
          fecha_registro,
          estado,
          alumno:alumno (
            id_persona,
            curp,
            sexo,
            correo,
            persona:persona (
              nombre,
              apellido_paterno,
              apellido_materno,
              fecha_nacimiento,
              telefono
            )
          ),
          carrera:carrera (nombre),
          examen_admision:examen_admision (resultado, calificacion)
        `)
        .order('fecha_registro', { ascending: false })

      if (error) {
        console.error('Error loading fichas:', error.message)
        setFichas([])
        return
      }

      if (!data || data.length === 0) {
        setFichas([])
        return
      }

      const mapped: FichaAdmision[] = data.map((raw: RawFicha) => {
        const alumno = raw.alumno
        const persona = alumno?.persona
        const examen = Array.isArray(raw.examen_admision) ? raw.examen_admision[0] : raw.examen_admision

        return {
          id_ficha: raw.id_ficha,
          id_alumno: raw.id_alumno,
          id_persona: alumno?.id_persona || '',
          id_carrera: raw.id_carrera,
          fecha_registro: raw.fecha_registro,
          estado: raw.estado,
          persona: {
            nombre: persona?.nombre || '',
            apellido_paterno: persona?.apellido_paterno ?? null,
            apellido_materno: persona?.apellido_materno ?? null,
            curp: alumno?.curp || '',
            telefono: persona?.telefono ?? null,
            fecha_nacimiento: persona?.fecha_nacimiento ?? null,
            sexo: alumno?.sexo ?? null,
            correo: alumno?.correo ?? null,
          },
          carrera: raw.carrera ?? { nombre: '' },
          examen_admision: examen ? { resultado: examen.resultado ?? null, calificacion: examen.calificacion ?? null } : null,
        }
      })

      setFichas(mapped)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    type RawFichaDetail = {
      id_ficha: string
      estado: FichaStatus
      alumno: {
        correo: string | null
        persona: {
          nombre: string | null
          apellido_paterno: string | null
          apellido_materno: string | null
        } | null
      } | null
    }

    // Get ficha details first
    const { data: fichaData, error: fichaError } = await supabase
      .from('ficha')
      .select(`
        id_ficha,
        estado,
        alumno:alumno (
          correo,
          persona:persona (
            nombre,
            apellido_paterno,
            apellido_materno
          )
        )
      `)
      .eq('id_ficha', id)
      .single()

    if (fichaError || !fichaData) {
      console.error('Error getting ficha:', fichaError)
      return
    }

    // Update status
    const { error } = await supabase
      .from('ficha')
      .update({ estado: newStatus })
      .eq('id_ficha', id)

    if (error) {
      console.error('Error updating status:', error)
      return
    }

    const typedFicha = fichaData as RawFichaDetail
    const email = typedFicha.alumno?.correo || null
    if (!email) {
      console.log('No email found for alumno')
      loadFichas()
      return
    }

    // Send email notification
    const persona = typedFicha.alumno?.persona
    const fullName = `${persona?.nombre || ''} ${persona?.apellido_paterno || ''} ${persona?.apellido_materno || ''}`.trim()
    
    const statusMessages: Record<string, { subject: string; message: string }> = {
      'en_revision': {
        subject: 'Ficha en revisión - Elaris',
        message: 'Tu ficha de admisión ha sido recibida y está siendo revisada.'
      },
      'aprobada': {
        subject: 'Ficha aprobada - Elaris',
        message: '¡Felicidades! Tu ficha de admisión ha sido aprobada. Te contactaremos pronto con los siguientes pasos.'
      },
      'rechazada': {
        subject: 'Ficha rechazada - Elaris',
        message: 'Lamentamos informarte que tu ficha de admisión ha sido rechazada. Por favor contacta al departamento de servicios escolares para más información.'
      }
    }

    const statusInfo = statusMessages[newStatus]
    if (statusInfo) {
      const html = `
        <h2>Actualización de tu ficha de admisión</h2>
        <p>Hola ${fullName},</p>
        <p>${statusInfo.message}</p>
        <p><strong>Estatus actual:</strong> ${newStatus}</p>
        <br/>
        <p>Atentamente,</p>
        <p>Departamento de Servicios Escolares</p>
      `

      try {
        await supabase.functions.invoke('resend-email', {
          body: {
            to: email,
            subject: statusInfo.subject,
            html,
          },
        })
      } catch (err) {
        console.error('Error sending email:', err)
      }
    }

    loadFichas()
  }

  const filtered = fichas.filter((f) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      f.persona.nombre.toLowerCase().includes(searchLower) ||
      (f.persona.apellido_paterno?.toLowerCase() || '').includes(searchLower) ||
      f.persona.curp.toLowerCase().includes(searchLower)
    const matchesStatus = !statusFilter || f.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts: Record<string, number> = fichas.reduce((acc, ficha) => {
    acc[ficha.estado] = (acc[ficha.estado] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registrado': return 'bg-yellow-100 text-yellow-800'
      case 'en_revision': return 'bg-blue-100 text-blue-800'
      case 'aprobada': return 'bg-green-100 text-green-800'
      case 'rechazada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black">Fichas de Admisión</h2>
        <p className="text-gray-600 mt-1">Gestiona las fichas de admisión</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o CURP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B43] focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value
            const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium border transition-colors'
            const activeClasses = 'bg-[#1D7B43] border-[#1D7B43] text-white shadow-sm'
            const inactiveClasses = 'border-gray-200 text-gray-600 hover:border-[#1D7B43] hover:text-[#1D7B43]'
            const count = filter.value ? statusCounts[filter.value] || 0 : fichas.length

            return (
              <button
                key={filter.value || 'all'}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                {filter.label}
                <span className={`ml-2 inline-flex min-w-[1.75rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B43]"></div>
            <p className="text-gray-600 mt-4">Cargando fichas...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">Total: <span className="text-[#1D7B43] font-bold">{filtered.length}</span> fichas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">CURP</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Carrera</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id_ficha} className="border-b border-gray-50 hover:bg-green-50/30 transition">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{f.persona.nombre} {f.persona.apellido_paterno}</div>
                        <div className="text-xs text-gray-500">{f.persona.apellido_materno}</div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{f.persona.curp}</td>
                      <td className="p-4 text-gray-700">{f.carrera?.nombre}</td>
                      <td className="p-4 text-gray-600">{new Date(f.fecha_registro).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(f.estado)}`}>
                          {f.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 items-center">
                          <Link
                            to={`/ficha/${f.id_ficha}`}
                            className="text-[#1D7B43] hover:underline text-xs font-semibold"
                          >
                            Ver detalle
                          </Link>
                          <select
                            value={f.estado}
                            onChange={(e) => updateStatus(f.id_ficha, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D7B43] bg-white"
                          >
                            <option value="registrado">registrado</option>
                            <option value="en_revision">en_revision</option>
                            <option value="aprobada">aprobada</option>
                            <option value="rechazada">rechazada</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
