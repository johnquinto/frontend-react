import React, { createContext, useState, useEffect } from "react";

export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Função para testar se realmente há conexão com a Internet
  const checkInternetConnection = async () => {
    try {
      const response = await fetch("https://www.google.com", {
        mode: "no-cors", // Evita bloqueios por CORS
        cache: "no-store", // Evita pegar cache e pega uma resposta fresca
      });
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Atualiza o estado inicial baseado no ping
    checkInternetConnection();

    const handleOnline = () => checkInternetConnection();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Faz um ping a cada 10 segundos para verificar a conexão
    const interval = setInterval(checkInternetConnection, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline }}>
      {children}
    </ConnectionContext.Provider>
  );
};
