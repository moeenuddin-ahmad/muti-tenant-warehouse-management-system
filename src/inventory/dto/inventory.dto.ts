import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInventoryDto {
  @IsNumber()
  @IsNotEmpty()
  tenant_id: number;

  @IsNumber()
  @IsNotEmpty()
  warehouse_id: number;

  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  qty: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
