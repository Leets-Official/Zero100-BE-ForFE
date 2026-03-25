import { NextRequest } from "next/server";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as getMe, PATCH as updateMe } from "@/app/api/auth/me/route";
import { PATCH as updatePassword } from "@/app/api/auth/me/password/route";

const createRequest = (method: string, body?: object, token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return new NextRequest("http://localhost:3000", {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe("회원가입 API", () => {
  it("필수 필드 누락 시 400 반환", async () => {
    const res = await signup(createRequest("POST", { email: "test@test.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("이메일, 비밀번호, 이름은 필수입니다");
  });

  it("잘못된 이메일 형식 시 400 반환", async () => {
    const res = await signup(
      createRequest("POST", { email: "invalid", password: "Test1234!", name: "테스트" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("올바른 이메일 형식이 아닙니다");
  });

  it("비밀번호 8자 미만 시 400 반환", async () => {
    const res = await signup(
      createRequest("POST", { email: "test@test.com", password: "Te1!", name: "테스트" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("비밀번호는 8자 이상이어야 합니다");
  });

  it("비밀번호 조합 미충족 시 400 반환", async () => {
    const res = await signup(
      createRequest("POST", { email: "test@test.com", password: "testtest", name: "테스트" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다");
  });

  it("이름 2자 미만 시 400 반환", async () => {
    const res = await signup(
      createRequest("POST", { email: "test@test.com", password: "Test1234!", name: "a" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("이름은 2자 이상 8자 이하여야 합니다");
  });

  it("이름 8자 초과 시 400 반환", async () => {
    const res = await signup(
      createRequest("POST", { email: "test@test.com", password: "Test1234!", name: "123456789" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("이름은 2자 이상 8자 이하여야 합니다");
  });
});

describe("로그인 API", () => {
  it("필수 필드 누락 시 400 반환", async () => {
    const res = await login(createRequest("POST", { email: "test@test.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("이메일과 비밀번호는 필수입니다");
  });
});

describe("내 정보 조회 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await getMe(createRequest("GET"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("인증이 필요합니다");
  });

  it("잘못된 토큰으로 요청 시 401 반환", async () => {
    const res = await getMe(createRequest("GET", undefined, "invalid-token"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("인증이 필요합니다");
  });
});

describe("이름 수정 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await updateMe(createRequest("PATCH", { name: "새이름" }));
    expect(res.status).toBe(401);
  });
});

describe("비밀번호 수정 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await updatePassword(
      createRequest("PATCH", { currentPassword: "old", newPassword: "new" })
    );
    expect(res.status).toBe(401);
  });
});
