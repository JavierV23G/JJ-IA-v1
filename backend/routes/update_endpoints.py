from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, timedelta
from database.connection import get_db
from database.models import Agencias, Terapistas, CertificationPeriods, Visitas, Pacientes
from schemas import Paciente, Agencia, Terapeuta, CertificationPeriodResponse, Visita

router = APIRouter()

@router.put("/pacientes/{paciente_id}", response_model=Paciente)
def editar_paciente_info(
    paciente_id: int,
    patient_name: str | None = None,
    address: str | None = None,
    birthday: str | None = None,
    gender: str | None = None,
    contact_info: str | None = None,
    discipline: str | None = None,
    payor_type: str | None = None,
    cert_period: str | None = None,
    agency: int | None = None,
    physician: str | None = None,
    db: Session = Depends(get_db)
):
    paciente = db.query(Pacientes).filter(Pacientes.id_paciente == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    if agency:
        agencia = db.query(Agencias).filter(Agencias.id_agency == agency).first()
        if not agencia:
            raise HTTPException(status_code=404, detail="Agencia no encontrada")

    if discipline:
        valid_disciplines = ["PT", "OT", "ST"]
        if discipline not in valid_disciplines:
            raise HTTPException(
                status_code=400,
                detail=f"Disciplina inválida. Debe ser: {', '.join(valid_disciplines)}"
            )

    if gender:
        valid_genders = ["M", "F"]
        if gender not in valid_genders:
            raise HTTPException(status_code=400, detail="Género debe ser M o F")

    update_data = {}
    if patient_name: update_data["patient_name"] = patient_name
    if address: update_data["address"] = address
    if birthday: update_data["birthday"] = birthday
    if gender: update_data["gender"] = gender
    if contact_info: update_data["contact_info"] = contact_info
    if discipline: update_data["discipline"] = discipline
    if payor_type: update_data["payor_type"] = payor_type
    if cert_period: update_data["cert_period"] = cert_period
    if agency: update_data["agency"] = agency
    if physician: update_data["physician"] = physician

    for key, value in update_data.items():
        setattr(paciente, key, value)

    db.commit()
    db.refresh(paciente)
    return Paciente.from_orm(paciente)

@router.put("/agencias/{agency_name}", response_model=Agencia)
def editar_agencia_info(
    agency_name: str,
    new_agency_name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    username: str | None = None,
    password: str | None = None,
    db: Session = Depends(get_db)
):
    agencia = db.query(Agencias).filter(Agencias.agency_name.ilike(f"%{agency_name}%")).first()
    if not agencia:
        raise HTTPException(status_code=404, detail="Agencia no encontrada")

    if email:
        existing = db.query(Agencias)\
            .filter(Agencias.email == email, Agencias.id_agency != agencia.id_agency)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Email ya está registrado")

    if username:
        existing = db.query(Agencias)\
            .filter(Agencias.username == username, Agencias.id_agency != agencia.id_agency)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Username ya está en uso")

    if phone:
        existing = db.query(Agencias)\
            .filter(Agencias.phone == phone, Agencias.id_agency != agencia.id_agency)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Número de teléfono ya está registrado")

    update_data = {}
    if new_agency_name: update_data["agency_name"] = new_agency_name
    if email: update_data["email"] = email
    if phone: update_data["phone"] = phone
    if username: update_data["username"] = username
    if password: update_data["password"] = password

    for key, value in update_data.items():
        setattr(agencia, key, value)

    db.commit()
    db.refresh(agencia)
    return Agencia.from_orm(agencia)

@router.put("/terapistas/{therapist_name}", response_model=Terapeuta)
def editar_terapeuta_info(
    therapist_name: str,
    new_therapist_name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    birthday: str | None = None,
    gender: str | None = None,
    zip_codes: str | None = None,
    username: str | None = None,
    password: str | None = None,
    rol: str | None = None,
    db: Session = Depends(get_db)
):
    terapeuta = db.query(Terapistas).filter(Terapistas.therapist_name.ilike(f"%{therapist_name}%")).first()
    if not terapeuta:
        raise HTTPException(status_code=404, detail="Terapeuta no encontrado")

    if email:
        existing = db.query(Terapistas)\
            .filter(Terapistas.email == email, Terapistas.user_id != terapeuta.user_id)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Email ya está registrado")

    if username:
        existing = db.query(Terapistas)\
            .filter(Terapistas.username == username, Terapistas.user_id != terapeuta.user_id)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Username ya está en uso")

    if phone:
        existing = db.query(Terapistas)\
            .filter(Terapistas.phone == phone, Terapistas.user_id != terapeuta.user_id)\
            .first()
        if existing:
            raise HTTPException(status_code=400, detail="Número de teléfono ya está registrado")

    if rol:
        valid_roles = ["PT", "OT", "ST"]
        if rol not in valid_roles:
            raise HTTPException(
                status_code=400,
                detail=f"Rol inválido. Debe ser uno de: {', '.join(valid_roles)}"
            )

    if gender:
        valid_genders = ["M", "F"]
        if gender not in valid_genders:
            raise HTTPException(status_code=400, detail="Género debe ser M o F")

    update_data = {}
    if new_therapist_name: update_data["therapist_name"] = new_therapist_name
    if email: update_data["email"] = email
    if phone: update_data["phone"] = phone
    if birthday: update_data["birthday"] = birthday
    if gender: update_data["gender"] = gender
    if zip_codes: update_data["zip_codes"] = zip_codes
    if username: update_data["username"] = username
    if password: update_data["password"] = password
    if rol: update_data["rol"] = rol

    for key, value in update_data.items():
        setattr(terapeuta, key, value)

    db.commit()
    db.refresh(terapeuta)
    return Terapeuta.from_orm(terapeuta)

@router.put("/pacientes/{paciente_id}/cert-periods/{cert_period_id}", response_model=CertificationPeriodResponse)
def editar_cert_period(
    paciente_id: int,
    cert_period_id: int,
    start_date: Optional[date] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    cert_period = db.query(CertificationPeriods)\
        .filter(
            CertificationPeriods.id == cert_period_id,
            CertificationPeriods.paciente_id == paciente_id
        ).first()

    if not cert_period:
        raise HTTPException(status_code=404, detail="Periodo de certificación no encontrado")

    update_data = {}
    if start_date:
        update_data["start_date"] = start_date
        update_data["end_date"] = start_date + timedelta(days=60)

    if is_active is not None:
        if is_active:
            db.query(CertificationPeriods)\
                .filter(
                    CertificationPeriods.paciente_id == paciente_id,
                    CertificationPeriods.id != cert_period_id
                )\
                .update({"is_active": False})
        update_data["is_active"] = is_active

    for key, value in update_data.items():
        setattr(cert_period, key, value)

    db.commit()
    db.refresh(cert_period)

    return CertificationPeriodResponse.from_orm(cert_period)

@router.put("/visitas/{visita_id}", response_model=Visita)
def actualizar_visita(
    visita_id: int,
    tipo_visita: Optional[str] = None,
    notes: Optional[str] = None,
    firma_terapeuta: Optional[str] = None,
    firma_paciente: Optional[str] = None,
    reopen: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    visita = db.query(Visitas).filter(Visitas.id == visita_id).first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita no encontrada")

    if visita.status == "Completed" and not reopen:
        raise HTTPException(
            status_code=400, 
            detail="No se puede modificar una visita completada. Use reopen=true para reabrir"
        )

    update_data = {}

    if reopen and visita.status == "Completed":
        update_data["status"] = "Saved"
    else:
        if tipo_visita is not None:
            valid_types = ["EVAL", "STANDARD", "DC", "RA"]
            if tipo_visita not in valid_types:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Tipo de visita inválido. Debe ser uno de: {', '.join(valid_types)}"
                )
            update_data["tipo_visita"] = tipo_visita
        
        if notes is not None:
            update_data["notes"] = notes
        if firma_terapeuta is not None:
            update_data["firma_terapeuta"] = firma_terapeuta
        if firma_paciente is not None:
            update_data["firma_paciente"] = firma_paciente

        current_notes = notes if notes is not None else visita.notes
        current_firma_t = firma_terapeuta if firma_terapeuta is not None else visita.firma_terapeuta
        current_firma_p = firma_paciente if firma_paciente is not None else visita.firma_paciente

        notes_empty = not current_notes or current_notes.strip() == ""

        if notes_empty and not current_firma_t and not current_firma_p:
            update_data["status"] = "Scheduled"
        elif not notes_empty and current_firma_t and current_firma_p:
            update_data["status"] = "Completed"
        else:
            update_data["status"] = "Saved"

    for key, value in update_data.items():
        setattr(visita, key, value)

    db.commit()
    db.refresh(visita)
    return Visita.from_orm(visita)