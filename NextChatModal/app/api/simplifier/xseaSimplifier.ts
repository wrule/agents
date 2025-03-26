import http from "./http";
import dayjs from "dayjs";

class XSeaContextStack {
  private tasks = [
    "创建产品",
    "选择产品",

    "创建脚本",
    "选择脚本",
    "分析脚本",
    "优化/调整脚本",
    "调试/执行脚本",

    "创建计划",
    "选择计划",

    "创建目标",
    "选择目标",
    "分析目标",
    "优化/调整目标",
    "调试/执行目标",

    "调试/执行压测",

    "分析压测记录",

    "选择压测报告",
  ];

  private readonly stack = [
    [
      { key: "envId", id: "", name: "", symbol: "环境" },
      { key: "productId", id: "", name: "", symbol: "产品" },
      { key: "scriptId", id: "", name: "", symbol: "脚本" },
      { key: "planId", id: "", name: "", symbol: "计划" },
      { key: "goalId", id: "", name: "", symbol: "目标" },
      { key: "testRecordId", id: "", name: "", symbol: "压测记录" },
      { key: "testReportId", id: "", name: "", symbol: "压测报告" },
    ],
  ];

  private clonePush(offset = 0) {
    this.stack.push(
      JSON.parse(JSON.stringify(this.stack[this.stack.length - 1 - offset])),
    );
  }

  private setTop(key: string, id: string, name: string) {
    const target = this.stack[this.stack.length - 1].find(
      (item) => item.key === key,
    );
    if (target) {
      target.id = id;
      target.name = name;
    }
  }

  private cleanTop(key: string) {
    this.setTop(key, "", "");
  }

  public envId(id: string, name: string) {
    this.setTop("envId", id, name);
  }

  public productId(id: string, name: string) {
    this.setTop("productId", id, name);
    this.cleanTop("scriptId");
    this.cleanTop("planId");
    this.cleanTop("goalId");
    this.cleanTop("testRecordId");
    this.cleanTop("testReportId");
  }

  public scriptId(id: string, name: string) {
    this.setTop("scriptId", id, name);
  }

  public planId(id: string, name: string) {
    this.setTop("planId", id, name);
    this.cleanTop("goalId");
    this.cleanTop("testRecordId");
    this.cleanTop("testReportId");
  }

  public goalId(id: string, name: string) {
    this.setTop("goalId", id, name);
    this.cleanTop("testRecordId");
  }

  public testRecordId(id: string, name: string) {
    this.setTop("testRecordId", id, name);
  }

  public testReportId(id: string, name: string) {
    this.setTop("testReportId", id, name);
  }
}

interface XSeaContext {
  envId: string;
  productId: string;
  scriptId: string;
  planId: string;
  goalId: string;
  testRecordId: string;
  testReportId: string;
}

export default class XSeaSimplifier {
  public constructor(private readonly envId: string = "822313712173449216") {}

