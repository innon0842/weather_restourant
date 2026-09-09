"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import React, { useState, useRef, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { Navigation, RotateCw, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useWeatherState } from "../../hooks/useWeatherState";
import { useRestaurants } from "../../hooks/useRestaurants";
import { useKakaoMap } from "../../hooks/useKakaoMap";
import { useReservation } from "../../hooks/useReservation";

import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { KakaoMapContainer } from "./KakaoMapContainer";
import { RestaurantList } from "./RestaurantList";
import { RestaurantDetailPanel } from "./RestaurantDetailPanel";
import { ReservationForm } from "./ReservationForm";
import { Restaurant } from "../../types/restaurant";

export function HomeClient() {
  const { user, authLoading, handleLogout, apiUrl } = useAuth(false);
  const { weatherState, setWeatherState, theme } = useWeatherState();
  
  const {
    selectedCity,
    loading,
    error,
    userCoords, setUserCoords,
    searchCenter, setSearchCenter,
    radius, setRadius,
    selectedCategory, setSelectedCategory,
    recommendations, setRecommendations,
    selectedRestaurant, setSelectedRestaurant,
    fetchData
  } = useRestaurants(setWeatherState);

  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { kakaoLoaded, kakaoMapInstance, showSearchThisArea, setShowSearchThisArea } = useKakaoMap(
    mapContainerRef, searchCenter, radius, isBottomExpanded
  );

  const {
    isReserving,
    reservationTime,
    setReservationTime,
    partySize,
    setPartySize,
    reserveSuccess,
    setReserveSuccess,
    reserveError,
    handleCreateReservation
  } = useReservation(selectedRestaurant);

  const [searchQuery, setSearchQuery] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords(coords);
          setSearchCenter(coords);
          fetchData(coords.lat, coords.lon, radius, selectedCategory);
        },
        () => {
          fetchData(37.5665, 126.9780, radius, selectedCategory);
        }
      );
    } else {
      fetchData(37.5665, 126.9780, radius, selectedCategory);
    }
  }, [fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(searchQuery, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const firstResult = data[0];
          const lat = parseFloat(firstResult.y);
          const lon = parseFloat(firstResult.x);
          const coords = { lat, lon };
          setSearchCenter(coords);
          
          if (kakaoMapInstance) {
            const moveLatLng = new window.kakao.maps.LatLng(lat, lon);
            kakaoMapInstance.panTo(moveLatLng);
          }
          
          fetchData(lat, lon, radius, selectedCategory);
        } else {
          alert("검색 결과를 찾을 수 없습니다. 다시 입력해 주세요.");
        }
      });
    } else {
      alert("지도 모듈이 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleFilterChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchData(searchCenter.lat, searchCenter.lon, radius, cat);
  };

  const handleRefreshLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords(coords);
          setSearchCenter(coords);
          fetchData(coords.lat, coords.lon, radius, selectedCategory);
        },
        () => {
          fetchData(searchCenter.lat, searchCenter.lon, radius, selectedCategory);
        }
      );
    }
  };

  const handlePanToUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords(coords);
          setSearchCenter(coords);
          if (kakaoMapInstance && window.kakao) {
            const newPos = new window.kakao.maps.LatLng(coords.lat, coords.lon);
            kakaoMapInstance.panTo(newPos);
          }
          fetchData(coords.lat, coords.lon, radius, selectedCategory);
        },
        () => {
          if (kakaoMapInstance && window.kakao) {
            const newPos = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lon);
            kakaoMapInstance.panTo(newPos);
          }
        }
      );
    } else {
      if (kakaoMapInstance && window.kakao) {
        const newPos = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lon);
        kakaoMapInstance.panTo(newPos);
      }
    }
  };

  const handleSearchThisArea = () => {
    if (!kakaoMapInstance) return;
    const center = kakaoMapInstance.getCenter();
    const newCoords = { lat: center.getLat(), lon: center.getLng() };
    setSearchCenter(newCoords);
    fetchData(newCoords.lat, newCoords.lon, radius, selectedCategory);
    setShowSearchThisArea(false);
  };

  const handleSelectRestaurant = (rest: Restaurant) => {
    setSelectedRestaurant(rest);
    if (kakaoMapInstance && window.kakao) {
      const pos = new window.kakao.maps.LatLng(rest.lat, rest.lon);
      kakaoMapInstance.panTo(pos);
    }

    const token = localStorage.getItem("token");
    fetch(`${apiUrl}/restaurants/${rest.id}/detail`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch detail");
        return res.json();
      })
      .then((detailData) => {
        setSelectedRestaurant((prev) => prev && prev.id === rest.id ? { ...prev, ...detailData } : prev);
        setRecommendations((prevList) =>
          prevList.map((item) => (item.id === rest.id ? { ...item, ...detailData } : item))
        );
      })
      .catch((err) => console.warn("Failed to load restaurant details:", err));

    fetch(`${apiUrl}/restaurants/${rest.id}/click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: user ? user.id : undefined,
        temp: weatherState.temp,
        sky: weatherState.sky,
        pty: weatherState.pty,
        timeOfDay: theme.name,
      }),
    }).catch((err) => console.warn("Failed to log click event:", err));
  };

  return (
    <> 
      <main className="relative flex-1 w-full h-full overflow-hidden">
        
        <KakaoMapContainer 
          mapContainerRef={mapContainerRef}
          kakaoLoaded={kakaoLoaded}
          kakaoMapInstance={kakaoMapInstance}
          showSearchThisArea={showSearchThisArea}
          handleSearchThisArea={handleSearchThisArea}
          theme={theme}
          user={user}
          apiUrl={apiUrl}
          userCoords={userCoords}
          searchCenter={searchCenter}
          radius={radius}
          recommendations={recommendations}
          selectedRestaurant={selectedRestaurant}
          handleSelectRestaurant={handleSelectRestaurant}
        />

        {!user && !authLoading && (
          <div className="absolute top-[76px] md:top-6 right-4 md:right-6 z-40 animate-fade-in">
            <Link 
              href="/login" 
              className={`flex items-center space-x-1.5 ${theme.bg} ${theme.bgHover} backdrop-blur border border-white/20 shadow-[0_4px_20px_rgb(0,0,0,0.08)] rounded-full px-4 py-2.5 text-[11px] font-black text-white transition cursor-pointer`}
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span>로그인</span>
            </Link>
          </div>
        )}

        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          user={user}
          theme={theme}
          handleLogout={handleLogout}
          apiUrl={apiUrl}
        />

        <CategoryFilter 
          selectedCategory={selectedCategory}
          theme={theme}
          onFilterChange={handleFilterChange}
        />

        <RestaurantList 
          theme={theme}
          isBottomExpanded={isBottomExpanded}
          setIsBottomExpanded={setIsBottomExpanded}
          selectedCity={selectedCity}
          weatherState={weatherState}
          handleRefreshLocation={handleRefreshLocation}
          loading={loading}
          error={error}
          recommendations={recommendations}
          selectedRestaurant={selectedRestaurant}
          handleSelectRestaurant={handleSelectRestaurant}
          user={user}
        />

        <button
          onClick={handlePanToUser}
          title="현재 위치로 지도 이동"
          className={`absolute p-3.5 bg-white hover:bg-zinc-50 ${theme.text} border border-zinc-200/85 rounded-full shadow-xl z-20 transition-all duration-300 hover:scale-105 ${
            selectedRestaurant 
              ? "md:right-[408px] right-6 bottom-6" 
              : isBottomExpanded 
                ? "right-6 bottom-[78vh]" 
                : "right-6 bottom-[28vh] md:bottom-6"
          }`}
        >
          <Navigation className="w-6 h-6 fill-current" />
        </button>

        <RestaurantDetailPanel 
          selectedRestaurant={selectedRestaurant}
          setSelectedRestaurant={setSelectedRestaurant}
          theme={theme}
          user={user}
        >
          <ReservationForm 
            theme={theme}
            user={user}
            selectedRestaurant={selectedRestaurant}
            isReserving={isReserving}
            reservationTime={reservationTime}
            setReservationTime={setReservationTime}
            partySize={partySize}
            setPartySize={setPartySize}
            reserveSuccess={reserveSuccess}
            setReserveSuccess={setReserveSuccess}
            reserveError={reserveError}
            handleCreateReservation={handleCreateReservation}
          />
        </RestaurantDetailPanel>
      </main>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ""}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {});
          }
        }}
      />
    </>
  );
}
