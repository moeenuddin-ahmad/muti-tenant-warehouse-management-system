import { PartialType } from '@nestjs/mapped-types';

export class CreateInventoryDto {
  tenant_id: number;
  warehouse_id: number;
  product_id: number;
  qty: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
