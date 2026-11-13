import { NextRequest } from "next/server";
import { resolveKakaoRedirectUri } from "@/lib/kakao";

const BACKEND = "https://backend.example.com/api/auth/kakao";
const makeReq = (url: string, headers: Record<string, string> = {}) =>
  new NextRequest(url, { headers });

describe("resolveKakaoRedirectUri", () => {
  beforeAll(() => {
    process.env.KAKAO_REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";
  });

  it("redirect_uri 쿼리가 최우선", () => {
    const req = makeReq(`${BACKEND}?redirect_uri=https://a.app/cb`, { origin: "http://localhost:3000" });
    expect(resolveKakaoRedirectUri(req)).toBe("https://a.app/cb");
  });

  it("Origin 헤더로 콜백 주소 생성", () => {
    const req = makeReq(BACKEND, { origin: "http://localhost:3000" });
    expect(resolveKakaoRedirectUri(req)).toBe("http://localhost:3000/auth/kakao/callback");
  });

  it("Referer 헤더로 콜백 주소 생성", () => {
    const req = makeReq(BACKEND, { referer: "https://student.vercel.app/login" });
    expect(resolveKakaoRedirectUri(req)).toBe("https://student.vercel.app/auth/kakao/callback");
  });

  it("백엔드 자기 자신(스웨거)에서 호출하면 기본값", () => {
    const req = makeReq(BACKEND, { referer: "https://backend.example.com/api-docs" });
    expect(resolveKakaoRedirectUri(req)).toBe("http://localhost:5173/auth/kakao/callback");
  });

  it("헤더 없거나 Origin이 null이면 기본값", () => {
    expect(resolveKakaoRedirectUri(makeReq(BACKEND))).toBe("http://localhost:5173/auth/kakao/callback");
    expect(resolveKakaoRedirectUri(makeReq(BACKEND, { origin: "null" }))).toBe("http://localhost:5173/auth/kakao/callback");
  });
});
