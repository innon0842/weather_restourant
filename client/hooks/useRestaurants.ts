/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useCallback } from 'react';
import { Restaurant } from '../types/restaurant';
import { CityInfo, CITIES, findClosestCity } from '../app/utils/weatherUtils';
import { WeatherState } from './useWeatherState';

export const useRestaurants = (
  setWeatherState: React.Dispatch<React.SetStateAction<WeatherState>>
) => {
  const [selectedCity, setSelectedCity] = useState<CityInfo>(CITIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({ lat: 37.5665, lon: 126.9780 });
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lon: number }>({ lat: 37.5665, lon: 126.9780 });
  const [radius, setRadius] = useState<number>(2.0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const fetchData = useCallback(async (lat: number, lon: number, radiusKm: number, categoryFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const closest = findClosestCity(lat, lon);
      setSelectedCity(closest);

      let temp = "20";
      let sky = "1";
      let pty = "0";
      let desc = "맑음";
      let pm10Grade = "보통이에요!";

      try {
        const shortRes = await fetch(`/api/weather/short?nx=${closest.nx}&ny=${closest.ny}`);
        if (shortRes.ok) {
          const shortData = await shortRes.json();
          if (shortData.success && shortData.data?.current) {
            const current = shortData.data.current;
            temp = current.temp || temp;
            sky = current.sky || sky;
            pty = current.pty || pty;

            const p = pty;
            const s = sky;
            if (p === "1") desc = "비";
            else if (p === "2") desc = "진눈깨비";
            else if (p === "3") desc = "눈";
            else if (p === "4") desc = "소나기";
            else if (s === "1") desc = "맑음";
            else if (s === "3") desc = "구름많음";
            else desc = "흐림";
          }
        }
      } catch (err) {
        console.error("Failed to fetch real weather, falling back to default.", err);
      }

      try {
        const dustRes = await fetch(`/api/dust?stationcode=${closest.metalStationCode}`);
        if (dustRes.ok) {
          const dustData = await dustRes.json();
          if (dustData.success && Array.isArray(dustData.data)) {
            const pb = dustData.data.find((d: any) => d.symbol === "Pb");
            if (pb && pb.value !== null) {
              if (pb.value < 50) pm10Grade = "좋아요!";
              else if (pb.value < 150) pm10Grade = "보통이에요!";
              else if (pb.value < 300) pm10Grade = "나빠요! 조심하세요!";
              else pm10Grade = "매우 나빠요... 마스크 챙기세요!";
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch real dust data", err);
      }

      setWeatherState({ temp, sky, pty, desc, pm10Grade });

      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      if (token) {
        try {
          await fetch(`${apiUrl}/users/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ lat, lon }),
          });
        } catch (e) {
          console.error("Failed to report user location to backend", e);
        }
      }

      const hour = new Date().getHours();
      let timeOfDay = "evening";
      if (hour >= 5 && hour < 11) {
        timeOfDay = "morning";
      } else if (hour >= 11 && hour < 17) {
        timeOfDay = "afternoon";
      }

      const query = `?lat=${lat}&lon=${lon}&radius=${radiusKm}&sky=${sky}&pty=${pty}&temp=${temp}&category=${categoryFilter}&timeOfDay=${timeOfDay}`;
      const recRes = await fetch(`${apiUrl}/restaurants/recommendations${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!recRes.ok) {
        throw new Error("식당 추천 정보를 가져오지 못했습니다.");
      }
      const recData = await recRes.json();
      const validRecs = Array.isArray(recData)
        ? recData.filter((r: any) => r !== null && r !== undefined)
        : (recData?.data && Array.isArray(recData.data) ? recData.data.filter((r: any) => r !== null && r !== undefined) : []);
      setRecommendations(validRecs);
    } catch (err: any) {
      setError(err.message || "데이터 로드 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setWeatherState]);

  return {
    selectedCity, setSelectedCity,
    loading, setLoading,
    error, setError,
    userCoords, setUserCoords,
    searchCenter, setSearchCenter,
    radius, setRadius,
    selectedCategory, setSelectedCategory,
    recommendations, setRecommendations,
    selectedRestaurant, setSelectedRestaurant,
    fetchData
  };
};
