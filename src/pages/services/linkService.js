import axios from "axios";

export const createLinkTask = async (data) => {
  return axios.post("https://backend-express-8anj.onrender.com/api/links/task", data);
};

export const updateLinkTask = async (taskId , data) => {
  return axios.put(`https://backend-express-8anj.onrender.com/api/links/task/${taskId}`, data);
};

export const createLinkProject = async (data) => {
  return axios.post("https://backend-express-8anj.onrender.com/api/links/project", data);
};

export const updateLinkProject = async (projectId , data) => {
  return axios.put(`https://backend-express-8anj.onrender.com/api/links/project/${projectId}`, data);
};
