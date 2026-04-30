export type FichaStatus = 'registrado' | 'en_revision' | 'aprobada' | 'rechazada'

export interface FichaAdmision {
  id_ficha: string
  id_alumno: string
  id_persona: string
  id_carrera: string
  fecha_registro: string
  estado: FichaStatus
  persona: {
    nombre: string
    apellido_paterno: string | null
    apellido_materno: string | null
    curp: string
    telefono: string | null
    fecha_nacimiento: string | null
    sexo: string | null
    correo: string | null
  }
  carrera: { nombre: string }
  examen_admision: { resultado: string | null; calificacion: number | null } | null
}

export interface FichaInscripcion {
  id: string
  id_alumno: string
  id_persona: string
  id_responsable: string | null
  curp: string
  folio_acta_nacimiento: string
  registrar_responsable: boolean
  persona: {
    nombre: string
    apellido_paterno: string | null
    apellido_materno: string | null
    telefono: string | null
    correo: string | null
    sexo: string | null
  } | null
  escolaridad: {
    nivel: string
    nombre_institucion: string
    promedio: number
    folio_certificado: string
  }[]
}

export interface Documento {
  id_documento: string
  id_alumno: string
  tipo: string
  url_archivo: string
}

export interface PersonaDetalle {
  id_alumno: string
  id_persona: string
  nombre: string
  apellido_paterno: string | null
  apellido_materno: string | null
  fecha_nacimiento: string | null
  sexo: string | null
  telefono: string | null
  curp: string
  email: string | null
  info_medica: {
    tipo_sangre: string | null
    alergias: string | null
  } | null
  enfermedades: string[]
  lenguas: string[]
  responsable: {
    nombre: string
    telefono: string | null
    parentesco: string | null
  } | null
  escolaridad: {
    id_escolaridad: string
    promedio: number
    anio_egreso: number | null
    escuela: { nombre: string; tipo: string }
  }[]
  inscripcion_escolaridad: {
    nivel: string
    nombre_institucion: string
    promedio: number
    folio_certificado: string
    lugar_expedicion: string
    tipo_institucion: string
    url_certificado: string | null
  }[]
  inscripcionData: {
    id: string
    curp: string
    folio_acta_nacimiento: string
    registrar_responsable: boolean
    id_responsable: string | null
  } | null
}
