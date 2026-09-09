import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationcode = searchParams.get("stationcode") || "1";

    const apiUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
    const backendUrl = `${apiUrl}/weather/dust?stationcode=${stationcode}`;
    const res = await fetch(backendUrl);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errData.error || "BACKEND_ERROR",
          message: errData.message || "백엔드 서버로부터 미세먼지 데이터를 가져오는데 실패했습니다."
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[API Dust Proxy Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "프록시 서버 내부 에러가 발생했습니다."
      },
      { status: 500 }
    );
  }
}
