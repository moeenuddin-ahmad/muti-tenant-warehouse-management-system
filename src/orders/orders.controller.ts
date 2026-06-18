import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.tenant_id, createOrderDto);
  }

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Req() req: RequestWithUser, @Query() query: any) {
    return this.ordersService.findAll(req.user.tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(req.user.tenant_id, +id, updateOrderDto);
  }

  @Patch(':id/status')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      req.user.tenant_id,
      +id,
      updateOrderStatusDto,
    );
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.remove(req.user.tenant_id, +id);
  }
}
