// src/components/Sidebar.js

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ProjectOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  FormOutlined,
  NotificationOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Badge } from "antd";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext"; // Importando o contexto de notificação
import { useAuth } from "../context/AuthContext"; // Importando o contexto de notificação
import ConnectionStatus from "../components/connection/ConnectionStatus";
import { getAlarm } from "../pages/services/alarmService";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { isDarkTheme } = useTheme();
  const { user } = useAuth();
  const {
    hasNewMessage,
    resetMessageNotification,
    resetUserNotification,
    hasNewNotification,
  } = useNotification(); // Usando o contexto de notificação

  const [dotMessage, setDotMessage] = useState(false);
  const [dotNotification, setDotNotification] = useState(false);
  const [dotAlarm, setDotAlarm] = useState(false);

  useEffect(() => {
    setDotMessage(hasNewMessage);
  }, [hasNewMessage]);

  useEffect(() => {
    setDotNotification(hasNewNotification);
  }, [hasNewNotification]);

  useEffect(() => {
    const fecthAlarms = async () => {
      const alarms = await getAlarm(user.id);

      if (alarms.data.length > 0) {
        setDotAlarm(true);
        return
      }
      setDotAlarm(false);
    };
    fecthAlarms();
  }, []);

  const menuItems = user.role !== 'Administrador' ? [
    { key: "/home", icon: <DashboardOutlined />, label: "Inicial" },
    { key: "/projects", icon: <ProjectOutlined />, label: "Projetos" },
    { key: "/tasks-management", icon: <FormOutlined />, label: "Tarefas" },
    {
      key: "/chat",
      icon: (
        <Badge
          dot={dotMessage}
          offset={[-2, 5]}
          size={200}
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            boxShadow: "none",
          }}
        >
          <MessageOutlined />
        </Badge>
      ),
      label: "Chat",
    },
    {
      key: "/notification",
      icon: (
        <Badge
          dot={dotNotification}
          offset={[-2, 5]}
          size={200}
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            boxShadow: "none",
          }}
        >
          <NotificationOutlined />
        </Badge>
      ),
      label: "Notificações",
    },
    {
      key: "/alarm",
      icon: (
        <Badge
          dot={dotAlarm}
          offset={[-2, 5]}
          size={200}
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            boxShadow: "none",
          }}
        >
          <AlertOutlined />{" "}
        </Badge>
      ),
      label: "Alertas",
    },
    { key: "/profile", icon: <UserOutlined />, label: "Perfil" },
    { key: "/settings", icon: <SettingOutlined />, label: "Definições" },
  ]: [
    { key: "/home", icon: <DashboardOutlined />, label: "Inicial" },
    { key: "/projects", icon: <ProjectOutlined />, label: "Projetos" },
    { key: "/tasks-management", icon: <FormOutlined />, label: "Tarefas" },
    {
      key: "/chat",
      icon: (
        <Badge
          dot={dotMessage}
          offset={[-2, 5]}
          size={200}
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            boxShadow: "none",
          }}
        >
          <MessageOutlined />
        </Badge>
      ),
      label: "Chat",
    },
    {
      key: "/notification",
      icon: (
        <Badge
          dot={dotNotification}
          offset={[-2, 5]}
          size={200}
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            boxShadow: "none",
          }}
        >
          <NotificationOutlined />
        </Badge>
      ),
      label: "Notificações",
    },    
    { key: "/profile", icon: <UserOutlined />, label: "Perfil" },
    { key: "/settings", icon: <SettingOutlined />, label: "Definições" },
  ]

  const getSelectedKey = () => {
    for (let item of menuItems) {
      if (location.pathname.startsWith(item.key)) {
        return item.key;
      }
    }
    return "";
  };

  const handleMenuClick = (key) => {
    if (key === "/chat") {
      resetMessageNotification();
      setDotMessage(false);
    }

    if (key === "/notification") {
      resetUserNotification();
      setDotNotification(false);
    }

    if (key === "/alarm") {
      setDotAlarm(false);
    }
  };

  return (
    <Sider
      trigger={
        <div
          style={{
            background: isDarkTheme ? " #022c4e" : " #f4f4f4",
          }}
        >
          {" "}
          <ConnectionStatus />{" "}
        </div>
      }
      collapsible
      collapsed={!collapsed}
      onCollapse={setCollapsed}
      style={{
        backgroundColor: isDarkTheme ? "#0c1b2e" : "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "64px",
          color: isDarkTheme ? "#e0e0e0" : "#333333",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
          background: isDarkTheme ? "#022c4e" : "#f4f4f4",
        }}
      >
        <h3 style={{ color: isDarkTheme ? "#d1d1d1" : "#0050b3" }}>Pleno</h3>
      </div>

      <Menu
        theme={isDarkTheme ? "dark" : "light"}
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{
          backgroundColor: isDarkTheme ? "#0c1b2e" : "#ffffff",
          color: isDarkTheme ? "#d1d1d1" : "#333333",
        }}
        onClick={({ key }) => handleMenuClick(key)}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.key}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
