import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  message,
  Progress,
  Table,
  Button,
  Modal,
  Spin,
  Space,
  Divider,
  Select,
  DatePicker,
} from "antd";
import {
  ProjectOutlined,
  TeamOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Importa o contexto do tema
import {
  getProjectsCount,
  getUsersCount,
  getTasksCount,
  getTaskProgress,
  getActivity,
  deleteActivity,
} from "./services/dashboardService";
import { getTeamInfo } from "./services/teamService";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [taskProgress, setTaskProgress] = useState(0);
  const [teamInfo, setTeamInfo] = useState({});
  const [activity, setActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [activityDates, setActivityDates] = useState([]);
  const [activityDatesDelete, setActivityDatesDelete] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const projects = await getProjectsCount(user.teamId);
      const users = await getUsersCount(user.teamId);
      const tasks = await getTasksCount(user.teamId);
      const team = await getTeamInfo(user.teamId);
      const progress = await getTaskProgress(user.teamId);

      const activityDataN = await getActivity(user.teamId); 
      
      const activityData = activityDataN.filter((a)=> a.responsible._id !== user.id)

      

      const sortedActivityData = activityData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );     
 
      

      const uniqueDates = [...new Set(activityData.map((item) => {
        const date = new Date(item.date);

        // Função para mapear o número do mês para o nome
        const getMonthName = (month) => {
          const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          return months[month - 1]; // Subtrai 1 pois os meses começam do 0
        }

        const month = getMonthName(date.getMonth() + 1); // Obtemos o nome do mês
        const year = date.getFullYear(); // Obtemos o ano

        return `${month}/${year}`; // Formato: Mês/Ano
      }))]

      setActivity(sortedActivityData);
      setFilteredActivity(sortedActivityData);
      setActivityDates(uniqueDates); // Atualiza estado com datas únicas

      setActivityDatesDelete({
        value: []
      })

      setProjectCount(projects);
      setUserCount(users);
      setTaskCount(tasks);
      setTeamInfo(team);
      setTaskProgress(progress);
    } catch (error) {
      message.error("Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, [user.teamId]);

  // Função para filtrar por mês/ano
  const filterByMonth = (value) => {
    setSelectedMonth(value); // Atualiza o mês selecionado

    if (value === "Todos") {
      setFilteredActivity(activity); // Exibe todas as atividades
    } else {
      const filtered = activity.filter((item) => {
        const date = new Date(item.date);
        const month = date.getMonth() + 1; // Janeiro é 0
        const year = date.getFullYear();

        const [monthName, selectedYear] = value.split("/");

        const monthIndex = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
        ].indexOf(monthName);

        // Compara o mês e o ano
        return month === monthIndex + 1 && year === parseInt(selectedYear, 10);
      });

      setFilteredActivity(filtered); // Atualiza as atividades exibidas
    }
  };


  const columns = [
    {
      title: "Nome",
      dataIndex: "responsible",
      key: "responsible",
      render: (responsible) => (
        <Space>
          <span>{responsible.username}</span>
        </Space>
      ),
    },
    {
      title: "Função",
      dataIndex: "responsible",
      key: "responsible",
      render: (responsible) => (
        <Space>
          <span>{responsible.role == 'Usuário'? 'Funcionário/a' : 'Administrador/a'}</span>
        </Space>
      ),
    },
    {
      title: "Atividade",
      dataIndex: "activity",
      key: "activity",
    },
    {
      title: "Projeto",
      dataIndex: "projectName",
      key: "project",
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(), // Formata a data
    },
  ];

  const handleRefresh = () => {
    setRefresh(true);
    fetchDashboardData();
  };

  const filterActivity = (date, dateString) => {
    if (dateString) {
      const filtered = activity.filter((item) => {
        const itemDate = new Date(item.date).toLocaleDateString();
        return itemDate === new Date(date).toLocaleDateString();
      });
      setFilteredActivity(filtered);
    } else {
      setFilteredActivity(activity);
    }
  };

  if (loading || !userCount) {
    return (
      <div>
        <Spin delay={10} />
      </div>
    )
  }

  const handleDeleteActivity = async () => {

    // console.log(activityDatesDelete.value) 
    // return
    if (activityDatesDelete.value.length < 1) {
      Modal.confirm({
        title: "Tem certeza que deseja excluir tudo?",
        onOk: async () => {

          try {
            const response = await deleteActivity(user.teamId, activityDatesDelete)

            console.log(response);

            message.success('Atividades excluídas com sucesso!');

            fetchDashboardData()
            setActivityDatesDelete({ value: [] });


          } catch (error) {
            console.error('Erro ao Excluir:', error.response?.data.message);
            notification.warning({ message: 'Erro ao Excluir:', description: error.response?.data.message });
          }
        }

      })
    }
    else {
      try {
        const response = await deleteActivity(user.teamId, activityDatesDelete)

        console.log(response);

        message.success('Atividades excluídas com sucesso!');
        fetchDashboardData()
        setActivityDatesDelete({ value: [] });

      } catch (error) {
        console.error('Erro ao Excluir:', error.response?.message);
        notification.warning({ message: 'Erro ao Excluir:', description: error.response?.message });
      }
    }

  }

  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px', }}>
      <Space
        style={{
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Title level={4}>
          <DashboardOutlined /> Inicial
          <Paragraph>{teamInfo.name}</Paragraph>
        </Title>

        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refresh}
        >
          Atualizar
        </Button>
      </Space>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Link to="/projects">
            <Card>
              <Statistic
                title={
                  <span style={{ color: isDarkTheme ? "#d1d1d1" : "#333333" }}>
                    Total de Projetos
                  </span>
                }
                value={projectCount}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Link to={"/users"}>
            <Card>
              <Statistic
                title={
                  <span style={{ color: isDarkTheme ? "#d1d1d1" : "#333333" }}>
                    Total de Pessoal
                  </span>
                }
                value={userCount}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Link to="/tasks-list/none">
            <Card>
              <Statistic
                title={
                  <span style={{ color: isDarkTheme ? "#d1d1d1" : "#333333" }}>
                    Total de Tarefas
                  </span>
                }
                value={taskCount}
                prefix={<ScheduleOutlined />}
              />
            </Card>
          </Link>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card title="Progresso das Tarefas">
            <Progress percent={taskProgress} status="active" />
          </Card>
        </Col>
      </Row>

      {user.role !== 'Usuário' &&
        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={24}>
            <Card title="Atividades">
              <DatePicker placeholder="Filtrar por dia" onChange={filterActivity} style={{ marginBottom: "16px" }} />
              <Select
                placeholder="Filtrar por mês"
                style={{ marginLeft: "10px", width: "160px" }}
                onChange={filterByMonth}
                value={selectedMonth} // Valor selecionado
              >
                <Select.Option value="Todos">Todos</Select.Option>
                {activityDates.map((date) => (
                  <Select.Option key={date} value={date}>
                    {date}
                  </Select.Option>
                ))}
              </Select>
              <Table
                dataSource={filteredActivity}
                columns={columns.map((col) => ({ ...col, width: "100px" }))}
                pagination={false}
                rowKey="_id"
                className="custom-scrollbar"
                loading={loading}
                scroll={{ y: 270 }}
                style={{ cursor: "pointer", overflowY: "auto" }}
                onRow={(record) => ({
                  onClick: () => {
                    if (record.project && record.projectName !== "Sem projeto") {
                      navigate(`/projects/${record.project}`);
                    } else {
                      message.warning(
                        "Este registro não possui projeto associado."
                      );
                    }
                  },
                })}
              />
              <br />
              <div style={{ float: "right" }}>
                <Select mode="multiple"
                  placeholder="Esvaziar datas"
                  style={{ marginRight: "10px", width: "200px" }}
                  value={activityDatesDelete.value}
                  maxTagCount={1}
                  onChange={(value) => {
                    setActivityDatesDelete((prev) => ({
                      ...prev, value
                    }));
                  }}
                >
                  {activityDates.map((date) => (
                    <Select.Option key={date} value={date}>
                      {date}
                    </Select.Option>
                  ))}
                </Select>
                <Button icon={<DeleteOutlined />} onClick={handleDeleteActivity} />
              </div>
            </Card>
          </Col>
        </Row>

      }
    </div>
  );
};



export default HomePage;
