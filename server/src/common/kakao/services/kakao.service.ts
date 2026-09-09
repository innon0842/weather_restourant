import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../../../restaurants/entities/restaurant.entity';
import { KakaoHttpClient } from '../utils/kakao-http.client';
import { KakaoRestaurantParser } from '../parsers/kakao-restaurant.parser';

@Injectable()
export class KakaoService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly httpClient: KakaoHttpClient,
    private readonly parser: KakaoRestaurantParser,
  ) {}

  // Fetch real restaurants using Kakao Local API and map/save them (No fallbacks!)
  async fetchKakaoRestaurants(
    lat: number,
    lon: number,
    radiusKm: number,
    categoryFilter?: string,
  ): Promise<Restaurant[]> {
    let query = '맛집';
    if (categoryFilter) {
      query = categoryFilter;
    }

    const radiusMeters = Math.min(20000, Math.round(radiusKm * 1000));
    
    // Fetch 3 pages in parallel to retrieve up to 45 results, covering the larger selected radius.
    const pages = [1, 2, 3];
    try {
      const pageResults = await Promise.all(
        pages.map(p => this.httpClient.fetchKeywordPage(lat, lon, query, radiusMeters, p))
      );
      const allDocuments = pageResults.flat();

      // De-duplicate documents by Kakao's unique id
      const uniqueDocsMap = new Map<string, any>();
      allDocuments.forEach(doc => {
        if (doc && doc.id) {
          uniqueDocsMap.set(doc.id, doc);
        }
      });
      const documents = Array.from(uniqueDocsMap.values());
      console.log(`Kakao response unique documents count (across 3 pages):`, documents.length);

      if (documents.length === 0) {
        console.warn(`No restaurants found on Kakao Maps API for query "${query}" around coordinate ${lat}, ${lon}`);
        return [];
      }

      const list: Restaurant[] = [];

      for (const item of documents) {
        const apiPlaceId = `kakao_${item.id}`;
        let rest = await this.restaurantRepository.findOneBy({ apiPlaceId });

        // Parse category from category_name (e.g. "음식점 > 한식 > 육류,고기 > 곱창")
        const parsedCategory = this.parser.parseCategory(item.category_name);

        // Dynamic weather tags generation based on name and category keywords
        const tags = this.parser.parseWeatherTags(item.place_name, item.category_name, parsedCategory);

        // Match beautiful placeholder food photos
        const imageUrl = this.parser.parsePlaceholderImage(parsedCategory);

        if (!rest) {
          rest = this.restaurantRepository.create({
            apiPlaceId,
            name: item.place_name || '',
            category: parsedCategory,
            weatherTags: tags,
            phone: item.phone || '',
            address: item.road_address_name || item.address_name || '',
            lat: parseFloat(item.y),
            lon: parseFloat(item.x),
            imageUrl,
          });
        } else {
          rest.phone = item.phone || rest.phone;
          rest.address = item.road_address_name || item.address_name || rest.address;
          rest.lat = parseFloat(item.y);
          rest.lon = parseFloat(item.x);
          rest.weatherTags = tags; // Update weather tags for existing entries to support new tags
        }

        rest = await this.restaurantRepository.save(rest);
        list.push(rest);
      }

      return list;
    } catch (err) {
      console.error('Error fetching Kakao restaurants:', err);
      return [];
    }
  }

  async getRestaurantDetail(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOneBy({ id });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const isCorrupted = restaurant.isDetailCached &&
      (!restaurant.businessHours || 
       restaurant.businessHours === '영업시간 정보 없음' || 
       restaurant.businessHours === '정보 없음') &&
      (!restaurant.menus || restaurant.menus.length === 0) &&
      (!restaurant.photoUrls || restaurant.photoUrls.length === 0);

    if (restaurant.isDetailCached && !isCorrupted) {
      return restaurant;
    }

    const placeId = restaurant.apiPlaceId.replace('kakao_', '');

    try {
      console.log(`[Scraper] Fetching details for ${restaurant.name} (${placeId})...`);
      const data = await this.httpClient.fetchPlaceDetails(placeId);

      // 1. Operating Hours
      restaurant.businessHours = this.parser.parseBusinessHours(data);

      // 2. Menus
      restaurant.menus = this.parser.parseMenus(data);

      // 3. Photo URLs
      const photoUrls = this.parser.parsePhotoUrls(data);
      restaurant.photoUrls = photoUrls;

      // 4. Main Image
      const mainPhoto = this.parser.parseMainImage(data, photoUrls);
      if (mainPhoto) {
        restaurant.imageUrl = mainPhoto;
      }

      restaurant.isDetailCached = true;
      console.log(`[Scraper] Successfully cached details for ${restaurant.name}`);
    } catch (err) {
      console.error(`[Scraper] Failed to fetch details for ${restaurant.name}:`, err);
      restaurant.isDetailCached = false;
      restaurant.businessHours = restaurant.businessHours || '영업시간 정보 없음';
      restaurant.menus = restaurant.menus || [];
      restaurant.photoUrls = restaurant.photoUrls || [];
    }

    return this.restaurantRepository.save(restaurant);
  }
}
