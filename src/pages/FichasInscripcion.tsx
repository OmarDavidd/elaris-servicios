import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { FichaInscripcion } from '../types'
import { Search } from 'lucide-react'

export default function FichasInscripcion() {
  const [fichas, setFichas] = useState<FichaInscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFichas()
  }, [])

  type RawInscripcion = {
    id: string
    id_alumno: string
    curp: string
    folio_acta_nacimiento: string
    registrar_responsable: boolean
    id_responsable: string | null
    alumno: {
      id_persona: string
      sexo: string | null
      correo: string | null
      persona: {
        nombre: string
        apellido_paterno: string | null
        apellido_materno: string | null
        telefono: string | null
      } | null
    } | null
    inscripcion_escolaridad: {
      nivel: string
      nombre_institucion: string
      promedio: number
      folio_certificado: string
    }[] | null
  }

  const loadFichas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`
          id,
          id_alumno,
          curp,
          folio_acta_nacimiento,
          registrar_responsable,
          id_responsable,
          alumno:alumno (
            id_persona,
            sexo,
            correo,
            persona:persona (
              nombre,
              apellido_paterno,
              apellido_materno,
              telefono
            )
          ),
          inscripcion_escolaridad:inscripcion_escolaridad (
            nivel,
            nombre_institucion,
            promedio,
            folio_certificado
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading inscripciones:', error.message)
        setFichas([])
        return
      }

      if (!data || data.length === 0) {
        setFichas([])
        return
      }

      const mapped: FichaInscripcion[] = data.map((raw: RawInscripcion) => {
        const alumno = raw.alumno
        const persona = alumno?.persona
        const escolaridad = Array.isArray(raw.inscripcion_escolaridad) ? raw.inscripcion_escolaridad : []

        return {
          id: raw.id,
          id_alumno: raw.id_alumno,
          id_persona: alumno?.id_persona || '',
          id_responsable: raw.id_responsable ?? null,
          curp: raw.curp,
          folio_acta_nacimiento: raw.folio_acta_nacimiento,
          registrar_responsable: raw.registrar_responsable,
          persona: persona
            ? {
              nombre: persona.nombre,
              apellido_paterno: persona.apellido_paterno ?? null,
              apellido_materno: persona.apellido_materno ?? null,
              telefono: persona.telefono ?? null,
              correo: alumno?.correo ?? null,
              sexo: alumno?.sexo ?? null,
            }
            : null,
          escolaridad: escolaridad.map((item) => ({
            nivel: item.nivel,
            nombre_institucion: item.nombre_institucion,
            promedio: item.promedio,
            folio_certificado: item.folio_certificado,
          })),
        }
      })

      setFichas(mapped)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = fichas.filter((f) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const nombreCompleto = `${f.persona?.nombre || ''} ${f.persona?.apellido_paterno || ''} ${f.persona?.apellido_materno || ''}`.toLowerCase()
    return (
      nombreCompleto.includes(searchLower) ||
      f.curp?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black">Fichas de Inscripción</h2>
        <p className="text-gray-600 mt-1">Gestiona las fichas de inscripción</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o CURP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B43] focus:border-transparent transition bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B43]"></div>
            <p className="text-gray-600 mt-4">Cargando fichas...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">
                Total: <span className="text-[#1D7B43] font-bold">{filtered.length}</span> fichas
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">CURP</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Folio Acta</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Escolaridad</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-green-50/30 transition">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{f.persona?.nombre} {f.persona?.apellido_paterno}</div>
                       <div className="text-xs text-gray-500">{f.persona?.apellido_materno}</div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{f.curp}</td>
                      <td className="p-4 text-gray-700">{f.folio_acta_nacimiento}</td>
                      <td className="p-4 text-gray-700">
                        {f.escolaridad?.map((e: any) => e.nivel).join(', ') || 'N/A'}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/ficha/${f.id}?type=inscripcion`}
                          className="text-[#1D7B43] hover:text-[#155f32] text-xs font-semibold transition-colors"
                        >
                          Ver detalle
                        </Link>
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
