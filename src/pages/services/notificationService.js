import axios from "axios";

export const deleteNotification = async (userId)=>{
    const response = await axios.delete(`https://backend-express-8anj.onrender.com/api/users/notification/all/${userId}`);
    return response.data;
  }
  
export const deleteOneNotification = async (notificationId) => {
    const response = await axios.delete(`https://backend-express-8anj.onrender.com/api/users/notification/one/${notificationId}`);
    return response.data;
  };


  
  