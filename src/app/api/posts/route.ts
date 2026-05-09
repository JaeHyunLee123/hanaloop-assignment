// 포스트 조회 및 생성/수정 API 엔드포인트
import { NextRequest, NextResponse } from "next/server";
import { fetchPosts, createOrUpdatePost, submitEmissions } from "@/lib/api";

export async function GET() {
  try {
    const posts = await fetchPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.actionType) {
      const result = await submitEmissions(body);
      return NextResponse.json(result, { status: 201 });
    }
    const result = await createOrUpdatePost(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
