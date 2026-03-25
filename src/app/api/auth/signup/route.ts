import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { formatToKST } from "@/lib/date";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password, name, kakaoId } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름은 필수입니다" },
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

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2 || name.trim().length > 8) {
      return NextResponse.json(
        { error: "이름은 2자 이상 8자 이하여야 합니다" },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase()
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase()
      .from("users")
      .insert({ email, password: hashedPassword, name: name.trim(), ...(kakaoId && { kakao_id: kakaoId }) })
      .select("id, email, name, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "회원가입에 실패했습니다" },
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
