import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { RestaurantClickLog } from '../entities/restaurant-click-log.entity';

@Injectable()
export class RestaurantClickLogService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantClickLog)
    private readonly clickLogRepository: Repository<RestaurantClickLog>,
  ) {}

  async logClick(
    restaurantId: number,
    clickData: { userId?: number; temp?: number; sky?: string; pty?: string; timeOfDay?: string },
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const log = this.clickLogRepository.create({
      restaurant,
      userId: clickData.userId,
      temp: clickData.temp,
      sky: clickData.sky,
      pty: clickData.pty,
      timeOfDay: clickData.timeOfDay,
    });

    await this.clickLogRepository.save(log);
  }
}
