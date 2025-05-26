import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Form, Typography, Select, Space, notification, DatePicker, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getTask, updateTask } from '../services/taskService';
import { getUsers, getProjectById, getUserById } from '../services/projectService';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import io from "socket.io-client";

const { Title } = Typography;
const { Option } = Select;

const socket = io("https://backend-express-8anj.onrender.com");

const EditTaskPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState({
    name: '',
    description: '',
    dueDate: null,
    priority: 'Médio',
    status: 'Em andamento',
    responsible: { id: "", username: "" },
    subtasks: [],
  });
  const [users, setUsers] = useState([]);
  const [selectedSubtask, setSelectedSubtask] = useState({});
  const [taskSName, setTaskSName] = useState(null);
  const [currentResponsible, setCurrentResponsible] = useState("")

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskData = await getTask(projectId, taskId);
        setCurrentResponsible(taskData.responsible)
        setTask({
          ...taskData,
          dueDate: taskData.dueDate ? dayjs(taskData.dueDate) : null,
        });
      } catch (error) {
        notification.error({ message: 'Erro ao carregar a tarefa', description: error.message });
      }
    };

    const fetchUsers = async () => {
      try {
        const projectData = await getProjectById(projectId);
        const memberIds = projectData.members;
        const teamUsers = await Promise.all(
          memberIds.map((id) => getUserById(id))
        );
        setUsers(teamUsers);
      } catch (error) {
        notification.error({ message: 'Erro ao carregar usuários', description: error.message });
      }
    };

    fetchTaskData();
    fetchUsers();
  }, [projectId, taskId]);

  const handleSaveTaskChanges = async () => {

    const subtasksToSave = task.subtasks.map(subtask => {
      // Remove o _id temporário antes de salvar
      const { _id, ...subtaskToSave } = subtask;
      return subtaskToSave;
    });
  
    const taskDataToSave = { ...task, subtasks: subtasksToSave };

  

    try {     


    if(currentResponsible._id !== taskDataToSave.responsible._id){
      const notificationData = {
        users: [currentResponsible._id],
        notification: `A tarefa "${taskDataToSave.name}", foi atribuída a "${taskDataToSave.responsible.username}" como novo responsável da tarefa .`,
        project: taskDataToSave.project,
        teamId: user.teamId,
      }
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationData);  

      const notificationDataP = {
        users: [taskDataToSave.responsible._id],
        notification: `A Tarefa de "${currentResponsible.username}", foi atribuída a ti como novo responsável "${taskDataToSave.name}".`,
        project: taskDataToSave.project,
        teamId: user.teamId,
      }
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationDataP);  
    }
          
      await updateTask(taskId, { ...taskDataToSave, userName: user.id });

      const notificationData = {
        users: [taskDataToSave.responsible._id],
        notification: `A tarefa "${taskDataToSave.name}", foi atualizada pelo Administrador com novas informações .`,
        project: taskDataToSave.project,
        teamId: user.teamId,
      }
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationData); 


      message.success("As alterações foram salvas com sucesso!")
      navigate(-1);
    } catch (error) {

      console.log(error);
      message.error("Erro ao salvar alterações. Tente novamente")
    }
  };

  const handleESTask = (subtaskId) => {
    const data = task.subtasks.find((subtask) => subtask._id === subtaskId);
    setSelectedSubtask(data || {});
    setTaskSName(data?.name || '');
  };

  const handleSubtaskChange = (e) => {
   
    setTaskSName(e.target.value);

    setSelectedSubtask({ ...selectedSubtask, name: e.target.value });
  };

  const handleUpdateSubtask = () => {
    if (!taskSName?.trim()) {
      notification.warning({ message: 'Nome da subtarefa não pode ser vazio' });
      return;
    }

    if (selectedSubtask._id) {
      const updatedSubtasks = task.subtasks.map((subtask) =>
        subtask._id === selectedSubtask._id ? { ...subtask, name: taskSName } : subtask
      );
      setTask({ ...task, subtasks: updatedSubtasks });
    } else {

      const newSubtask = {
        _id: `temp-${Math.floor(Math.random() * 1000 )}`, // Gera um id temporário
        name: taskSName,
        completed: false,
      };
      
      setTask({ ...task, subtasks: [...task.subtasks, newSubtask] });
    }

    setTaskSName(null);
    setSelectedSubtask({});
  };

  const handleDeleteSubtask = () => {
    const updatedSubtasks = task.subtasks.filter((subtask) => subtask._id !== selectedSubtask._id);
    setTask({ ...task, subtasks: updatedSubtasks });
    setTaskSName(null);
    setSelectedSubtask({});
  };

  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px' }}>
      <Title level={4}>Editar Tarefa</Title>
      <Space style={{ marginBottom: '20px' }}>
        <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Space>
      <Card>
        <Form layout="vertical">
          <Form.Item label="Nome da Tarefa">
            <Input
              value={task.name}
              onChange={(e) => setTask({ ...task, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Descrição">
            <Input.TextArea
              rows={4}
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Subtarefas">
            <Select
              // value={taskSName}
              placeholder="Selecionar ou criar subtarefa"
              onChange={handleESTask}
            >
              {task.subtasks.map((subtask) => (
                <Option key={subtask._id} value={subtask._id}>
                  {subtask.name}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="Editar subtarefa"
              value={taskSName}
              onChange={handleSubtaskChange}
              style={{ marginTop: 10 }}
            />
            <Space style={{ marginTop: 10 }}>
              <Button icon={<PlusOutlined />} onClick={handleUpdateSubtask}>Salvar</Button>
              {selectedSubtask._id && (
                <Button icon={<DeleteOutlined />} danger ghost onClick={handleDeleteSubtask}>
                  Excluir
                </Button>
              )}
            </Space>
          </Form.Item>
          <Form.Item label="Data de Conclusão">
            <DatePicker
              style={{ width: '100%' }}
              value={task.dueDate}
              onChange={(date) => setTask({ ...task, dueDate: date })}
            />
          </Form.Item>
          <Form.Item label="Prioridade">
            <Select
              value={task.priority}
              onChange={(value) => setTask({ ...task, priority: value })}
            >
              <Option value="Alta">Alta</Option>
              <Option value="Médio">Médio</Option>
              <Option value="Baixa">Baixa</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status">
            <Select
              value={task.status}
              onChange={(value) => setTask({ ...task, status: value })}
            >
                  <Option value="Pendente">Pendente</Option>
                  <Option value="Em andamento">Em andamento</Option>
                  <Option value="Concluída">Concluída</Option>
                  <Option value="Atrasada">Atrasada</Option>
                  <Option value="Cancelada">Cancelada</Option>
                  <Option value="Suspensa">Suspensa</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Responsável">
            <Select
              value={task.responsible._id}
              onChange={(value) => {
                const selectedUser = users.find((user) => user._id === value);
                setTask({ ...task, responsible: selectedUser });
              }}
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button 
            style={{
              float: 'right'
            }} 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveTaskChanges}
            >
            Guardar Alterações
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default EditTaskPage;
