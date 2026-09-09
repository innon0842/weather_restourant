import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RestaurantsService } from '../services/restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('recommendations')
  async getRecommendations(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
    @Query('sky') sky?: string,
    @Query('pty') pty?: string,
    @Query('temp') temp?: string,
    @Query('category') category?: string,
    @Query('timeOfDay') timeOfDay?: string,
  ) {
    if (!lat || !lon) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const searchRadius = radius ? parseFloat(radius) : 2.0; // default 2km
    const currentTemp = temp ? parseFloat(temp) : undefined;

    if (isNaN(userLat) || isNaN(userLon)) {
      throw new BadRequestException('Invalid latitude or longitude format');
    }

    return this.restaurantsService.getRecommendations(
      userLat,
      userLon,
      searchRadius,
      sky,
      pty,
      currentTemp,
      category,
      timeOfDay,
    );
  }

  @Get(':id/detail')
  async getDetail(@Param('id') id: string) {
    const restaurantId = parseInt(id, 10);
    if (isNaN(restaurantId)) {
      throw new BadRequestException('Invalid restaurant ID');
    }
    return this.restaurantsService.getRestaurantDetail(restaurantId);
  }

  @Post(':id/click')
  async logClick(
    @Param('id') id: string,
    @Body('userId') userId?: number,
    @Body('temp') temp?: number,
    @Body('sky') sky?: string,
    @Body('pty') pty?: string,
    @Body('timeOfDay') timeOfDay?: string,
  ) {
    const restaurantId = parseInt(id, 10);
    if (isNaN(restaurantId)) {
      throw new BadRequestException('Invalid restaurant ID');
    }

    await this.restaurantsService.logClick(restaurantId, {
      userId,
      temp,
      sky,
      pty,
      timeOfDay,
    });

    return { success: true };
  }
}
