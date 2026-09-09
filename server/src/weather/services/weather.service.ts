import { Injectable } from '@nestjs/common';

export interface ForecastItem {
  date: string;
  time: string;
  temp?: string;
  sky?: string;
  pty?: string;
  pop?: string;
  reh?: string;
  wsd?: string;
  pcp?: string;
  windDeg?: string;
}

@Injectable()
export class WeatherService {
  private getKSTDate(): Date {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    return new Date(utc + KST_OFFSET);
  }

  private getUltraSrtNcstBase(kst: Date) {
    const temp = new Date(kst.getTime());
    const minutes = temp.getMinutes();
    if (minutes < 40) {
      temp.setHours(temp.getHours() - 1);
    }
    const baseDate = `${temp.getFullYear()}${String(temp.getMonth() + 1).padStart(2, '0')}${String(temp.getDate()).padStart(2, '0')}`;
    const baseTime = `${String(temp.getHours()).padStart(2, '0')}00`;
    return { baseDate, baseTime };
  }

  private getShortTermBase(kstDate: Date): { baseDate: string; baseTime: string } {
    const hours = kstDate.getHours();
    const minutes = kstDate.getMinutes();
    const timeVal = hours * 100 + minutes;

    const baseDate = new Date(kstDate);
    let baseTime = '';

    if (timeVal < 210) {
      baseDate.setDate(baseDate.getDate() - 1);
      baseTime = '2300';
    } else if (timeVal < 510) {
      baseTime = '0200';
    } else if (timeVal < 810) {
      baseTime = '0500';
    } else if (timeVal < 1110) {
      baseTime = '0800';
    } else if (timeVal < 1410) {
      baseTime = '1100';
    } else if (timeVal < 1710) {
      baseTime = '1400';
    } else if (timeVal < 2010) {
      baseTime = '1700';
    } else if (timeVal < 2310) {
      baseTime = '2000';
    } else {
      baseTime = '2300';
    }

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');

    return {
      baseDate: `${yyyy}${mm}${dd}`,
      baseTime,
    };
  }

  private getMidTermBase(kstDate: Date): string {
    const hours = kstDate.getHours();
    const minutes = kstDate.getMinutes();
    const timeVal = hours * 100 + minutes;

    const baseDate = new Date(kstDate);
    let timeStr = '';

    if (timeVal < 605) {
      baseDate.setDate(baseDate.getDate() - 1);
      timeStr = '1800';
    } else if (timeVal < 1805) {
      timeStr = '0600';
    } else {
      timeStr = '1800';
    }

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');

    return `${yyyy}${mm}${dd}${timeStr}`;
  }

  private getStnId(regIdLand: string): string {
    if (regIdLand.startsWith('11B')) return '109';
    if (regIdLand.startsWith('11D')) return '105';
    if (regIdLand.startsWith('11C1')) return '131';
    if (regIdLand.startsWith('11C')) return '133';
    if (regIdLand.startsWith('11F1')) return '146';
    if (regIdLand.startsWith('11F')) return '156';
    if (regIdLand.startsWith('11H1')) return '143';
    if (regIdLand.startsWith('11H')) return '159';
    if (regIdLand.startsWith('11G')) return '184';
    return '108';
  }

