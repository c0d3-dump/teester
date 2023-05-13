import axios from "axios";
import { env } from "./config";
import { ProjectModel } from "./redux/models/project";

export const setProjects = (payload: ProjectModel[]) => {
  return axios.post(`${env.SERVER_URL}/postData`, {
    data: JSON.stringify(payload),
  });
};

export const getProjects = () => {
  return axios.get(`${env.SERVER_URL}/getData`);
};
