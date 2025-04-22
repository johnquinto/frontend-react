// import { Badge } from "antd";
// import React, { useState, useEffect } from "react";

// const ConnectionStatus = () => {
//   const [isOnline, setIsOnline] = useState(navigator.onLine);

//   // Função para testar se há realmente Internet
//   const checkInternetConnection = async () => {
//     try {
//       const response = await fetch("https://www.google.com", {
//         mode: "no-cors",
//         cache: "no-store",
//       });
//       setIsOnline(true);
//     } catch (error) {
//       setIsOnline(false);
//     }
//   };

//   useEffect(() => {
//     // Atualiza o status inicial
//     checkInternetConnection();

//     const handleOnline = () => checkInternetConnection();
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     // Verifica a cada 10 segundos
//     const interval = setInterval(checkInternetConnection, 10000);

//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//       clearInterval(interval);
//     };
//   }, []);

//   return (
//     <>
//       {isOnline ? (
//         <Badge dot={true} offset={[1, 3]} color="green" status="processing" text="Online" />
//       ) : (
//         <Badge dot={true} offset={[1, 3]} color="red" status="default" text="Offline" />
//       )}
//     </>
//   );
// };

// export default ConnectionStatus;

import { Badge } from "antd";
import React, { useState, useEffect } from "react";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Testa a conexão real com a Internet
  const checkInternetConnection = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    try {
      const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      setIsOnline(response.ok);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Verifica a conexão inicial
    checkInternetConnection();

    const handleOnline = () => checkInternetConnection();
    const handleOffline = () => setIsOnline(false);

    // Adiciona ouvintes de eventos
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Badge
      dot={true}
      offset={[1, 3]}
      color={isOnline ? "green" : "red"}
      status={isOnline ? "processing" : "default"}
      text={isOnline ? "Online" : "Offline"}
    />
  );
};

export default ConnectionStatus;
