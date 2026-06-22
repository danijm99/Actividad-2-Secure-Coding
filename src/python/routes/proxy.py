# src/python/routes/proxy.py
# PASO 23: SSRF — validar host contra allowlist antes de hacer requests externos

import requests
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException

router = APIRouter()

# VULNERABLE (punto de inicio del ejercicio):
# @router.get("/fetch")
# async def fetch_url(url: str):
#     response = requests.get(url, timeout=5)
#     return {"status": response.status_code, "content": response.text[:500]}
#
# Vectores de ataque:
# 1. Cloud metadata: ?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
#    Devuelve credenciales IAM de AWS en instancias EC2.
# 2. Servicios internos: ?url=http://10.0.0.1:8080/admin
#    Acceso a servicios internos no expuestos publicamente.
# 3. Escaneo de puertos: ?url=http://192.168.1.1:22
#    El tiempo de respuesta revela si el puerto esta abierto.
# 4. Protocolo file: ?url=file:///etc/passwd (si la libreria lo soporta)

def _validate_ssrf(url: str) -> None:
    """Valida que la URL sea segura antes de hacer la peticion."""
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="URL malformada")

    if parsed.scheme not in ("https",):
        raise HTTPException(status_code=400, detail="Solo se permite HTTPS")

    if parsed.hostname not in ALLOWED_HOSTS:
        raise HTTPException(status_code=400, detail="Host no permitido")

@router.get("/fetch")
async def fetch_url(url: str):
    _validate_ssrf(url)
    
    response = requests.get(url, timeout=5, allow_redirects=False)
    return {"status": response.status_code, "content": response.text[:500]}
