import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Progress,
  Button,
  Space,
  Spin,
  Divider,
} from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TaskList from "../../components/project-details/TaskList";
import CommentsSection from "../../components/project-details/CommentsSection";
import MembersSection from "../../components/project-details/MembersSection";
import AddTaskButton from "../../components/project-details/AddTaskButton";
import { LeftOutlined, EditOutlined } from "@ant-design/icons";
import { getProjectById, getUsers } from "../services/projectService";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

import truncateText from "../../utils/truncateText";


const { Title, Paragraph } = Typography;

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation()
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState([]);
  const { user } = useAuth();

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectData = await getProjectById(projectId);
      const usersData = await getUsers(user.teamId);
      setUsers(usersData);

      setTimeout(() => {
        setProject(projectData);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar detalhes do projeto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleAddTask = (task) => {
    console.log("Nova tarefa adicionada:", task);
    setNewTask(task)
  };

  if (loading || !project)
    return (
      <div>
        {" "}
        <Spin delay={10} />{" "}
      </div>
    );

  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px' }}>

      <Title level={4}>{truncateText(project.name, 60)}</Title>

      <Space style={{ marginBottom: "20px" }}>
        <Button
          color="default"
          onClick={() => navigate(-1)}
          icon={<LeftOutlined />}
        >
          Voltar
        </Button>
      </Space>

      {user.role !== 'Usuário' &&
        <Button
          style={{ float: 'right' }}
          type="primary"
          onClick={() => navigate(`/projects/${projectId}/edit`)}
          icon={<EditOutlined />}
        >
          Editar Projeto
        </Button>
      }

      {/* <Card style={{ marginBottom: "20px" }} title={truncateText(project.name, 60)}> */}
      <Card style={{ marginBottom: "20px" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Paragraph>
              <strong>Data de Início:</strong>{" "}
              {project.startDate
                ? dayjs(project.startDate).format("DD/MM/YYYY")
                : "N/A"}
            </Paragraph>
          </Col>
          <Col span={8}>
            <Paragraph>
              <strong>Data de Término:</strong>{" "}
              {project.dueDate
                ? dayjs(project.dueDate).format("DD/MM/YYYY")
                : "N/A"}
            </Paragraph>
          </Col>

          <Col span={8}>
            <Paragraph>
              <strong>Status:</strong>{" "}
              <Tag
                color={{

                  "Pendente": "orange",
                  "Em andamento": "blue",
                  "Concluído": "green",
                  "Revisão": "cyan",
                  "Suspenso": "red",
                  "Atrasado": "volcano",
                  "Cancelado": "purple",
                  
                }[project.status] || "default"}
              >
                {project.status}
              </Tag>
            </Paragraph>
          </Col>
        </Row>
        <Progress
          percent={project.progress}
          status="active"
          style={{ marginBottom: "20px" }}
        />
        <Title level={4}>Descrição</Title>
        <Paragraph>{project.description}</Paragraph>
      </Card>
      <Row justify="space-between" style={{ marginBottom: "20px" }}>
        <MembersSection memberIds={project.members} project={project} projectId={projectId} />


        <AddTaskButton
          project={project}
          onAddTask={handleAddTask}
          memberIds={project.members}
          projectId={projectId}
        />
      </Row>

      <TaskList
        project={project}
        projectId={project._id}
        newTask={newTask}
        onEdit={(taskKey) =>{
          navigate(`/projects/${projectId}/tasks/${taskKey}/edit`)}
        }
      />
      <CommentsSection 
        projectId={project._id} 
        memberIds={project.members}
        project={project.permissions}
        />
    </div>
  );
};

export default ProjectDetailsPage;
