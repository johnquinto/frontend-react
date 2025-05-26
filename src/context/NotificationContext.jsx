import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();
const socket = io("https://backend-express-8anj.onrender.com"); // Inicializa o socket.io

export const NotificationProvider = ({ children }) => {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isUserRemoved, setIsUserRemoved] = useState(false);

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const { user } = useAuth();
  const teamId = user ? user.teamId : null;
  const userId = user ? user.id : null;

  useEffect(() => {
    if (userId) {
      // Registrar o userId no servidor ao conectar
      socket.emit('register', userId);
    }

    if (teamId) {
      // Entrar na sala do time para carregar mensagens
      socket.emit('joinTeam', teamId);

      // Receber mensagens antigas
      socket.on("loadMessages", (loadedMessages) => {
        setMessages(loadedMessages);
      });

      // Escutar novas mensagens em tempo real
      socket.on("receiveMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setHasNewMessage(true); // Define que há uma nova mensagem
      });
    }

    if (userId) {
      // Carregar notificações do usuário logado
      socket.emit('loadUserNotifications', userId);

      // Receber notificações antigas
      socket.on("loadNotifications", (loadedNotifications) => {   
       setNotifications(loadedNotifications);
      });

      // Escutar novas notificações em tempo real
      socket.on("receiveNotification", (notification) => {
        setNotifications((prevNotifications) => [...prevNotifications, notification]);
        setHasNewNotification(true); // Define que há uma nova notificação
      });

      socket.on("receiveUserRemoved", (message) => {
        console.log(1);
        console.log(message);
        setIsUserRemoved(true);
      });      
    }

    if(userId && teamId){
      

      //Atualizar os status dos progressos e tarefas
      socket.emit("updateTasksAndProjects", userId, teamId)

      socket.on("receiveAlert", (alert) => {
        console.log(alert);
      })      
    }

    // Remover listeners ao desmontar o componente
    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.off("loadNotifications");
      socket.off("receiveNotification");
      socket.off("receiveUserRemoved");

      // socket.off("updateTasksAndProjects");
      socket.off("receiveAlert");      
    };
  }, [teamId, userId]);

  const resetMessageNotification = () => {
    setHasNewMessage(false);
  };

  const resetUserNotification = () => {
    setHasNewNotification(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        messages,
        hasNewMessage,
        resetMessageNotification,
        notifications,
        hasNewNotification,
        resetUserNotification,
        isUserRemoved
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
