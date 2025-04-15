from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from database.connection import get_db
from database.models import Agencias, Pacientes, Terapistas, Visitas, CertificationPeriods
from schemas import Paciente, Agencia, Terapeuta, Visita, CertificationPeriodResponse

router = APIRouter()

@router.get("/pacientes/buscar/{query}", response_model=list[Paciente])
def buscar_paciente(query: str, db: Session = Depends(get_db)):
    try:
        if query.isdigit():
            paciente = db.query(Pacientes).filter(Pacientes.id_paciente == int(query)).first()
            return [Paciente.from_orm(paciente)] if paciente else []
    except ValueError:
        pass
    
    pacientes = db.query(Pacientes)\
        .filter(Pacientes.patient_name.ilike(f"%{query}%"))\
        .order_by(Pacientes.patient_name)\
        .all()
    
    if not pacientes:
        raise HTTPException(status_code=404, detail="No se encontraron pacientes")
    return [Paciente.from_orm(paciente) for paciente in pacientes]

@router.get("/agencias/buscar/{nombre}", response_model=list[Agencia])
def buscar_agencia(nombre: str, db: Session = Depends(get_db)):
    agencias = db.query(Agencias).filter(Agencias.agency_name.ilike(f"%{nombre}%")).all()
    if not agencias:
        raise HTTPException(status_code=404, detail="No se encontraron agencias")
    return [Agencia.from_orm(agencia) for agencia in agencias]

@router.get("/terapistas/buscar/{nombre}", response_model=list[Terapeuta])
def buscar_terapeuta(nombre: str, db: Session = Depends(get_db)):
    terapistas = db.query(Terapistas).filter(Terapistas.therapist_name.ilike(f"%{nombre}%")).all()
    if not terapistas:
        raise HTTPException(status_code=404, detail="No se encontraron terapistas")
    return [Terapeuta.from_orm(terapeuta) for terapeuta in terapistas]

@router.get("/pacientes/", response_model=dict)
def obtener_lista_pacientes(skip: int = 0, limit: int = 100, activos: Optional[bool] = None, db: Session = Depends(get_db)):

    if skip < 0:
        raise HTTPException(status_code=400, detail="Limit debe ser mayor a 0")
    if limit < 1:
        raise HTTPException(status_code=400, detail="Limit debe ser mayor a 0")
    if limit > 100:
        limit = 100

    query = db.query(Pacientes)
    if activos is not None:
        query = query.filter(Pacientes.activo == activos)
    total = query.count()
    pacientes = query.offset(skip).limit(limit).all()
    return {
        "total": total,
        "pacientes": [Paciente.from_orm(paciente) for paciente in pacientes]
    }

@router.get("/agencias/{agency_id}/pacientes", response_model=list[Paciente])
def obtener_pacientes_agencia(agency_id: int, activos: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(Pacientes).filter(Pacientes.agency == agency_id)
    if activos is not None:
        query = query.filter(Pacientes.activo == activos)
    return [Paciente.from_orm(paciente) for paciente in query.all()]

@router.get("/pacientes/perfil/{nombre}", response_model=dict)
def obtener_perfil_paciente(nombre: str, db: Session = Depends(get_db)):
    try:
        paciente = db.query(Pacientes)\
            .filter(Pacientes.patient_name == nombre)\
            .first() or db.query(Pacientes)\
            .filter(Pacientes.patient_name.ilike(f"%{nombre}%"))\
            .first()
    
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        current_date = datetime.utcnow()
    
        cert_period = db.query(CertificationPeriods)\
            .filter(
                CertificationPeriods.paciente_id == paciente.id_paciente,
                CertificationPeriods.start_date <= current_date,
                CertificationPeriods.end_date >= current_date
            ).first()

        if not cert_period:
            cert_period = db.query(CertificationPeriods)\
                .filter(CertificationPeriods.paciente_id == paciente.id_paciente)\
                .order_by(CertificationPeriods.start_date.desc())\
                .first()

        if cert_period:
            try:
                db.query(CertificationPeriods)\
                    .filter(CertificationPeriods.paciente_id == paciente.id_paciente)\
                    .update({"is_active": False})
                cert_period.is_active = True
                db.commit()
            except:
                db.rollback()
                raise

        cert_periods = [CertificationPeriodResponse.from_orm(cp) for cp in sorted(paciente.certification_periods, key=lambda x: x.start_date, reverse=True)]
    
        visitas_por_periodo = {}
        for period in cert_periods:
            try:
                visitas = db.query(Visitas).filter(
                        Visitas.paciente_id == paciente.id_paciente,
                        Visitas.cert_period_id == period.id
                    )\
                    .order_by(Visitas.date.desc())\
                    .all()
            
                if visitas:
                    visitas_por_periodo[period.id] = [Visita.from_orm(v) for v in visitas]
                else:
                    visitas_por_periodo[period.id] = []
                
            except Exception as e:      
                db.rollback()    
                visitas_por_periodo[period.id] = []

        return {
            "paciente": Paciente.from_orm(paciente),
            "agencia": Agencia.from_orm(paciente.agencia) if paciente.agencia else None,
            "terapeutas": [Terapeuta.from_orm(pt.terapeuta) for pt in paciente.terapistas],
            "cert_period_actual": next((cp for cp in cert_periods if cp.is_active), None),
            "cert_periods": cert_periods,
            "visitas_por_periodo": visitas_por_periodo
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/visitas/{visita_id}", response_model=dict)
def obtener_visita_detalle(visita_id: int, db: Session = Depends(get_db)):
    try:
        visita = db.query(Visitas)\
            .filter(Visitas.id == visita_id)\
            .first()
        
        if not visita:
            raise HTTPException(status_code=404, detail="Visita no encontrada")

        if not visita.paciente or not visita.terapeuta or not visita.cert_period:
            raise HTTPException(
                status_code=400, 
                detail="Visita con información incompleta"
            )

        return {
            "visita": Visita.from_orm(visita),
            "paciente": Paciente.from_orm(visita.paciente),
            "terapeuta": Terapeuta.from_orm(visita.terapeuta),
            "cert_period": CertificationPeriodResponse.from_orm(visita.cert_period)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error al obtener detalles de la visita"
        )