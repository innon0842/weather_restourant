import React from "react";
import { Calendar, ChevronRight, Sun, CloudSun, Cloud, CloudRain, CloudSnow } from "lucide-react";

interface MidWeatherItem {
  day: number;
  date: string;
  dayOfWeek: string;
  minTemp: string;
  maxTemp: string;
  rainAm: string;
  rainPm: string;
  wfAm: string;
  wfPm: string;
  rain: string;
  wf: string;
}

interface WeeklyForecastCardProps {
  midWeather: MidWeatherItem[] | null;
  outlook?: string;
  showWeekly: boolean;
  onToggleExpand: () => void;
}

// 주간 예보용 날씨 아이콘 선택 헬퍼
function getMidWeatherIcon(wf: string | undefined, className = "w-5 h-5") {
  const desc = wf || "";
  if (desc.includes("비") || desc.includes("소나기")) {
    return <CloudRain className={`${className} text-blue-400`} />;
  }
  if (desc.includes("눈")) {
    return <CloudSnow className={`${className} text-sky-200 animate-pulse`} />;
  }
  if (desc.includes("진눈깨비")) {
    return <CloudRain className={`${className} text-indigo-300`} />;
  }
  if (desc.includes("구름많음") || desc.includes("구름")) {
    return <CloudSun className={`${className} text-zinc-400`} />;
  }
  if (desc.includes("맑음")) {
    return <Sun className={`${className} text-amber-400`} />;
  }
  return <Cloud className={`${className} text-zinc-400`} />;
}

export function WeeklyForecastCard({ midWeather, outlook, showWeekly, onToggleExpand }: WeeklyForecastCardProps) {
  if (!midWeather || midWeather.length === 0) return null;

  // 주간 최저/최고 온도 편차 계산 (바 시각화용)
  const getWeeklyTempRange = () => {
    const mins = midWeather.map((d) => parseInt(d.minTemp));
    const maxs = midWeather.map((d) => parseInt(d.maxTemp));
    return {
      min: Math.min(...mins) - 2,
      max: Math.max(...maxs) + 2
    };
  };

  const weeklyRange = getWeeklyTempRange();

  return (
    <section className="mt-4">
      <button
        onClick={onToggleExpand}
        className="w-full bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-2xl py-3 px-6 flex items-center justify-between text-sm font-bold text-slate-700 shadow-sm transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span>중기 (주간) 예보 {showWeekly ? "접기" : "자세히 보기"}</span>
        </div>
        <ChevronRight className={`w-4 h-4 transform transition-transform ${showWeekly ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {showWeekly && (
        <div className="bg-white/70 backdrop-blur-md border border-zinc-200/80 border-t-0 rounded-b-2xl p-6 shadow-inner space-y-4 animate-fade-in">
          {outlook && (
            <div className="bg-slate-50 border border-zinc-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 mb-4 flex gap-2">
              <span className="text-sky-500 font-extrabold shrink-0">[종합 전망]</span>
              <p className="leading-relaxed">{outlook}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {midWeather.map((dayData) => {
              const tempSpanLeft = ((parseInt(dayData.minTemp) - weeklyRange.min) / (weeklyRange.max - weeklyRange.min)) * 100;
              const tempSpanWidth = ((parseInt(dayData.maxTemp) - parseInt(dayData.minTemp)) / (weeklyRange.max - weeklyRange.min)) * 100;

              return (
                <div
                  key={dayData.day}
                  className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-b-0 gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 font-semibold"
                >
                  <div className="w-12 sm:w-16 shrink-0">
                    <span className="block font-bold">{dayData.dayOfWeek}요일</span>
                    <span className="block text-[9px] sm:text-[10px] text-slate-400">{dayData.date}</span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 w-[84px] xs:w-28 shrink-0">
                    {dayData.day <= 7 ? (
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span title={`오전: ${dayData.wfAm}`}>
                          {getMidWeatherIcon(dayData.wfAm, "w-4 h-4 sm:w-4.5 sm:h-4.5")}
                        </span>
                        <span title={`오후: ${dayData.wfPm}`}>
                          {getMidWeatherIcon(dayData.wfPm, "w-4 h-4 sm:w-4.5 sm:h-4.5")}
                        </span>
                      </div>
                    ) : (
                      <span title={dayData.wf} className="shrink-0">
                        {getMidWeatherIcon(dayData.wf, "w-5 h-5 sm:w-5.5 sm:h-5.5")}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                      {dayData.day <= 7 ? dayData.wfAm : dayData.wf}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end select-none">
                    <span className="text-[11px] sm:text-xs text-slate-400 w-5 sm:w-6 text-right font-medium">{dayData.minTemp}°</span>
                    <div className="h-1.5 bg-slate-100 rounded-full w-10 xs:w-14 sm:w-24 relative overflow-hidden shrink-0">
                      <div
                        style={{ left: `${tempSpanLeft}%`, width: `${tempSpanWidth}%` }}
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-teal-400 to-amber-300 rounded-full"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold w-5 sm:w-6 text-right">{dayData.maxTemp}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
