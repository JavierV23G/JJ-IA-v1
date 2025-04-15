from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class AgenciaBase(BaseModel):
    agency_name: str
    email: str
    phone: str
    username: str
    password: str

class AgenciaCreate(AgenciaBase):
    pass

class Agencia(AgenciaBase):
    id_agency: int

    class Config:
        from_attributes = True

class TerapeutaBase(BaseModel):
    therapist_name: str
    email: str
    phone: str
    birthday: date
    gender: str
    username: str
    password: str
    rol: str

class TerapeutaCreate(TerapeutaBase):
    pass

class Terapeuta(TerapeutaBase):
    user_id: int

    class Config:
        from_attributes = True

class PacienteBase(BaseModel):
    patient_name: str
    address: str
    birthday: date
    gender: str
    contact_info: str
    discipline: str
    payor_type: str
    cert_period: Optional[str] = None
    agency: int
    activo: Optional[bool] = True

class PacienteCreate(PacienteBase):
    pass

class Paciente(PacienteBase):
    id_paciente: int
    cert_periods: List['CertificationPeriodResponse'] = []
    cert_period: Optional[str] = None

    class Config:
        from_attributes = True

class PacienteTerapeutaBase(BaseModel):
    paciente_id: int
    terapeuta_id: int

class PacienteTerapeutaCreate(PacienteTerapeutaBase):
    pass

class PacienteTerapeuta(PacienteTerapeutaBase):
    id: int

    class Config:
        from_attributes = True

class TerapistaAsignacion(BaseModel):
    therapist_id: int

    class Config:
        from_attributes = True

class VisitaBase(BaseModel):
    paciente_id: int
    terapeuta_id: int
    tipo_visita: str
    notes: Optional[str] = None
    status: Optional[str] = "Scheduled"
    cert_period_id: Optional[int] = None

class VisitaCreate(BaseModel):
    paciente_id: int
    terapeuta_id: int
    tipo_visita: str
    notes: Optional[str] = None
    cert_period_id: int

class Visita(VisitaBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True

class CertificationPeriodCreate(BaseModel):
    start_date: date

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.strftime('%Y-%m-%d')
        }

class CertificationPeriodResponse(BaseModel):
    id: int
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.strftime('%Y-%m-%d')
        }