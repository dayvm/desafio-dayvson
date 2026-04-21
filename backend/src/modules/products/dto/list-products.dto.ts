import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListProductsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
  })
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID('4', { message: 'O categoryId deve ser um UUID válido.' })
  @IsOptional()
  categoryId?: string;
}
