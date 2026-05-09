import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const stats = await getDashboardStats(month || undefined);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
