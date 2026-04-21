import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return value;
  })
  @IsNumberString({}, { message: 'O preço deve ser um número válido.' })
  @IsOptional()
  price?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return [];
      }

      if (trimmedValue.startsWith('[')) {
        try {
          const parsedValue = JSON.parse(trimmedValue);
          return Array.isArray(parsedValue) ? parsedValue : [];
        } catch {
          return [];
        }
      }

      return trimmedValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  })
  @IsArray({ message: 'As categorias devem ser enviadas em formato de lista.' })
  @IsUUID('4', { each: true, message: 'Cada categoria deve ser um UUID válido.' })
  @IsOptional()
  categoryIds?: string[];

  @IsOptional()
  file?: Express.Multer.File;
}
