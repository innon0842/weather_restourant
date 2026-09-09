/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { RotateCw, Map as MapIcon } from 'lucide-react';
import { CgProfile } from 'react-icons/cg';
import { Restaurant } from '../../types/restaurant';
import { User } from '../../types/user';
import { getCategoryIconSvg, getScoreThemeClasses } from '../../app/utils/constants';
import Image from 'next/image';

interface KakaoMapContainerProps {
  mapContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  kakaoLoaded: boolean;
  kakaoMapInstance: any;
  showSearchThisArea: boolean;
  handleSearchThisArea: () => void;
  theme: any;
  user: User | null;
  apiUrl: string;
  userCoords: { lat: number; lon: number };
  searchCenter: { lat: number; lon: number };
  radius: number;
  recommendations: Restaurant[];
  selectedRestaurant: Restaurant | null;
  handleSelectRestaurant: (rest: Restaurant) => void;
}

export const KakaoMapContainer: React.FC<KakaoMapContainerProps> = ({
  mapContainerRef,
  kakaoLoaded,
  kakaoMapInstance,
  showSearchThisArea,
  handleSearchThisArea,
  theme,
  user,
  apiUrl,
  userCoords,
  searchCenter,
  radius,
  recommendations,
  selectedRestaurant,
  handleSelectRestaurant
}) => {
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (!kakaoMapInstance || !window.kakao) return;

    mapMarkers.forEach(m => m.setMap(null));
    const newMarkers: any[] = [];

    const userPos = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lon);
    
    const searchPos = new window.kakao.maps.LatLng(searchCenter.lat, searchCenter.lon);

    const userOverlayContent = document.createElement('div');
    const avatarUrl = user?.profileImageUrl 
      ? (user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `${apiUrl}${user.profileImageUrl}`)
      : null;

    if (avatarUrl) {
      userOverlayContent.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="relative w-9 h-9 border-2 border-white rounded-full shadow-lg overflow-hidden flex items-center justify-center bg-zinc-100">
            <img src="${avatarUrl}" class="w-full h-full object-cover" />
          </div>
        </div>
      `;
    } else {
      userOverlayContent.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="relative p-1.5 bg-blue-600 border-2 border-white rounded-full shadow-lg text-white flex items-center justify-center">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </div>
        </div>
      `;
    }

    const userMarker = new window.kakao.maps.CustomOverlay({
      position: userPos,
      content: userOverlayContent,
      xAnchor: 0.5,
      yAnchor: 0.5
    });
    userMarker.setMap(kakaoMapInstance);
    newMarkers.push(userMarker);

    recommendations.forEach((rest) => {
      const pos = new window.kakao.maps.LatLng(rest.lat, rest.lon);
      const isSelected = selectedRestaurant?.id === rest.id;

      const scoreStyle = getScoreThemeClasses(rest.matchScore, isSelected, theme.name);
      const scaleClass = isSelected ? 'scale-125 z-30' : 'hover:scale-105';

      const overlayEl = document.createElement('div');
      overlayEl.className = `transform transition-all duration-200 ${scaleClass}`;
      overlayEl.style.pointerEvents = 'none';
      overlayEl.innerHTML = `
        <div class="relative flex flex-col items-center" style="pointer-events: none;">
          <div class="circle-btn pointer-events-auto cursor-pointer p-1.5 rounded-full flex items-center justify-center ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}">
            ${getCategoryIconSvg(rest.category)}
          </div>
          <span class="text-[8px] font-black mt-0.5 px-1.5 py-0.5 rounded bg-white/95 border border-zinc-200/80 text-zinc-700 whitespace-nowrap shadow-sm" style="pointer-events: none;">
            ${rest.name}
          </span>
        </div>
      `;

      const marker = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: overlayEl,
        xAnchor: 0.5,
        yAnchor: 0.8
      });

      marker.setMap(kakaoMapInstance);

      const circleBtn = overlayEl.querySelector('.circle-btn');
      circleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectRestaurant(rest);
      });

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);
  }, [recommendations, kakaoMapInstance, userCoords, searchCenter, radius, selectedRestaurant, theme]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      {showSearchThisArea && (
        <button
          type="button"
          onClick={handleSearchThisArea}
          className={`absolute top-[132px] md:top-[140px] left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center space-x-1.5 transition-all duration-300 animate-fade-in border border-white/20 backdrop-blur-sm cursor-pointer ${theme.bg} ${theme.bgHover} text-white`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>이 위치에서 재검색</span>
        </button>
      )}

      {!kakaoLoaded && (
        <div className="absolute inset-0 z-10 bg-zinc-50 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <circle cx="50%" cy="50%" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                <circle cx="50%" cy="50%" r="350" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
              </svg>
            </div>

            <div className="relative w-[500px] h-[500px] border border-zinc-200 rounded-full flex items-center justify-center shadow-xl bg-white/40 backdrop-blur-sm shrink-0">
              {(() => {
                const userLatDiff = userCoords.lat - searchCenter.lat;
                const userLonDiff = userCoords.lon - searchCenter.lon;
                const scale = 35000;
                const userTop = 250 - (userLatDiff * scale);
                const userLeft = 250 + (userLonDiff * scale);
                return (
                  <div 
                    style={{ position: 'absolute', top: `${userTop}px`, left: `${userLeft}px` }}
                    className="z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  >
                    <div className="relative p-0.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20 border border-white text-white flex items-center justify-center w-9 h-9 overflow-hidden">
                      {user && user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `${apiUrl}${user.profileImageUrl}`} 
                          alt={user.nickname}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <CgProfile className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-[10px] font-black tracking-tight text-blue-600 mt-1 bg-white px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                      내 현재 위치
                    </span>
                  </div>
                );
              })()}

              {recommendations.map((rest) => {
                const latDiff = rest.lat - searchCenter.lat;
                const lonDiff = rest.lon - searchCenter.lon;
                const scale = 35000; 
                const topVal = 250 - (latDiff * scale);
                const leftVal = 250 + (lonDiff * scale);

                const isSelected = selectedRestaurant?.id === rest.id;
                const scoreStyle = getScoreThemeClasses(rest.matchScore, isSelected, theme.name);
                const scaleClass = isSelected ? 'scale-125 z-30' : 'hover:scale-105';

                return (
                  <div
                    key={rest.id}
                    onClick={() => handleSelectRestaurant(rest)}
                    style={{ position: 'absolute', top: `${topVal}px`, left: `${leftVal}px` }}
                    className={`z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center transition duration-300 ${scaleClass}`}
                  >
                    <div className={`p-1.5 rounded-full flex items-center justify-center ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}>
                      <div dangerouslySetInnerHTML={{ __html: getCategoryIconSvg(rest.category) }} className="flex items-center justify-center text-current" />
                    </div>
                    <span className={`text-[8px] font-bold mt-1 px-1.5 py-0.5 rounded-md border whitespace-nowrap shadow transition ${
                      isSelected 
                        ? `${theme.bg} text-white border-transparent`
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}>
                      {rest.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-6 right-6 p-4 bg-white border border-zinc-250 rounded-2xl flex items-center space-x-2 text-[10px] z-10 shadow-md">
              <MapIcon className={`w-3.5 h-3.5 ${theme.text}`} />
              <span className="text-zinc-500 font-bold">카카오 지도 모듈 연결 대기 중 (인터렉티브 스케치 맵 가동)</span>
            </div>
        </div>
      )}
    </>
  );
};
