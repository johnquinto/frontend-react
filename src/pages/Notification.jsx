import { DeleteOutlined, NotificationOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, message, Modal, Row, Space, Typography } from "antd";

import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteOneNotification, deleteNotification } from "./services/notificationService";

const { Title, Text } = Typography;
const socket = io("https://backend-express-8anj.onrender.com"); // Endereço do servidor WebSocket

const Notification = () => {
  const { resetUserNotification , notifications} = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loadedNotifications, setLoadedNotifications] = useState([]);
  const userId = user?.id || null;

  useEffect(() => {
    // Carregar notificações do servidor
    socket.emit("loadUserNotifications", userId);

    socket.on("loadNotifications", (loadedNotifications) => {
      const sortedNotifications = loadedNotifications.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLoadedNotifications(sortedNotifications);
    });
  }, [userId, notifications]);

  const handleNotifi = (project) => {
    if (project !== null) {
      navigate(`/projects/${project._id}`);
    } else {
      message.error("O projeto foi eliminado.");
    }
  };

  const handleDelSingleNot = (notificationId) => {
    Modal.confirm({
      title: "Deseja eliminar esta notificação?",
      onOk: async () => {
        try {
          await deleteOneNotification(notificationId); // Remover no servidor
          setLoadedNotifications((prev) =>
            prev.filter((item) => item._id !== notificationId)
          );
          message.success("Notificação eliminada com sucesso.");
        } catch (error) {
          console.error("Erro ao eliminar notificação:", error);
          message.error("Erro ao eliminar notificação.");
        }
      },
    });
  };

  const handleDelAllNot = () => {
    Modal.confirm({
      title: "Deseja eliminar todas as notificações?",
      onOk: async () => {
        try {
          await deleteNotification(user.id); // Remover todas no servidor
          setLoadedNotifications([]);
          resetUserNotification();
          message.success("Todas as notificações foram eliminadas com sucesso.");
        } catch (error) {
          console.error("Erro ao eliminar notificações:", error);
          message.error("Erro ao eliminar notificações.");
        }
      },
    });
  };

  return (
    <div style={{ paddingLeft: "65px", paddingRight: "65px" }}>
      <Space
        style={{
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <Title level={4}>
          <NotificationOutlined /> Notificações
        </Title>
        <Button type="default" icon={<DeleteOutlined />} onClick={handleDelAllNot}>
          Eliminar todas
        </Button>
      </Space>

      {loadedNotifications.length > 0 ? (
        <Row gutter={[16, 16]}>
          {loadedNotifications.map((item) => (
            <Col xs={24} sm={12} md={8} key={item._id}>
              <Card
                hoverable
                bordered
                style={{
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget.querySelector(".delete-btn");
                  if (btn) btn.style.display = "block";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.querySelector(".delete-btn");
                  if (btn) btn.style.display = "none";
                }}
                onClick={() => handleNotifi(item.project)}
              >
                <Space size="middle" style={{ width: "100%" }}>
                  <NotificationOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.notification}</Text>
                    <br />
                    <Text type="secondary">Recebido em: {new Date(item.date).toLocaleString()}</Text>
                  </div>
                  <RightOutlined />
                </Space>

                {/* Botão de deletar que aparece no hover */}
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelSingleNot(item._id);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    display: "none", // Escondido por padrão
                  }}
                  className="delete-btn"
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Nenhuma notificação disponível" />
      )}
    </div>
  );
};

export default Notification;
