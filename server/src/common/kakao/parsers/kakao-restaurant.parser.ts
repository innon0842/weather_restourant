import { Injectable } from '@nestjs/common';
import { KAKAO_CRAWLER_CONFIG } from '../config/kakao-crawler.config';

@Injectable()
export class KakaoRestaurantParser {
  parseCategory(categoryName: string): string {
    const catName = categoryName || '';
    if (catName.includes('한식')) return '한식';
    if (catName.includes('중식')) return '중식';
    if (catName.includes('일식')) return '일식';
    if (
      catName.includes('양식') ||
      catName.includes('이탈리안') ||
      catName.includes('퓨전양식')
    ) {
      return '양식';
    }
    if (
      catName.includes('카페') ||
      catName.includes('커피전문점') ||
      catName.includes('제과,베이커리')
    ) {
      return '카페';
    }
    return '기타';
  }

  parseWeatherTags(placeName: string, categoryName: string, parsedCategory: string): string[] {
    const tags: string[] = [];
    const searchStr = `${placeName || ''} ${categoryName || ''}`;

    if (
      searchStr.includes('탕') ||
      searchStr.includes('찌개') ||
      searchStr.includes('국밥') ||
      searchStr.includes('전골') ||
      searchStr.includes('칼국수') ||
      searchStr.includes('수제비') ||
      searchStr.includes('우동') ||
      searchStr.includes('라멘') ||
      searchStr.includes('샤브샤브')
    ) {
      tags.push('RAINY_FOOD', 'WARM_SOUP', 'COLD_WEATHER');
    } else if (
      searchStr.includes('전') ||
      searchStr.includes('부침개') ||
      searchStr.includes('빈대떡') ||
      searchStr.includes('막걸리')
    ) {
      tags.push('RAINY_FOOD');
    }

    if (parsedCategory === '카페') {
      tags.push('WARM_TEA', 'HOT_WEATHER', 'COLD_WEATHER');
    }

    if (
      searchStr.includes('빙수') ||
      searchStr.includes('아이스크림') ||
      searchStr.includes('냉면') ||
      searchStr.includes('소바') ||
      searchStr.includes('밀면')
    ) {
      tags.push('HOT_WEATHER', 'COLD_FOOD');
    }

    if (
      parsedCategory === '양식' ||
      searchStr.includes('테라스') ||
      searchStr.includes('루프탑') ||
      searchStr.includes('전망') ||
      searchStr.includes('브런치')
    ) {
      tags.push('TERRACE', 'VIEW', 'SUNNY_FOOD');
    }

    // Time of Day Tag Generation
    if (
      parsedCategory === '카페' ||
      searchStr.includes('브런치') ||
      searchStr.includes('샌드위치') ||
      searchStr.includes('해장') ||
      searchStr.includes('국밥') ||
      searchStr.includes('죽') ||
      searchStr.includes('토스트') ||
      searchStr.includes('베이커리') ||
      searchStr.includes('샐러드') ||
      searchStr.includes('스프')
    ) {
      tags.push('MORNING_FOOD');
    }

    if (
      parsedCategory === '카페' ||
      parsedCategory === '한식' ||
      parsedCategory === '중식' ||
      parsedCategory === '일식' ||
      parsedCategory === '양식' ||
      searchStr.includes('점심') ||
      searchStr.includes('식사')
    ) {
      tags.push('AFTERNOON_FOOD');
    }

    if (
      searchStr.includes('고기') ||
      searchStr.includes('구이') ||
      searchStr.includes('치킨') ||
      searchStr.includes('족발') ||
      searchStr.includes('곱창') ||
      searchStr.includes('술집') ||
      searchStr.includes('회') ||
      searchStr.includes('포차') ||
      searchStr.includes('삼겹살') ||
      searchStr.includes('갈비') ||
      searchStr.includes('맥주') ||
      searchStr.includes('이자카야') ||
      searchStr.includes('저녁') ||
      parsedCategory === '한식' ||
      parsedCategory === '일식' ||
      parsedCategory === '양식' ||
      parsedCategory === '중식'
    ) {
      tags.push('EVENING_FOOD');
    }

    return tags;
  }

  parsePlaceholderImage(parsedCategory: string): string {
    return KAKAO_CRAWLER_CONFIG.PLACEHOLDER_IMAGES[parsedCategory] || KAKAO_CRAWLER_CONFIG.PLACEHOLDER_IMAGES['기타'];
  }

