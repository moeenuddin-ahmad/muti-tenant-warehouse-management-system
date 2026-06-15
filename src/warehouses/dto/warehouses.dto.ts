import { PartialType } from '@nestjs/mapped-types';
import { WarehouseStatus } from '../enums/warehouses.enums';

export class CreateWarehouseDto {
  tenant_id: number;
  name: string;
  address: string;
  status?: WarehouseStatus;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
