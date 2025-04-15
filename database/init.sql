CREATE TABLE agencias (
    id_agency SERIAL PRIMARY KEY,
    agency_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE pacientes (
    id_paciente SERIAL PRIMARY KEY,
    patient_name VARCHAR(255),
    address VARCHAR(255),
    birthday DATE,
    gender VARCHAR(50),
    contact_info VARCHAR(255),
    discipline VARCHAR(255),
    payor_type VARCHAR(255),
    cert_period VARCHAR(255),
    agency INTEGER REFERENCES agencias(id_agency),
    physician VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE terapistas (
    user_id SERIAL PRIMARY KEY,
    therapist_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    birthday DATE,
    gender VARCHAR(50),
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    rol VARCHAR(50)
);

CREATE TABLE paciente_terapeuta (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id_paciente),
    terapeuta_id INTEGER REFERENCES terapistas(user_id)
);

CREATE TABLE certification_periods (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id_paciente),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE visitas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id_paciente),
    terapeuta_id INTEGER REFERENCES terapistas(user_id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_visita VARCHAR(255),
    notas VARCHAR(1000),
    estado VARCHAR(20) DEFAULT 'Scheduled',
    firma_terapeuta BOOLEAN DEFAULT FALSE,
    firma_paciente BOOLEAN DEFAULT FALSE,
    cert_period_id INTEGER REFERENCES certification_periods(id)
);

CREATE INDEX idx_pacientes_agency ON pacientes(agency);
CREATE INDEX idx_visitas_paciente ON visitas(paciente_id);
CREATE INDEX idx_visitas_terapeuta ON visitas(terapeuta_id);
CREATE INDEX idx_cert_periods_paciente ON certification_periods(paciente_id);