  parseBusinessHours(data: any): string {
    let businessHours = '상세 정보 없음';
    if (data.open_hours) {
      const oh = data.open_hours;
      const periodsText: string[] = [];
      if (oh.all?.periods) {
        for (const p of oh.all.periods) {
          const daysText = p.days?.map((d: any) => {
            const dow = d.day_of_the_week || d.day_of_the_week_desc || '';
            const onDays = d.on_days;
            if (onDays) {
              const times = onDays.start_end_time_desc || '';
              const breakTime = onDays.break_times_desc?.join(', ') || '';
              return `${dow}: ${times}${breakTime ? ` (${breakTime})` : ''}`;
            } else if (d.off_days_desc) {
              return `${dow}: ${d.off_days_desc}`;
            }
            return '';
          }).filter(Boolean);
          if (daysText && daysText.length > 0) {
            periodsText.push(daysText.join(' | '));
          }
        }
      }
      if (oh.all?.all_days_off_info) {
        periodsText.push(`휴무: ${oh.all.all_days_off_info}`);
      }
      if (periodsText.length > 0) {
        businessHours = periodsText.join(' / ');
      } else if (oh.headline?.display_text || oh.headline?.display_text_info) {
        businessHours = `${oh.headline.display_text || ''} ${oh.headline.display_text_info || ''}`.trim();
      }
    } else if (data.basicInfo?.openHour) {
      const oh = data.basicInfo.openHour;
      if (oh.realtime?.datetime) {
        businessHours = oh.realtime.datetime;
      } else if (oh.periodList && oh.periodList.length > 0) {
        const periods = oh.periodList.map((p: any) => {
          const timeList = p.timeList?.map((t: any) => `${t.timeName}: ${t.time}`).join(', ') || '';
          return `${p.periodName}${timeList ? ` (${timeList})` : ''}`;
        });
        businessHours = periods.join(' | ');
      }
    }
    return businessHours;
  }

  private normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    if (trimmed.startsWith('http://')) {
      return trimmed.replace('http://', 'https://');
    }
    if (!trimmed.startsWith('http')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  parseMenus(data: any): any[] {
    let menus: any[] = [];
    if (data.menu?.menus?.items) {
      menus = data.menu.menus.items.map((m: any) => {
        let priceText = '';
        if (m.price !== undefined && m.price !== null) {
          priceText = typeof m.price === 'number' ? `${m.price.toLocaleString()}원` : String(m.price);
        }
        return {
          name: m.name || '',
          price: priceText,
          imageUrl: this.normalizeUrl(m.image_url || m.img),
        };
      });
    } else if (data.menu?.items) {
      menus = data.menu.items.map((m: any) => {
        let priceText = '';
        if (m.price !== undefined && m.price !== null) {
          priceText = typeof m.price === 'number' ? `${m.price.toLocaleString()}원` : String(m.price);
        }
        return {
          name: m.name || '',
          price: priceText,
          imageUrl: this.normalizeUrl(m.image_url || m.img),
        };
      });
    } else if (data.menuInfo?.menuList) {
      menus = data.menuInfo.menuList.map((m: any) => ({
        name: m.menu || '',
        price: m.price || '',
        imageUrl: this.normalizeUrl(m.img),
      }));
    }
    return menus;
  }

  parsePhotoUrls(data: any): string[] {
    let photoUrls: string[] = [];
    if (data.photos?.photos) {
      photoUrls = data.photos.photos
        .map((p: any) => p.url)
        .filter(Boolean);
    } else if (data.photo?.photoList) {
      for (const pl of data.photo.photoList) {
        if (pl.list) {
          const urls = pl.list.map((item: any) => item.orgurl).filter(Boolean);
          photoUrls = [...photoUrls, ...urls];
        }
      }
    }
    return photoUrls
      .map((url) => this.normalizeUrl(url))
      .filter((x): x is string => !!x)
      .slice(0, 10);
  }

  parseMainImage(data: any, photoUrls: string[]): string | null {
    if (data.basicInfo?.mainphotourl) {
      return this.normalizeUrl(data.basicInfo.mainphotourl);
    }
    if (photoUrls && photoUrls.length > 0) {
      return photoUrls[0];
    }
    return null;
  }
}
