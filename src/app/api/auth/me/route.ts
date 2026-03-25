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
    const { data: user, error } = await supabase()
      .from("users")
      .select("id, email, name, created_at")
      .eq("id", payload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const formatted = { ...user, created_at: formatToKST(user.created_at) };

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const payload = verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const { name } = await req.json();

    if (!name || name.trim().length < 2 || name.trim().length > 8) {
      return NextResponse.json(
        { error: "이름은 2자 이상 8자 이하여야 합니다" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase()
      .from("users")
      .update({ name: name.trim() })
      .eq("id", payload.userId)
      .select("id, email, name, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "이름 수정에 실패했습니다" },
        { status: 500 }
      );
    }

    const formatted = { ...data, created_at: formatToKST(data.created_at) };

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};
