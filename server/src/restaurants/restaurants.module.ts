import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantClickLog } from './entities/restaurant-click-log.entity';
import { RestaurantsService } from './services/restaurants.service';
import { RestaurantsController } from './controllers/restaurants.controller';
import { RecommendationService } from './services/recommendation.service';
import { RestaurantClickLogService } from './services/restaurant-click-log.service';
import { KakaoModule } from '../common/kakao/kakao.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, RestaurantClickLog]),
    KakaoModule,
  ],
  providers: [
    RestaurantsService,
    RecommendationService,
    RestaurantClickLogService,
  ],
  controllers: [RestaurantsController],
  exports: [
    RestaurantsService,
    RecommendationService,
    RestaurantClickLogService,
  ],
})
export class RestaurantsModule {}
