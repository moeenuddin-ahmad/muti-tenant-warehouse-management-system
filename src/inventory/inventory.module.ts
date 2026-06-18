import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [ProductsModule, WarehousesModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
