// src/services/teamService.js
import axios from 'axios';

export const createTeam = async (teamData) => {
  return await axios.post('https://backend-express-8anj.onrender.com/api/teams/create', teamData);
};

export const joinTeam = async (joinData) => {
  return await axios.post('https://backend-express-8anj.onrender.com/api/teams/join', joinData);
};

export const getTeamInfo = async (teamId)=>{
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/teams/info/${teamId}`);
  return response.data;
}
export const updateTeam = async (teamId, data)=>{
  const response = await axios.put(`https://backend-express-8anj.onrender.com/api/teams/update/${teamId}`, {newName: data});
  return response.data;
}

export const deleteUser = async (userId)=>{
  const response = await axios.delete(`https://backend-express-8anj.onrender.com/api/users/${userId}`);
  return response.data;
}

export const updateUser = async (userId, values)=>{
  return await axios.put(`https://backend-express-8anj.onrender.com/api/users/team/${userId}`, values);
   
}
export const deleteTeam = async (teamId)=>{
  const response = await axios.delete(`https://backend-express-8anj.onrender.com/api/teams/${teamId}`);
  return response.data;
}

export const removeUserTeam = async (userId, adminId)=>{
  return await axios.put(`https://backend-express-8anj.onrender.com/api/users/spam/${userId}/${adminId}`);
}


export const checkTeamCode = async (teamCode)=>{
  const response = await axios.get(`https://backend-express-8anj.onrender.com/api/teams/check/${teamCode}`);
  return response.data;
}