# src/python/routes/serialize.py
# PASO 4: Insecure Deserialization — usar JSON con schema validado en lugar de pickle

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ValidationError, field_validator

router = APIRouter()


# VULNERABLE (punto de inicio del ejercicio):
# import pickle, base64
#
# @router.post("/load-prefs")
# async def load_prefs(data: str):
#     prefs = pickle.loads(base64.b64decode(data))
#     return prefs
#
# Un atacante puede enviar un payload pickle serializado que ejecute codigo arbitrario
# al deserializarse. Ejemplo: pickle.dumps(os.system("id")) encode en base64.


#CORRECCIÓN 1: Definir un esquema estricto de datos puros con Pydantic
class UserPreferences(BaseModel):
    theme: str
    language: str
    notifications: bool
    @field_validator('theme')
    @classmethod
    def validate_theme(cls, v: str) -> str:
        if not v:
            raise ValueError('El tema no puede estar vacío')
        return v

@router.post("/load-prefs")
async def load_prefs(data: str):
    try:
        #CORRECCIÓN 2: Usar JSON, que es un formato de datos plano sin lógica de reconstrucción de objetos
        raw = json.loads(data)
        
        #CORRECCIÓN 3: Validar que la estructura del JSON cumple estrictamente con el modelo
        validated = UserPreferences(**raw)
        
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=400, detail="Datos invalidos")
        
    #CORRECCIÓN 4: Retornar solo los campos validados del modelo de forma segura
    return validated.model_dump()
