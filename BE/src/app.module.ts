import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { MasterModule } from './modules/master/master.module';
import { DrawingModule } from './modules/drawing/drawing.module';
import { TransmitModule } from './modules/transmit/transmit.module';
import { ProductionModule } from './modules/production/production.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    MasterModule,
    DrawingModule,
    TransmitModule,
    ProductionModule,
    SeedModule,
  ],
})
export class AppModule {}
