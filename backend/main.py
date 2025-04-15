from fastapi import FastAPI
import sys
from sqlalchemy import inspect, text

sys.path.append("/app")

from database.connection import engine, Base
from database.models import Agencias, Pacientes, Terapistas, PacienteTerapeuta, CertificationPeriods, Visitas
from routes import create_router, search_router, update_router  # Import routers

app = FastAPI()

@app.on_event("startup")
async def startup():
    try:
        with engine.connect() as conn:
            conn.execute(text("SET search_path TO public;"))
        
        with engine.connect() as conn:
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            print(f"Existing tables: {existing_tables}") 
            
            expected_tables = {'agencias', 'pacientes', 'terapistas', 'paciente_terapeuta', 
                               'certification_periods', 'visitas'} 
            
            tables_to_create = expected_tables - set(existing_tables)
            if tables_to_create:
                print(f"Creating tables: {tables_to_create}")
                Base.metadata.create_all(bind=engine)
            else:
                print("All tables already exist.") 
                
    except Exception as e:
        print(f"Error during startup: {e}")

app.include_router(create_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(update_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)