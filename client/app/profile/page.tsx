"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  RotateCw,
  Shield,
  Trash2,
  Phone,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CgProfile } from "react-icons/cg";

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  bio?: string;
  contact?: string;
  interests?: string;
  createdAt: string;
}

const INTERESTS_OPTIONS = [
  "한식",
  "양식",
  "중식",
  "일식",
  "카페",
  "디저트",
  "야외테라스",
  "전망좋은곳",
  "따뜻한국물",
  "브런치"
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit fields
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [contact, setContact] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isAddingCustomInterest, setIsAddingCustomInterest] = useState(false);
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(true);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameAvailability, setNicknameAvailability] = useState<boolean | null>(null);

  // Password fields
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Deactivate modal fields
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateAgree, setDeactivateAgree] = useState(false);
  const [deactivateConfirmName, setDeactivateConfirmName] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("프로필 정보를 불러오지 못했습니다.");
        }

        const data: UserProfile = await res.json();
        setProfile(data);
        setNickname(data.nickname);
        setBio(data.bio || "");
        setContact(data.contact || "");
        setSelectedInterests(
          data.interests ? data.interests.split(",").map((i) => i.trim()).filter(Boolean) : []
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "서버 통신 장애가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, apiUrl]);

  // Handle Nickname Change
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNickname(val);
    setNicknameChecked(profile ? val === profile.nickname : false);
    setNicknameAvailability(null);
  };

  // Nickname Duplicate Check
  const checkNicknameDuplicate = async () => {
    if (!nickname.trim()) return;
    if (nickname.length < 2 || nickname.length > 10) {
      alert("닉네임은 2자 이상 10자 이하로 작성해 주세요.");
      return;
    }
    const specialChars = /[^a-zA-Z0-9가-힣]/;
    if (specialChars.test(nickname)) {
      alert("특수문자는 입력할 수 없습니다.");
      return;
    }

    setNicknameChecking(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${apiUrl}/users/check-nickname?nickname=${encodeURIComponent(nickname)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("닉네임 중복검사에 실패했습니다.");
      const data = await res.json();
      setNicknameAvailability(data.available);
      if (data.available) {
        setNicknameChecked(true);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "닉네임 중복검사에 실패했습니다.");
    } finally {
      setNicknameChecking(false);
    }
  };

  // Handle Interests Selection
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handle General Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!nicknameChecked) {
      setError("변경된 닉네임의 중복검사를 완료해 주세요.");
      return;
    }

    const token = localStorage.getItem("token");
    const interestsString = selectedInterests.join(",");

    try {
      const res = await fetch(`${apiUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname,
          bio,
          contact,
          interests: interestsString
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "프로필 저장 중 오류가 발생했습니다.");
      }

      const updatedUser: UserProfile = await res.json();
      setProfile(updatedUser);
      localStorage.setItem("user", JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        profileImageUrl: updatedUser.profileImageUrl
      }));
      setSuccessMsg("프로필 설정이 성공적으로 저장되었습니다.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "프로필 저장 중 오류가 발생했습니다.");
    }
  };

  // Handle Avatar Image Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 용량은 최대 5MB를 초과할 수 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "아바타 이미지 업로드 실패");
      }

      const updatedUser: UserProfile = await res.json();
      setProfile(updatedUser);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "아바타 이미지 업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
      setPwdError("새 비밀번호는 8자 이상 20자 이하로 조합하여야 합니다.");
      return;
    }

    setPwdLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${apiUrl}/users/me/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "비밀번호 변경 처리 실패");
      }

      setPwdSuccess("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Handle Account Deactivation (Soft Delete)
  const handleDeactivate = async () => {
    if (!deactivateAgree) return;
    if (deactivateConfirmName !== profile?.nickname) {
      setDeactivateError("확인을 위해 현재 닉네임을 정확히 입력해 주세요.");
      return;
    }

    setDeactivateLoading(true);
    setDeactivateError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${apiUrl}/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "탈퇴 처리 실패");
      }

      // Logout and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err: unknown) {
      setDeactivateError(err instanceof Error ? err.message : "탈퇴 처리에 실패했습니다.");
      setDeactivateLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 font-sans">
        <RotateCw className="w-10 h-10 animate-spin text-zinc-400 mb-2" />
        <span className="text-sm font-bold text-zinc-750">내 프로필 대시보드 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 flex flex-col relative pb-16 overflow-hidden">
      {/* Decorative background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-sky-400/12 rounded-full blur-3xl animate-pulse pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-400/12 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-rose-400/8 rounded-full blur-3xl animate-pulse delay-300 pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-2 hover:bg-zinc-150 rounded-xl transition text-zinc-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black tracking-tight text-zinc-950">내 프로필 설정</h1>
        </div>
        <div className="text-xs text-zinc-400 font-bold">
          웨더잇 프로필
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Column: Avatar & Basic stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Avatar block */}
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-zinc-50 cursor-pointer mt-4">
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl.startsWith("http") ? profile.profileImageUrl : `${apiUrl}${profile.profileImageUrl}`}
                  alt={profile?.nickname || "Profile Image"}
                  className="w-full h-full object-cover group-hover:opacity-85 transition duration-300"
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 text-zinc-300 flex items-center justify-center">
                  <CgProfile className="w-full h-full p-2" />
                </div>
              )}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 transition duration-300 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/50"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-black mt-1">업로드</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="text-base font-black text-zinc-900 mt-4">{profile?.nickname} 님</h2>

            <div className="w-full border-t border-zinc-100 my-4 pt-4 space-y-2.5 text-xs text-left">
              <div className="flex items-center space-x-2 text-zinc-600">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-600">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>가입일: {profile ? new Date(profile.createdAt).toLocaleDateString() : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Form, Passwords, Delete */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Success / Error Banners */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-250 text-rose-600 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Edit General Info Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 mb-4 flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span>기본 프로필 정보 수정</span>
            </h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Nickname Input & Checker */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold block">닉네임</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={handleNicknameChange}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                    placeholder="2자~10자 한글/영문"
                  />
                  <button
                    type="button"
                    onClick={checkNicknameDuplicate}
                    disabled={nicknameChecked || nicknameChecking || !nickname.trim()}
                    className={`px-3 py-2 text-xs font-black rounded-xl border transition shrink-0 select-none cursor-pointer ${
                      nicknameChecked
                        ? "bg-zinc-50 border-zinc-200 text-zinc-400 cursor-default"
                        : "bg-zinc-900 hover:bg-zinc-800 text-white border-transparent"
                    }`}
                  >
                    {nicknameChecking ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : nicknameChecked ? (
                      "체크완료"
                    ) : (
                      "중복확인"
                    )}
                  </button>
                </div>
                {nicknameAvailability !== null && (
                  <p className={`text-[10px] font-bold mt-1 ${nicknameAvailability ? "text-emerald-600" : "text-rose-600"}`}>
                    {nicknameAvailability 
                      ? "사용 가능한 닉네임입니다." 
                      : "이미 존재하거나 사용할 수 없는 닉네임입니다."}
                  </p>
                )}
              </div>

              {/* Bio (Character Count) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-400 font-bold block">한 줄 소개 (Bio)</label>
                  <span className="text-[9px] text-zinc-400 font-bold">{bio.length} / 100자</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 100))}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition resize-none"
                  placeholder="자기소개를 자유롭게 100자 내외로 입력해 주세요."
                />
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold block">연락처</label>
                <div className="relative">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                    placeholder="예: 010-1234-5678"
                  />
                  <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Interests (Comma separated selection) */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold block">관심 태그 설정</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {INTERESTS_OPTIONS.map((opt) => {
                    const isSelected = selectedInterests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInterest(opt)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all flex items-center space-x-1 cursor-pointer select-none ${
                          isSelected
                            ? "bg-zinc-900 text-white border-transparent shadow-sm"
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>#{opt}</span>
                      </button>
                    );
                  })}
                  {selectedInterests.filter(opt => !INTERESTS_OPTIONS.includes(opt)).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black border transition-all flex items-center space-x-1 cursor-pointer select-none bg-zinc-900 text-white border-transparent shadow-sm"
                    >
                      <Check className="w-3 h-3 text-white" />
                      <span>#{opt}</span>
                    </button>
                  ))}
                  {isAddingCustomInterest ? (
                    <input
                      type="text"
                      autoFocus
                      value={customInterestInput}
                      onChange={(e) => setCustomInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = customInterestInput.trim();
                          if (val && !selectedInterests.includes(val)) {
                            setSelectedInterests([...selectedInterests, val]);
                          }
                          setCustomInterestInput("");
                          setIsAddingCustomInterest(false);
                        } else if (e.key === 'Escape') {
                          setIsAddingCustomInterest(false);
                          setCustomInterestInput("");
                        }
                      }}
                      onBlur={() => {
                        const val = customInterestInput.trim();
                        if (val && !selectedInterests.includes(val)) {
                          setSelectedInterests([...selectedInterests, val]);
                        }
                        setIsAddingCustomInterest(false);
                        setCustomInterestInput("");
                      }}
                      className="px-3 py-1 text-[10px] font-black rounded-full border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 w-24"
                      placeholder="입력 후 엔터"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomInterest(true)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black border border-dashed border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-md transition duration-200 cursor-pointer select-none"
              >
                기본 프로필 정보 저장
              </button>
            </form>
          </div>

          {/* Password Reset Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 mb-4 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span>계정 비밀번호 변경</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwdError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold rounded-xl flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-600 text-[10px] font-bold rounded-xl flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold block">현재 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                      placeholder="현재 비밀번호"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold block">새 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                      placeholder="8~20자 조합"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold block">새 비밀번호 확인</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-400 transition"
                      placeholder="동일하게 입력"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-md transition duration-200 cursor-pointer select-none flex items-center justify-center space-x-1.5"
              >
                {pwdLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>비밀번호 재설정 완료</span>
                )}
              </button>
            </form>
          </div>

          {/* Account Deactivation Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-rose-600 border-b border-zinc-100 pb-3 mb-4 flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>웨더잇 서비스 회원 탈퇴</span>
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
              탈퇴 신청 즉시 회원의 예약 데이터 및 개인 프로필 데이터가 파기되며, 복구가 불가능합니다. 신중하게 선택해 주세요.
            </p>
            <button
              onClick={() => setShowDeactivateModal(true)}
              type="button"
              className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-600 font-black text-xs rounded-xl shadow-sm transition duration-200 cursor-pointer select-none"
            >
              회원 탈퇴 진행하기
            </button>
          </div>

        </div>
      </main>

      {/* Account Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-black">정말 회원 탈퇴하시겠습니까?</h2>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-2 text-[11px] text-zinc-650 leading-relaxed">
              <p>• 탈퇴 신청 즉시 맛집 예약 스케줄 및 즐겨찾기 등의 모든 정보가 삭제됩니다.</p>
              <p>• 탈퇴 후 동일 계정(이메일)으로의 가입은 30일 이내에 불가능할 수 있습니다.</p>
            </div>

            {deactivateError && (
              <p className="text-xs text-rose-600 font-bold">{deactivateError}</p>
            )}

            <div className="space-y-3">
              <label className="flex items-start space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deactivateAgree}
                  onChange={(e) => setDeactivateAgree(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-[11px] font-bold text-zinc-600">
                  위 안내 사항을 모두 숙지하였으며, 즉시 데이터를 파기하는 데 동의합니다. (필수)
                </span>
              </label>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold block">
                  확인을 위해 회원님의 현재 닉네임 (<strong className="text-zinc-600">{profile?.nickname}</strong>)을 입력해 주세요.
                </label>
                <input
                  type="text"
                  value={deactivateConfirmName}
                  onChange={(e) => setDeactivateConfirmName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-300 transition"
                  placeholder="여기에 닉네임 입력"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivateAgree(false);
                  setDeactivateConfirmName("");
                  setDeactivateError(null);
                }}
                className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={!deactivateAgree || deactivateConfirmName !== profile?.nickname || deactivateLoading}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                {deactivateLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>탈퇴 완료</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
