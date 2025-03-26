"use client";

import React from "react";
import ProductSelector from "./xsea/productSelector";
import ScriptSelector from "./xsea/scriptSelector";
import Welcome from "./xsea/welcome";
import ProductSelectorBye from "./xsea/productSelector/bye";
import ScriptSelectorBye from "./xsea/scriptSelector/bye";
import StateConfirm from "./xsea/stateConfirm";
import Targets from "./xsea/targets";

const workspaceId = "920951261988982784";
const planId = "841675362774847488";

const LABELS_MAP = {
  "[ui-products]": "产品",
  "[ui-jmeter-scripts]": "JMeter脚本",
  "[ui-gatling-scripts]": "Gatling脚本",
  "[ui-shell-scripts]": "Shell脚本",
  "[ui-plans]": "计划",
  "[ui-goals]": "目标",
  "[ui-records]": "记录",
} as any;

const getSearch = (message: string) => {
  const firstLine = message.split("\n")[0];
  return (firstLine.split(":")[1] ?? "").trim();
};

const XSeaSelector = (props: { message: string }) => {
  if (props.message.startsWith("@ui-products")) {
    return (
      <ProductSelector
        search={getSearch(props.message).replaceAll("产品", "")}
      />
    );
  }
  if (props.message.startsWith("@ui-scripts")) {
    return (
      <ScriptSelector
        search={getSearch(props.message).replaceAll("脚本", "")}
      />
    );
  }
  if (props.message.startsWith("@ui-welcome")) {
    return <Welcome />;
  }
  if (props.message.startsWith("@ui-ProductSelectorBye")) {
    return <ProductSelectorBye />;
  }
  if (props.message.startsWith("@ui-ScriptSelectorBye")) {
    return <ScriptSelectorBye />;
  }
  if (props.message.startsWith("@ui-StateConfirm")) {
    return <StateConfirm />;
  }
  if (props.message.startsWith("@ui-target")) {
    return <Targets />;
  }
  return props.message;
};

export default XSeaSelector;
