import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const messages = await request.json();
    const res = await axios.post(`http://localhost:4111/api/agents/XSea推荐询问/generate`, {
      messages,
    });
    const jsonText = (res.data.text ?? "[]") as string;
    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.indexOf(']');
    const newJsonText = jsonText.slice(jsonStartIndex, jsonEndIndex + 1);
    console.log(1234, res.data.text);
    let result: string[] = [];
    try {
      result = JSON.parse(newJsonText);
    } catch (error) {
      console.error(error);
    }
    return NextResponse.json(
      result,
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
