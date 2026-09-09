"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Phone,
  ArrowLeft,
  RotateCw,
  AlertCircle,
  Utensils,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface Restaurant {
  id: number;
  name: string;
  category: string;
  phone: string;
  address: string;
  imageUrl: string;
}

interface Reservation {
  id: number;
  reservationTime: string;
  partySize: number;
  status: string;
  createdAt: string;
  restaurant: Restaurant;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [user, setUser] = useState<{ id: number; email: string; nickname: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }

    const fetchReservations = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${apiUrl}/reservations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("예약 내역을 불러오지 못했습니다.");
        }

        const data = await res.json();
        setReservations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
            예약 확정
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">
            취소 완료
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-200">
            대기 중
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const day = dayNames[d.getDay()];
    
    let hours = d.getHours();
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}년 ${mm}월 ${dd}일 (${day}) ${ampm} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans text-zinc-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100 shrink-0 shadow-sm shadow-zinc-100/40">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded-xl transition"
            title="대시보드로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Image src="/logo.png" alt="웨더잇 로고" width={36} height={36} className="shrink-0 drop-shadow-sm rounded-[20%]" />
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent font-sans">
              웨더잇
            </h1>
          </div>
        </div>

        {user && (
          <div className="text-zinc-700 text-sm font-semibold">
            <strong className="text-zinc-900 font-black">{user.nickname}</strong> 님의 예약 내역
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-6 md:p-8 flex-1">
        <div className="flex items-center space-x-2.5 mb-6">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-black text-zinc-900">내 예약 현황</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 space-y-3">
            <RotateCw className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-bold">예약 내역을 가져오는 중...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 text-center bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm">
            <Utensils className="w-12 h-12 text-zinc-200 mb-3" />
            <span className="text-sm font-bold text-zinc-700">예약된 내역이 없습니다.</span>
            <p className="text-xs text-zinc-500 mt-1.5 mb-5 max-w-xs leading-relaxed">
              오늘의 실시간 날씨 정보를 확인하고 나에게 맞는 맛집 테이블을 예약해 보세요.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition"
            >
              식당 추천 보러가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reserve) => (
              <article
                key={reserve.id}
                className="bg-white border border-zinc-100 hover:border-zinc-200 p-5 rounded-2xl flex flex-col md:flex-row gap-5 shadow-sm transition"
              >
                {/* Photo */}
                <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-50 relative border border-zinc-100">
                  {reserve.restaurant.imageUrl ? (
                    <Image src={reserve.restaurant.imageUrl} alt={reserve.restaurant.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 128px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {reserve.restaurant.category}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 mt-1.5">{reserve.restaurant.name}</h3>
                      </div>
                      <div>{getStatusBadge(reserve.status)}</div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{formatDate(reserve.reservationTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>방문 인원: {reserve.partySize}명</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{reserve.restaurant.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{reserve.restaurant.phone || "연락처 정보 없음"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>신청 일시: {new Date(reserve.createdAt).toLocaleString()}</span>
                    <span>예약 번호: WT-{reserve.id.toString().padStart(6, "0")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
