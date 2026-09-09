/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState } from 'react';
import { Restaurant } from '../types/restaurant';

export const useReservation = (selectedRestaurant: Restaurant | null) => {
  const [isReserving, setIsReserving] = useState(false);
  const [reservationTime, setReservationTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    setIsReserving(true);
    setReserveError(null);
    setReserveSuccess(false);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${apiUrl}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id,
          reservationTime,
          partySize,
        }),
      });

      if (!res.ok) {
        let errorMessage = "예약 신청 중 에러가 발생했습니다.";
        try {
          const errorData = await res.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (e) {
          // JSON parsing failed, use default message
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (!data) {
        throw new Error("서버로부터 응답 데이터를 받지 못했습니다.");
      }

      setReserveSuccess(true);
      setReservationTime("");
      setPartySize(2);
    } catch (err: any) {
      setReserveError(err.message);
    } finally {
      setIsReserving(false);
    }
  };

  return {
    isReserving,
    reservationTime,
    setReservationTime,
    partySize,
    setPartySize,
    reserveSuccess,
    setReserveSuccess,
    reserveError,
    handleCreateReservation
  };
};
