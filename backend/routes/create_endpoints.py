from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.connection import get_db
from database.models import Agencias, Pacientes, Terapistas, CertificationPeriods, Visitas, PacienteTerapeuta
from schemas import PacienteCreate, AgenciaCreate, TerapeutaCreate, CertificationPeriodCreate, VisitaCreate, TerapistaAsignacion

router = APIRouter()

@router.post("/pacientes/")
def crear_paciente(paciente: PacienteCreate, db: Session = Depends(get_db)):
    valid_disciplines = ["PT", "OT", "ST"]
    disciplines = [d.strip() for d in paciente.discipline.split(",")]
    
    for discipline in disciplines:
        if discipline not in valid_disciplines:
            raise HTTPException(
                status_code=400,
                detail=f"Disciplina inválida. Debe ser: {', '.join(valid_disciplines)}"
            )

    if paciente.gender not in ["Male", "Female", "M", "F"]:
        raise HTTPException(status_code=400, detail="Género debe ser Male o Female")

    agencia = db.query(Agencias).filter(Agencias.id_agency == paciente.agency).first()
    if not agencia:
        raise HTTPException(status_code=404, detail="Agencia no encontrada")

    db_paciente = Pacientes(**paciente.dict(exclude={"cert_period"}))
    db.add(db_paciente)
    db.flush()

    start_date = datetime.strptime(paciente.cert_period, "%Y-%m-%d") if paciente.cert_period else datetime.utcnow()
    end_date = start_date + timedelta(days=60)
    db_paciente.cert_period = start_date.strftime("%Y-%m-%d")
    cert_period = CertificationPeriods(
        paciente_id=db_paciente.id_paciente,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(cert_period)
    db.commit()
    db.refresh(db_paciente)
    
    return {
        "paciente": db_paciente,
        "cert_period": {
            "start_date": cert_period.start_date.strftime("%Y-%m-%d"),
            "end_date": cert_period.end_date.strftime("%Y-%m-%d"),
            "is_active": cert_period.is_active
        },
    }

@router.post("/agencias/")
def crear_agencia(agencia: AgenciaCreate, db: Session = Depends(get_db)):
    existing_username = db.query(Agencias).filter(Agencias.username == agencia.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username ya está en uso")

    existing_email = db.query(Agencias).filter(Agencias.email == agencia.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email ya está registrado")

    existing_phone = db.query(Agencias).filter(Agencias.phone == agencia.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Número de teléfono ya está registrado")

    db_agencia = Agencias(**agencia.dict())
    db.add(db_agencia)
    db.commit()
    db.refresh(db_agencia)
    return db_agencia

@router.post("/terapistas/")
def crear_terapeuta(terapeuta: TerapeutaCreate, db: Session = Depends(get_db)):

    existing_username = db.query(Terapistas).filter(Terapistas.username == terapeuta.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username ya está en uso")

    existing_email = db.query(Terapistas).filter(Terapistas.email == terapeuta.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email ya está registrado")

    existing_phone = db.query(Terapistas).filter(Terapistas.phone == terapeuta.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Número de teléfono ya está registrado")

    valid_roles = ["PT", "OT", "ST", "PTA", "COTA"]
    if terapeuta.rol not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Rol inválido. Debe ser uno de: {', '.join(valid_roles)}"
        )

    db_terapeuta = Terapistas(**terapeuta.dict())
    db.add(db_terapeuta)
    db.commit()
    db.refresh(db_terapeuta)
    return db_terapeuta

@router.post("/visitas/")
def crear_visita(visita: VisitaCreate, db: Session = Depends(get_db)):

    paciente = db.query(Pacientes).filter(Pacientes.id_paciente == visita.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    if not paciente.activo:
        raise HTTPException(status_code=400, detail="No se pueden crear visitas para pacientes inactivos")

    terapeuta = db.query(Terapistas).filter(Terapistas.user_id == visita.terapeuta_id).first()
    if not terapeuta:
        raise HTTPException(status_code=404, detail="Terapeuta no encontrado")

    assignment = db.query(PacienteTerapeuta).filter(
        PacienteTerapeuta.paciente_id == visita.paciente_id,
        PacienteTerapeuta.terapeuta_id == visita.terapeuta_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=400, 
            detail="El terapeuta no está asignado a este paciente"
        )

    cert_period = db.query(CertificationPeriods)\
        .filter(
            CertificationPeriods.id == visita.cert_period_id,
            CertificationPeriods.is_active == True
        ).first()
    if not cert_period:
        raise HTTPException(status_code=404, detail="Periodo de certificación no encontrado o inactivo")

    valid_types = ["EVAL", "STANDARD", "DC", "RA"]
    if visita.tipo_visita not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de visita inválido. Debe ser uno de: {', '.join(valid_types)}"
        )

    nueva_visita = Visitas(
        paciente_id=visita.paciente_id,
        terapeuta_id=visita.terapeuta_id,
        date=datetime.now(),
        tipo_visita=visita.tipo_visita,
        cert_period_id=visita.cert_period_id,
        status="Scheduled",
        notes=visita.notas if visita.notas else ""
    )

    db.add(nueva_visita)
    db.commit()
    db.refresh(nueva_visita)
    return nueva_visita

@router.post("/pacientes/{paciente_id}/cert-periods")
def crear_cert_period(
    paciente_id: int,
    cert_period: CertificationPeriodCreate,
    db: Session = Depends(get_db)
):

    paciente = db.query(Pacientes).filter(Pacientes.id_paciente == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    if cert_period.start_date > datetime.now().date():
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser futura")

    start_date = cert_period.start_date
    end_date = start_date + timedelta(days=60)
    
    overlapping = db.query(CertificationPeriods).filter(
        CertificationPeriods.paciente_id == paciente_id,
        CertificationPeriods.start_date <= end_date,
        CertificationPeriods.end_date >= start_date
    ).first()
    
    if overlapping:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un periodo de certificación que se sobrepone con estas fechas"
        )

    db.query(CertificationPeriods)\
        .filter(CertificationPeriods.paciente_id == paciente_id)\
        .update({"is_active": False})

    nuevo_cert = CertificationPeriods(
        paciente_id=paciente_id,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        created_at=datetime.utcnow()
    )

    db.add(nuevo_cert)
    db.commit()
    db.refresh(nuevo_cert)
    
    return {
        "id": nuevo_cert.id,
        "start_date": nuevo_cert.start_date.strftime("%Y-%m-%d"),
        "end_date": nuevo_cert.end_date.strftime("%Y-%m-%d"),
        "is_active": nuevo_cert.is_active,
        "paciente_id": nuevo_cert.paciente_id
    }

#ASIGNAR

@router.post("/pacientes/{paciente_id}/terapistas")
def asignar_terapista(
    paciente_id: int, 
    asignacion: TerapistaAsignacion, 
    db: Session = Depends(get_db)
):
    paciente = db.query(Pacientes).filter(Pacientes.id_paciente == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    terapeuta = db.query(Terapistas).filter(Terapistas.user_id == asignacion.therapist_id).first()
    if not terapeuta:
        raise HTTPException(status_code=404, detail="Terapeuta no encontrado")

    role_mappings = {
        "PT": ["PT", "PTA"],
        "OT": ["OT", "COTA"],
        "ST": ["ST"]
    }

    patient_disciplines = [d.strip() for d in paciente.discipline.split(",")]
    valid_roles = []
    for discipline in patient_disciplines:
        valid_roles.extend(role_mappings.get(discipline, []))

    if terapeuta.rol not in valid_roles:
        raise HTTPException(
            status_code=400, 
            detail=f"La disciplina del paciente ({paciente.discipline}) no coincide con la especialidad del terapeuta ({terapeuta.rol})"
        )

    existing = db.query(PacienteTerapeuta).filter(
        PacienteTerapeuta.paciente_id == paciente_id,
        PacienteTerapeuta.terapeuta_id == asignacion.therapist_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Terapeuta ya está asignado a este paciente")

    asignacion_db = PacienteTerapeuta(
        paciente_id=paciente_id,
        terapeuta_id=asignacion.therapist_id
    )
    db.add(asignacion_db)
    db.commit()
    
    return {
        "message": "Terapeuta asignado exitosamente",
        "paciente_id": paciente_id,
        "terapeuta_id": asignacion.therapist_id
    }