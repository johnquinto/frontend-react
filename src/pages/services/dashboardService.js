// src/services/dashboardService.js
import axios from 'axios';

// Função para obter o total de projetos de uma equipe
export const getProjectsCount = async (teamId) => {
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/projects/team/${teamId}/count`);
  return response.data.count;
};

// Função para obter o total de usuários de uma equipe
export const getUsersCount = async (teamId) => {
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/users/team/${teamId}/count`);
  return response.data.count;
};

export const getTasksCount = async (teamId) => {
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/tasks/${teamId}/count`);
  return response.data.count;
};

export const getTaskProgress = async (teamId) => {
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/tasks/progress/${teamId}`);
  return response.data.progress;
};

export const getActivity = async (teamId) => {
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/teams/activity/${teamId}`);
  return response.data;
}

export const deleteActivity = async (teamId, values)=>{

  // console.log(values)

  const response = await axios.delete(`https://backend-express-8anj.onrender.com/api/teams/activity/${teamId}`,

    {
      params: { values }, // Passa os meses como query params
    }
  );
  return response.data;
}