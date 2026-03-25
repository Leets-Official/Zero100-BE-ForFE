import { NextResponse } from "next/server";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "ZERO100 Admin API",
    version: "1.0.0",
    description: "Leets ZERO100 관리자 대시보드 백엔드 API",
  },
  servers: [{ url: "http://leetszero100-fe.kro.kr", description: "Production" }],
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "회원가입",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", example: "test@example.com" },
                  password: { type: "string", example: "Test1234!", description: "8자 이상, 영문+숫자+특수문자" },
                  name: { type: "string", example: "홍길동", description: "2~8자" },
                  kakaoId: { type: "string", example: "4813745811", description: "카카오 로그인으로 가입 시에만" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "회원가입 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "uuid" },
                        email: { type: "string", example: "test@example.com" },
                        name: { type: "string", example: "홍길동" },
                        created_at: { type: "string", example: "2026년 3월 25일 17:11" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "유효성 검사 실패",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  missing: { value: { error: "이메일, 비밀번호, 이름은 필수입니다" } },
                  email: { value: { error: "올바른 이메일 형식이 아닙니다" } },
                  passwordLength: { value: { error: "비밀번호는 8자 이상이어야 합니다" } },
                  passwordCombo: { value: { error: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다" } },
                  name: { value: { error: "이름은 2자 이상 8자 이하여야 합니다" } },
                },
              },
            },
          },
          "409": {
            description: "이미 가입된 이메일",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "이미 가입된 이메일입니다" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "로그인",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test@example.com" },
                  password: { type: "string", example: "Test1234!" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "로그인 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "uuid" },
                            email: { type: "string", example: "test@example.com" },
                            name: { type: "string", example: "홍길동" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "필수 필드 누락",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "이메일과 비밀번호는 필수입니다" },
              },
            },
          },
          "401": {
            description: "이메일 또는 비밀번호 불일치",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "이메일 또는 비밀번호가 일치하지 않습니다" },
              },
            },
          },
        },
      },
    },
    "/api/auth/kakao": {
      get: {
        tags: ["Auth - Kakao"],
        summary: "카카오 인증 페이지로 리다이렉트",
        description: "브라우저에서 직접 접속하세요. 카카오 로그인 페이지로 이동됩니다.",
        responses: {
          "307": { description: "카카오 인증 페이지로 리다이렉트" },
        },
      },
    },
    "/api/auth/kakao/redirect": {
      get: {
        tags: ["Auth - Kakao"],
        summary: "카카오 인가코드로 로그인 처리",
        description: "프론트 콜백 페이지에서 code를 추출하여 이 API를 호출합니다.",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "카카오에서 받은 인가코드",
          },
        ],
        responses: {
          "200": {
            description: "기존 유저 - 로그인 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "uuid" },
                            email: { type: "string", example: "test@example.com" },
                            name: { type: "string", example: "홍길동" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "미가입 유저 - 회원가입 필요",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "unregistered" },
                    kakaoId: { type: "string", example: "4813745811" },
                  },
                },
              },
            },
          },
          "400": {
            description: "인가코드 누락",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인가코드가 필요합니다" },
              },
            },
          },
          "500": {
            description: "카카오 로그인 실패",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "카카오 로그인에 실패했습니다" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "내 정보 조회",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "내 정보",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "인증 필요",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인증이 필요합니다" },
              },
            },
          },
          "404": {
            description: "사용자 없음",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "사용자를 찾을 수 없습니다" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Auth"],
        summary: "이름 수정",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "김철수", description: "2~8자" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "수정 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": {
            description: "이름 유효성 검사 실패",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "이름은 2자 이상 8자 이하여야 합니다" },
              },
            },
          },
          "401": {
            description: "인증 필요",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인증이 필요합니다" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me/password": {
      patch: {
        tags: ["Auth"],
        summary: "비밀번호 수정",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string", example: "Test1234!" },
                  newPassword: { type: "string", example: "NewPass1234!", description: "8자 이상, 영문+숫자+특수문자" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "비밀번호 변경 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        message: { type: "string", example: "비밀번호가 변경되었습니다" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "유효성 검사 실패",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  missing: { value: { error: "현재 비밀번호와 새 비밀번호는 필수입니다" } },
                  length: { value: { error: "비밀번호는 8자 이상이어야 합니다" } },
                  combo: { value: { error: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다" } },
                  same: { value: { error: "현재 비밀번호와 새 비밀번호가 같습니다" } },
                },
              },
            },
          },
          "401": {
            description: "인증 필요 / 현재 비밀번호 불일치",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  auth: { value: { error: "인증이 필요합니다" } },
                  wrong: { value: { error: "현재 비밀번호가 일치하지 않습니다" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/inquiries": {
      get: {
        tags: ["Inquiry"],
        summary: "문의 목록 조회",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "문의 목록 (최신순)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Inquiry" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "인증 필요",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인증이 필요합니다" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Inquiry"],
        summary: "문의 등록",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "name", "email", "content"],
                properties: {
                  title: { type: "string", example: "API 관련 문의", description: "2~50자" },
                  name: { type: "string", example: "홍길동", description: "2~20자" },
                  email: { type: "string", example: "test@example.com" },
                  content: { type: "string", example: "문의 내용입니다." },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "문의 등록 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Inquiry" },
                  },
                },
              },
            },
          },
          "400": {
            description: "유효성 검사 실패",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  missing: { value: { error: "제목, 성함, 이메일, 내용은 필수입니다" } },
                  title: { value: { error: "제목은 2자 이상 50자 이하여야 합니다" } },
                  name: { value: { error: "성함은 2자 이상 20자 이하여야 합니다" } },
                  email: { value: { error: "올바른 이메일 형식이 아닙니다" } },
                },
              },
            },
          },
          "401": {
            description: "인증 필요",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인증이 필요합니다" },
              },
            },
          },
        },
      },
    },
    "/api/inquiries/{id}": {
      delete: {
        tags: ["Inquiry"],
        summary: "문의 삭제 (본인만)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "문의 ID",
          },
        ],
        responses: {
          "200": {
            description: "삭제 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        message: { type: "string", example: "문의가 삭제되었습니다" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "인증 필요",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "인증이 필요합니다" },
              },
            },
          },
          "403": {
            description: "본인의 문의만 삭제 가능",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "본인의 문의만 삭제할 수 있습니다" },
              },
            },
          },
          "404": {
            description: "문의를 찾을 수 없음",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "문의를 찾을 수 없습니다" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "936ded5f-63c3-425e-8921-c44e79d526b8" },
          email: { type: "string", example: "test@example.com" },
          name: { type: "string", example: "홍길동" },
          created_at: { type: "string", example: "2026년 3월 25일 17:11" },
        },
      },
      Inquiry: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "226cb342-1d60-4044-b3fe-0cf2543101c7" },
          user_id: { type: "string", format: "uuid", example: "936ded5f-63c3-425e-8921-c44e79d526b8" },
          title: { type: "string", example: "API 관련 문의" },
          name: { type: "string", example: "홍길동" },
          email: { type: "string", example: "test@example.com" },
          content: { type: "string", example: "문의 내용입니다." },
          created_at: { type: "string", example: "2026년 3월 25일 17:11" },
        },
      },
    },
  },
};

export const GET = async () => {
  return NextResponse.json(swaggerSpec);
};