  public async ProductPaging(pageNum = 1, pageSize = 10, search = "") {
    const res = await http.post(`xsea/workspace/list`, {
      pageNum,
      pageSize,
      condition: { name: search },
    });
    const data = res.data.object ?? {};
    return {
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list: (data.list ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: `/${this.envId}/product/business/${item.id}/overview?tab=0`,
      })),
    };
  }

  public async ProductCreate(name: string, remark?: string) {
    const res = await http.post(`paas/products`, {
      productName: name,
      productDesc: remark,
    });
    const data = res.data.object ?? {};
    return {
      id: data.id,
      name: data.productName,
      url: `/${this.envId}/product/business/${data.id}/overview?tab=0`,
    };
  }

  public async PlanPaging(
    productId: string,
    pageNum = 1,
    pageSize = 10,
    search = "",
  ) {
    const res = await http.post(`xsea/plan/v2/planList`, {
      workspaceId: productId,
      pageNum,
      pageSize,
      condition: { name: search },
    });
    const data = res.data.object ?? {};
    return {
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list: (data.list ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: `/${this.envId}/product/business/${productId}/plan/detail?id=${item.id}`,
      })),
    };
  }

  public async PlanCreate(productId: string, name: string, purpose: string) {
    const res = await http.post(`xsea/plan/v2/addPlan`, {
      workspaceId: productId,
      name,
      planPurpose: purpose,
      planRange: {
        start: dayjs().format("YYYY-MM-DD"),
        end: dayjs().add(1, "weeks").format("YYYY-MM-DD"),
      },
      version: "1.0",
    });
    const data = res.data.object;
    return {
      id: data,
      name,
      url: `/${this.envId}/product/business/${productId}/plan/detail?id=${data}`,
    };
  }

  public async ScriptPaging(
    productId: string,
    type?: string,
    pageNum = 1,
    pageSize = 10,
    search = "",
  ) {
    const res = await http.post(`xsea/script/tree/listScriptDirectory`, {
      workspaceId: productId,
      name: search,
      type,
    });
    const list = res.data.object ?? [];
    const allScripts = list.filter((item: any) => item.type !== "FOLDER");
    const scriptsMeta = allScripts.map((item: any) => ({
      id: item.scriptId,
      name: item.name,
      type: item.type,
      url: `/${this.envId}/product/business/${productId}/script?scriptId=${item.scriptId}`,
    }));
    return {
      pageNum: 1,
      pageSize: scriptsMeta.length,
      list: scriptsMeta,
      total: scriptsMeta.length,
    };
  }

  public async ScriptCreate(
    productId: string,
    name: string,
    type: string,
    content: string,
  ) {
    const res = await http.post(`xsea/script/add`, {
      workspaceId: productId,
      name,
      type,
      scriptTypeVO: type,
      createType: type,
      parentId: "-1",
      level: 1,
    });
    const data = res.data.object;
    const saveRes = await http.post(`xsea/script/saveContent`, {
      workspaceId: productId,
      id: data,
      content,
    });
    console.log(saveRes.data);
    return {
      id: data,
      name,
      url: `/${this.envId}/product/business/${productId}/script?scriptId=${data}`,
    };
  }

  public async GoalPaging(
    planId: string,
    pageNum = 1,
    pageSize = 10,
    search = "",
  ) {
    const res = await http.post(`xsea/plan/goal/list`, {
      planId,
      pageNum,
      pageSize,
      condition: { name: search },
    });
    const data = res.data.object ?? {};
    return {
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list: (data.list ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: `/${this.envId}/product/business/${item.workspaceId}/plan/target?id=${planId}&goalId=${item.id}`,
      })),
    };
  }

  public async GoalCreate(
    planId: string,
    name: string,
    type: string,
    sceneScriptIds: string[],
  ) {
    const res = await http.post(`xsea/plan/goal/save`, {
      planId,
      name,
      type,
      sceneScriptIds,
      syncLoops: false,
      syncModelConf: false,
      syncRps: false,
      syncScriptConf: true,
      syncThinkTime: false,
      syncTransactionPercent: false,
    });
    const data = res.data.object;
    return {
      id: data,
      name,
      url: `/${
        this.envId
      }/product/business/${"920951261988982784"}/plan/target?id=${planId}&goalId=${data}`,
    };
  }

  public async GoalExecute(planId: string, goalId: string) {
    let res = await http.post(`xsea/plan/goal/list`, {
      planId,
      pageNum: 1,
      pageSize: 1e6,
      condition: { name: "" },
    });
    const targetGoal =
      res.data.object?.list?.find((item: any) => item.id === goalId) ?? {};

    const { data: strategyData } = await http.post(
      `xsea/scene/script/queryStrategy`,
      { id: targetGoal.sceneId },
    );
    const object = strategyData.object ?? {};
    (object.sceneScriptConfModelList ?? []).slice(0, 1).forEach((item: any) => {
      item.sceneStrategies = DFT_LINE;
      item.threadNum = "1000";
    });
    await http.post(`xsea/scene/script/modifyStrategy`, object);
    console.log(object);

    res = await http.post(`xsea/sceneExec/start`, {
      envId: this.envId,
      planId,
      goalId,
      id: targetGoal.sceneId,
      workspaceId: targetGoal.workspaceId,
      flag: true,
    });
    const data = res.data.object;
    return {
      id: data,
      url: `/${this.envId}/product/business/${targetGoal.workspaceId}/plan/targetExecute?sceneExecId=${data}`,
    };
  }

  public async TestRecordPaging(
    productId: string,
    planId: string,
    goalId?: string,
    pageNum = 1,
    pageSize = 10,
    search = "",
  ) {
    const res = await http.post(`xsea/report/list`, {
      workspaceId: productId,
      planId,
      goalId,
      pageNum,
      pageSize,
      name: search,
    });
    const data = res.data.object ?? {};
    return {
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list: (data.list ?? []).map((item: any) => ({
        id: item.id,
        name: item.title,
        url: `/${this.envId}/product/business/${item.workspaceId}/plan/targetExecuteDetail?id=${item.id}`,
      })),
    };
  }

  public async TestReportPaging(
    planId: string,
    pageNum = 1,
    pageSize = 10,
    search = "",
  ) {
    const res = await http.post(`xsea/plan/testReport/page`, {
      planId,
      pageNum,
      pageSize,
      name: search,
    });
    const data = res.data.object ?? {};
    return {
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list: (data.list ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: `/${this.envId}/product/business/${""}/plan/reportgen/${
          item.id
        }?planId=${planId}&type=view`,
      })),
    };
  }
}

const DFT_LINE = [
  {
    index: 1,
    period: 10,
    userNum: 200,
  },
  {
    index: 2,
    period: 60,
    userNum: 0,
  },
  {
    index: 3,
    period: 10,
    userNum: 200,
  },
  {
    index: 4,
    period: 60,
    userNum: 0,
  },
  {
    index: 5,
    period: 10,
    userNum: 200,
  },
  {
    index: 6,
    period: 60,
    userNum: 0,
  },
  {
    index: 7,
    period: 10,
    userNum: 200,
  },
  {
    index: 8,
    period: 60,
    userNum: 0,
  },
  {
    index: 9,
    period: 10,
    userNum: 200,
  },
  {
    index: 10,
    period: 60,
    userNum: 0,
  },
];
