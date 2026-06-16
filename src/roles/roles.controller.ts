import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/roles.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, RolesGuard)
@Roles([Role.Admin])
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.rolesService.findAll(query);
  }
}
