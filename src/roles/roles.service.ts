import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/roles.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createRoleDto: CreateRoleDto) {
    await this.db.query('INSERT INTO roles (title) VALUES ($1)', [
      createRoleDto.title,
    ]);
    return {
      message: 'Role created successfully',
    };
  }

  async findAll() {
    const result = await this.db.query('SELECT * FROM roles ORDER BY id ASC');
    return result.rows;
  }
}
