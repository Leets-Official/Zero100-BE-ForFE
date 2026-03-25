import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const PATCH = async (req: NextRequest) => {
  const payload = verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호는 필수입니다" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호가 같습니다" },
        { status: 400 }
      );
    }

    const { data: user, error: fetchError } = await supabase()
      .from("users")
      .select("password")
      .eq("id", payload.userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase()
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", payload.userId);

    if (updateError) {
      return NextResponse.json(
        { error: "비밀번호 수정에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { message: "비밀번호가 변경되었습니다" } });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};
