import { useState, useMemo } from 'react';

export interface WeatherState {
  temp: string;
  sky: string;
  pty: string;
  desc: string;
  pm10Grade: string;
}

export const useWeatherState = () => {
  const [weatherState, setWeatherState] = useState<WeatherState>({
    temp: "20",
    sky: "1",
    pty: "0",
    desc: "맑음",
    pm10Grade: "1"
  });

  const theme = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    const isRainOrSnow = weatherState.pty && weatherState.pty !== "0";
    const isCloudy = weatherState.sky && weatherState.sky !== "1";

    if (isNight) {
      return {
        name: "evening",
        text: "text-zinc-900",
        textMuted: "text-zinc-500",
        bg: "bg-zinc-900",
        bgHover: "hover:bg-zinc-800",
        bgDark2: "bg-zinc-950",
        bgLight: "bg-zinc-50",
        border: "border-zinc-900",
        borderLight: "border-zinc-200",
        gradient: "from-zinc-950 to-zinc-700",
        shadow: "shadow-zinc-900/15",
        accentText: "text-zinc-850",
        accentBg: "bg-zinc-500/10",
        accentBorder: "border-zinc-500/20",
        buttonText: "text-zinc-900",
        buttonBgActive: "bg-zinc-900 text-white",
        borderAccent: "border-zinc-900/40",
        textHover: "hover:text-zinc-800",
      };
    }
    
    if (isRainOrSnow || isCloudy) {
      return {
        name: "rainy",
        text: "text-sky-600",
        textMuted: "text-sky-400",
        bg: "bg-sky-500",
        bgHover: "hover:bg-sky-600",
        bgDark2: "bg-sky-700",
        bgLight: "bg-sky-50",
        border: "border-sky-500",
        borderLight: "border-sky-200",
        gradient: "from-sky-500 to-blue-600",
        shadow: "shadow-sky-500/15",
        accentText: "text-sky-600",
        accentBg: "bg-sky-500/10",
        accentBorder: "border-sky-500/20",
        buttonText: "text-sky-600",
        buttonBgActive: "bg-sky-500 text-white",
        borderAccent: "border-sky-500/40",
        textHover: "hover:text-sky-750",
      };
    }

    // Sunny / default (Orange)
    return {
      name: "sunny",
      text: "text-amber-600",
      textMuted: "text-amber-400",
      bg: "bg-amber-500",
      bgHover: "hover:bg-amber-600",
      bgDark2: "bg-amber-700",
      bgLight: "bg-amber-50",
      border: "border-amber-500",
      borderLight: "border-amber-200",
      gradient: "from-amber-500 to-rose-500",
      shadow: "shadow-amber-500/15",
      accentText: "text-amber-600",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/20",
      buttonText: "text-amber-600",
      buttonBgActive: "bg-amber-500 text-white",
      borderAccent: "border-amber-500/40",
      textHover: "hover:text-amber-700",
    };
  }, [weatherState.pty, weatherState.sky]);

  return { weatherState, setWeatherState, theme };
};
