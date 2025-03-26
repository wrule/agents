import { pagingFactory } from "@/app/api/object/paging";
import XSeaSimplifier from "@/app/api/simplifier/xseaSimplifier";

export const GET = pagingFactory(async (params, searchParams) => {
  const xsea = new XSeaSimplifier();
  return await xsea.TestRecordPaging(
    params.productId,
    params.planId,
    params.goalId,
    searchParams.pageNum,
    searchParams.pageSize,
    searchParams.search,
  );
});
