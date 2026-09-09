/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Utensils, Clock, User as UserIcon } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { User } from '../../types/user';
import { TAG_TRANSLATION, getRestaurantImageUrl } from '../../app/utils/constants';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface RestaurantDetailPanelProps {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (rest: Restaurant | null) => void;
  theme: any;
  user?: User | null;
  children: React.ReactNode; // For ReservationForm
}

export const RestaurantDetailPanel: React.FC<RestaurantDetailPanelProps> = ({
  selectedRestaurant, setSelectedRestaurant, theme, user, children
}) => {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!selectedRestaurant) return null;

  return (
    <>
      <div 
        onClick={() => setSelectedRestaurant(null)}
        className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
      />
      <div className="animate-slide-up fixed md:absolute bottom-0 md:bottom-6 left-0 md:left-auto right-0 md:right-6 top-auto md:top-6 h-[82vh] md:h-auto md:w-96 bg-white/98 border border-zinc-200/80 rounded-t-[28px] md:rounded-2xl shadow-2xl backdrop-blur-md z-50 md:z-50 flex flex-col overflow-hidden text-zinc-800">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto my-3 md:hidden shrink-0" />
        <div className="h-44 bg-zinc-100 relative shrink-0">
          {selectedRestaurant.imageUrl || selectedRestaurant.category ? (
            <img 
              src={getRestaurantImageUrl(selectedRestaurant.imageUrl, selectedRestaurant.category)} 
              alt={selectedRestaurant.name} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fallback = getRestaurantImageUrl('', selectedRestaurant.category);
                if (e.currentTarget.src !== window.location.origin + fallback && e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Utensils className="w-12 h-12 text-zinc-350" />
            </div>
          )}
          
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 border border-zinc-200/80 backdrop-blur rounded-full text-xs font-black flex items-center space-x-1.5 shadow-sm">
            <span className={`${theme.text}`}>날씨 매칭 점수</span>
            <span className="text-zinc-900">{selectedRestaurant.matchScore}점</span>
          </div>

          <button
            onClick={() => setSelectedRestaurant(null)}
            className="absolute top-4 right-4 p-1.5 bg-white/90 hover:bg-zinc-100 border border-zinc-200/80 rounded-full text-zinc-400 hover:text-zinc-800 backdrop-blur transition shadow-sm"
          >
            <span className="text-sm font-bold block w-4 h-4 leading-none">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black ${theme.accentText} ${theme.accentBg} px-2 py-0.5 border ${theme.accentBorder} rounded`}>
                {selectedRestaurant.category}
              </span>
              
              <a 
                href={`https://place.map.kakao.com/${selectedRestaurant.apiPlaceId.replace('kakao_', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1 px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[10px] font-bold ${theme.text} transition`}
              >
                <span>카카오맵 상세 정보</span>
                <span className="text-[9px]">↗</span>
              </a>
            </div>
            <h2 className="text-lg font-black text-zinc-900 mt-1">{selectedRestaurant.name}</h2>
            <p className="text-xs text-zinc-500 mt-1">{selectedRestaurant.address}</p>
            <p className="text-xs text-zinc-400 mt-0.5">전화번호: {selectedRestaurant.phone || "제공 안됨"}</p>

            <div className="flex items-start space-x-1.5 mt-2 bg-zinc-50 border border-zinc-100 p-2.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <div className="text-xs text-zinc-650 font-semibold leading-normal">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">영업시간</span>
                {selectedRestaurant.businessHours || (selectedRestaurant.isDetailCached ? "정보 없음" : "상세 정보를 불러오는 중...")}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">매칭 상세 분석</span>
            <p className="text-xs font-semibold text-zinc-700">{selectedRestaurant.matchReason}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedRestaurant.weatherTags?.map((tag) => (
                <span key={tag} className="text-[9px] font-extrabold bg-white border border-zinc-200 px-2 py-0.5 rounded-full text-zinc-500 shadow-sm">
                  #{TAG_TRANSLATION[tag] || tag}
                </span>
              ))}
            </div>
          </div>

          {selectedRestaurant.photoUrls && selectedRestaurant.photoUrls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-100 relative">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">매장 사진</span>
              
              {!user ? (
                <div className="flex justify-center py-3">
                  <button 
                    onClick={() => router.push('/login')}
                    className={`px-4 py-2 rounded-full text-[11px] font-black shadow-md flex items-center space-x-1.5 transition-all duration-300 border border-white/20 cursor-pointer ${theme.bg} ${theme.bgHover} text-white hover:scale-105`}
                  >
                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>로그인하고 사진 보기</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-200">
                  {selectedRestaurant.photoUrls.map((url, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedPhoto(url)}
                      className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-zinc-100 bg-zinc-50 cursor-pointer"
                    >
                      <img 
                        src={url} 
                        alt={`${selectedRestaurant.name} 사진 ${idx + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedRestaurant.menus && selectedRestaurant.menus.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-100 relative">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">대표 메뉴</span>
              
              {!user ? (
                <div className="flex justify-center py-3">
                  <button 
                    onClick={() => router.push('/login')}
                    className={`px-4 py-2 rounded-full text-[11px] font-black shadow-md flex items-center space-x-1.5 transition-all duration-300 border border-white/20 cursor-pointer ${theme.bg} ${theme.bgHover} text-white hover:scale-105`}
                  >
                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>로그인하고 메뉴/가격 보기</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedRestaurant.menus.map((menu, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs">
                      <div className="flex items-center space-x-2">
                        {menu.imageUrl && (
                          <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-zinc-100 bg-white">
                            <img 
                              src={menu.imageUrl} 
                              alt={menu.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.style.display = 'none';
                                }
                              }}
                            />
                          </div>
                        )}
                        <span className="font-bold text-zinc-800">{menu.name}</span>
                      </div>
                      <span className="font-black text-rose-500">{menu.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Children is ReservationForm */}
          {children}
        </div>
      </div>
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-[110] text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors font-black text-xl cursor-pointer"
            >
              &times;
            </button>
            <img 
              src={selectedPhoto}
              alt="확대된 매장 사진"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
