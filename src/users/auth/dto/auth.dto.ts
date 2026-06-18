import { CreateUserDto } from 'src/users/dto/users.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationDto extends CreateUserDto {}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