  async getShortForecast(nx: string, ny: string) {
    const rawKey = process.env.DATA_API_KEY_3;
    if (!rawKey) throw new Error('DATA_API_KEY_3 is not configured');
    const serviceKey = rawKey.includes('%') ? decodeURIComponent(rawKey) : rawKey;
    const kst = this.getKSTDate();
    const { baseDate, baseTime } = this.getShortTermBase(kst);

    const vilageUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    const ncstTimeObj = this.getUltraSrtNcstBase(kst);
    const ncstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${ncstTimeObj.baseDate}&base_time=${ncstTimeObj.baseTime}&nx=${nx}&ny=${ny}`;

    const [vilageRes, ncstRes] = await Promise.all([
      fetch(vilageUrl),
      fetch(ncstUrl).catch(() => null),
    ]);

    if (!vilageRes || !vilageRes.ok) {
      throw new Error(`VilageFcst Public Data Portal response not OK`);
    }

    const data = await vilageRes.json();
    const resultHeader = data?.response?.header;

    if (resultHeader?.resultCode !== '00') {
      throw new Error(resultHeader?.resultMsg || 'Public Data Portal API error');
    }

    const items = data?.response?.body?.items?.item || [];
    if (items.length === 0) {
      throw new Error('No forecasts found');
    }

    const forecastMap = new Map<string, ForecastItem>();
    let todayTmn = '';
    let todayTmx = '';

    items.forEach((item: any) => {
      const key = `${item.fcstDate}_${item.fcstTime}`;

      if (item.category === 'TMN' && item.fcstDate === baseDate) {
        todayTmn = item.fcstValue;
      }
      if (item.category === 'TMX' && item.fcstDate === baseDate) {
        todayTmx = item.fcstValue;
      }

      if (!forecastMap.has(key)) {
        forecastMap.set(key, {
          date: item.fcstDate,
          time: item.fcstTime,
        });
      }

      const currentObj = forecastMap.get(key)!;
      switch (item.category) {
        case 'TMP':
          currentObj.temp = item.fcstValue;
          break;
        case 'SKY':
          currentObj.sky = item.fcstValue;
          break;
        case 'PTY':
          currentObj.pty = item.fcstValue;
          break;
        case 'POP':
          currentObj.pop = item.fcstValue;
          break;
        case 'REH':
          currentObj.reh = item.fcstValue;
          break;
        case 'WSD':
          currentObj.wsd = item.fcstValue;
          break;
        case 'PCP':
          currentObj.pcp = item.fcstValue;
          break;
        case 'VEC':
          currentObj.windDeg = item.fcstValue;
          break;
      }
    });

    const sortedForecasts = Array.from(forecastMap.values()).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

    const currentHourStr = String(kst.getHours()).padStart(2, '0') + '00';
    const currentDateStr = `${kst.getFullYear()}${String(kst.getMonth() + 1).padStart(2, '0')}${String(
      kst.getDate(),
    ).padStart(2, '0')}`;

    let currentIdx = sortedForecasts.findIndex(
      (f) => f.date === currentDateStr && f.time >= currentHourStr,
    );

    if (currentIdx === -1) {
      currentIdx = 0;
    }

    const currentVilage = sortedForecasts[currentIdx] || sortedForecasts[0];

    let liveTemp: string | null = null;
    let livePty: string | null = null;
    let liveReh: string | null = null;
    let liveWsd: string | null = null;
    let liveWindDeg: string | null = null;

    if (ncstRes && ncstRes.ok) {
      try {
        const ncstData = await ncstRes.json();
        if (ncstData?.response?.header?.resultCode === '00') {
          const ncstItems = ncstData?.response?.body?.items?.item || [];
          ncstItems.forEach((item: any) => {
            switch (item.category) {
              case 'T1H':
                liveTemp = item.obsrValue;
                break;
              case 'PTY':
                livePty = item.obsrValue;
                break;
              case 'REH':
                liveReh = item.obsrValue;
                break;
              case 'WSD':
                liveWsd = item.obsrValue;
                break;
              case 'VEC':
                liveWindDeg = item.obsrValue;
                break;
            }
          });
        }
      } catch (ncstErr) {
        console.error('Failed to parse getUltraSrtNcst data', ncstErr);
      }
    }

    const current = {
      ...currentVilage,
      temp: liveTemp !== null ? liveTemp : currentVilage?.temp,
      pty: livePty !== null ? livePty : currentVilage?.pty,
      reh: liveReh !== null ? liveReh : currentVilage?.reh,
      wsd: liveWsd !== null ? liveWsd : currentVilage?.wsd,
      windDeg: liveWindDeg !== null ? liveWindDeg : currentVilage?.windDeg,
    };

    const hourly = sortedForecasts.slice(currentIdx, currentIdx + 24);

    if (!todayTmn || !todayTmx) {
      const todayTemps = sortedForecasts
        .filter((f) => f.date === currentDateStr && f.temp)
        .map((f) => parseFloat(f.temp!));

      if (todayTemps.length > 0) {
        if (!todayTmn) todayTmn = String(Math.round(Math.min(...todayTemps)));
        if (!todayTmx) todayTmx = String(Math.round(Math.max(...todayTemps)));
      }
    }

    return {
      current,
      hourly,
      today: {
        tmn: todayTmn || '15',
        tmx: todayTmx || '25',
      },
    };
  }

  async getMidForecast(regIdLand: string, regIdTemp: string) {
    const rawKey = process.env.DATA_API_KEY_2;
    if (!rawKey) throw new Error('DATA_API_KEY_2 is not configured');
    const serviceKey = rawKey.includes('%') ? decodeURIComponent(rawKey) : rawKey;
    const tmFc = this.getMidTermBase(this.getKSTDate());

    const landUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regIdLand}&tmFc=${tmFc}`;

    const tempUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regIdTemp}&tmFc=${tmFc}`;

    const stnId = this.getStnId(regIdLand);
    const outlookUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=10&dataType=JSON&stnId=${stnId}&tmFc=${tmFc}`;

