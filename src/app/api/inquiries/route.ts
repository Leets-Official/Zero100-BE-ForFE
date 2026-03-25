import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatToKST } from "@/lib/date";

export const GET = async (req: NextRequest) => {
  const payload = verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase()
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "문의 목록 조회에 실패했습니다" },
        { status: 500 }
      );
    }

    const formatted = data?.map((item: Record<string, unknown>) => ({
      ...item,
      created_at: formatToKST(item.created_at as string),
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const payload = verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const { title, name, email, content } = await req.json();

    if (!title || !name || !email || !content) {
      return NextResponse.json(
        { error: "제목, 성함, 이메일, 내용은 필수입니다" },
        { status: 400 }
      );
    }

    if (title.trim().length < 2 || title.trim().length > 50) {
      return NextResponse.json(
        { error: "제목은 2자 이상 50자 이하여야 합니다" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2 || name.trim().length > 20) {
      return NextResponse.json(
        { error: "성함은 2자 이상 20자 이하여야 합니다" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase()
      .from("inquiries")
      .insert({
        user_id: payload.userId,
        title: title.trim(),
        name: name.trim(),
        email,
        content,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "문의 등록에 실패했습니다" },
        { status: 500 }
      );
    }

    const formatted = { ...data, created_at: formatToKST(data.created_at) };

    return NextResponse.json({ data: formatted }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};
