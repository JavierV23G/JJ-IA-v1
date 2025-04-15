from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class Agencias(Base):
    __tablename__ = "agencias"
    
    id_agency = Column(Integer, primary_key=True, index=True)
    agency_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    username = Column(String(255), unique=True)
    password = Column(String(255))
    
    pacientes = relationship("Pacientes", back_populates="agencia")

class Terapistas(Base):
    __tablename__ = "terapistas"
    
    user_id = Column(Integer, primary_key=True, index=True)
    therapist_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    birthday = Column(Date)
    gender = Column(String(50))
    username = Column(String(255), unique=True)
    password = Column(String(255))
    rol = Column(String(50))
    
    pacientes = relationship("PacienteTerapeuta", back_populates="terapeuta")

class Pacientes(Base):
    __tablename__ = "pacientes"
    
    id_paciente = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255))
    address = Column(String(255))
    birthday = Column(Date)
    gender = Column(String(50))
    contact_info = Column(String(255))
    discipline = Column(String(255))
    payor_type = Column(String(255))
    cert_period = Column(String(255), nullable=True)
    agency = Column(Integer, ForeignKey('agencias.id_agency'))
    activo = Column(Boolean)
    
    agencia = relationship("Agencias", back_populates="pacientes")
    terapistas = relationship("PacienteTerapeuta", back_populates="paciente")
    certification_periods = relationship("CertificationPeriods", back_populates="paciente")
    visitas = relationship("Visitas", back_populates="paciente")

class PacienteTerapeuta(Base):
    __tablename__ = "paciente_terapeuta"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey('pacientes.id_paciente'))
    terapeuta_id = Column(Integer, ForeignKey('terapistas.user_id'))
    
    paciente = relationship("Pacientes", back_populates="terapistas")
    terapeuta = relationship("Terapistas", back_populates="pacientes")

class CertificationPeriods(Base):
    __tablename__ = "certification_periods"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey('pacientes.id_paciente'))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean)
    created_at = Column(Date)
    
    paciente = relationship("Pacientes", back_populates="certification_periods")

class Visitas(Base):
    __tablename__ = "visitas"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey('pacientes.id_paciente'))
    terapeuta_id = Column(Integer, ForeignKey('terapistas.user_id'))
    cert_period_id = Column(Integer, ForeignKey('certification_periods.id'))
    tipo_visita = Column(String(50))
    date = Column(Date)
    status = Column(String(50))
    notes = Column(String)
    
    paciente = relationship("Pacientes", back_populates="visitas")
    terapeuta = relationship("Terapistas")
    cert_period = relationship("CertificationPeriods")