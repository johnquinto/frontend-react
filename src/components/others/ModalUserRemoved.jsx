import React, { useEffect, useState } from "react";
import { Modal, Typography, Space } from "antd";
import { AlertOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ModalUserRemoved = () => {
  const navigate = useNavigate(); 
  const { isUserRemoved } = useNotification(); 
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isUserRemoved) {
      setModalVisible(true);
      const timer = setTimeout(() => {
        setModalVisible(false);
        navigate("/"); // Redireciona o usuário após 8 segundos
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isUserRemoved, navigate]);

  return (
    <Modal
      open={modalVisible}
      closable={false} // Impede o fechamento manual do modal
      footer={null} // Remove os botões de ação
      centered // Centraliza o modal
      styles={{body:{
        textAlign: "center",
        padding: "30px",}
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Ícone de alerta */}
        <AlertOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />

        {/* Título principal */}
        <Title level={4} style={{ color: "#ff4d4f" }}>
          Você foi removido do grupo!
        </Title>

        {/* Explicação detalhada */}
        <Text>
          Infelizmente, você foi removido do grupo pelos administradores. Isso pode acontecer por diversas razões, como mudanças na equipe ou ajustes no projeto.
        </Text>

        <Text type="secondary">
          Se você acredita que isso foi um engano, entre em contato com os administradores para obter mais informações.
        </Text>

        {/* Ícone informativo adicional */}
        <InfoCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
      </Space>
    </Modal>
  );
};

export default ModalUserRemoved;
