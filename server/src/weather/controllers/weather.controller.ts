import { Controller, Get, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('short')
  async getShortForecast(@Query('nx') nx?: string, @Query('ny') ny?: string) {
    const activeNx = nx || '60';
    const activeNy = ny || '127';

    try {
      const result = await this.weatherService.getShortForecast(activeNx, activeNy);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('[WeatherController Short Error]', error);
      throw new InternalServerErrorException(error.message || '날씨 조회 중 오류가 발생했습니다.');
    }
  }

  @Get('mid')
  async getMidForecast(@Query('regIdLand') regIdLand?: string, @Query('regIdTemp') regIdTemp?: string) {
    const activeRegIdLand = regIdLand || '11B00000';
    const activeRegIdTemp = regIdTemp || '11B10101';

    try {
      const result = await this.weatherService.getMidForecast(activeRegIdLand, activeRegIdTemp);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('[WeatherController Mid Error]', error);
      throw new InternalServerErrorException(error.message || '중기 날씨 조회 중 오류가 발생했습니다.');
    }
  }

  @Get('dust')
  async getDust(@Query('stationcode') stationcode?: string) {
    const activeStationCode = stationcode || '1';

    try {
      const result = await this.weatherService.getDustMetalData(activeStationCode);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('[WeatherController Dust Error]', error);
      throw new InternalServerErrorException(error.message || '미세먼지/금속성분 조회 중 오류가 발생했습니다.');
    }
  }
}