    const [landRes, tempRes, outlookRes] = await Promise.all([
      fetch(landUrl),
      fetch(tempUrl),
      fetch(outlookUrl).catch(() => null),
    ]);

    if (!landRes.ok || !tempRes.ok) {
      throw new Error(`Public Data Portal response not OK. Land: ${landRes.status}, Temp: ${tempRes.status}`);
    }

    const [landData, tempData] = await Promise.all([landRes.json(), tempRes.json()]);

    const landHeader = landData?.response?.header;
    const tempHeader = tempData?.response?.header;

    if (landHeader?.resultCode !== '00' || tempHeader?.resultCode !== '00') {
      throw new Error(`MidTerm forecast failed (Land: ${landHeader?.resultMsg}, Temp: ${tempHeader?.resultMsg})`);
    }

    const landItem = landData?.response?.body?.items?.item?.[0];
    const tempItem = tempData?.response?.body?.items?.item?.[0];

    if (!landItem || !tempItem) {
      throw new Error('No mid-term data found');
    }

    let outlookText = '';
    if (outlookRes && outlookRes.ok) {
      try {
        const outlookData = await outlookRes.json();
        if (outlookData?.response?.header?.resultCode === '00') {
          const outlookItem = outlookData?.response?.body?.items?.item?.[0];
          outlookText = outlookItem?.wfSv || '';
        }
      } catch (e) {
        console.error('Failed to parse getMidFcst data', e);
      }
    }

    const baseDateStr = tmFc.substring(0, 8);
    const yyyy = parseInt(baseDateStr.substring(0, 4));
    const mm = parseInt(baseDateStr.substring(4, 6)) - 1;
    const dd = parseInt(baseDateStr.substring(6, 8));
    const baseDate = new Date(yyyy, mm, dd);

    const weeklyForecast: any[] = [];

    for (let day = 3; day <= 10; day++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setDate(baseDate.getDate() + day);

      const month = String(forecastDate.getMonth() + 1).padStart(2, '0');
      const dateVal = String(forecastDate.getDate()).padStart(2, '0');
      const dateStr = `${month}.${dateVal}`;

      const dayOfWeekList = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = dayOfWeekList[forecastDate.getDay()];

      let rainAm = '';
      let rainPm = '';
      let wfAm = '';
      let wfPm = '';
      let rain = '';
      let wf = '';

      if (day <= 7) {
        rainAm = String(landItem[`rnSt${day}Am`] ?? '0');
        rainPm = String(landItem[`rnSt${day}Pm`] ?? '0');
        wfAm = landItem[`wf${day}Am`] ?? '';
        wfPm = landItem[`wf${day}Pm`] ?? '';
      } else {
        rain = String(landItem[`rnSt${day}`] ?? '0');
        wf = landItem[`wf${day}`] ?? '';
      }

      const minTemp = tempItem[`taMin${day}`] ?? '15';
      const maxTemp = tempItem[`taMax${day}`] ?? '25';

      weeklyForecast.push({
        day,
        date: dateStr,
        dayOfWeek,
        minTemp,
        maxTemp,
        rainAm,
        rainPm,
        wfAm,
        wfPm,
        rain,
        wf,
      });
    }

