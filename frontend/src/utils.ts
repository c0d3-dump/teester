import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { env } from "./config";
import { ConfigModel, FakerModel, ProjectModel } from "./redux/models/project";
import { FakerType } from "./redux/models/project";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setProjects = (payload: ProjectModel[]) => {
  return axios.post(`${env.SERVER_URL}/postData`, {
    data: JSON.stringify(payload),
  });
};

export const getProjects = () => {
  return axios.get(`${env.SERVER_URL}/getData`);
};

export const runApi = async (
  host: string,
  apiModel: any,
  withCredentials: boolean
) => {
  let status: number = -1;
  let data: string = "";
  let res: any;

  try {
    switch (apiModel.methodType) {
      case "GET":
        res = await axios.get(host + apiModel.endpoint, {
          headers: apiModel.header,
          params: apiModel.body,
          withCredentials,
        });
        status = res.status;
        data = res.data;
        break;
      case "POST":
        res = await axios.post(host + apiModel.endpoint, apiModel.body, {
          headers: apiModel.header,
          withCredentials,
        });
        status = res.status;
        data = res.data;
        break;
      case "DELETE":
        res = await axios.delete(host + apiModel.endpoint, {
          headers: apiModel.header,
          data: apiModel.body,
          withCredentials,
        });
        status = res.status;
        data = res.data;
        break;
      case "PUT":
        res = await axios.put(host + apiModel.endpoint, apiModel.body, {
          headers: apiModel.header,
          withCredentials,
        });
        status = res.status;
        data = res.data;
        break;
    }
  } catch (error: any) {
    if (!error?.response) {
      status = -1;
      data = "";
    } else {
      status = error?.response?.status;
      data = error?.response?.data;
    }
  }

  return {
    status,
    data,
  };
};

export const runQuery = async (config: ConfigModel, query: string) => {
  return axios.post(`${env.SERVER_URL}/db-query`, {
    dbType: config.dbType,
    dbUrl: config.dbUrl,
    query,
  });
};

export const runUiTest = async (projectId: number, uiId: number) => {
  return axios.post(`${env.SERVER_URL}/run-ui-test`, {
    projectId,
    uiId,
  });
};

export const captureEvents = async (projectId: number, uiId: number) => {
  return axios.post(`${env.SERVER_URL}/capture-me`, {
    projectId,
    uiId,
  });
};

export const isDeepEqual = (targetObj: any, sourceObj: any) => {
  if (typeof targetObj !== "object" || typeof sourceObj !== "object") {
    if (typeof targetObj === "string" && targetObj.match(/@\{(.*?)\}/))
      return true;
    return targetObj === sourceObj;
  }

  for (let key in targetObj) {
    if (targetObj.hasOwnProperty(key)) {
      if (!sourceObj.hasOwnProperty(key)) {
        return false;
      }

      if (!isDeepEqual(targetObj[key], sourceObj[key])) {
        return false;
      }
    }
  }

  return true;
};

export const extractVariables = (targetObj: any, templateObj: any) => {
  const variables: any = {};

  for (const i in targetObj) {
    const targetOb = targetObj[i];

    for (const j in templateObj) {
      const templateOb = templateObj[j];
      const tempMap = templateOb.toString().match(/@\{(.*?)\}/);

      if (i === j && tempMap && tempMap[1].length > 0) {
        variables[tempMap[1]] = targetOb;
      }
    }
  }

  return variables;
};

export const replaceTokens = (data: string, tokens: any) => {
  const regex = /\$\{(.*?)\}/g;
  return data.replace(regex, (_, match) => tokens[match]);
};

export const generateSql = async (
  config: ConfigModel,
  tableName: string,
  data: FakerModel[]
) => {
  let sql = `INSERT INTO ${tableName}(`;

  const columns = data.map((d) => d.fieldName);
  const columnValues = data.map((d) => ({
    type: d.type,
    constraints: d.constraints,
  }));

  sql += columns.join(",");
  sql += ") VALUES (";

  const columnPromiseList = columnValues.map((cn) =>
    generateFakeData(config, cn.type, cn.constraints)
  );

  sql += (await Promise.all(columnPromiseList)).join(",");

  return sql + ");";
};

export const generateFakeData = async (
  config: ConfigModel,
  type: string,
  constraints: string
) => {
  let data;
  if (constraints?.split(",").length === 2) {
    const cons = constraints?.split(",");
    const res = await getTableData(config, cons[0], cons[1]);

    const randomIndex = Math.floor(Math.random() * res.data.length);
    data = res?.data?.[randomIndex]?.[cons[1]];
  } else {
    data = FakerType.find((fk) => fk.name === type)?.gen();
  }
  if (typeof data === "string") {
    return `"${data}"`;
  }
  return data;
};

export const getTableData = async (
  config: ConfigModel,
  tableName: string,
  columnName: string
) => {
  const sql = `SELECT ${columnName.trim()} FROM ${tableName.trim()};`;

  return runQuery(config, sql);
};
