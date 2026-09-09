import React from "react";
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, MapPin } from "lucide-react";

interface WeatherHeroCardProps {
  cityName: string;
  current: {
    temp?: string;
    sky?: string;
    pty?: string;
    pop?: string;
    reh?: string;
    wsd?: string;
  } | null;
  today: {
    tmn?: string;
    tmx?: string;
  } | null;
  dustLabel?: string;
}

// 날씨 아이콘 선택 헬퍼
function getWeatherIcon(sky: string | undefined, pty: string | undefined, className = "w-6 h-6", isWhite = false) {
  const p = pty || "0";
  const s = sky || "1";
  const color = isWhite ? "text-white" : "";

  if (p === "1") return <CloudRain className={`${className} ${color || "text-blue-400"}`} />;
  if (p === "2") return <CloudRain className={`${className} ${color || "text-indigo-300"}`} />;
  if (p === "3") return <CloudSnow className={`${className} ${color || "text-sky-200"} animate-pulse`} />;
  if (p === "4") return <CloudRain className={`${className} ${color || "text-blue-500"}`} />;

  if (s === "1") return <Sun className={`${className} ${color || "text-amber-400"}`} />;
  if (s === "3") return <CloudSun className={`${className} ${color || "text-zinc-400"}`} />;
  return <Cloud className={`${className} ${color || "text-zinc-400"}`} />;
}

// 날씨 설명
function getWeatherDesc(sky: string | undefined, pty: string | undefined): string {
  const p = pty || "0";
  const s = sky || "1";

  if (p === "1") return "비";
  if (p === "2") return "진눈깨비";
  if (p === "3") return "눈";
  if (p === "4") return "소나기";

  if (s === "1") return "맑음";
  if (s === "3") return "구름많음";
  return "흐림";
}

// 지명 변환
function getFullProvinceName(cityName: string): string {
  const mapping: Record<string, string> = {
    "서울": "서울특별시",
    "인천": "인천광역시",
    "부산": "부산광역시",
    "대구": "대구광역시",
    "광주": "광주광역시",
    "대전": "대전광역시",
    "울산": "울산광역시",
    "제주": "제주특별자치도",
    "수원/경기": "경기도 수원시",
    "춘천/영서": "강원특별자치도 춘천시",
    "강릉/영동": "강원특별자치도 강릉시",
    "청주/충북": "충청북도 청주시",
    "전주/전북": "전라북도 전주시",
    "창원/경남": "경상남도 창원시",
    "안동/경북": "경상북도 안동시",
    "홍성/충남": "충청남도 홍성군"
  };
  return mapping[cityName] || `${cityName}특별시/도`;
}

export function WeatherHeroCard({ cityName, current, today, dustLabel }: WeatherHeroCardProps) {
  if (!current) return null;

  const temp = current.temp ?? "--";
  const sky = current.sky;
  const pty = current.pty;
  const pop = current.pop ?? "0";
  const reh = current.reh ?? "0";
  const wsd = current.wsd ?? "0";
  
  const tmn = today?.tmn ?? "--";
  const tmx = today?.tmx ?? "--";
  
  const desc = getWeatherDesc(sky, pty);
  const fullProvince = getFullProvinceName(cityName);

  const getDustText = (label: string) => {
    if (label === "좋음") return "미세먼지 상태 좋아요!";
    if (label === "보통") return "미세먼지 상태 보통이에요!";
    if (label === "나쁨") return "미세먼지 상태 나빠요! 마스크 챙기세요!";
    if (label === "매우나쁨") return "미세먼지 상태 매우 나빠요! 외출을 자제하세요!";
    return `미세먼지 상태: ${label}`;
  };

  const getBackgroundClass = (label: string | undefined) => {
    if (!label) return "from-emerald-50/40 via-blue-50/40 to-indigo-50/40 border-white text-slate-900";
    if (label === "좋음") {
      // 더 진하고 선명하게 보여야 하는 파란색 (텍스트 흰색으로 전환)
      return "from-sky-500 to-blue-600 text-white border-blue-600/20";
    }
    if (label === "보통") {
      return "from-emerald-500 to-teal-600 text-white border-emerald-600/20";
    }
    if (label === "나쁨") {
      return "from-amber-500 to-orange-600 text-white border-amber-600/20";
    }
    if (label === "매우나쁨") {
      return "from-rose-500 to-red-600 text-white border-rose-600/20";
    }
    return "from-slate-500 to-zinc-600 text-white border-slate-600/20";
  };

  const bgClasses = getBackgroundClass(dustLabel);
  const isDarkBg = !!dustLabel;

  return (
    <section className={`bg-gradient-to-r ${bgClasses} backdrop-blur-md border rounded-[32px] p-5 sm:p-8 flex items-center justify-between shadow-sm relative overflow-hidden`}>
      {/* Background glow effects */}
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-2 sm:space-y-3 z-10">
        <h2 className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${isDarkBg ? 'text-white' : 'text-slate-900'}`}>
          {fullProvince}
        </h2>
        <p className={`text-xs sm:text-sm md:text-base font-bold flex flex-wrap items-center gap-1 ${isDarkBg ? 'text-white/80' : 'text-slate-500'}`}>
          <span>{desc},</span>
          <span>어제보다 2도 높아요.</span>
          {dustLabel && (
            <span className={`font-black ${isDarkBg ? 'text-white' : 'text-slate-600'}`}>
              {getDustText(dustLabel)}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 z-10 select-none shrink-0">
        <div className="transform translate-y-0.5">
          {getWeatherIcon(sky, pty, "w-10 h-10 sm:w-16 sm:h-16", isDarkBg)}
        </div>
        <div className="flex items-start">
          <span className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter ${isDarkBg ? 'text-white' : 'text-slate-950'}`}>
            {temp}
          </span>
          <span className={`text-2xl sm:text-3xl md:text-4xl font-bold mt-1 ${isDarkBg ? 'text-white/90' : 'text-slate-900'}`}>°</span>
        </div>
      </div>
    </section>
  );
}
