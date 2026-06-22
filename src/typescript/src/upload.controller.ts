// src/typescript/src/upload.controller.ts
// PASO 20: Insecure File Upload — validar MIME type, extension y usar nombre generado

import {
  Controller, Post, UploadedFile, UseInterceptors, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import * as path from 'path';

// VULNERABLE (punto de inicio del ejercicio):
// @Post('/upload')
// @UseInterceptors(FileInterceptor('file'))
// upload(@UploadedFile() file: Express.Multer.File) {
//   return { filename: file.originalname };
// }
//
// Sin validacion, un atacante puede subir:
// - Un archivo .php/.jsp que el servidor ejecuta si sirve archivos estaticos
// - Un archivo con nombre ../../../../etc/cron.d/backdoor (path traversal)
// - Archivos de tamano arbitrario (DoS por disco lleno)

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Controller('files')
export class UploadController {
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE },
  }))
  upload(@UploadedFile() file: Express.Multer.File): { filename: string } {
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(`Extension no permitida: ${ext}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Archivo demasiado grande');
    }

    const safeFilename = `${randomUUID()}${ext}`;

    return { filename: safeFilename };
  }
}
