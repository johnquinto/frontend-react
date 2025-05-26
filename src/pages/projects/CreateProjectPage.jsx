import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Space,
  Select,
  DatePicker,
  Divider,
  Upload,
} from "antd";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, UploadOutlined } from "@ant-design/icons";
import { getUsers, createProject } from "../services/projectService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import io from "socket.io-client";

const { Title } = Typography;
const { Option } = Select;

const socket = io("https://backend-express-8anj.onrender.com"); // Endereço do seu servidor de WebSocket

const CreateProjectPage = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = user.id 
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(user.teamId);
        setUsers(response);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        message.error("Erro ao carregar usuários.");
      }
    };

    fetchUsers();
  }, [user.teamId]);


  const onFinish = async (values) => {    
    setLoading(true);
    try {
      const res = await createProject({
        ...values,
        teamId: user.teamId,
        userName: user.id,
        // members: users.map((user) => user._id)
      });
      
      const memb = values.members.filter((mem)=> mem !== user.id )

      const notificationData = {
        users: memb,
        notification: `Novo projecto "${res.data.project.name}" criado, foste adicionado como membro do projecto`,
        project: res.data.project._id,
        teamId: user.teamId,
      }
          
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationData);      

      message.success("Projeto criado com sucesso!");
      navigate("/projects");
    } catch (error) {
      console.error(error.response?.data.message || "Erro ao criar projeto:");
      message.error(error.response?.data.message || "Erro ao criar projecto. Tente novamente. ");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px' }}>
      <Title level={4}>Novo Projeto</Title>
      <Button
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)}
        type="default"
      >
        Voltar
      </Button>   <br /><br />
      <Card className={`create-project-card ${isDarkTheme ? "dark-theme" : ""}`}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}

          >
            <Form.Item
              label="Área do Projeto"
              name="area"
              rules={[{ required: true, message: "Por favor, selecione a área do projeto!" }]}
            >
              <Input placeholder="Insira a área do projecto" />
            </Form.Item>
            <Form.Item
              label="Nome do Projeto"
              name="name"
              rules={[{ required: true, message: "Por favor, insira o nome do projeto!" }]}
            >
              <Input placeholder="Insira o nome do projeto" />
            </Form.Item>
            <Form.Item
              label="Data de Início"
              name="startDate"
              rules={[{ required: true, message: "Por favor, insira a data de início!" }]}
            >
              <DatePicker placeholder="Insira a data de início do projecto" style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              label="Data de Término"
              name="dueDate"
              rules={[{ required: true, message: "Por favor, insira a data de término!" }]}
            >
              <DatePicker placeholder="Insira a Data de término do projecto" style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              label="Descrição"
              name="description"
              rules={[{ required: true, message: "Por favor, insira uma descrição!" }]}
            >
              <Input.TextArea rows={4} placeholder="Descreva o projeto" />
            </Form.Item>
            <Form.Item
              label="Permissões de Acesso"
              name="permissions"
              rules={[{ required: true, message: "Por favor, selecione as permissões de acesso!" }]}
            >
              <Select placeholder="Selecione o nível de acesso">
                {/* <Option value="all">Acesso Total (Admin)</Option> */}
                <Option value="team">Acesso do Grupo</Option>
                <Option value="read">Acesso Somente Leitura</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Membros do projecto"
              name="members"
              rules={[{ required: true, message: "Por favor, selecione os membros do projecto!" }]}
            >
              <Select mode="multiple" placeholder="Selecione o membros do projecto">
                {users.map((user)=>(
                  <Option value={user._id}>{user.username}</Option>
                ))}
              </Select>
            </Form.Item>

            <Divider />
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                Criar Projeto
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default CreateProjectPage;
