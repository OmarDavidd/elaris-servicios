DROP TABLE IF EXISTS
    inscripcion_escolaridad,
    inscripciones,
    alumno_lengua,
    lengua,
    alumno_enfermedad,
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
    usuario
CASCADE;

-- ========================================
-- EXTENSIONES
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ========================================
-- TABLAS
-- ========================================

CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT
);


CREATE TABLE alumno (
    id_alumno UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID NOT NULL,
    correo TEXT UNIQUE,
    curp TEXT UNIQUE NOT NULL,
    sexo TEXT,
    id_campus UUID NOT NULL,
    id_carrera UUID NOT NULL,
    CONSTRAINT alumno_persona_unique UNIQUE (id_persona)
);


CREATE TABLE ubicacion (
    id_ubicacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitud DECIMAL(9,6) NOT NULL,
    longitud DECIMAL(9,6) NOT NULL,
    calle TEXT,
    numero TEXT,
    colonia TEXT,
    municipio TEXT NOT NULL,
    estado TEXT NOT NULL,
    codigo_postal TEXT,
    direccion_completa TEXT
);


CREATE TABLE persona (
    id_persona UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    id_ubicacion UUID,
    fecha_nacimiento DATE,
    telefono TEXT
);


CREATE TABLE escuela (
    id_escuela UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    id_ubicacion UUID NOT NULL,
    tipo TEXT
);


CREATE TABLE escolaridad (
    id_escolaridad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alumno UUID NOT NULL,
    id_escuela UUID NOT NULL,
    promedio NUMERIC(4,2),
    anio_egreso INT
);


CREATE TABLE campus (
    id_campus UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);


CREATE TABLE carrera (
    id_carrera UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);



CREATE TABLE ficha (
    id_ficha UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alumno UUID NOT NULL,
    id_carrera UUID NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado TEXT
);


CREATE TABLE examen_admision (
    id_examen UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_ficha UUID,
    fecha DATE,
    calificacion NUMERIC(5,2),
    resultado TEXT
);


CREATE TABLE documento (
    id_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alumno UUID NOT NULL,
    tipo TEXT,
    url_archivo TEXT
);


CREATE TABLE info_medica (
    id_info_medica UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alumno UUID UNIQUE NOT NULL,
    tipo_sangre TEXT,
    alergias TEXT
);


CREATE TABLE responsable (
    id_responsable UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_persona UUID NOT NULL,
    parentesco TEXT NOT NULL,
    ocupacion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT responsable_persona_unique UNIQUE (id_persona)
);


CREATE TABLE enfermedad (
    id_enfermedad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);


CREATE TABLE alumno_enfermedad (
    id_alumno UUID,
    id_enfermedad UUID,
    PRIMARY KEY (id_alumno, id_enfermedad)
);


CREATE TABLE lengua (
    id_lengua UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL
);


CREATE TABLE alumno_lengua (
    id_alumno UUID,
    id_lengua UUID,
    nivel TEXT,
    PRIMARY KEY (id_alumno, id_lengua)
);


CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alumno UUID NOT NULL,
    curp VARCHAR(18) NOT NULL,
    folio_acta_nacimiento VARCHAR(20) NOT NULL,
    registrar_responsable BOOLEAN DEFAULT FALSE,
    id_responsable UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE inscripcion_escolaridad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_inscripcion UUID NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    nombre_institucion TEXT NOT NULL,
    lugar_expedicion TEXT NOT NULL,
    promedio NUMERIC(4,2) NOT NULL,
    folio_certificado TEXT NOT NULL,
    url_certificado TEXT,
    tipo_institucion TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========================================
-- RELACIONES (FOREIGN KEYS)
-- ========================================

ALTER TABLE alumno
    ADD FOREIGN KEY (id_persona) REFERENCES persona(id_persona);

ALTER TABLE persona
    ADD FOREIGN KEY (id_ubicacion) REFERENCES ubicacion(id_ubicacion) ON DELETE SET NULL;

ALTER TABLE escuela
    ADD FOREIGN KEY (id_ubicacion) REFERENCES ubicacion(id_ubicacion) ON DELETE RESTRICT;

ALTER TABLE escolaridad
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE escolaridad
    ADD FOREIGN KEY (id_escuela) REFERENCES escuela(id_escuela) ON DELETE RESTRICT;

ALTER TABLE ficha
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE ficha
    ADD FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera) ON DELETE RESTRICT;

ALTER TABLE alumno
    ADD FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera) ON DELETE RESTRICT;

ALTER TABLE alumno
    ADD FOREIGN KEY (id_campus) REFERENCES campus(id_campus) ON DELETE RESTRICT;


ALTER TABLE examen_admision
    ADD FOREIGN KEY (id_ficha) REFERENCES ficha(id_ficha) ON DELETE CASCADE;

ALTER TABLE documento
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE info_medica
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE responsable
    ADD FOREIGN KEY (id_persona) REFERENCES persona(id_persona) ON DELETE CASCADE;

ALTER TABLE alumno_enfermedad
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE alumno_enfermedad
    ADD FOREIGN KEY (id_enfermedad) REFERENCES enfermedad(id_enfermedad) ON DELETE CASCADE;

ALTER TABLE alumno_lengua
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE alumno_lengua
    ADD FOREIGN KEY (id_lengua) REFERENCES lengua(id_lengua) ON DELETE CASCADE;

ALTER TABLE inscripciones
    ADD FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE;

ALTER TABLE inscripciones
    ADD FOREIGN KEY (id_responsable) REFERENCES responsable(id_responsable) ON DELETE SET NULL;

ALTER TABLE inscripciones
    ADD CONSTRAINT inscripciones_curp_unique UNIQUE (curp);

ALTER TABLE inscripcion_escolaridad
    ADD FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id) ON DELETE CASCADE;
