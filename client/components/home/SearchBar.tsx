/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Search, User as UserIcon, LogOut, BookOpen } from 'lucide-react';
import { CgProfile } from 'react-icons/cg';
import Link from 'next/link';
import { User } from '../../types/user';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  user: User | null;
  theme: any;
  handleLogout: () => void;
  apiUrl: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery, setSearchQuery, onSearchSubmit, user, theme, handleLogout, apiUrl
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <form 
      onSubmit={onSearchSubmit} 
      className={`fixed md:absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-auto md:w-[410px] transition-all duration-150 ${
        isProfileOpen ? "z-40" : "z-30"
      }`}
    >
      <div className="relative flex items-center bg-white/95 backdrop-blur border border-zinc-200/80 rounded-2xl pl-10 pr-12 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-white/30 group">
        <Search className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 transition ${theme.text} opacity-60 group-focus-within:opacity-100`} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="지역, 맛집 검색 (예: 서울역, 강남역 초밥)"
          className="w-full bg-transparent text-sm focus:outline-none font-semibold text-zinc-850 placeholder-zinc-400"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          <div className="h-5 w-[1px] bg-zinc-200 mx-2" />
          <button 
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-center shrink-0 cursor-pointer bg-zinc-50`}
          >
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `${apiUrl}${user.profileImageUrl}`} 
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <CgProfile className="w-6 h-6 text-zinc-500" />
            )}
          </button>
        </div>

        {isProfileOpen && (
          <>
            <div onClick={() => setIsProfileOpen(false)} className="fixed inset-0 z-40 cursor-default" />
            <div className="absolute right-0 top-[54px] w-52 bg-white border border-zinc-200 shadow-xl rounded-2xl p-3 z-50 text-zinc-850 animate-fade-in font-sans">
              {user ? (
                <>
                  <div className="px-2 pb-2 mb-2 border-b border-zinc-100 text-xs">
                    <span className="text-zinc-400 font-medium">로그인 정보</span>
                    <p className="font-bold text-zinc-850 mt-0.5 truncate">{user.nickname} 님</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 transition"
                  >
                    <UserIcon className={`w-4 h-4 ${theme.text}`} />
                    <span>내 프로필 설정</span>
                  </Link>

                  <Link
                    href="/reservations"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 transition"
                  >
                    <BookOpen className={`w-4 h-4 ${theme.text}`} />
                    <span>내 예약 관리</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-2 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="px-2 pb-2 mb-2 border-b border-zinc-100 text-xs">
                    <p className="font-bold text-zinc-850 mt-0.5">로그인이 필요합니다.</p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 transition"
                  >
                    <UserIcon className={`w-4 h-4 ${theme.text}`} />
                    <span>로그인 / 회원가입</span>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
};
