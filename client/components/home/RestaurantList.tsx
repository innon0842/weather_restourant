/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React from 'react';
import { MapPin, RotateCw, Compass, AlertCircle, Utensils } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { CityInfo } from '../../app/utils/weatherUtils';
import { WeatherState } from '../../hooks/useWeatherState';
import { getRestaurantImageUrl, getScoreBadgeStyles } from '../../app/utils/constants';
import Link from 'next/link';

interface RestaurantListProps {
  theme: any;
  isBottomExpanded: boolean;
  setIsBottomExpanded: (val: boolean) => void;
  selectedCity: CityInfo;
  weatherState: WeatherState;
  handleRefreshLocation: () => void;
  loading: boolean;
  error: string | null;
  recommendations: Restaurant[];
  selectedRestaurant: Restaurant | null;
  handleSelectRestaurant: (rest: Restaurant) => void;
  user?: any;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  theme,
  isBottomExpanded,
  setIsBottomExpanded,
  selectedCity,
  weatherState,
  handleRefreshLocation,
  loading,
  error,
  recommendations,
  selectedRestaurant,
  handleSelectRestaurant,
  user
}) => {
  const handleBottomScroll = (e: React.UIEvent<HTMLElement>) => {
    if (window.innerWidth >= 768) return;
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 10 && !isBottomExpanded) {
      setIsBottomExpanded(true);
    } else if (scrollTop <= 0 && isBottomExpanded) {
      setIsBottomExpanded(false);
    }
  };

  return (
    <section 
      className={`bg-white/95 border-zinc-200 backdrop-blur-md z-25 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        fixed bottom-0 left-0 right-0 border-t rounded-t-[28px] shadow-2xl ${isBottomExpanded ? "h-[75vh]" : "h-[25vh]"}
        md:absolute md:top-[144px] md:bottom-6 md:left-6 md:right-auto md:w-[410px] md:h-auto md:max-h-[calc(100vh-170px)] md:rounded-2xl md:border md:border-zinc-200/80 md:shadow-2xl`}
    >
      <div 
        onClick={() => setIsBottomExpanded(!isBottomExpanded)}
        className="w-full py-3 md:hidden shrink-0 cursor-pointer flex items-center justify-center hover:bg-zinc-50/40 active:bg-zinc-100/50 transition duration-150"
      >
        <div className="w-12 h-1 bg-zinc-300 rounded-full" />
      </div>

      <div 
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsBottomExpanded(!isBottomExpanded);
          }
        }}
        className={`px-5 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0 select-none cursor-pointer md:cursor-default bg-gradient-to-b ${theme.name === 'evening' ? 'from-zinc-950/5' : theme.name === 'rainy' ? 'from-sky-500/5' : 'from-amber-500/5'} to-transparent`}
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-750">
          <MapPin className={`w-3.5 h-3.5 ${theme.text} shrink-0`} />
          <span className="font-extrabold text-zinc-850">{selectedCity.name}</span>
          <span className="text-zinc-300">|</span>
          <span>{loading ? "날씨를 불러오는 중이에요!" : `${weatherState.temp}°C ${weatherState.desc}`}</span>
        </div>
        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          {!loading && (
            <span className="text-[10px] text-amber-600 font-bold">
              미세먼지 {weatherState.pm10Grade}
            </span>
          )}
          <button 
            onClick={handleRefreshLocation}
            title="위치 갱신"
            className="p-1 hover:bg-zinc-100 rounded transition text-zinc-450 hover:text-zinc-750 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div 
        onScroll={handleBottomScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-2">
            <RotateCw className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-bold">오늘 날씨 맞춤 맛집 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : !recommendations || recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 text-center px-4">
            <Compass className="w-8 h-8 text-zinc-300 mb-2" />
            <span className="text-xs font-bold text-zinc-500">주변 탐색 반경 내 매칭된 식당이 없습니다.</span>
            <p className="text-[10px] text-zinc-400 mt-1">반경을 확장해 탐색을 진행해 보세요.</p>
          </div>
        ) : (
          <div className="relative pb-4 flex flex-col gap-3">
            {recommendations.map((rest, index) => {
              // Paywall logic
              if (!user && index >= 14) return null; // Don't render beyond 14th
              const isPaywalled = !user && index >= 11; // Blur 12th~14th

              return (
                <article
                  key={rest.id}
                  onClick={() => !isPaywalled && handleSelectRestaurant(rest)}
                  className={`p-3.5 rounded-2xl border transition flex space-x-3.5 relative overflow-hidden group ${
                    isPaywalled
                      ? "bg-white border-zinc-100 blur-[4px] opacity-60 pointer-events-none select-none"
                      : selectedRestaurant?.id === rest.id
                        ? `bg-zinc-50/80 ${theme.borderAccent} shadow-sm ${theme.shadow} cursor-pointer`
                        : "bg-white border-zinc-100 hover:bg-zinc-50/40 hover:border-zinc-200/80 cursor-pointer"
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-50 relative border border-zinc-100">
                    {rest.imageUrl || rest.category ? (
                      <img 
                        src={getRestaurantImageUrl(rest.imageUrl, rest.category)} 
                        alt={rest.name} 
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-350" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = getRestaurantImageUrl('', rest.category);
                          if (e.currentTarget.src !== window.location.origin + fallback && e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between space-x-1">
                        <h2 className="font-bold text-sm text-zinc-800 truncate group-hover:text-amber-600 transition">
                          {rest.name}
                        </h2>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${getScoreBadgeStyles(rest.matchScore)}`}>
                          {rest.matchScore}점
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-450 mt-0.5">{rest.category} • {rest.address}</p>
                    </div>

                    <div className="mt-2 flex flex-col space-y-1">
                      <div className="text-[10px] font-semibold text-amber-600 flex items-center space-x-1">
                        <span className="shrink-0 bg-amber-500/10 px-1 rounded text-[8px] border border-amber-500/20">추천이유</span>
                        <span className="truncate">{rest.matchReason}</span>
                      </div>
                      <div className="text-[9px] text-zinc-400 font-semibold">
                        내 위치에서 {rest.distance.toFixed(2)}km 거리에 위치
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {!user && recommendations.length > 11 && (
              <div className="absolute bottom-0 left-0 right-0 h-[280px] bg-gradient-to-t from-white/95 via-white/80 to-transparent flex flex-col items-center justify-end pb-[120px] z-10 pointer-events-auto">
                <p className="text-zinc-700 font-bold mb-3 text-sm drop-shadow-sm">더 많은 추천 맛집을 확인하시려면?</p>
                <Link href="/login" className={`px-6 py-3 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition ${theme.bg} ${theme.bgHover}`}>
                  로그인하고 전체 리스트 보기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
