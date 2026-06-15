import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  tenant_id: number;
  sku: string;
  name: string;
  description?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
