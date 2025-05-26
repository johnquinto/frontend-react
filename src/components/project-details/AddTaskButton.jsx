import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Select, message, notification } from 'antd';
import { FormOutlined, PlusOutlined, ScheduleOutlined } from '@ant-design/icons';
import { createTask } from '../../pages/services/taskService';
import { getProjectById, getUserById } from '../../pages/services/projectService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const { Option } = Select;
const socket = io("https://backend-express-8anj.onrender.com");

const AddTaskButton = ({ project, projectId, onAddTask, memberIds }) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [members, setMembers] = useState([]); // Armazena dados completos dos membros do projeto

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        
        console.log(project)
        
        const membersData = await Promise.all(memberIds.map(id => getUserById(id))); // Busca dados dos membros pelo ID
        setMembers(membersData); // Atualiza o estado com os membros
      } catch (error) {
        console.error("Erro ao carregar os membros:", error);
        message.error("Erro ao carregar os membros.");
      }
    };

    fetchMembers();
  }, [memberIds]);


  const handleAddTask = async (values) => {
    try {
      const taskData = {
        taskName: values.taskName,
        description: values.description,
        dueDate: values.dueDate, // Formata a data
        priority: values.priority,
        responsible: values.responsible,
        subtasks: values.subtasks.map((subtask) => ({
          name: subtask, // Mapeia cada subtarefa para um objeto com `name`
          completed: false, // Define como não concluída por padrão
        })),
        project: projectId,
        teamId: user.teamId,
        userName: user.id
      };      
      const response = await createTask(taskData);
      const newTask = response.data.task
      onAddTask(newTask);


      const notificationData = {
        users: [values.responsible],
        notification: `Nova tarefa "${values.taskName}"`,
        project: projectId,
        teamId: user.teamId,
      }
          
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationData);  

      message.success('Tarefa adicionada com sucesso!');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.response?.data.message);
      notification.warning({ message: 'Erro ao salvar tarefa', description: error.response?.data.message });
    }
  };

  return (
    <>
    <div>
    {user.role !== 'Usuário' ?
    (<Button type="primary"
    
    disabled={project.status == "Concluído" ? true : false}
    
    
    onClick={() => setIsModalVisible(true)} icon={<PlusOutlined />}>
        Adicionar Tarefa
      </Button>)
    :
    (<Button type="primary"  icon={<ScheduleOutlined />}
      onClick={() => navigate(
        `/tasks-list/${projectId}`
      )}
    >
        Tarefas do projecto
      </Button>)
    }
    {user.role !== 'Usuário' && 
    <Button type="primary"  icon={<ScheduleOutlined />}
      style={{
        marginLeft: '10px'        
      }}
      onClick={() => navigate(
        `/tasks-list/${projectId}`
      )}
    >
        Tarefas do projecto
      </Button>}
    </div>
     

      <Modal
        
        title="Adicionar Nova Tarefa"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTask}>
          <Form.Item
            name="taskName"            
            label="Nome da Tarefa"
            rules={[{ required: true, message: 'Por favor, insira o nome da tarefa!' }]}
          >
            <Input            
            placeholder="Digite o nome da nova tarefa" 
            />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={4} placeholder="Digite uma descrição da tarefa" />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Prazo"
            
            rules={[{ required: true, message: 'Por favor, selecione a data de prazo!' }]}
          >
            <DatePicker format="DD-MM-YYYY" placeholder="Selecione a data de prazo" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Prioridade"
            rules={[{ required: true, message: 'Por favor, selecione a prioridade!' }]}
          >
            <Select placeholder="Selecione a prioridade">
              <Option value="Alta">Alta</Option>
              <Option value="Média">Média</Option>
              <Option value="Baixa">Baixa</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="responsible"
            label="Responsável"
            rules={[{ required: true, message: 'Por favor, selecione o responsável!' }]}
          >
            <Select placeholder="Selecione os membros">
              {members.map(member => (
                <Option key={member._id} value={member._id}>
                  {member.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subtasks"
            label='Subtarefas'                        
          >        
            <Select 
              mode='tags'
              placeholder='Adicionar Subtarefas'                            
              style={{cursor:'text'}}
            >

            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Adicionar Tarefa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTaskButton;
