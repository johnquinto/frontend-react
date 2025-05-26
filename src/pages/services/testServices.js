import axios from "axios";

export const createTest = async (test) => {
  return await axios.post(`https://backend-express-8anj.onrender.com/api/tests/`, test);
};

export const getTests = async () => {
  return await axios.get(`https://backend-express-8anj.onrender.com/api/tests/`);
};
export const updateTest = async (id, test) => {
  return await axios.get(`https://backend-express-8anj.onrender.com/api/tests/${id}`, test);
};
