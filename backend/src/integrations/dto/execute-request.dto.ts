import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ExecuteRequestDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsOptional()
  @IsString()
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  queryParams?: Record<string, string>;

  @IsOptional()
  body?: any;

  @IsOptional()
  @IsObject()
  mapping?: Record<string, string>;
}
