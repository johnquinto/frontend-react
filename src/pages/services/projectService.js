// src/services/projectService.js
import axios from "axios";
import dayjs from "dayjs";

export const createProject = async (projectData) => {
  return axios.post("https://backend-express-8anj.onrender.com/api/projects/", projectData);
};

export const addDocs = async (projectId , projectData) => {
  return axios.post(`https://backend-express-8anj.onrender.com/api/projects/docs/${projectId}`, projectData);
};

export const getUsers = async (teamId) => {
  const response = await axios.get(
    `https://backend-express-8anj.onrender.com/api/users/team/${teamId}`
  );
  return response.data; // Retorna a lista de usuários da equipe
};

export const getUserById = async (userId) => {
  const response = await axios.get(
    `https://backend-express-8anj.onrender.com/api/users/project/${userId}`
  );
  const userData = response.data;
  return userData;
};

export const getProjects = async (teamId) => {
  const response = await axios.get(
    `https://backend-express-8anj.onrender.com/api/projects/team/${teamId}`
  );

  // Formata as datas de início e término de cada projeto
  const formattedProjects = response.data.map((project) => ({
    ...project,
    startDate: dayjs(project.startDate).format('DD-MM-YYYY'),
    dueDate: dayjs(project.dueDate).format('DD-MM-YYYY'),    
  }));

  return formattedProjects;
};

export const getProjectById = async (projectId) => {
  const response = await axios.get(
    `https://backend-express-8anj.onrender.com/api/projects/one/${projectId}`
  );
  const projectData = response.data;

  return {
    ...projectData,
    startDate: projectData.startDate ? dayjs(projectData.startDate) : null,
    dueDate: projectData.dueDate ? dayjs(projectData.dueDate) : null,
  };
};

export const updateProject = async (projectId, projectData) => {
  const response = await axios.put(
    `https://backend-express-8anj.onrender.com/api/projects/${projectId}`,
    projectData
  );
  return response.data;
};

export const deleteProject = async (projectId, userName, teamId) => {
  const response = await axios.delete(
    `https://backend-express-8anj.onrender.com/api/projects/${projectId}/${teamId}?userName=${userName}`
  );
  return response.data;
};

export const deleteAllProjects = async (userName, id) => {
  const response = await axios.delete(
    `https://backend-express-8anj.onrender.com/api/projects/${id}?userName=${userName}`
  );
  return response.data;
};
