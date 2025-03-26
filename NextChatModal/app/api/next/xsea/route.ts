import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const res = await axios.get(`http://localhost:3001/api/next/xsea`, {
    params: {
      context: request.nextUrl.searchParams.get('context'),
    },
  });
  return NextResponse.json(res.data);
}
