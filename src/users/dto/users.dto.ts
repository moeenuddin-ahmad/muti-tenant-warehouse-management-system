import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserStatus } from '../enums/users.enums';

export class CreateUserDto {
  @IsInt()
  @IsNotEmpty()
  tenantId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'Phone must be exactly 11 characters' })
  phone: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status: UserStatus = UserStatus.active;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
