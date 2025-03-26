import http from "@/app/api/simplifier/http";
import nodejieba from "nodejieba";

export const querySearch = async (querys: string[], limit = 1000) => {
  // 切分查询，并且截取最后2个查询
  querys = querys
    .map((query) => query.toLowerCase().trim())
    .filter((query) => query)
    .slice(-1);
  if (querys.length === 0) {
    throw new Error("没有正确的查询");
  }
  // 从每一个查询中提取关键词
  const wordsList = querys
    .map((query) => nodejieba.extract(query, 10))
    .map((words) =>
      words.filter(
        (word) =>
          ![
            // "产品",
            // "脚本",
            // "计划",
            // "目标",
            // "记录",
            // "报告",
            "压测",
            "执行",
            "调试",
            "开始",
          ].includes(word.word),
      ),
    );
  // 尝试进行关键字对齐
  const maxWordsLength = Math.max(...wordsList.map((words) => words.length));
  wordsList.forEach((words, index) => {
    wordsList[index] = Array(10).fill(words).flat().slice(0, maxWordsLength);
  });
  // 数据获取
  const [scriptRes, goalRes] = await Promise.all([
    http.post(`http://10.10.30.103:8081/api/xsea/script/queryScriptRel`),
    http.post(`http://10.10.30.103:8081/api/xsea/plan/goal/queryGoalRel`),
  ]);
  const scriptList: any[] = (scriptRes.data.object ?? []).map((item: any) => ({
    ...item,
    type: "SCRIPT",
    _name: "脚本",
  }));
  const goalList: any[] = (goalRes.data.object ?? []).map((item: any) => ({
    ...item,
    type: "GOAL",
    _name: "目标",
  }));
  // 数据打分
  const allList = [...scriptList, ...goalList]
    .map((item) => {
      const allValueText = Object.keys(item)
        .filter((key) => key.toLowerCase().includes("name"))
        .map((key) => item[key])
        .filter((value) => value != null)
        .map((value) => value.toString().trim().toLowerCase())
        .join(",");
      let score = 0;
      querys.forEach((query, index) => {
        let queryScore = 0;
        wordsList[index].forEach((word) => {
          if (allValueText.includes(word.word)) {
            queryScore += 1;
          }
        });
        // 精准匹配的加成
        if (allValueText.includes(query)) {
          queryScore *= 1.5;
        }
        // 这里乘以注意力权重
        queryScore *= (index + 1) * (index + 1) * (index + 1);
        score += queryScore;
      });
      return { ...item, score };
    })
    .filter((item) => item.score > 0);
  // 数据排序
  allList.sort((a, b) => b.score - a.score);
  const resultList: any[] = [];
  while (
    allList.length !== 0 &&
    (resultList.length === 0 ||
      allList[0].score === resultList[resultList.length - 1].score)
  ) {
    resultList.push(allList.shift());
  }
  resultList.splice(limit, Infinity);
  return { list: resultList, wordsList };
};
