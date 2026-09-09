import { Injectable } from '@nestjs/common';
import { KakaoService } from '../../common/kakao/services/kakao.service';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly kakaoService: KakaoService,
  ) {}

  // Haversine formula to calculate distance between two coordinates in km
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get weather recommendations
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
    // 1. Fetch real restaurants from Kakao Local API via KakaoService
    const restaurants = await this.kakaoService.fetchKakaoRestaurants(lat, lon, radius, category);

    // 2. Evaluate current weather conditions
    const isRainOrSnow = pty && pty !== '0';
    const isSunny = sky === '1' && !isRainOrSnow;
    
    const isCold = temp !== undefined && temp <= 5;
    const isHot = temp !== undefined && temp >= 30;

    // Evaluate time of day (Morning: 05-11, Afternoon: 11-17, Evening: 17-05)
    let activeTimeOfDay = timeOfDay;
    if (!activeTimeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) {
        activeTimeOfDay = 'morning';
      } else if (hour >= 11 && hour < 17) {
        activeTimeOfDay = 'afternoon';
      } else {
        activeTimeOfDay = 'evening';
      }
    }

    // 3. Score and filter restaurants
    const scoredList = restaurants.map((restaurant) => {
      const distance = this.calculateDistance(lat, lon, restaurant.lat, restaurant.lon);
      
      let score = 50; // Neutral starting score
      const reasons: string[] = [];

      // Check category filter
      if (category && restaurant.category !== category) {
        score = -1;
      }

      if (score >= 0) {
        // A. Weather matching tags (Up to +30 points)
        const tags = restaurant.weatherTags || [];

        if (isRainOrSnow) {
          if (tags.includes('RAINY_FOOD')) {
            score += 20;
            reasons.push('비/눈 오는 날에 어울리는 음식');
          }
          if (tags.includes('WARM_SOUP')) {
            score += 10;
            reasons.push('뜨끈한 국물 생각나는 날');
          }
        }

        if (isSunny) {
          if (tags.includes('SUNNY_FOOD')) {
            score += 15;
            reasons.push('화창한 날에 추천하는 메뉴');
          }
          if (tags.includes('TERRACE') || tags.includes('VIEW')) {
            score += 15;
            reasons.push('야외 테라스/전경이 좋은 맛집');
          }
        }

        if (isCold) {
          if (tags.includes('COLD_WEATHER') || tags.includes('WARM_SOUP')) {
            score += 20;
            reasons.push('추운 몸을 녹여줄 따뜻한 메뉴');
          }
        }

        if (isHot) {
          if (tags.includes('HOT_WEATHER')) {
            score += 15;
            reasons.push('더운 날씨에 시원하게 즐기기 좋은 곳');
          }
          if (tags.includes('COLD_FOOD')) {
            score += 15;
            reasons.push('갈증을 해소해줄 시원한 음식');
          }
        }

        // B. Time of Day matching (Up to +20 points)
        if (activeTimeOfDay === 'morning' && tags.includes('MORNING_FOOD')) {
          score += 20;
          reasons.push('아침 식사/가벼운 브런치 추천');
        } else if (activeTimeOfDay === 'afternoon' && tags.includes('AFTERNOON_FOOD')) {
          score += 20;
          reasons.push('점심 식사하기 딱 좋은 곳');
        } else if (activeTimeOfDay === 'evening' && tags.includes('EVENING_FOOD')) {
          score += 20;
          reasons.push('저녁 식사/모임 추천');
        }

        // C. Distance weighting (Up to +20 points)
        // Score boosts closer restaurants (0.0km = +20 pts, 2.0km = +0 pts)
        const distanceFactor = Math.max(0, 1 - distance / radius);
        score += Math.round(distanceFactor * 20);
      }

      return {
        ...restaurant,
        distance: Math.round(distance * 100) / 100, // round to 2 decimals
        matchScore: Math.round(Math.min(100, Math.max(0, score))),
        matchReason: reasons.length > 0 ? reasons.join(', ') : '무난하게 즐기기 좋은 식당',
      };
    });

    // 4. Filter and sort
    return scoredList
      .filter((r) => r.matchScore >= 0 && r.distance <= radius)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
