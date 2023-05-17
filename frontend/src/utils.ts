import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { env } from "./config";
import { ApiModel, DbModel, ProjectModel } from "./redux/models/project";

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

export const runApi = async (host: string, apiModel: ApiModel) => {
  let status;
  let data;
  let res;

  try {
    switch (apiModel.methodType) {
      case "GET":
        res = await axios.get(host + apiModel.endpoint, {
          data: apiModel.body,
        });
        status = res.status;
        data = res.data;
        break;
      case "POST":
        res = await axios.post(host + apiModel.endpoint, apiModel.body);
        status = res.status;
        data = res.data;
        break;
      case "DELETE":
        res = await axios.delete(host + apiModel.endpoint, {
          data: apiModel.body,
        });
        status = res.status;
        data = res.data;
        break;
      case "PUT":
        res = await axios.put(host + apiModel.endpoint, apiModel.body);
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

export const isDeepEqual = (object1: any, object2: any) => {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if (
      (isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
};

const isObject = (object: any) => {
  return object != null && typeof object === "object";
};
