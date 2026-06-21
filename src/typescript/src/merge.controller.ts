// src/typescript/src/merge.controller.ts
// PASO 16: Prototype Pollution — validar con DTO y Object.create(null) en lugar de Object.assign

import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, validateSync } from 'class-validator';

// VULNERABLE (punto de inicio del ejercicio):
// @Post('/preferences')
// updatePreferences(@Body() body: any) {
//   const prefs = {};
//   Object.assign(prefs, body);  // prototype pollution: body puede contener __proto__
//   return prefs;
// }
//
// Un atacante puede enviar: { "__proto__": { "isAdmin": true } }
// Esto modifica Object.prototype, contaminando todos los objetos de la aplicacion.
// Si algun codigo hace: if (user.isAdmin) → ahora todos los usuarios son admin.

class UserPreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}

@Controller('user')
export class MergeController {
  @Post('/preferences')
  updatePreferences(@Body() body: Record<string, unknown>): Record<string, unknown> {

    const dto = plainToInstance(UserPreferencesDto, body);
    const errors = validateSync(dto);
    if (errors.length > 0) {
      throw new Error('Invalid input');
    }
    const prefs = Object.create(null) as Record<string, unknown>;
    
    if (dto.theme !== undefined) prefs['theme'] = dto.theme;
    if (dto.language !== undefined) prefs['language'] = dto.language;
    if (dto.notifications !== undefined) prefs['notifications'] = dto.notifications;
    
    return prefs;
  }
}
