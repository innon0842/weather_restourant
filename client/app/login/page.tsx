"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Utensils,
  CloudSun,
  MapPin,
  Calendar,
  Compass,
  Smartphone,
  Check
} from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Client-side validations
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!nickname) {
        setError("닉네임을 입력해주세요.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin 
        ? { email, password }
        : { email, password, nickname };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "오류가 발생했습니다.");
      }

      if (isLogin) {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push("/");
        router.refresh();
      } else {
        // Registered successfully, auto switch to login
        alert("회원가입이 완료되었습니다. 로그인해주세요!");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 md:p-12 relative overflow-hidden font-sans text-slate-800">
      
      {/* Decorative background glow elements (Removed) */}

      {/* Main Container */}
      <div className="max-w-lg w-full flex flex-col items-center text-center gap-10 relative z-10">
        
        {/* Brand Hero */}
        <section className="space-y-6 flex flex-col items-center">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex flex-col items-center space-y-4 cursor-pointer transition group">
            <Image src="/logo.png" alt="웨더잇 로고" width={96} height={96} className="shrink-0 drop-shadow-[0_8px_16px_rgba(0,100,200,0.15)] group-hover:drop-shadow-[0_12px_24px_rgba(0,100,200,0.2)] transition-all duration-300" />
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                웨더잇
              </h1>
              <p className="text-xs text-sky-500 font-bold tracking-wider mt-2.5 uppercase">날씨 맞춤형 식당 추천 & 예약 플랫폼</p>
            </div>
          </Link>

          {/* Slogan */}
          <div className="space-y-3 pt-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              오늘 날씨에 딱 어울리는 <br />
              식사를 찾고, 즉시 예약해보세요
            </h2>
          </div>
        </section>

        {/* Login Card */}
        <section className="w-full">
          <div className="w-full bg-white border border-zinc-200/80 p-10 rounded-[36px] shadow-2xl shadow-slate-100/60 relative text-left">
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {isLogin ? "로그인" : "신규 회원가입"}
              </h2>
              <p className="text-sm text-slate-400 font-bold mt-1.5">
                {isLogin ? "계정에 접속하여 오늘의 맞춤 식탁을 찾아보세요" : "간단한 정보만으로 웨더잇 회원이 되어보세요"}
              </p>
            </div>

            {/* Alert message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-rose-600 text-xs font-semibold mb-5">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Nickname field for Register */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    닉네임
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-slate-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-5 text-slate-850 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-semibold"
                      placeholder="홍길동"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-5 text-slate-850 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-semibold"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-5 text-slate-850 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-semibold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password field for Register */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-5 text-slate-850 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-semibold"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Auto login checkbox (Everytime style benchmark) */}
              {isLogin && (
                <div className="flex items-center space-x-2.5 pt-1.5 pb-2">
                  <input 
                    type="checkbox" 
                    id="autoLogin" 
                    className="w-4.5 h-4.5 accent-sky-500 rounded border-zinc-300 focus:ring-sky-500" 
                  />
                  <label htmlFor="autoLogin" className="text-xs font-bold text-slate-450 cursor-pointer select-none">
                    로그인 상태 유지
                  </label>
                </div>
              )}

              {/* Submit Button (Utensils icon inside login as requested) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold py-4 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer flex items-center justify-center"
              >
                {loading ? "처리 중..." : isLogin ? <Utensils className="w-6 h-6" /> : "회원가입"}
              </button>
            </form>

            {/* Toggle link */}
            <div className="text-center mt-7 pt-5 border-t border-zinc-100 text-sm">
              <span className="text-zinc-400 font-medium">
                {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-sky-500 hover:text-sky-600 font-bold focus:outline-none transition-colors cursor-pointer"
              >
                {isLogin ? "회원가입하기" : "로그인하기"}
              </button>
            </div>
          </div>
        </section>

        {/* Download App Store badges wrapper */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button className="flex items-center space-x-3 px-6 py-3 bg-[#1e1e1e] hover:bg-neutral-800 text-white rounded-[20px] transition shadow-md border border-[#1e1e1e] shrink-0 font-sans cursor-pointer">
            <FaApple className="w-6 h-6 text-white shrink-0" />
            <span className="text-base font-bold tracking-tight">App Store</span>
          </button>
          <button className="flex items-center space-x-3 px-6 py-3 bg-[#1e1e1e] hover:bg-neutral-800 text-white rounded-[20px] transition shadow-md border border-[#1e1e1e] shrink-0 font-sans cursor-pointer">
            <FaGooglePlay className="w-5 h-5 text-white shrink-0" />
            <span className="text-base font-bold tracking-tight">Google Play</span>
          </button>
        </div>

      </div>
    </div>
  );
}
