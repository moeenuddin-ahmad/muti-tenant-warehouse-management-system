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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/suppliers.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles([Role.Admin, Role.Manager])
  create(
    @Req() req: RequestWithUser,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(req.user.tenant_id, createSupplierDto);
  }

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Req() req: RequestWithUser, @Query() query: any) {
    return this.suppliersService.findAll(req.user.tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.suppliersService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(
      req.user.tenant_id,
      +id,
      updateSupplierDto,
    );
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.suppliersService.remove(req.user.tenant_id, +id);
  }
}
