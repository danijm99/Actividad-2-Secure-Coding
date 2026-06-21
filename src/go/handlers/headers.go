// src/go/handlers/headers.go
// PASO 11: HTTP Header Injection — sanitizar valores de cabecera antes de escribirlos

package handlers

import (
	"net/http"
	"strings"
)

// VULNERABLE (punto de inicio del ejercicio):
// func RedirectHandler(w http.ResponseWriter, r *http.Request) {
//     next := r.URL.Query().Get("next")
//     w.Header().Set("Location", next)
//     w.WriteHeader(http.StatusFound)
// }
//
// Un atacante puede enviar: next=/home%0d%0aSet-Cookie: session=attacker
// Esto inyecta una cabecera Set-Cookie fraudulenta en la respuesta.

var allowedRedirects = map[string]bool{
	"/home":      true,
	"/dashboard": true,
	"/profile":   true,
}

func sanitizeHeaderValue(value string) string {

	if strings.ContainsAny(value, "\r\n") {
		value = strings.ReplaceAll(value, "\r", "")
		value = strings.ReplaceAll(value, "\n", "")
	}
	return value
}

func RedirectHandler(w http.ResponseWriter, r *http.Request) {
	next := r.URL.Query().Get("next")
	
	safe := sanitizeHeaderValue(next)

	if !allowedRedirects[safe] {
		safe = "/home"
	}

	w.Header().Set("Location", safe)
	w.WriteHeader(http.StatusFound)
}
