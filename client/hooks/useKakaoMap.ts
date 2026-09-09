/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, MutableRefObject } from 'react';

export const useKakaoMap = (
  mapContainerRef: MutableRefObject<HTMLDivElement | null>,
  searchCenter: { lat: number; lon: number },
  radius: number,
  isBottomExpanded: boolean
) => {
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [kakaoMapInstance, setKakaoMapInstance] = useState<any>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setKakaoLoaded(true);
      });
    } else {
      const interval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setKakaoLoaded(true);
            clearInterval(interval);
          });
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (kakaoLoaded && mapContainerRef.current && !kakaoMapInstance) {
      const container = mapContainerRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(searchCenter.lat, searchCenter.lon),
        level: 4,
      };
      const map = new window.kakao.maps.Map(container, options);
      setKakaoMapInstance(map);
    }
  }, [kakaoLoaded, searchCenter]);

  useEffect(() => {
    if (kakaoMapInstance && window.kakao) {
      let level = 4;
      if (radius === 1.0) level = 3;
      else if (radius === 2.0) level = 4;
      else if (radius === 5.0) level = 6;
      kakaoMapInstance.setLevel(level);
    }
  }, [radius, kakaoMapInstance]);

  useEffect(() => {
    if (!kakaoMapInstance || !window.kakao) return;

    const dragEndListener = () => {
      setShowSearchThisArea(true);
    };

    window.kakao.maps.event.addListener(kakaoMapInstance, 'dragend', dragEndListener);

    return () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.event.removeListener(kakaoMapInstance, 'dragend', dragEndListener);
      }
    };
  }, [kakaoMapInstance]);

  useEffect(() => {
    if (kakaoMapInstance) {
      const timer = setTimeout(() => {
        kakaoMapInstance.relayout();
        const searchPos = new window.kakao.maps.LatLng(searchCenter.lat, searchCenter.lon);
        kakaoMapInstance.setCenter(searchPos);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isBottomExpanded, kakaoMapInstance, searchCenter]);

  return { kakaoLoaded, kakaoMapInstance, showSearchThisArea, setShowSearchThisArea };
};
