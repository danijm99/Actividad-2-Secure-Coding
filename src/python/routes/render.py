# src/python/routes/render.py
# PASO 3: Server-Side Template Injection (SSTI) — template fijo con autoescaping habilitado

from fastapi import APIRouter
from jinja2 import Environment, select_autoescape

router = APIRouter()

# VULNERABLE (punto de inicio del ejercicio):
# from jinja2 import Template
#
# @router.get("/greet")
# async def greet(name: str):
#     template = Template(f"Hola {name}!")
#     return {"message": template.render()}
#
# Un atacante puede enviar: name={{ 7*7 }} y obtenera "Hola 49!"
# Con: name={{ config.__class__.__init__.__globals__['os'].popen('id').read() }}
# el atacante ejecuta comandos arbitrarios en el servidor.

#CORRECCIÓN 1: El template es una constante estática definida por el desarrollador
GREETING_TEMPLATE = "Hola {{ name }}!"

#CORRECCIÓN 2: Configurar un entorno seguro con autoescape activado para evitar XSS
env = Environment(autoescape=select_autoescape(["html", "xml"]))

@router.get("/greet")
async def greet(name: str):

#CORRECCIÓN 3: Cargar la plantilla estática desde el entorno
    template = env.from_string(GREETING_TEMPLATE)
    
#CORRECCIÓN 4: Pasar el input del usuario como variable de contexto (datos separados de la sintaxis)
    return {"message": template.render(name=name)}
