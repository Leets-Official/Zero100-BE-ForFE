import { NextResponse } from "next/server";

export const GET = async () => {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${process.env.KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(process.env.KAKAO_REDIRECT_URI!)}` +
    `&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
};
