import XSeaSimplifier from "@/app/api/simplifier/xseaSimplifier";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  try {
    const body = await request.json();
    const scriptIds = body.scriptIds ?? [];
    const xsea = new XSeaSimplifier("822313712173449216");
    const name = `压测场景-${dayjs().format("YYYY_MM_DD_HH_mm_ss")}`;
    const goal = await xsea.GoalCreate(
      params.planId,
      name,
      "SINGLE_USER_TREND",
      scriptIds,
    );
    const executeRecord = await xsea.GoalExecute(params.planId, goal.id);
    return NextResponse.json(
      { goal, executeRecord },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
