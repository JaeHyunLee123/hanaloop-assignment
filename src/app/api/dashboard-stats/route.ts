import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let startDate = searchParams.get('startDate');
    let endDate = searchParams.get('endDate');
    const month = searchParams.get('month');

    // 하위 호환성 유지: month 파라미터가 유입될 경우 startDate와 endDate를 month로 설정
    if (month) {
      startDate = month;
      endDate = month;
    }

    const stats = await getDashboardStats(startDate || undefined, endDate || undefined);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

