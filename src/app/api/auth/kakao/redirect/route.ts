import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

interface KakaoUserResponse {
  id: number;
}

const getKakaoToken = async (code: string): Promise<string> => {
  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      code,
    }),
  });

  const data = await res.json();
  return data.access_token;
};

const getKakaoUser = async (accessToken: string): Promise<KakaoUserResponse> => {
  const res = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return res.json();
};

export const GET = async (req: NextRequest) => {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "인가코드가 필요합니다" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getKakaoToken(code);
    const kakaoUser = await getKakaoUser(accessToken);

    const kakaoId = String(kakaoUser.id);

    const { data: existingUser } = await supabase()
      .from("users")
      .select("id, email, name")
      .eq("kakao_id", kakaoId)
      .single();

    if (existingUser) {
      const accessToken = signToken({ userId: existingUser.id, email: existingUser.email });
      return NextResponse.json({
        data: {
          accessToken,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          },
        },
      });
    }

    return NextResponse.json(
      { error: "unregistered", kakaoId },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "카카오 로그인에 실패했습니다" },
      { status: 500 }
    );
  }
};
