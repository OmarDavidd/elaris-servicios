-- =========================
-- LIMPIEZA (BORRAR TODO)
-- =========================
DROP TABLE IF EXISTS 
    inscripcion_escolaridad,
    inscripciones,
    persona_lengua,
    lengua,
    persona_enfermedad,
    enfermedad,
    responsable,
    info_medica,
    documento,
    examen_admision,
    ficha,
    carrera,
    campus,
    escolaridad,
    escuela,
    ubicacion,
    persona,
    usuario,
    campus_carrera
CASCADE;

-- =========================
-- EXTENSIONES
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- USUARIO (opcional)
-- =========================
CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT
);

-- =========================
-- UBICACION
-- =========================
CREATE TABLE ubicacion (
    id_ubicacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Coordenadas (OBLIGATORIO)
    latitud DECIMAL(9,6) NOT NULL,
    longitud DECIMAL(9,6) NOT NULL,

    -- Dirección (derivada del geocoding)
    calle TEXT,
    numero TEXT,
    colonia TEXT,
    municipio TEXT NOT NULL,
    estado TEXT NOT NULL,
    codigo_postal TEXT,

    -- Extra útil
    direccion_completa TEXT
);
-- =========================
-- PERSONA
-- =========================
CREATE TABLE persona (
    id_persona UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    id_ubicacion UUID,
    fecha_nacimiento DATE,
    sexo TEXT,
    telefono TEXT,
    FOREIGN KEY (id_ubicacion) REFERENCES ubicacion(id_ubicacion) ON DELETE SET NULL
);


-- =========================
-- ESCUELA
-- =========================
CREATE TABLE escuela (
    id_escuela UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    id_ubicacion UUID,
    tipo TEXT,
    FOREIGN KEY (id_ubicacion) REFERENCES ubicacion(id_ubicacion) ON DELETE SET NULL
);

-- =========================
-- ESCOLARIDAD
-- =========================
CREATE TABLE escolaridad (
    id_escolaridad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID,
    id_escuela UUID,
    promedio NUMERIC(4,2),
    anio_egreso INT,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_escuela) REFERENCES escuela(id_escuela) ON DELETE SET NULL
);

-- =========================
-- CAMPUS
-- =========================
CREATE TABLE campus (
    id_campus UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);

-- =========================
-- CARRERA
-- =========================
CREATE TABLE carrera (
    id_carrera UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);

-- ===============
-- relqacion carrera campus
-- ==============

CREATE TABLE campus_carrera (
    id_campus UUID,
    id_carrera UUID,

    PRIMARY KEY (id_campus, id_carrera),

    FOREIGN KEY (id_campus)
        REFERENCES campus(id_campus)
        ON DELETE CASCADE,

    FOREIGN KEY (id_carrera)
        REFERENCES carrera(id_carrera)
        ON DELETE CASCADE
);

-- =========================
-- FICHA
-- =========================
CREATE TABLE ficha (
    id_ficha UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID,
    id_carrera UUID,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado TEXT,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera) ON DELETE SET NULL
);

-- =========================
-- EXAMEN ADMISION
-- =========================
CREATE TABLE examen_admision (
    id_examen UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_ficha UUID,
    fecha DATE,
    calificacion NUMERIC(5,2),
    resultado TEXT,
    FOREIGN KEY (id_ficha) REFERENCES ficha(id_ficha) ON DELETE CASCADE
);

-- =========================
-- DOCUMENTOS
-- =========================
CREATE TABLE documento (
    id_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID,
    tipo TEXT,
    url_archivo TEXT,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE
);

-- =========================
-- INFORMACION MEDICA
-- =========================
CREATE TABLE info_medica (
    id_info_medica UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID UNIQUE,
    tipo_sangre TEXT,
    alergias TEXT,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE
);

-- =========================
-- RESPONSABLES
-- =========================
CREATE TABLE responsable (
    id_responsable UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID,
    nombre TEXT,
    telefono TEXT,
    parentesco TEXT,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE
);

-- =========================
-- ENFERMEDADES
-- =========================
CREATE TABLE enfermedad (
    id_enfermedad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);

CREATE TABLE persona_enfermedad (
    id_persona UUID,
    id_enfermedad UUID,
    PRIMARY KEY (id_persona, id_enfermedad),
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_enfermedad) REFERENCES enfermedad(id_enfermedad) ON DELETE CASCADE
);

-- =========================
-- LENGUAS
-- =========================
CREATE TABLE lengua (
    id_lengua UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);

CREATE TABLE persona_lengua (
    id_persona UUID,
    id_lengua UUID,
    nivel TEXT,
    PRIMARY KEY (id_persona, id_lengua),
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_lengua) REFERENCES lengua(id_lengua) ON DELETE CASCADE

);

-- =========================
-- INSCRIPCIONES
-- =========================

CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,

    curp VARCHAR(18) NOT NULL,
    folio_acta_nacimiento VARCHAR(20) NOT NULL,
    registrar_responsable BOOLEAN NOT NULL DEFAULT FALSE,
    id_responsable UUID REFERENCES persona(id_persona) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inscripcion_escolaridad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_inscripcion UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,

    nivel VARCHAR(20) NOT NULL,
    nombre_institucion TEXT NOT NULL,
    lugar_expedicion TEXT NOT NULL,
    promedio NUMERIC(4,2) NOT NULL,
    folio_certificado TEXT NOT NULL,
    url_certificado TEXT,
    tipo_institucion TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);