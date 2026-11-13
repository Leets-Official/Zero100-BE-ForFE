import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveKakaoRedirectUri } from "@/lib/kakao";

export const GET = async (req: NextRequest) => {
  const redirectUri = resolveKakaoRedirectUri(req);

  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${process.env.KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
};
