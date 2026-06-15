import { PartialType } from '@nestjs/mapped-types';

export class CreateWarehouseDto {
  tenant_id: number;
  name: string;
  address: string;
  status?: string;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
