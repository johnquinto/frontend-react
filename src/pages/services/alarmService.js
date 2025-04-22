import axios from "axios";

export const getAlarm = async (userId) => {
    return axios.get(`https://backend-express-ndpe.onrender.com/api/teams/alarm/${userId}`);
};

export const deleteAlarms = async (userId) => {
    return axios.delete(`https://backend-express-ndpe.onrender.com/api/teams/alarm/${userId}`);
};