    return {
      forecast: weeklyForecast,
      outlook: outlookText,
    };
  }

  private async fetchMetalData(serviceKey: string, stationcode: string, dateStr: string) {
    const url = `http://apis.data.go.kr/1480523/MetalMeasuringResultService/MetalService?ServiceKey=${encodeURIComponent(
      serviceKey,
    )}&pageNo=1&numOfRows=10&resultType=json&date=${dateStr}&stationcode=${stationcode}&timecode=RH02`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`NIER MetalService response not OK: ${res.status}`);
    }

    const text = await res.text();
    if (text.trim().startsWith('<')) {
      throw new Error('Public portal returned XML error');
    }

    return JSON.parse(text);
  }

  async getDustMetalData(stationcode: string) {
    const rawKey = process.env.DATA_API_KEY_1;
    if (!rawKey) throw new Error('DATA_API_KEY_1 is not configured');
    const serviceKey = rawKey.includes('%') ? decodeURIComponent(rawKey) : rawKey;
    const kst = this.getKSTDate();

    const yyyy = kst.getFullYear();
    const mm = String(kst.getMonth() + 1).padStart(2, '0');
    const dd = String(kst.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    let data;
    let items: any[] = [];

    try {
      data = await this.fetchMetalData(serviceKey, stationcode, dateStr);
      if (data?.response?.header?.resultCode === '00') {
        items = data?.response?.body?.items?.item || [];
      }
    } catch (e) {
      console.warn('Dust metal current fetch failed, fallback to yesterday', e);
    }

    if (items.length === 0) {
      const yesterday = new Date(kst);
      yesterday.setDate(yesterday.getDate() - 1);
      const yyyyY = yesterday.getFullYear();
      const mmY = String(yesterday.getMonth() + 1).padStart(2, '0');
      const ddY = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${yyyyY}${mmY}${ddY}`;

      try {
        data = await this.fetchMetalData(serviceKey, stationcode, yesterdayStr);
        if (data?.response?.header?.resultCode === '00') {
          items = data?.response?.body?.items?.item || [];
        }
      } catch (e) {
        console.error('Yesterday dust metal fetch failed:', e);
      }
    }

    if (items.length === 0) {
      throw new Error('No dust metal data available for last 2 days');
    }

    const METAL_MAP: Record<string, { name: string; symbol: string; safeMax: number }> = {
      '90303': { name: '납', symbol: 'Pb', safeMax: 500 },
      '90304': { name: '니켈', symbol: 'Ni', safeMax: 20 },
      '90305': { name: '망간', symbol: 'Mn', safeMax: 150 },
      '90306': { name: '아연', symbol: 'Zn', safeMax: 1000 },
      '90311': { name: '칼슘', symbol: 'Ca', safeMax: 5000 },
      '90312': { name: '칼슘', symbol: 'Ca', safeMax: 5000 },
      '90313': { name: '칼륨', symbol: 'K', safeMax: 3000 },
      '90314': { name: '칼륨', symbol: 'K', safeMax: 3000 },
      '90318': { name: '황', symbol: 'S', safeMax: 4000 },
      '90319': { name: '황', symbol: 'S', safeMax: 4000 },
    };

    return items.map((item: any) => {
      const sdate = item.sdate || item.dataTime || '';
      const valueStr = item.value !== undefined ? item.value : item.msrValue;
      const value = valueStr === '-' || valueStr === null || valueStr === undefined ? null : parseFloat(valueStr);
      const code = String(item.itemcode || item.itemCode || '');

      const mapping = METAL_MAP[code] || { name: `미확인(${code})`, symbol: 'Etc', safeMax: 100 };

      return {
        date: sdate,
        stationCode: item.stationcode !== undefined ? String(item.stationcode) : String(item.stationCode || ''),
        itemCode: code,
        itemName: mapping.name,
        symbol: mapping.symbol,
        value,
        unit: 'ng/m³',
        safeMax: mapping.safeMax,
        timeCode: item.timecode || item.timeCode || 'RH02',
      };
    });
  }
}
