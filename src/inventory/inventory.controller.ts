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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles([Role.Admin, Role.Manager])
  create(
    @Req() req: RequestWithUser,
    @Body() createInventoryDto: CreateInventoryDto,
  ) {
    return this.inventoryService.create(req.user.tenant_id, createInventoryDto);
  }

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Req() req: RequestWithUser, @Query() query: any) {
    return this.inventoryService.findAll(req.user.tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.inventoryService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(
      req.user.tenant_id,
      +id,
      updateInventoryDto,
    );
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.inventoryService.remove(req.user.tenant_id, +id);
  }
}
