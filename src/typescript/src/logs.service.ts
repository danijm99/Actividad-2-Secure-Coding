// src/typescript/src/logs.service.ts
// PASO 18: Sensitive Data in Logs — filtrar campos sensibles antes de loguear

import { Injectable, Logger } from '@nestjs/common';

// VULNERABLE (punto de inicio del ejercicio):
// logRequest(body: unknown): void {
//   this.logger.log(JSON.stringify(body));
// }
//
// Si el body contiene { "username": "alice", "password": "s3cr3t" }
// la contrasena queda en texto plano en los logs.
// Un atacante con acceso a los logs (SIEM, Splunk, CloudWatch) obtiene credenciales reales.

const SENSITIVE_FIELDS = new Set([
  'password', 'passwd', 'secret', 'token', 'apikey', 'api_key',
  'authorization', 'creditcard', 'cardnumber', 'cvv', 'ssn',
  'pin', 'otp', 'privatekey', 'accesstoken', 'refreshtoken',
]);

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  private redact(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.redact(item));

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {

      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = this.redact(value);
      }
    }
    return result;
  }

  logRequest(body: unknown): void {
    this.logger.log(JSON.stringify(this.redact(body)));
  }
}
