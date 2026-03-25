import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호는 필수입니다" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase()
      .from("users")
      .select("id, email, name, password")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    const accessToken = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};
