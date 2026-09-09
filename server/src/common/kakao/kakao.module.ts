import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { KakaoService } from './services/kakao.service';
import { KakaoHttpClient } from './utils/kakao-http.client';
import { KakaoRestaurantParser } from './parsers/kakao-restaurant.parser';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [KakaoService, KakaoHttpClient, KakaoRestaurantParser],
  exports: [KakaoService],
})
export class KakaoModule {}
