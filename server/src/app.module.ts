import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReservationsModule } from './reservations/reservations.module';
import { WeatherModule } from './weather/weather.module';
import { KakaoModule } from './common/kakao/kakao.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'myuser'),
        password: configService.get<string>('DB_PASSWORD', 'mypassword123'),
        database: configService.get<string>('DB_DATABASE', 'mydatabase'),
        autoLoadEntities: true,
        synchronize: true, // ponytail: [disable in production, keep for development ease]
        poolSize: 20,
        extra: {
          options: '-c timezone=Asia/Seoul',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RestaurantsModule,
    ReservationsModule,
    WeatherModule,
    KakaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
