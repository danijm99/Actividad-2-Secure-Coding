// src/java/src/main/java/com/example/api/controller/TokenController.java
// PASO 8: Insecure Randomness — SecureRandom en lugar de Random para tokens de seguridad

package com.example.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/token")
public class TokenController {

    // VULNERABLE (punto de inicio del ejercicio):
    // private final Random random = new Random();
    //
    // @PostMapping("/reset-password")
    // public ResponseEntity<?> requestReset(@RequestParam String email) {
    //     String token = String.valueOf(random.nextInt(999999));
    //     saveResetToken(email, token);
    //     return ResponseEntity.ok(Map.of("message", "Reset email sent"));
    // }
    //
    // java.util.Random usa un generador lineal congruencial predecible.
    // Con unos pocos tokens observados, un atacante puede predecir los siguientes
    // y tomar control de cualquier cuenta que solicite reset.

    private final SecureRandom secureRandom = new SecureRandom();

    @PostMapping("/reset-password")
    public ResponseEntity<?> requestReset(@RequestParam String email) {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);

        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        
        saveResetToken(email, token);
        
        return ResponseEntity.ok(Map.of("message", "Reset email sent"));
    }
    private void saveResetToken(String email, String token) {
    }
}
