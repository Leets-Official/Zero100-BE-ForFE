import type { NextRequest } from "next/server";

const CALLBACK_PATH = "/auth/kakao/callback";

// 우선순위: redirect_uri 쿼리 > 호출한 프론트 origin + 콜백 경로 > 환경변수 기본값
// 카카오 콘솔에 등록된 주소만 카카오가 허용하므로 임의 주소로 리다이렉트되지 않음
export const resolveKakaoRedirectUri = (req: NextRequest): string => {
  const explicit = req.nextUrl.searchParams.get("redirect_uri");
  if (explicit) return explicit;

  const source = req.headers.get("origin") ?? req.headers.get("referer");
  if (source) {
    try {
      const { origin } = new URL(source);
      // 스웨거 등 백엔드 자기 자신에서 호출한 경우는 기본값 사용
      if (origin !== req.nextUrl.origin) return `${origin}${CALLBACK_PATH}`;
    } catch {
      // "null" 등 파싱 불가 → 기본값
    }
  }

  return process.env.KAKAO_REDIRECT_URI!;
};
