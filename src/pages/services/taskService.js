import axios from 'axios';

const API_URL = 'https://backend-express-8anj.onrender.com/api/tasks'; // Altere para a URL da sua API

// Função para obter tarefas de um projeto
export const getTasks = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao obter tarefas: ' + error.message);
  }
};

// Função para obter tarefas de um team
export const getAllTasks = async (teamId) => {
  try {
    const response = await axios.get(`${API_URL}/${teamId}/total`);
    return response.data.tasks;
  } catch (error) {
    throw new Error('Erro ao obter tarefas: ' + error.message);
  }
};

export const getTask = async (projectId, taskId) => {
  try {
    const response = await axios.get(`${API_URL}/${projectId}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao obter tarefa: ' + error.message);
  }
};

// Função para criar uma nova tarefa
export const createTask = async (taskData) => {
  return await axios.post(`${API_URL}`, taskData);
};

// Função para atualizar o status de uma tarefa
export const updateTaskStatus = async (taskId, data) => {
    return await axios.put(`${API_URL}/${taskId}/status`, data);
};

// Função para atualizar uma tarefa
export const updateTask = async (taskId, taskData) => {
  return await axios.put(`${API_URL}/${taskId}`, taskData);

};

export const updateTaskDocs = async (taskId, taskData) => {
  return await axios.put(`${API_URL}/${taskId}/docs`, taskData);

};

// Função para eliminar uma tarefa
export const deleteTask = async (taskId, userName) => {
  try {
    const response = await axios.delete(`${API_URL}/${taskId}?userName=${userName}`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao eliminar tarefa: ' + error.message);
  }
};
