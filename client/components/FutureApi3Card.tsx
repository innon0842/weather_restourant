import React, { useEffect, useState } from "react";
import { Link2, Info } from "lucide-react";
import { CityInfo } from "@/app/utils/weatherUtils";

interface FutureApi3CardProps {
  city: CityInfo;
}

export function FutureApi3Card({ city }: FutureApi3CardProps) {
  const [loading, setLoading] = useState(false);

  // 시뮬레이션: 지역 변경 시 데이터 갱신 효과
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <article className="bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-5 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-400">추가 연동 API 3 (확장 Slot)</span>
        <Link2 className="w-3.5 h-3.5 text-slate-300" />
      </div>

      {loading ? (
        <div className="flex items-center gap-1.5 py-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
          <span className="text-[10px] text-slate-400 font-bold">필터링 적용 중...</span>
        </div>
      ) : (
        <div className="mt-2.5 space-y-1">
          <span className="block text-2xl font-black text-slate-400 tracking-tight">API Slot 3</span>
          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>선택 지역: <strong className="text-indigo-500 font-extrabold">{city.name}</strong> 기준 필터링 대기 중</span>
          </div>
        </div>
      )}
    </article>
  );
}
