import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/inquiries/route";
import { DELETE } from "@/app/api/inquiries/[id]/route";

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

describe("문의 목록 조회 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await GET(createRequest("GET"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("인증이 필요합니다");
  });
});

describe("문의 등록 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await POST(
      createRequest("POST", { title: "제목", name: "test", email: "t@t.com", content: "hi" })
    );
    expect(res.status).toBe(401);
  });
});

describe("문의 삭제 API", () => {
  it("토큰 없이 요청 시 401 반환", async () => {
    const res = await DELETE(
      createRequest("DELETE"),
      { params: Promise.resolve({ id: "some-id" }) }
    );
    expect(res.status).toBe(401);
  });
});
