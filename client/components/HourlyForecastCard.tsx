import React, { useRef } from "react";
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, ChevronLeft, ChevronRight } from "lucide-react";

interface HourlyForecastItem {
  date: string;
  time: string;
  temp: string;
  sky: string;
  pty: string;
  pop: string;
  reh: string;
  wsd: string;
}

interface HourlyForecastCardProps {
  hourlyData: HourlyForecastItem[] | null;
}

// 날씨 아이콘 선택
function getWeatherIcon(sky: string | undefined, pty: string | undefined, className = "w-6 h-6") {
  const p = pty || "0";
  const s = sky || "1";

  if (p === "1") return <CloudRain className={`${className} text-blue-400`} />;
  if (p === "2") return <CloudRain className={`${className} text-indigo-300`} />;
  if (p === "3") return <CloudSnow className={`${className} text-sky-200 animate-pulse`} />;
  if (p === "4") return <CloudRain className={`${className} text-blue-500`} />;

  if (s === "1") return <Sun className={`${className} text-amber-400`} />;
  if (s === "3") return <CloudSun className={`${className} text-zinc-400`} />;
  return <Cloud className={`${className} text-zinc-400`} />;
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

export function HourlyForecastCard({ hourlyData }: HourlyForecastCardProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!hourlyData || hourlyData.length === 0) return null;

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmt = 260;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-slate-800 tracking-tight">시간별 예보</h3>
        
        {/* 슬라이드 화살표 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollSlider("left")}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-slate-600 transition focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollSlider("right")}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-slate-600 transition focus:outline-none cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={sliderRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
      >
        {hourlyData.map((hData) => {
          const hourVal = parseInt(hData.time.substring(0, 2));
          const ampm = hourVal < 12 ? "오전" : "오후";
          const formattedHour = `${ampm} ${hourVal === 0 || hourVal === 12 ? 12 : hourVal % 12}시`;
          const desc = getWeatherDesc(hData.sky, hData.pty);
          const isRainy = parseInt(hData.pop || "0") >= 50;

          return (
            <div
              key={`${hData.date}_${hData.time}`}
              className="bg-white border border-zinc-100/80 rounded-2xl py-4 px-5 min-w-[96px] flex flex-col items-center justify-between text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] snap-start"
            >
              <span className="text-[10px] font-bold text-slate-400 leading-none">{formattedHour}</span>
              <div className="my-3 scale-[1.1]">
                {getWeatherIcon(hData.sky, hData.pty, "w-6 h-6")}
              </div>
              <span className="text-base font-extrabold text-slate-800 leading-none">{hData.temp}°C</span>
              <span className="text-[10px] font-bold text-slate-500 mt-2 leading-none">
                {isRainy ? `${hData.pop}%` : desc}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
