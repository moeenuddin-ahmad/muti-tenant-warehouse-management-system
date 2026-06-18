import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsNumber()
  @IsNotEmpty()
  tenant_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
