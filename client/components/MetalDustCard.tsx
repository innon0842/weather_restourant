import React from "react";

// 동적 원형 게이지 컴포넌트
interface CircularGaugeProps {
  value: number | null;
  max: number;
  label: string;
  gradeLabel: string;
  colorClass: string;
}

function CircularGauge({ value, max, label, gradeLabel, colorClass }: CircularGaugeProps) {
  const safeValue = value || 0;
  const radius = 32;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(safeValue, max) / max) * circumference;

  const getBadgeClasses = (cls: string) => {
    if (cls.includes("text-sky-500")) return "bg-sky-50 border-sky-200 text-sky-600";
    if (cls.includes("text-emerald-500")) return "bg-emerald-50 border-emerald-200 text-emerald-600";
    if (cls.includes("text-amber-500")) return "bg-amber-50 border-amber-200 text-amber-600";
    if (cls.includes("text-rose-500")) return "bg-rose-50 border-rose-200 text-rose-600";
    return "bg-zinc-50 border-zinc-200 text-zinc-600";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-[72px] h-[72px]">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#e4e4e7" // zinc-200
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${colorClass} transition-all duration-700`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-black tracking-tight text-slate-800 leading-none">
            {value !== null ? value : "-"}
          </span>
          <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none">
            {label}
          </span>
        </div>
      </div>
      <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 mt-1 border ${getBadgeClasses(colorClass)}`}>
        {gradeLabel}
      </span>
    </div>
  );
}

interface MetalItem {
  date: string;
  stationCode: string;
  itemCode: string;
  itemName: string;
  symbol: string;
  value: number | null;
  unit: string;
  safeMax: number;
  timeCode: string;
}

interface MetalDustCardProps {
  dustList: MetalItem[] | null;
}

export function MetalDustCard({ dustList }: MetalDustCardProps) {
  const getMetalData = (symbol: string) => {
    return dustList?.find((m) => m.symbol === symbol) || { value: null, itemName: symbol, unit: "ng/m³", safeMax: 100 };
  };

  const getMetalGrade = (symbol: string, value: number | null): { label: string; colorClass: string } => {
    if (value === null) return { label: "정보 없음", colorClass: "text-zinc-400" };
    if (symbol === "Pb") {
      if (value < 50) return { label: "좋음", colorClass: "text-sky-500" };
      if (value < 150) return { label: "보통", colorClass: "text-emerald-500" };
      if (value < 300) return { label: "나쁨", colorClass: "text-amber-500" };
      return { label: "매우나쁨", colorClass: "text-rose-500" };
    }
    if (symbol === "Zn") {
      if (value < 150) return { label: "좋음", colorClass: "text-sky-500" };
      if (value < 300) return { label: "보통", colorClass: "text-emerald-500" };
      if (value < 600) return { label: "나쁨", colorClass: "text-amber-500" };
      return { label: "매우나쁨", colorClass: "text-rose-500" };
    }
    if (value < 100) return { label: "좋음", colorClass: "text-sky-500" };
    if (value < 250) return { label: "보통", colorClass: "text-emerald-500" };
    return { label: "나쁨", colorClass: "text-amber-500" };
  };

  const pbData = getMetalData("Pb");
  const znData = getMetalData("Zn");

  return (
    <article className="bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold text-slate-500">미세먼지</span>
        {dustList && dustList.length > 0 && (
          <span className="text-[10px] text-slate-400 font-bold">
            측정 기준: {dustList[0]?.date ? `${dustList[0].date.substring(4,6)}.${dustList[0].date.substring(6,8)}` : "--"}
          </span>
        )}
      </div>

      {dustList && dustList.length > 0 ? (
        <div className="space-y-3">
          {/* 대표 금속 원형 게이지 2개 */}
          <div className="flex items-center justify-around py-1 border-b border-zinc-100 pb-3">
            <CircularGauge
              value={pbData.value}
              max={500}
              label="Pb (납)"
              gradeLabel={getMetalGrade("Pb", pbData.value).label}
              colorClass={getMetalGrade("Pb", pbData.value).colorClass}
            />
            <CircularGauge
              value={znData.value}
              max={1000}
              label="Zn (아연)"
              gradeLabel={getMetalGrade("Zn", znData.value).label}
              colorClass={getMetalGrade("Zn", znData.value).colorClass}
            />
          </div>

          {/* 나머지 금속 성분 상세 목록 */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-slate-600 font-bold px-1 max-h-[82px] overflow-y-auto">
            {dustList
              .filter((m) => m.symbol !== "Pb" && m.symbol !== "Zn")
              .map((m) => (
                <div key={m.symbol} className="flex justify-between border-b border-zinc-50 pb-0.5">
                  <span className="text-slate-400">{m.itemName} ({m.symbol})</span>
                  <span className="text-slate-700">{m.value !== null ? `${m.value} ${m.unit}` : "-"}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-400 text-[10px] py-4">조회 실패</p>
      )}
    </article>
  );
}
