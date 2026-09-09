/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { FormEvent } from 'react';
import { RotateCw, Calendar, AlertCircle, CheckCircle, Users, User as UserIcon } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { User } from '../../types/user';
import { useRouter } from 'next/navigation';

interface ReservationFormProps {
  theme: any;
  user?: User | null;
  selectedRestaurant: Restaurant | null;
  isReserving: boolean;
  reservationTime: string;
  setReservationTime: (val: string) => void;
  partySize: number;
  setPartySize: (val: number) => void;
  reserveSuccess: boolean;
  setReserveSuccess: (val: boolean) => void;
  reserveError: string | null;
  handleCreateReservation: (e: FormEvent) => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  theme,
  user,
  isReserving,
  reservationTime,
  setReservationTime,
  partySize,
  setPartySize,
  reserveSuccess,
  setReserveSuccess,
  reserveError,
  handleCreateReservation
}) => {
  const router = useRouter();

  return (
    <div className="pt-2 border-t border-zinc-100">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">간편 테이블 예약</h3>
      
      {reserveSuccess ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col items-center space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
          <span className="text-xs font-bold text-emerald-600">예약 신청이 성공적으로 완료되었습니다!</span>
          <p className="text-[10px] text-zinc-500 leading-normal">
            예약 진행 내역은 대시보드 상단 <strong className="text-zinc-600">내 예약 관리</strong> 페이지에서 확인할 수 있습니다.
          </p>
          <button
            onClick={() => setReserveSuccess(false)}
            className="mt-2 text-[10px] text-emerald-600 underline"
          >
            새 예약 잡기
          </button>
        </div>
      ) : !user ? (
        <div className="flex justify-center py-4">
          <button 
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded-full text-[11px] font-black shadow-md flex items-center space-x-1.5 transition-all duration-300 border border-white/20 cursor-pointer ${theme.bg} ${theme.bgHover} text-white hover:scale-105`}
          >
            <UserIcon className="w-3.5 h-3.5 shrink-0" />
            <span>로그인하고 실시간 테이블 예약하기</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateReservation} className="space-y-3.5">
          {reserveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-start space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{reserveError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold block">예약 시간</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold block">방문 인원</label>
              <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isReserving}
            className={`w-full py-2 bg-gradient-to-r ${theme.gradient} hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg ${theme.shadow} transition duration-300 disabled:opacity-50 flex items-center justify-center space-x-1.5`}
          >
            {isReserving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>예약 전송 중...</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>실시간 테이블 예약하기</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
