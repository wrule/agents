import { pagingFactory } from "@/app/api/object/paging";
import XSeaSimplifier from "@/app/api/simplifier/xseaSimplifier";
import { NextRequest, NextResponse } from "next/server";

export const GET = pagingFactory(async (params, searchParams) => {
  const xsea = new XSeaSimplifier();
  return await xsea.ScriptPaging(
    params.productId,
    searchParams.type,
    searchParams.pageNum,
    searchParams.pageSize,
    searchParams.search,
  );
});

export const POST = async (
  request: NextRequest,
  { params }: { params: any },
) => {
  try {
    const body = await request.json();
    const xsea = new XSeaSimplifier();
    const script = await xsea.ScriptCreate(
      params.productId,
      body.name,
      body.type,
      body.content,
    );
    return NextResponse.json(script);
  } catch (error) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
};
