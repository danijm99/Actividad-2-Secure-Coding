# src/python/routes/files.py
# PASO 2: Path Traversal — normalizar ruta real y verificar que esta dentro del directorio permitido

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

# VULNERABLE (punto de inicio del ejercicio):
# @router.get("/download")
# async def download_file(filename: str):
#     path = f"/var/www/public/{filename}"
#     return FileResponse(path)
#
# Un atacante puede enviar: filename=../../etc/passwd
# El servidor devuelve el archivo de credenciales del sistema.

# CORRECCIÓN 1: Definir y resolver la ruta absoluta del directorio autorizado
ALLOWED_DIR = os.path.realpath("/var/www/public")
@router.get("/download")
async def download_file(filename: str):
    #CORRECCIÓN 2: Unir las rutas y obtener el path real canónico (resuelve los '../')
    real_path = os.path.realpath(os.path.join(ALLOWED_DIR, filename))
    
    #CORRECCIÓN 3: Verificar estrictamente que el path empiece por el directorio permitido + separador
    if not real_path.startswith(ALLOWED_DIR + os.sep):
        raise HTTPException(status_code=400, detail="Acceso denegado")
        
    #CORRECCIÓN 4: Validar que el archivo de verdad exista antes de servirlo
    if not os.path.isfile(real_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
    return FileResponse(real_path)
