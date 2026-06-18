import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import type { RequestWithUser } from 'src/common/interfaces/request.interface';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findAll(@Req() req: RequestWithUser, @Query() query: any) {
    return this.usersService.findAll(req.user.tenant_id, query);
  }

  @Get(':id')
  @Roles([Role.Admin, Role.Manager, Role.Staff])
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.usersService.findOne(req.user.tenant_id, +id);
  }

  @Patch(':id')
  @Roles([Role.Admin, Role.Manager])
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.tenant_id, +id, updateUserDto);
  }

  @Patch(':id/role')
  @Roles([Role.Admin])
  updateRole(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(req.user.tenant_id, +id, role);
  }

  @Delete(':id')
  @Roles([Role.Admin])
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.usersService.remove(req.user.tenant_id, +id);
  }
}
