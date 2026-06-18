import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { WarehouseStatus } from '../enums/warehouses.enums';
import { IsNumber } from 'class-validator';

export class CreateWarehouseDto {
  @IsNumber()
  @IsNotEmpty()
  tenant_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
