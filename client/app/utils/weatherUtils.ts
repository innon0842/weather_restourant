// 위경도 <-> 기상청 격자좌표(nx, ny) 변환 및 시간대 처리 유틸리티

export interface CityInfo {
  id: string;
  name: string;
  nx: number;
  ny: number;
  lat: number;
  lon: number;
  regIdLand: string; // 중기 육상예보 구역코드 (맑음/비 등)
  regIdTemp: string; // 중기 기온예보 구역코드 (최고/최저 기온)
  sidoName: string;  // 에어코리아 미세먼지 시도명
  metalStationCode: string; // 금속성분 측정소 코드 (MetalService)
}

// 대한민국 주요 시/도 목록
export const CITIES: CityInfo[] = [
  { id: "seoul", name: "서울", nx: 60, ny: 127, lat: 37.5665, lon: 126.9780, regIdLand: "11B00000", regIdTemp: "11B10101", sidoName: "서울", metalStationCode: "1" },
  { id: "incheon", name: "인천", nx: 55, ny: 124, lat: 37.4563, lon: 126.7052, regIdLand: "11B00000", regIdTemp: "11B20101", sidoName: "인천", metalStationCode: "1" },
  { id: "suwon", name: "수원/경기", nx: 60, ny: 120, lat: 37.2636, lon: 127.0286, regIdLand: "11B00000", regIdTemp: "11B20601", sidoName: "경기", metalStationCode: "7" },
  { id: "chuncheon", name: "춘천/영서", nx: 73, ny: 134, lat: 37.8813, lon: 127.7298, regIdLand: "11D10000", regIdTemp: "11D10301", sidoName: "강원", metalStationCode: "10" },
  { id: "gangneung", name: "강릉/영동", nx: 92, ny: 132, lat: 37.7519, lon: 128.8761, regIdLand: "11D20000", regIdTemp: "11D20401", sidoName: "강원", metalStationCode: "10" },
  { id: "daejeon", name: "대전/충남", nx: 67, ny: 100, lat: 36.3504, lon: 127.3845, regIdLand: "11C20000", regIdTemp: "11C20401", sidoName: "대전", metalStationCode: "8" },
  { id: "cheongju", name: "청주/충북", nx: 69, ny: 107, lat: 36.6372, lon: 127.4890, regIdLand: "11C10000", regIdTemp: "11C10301", sidoName: "충북", metalStationCode: "11" },
  { id: "gwangju", name: "광주/전남", nx: 58, ny: 74, lat: 35.1595, lon: 126.8526, regIdLand: "11F20000", regIdTemp: "11F20501", sidoName: "광주", metalStationCode: "3" },
  { id: "jeonju", name: "전주/전북", nx: 63, ny: 89, lat: 35.8242, lon: 127.1480, regIdLand: "11F10000", regIdTemp: "11F10201", sidoName: "전북", metalStationCode: "9" },
  { id: "daegu", name: "대구/경북", nx: 89, ny: 90, lat: 35.8714, lon: 128.6014, regIdLand: "11H10000", regIdTemp: "11H10701", sidoName: "대구", metalStationCode: "6" },
  { id: "busan", name: "부산", nx: 98, ny: 76, lat: 35.1796, lon: 129.0756, regIdLand: "11H20000", regIdTemp: "11H20201", sidoName: "부산", metalStationCode: "6" },
  { id: "ulsan", name: "울산", nx: 102, ny: 84, lat: 35.5389, lon: 129.3114, regIdLand: "11H20000", regIdTemp: "11H20101", sidoName: "울산", metalStationCode: "6" },
  { id: "jeju", name: "제주", nx: 52, ny: 38, lat: 33.4996, lon: 126.5312, regIdLand: "11G00000", regIdTemp: "11G00201", sidoName: "제주", metalStationCode: "5" }
];

// 1. KST(한국 표준시) 기준 Date 객체 생성
export function getKSTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  return new Date(utc + KST_OFFSET);
}

