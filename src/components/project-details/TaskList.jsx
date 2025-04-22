import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Tag,
  Button,
  Dropdown,
  Menu,
  Space,
  Progress,
  Modal,
  Input,
  message,
  notification,
  Table,
} from "antd";
import {
  EditOutlined,
  SettingOutlined,
  SearchOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import {
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../../pages/services/taskService";
import { getUsers } from "../../pages/services/projectService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import dayjs from 'dayjs'
import Title from "antd/es/typography/Title";

const TaskList = ({ projectId, newTask, project }) => {
  const [tasks, setTasks] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filterText, setFilterText] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Função para buscar tarefas e usuários do projeto
    const fetchTasksAndUsers = async () => {      

      try {
        const [taskResponse, userResponse] = await Promise.all([
          getTasks(projectId),
          getUsers(user.teamId),
        ]);
      
        // Obtem apenas os IDs dos responsáveis pelas tarefas
        const responsibleIds = new Set(
          taskResponse.map((task) => task.responsible)
        );

        // Filtra os usuários que são responsáveis pelas tarefas
        const relevantUsers = userResponse.filter((user) =>
          responsibleIds.has(user._id)
        );

        // Mapeia os usuários relevantes para um objeto de fácil acesso { userId: userName }
        const usersMap = relevantUsers.reduce((acc, user) => {
          acc[user._id] = user.username;
          return acc;
        }, {});

        // Adiciona o nome do responsável nas tarefas
        const tasksWithResponsibleName = taskResponse.map((task) => ({
          ...task,
          responsibleName: usersMap[task.responsible] || "Não atribuído",
        }));

        if (user.role !== 'Usuário') {
          setTasks(tasksWithResponsibleName);          
        }else{
          setTasks(tasksWithResponsibleName.filter((task) => task.responsible === user.id));                   
        }
      } catch (error) {
        
        // message.error("Erro ao buscar tarefas ou usuários.");
      }
    };

    fetchTasksAndUsers();
  }, [newTask]);

  const showDescription = (task) => {
    setCurrentTask(task);
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setCurrentTask(null);
  };

  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Pendente":
        return "yellow";
      case "Em andamento":
        return "blue";
      case "Concluída":
        return "green";
      case "Atrasada":
        return "orange";      
      case "Cancelada":
        return "red";
      case "Suspensa":
        return "grey";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Atributo",
      dataIndex: "attribute",
      key: "attribute",
    },
    {
      title: "Valor",
      dataIndex: "value",
      key: "value",
    },
  ];
  const data = () => {
    return [
      { key: "1", attribute: "Nome", value: currentTask ? currentTask.name : "" },
      { key: "2", attribute: "Descrição", value: currentTask ? currentTask.description : "" },
      { key: "2", attribute: "Prioridade", value: currentTask ? currentTask.priority : "" },
      { key: "3", attribute: "Responsável", value: currentTask ? currentTask.responsibleName : "" },
      { key: "4", attribute: "Prazo", value: currentTask ? new Date(currentTask.dueDate).toLocaleDateString() : "" },
      { key: "5", attribute: "Progresso", value: currentTask ? currentTask.progress : "" },


      { key: "6", attribute: "Criado em", value: currentTask ? new Date(currentTask.createdAt).toLocaleDateString() : "" },
      { key: "7", attribute: "Atualizado em", value: currentTask ? new Date(currentTask.updatedAt).toLocaleDateString() : "" },

    ]
  }

  return (
    <>
      <Title level={4}>
        Tarefas ({tasks.length})
      </Title>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Pesquisar Tarefas"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: "16px" }}
      />
      <div>
        <List        
          pagination={{ pageSize: 1 }}                   
          grid={{ gutter: 16, column: 1 }}
          dataSource={filteredTasks}
          renderItem={(task) => (
            <List.Item>
              <Card
              
                title={task.name}
                style={{ width: "100%", minWidth: "300px" }}
                extra={
                  <Space>  
                    {user.role !== 'Usuário' &&
                    <Button
                      style={{ width: '50px' }}
                      icon={<EditOutlined />}
                      onClick={() =>{
                     
                        navigate(
                          `/projects/${projectId}/tasks/${task._id}/edit`
                        )}
                      }
                      size="small"
                    />}
                                        
                    {/* <Button style={{ width: '50px' }} icon={<PaperClipOutlined />} size="small"/> */}

                    <Button style={{ width: '50px' }} icon={<InfoCircleOutlined />} onClick={() => showDescription(task)} size="small"/>                                     
                 
                  </Space>
                }
              >
                <div style={{ display: "flex", flexDirection: "column" , cursor: 'pointer'}}   
                   onClick={() =>{
                    if (project.status == "Concluído" && user.role !== "Administrador" ) {
                      return
                    }
                    navigate(
                      `/tasks-management/${projectId}/${task._id}/`
                      
                    )}
                  }>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong>{" "}
                    <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Responsável:</strong> {task.responsibleName}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Prazo:</strong>{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "Sem prazo definido"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Prioridade:</strong>
                    <Tag
                      color={
                        task.priority === "Alta"
                          ? "red"
                          : task.priority === "Média"
                            ? "orange"
                            : "green"
                      }
                    >
                      {task.priority || "Indefinido"}
                    </Tag>
                  </p>
                  <Progress
                    percent={task.progress}
                    size="small"
                    status="active"
                  />
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>

      <Modal
        title="Detalhes da Tarefa"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={data()}
          pagination={false} // Desativa a paginação
        />
      </Modal>
    </>
  );
};

export default TaskList;
