import { NextRequest, NextResponse } from "next/server";
import { querySearch } from "./querySearch";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const limit = Number(searchParams.get("limit") || "1000");
    const showWords = !!searchParams.get("words");
    const { list, wordsList } = await querySearch(query.split("|"), limit);
    return NextResponse.json(
      {
        query,
        ...(showWords ? { wordsList } : {}),
        list,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: error.message || "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
