// 회사 목록 조회 API 엔드포인트
import { NextResponse } from "next/server";
import { fetchCompanies } from "@/lib/api";

export async function GET() {
  try {
    const companies = await fetchCompanies();
    return NextResponse.json(companies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
