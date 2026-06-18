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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles([Role.Admin, Role.Manager])
  create(
    @Req() req: RequestWithUser,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(req.user.tenant_id, createCustomerDto);
  }

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Req() req: RequestWithUser, @Query() query: any) {
    return this.customersService.findAll(req.user.tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.customersService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
      req.user.tenant_id,
      +id,
      updateCustomerDto,
    );
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.customersService.remove(req.user.tenant_id, +id);
  }
}
