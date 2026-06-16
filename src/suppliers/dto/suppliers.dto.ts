import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsNumber()
  @IsNotEmpty()
  tenant_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  phone: number;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
