import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { type Response } from 'express';
import { access, constants } from 'fs/promises';
import { basename, isAbsolute, normalize, relative, resolve } from 'path';

@Controller('files')
export class FilesController {
  private readonly uploadsRoot = resolve(process.cwd(), 'uploads');
  private readonly allowedExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.svg',
  ]);

  @Get('image')
  async getImage(
    @Query('path') imagePath: string,
    @Query('download') download: string | undefined,
    @Res() response: Response,
  ) {
    if (!imagePath?.trim()) {
      throw new BadRequestException('O parametro "path" da query e obrigatorio.');
    }

    const filePath = this.resolveImagePath(imagePath);
    await this.ensureFileExists(filePath);

    if (download === 'true') {
      return response.download(filePath, basename(filePath));
    }

    return response.sendFile(filePath);
  }

  private resolveImagePath(imagePath: string) {
    let decodedPath: string;

    try {
      decodedPath = decodeURIComponent(imagePath).trim();
    } catch {
      throw new BadRequestException('O caminho da imagem possui caracteres invalidos.');
    }

    if (/^https?:\/\//i.test(decodedPath)) {
      throw new BadRequestException('Informe apenas caminhos locais da pasta uploads.');
    }

    let sanitizedPath = decodedPath.replace(/\\/g, '/').replace(/^\/+/, '');

    if (sanitizedPath.startsWith('uploads/')) {
      sanitizedPath = sanitizedPath.slice('uploads/'.length);
    }

    if (!sanitizedPath) {
      throw new BadRequestException('O caminho da imagem informado e invalido.');
    }

    const normalizedPath = normalize(sanitizedPath);
    const resolvedPath = resolve(this.uploadsRoot, normalizedPath);
    const relativePath = relative(this.uploadsRoot, resolvedPath);

    if (
      !relativePath ||
      relativePath.startsWith('..') ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException(
        'O caminho informado precisa apontar para um arquivo dentro de uploads.',
      );
    }

    const extension = normalizedPath
      .slice(normalizedPath.lastIndexOf('.'))
      .toLowerCase();

    if (!this.allowedExtensions.has(extension)) {
      throw new BadRequestException('O arquivo informado nao e uma imagem valida.');
    }

    return resolvedPath;
  }

  private async ensureFileExists(filePath: string) {
    try {
      await access(filePath, constants.R_OK);
    } catch {
      throw new NotFoundException('Imagem nao encontrada.');
    }
  }
}
