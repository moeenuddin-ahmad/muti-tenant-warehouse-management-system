import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService
  extends Pool
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      connectionString: configService.get<string>('DATABASE_URL'),
    });
  }

  async onModuleInit() {
    
    console.log('Database pool connected.');
  }

  async onModuleDestroy() {
    await this.end();
    console.log('Database pool disconnected.');
  }
}
