import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { KakaoService } from '../../common/kakao/services/kakao.service';
import { RecommendationService } from './recommendation.service';
import { RestaurantClickLogService } from './restaurant-click-log.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly kakaoService: KakaoService,
    private readonly recommendationService: RecommendationService,
    private readonly clickLogService: RestaurantClickLogService,
  ) {}

  async findById(id: number): Promise<Restaurant | null> {
    return this.restaurantRepository.findOneBy({ id });
  }

  async getRecommendations(
    lat: number,
    lon: number,
    radius: number,
    sky?: string,
    pty?: string,
    temp?: number,
    category?: string,
    timeOfDay?: string,
  ): Promise<any[]> {
    return this.recommendationService.getRecommendations(
      lat,
      lon,
      radius,
      sky,
      pty,
      temp,
      category,
      timeOfDay,
    );
  }

  async getRestaurantDetail(id: number): Promise<Restaurant> {
    return this.kakaoService.getRestaurantDetail(id);
  }

  async logClick(
    restaurantId: number,
    clickData: { userId?: number; temp?: number; sky?: string; pty?: string; timeOfDay?: string },
  ): Promise<void> {
    return this.clickLogService.logClick(restaurantId, clickData);
  }
}
