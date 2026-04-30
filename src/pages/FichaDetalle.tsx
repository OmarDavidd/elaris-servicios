import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { PersonaDetalle, Documento } from '../types'
import { ArrowLeft, FileText, Download, School } from 'lucide-react'

export default function FichaDetalle() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const inscripcionId = searchParams.get('id')

  const [persona, setPersona] = useState<PersonaDetalle | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) loadDetalle()
  }, [id, type, inscripcionId])

  type RawAlumno = {
    id_alumno: string
    id_persona: string
    curp: string
    sexo: string | null
    correo: string | null
    persona: {
      id_persona: string
      nombre: string
      apellido_paterno: string | null
      apellido_materno: string | null
      fecha_nacimiento: string | null
      telefono: string | null
    } | null
  }

  type RawResponsable = {
    parentesco: string | null
    persona: {
      nombre: string
      apellido_paterno: string | null
      apellido_materno: string | null
      telefono: string | null
    } | null
  }

  type InscripcionRecord = {
    id: string
    id_alumno: string
    curp: string
    folio_acta_nacimiento: string
    registrar_responsable: boolean
    id_responsable: string | null
  }

  type DocumentoRecord = {
    id_documento: string
    id_alumno: string
    tipo: string
    url_archivo: string
  }

  type EscolaridadRecord = {
    id_escolaridad: string
    promedio: number
    anio_egreso: number | null
    escuela: { nombre: string | null; tipo: string | null } | null
  }

  type InscripcionEscolaridadRecord = {
    nivel: string
    nombre_institucion: string
    promedio: number
    folio_certificado: string
    lugar_expedicion: string
    tipo_institucion: string
    url_certificado: string | null
  }

  type EnfermedadRecord = { enfermedad: { nombre: string | null } | null }
  type LenguaRecord = { lengua: { nombre: string | null } | null }
  type InfoMedicaRecord = { tipo_sangre: string | null; alergias: string | null }

  const loadDetalle = async () => {
    try {
      setError('')
      setLoading(true)

      let alumnoId = null
      let inscripcionData: InscripcionRecord | null = null
      let responsableId: string | null = null
      let currentInscripcionId: string | null = inscripcionId

      // When type=inscripcion, the `id` param is the INSCRIPCION id
      if (type === 'inscripcion' && id) {
        const { data: inscData } = await supabase
          .from('inscripciones')
          .select('id, id_alumno, curp, folio_acta_nacimiento, registrar_responsable, id_responsable')
          .eq('id', id)
          .maybeSingle()
        
        if (inscData?.id_alumno) {
          alumnoId = inscData.id_alumno
          inscripcionData = inscData as InscripcionRecord
          responsableId = inscData.id_responsable ?? null
          currentInscripcionId = inscData.id
        }
      } else {
        // Check if it's a ficha id (from admision)
        const { data: fichaData } = await supabase
          .from('ficha')
          .select('id_alumno')
          .eq('id_ficha', id)
          .maybeSingle()

        if (fichaData?.id_alumno) {
          alumnoId = fichaData.id_alumno
        }
      }

      if (!alumnoId) {
        setError('No se encontró la información')
        setLoading(false)
        return
      }

      const { data: alumnoData, error: alumnoError } = await supabase
        .from('alumno')
        .select(`
          id_alumno,
          id_persona,
          curp,
          sexo,
          correo,
          persona:persona (
            id_persona,
            nombre,
            apellido_paterno,
            apellido_materno,
            fecha_nacimiento,
            telefono
          )
        `)
        .eq('id_alumno', alumnoId)
        .maybeSingle()

      if (alumnoError || !alumnoData) {
        setError('No se encontró la información del alumno')
        setLoading(false)
        return
      }

      const [
        documentosResponse,
        infoMedicaResponse,
        enfermedadesResponse,
        lenguasResponse,
        escolaridadResponse,
        inscripcionEscolaridadResponse,
      ] = await Promise.all([
        supabase.from('documento').select('id_documento, id_alumno, tipo, url_archivo').eq('id_alumno', alumnoId),
        supabase.from('info_medica').select('tipo_sangre, alergias').eq('id_alumno', alumnoId).maybeSingle(),
        supabase.from('alumno_enfermedad').select('enfermedad(nombre)').eq('id_alumno', alumnoId),
        supabase.from('alumno_lengua').select('lengua(nombre)').eq('id_alumno', alumnoId),
        supabase.from('escolaridad').select('id_escolaridad, promedio, anio_egreso, escuela:escuela (nombre, tipo)').eq('id_alumno', alumnoId),
        currentInscripcionId
          ? supabase
              .from('inscripcion_escolaridad')
              .select('nivel, nombre_institucion, promedio, folio_certificado, lugar_expedicion, tipo_institucion, url_certificado')
              .eq('id_inscripcion', currentInscripcionId)
          : Promise.resolve({ data: [] as InscripcionEscolaridadRecord[], error: null }),
      ])

      const documentos = (documentosResponse.data ?? []) as DocumentoRecord[]
      const infoMedica = (infoMedicaResponse.data as InfoMedicaRecord | null) ?? null
      const enfermedades = (enfermedadesResponse.data ?? []) as EnfermedadRecord[]
      const lenguas = (lenguasResponse.data ?? []) as LenguaRecord[]
      const escolaridades = (escolaridadResponse.data ?? []) as EscolaridadRecord[]
      const inscripcionEscolaridad = (inscripcionEscolaridadResponse.data ?? []) as InscripcionEscolaridadRecord[]

      const responsableDataPromise = responsableId
        ? supabase
            .from('responsable')
            .select(`
              parentesco,
              persona:persona (
                nombre,
                apellido_paterno,
                apellido_materno,
                telefono
              )
            `)
            .eq('id_responsable', responsableId)
            .maybeSingle()
        : Promise.resolve({ data: null as RawResponsable | null, error: null })

      const { data: responsableData } = await responsableDataPromise

      setPersona({
        id_alumno: alumnoData.id_alumno,
        id_persona: alumnoData.id_persona,
        nombre: alumnoData.persona?.nombre || '',
        apellido_paterno: alumnoData.persona?.apellido_paterno ?? null,
        apellido_materno: alumnoData.persona?.apellido_materno ?? null,
        fecha_nacimiento: alumnoData.persona?.fecha_nacimiento ?? null,
        sexo: alumnoData.sexo ?? null,
        telefono: alumnoData.persona?.telefono ?? null,
        curp: alumnoData.curp || inscripcionData?.curp || '',
        email: alumnoData.correo ?? null,
        info_medica: infoMedica
          ? {
            tipo_sangre: infoMedica.tipo_sangre ?? null,
            alergias: infoMedica.alergias ?? null,
          }
          : null,
        enfermedades: enfermedades
          .map((registro) => registro.enfermedad?.nombre)
          .filter((nombre): nombre is string => Boolean(nombre)),
        lenguas: lenguas
          .map((registro) => registro.lengua?.nombre)
          .filter((nombre): nombre is string => Boolean(nombre)),
        responsable: responsableData
          ? {
            nombre: `${responsableData.persona?.nombre || ''} ${responsableData.persona?.apellido_paterno || ''} ${responsableData.persona?.apellido_materno || ''}`.trim(),
            telefono: responsableData.persona?.telefono ?? null,
            parentesco: responsableData.parentesco,
          }
          : null,
        escolaridad: escolaridades.map((escolaridad) => ({
          id_escolaridad: escolaridad.id_escolaridad,
          promedio: escolaridad.promedio,
          anio_egreso: escolaridad.anio_egreso ?? null,
          escuela: {
            nombre: escolaridad.escuela?.nombre || '',
            tipo: escolaridad.escuela?.tipo || '',
          },
        })),
        inscripcion_escolaridad: inscripcionEscolaridad.map((item) => ({
          nivel: item.nivel,
          nombre_institucion: item.nombre_institucion,
          promedio: item.promedio,
          folio_certificado: item.folio_certificado,
          lugar_expedicion: item.lugar_expedicion,
          tipo_institucion: item.tipo_institucion,
          url_certificado: item.url_certificado ?? null,
        })),
        inscripcionData: inscripcionData
          ? {
            id: inscripcionData.id,
            curp: inscripcionData.curp,
            folio_acta_nacimiento: inscripcionData.folio_acta_nacimiento,
            registrar_responsable: inscripcionData.registrar_responsable,
            id_responsable: inscripcionData.id_responsable ?? null,
          }
          : null,
      })

      setDocumentos(documentos.map((doc) => ({
        id_documento: doc.id_documento,
        id_alumno: doc.id_alumno,
        tipo: doc.tipo,
        url_archivo: doc.url_archivo,
      })))
    } catch (err: any) {
      setError(err.message || 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentUrl = (doc: Documento) => {
    if (doc.url_archivo.startsWith('http')) return doc.url_archivo
    return supabase.storage.from('documents').getPublicUrl(doc.url_archivo).data.publicUrl
  }

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B43]"></div>
      <p className="text-gray-600 mt-4">Cargando...</p>
    </div>
  )
  
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>
  if (!persona) return <p className="text-center py-8">No se encontró la información</p>

  return (
    <div>
      <Link to={type === 'inscripcion' ? "/fichas-inscripcion" : "/fichas-admision"} 
        className="inline-flex items-center gap-2 text-[#1D7B43] hover:text-[#155f32] mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a lista
      </Link>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black">
          {persona.nombre} {persona.apellido_paterno} {persona.apellido_materno}
        </h2>
        <p className="text-gray-600 mt-1">
          {type === 'inscripcion' ? 'Detalle de Inscripción' : 'Detalle de Ficha de Admisión'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-black mb-6 pb-3 border-b border-gray-100">Información Personal</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre completo</dt>
              <dd className="font-semibold text-gray-900 mt-1">{persona.nombre} {persona.apellido_paterno} {persona.apellido_materno}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">CURP</dt>
              <dd className="font-mono text-sm text-gray-900 mt-1">{persona.curp || 'No registrado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
              <dd className="text-[#1D7B43] font-medium mt-1">{persona.email || 'No registrado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</dt>
              <dd className="text-gray-900 font-medium mt-1">{persona.telefono || 'No registrado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nacimiento</dt>
              <dd className="text-gray-900 mt-1">{persona.fecha_nacimiento || 'No registrado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</dt>
              <dd className="mt-1">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {persona.sexo || 'No registrado'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-black mb-6 pb-3 border-b border-gray-100">Información Médica</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Sangre</dt>
              <dd className="mt-1">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                  {persona.info_medica?.tipo_sangre || 'No registrado'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alergias</dt>
              <dd className="text-gray-900 mt-1">{persona.info_medica?.alergias || 'Ninguna'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Enfermedades</dt>
              <dd className="mt-1">
                {persona.enfermedades && persona.enfermedades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {persona.enfermedades.map((e, i) => (
                      <span key={i} className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                        {e}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Ninguna</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lenguas</dt>
              <dd className="mt-1">
                {persona.lenguas && persona.lenguas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {persona.lenguas.map((l, i) => (
                      <span key={i} className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Ninguna</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {type === 'inscripcion' && persona.inscripcion_escolaridad && persona.inscripcion_escolaridad.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-black mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
              <School className="text-[#1D7B43]" size={20} />
              Escolaridad de Inscripción
            </h3>
            <div className="space-y-4">
              {persona.inscripcion_escolaridad.map((e, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</dt>
                      <dd className="font-semibold text-gray-900 mt-1">{e.nivel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Institución</dt>
                      <dd className="text-gray-900 mt-1">{e.nombre_institucion}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</dt>
                      <dd className="font-bold text-[#1D7B43] mt-1">{e.promedio}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Folio Certificado</dt>
                      <dd className="text-gray-900 mt-1">{e.folio_certificado}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar Expedición</dt>
                      <dd className="text-gray-900 mt-1">{e.lugar_expedicion}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Institución</dt>
                      <dd className="mt-1">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-[#1D7B43]">
                          {e.tipo_institucion}
                        </span>
                      </dd>
                    </div>
                  </div>
                  {e.url_certificado && (
                    <a
                      href={e.url_certificado}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#1D7B43] hover:text-[#155f32] mt-3 font-medium transition-colors"
                    >
                      <Download size={12} />
                      Ver Certificado
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {persona.responsable && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-black mb-6 pb-3 border-b border-gray-100">Responsable</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</dt>
                <dd className="font-semibold text-gray-900 mt-1">{persona.responsable.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</dt>
                <dd className="mt-1">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-[#1D7B43]">
                    {persona.responsable.parentesco || 'No registrado'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</dt>
                <dd className="text-gray-900 font-medium mt-1">{persona.responsable.telefono || 'No registrado'}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-black mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
            <FileText className="text-[#1D7B43]" size={20} />
            Documentos Subidos ({documentos.length})
          </h3>
          {documentos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentos.map((doc) => (
                <div key={doc.id_documento} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#1D7B43]/10 p-2 rounded-lg">
                      <FileText className="text-[#1D7B43]" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.tipo}</p>
                      {doc.url_archivo && (
                        <a
                          href={getDocumentUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1D7B43] hover:text-[#155f32] mt-2 font-medium transition-colors"
                        >
                          <Download size={12} />
                          Ver documento
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay documentos subidos</p>
          )}
        </div>
      </div>
    </div>
  )
}
