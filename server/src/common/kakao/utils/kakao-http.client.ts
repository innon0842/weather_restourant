import { Injectable } from '@nestjs/common';
import { KAKAO_CRAWLER_CONFIG } from '../config/kakao-crawler.config';

@Injectable()
export class KakaoHttpClient {
  async fetchKeywordPage(
    lat: number,
    lon: number,
    query: string,
    radiusMeters: number,
    page: number,
  ): Promise<any[]> {
    const apiKey = process.env.KAKAO_REST_API_KEY;
    if (!apiKey) {
      console.warn('Kakao REST API Key is missing in environment variables.');
      return [];
    }

    const url = KAKAO_CRAWLER_CONFIG.URLS.KEYWORD_SEARCH(query, lon, lat, radiusMeters, page);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });

      if (!response.ok) {
        console.error(`Kakao API request failed for page ${page}: ${response.status} - ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data?.documents || [];
    } catch (err) {
      console.error(`Error fetching Kakao API page ${page}:`, err);
      return [];
    }
  }

  async fetchPlaceDetails(placeId: string): Promise<any> {
    const url = KAKAO_CRAWLER_CONFIG.URLS.PLACE_DETAILS(placeId);

    const response = await fetch(url, {
      headers: KAKAO_CRAWLER_CONFIG.HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Kakao API responded with status ${response.status}`);
    }

    return response.json();
  }
}
