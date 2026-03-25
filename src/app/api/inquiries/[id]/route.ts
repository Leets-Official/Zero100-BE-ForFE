import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const payload = verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const { data: inquiry, error: fetchError } = await supabase()
      .from("inquiries")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !inquiry) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (inquiry.user_id !== payload.userId) {
      return NextResponse.json(
        { error: "본인의 문의만 삭제할 수 있습니다" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase()
      .from("inquiries")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "문의 삭제에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { message: "문의가 삭제되었습니다" } });
  } catch {
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다" },
      { status: 500 }
    );
  }
};
