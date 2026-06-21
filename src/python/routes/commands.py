# src/python/routes/commands.py
# PASO 1: Command Injection — subprocess sin shell=True y validacion de hostname
import re
import subprocess

from fastapi import APIRouter, HTTPException

router = APIRouter()

# VULNERABLE (punto de inicio del ejercicio):
# @router.get("/ping")
# async def ping_host(host: str):
#     result = subprocess.run(
#         f"ping -c 1 {host}", shell=True, capture_output=True, text=True
#     )
#     return {"output": result.stdout}
#
# Un atacante puede enviar: host=8.8.8.8; cat /etc/passwd
# El shell interpreta el punto y coma como separador de comandos.

# CORRECCIÓN 1: Allowlist estricta: solo hostnames/IPs con caracteres legítimos
VALID_HOSTNAME = re.compile(r'^[a-zA-Z0-9.\-]{1,253}$')

@router.get("/ping")
async def ping_host(host: str):
    # CORRECCIÓN 2: Validación previa mediante la expresión regular
    if not VALID_HOSTNAME.match(host):
        raise HTTPException(status_code=400, detail="Hostname inválido")
    
    # CORRECCIÓN 3: Lista de argumentos directos (ejecución segura sin intérprete de shell)
    # CORRECCIÓN 4: Se elimina por completo la flag 'shell=True' y se añade un 'timeout'
    result = subprocess.run(
        ["ping", "-c", "1", host],
        capture_output=True,
        text=True,
        timeout=5
    )
    return {"output": result.stdout}
