// src/java/src/main/java/com/example/api/controller/RedirectController.java
// PASO 7: Open Redirect — allowlist de destinos de redireccion

package com.example.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.net.URI;

@RestController
@RequestMapping("/auth")
public class RedirectController {

    // VULNERABLE (punto de inicio del ejercicio):
    // @GetMapping("/login")
    // public String login(@RequestParam(defaultValue = "/dashboard") String next) {
    //     return "redirect:" + next;
    // }
    //
    // Un atacante puede enviar: next=https://evil.com/phishing
    // El servidor redirige al usuario a un sitio malicioso tras el login.
    // Util para ataques de phishing y robo de credenciales.
private static final List<String> ALLOWED_REDIRECTS = List.of(
        "/dashboard",
        "/profile",
        "/settings",
        "/orders"
    );

    @GetMapping("/login")
    public ResponseEntity<?> login(@RequestParam(defaultValue = "/dashboard") String next) {
        if (!ALLOWED_REDIRECTS.contains(next)) {
            return ResponseEntity.badRequest().body("Destino no permitido");
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(next));
        return new ResponseEntity<>(headers, HttpStatus.SEE_OTHER);
    }
}
