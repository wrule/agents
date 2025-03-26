import { NextRequest, NextResponse } from "next/server";
import nodejieba from "nodejieba";
import QALib from "./zzk.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.message;
    const limit = body.limit ?? 10;
    const words = nodejieba
      .tag(text)
      .filter((tag) =>
        ["n", "eng", "v"].some((type) => tag.tag.startsWith(type)),
      )
      .map((tag) => tag.word);
    const subQALib = QALib.map((qa) => ({
      ...qa,
      score:
        words.filter((word) => qa.q.toLowerCase().includes(word.toLowerCase()))
          .length *
          2 +
        words.filter((word) => qa.a.toLowerCase().includes(word.toLowerCase()))
          .length,
    }));
    subQALib.sort((a, b) => b.score - a.score);
    return NextResponse.json(
      subQALib
        .slice(0, limit)
        .map((qa) => ({ q: qa.q, a: qa.a }))
        .reverse(),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