// 2. 위경도 -> 기상청 격자좌표(nx, ny) 변환
// 기상청에서 공식 배포한 LCC 변환 수식
export function convertLatLngToGrid(lat: number, lon: number): { nx: number; ny: number } {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0;      // 격자 간격(km)
  const SLAT1 = 30.0;    // 투영 위도1(degree)
  const SLAT2 = 60.0;    // 투영 위도2(degree)
  const OLON = 126.0;    // 기준점 경도(degree)
  const OLAT = 38.0;     // 기준점 위도(degree)
  const XO = 43;         // 기준점 X좌표(GRID)
  const YO = 136;        // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  const ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  const r = (re * sf) / Math.pow(ra, sn);
  
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(r * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - r * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

// 3. 위경도를 기준으로 가장 가까운 대한민국 주요 도시 찾기
export function findClosestCity(lat: number, lon: number): CityInfo {
  let closestCity = CITIES[0];
  let minDistance = Infinity;

  for (const city of CITIES) {
    const dLat = lat - city.lat;
    const dLon = lon - city.lon;
    const distance = dLat * dLat + dLon * dLon; // 피타고라스 거리 계산 (간이식)

    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  return closestCity;
}

// 4. 단기예보용 최신 base_date, base_time 계산
// 단기예보 발표 시각: 02, 05, 08, 11, 14, 17, 20, 23시 (1일 8회)
// API 업데이트는 매 발표 시각 10분 후부터 완료됨
export function getShortTermBase(kstDate: Date): { baseDate: string; baseTime: string } {
  const hours = kstDate.getHours();
  const minutes = kstDate.getMinutes();
  const timeVal = hours * 100 + minutes;

  const baseDate = new Date(kstDate);
  let baseTime = "";

  if (timeVal < 210) {
    // 02시 10분 이전에는 전날 23시 데이터 사용
    baseDate.setDate(baseDate.getDate() - 1);
    baseTime = "2300";
  } else if (timeVal < 510) {
    baseTime = "0200";
  } else if (timeVal < 810) {
    baseTime = "0500";
  } else if (timeVal < 1110) {
    baseTime = "0800";
  } else if (timeVal < 1410) {
    baseTime = "1100";
  } else if (timeVal < 1710) {
    baseTime = "1400";
  } else if (timeVal < 2010) {
    baseTime = "1700";
  } else if (timeVal < 2310) {
    baseTime = "2000";
  } else {
    baseTime = "2300";
  }

  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");

  return {
    baseDate: `${yyyy}${mm}${dd}`,
    baseTime
  };
}

// 5. 중기예보용 최신 tmFc 계산
// 중기예보 발표 시각: 매일 06시, 18시 (1일 2회)
// API 데이터는 보통 발표 후 5분 뒤부터 조회가 원활함
export function getMidTermBase(kstDate: Date): string {
  const hours = kstDate.getHours();
  const minutes = kstDate.getMinutes();
  const timeVal = hours * 100 + minutes;

  const baseDate = new Date(kstDate);
  let timeStr = "";

  if (timeVal < 605) {
    // 06시 5분 이전에는 전날 18시 데이터 사용
    baseDate.setDate(baseDate.getDate() - 1);
    timeStr = "1800";
  } else if (timeVal < 1805) {
    timeStr = "0600";
  } else {
    timeStr = "1800";
  }

  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}${timeStr}`;
}

// 6. 위도 및 날짜 기준 일출/일몰 시각 근사 계산 함수
export function getSunriseSunset(lat: number, date: Date): { sunrise: string; sunset: string } {
  // 1년 중 경과일 계산 (0 ~ 365)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  
  // 태양 적위 근사 각도 계산
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + day)) / 365);
  
  // 시간각 계산 (라디안)
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const cosH = -Math.tan(latRad) * Math.tan(decRad);
  
  // 아크코사인 범위 클리핑
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) * (180 / Math.PI); // degrees
  
  // 낮의 길이 (시간 단위): 2 * H / 15
  const dayLength = (2 * H) / 15;
  
  // 대한민국(UTC+9) 표준시 기준 솔라 누오 정오각 보정 (평균 12시 32분)
  const solarNoon = 12.53; // 12시 32분 근사
  
  const sunriseHour = solarNoon - dayLength / 2;
  const sunsetHour = solarNoon + dayLength / 2;
  
  const formatTime = (hourFraction: number) => {
    const hours = Math.floor(hourFraction);
    const minutes = Math.round((hourFraction - hours) * 60);
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };
  
  return {
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour)
  };
}
