// src/typescript/src/search.controller.ts
// PASO 17: Regex Injection — escapar metacaracteres del input antes de construir RegExp

import { Controller, Get, Query, BadRequestException } from '@nestjs/common';

// VULNERABLE (punto de inicio del ejercicio):
// @Get('/search')
// search(@Query('q') q: string) {
//   const pattern = new RegExp(q, 'i');
//   return products.filter(p => pattern.test(p));
// }
//
// Un atacante puede enviar: q=((a+)+)z
// Esto crea un regex con backtracking catastrofico que bloquea el event loop de Node.js.
// Tambien puede enviar: q=[invalido para causar un error que expone internals.

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

@Controller('products')
export class SearchController {
  private readonly products = ['laptop', 'phone', 'tablet', 'monitor', 'keyboard'];

  @Get('/search')
  search(@Query('q') q: string): string[] {

    if (!q || q.length === 0) {
      return [];
    }
    if (q.length > 100) {
      throw new BadRequestException('Query demasiado larga');
    }

    const safePattern = escapeRegExp(q);
    const pattern = new RegExp(safePattern, 'i');
    
    return this.products.filter(p => pattern.test(p));
  }
}
