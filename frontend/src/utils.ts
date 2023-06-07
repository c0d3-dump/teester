import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { env } from "./config";
import { DbModel, FakerModel, ProjectModel } from "./redux/models/project";
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

export const runApi = async (host: string, apiModel: any) => {
  let status: number = -1;
  let data: string = "";
  let res: any;

  try {
    switch (apiModel.methodType) {
      case "GET":
        res = await axios.get(host + apiModel.endpoint, {
          headers: apiModel.header,
          params: apiModel.body,
          withCredentials: true,
        });
        status = res.status;
        data = res.data;
        break;
      case "POST":
        res = await axios.post(host + apiModel.endpoint, apiModel.body, {
          headers: apiModel.header,
          withCredentials: true,
        });
        status = res.status;
        data = res.data;
        break;
      case "DELETE":
        res = await axios.delete(host + apiModel.endpoint, {
          headers: apiModel.header,
          data: apiModel.body,
          withCredentials: true,
        });
        status = res.status;
        data = res.data;
        break;
      case "PUT":
        res = await axios.put(host + apiModel.endpoint, apiModel.body, {
          headers: apiModel.header,
          withCredentials: true,
        });
        status = res.status;
        data = res.data;
        break;
    }
  } catch (error: any) {
    if (!error.response) {
      status = -1;
      data = "";
    } else {
      status = error.response.status;
      data = error.response.data;
    }
  }

  return {
    status,
    data,
  };
};

export const runQuery = async (
  dbType: string,
  dbUrl: string,
  dbModel: DbModel
) => {
  return axios.post(`${env.SERVER_URL}/db-query`, {
    dbType,
    dbUrl,
    query: dbModel.query,
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

export const generateSql = (tableName: string, data: FakerModel[]) => {
  let sql = `INSERT INTO ${tableName}(`;

  const columns = data.map((d) => d.fieldName);
  const columnValues = data.map((d) => d.type);

  sql += columns.join(",");
  sql += ") VALUES (";

  // TODO: generate new fake data here
  sql += columnValues.map((cn) => generateFakeData(cn)).join(",");

  return sql + ");";
};

export const generateFakeData = (name: string) => {
  const data = FakerType.find((fk) => fk.name === name)?.gen();
  if (typeof data === "string") {
    return `"${data}"`;
  }
  return data;
};
