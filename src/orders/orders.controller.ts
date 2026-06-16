import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Query('tenant_id') tenant_id: string, @Query() query: any) {
    return this.ordersService.findAll(+tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
