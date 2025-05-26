import React, { useEffect, useState } from "react";
import { Table, Typography, Button, Space, Select, Card, Spin, Progress, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircleOutlined,
  HourglassOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  WarningOutlined,
  StopOutlined,
  LeftOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { getAllTasks, getTasks } from "../services/taskService";
import { useAuth } from "../../context/AuthContext";
import { getTasksCount } from "../services/dashboardService";

const { Title } = Typography;
const { Option } = Select;

const STATUS_OPTIONS = [
  "Pendente",
  "Em andamento",
  "Concluída",
  "Pausada",
  "Em revisão",
  "Atrasada",
  "Suspensa",
  "Cancelada",
];

const TaskListPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [taskCount, setTaskCount] = useState(0)
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 5;
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      
      if (projectId !== 'none') {
        const response = await getAllTasks(user.teamId); 
        
        const data = response.filter((task) =>
          task.project._id == projectId
        )     
        setTaskCount(data.length)
        setTasks(data);      
        setFilteredTasks(data);

        
      }else{
       const response = await getAllTasks(user.teamId);
       const tasks = await getTasksCount(user.teamId);
       setTaskCount(tasks)
       setTasks(response);      
       setFilteredTasks(response);

      }

 
   
    } catch (error) {
      console.log("Erro ao buscar tarefas", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    
    fetchTasks();

  }, [user.teamId]);

  const filterTasks = (status) => {
    if (status === "Todos") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === status));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Concluída":
        return <CheckCircleOutlined style={{ color: "green" }} />;
      case "Em andamento":
        return <HourglassOutlined style={{ color: "orange" }} />;
      case "Pendente":
        return <ExclamationCircleOutlined style={{ color: "red" }} />;
      case "Atrasada":
        return <WarningOutlined style={{ color: "darkred" }} />;
      case "Suspensa":
        return <StopOutlined style={{ color: "gray" }} />;
      case "Cancelada":
        return <StopOutlined style={{ color: "black" }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Space>
          {getStatusIcon(status)}
          <span>{status}</span>
        </Space>
      ),
    },
    {
      title: "Progresso",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (       
         <Progress percent={progress} status="active" />       
      ),
    },
    {
      title: "Responsável",
      dataIndex: "responsible",
      key: "responsible",
      render: (responsible) => (       
        <Space>          
          <span>{responsible.username}</span>
        </Space>     
      ),
    },
    {
      title: "Projecto",
      dataIndex: "project",
      key: "project",
      render: (project) =>(
        <Space>          
          <span>{project.name}</span>
        </Space>
      ),
    },
  ];

  const paginatedData = (data) => {
    const pageCount = Math.ceil(data.length / pageSize);
    const lastPageItemCount = data.length % pageSize || pageSize;

    if (lastPageItemCount < pageSize) {
      return [
        ...data,
        ...Array(pageSize - lastPageItemCount)
          .fill({})
          .map((_, idx) => ({
            key: `empty-${idx}`,
            name: "",
            status: "",
            isEmpty: true,
          })),
      ];
    }
    return data;
  };

  return (
    <div style={{ paddingLeft: "65px" , paddingRight: '65px'}}>
      <Title level={4}>
      <ScheduleOutlined /> 
      {projectId !== 'none'? ' Tarefas do projecto' : ' Total de Tarefas'}</Title>
      <Space
        style={{
          marginBottom: "20px",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button
          type="default"
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
        <Select
          defaultValue="Todos"
          onChange={filterTasks}
          style={{ width: 200 }}
        >
          <Option value="Todos">Todos ({taskCount})</Option>
          {STATUS_OPTIONS.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Space>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          pagination={{ pageSize: 4 }}        
          rowKey="project"
          rowClassName="fixed-height-row"
          loading={loading}
          onRow={(record) => ({
            onClick: () => {
              if (!record.isEmpty) {
                if (projectId == 'none') {
                  if(record.project.permissions == 'all' && user.role !== 'Administrador'){
                    return message.info("Apenas os administradores podem vizualizar esse projecto.")
                  } 
                  navigate(
                    `/projects/${record.project._id}`
                  );


                }
               
              }
            },
            style: record.isEmpty
              ? { cursor: "default" }
              : { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
};

export default TaskListPage;
