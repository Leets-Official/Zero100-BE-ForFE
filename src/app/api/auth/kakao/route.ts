import { NextRequest, NextResponse } from "next/server";

// redirect_uri 쿼리로 학생별 콜백 주소 지정 가능 (카카오 콘솔에 등록된 주소만 카카오가 허용)
export const GET = async (req: NextRequest) => {
  const redirectUri =
    req.nextUrl.searchParams.get("redirect_uri") ?? process.env.KAKAO_REDIRECT_URI!;

  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${process.env.KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
};
