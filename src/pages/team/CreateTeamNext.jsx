// src/pages/createTeamNext.jsx

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Spin,
  message,
  Space,
  Flex,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTeam } from "../services/teamService"; // Importando o serviço
import { useAuth } from "../../context/AuthContext";
const { Title } = Typography;

const CreateTeamNext = () => {
  const { firstname, secondname, email } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCreateTeam = async (values) => {
    setLoading(true);

    try {
      const response = await createTeam({
        ...values,
        firstName: firstname,
        secondName: secondname,
        email: email,
      }); // Usando o serviço

      login(response.data.user);

      message.success(response.data.message);
      navigate("/home");

      // setTimeout(() => {
      //   navigate('/home');
      //   setLoading(false);
      //   message.success(response.data.message);
      // }, 3000);
    } catch (error) {
      console.error("Erro ao criar o time:", error);
      message.error(error.response?.data.message || "Erro ao criar o time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex style={{ height: "100vh" }}>
      <Flex
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a2636",
        }}
      >
        <div style={{ width: "80%", maxWidth: 400 }}>
          {loading && <Spin size="large" />}
          <Title level={4} style={{ textAlign: "center", color: "white" }}>
            Criar Grupo - Step 2
          </Title>
          <Form
            name="create_team"
            onFinish={handleCreateTeam}
            layout="vertical"
          >
            {/* Campos do formulário */}
            <Form.Item
              name="teamName"
              
              label="Nome do Grupo"
              rules={[
                { required: true, message: "Por favor insira o nome do time!" },
              ]}
            >
              <Input placeholder="Insira o nome do grupo ou time"/>
            </Form.Item>

            <Form.Item
              name="secondUserName"
              
              label="Nome de usuário"
              rules={[
                {
                  required: true,
                  message: "Por favor insira o nome de usuário!",
                },
              ]}
            >
              <Input placeholder="Insira o nome de usuário"/>
            </Form.Item>

            <Form.Item
              name="password"
              
              label="Palavra-passe"
              rules={[
                { required: true, message: "Por favor insira uma palavra-passe!" },
                {
                  min: 6,
                  message: "A senha deve ter pelo menos 6 caracteres!",
                },
              ]}
            >
              <Input.Password placeholder="Insira uma palavra-passe"/>
            </Form.Item>

            <Form.Item>
              <Space
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Link to="/create-team">
                  <Button type="default" block>
                    Voltar
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Criar Grupo
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Flex>
    </Flex>
  );
};

export default CreateTeamNext;
