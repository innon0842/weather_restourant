/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  theme: any;
  onFilterChange: (cat: string) => void;
}

const CATEGORIES = ["", "한식", "양식", "중식", "일식", "카페"];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, theme, onFilterChange }) => {
  return (
    <div className="fixed md:absolute top-[76px] md:top-[82px] left-4 md:left-6 right-4 md:right-auto md:w-[410px] z-30 py-0.5">
      <div 
        className="flex space-x-1 overflow-x-auto scrollbar-none px-4 py-0.5"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent 100%)'
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onFilterChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition border shadow-sm cursor-pointer ${
              selectedCategory === cat
                ? `${theme.bg} text-white border-transparent`
                : "bg-white/95 backdrop-blur hover:bg-zinc-50 text-zinc-650 border-zinc-200"
            }`}
          >
            {cat === "" ? "전체" : cat}
          </button>
        ))}
      </div>
    </div>
  );
};
