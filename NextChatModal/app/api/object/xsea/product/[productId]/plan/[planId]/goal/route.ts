import { pagingFactory } from "@/app/api/object/paging";
import XSeaSimplifier from "@/app/api/simplifier/xseaSimplifier";

export const GET = pagingFactory(async (params, searchParams) => {
  const xsea = new XSeaSimplifier();
  return await xsea.GoalPaging(
    params.planId,
    searchParams.pageNum,
    searchParams.pageSize,
    searchParams.search,
  );
});
