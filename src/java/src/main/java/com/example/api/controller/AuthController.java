// src/java/src/main/java/com/example/api/controller/AuthController.java
// PASO 9: Log Injection — sanitizar input antes de escribirlo en logs

package com.example.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // VULNERABLE (punto de inicio del ejercicio):
    // @PostMapping("/login")
    // public ResponseEntity<?> login(@RequestParam String username,
    //                                @RequestParam String password) {
    //     log.info("Login attempt for user: " + username);
    //     ...
    // }
    //
    // Un atacante puede enviar: username=admin\nINFO: Login successful for user: admin
    // Esto inyecta una linea falsa en los logs que puede confundir a analistas
    // o sistemas SIEM, ocultando actividad maliciosa real.

private static String sanitizeForLog(String input) {
        if (input == null) return "null";
        
        // Reemplazar saltos de línea (\r, \n) y tabuladores (\t) por un guion bajo
        String sanitized = input.replaceAll("[\\r\\n\\t]", "_");
        
        // ✅ CORRECCIÓN 2: Limitar la longitud del texto para evitar saturación de almacenamiento (DoS)
        if (sanitized.length() > 100) {
            sanitized = sanitized.substring(0, 100) + "[truncado]";
        }
        return sanitized;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        log.info("Login attempt for user: {}", sanitizeForLog(username));
        
        return ResponseEntity.ok(Map.of("message", "OK"));
    }
}
