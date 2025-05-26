import React, { useEffect, useState } from "react";
import { deleteAlarms, getAlarm } from "./services/alarmService";
import { useAuth } from "../context/AuthContext";
import { Button, Empty, message, Modal, Space, Table, Typography } from "antd";
import { AlertOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
const { Title } = Typography;

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState('');

  const fetchData = async () => {
    const alarms = await getAlarm(user.id);  

    // console.log(alarms.data);

    setAlarms(alarms.data);

    const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Africa/Luanda');
    const data = await response.json();
    // console.log(data);
    setDateTime(dayjs(data.dateTime).format('YYYY-MM-DD'));

  };

  useEffect(() => {
    fetchData();
  }, [user.id]);


  const handleDelete = () => {
    Modal.confirm({
      title: "Deseja eliminar todos alertas?",
      onOk: async () => {
        try {
          await deleteAlarms(user.id); // Remover todas no servidor

          message.success("Todos os alertas foram eliminadas com sucesso");
          fetchData();

        } catch (error) {
          console.error("Erro ao eliminar notificações:", error);
          message.error("Erro ao eliminar notificações.");
        }
      },
    });
  }

  const columns = [
    {
      title: "Alerta",
      dataIndex: "alarm",
      key: "alarm",
    },
    {
      title: "Término",
      dataIndex: "task",
      key: "task",
      render: (task) => new Date(task?.dueDate).toLocaleDateString() || "N/A",
    },
    {
      title: "Projeto",
      dataIndex: "project",
      key: "project",
      render: (project) => project?.name || "N/A",
    },
    {
      title: "Tarefa",
      dataIndex: "task",
      key: "task",
      render: (task) => task?.name || "N/A",
    },
    // {
    //     title: 'Data',
    //     dataIndex: 'date',
    //     key: 'date',
    //     render: (date) => new Date(date).toLocaleString(),
    // },
  ];

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
          <AlertOutlined /> Alertas
        </Title>
        <Title level={5}>
          Hoje: {dateTime || ''}
        </Title>
        <Button
          type="default"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        >
          Eliminar todas
        </Button>
      </Space>

      <br />
    
      {alarms.length > 0 ? (
        <Table
          dataSource={alarms}
          columns={columns}
          rowKey="_id"
          style={{ cursor: "pointer" }}
          onRow={(record) => ({
            onClick: () => {
              if (!record.isEmpty) {
                  if (record.project.permissions == 'all' && user.role !== 'Administrador') {
                    return message.info("Apenas os administradores podem vizualizar esse projecto.")
                  }
                  navigate(
                    `/projects/${record.project._id}`
                  );
              }
            },
          })}
        />
      ) : (
        <Empty description="Nenhuma alerta disponível" />
      )}
    </div>
  );
};

export default Alarm;
