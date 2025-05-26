import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-express-8anj.onrender.com/api', 
});

export const createComment = async (userId, projectId, teamId, content) => {  
  const data = { content: content };
  const response = await api.post(`/comments/${userId}/${projectId}/${teamId}`, data);
  return response.data;
};

export const editComment = async (userId ,commentId, content) => {
  const data = { content: content };
  const response = await api.put(`/comments/${userId}/${commentId}`, data);
  return response.data;
};

export const getComments = async (projectId, teamId) => {
  const response = await api.get(`/comments/${projectId}/${teamId}`);    
  return response;
  
};

export const deleteComment = async (commentId) => {
  const response =  await api.delete(`/comments/${commentId}`);
  return response.data
};