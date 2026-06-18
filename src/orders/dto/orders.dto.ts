import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums/orders.enums';

class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  total_price: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  tenant_id: number;

  @IsInt()
  @IsNotEmpty()
  customer_id: number;

  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
