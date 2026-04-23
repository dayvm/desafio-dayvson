import { ActionType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
}

export class AuditReportQueryDto {
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

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsOptional()
  search?: string;

  @Transform(({ value }) => {
    const normalizedValue = normalizeOptionalString(value);
    return typeof normalizedValue === 'string'
      ? normalizedValue.toUpperCase()
      : normalizedValue;
  })
  @IsEnum(ActionType)
  @IsOptional()
  action?: ActionType;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsOptional()
  entityType?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID('4')
  @IsOptional()
  actorId?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsOptional()
  startDate?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsOptional()
  endDate?: string;
}
