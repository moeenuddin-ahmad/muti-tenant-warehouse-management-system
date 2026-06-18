import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';

@Module({
  imports: [],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
