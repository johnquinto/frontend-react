import React, { useContext, useEffect, useState } from "react";
import { Modal } from "antd";
import { DisconnectOutlined, WifiOutlined } from "@ant-design/icons";
import { ConnectionContext } from "../../context/ConnectionContext";
import WifiOff from "../icons/WifiOff";

const ConnectionModal = () => {
  const { isOnline } = useContext(ConnectionContext);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  useEffect(() => {
    if (isOnline) {
      // Exibe o modal de conexão restaurada por 1 segundo
      setShowOnlineModal(true);
      const timer = setTimeout(() => {
        setShowOnlineModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Limpa o timer ao desmontar ou mudar de estado
    }
  }, [isOnline]); // Executa quando `isOnline` muda

  return (
    <>
      {/* Modal para conexão offline */}
      
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WifiOff />
            <span>Sem Conexão</span>
          </div>
        }
        open={!isOnline}
        closable={false} // Impede o fechamento manual do modal
        footer={null} // Remove os botões de ação
      >
        <p>Você está offline! Por favor, verifique sua conexão com a Internet.</p>
      </Modal>

      {/* Modal para conexão restaurada */}
      {/*  <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WifiOutlined style={{ color: "rgb(0, 206, 10)" }} />
            <span>Conexão Restaurada</span>
          </div>
        }
        open={showOnlineModal}
        closable={false} // Impede o fechamento manual do modal
        footer={null} // Remove os botões de ação
      >
        <p>Você está online!</p>
      </Modal> */}
    </>
  );
};

export default ConnectionModal;
