export const KAKAO_CRAWLER_CONFIG = {
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://place.map.kakao.com/',
    'Origin': 'https://place.map.kakao.com',
    'Accept': 'application/json, text/plain, */*',
    'appVersion': '6.6.0',
    'pf': 'PC',
  },
  URLS: {
    KEYWORD_SEARCH: (query: string, x: number, y: number, radiusMeters: number, page: number) =>
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        query,
      )}&x=${x}&y=${y}&radius=${radiusMeters}&size=15&page=${page}`,
    PLACE_DETAILS: (placeId: string) =>
      `https://place-api.map.kakao.com/places/panel3/${placeId}`,
  },
  PLACEHOLDER_IMAGES: {
    '한식': '/placeholders/korean.png',
    '양식': '/placeholders/western.png',
    '중식': '/placeholders/chinese.png',
    '일식': '/placeholders/japanese.png',
    '카페': '/placeholders/cafe.png',
    '기타': '/placeholders/etc.png',
  } as Record<string, string>,
};
