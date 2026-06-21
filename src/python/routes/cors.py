# src/python/routes/cors.py
# PASO 5: CORS misconfiguration — origen especifico desde variable de entorno,
#         sin wildcard cuando allow_credentials=True

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# VULNERABLE (punto de inicio del ejercicio):
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,  # combinacion prohibida: credentials + wildcard
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# allow_origins=["*"] con allow_credentials=True permite que cualquier sitio
# malicioso haga peticiones autenticadas en nombre del usuario.
# Los navegadores modernos bloquean esto, pero algunas configuraciones proxy no.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "https://app.empresa.com").split(",")
    if origin.strip()
]

def configure_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        # ✅ CORRECCIÓN 2: Asignar la lista estricta (no se permite el comodín "*")
        allow_origins=ALLOWED_ORIGINS,             
        allow_credentials=True,
        # ✅ CORRECCIÓN 3: Explicitar métodos y cabeceras para reducir la superficie de ataque
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )
