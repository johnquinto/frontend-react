import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Progress,
  Select,
  Button,
  Tag,
  List,
  Upload,
  message,
  Typography,
  Modal,
  Space,
  Divider,
  notification,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  PaperClipOutlined,
  EditOutlined,
  ProjectOutlined,
  FormOutlined,
  DeleteOutlined,
  StopOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import { useParams, useNavigate } from "react-router-dom";
import { deleteTask, getAllTasks, getTask, updateTask } from "../services/taskService";
import { useAuth } from "../../context/AuthContext";
import TaskUploadModal from "../../components/task/TaskUploadModal";
import { supabase } from "../../utils/supabaseClient";
import AllTasksDone from "../../components/icons/AllTasksDone";
import { useTheme } from "../../context/ThemeContext";
import TaskLinkModal from "../../components/task/TaskLinkModal";

const { Option } = Select;
const { Title } = Typography;
const { confirm } = Modal;

const TaskManagementPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState([]);
  const { isDarkTheme } = useTheme();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isModalUploadVisible, setIsModalUploadVisible] = useState(false);
  const [isModalLinkVisible, setIsModalLinkVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isAnother, setIsAnother] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  const [isAnexoWarningVisible, setIsAnexoWarningVisible] = useState(false);
  const [anexoWarningTask, setAnexoWarningTask] = useState(null);
  const [anexoProgress, setAnexoProgress] = useState(0);

  const fetchData = async () => {
    try {
      const response = await getAllTasks(user.teamId);

      if (user.role !== "Administrador") {
        const data = response.filter((task) => {
          return (
            task.project.status !== 'Concluído' && 
            task.responsible._id == user.id &&
            task.project.permissions !== 'all' &&
            task.project.permissions !== 'read'
          )
        });

        if(data.length == 0){
          // setAllCompleted(true)
          setSelectedTask([])
          setFilteredTasks([])
          
        }
        
        if (data.every((data) => data.status == "Concluída")) {
          setAllCompleted(true)
          setSelectedTask([])
          setFilteredTasks([])          
        } else {
          setSelectedTask(data)
          setFilteredTasks(data)          
        }
        setTasks(data);
      } else {
        //Admin
        setSelectedTask(response)
        setFilteredTasks(response)
        setTasks(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateTaskSelected = async () => {
    if (selectedTask.length > 0) {
      const value = selectedTask.map((task) => {
        return task._id;
      });
      const data = tasks.filter((task) => task._id == value[0]);       

      setSelectedTask(data);

      await updateTask(data[0]._id, { ...data[0], userName: user.id })

    }

    if (taskId) {
      const data = tasks.filter((task) => task._id == taskId);

      setSelectedTask(data);
    }
  };

  useEffect(() => {
    updateTaskSelected();
  }, [tasks]);

  // Função para calcular o progresso da tarefa com base nas subtarefas concluídas
  const calculateProgress = (task) => {
    const completedSubtasks = task.subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    const totalSubtasks = task.subtasks.length;
    return totalSubtasks === 0
      ? 0
      : Math.floor((completedSubtasks / totalSubtasks) * 100);
  };

  const handleStatusChange = (id, status) => {
    /*setSelectedTask */ setTasks((prev) =>
    prev.map((task) => (task._id === id ? { ...task, status } : task))
  );
  };

  const handleSubtaskToggle =  async (taskId, subtaskId) => {
    const projectId = selectedTask[0].project._id
    const check = async () => {
      try {
        const res = await getTask(projectId, taskId);
        return res.documents.length;
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    const atual = await check(); // pega length de documentos no banco
    console.log(atual); // Agora sim funciona e imprime o valor
    

    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task._id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask._id === subtaskId) {
              return { ...subtask, completed: !subtask.completed };
            }
            return subtask;
          });
    
          const newProgress = calculateProgress({
            ...task,
            subtasks: updatedSubtasks,
          });
          const noDocuments = atual === 0;
          
          if (newProgress >= 50 && noDocuments) {
            setAnexoWarningTask(task);
            setAnexoProgress(newProgress);
            setIsAnexoWarningVisible(true);
            setSelectedTask([task]);
            setIsModalUploadVisible(true);
            return task; // Cancela update local
          }
          
    
          let status = "Pendente";
          if (newProgress === 100) status = "Concluída";
          else if (newProgress > 0) status = "Em andamento";
    
          return {
            ...task,
            subtasks: updatedSubtasks,
            progress: newProgress,
            status,
          };
        }
    
        return task;
      });
    });
    
    
  };
   
  const handleAnotherTask = (value) => {
    if (!value) return;

    const data = tasks.filter((task) => task._id == value);

    navigate(`/tasks-management/${data[0].project._id}/${value}/`);

    setIsAnother(true)
    setTimeout(() => {

      setIsAnother(false)
      setSelectedTask(data);

    }, 400);

  };

  const handleAdminReview = (id) => {
    confirm({
      title: "Revisar progresso",
      icon: <ExclamationCircleOutlined />,
      content: "Deseja validar o progresso desta tarefa?",
      onOk() {
        message.success("Progresso validado pelo admin!");
      },
      onCancel() {
        message.info("Revisão cancelada.");
      },
    });
  };

  const handleDeleteTask = async (taskId) => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: "Tem certeza que deseja excluir esta tarefa?",
      onOk: async () => {
        try {

          const task = await getTask(projectId, taskId)

          // Obter os handles dos arquivos no campo 'documents'
          const documents = task.documents; // Array de objetos
          const fileHandles = documents.map((doc) => doc.handle);

          // Deletar os arquivos do Supabase
          for (const handle of fileHandles) {
            const { error } = await supabase.storage
              .from("joaoquinto") // Substitua "bucket-name" pelo nome do bucket no Supabase
              .remove([handle]);

            if (error) {
              console.error(`Erro ao excluir o arquivo com handle: ${handle}`, error);
              return res.status(500).json({ message: "Erro ao excluir arquivos do Supabase", error });
            }
          }


          await deleteTask(taskId, user.id);
          notification.success({
            message: "Tarefa Excluída",
            description: "A tarefa foi excluída com sucesso!",
          });
          updateTaskSelected()
          fetchData()
        } catch (error) {
          notification.error({
            message: "Erro ao excluir a tarefa",
            description: error.message,
          });
        }
      },
    });
  };

  const filterTasks = (status) => {
    if (status === "Todas") {

      if (tasks.length == 0) {
        return        
      }

      setIsAnother(true)
      setTimeout(() => {
        setIsAnother(false)
        setFilteredTasks(tasks);
        setSelectedTask([tasks[0]])

      }, 100);

      return
    } else {
      const filteredtasks = tasks.filter((task) => task.status === status)

      setIsAnother(true)
      setTimeout(() => {

        setIsAnother(false)
        filteredtasks.length > 1 ?
          setSelectedTask([filteredtasks[0]]) :
          setSelectedTask(filteredtasks)

        setFilteredTasks(filteredtasks);

      }, 100);


    }
  };

  return (
    <>
      <div style={{ paddingLeft: "65px", paddingRight: "65px" }}>
        <Title level={4}>
          <FormOutlined />
          {""} Gestor de Tarefas
        </Title>

        <Select
          placeholder="Filtrar Tarefas"
          style={{ width: "150px" }}
          onChange={(value) => filterTasks(value)}
        >
          <Option value="Todas">Todas</Option>
          <Option value="Pendente">Pendente</Option>
          <Option value="Em andamento">Em andamento</Option>
          <Option value="Concluída">Concluída</Option>
          <Option value="Suspensa">Suspensa</Option>

        </Select>
        <Select
          placeholder="Selecionar Tarefa"
          showSearch
          style={{ float: "right", width: "200px" }}
          color="default"
          filterOption={(input, option) =>
            option?.children.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value) => handleAnotherTask(value)}
        >
          {filteredTasks.map((task) => (
            <Option key={task._id} value={task._id}>
              {task.name}
            </Option>
          ))}
        </Select>

        <br />
        <br />
        {selectedTask.length == 1 &&
          <List
            loading={isAnother}
            dataSource={selectedTask}
            renderItem={(task) => (
              <List.Item
              >
                <Card
                  style={{ width: "100%" }}
                  title={
                    <>
                      {task.name}{" "}
                      <Tag
                        icon={
                          task.status === "Concluída" ? (
                            <CheckCircleOutlined />
                          ) : task.status === "Em andamento" ? (
                            <PauseCircleOutlined />
                          ) : task.status === "Atrasada" ? (
                            <ClockCircleOutlined />
                          ) : task.status === "Cancelada" ? (
                            <CloseCircleOutlined />
                          ) : task.status === "Suspensa" ? (
                            <StopOutlined />
                          ) : null
                        }
                        color={
                          task.status === "Concluída"
                            ? "green"
                            : task.status === "Em andamento"
                              ? "blue"
                              : task.status === "Atrasada"
                                ? "orange"
                                : task.status === "Cancelada"
                                  ? "red"
                                  : task.status === "Suspensa"
                                    ? "gray"
                                    : "yellow"
                        }
                      >
                        {task.status}
                      </Tag>
                    </>
                  }
                  extra={
                    <Space>
                      <Button
                        icon={<ProjectOutlined />}
                        title="Ver Projecto"
                        onClick={() => {
                          navigate(`/projects/${task.project._id}/`);
                        }}
                      />

                      <Button
                        icon={<PaperClipOutlined />}
                        title="Anexos"
                        onClick={() => setIsModalUploadVisible(true)}
                      />

                      <Button
                        icon={<LinkOutlined />}
                        title="Link"
                        onClick={() => setIsModalLinkVisible(true)}
                      />

                      {user.role !== 'Usuário' &&
                        <>
                          <Button
                            icon={<EditOutlined />}
                            title="Editar"
                            onClick={() =>
                              navigate(
                                `/projects/${task.project._id}/tasks/${task._id}/edit`
                              )
                            }
                          />
                          <Button
                            icon={<DeleteOutlined />}
                            title="Eliminar"
                            onClick={() => handleDeleteTask(task._id)}
                          />
                        </>}
                    </Space>
                  }
                >
                  <p>Progresso:</p>
                  <Progress percent={calculateProgress(task)} />

                  <p>Status:</p>
                  <Select
                    disabled={selectedTask[0].status == 'Cancelada' && user.role == "Usuário"}
                    value={task.status}
                    onChange={(value) => handleStatusChange(task._id, value)}
                    style={{ width: "100%" }}
                  >
                    <Option value="Em andamento">Em andamento</Option>
                    <Option value="Concluída">Concluída</Option>
                    {user.role !== 'Usuário' &&

                      <Option value="Cancelada">Cancelada</Option>
                    }
                    <Option value="Suspensa">Suspensa</Option>
                  </Select>

                  <p>Subtarefas:</p>
                  <List
                    dataSource={task.subtasks}
                    renderItem={(subtask) => (
                      <List.Item>
                        <Button
                          disabled={
                            selectedTask[0].status == 'Cancelada' ||
                            selectedTask[0].status == 'Suspensa'
                          }
                          type={subtask.completed ? "primary" : "default"}
                          onClick={() =>
                            handleSubtaskToggle(task._id, subtask._id)
                          }
                        >
                          {subtask.completed ? "✔️" : "⏳"} {subtask.name}
                        </Button>
                      </List.Item>
                    )}
                  />
                  {user.role !== 'Usuário' &&
                    <Button
                      type="dashed"
                      onClick={() => handleAdminReview(task.id)}
                      style={{ marginTop: "10px" }}
                    >
                      Revisar Progresso (Admin)
                    </Button>
                  }

                </Card>
              </List.Item>
            )}
          />
        }

        { selectedTask.length == 0 &&

          <div style={{
            textAlign: 'center',
            marginTop: '70px'
          }}>

            <AllTasksDone
              width="125"
              height="125"
              color={isDarkTheme ? ' #022c4e' : 'rgba(2, 44, 78, 0.77)'}
            />
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Typography.Text type="secondary">
                Sem tarefas 
              </Typography.Text>
            </div>
          </div>

        }

        {selectedTask.length !== 0 &&

        <>
        <TaskUploadModal
          projectId={selectedTask[0].project._id}
          taskId={selectedTask[0]._id}
          isModalUploadVisible={isModalUploadVisible}
          setIsModalUploadVisible={setIsModalUploadVisible}
        />
        
        <TaskLinkModal
          projectId={selectedTask[0].project._id}
          taskId={selectedTask[0]._id}
          isModalLinkVisible={isModalLinkVisible}
          setIsModalLinkVisible={setIsModalLinkVisible}    
        />

        <Modal
          title="⚠️ Documento Obrigatório"
          open={isAnexoWarningVisible}
          onOk={() => setIsAnexoWarningVisible(false)}
          onCancel={() => setIsAnexoWarningVisible(false)}
          okText="Entendi"
          cancelText="Fechar"
        >
          {anexoWarningTask && (
            <div>
              <p><b>Tarefa:</b> {anexoWarningTask.name}</p>
              <p>
                A tarefa atingiu <b>{anexoProgress}%</b> de progresso, mas ainda não possui nenhum documento anexado.
              </p>
              <p>
                🔒 Para garantir <b>conformidade</b>, <b>rastreabilidade</b> e <b>qualidade</b>, é obrigatório anexar arquivos de suporte a partir de 50% de execução.
              </p>
              <p>
                📎 Exemplos de documentos: Relatórios, evidências fotográficas, prints, documentos técnicos, etc.
              </p>
              <p>
                💡 <b>Dica:</b> Quanto mais anexos, melhor para <b>auditorias</b>, <b>revisões técnicas</b> e <b>comunicação entre equipes</b>.
              </p>
            </div>
          )}
        </Modal>
        </>
        }

      </div>
    </>
  );
};

export default TaskManagementPage;
