import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Tag, Progress, Button, Space, Select, message, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, ProjectOutlined, SearchOutlined } from "@ant-design/icons";
import { getProjects } from "../services/projectService";
import { useAuth } from "../../context/AuthContext";

const { Title } = Typography;
const { Option } = Select;

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectsData, setProjectsData] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(user.teamId);
        const formattedData = data.map((project) => ({
          ...project,
          key: project._id,
        }));
        setProjectsData(formattedData);
        setFilteredProjects(formattedData);
      } catch (error) {
        message.error("Erro ao buscar projetos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user.teamId]);

  const filterProjectsByStatus = (status) => {
    if (status === "Todos") {
      setFilteredProjects(projectsData);
    } else {
      setFilteredProjects(projectsData.filter((project) => project.status === status));
    }
  };

  const filterProjectsByName = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = projectsData.filter((project) =>
      project.name.toLowerCase().includes(searchTerm)
    );
    setFilteredProjects(filtered);
  };

  const columns = [
    {
      title: "Nome do Projeto",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={{
            
            "Pendente": "orange",
            "Em andamento": "blue",
            "Concluído": "green",            
            "Revisão": "cyan",
            "Suspenso": "red",
            "Atrasado": "volcano",
            "Cancelado": "purple",
          }[status] || "default"}
        >
          {status}
        </Tag>
      ),
    },
    { title: "Data de Início", dataIndex: "startDate", key: "startDate" },
    { title: "Data de Término", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "Progresso",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => <Progress percent={progress} status="active" />,
    },
  ];

  return (
    <div style={{ paddingLeft: "65px" , paddingRight: '65px'}}>
      <Title level={4}>
        <ProjectOutlined /> Projetos
      </Title>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {user.role !== 'Usuário' &&
        <Button
          type="primary"
          onClick={() => navigate("/projects/create")}
          icon={<PlusOutlined />}
        >
          Criar Projeto
        </Button>
        }
        <div>
          <Select defaultValue="Todos" onChange={filterProjectsByStatus} style={{ width: 200 }}>
            <Option value="Todos">Todos</Option>
            <Option value="Planejamento">Planejamento</Option>
            <Option value="Pendente">Pendente</Option>
            <Option value="Em andamento">Em andamento</Option>
            <Option value="Concluído">Concluído</Option>
            <Option value="Encerrado">Encerrado</Option>
            <Option value="A confirmar">A confirmar</Option>
            <Option value="Suspenso">Suspenso</Option>
            <Option value="Atrasado">Atrasado</Option>
            <Option value="Cancelado">Cancelado</Option>
          </Select>
          <br />
          <br />
          <Input
            prefix={<SearchOutlined />}
            placeholder="Pesquisar"
            onChange={filterProjectsByName}
            style={{ width: 200 }}
          />
        </div>
      </Space>
      <Card>
        <Table
          dataSource={filteredProjects}
          columns={columns}
          pagination={{ pageSize: 3 }}
          rowKey="key"
          loading={loading}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => {
              if(record.permissions == 'all' && user.role !== 'Administrador'){
                return message.info("Apenas os administradores podem vizualizar esse projecto.")
              } 
              navigate(`/projects/${record.key}`)
            
            
            },
          })}
        />
      </Card>
    </div>
  );
};

export default ProjectsPage;
