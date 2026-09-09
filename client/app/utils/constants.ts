export const TAG_TRANSLATION: Record<string, string> = {
  RAINY_FOOD: "비/눈 오는 날",
  WARM_SOUP: "따뜻한 국물 요리",
  COLD_WEATHER: "추운 날 추천",
  WARM_TEA: "따뜻한 차/음료",
  HOT_WEATHER: "더운 날 추천",
  COLD_FOOD: "시원한 음식",
  TERRACE: "야외 테라스",
  VIEW: "전망 좋은 곳",
  SUNNY_FOOD: "화창한 날 추천",
  MORNING_FOOD: "아침 식사",
  AFTERNOON_FOOD: "점심 식사",
  EVENING_FOOD: "저녁/야식/반주",
};

export const getCategoryIconSvg = (category: string) => {
  const cat = category || "";
  if (cat.includes("한식")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9"></path>
        <path d="M3 12h18"></path>
        <path d="M12 3v3"></path>
        <path d="M9 4v2"></path>
        <path d="M15 4v2"></path>
      </svg>
    `;
  }
  if (cat.includes("중식") || cat.includes("일식") || cat.includes("아시안") || cat.includes("동남아") || cat.includes("회") || cat.includes("초밥")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9H3Z"></path>
        <path d="M8 12c0-3 1-5 2-7"></path>
        <path d="M11 12c0-3 1-5 2-7"></path>
        <path d="M14 12c0-3 1-5 2-7"></path>
      </svg>
    `;
  }
  if (cat.includes("치킨") || cat.includes("닭강정")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.4 12.1a3.8 3.8 0 0 0 2.2-2.2 4.4 4.4 0 0 0-.8-4.2l-.5-.5a4.4 4.4 0 0 0-4.2-.8A3.8 3.8 0 0 0 10 6.6c-.3.8-.8 1.4-1.5 1.7l-4.5 2.1c-.8.4-1.3 1.2-1.3 2.1v.6c0 1.2 1 2.2 2.2 2.2H7c.9 0 1.7-.5 2.1-1.3l2.1-4.5c.3-.7.9-1.2 1.7-1.5Z"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
    `;
  }
  if (cat.includes("양식") || cat.includes("피자") || cat.includes("이탈리안") || cat.includes("패스트푸드") || cat.includes("햄버거") || cat.includes("스테이크")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 3L3 15v5h5L20 9l-5-6Z"></path>
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="13" cy="8" r="1"></circle>
      </svg>
    `;
  }
  if (cat.includes("카페") || cat.includes("커피") || cat.includes("디저트") || cat.includes("베이커리") || cat.includes("제과") || cat.includes("아이스크림") || cat.includes("빙수")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z"></path>
        <line x1="6" y1="2" x2="6" y2="4"></line>
        <line x1="10" y1="2" x2="10" y2="4"></line>
        <line x1="14" y1="2" x2="14" y2="4"></line>
      </svg>
    `;
  }
  if (cat.includes("술집") || cat.includes("호프") || cat.includes("포장마차") || cat.includes("이자카야") || cat.includes("요리주점")) {
    return `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 8h1a3 3 0 1 1 0 6h-1"></path>
        <path d="M5 8h12v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8Z"></path>
        <line x1="9" y1="2" x2="9" y2="5"></line>
        <line x1="13" y1="2" x2="13" y2="5"></line>
      </svg>
    `;
  }
  return `
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
      <path d="M18 2v7c0 1.1-.9 2-2 2h-4a2 2 0 0 0-2-2V2"></path>
      <line x1="12" y1="2" x2="12" y2="11"></line>
      <path d="M12 11v11"></path>
    </svg>
  `;
};

// Helper to map old Unsplash placeholders or missing images to new generated local placeholders
export const getRestaurantImageUrl = (imageUrl: string | null | undefined, category: string | null | undefined) => {
  const cat = category || "";
  if (!imageUrl || imageUrl.includes("unsplash.com") || imageUrl === "") {
    if (cat.includes("한식")) return "/placeholders/korean.png";
    if (cat.includes("양식")) return "/placeholders/western.png";
    if (cat.includes("중식")) return "/placeholders/chinese.png";
    if (cat.includes("일식")) return "/placeholders/japanese.png";
    if (cat.includes("카페") || cat.includes("제과") || cat.includes("디저트")) return "/placeholders/cafe.png";
    return "/placeholders/etc.png";
  }
  return imageUrl;
};

export const getScoreBadgeStyles = (score: number) => {
  if (score >= 80) return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  if (score >= 60) return "bg-sky-50 text-sky-600 border border-sky-200";
  return "bg-zinc-50 text-zinc-500 border border-zinc-200";
};

export const getScoreThemeClasses = (score: number, isSelected: boolean, themeName: string) => {
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;
  
  let bg = '';
  if (themeName === 'evening') {
    bg = isHigh ? 'bg-zinc-800' : isMedium ? 'bg-zinc-500' : 'bg-zinc-300';
  } else if (themeName === 'rainy') {
    bg = isHigh ? 'bg-sky-600' : isMedium ? 'bg-sky-400' : 'bg-sky-200';
  } else { // sunny
    bg = isHigh ? 'bg-amber-600' : isMedium ? 'bg-amber-400' : 'bg-amber-200';
  }

  const border = isSelected ? 'border-2 border-white shadow-lg' : 'border-0 shadow-md';
  return { bg, text: 'text-white', border };
};
