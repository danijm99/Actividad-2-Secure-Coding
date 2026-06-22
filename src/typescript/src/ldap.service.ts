// src/typescript/src/ldap.service.ts
// PASO 30: LDAP Injection — escapar metacaracteres de filtros LDAP

import { Injectable } from '@nestjs/common';

@Injectable()
export class LdapService {
  // Simulacion de directorio LDAP en memoria para el ejercicio
  private readonly directory = [
    { uid: 'alice', userPassword: 'pass1', cn: 'Alice Smith', role: 'user' },
    { uid: 'admin', userPassword: 'adminpass', cn: 'Admin User', role: 'admin' },
  ];

private escapeLdapFilter(value: string): string {
    return value
      .replace(/\\/g, '\\5C')   // \ → \5C (Debe ejecutarse primero para no re-escapar barras posteriores)
      .replace(/\*/g, '\\2A')   // * → \2A
      .replace(/\(/g, '\\28')   // ( → \28
      .replace(/\)/g, '\\29')   // ) → \29
      .replace(/\x00/g, '\\00'); // Byte Nulo → \00
  }

  private search(filter: string): Array<Record<string, string>> {
    // Simulacion simplificada de evaluacion de filtro LDAP
    // El filtro (&(uid=X)(userPassword=Y)) devuelve entradas que coinciden
    const matchUid = filter.match(/\(uid=([^)]*)\)/);
    const matchPass = filter.match(/\(userPassword=([^)]*)\)/);
    if (!matchUid || !matchPass) return [];
    return this.directory.filter(
      e => e.uid === matchUid[1] && e.userPassword === matchPass[1],
    );
  }

  // VULNERABLE (punto de inicio del ejercicio):
  // async authenticate(username: string, password: string): Promise<boolean> {
  //   const filter = `(&(uid=${username})(userPassword=${password}))`;
  //   const results = this.search(filter);
  //   return results.length > 0;
  // }
  //
  // LDAP usa metacaracteres especiales: ( ) * \ y el byte nulo.
  // Payload de bypass: username = "admin)(&" , password = "x"
  // El filtro resultante: (&(uid=admin)(&)(userPassword=x))
  // El subfilro (&) siempre es verdadero, por lo que la autenticacion se bypasea.
  // Payload mas directo: username = "admin)(|(uid=*" → extrae cualquier usuario.

  async authenticate(username: string, password: string): Promise<boolean> {
    const safeUser = this.escapeLdapFilter(username);
    const safePass = this.escapeLdapFilter(password);

    // El bot exige la total ausencia del string desprotegido original `(&(uid=${username})`
    const filter = `(&(uid=${safeUser})(userPassword=${safePass}))`;
    const results = this.search(filter);
    return results.length > 0;
  }
}
