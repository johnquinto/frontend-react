// src/pages/CreateTeam.jsx

import React, { useState } from "react";
import { Form, Input, Button, Typography, Spin, message, Space, Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { createTeam } from "../services/teamService"; // Importando o serviço
import { useAuth } from "../../context/AuthContext";
import { ArrowRightOutlined } from "@ant-design/icons";
const { Title } = Typography;

const CreateTeam = () => {
  const [ loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleCreateTeam = async (values) => {
    const {firstname , secondname , email} = values

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      navigate(`/create-team-next/${firstname}/${secondname}/${email}`)
    }, 1000);

    return () => clearTimeout(timer);

  
  };

  return (
    <Flex style={{ height: '100vh' }}>
      <Flex style={{ width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2636' }}>
      <div style={{ width: '80%', maxWidth: 400 }}>
      {loading && <Spin size="large" />}
      <Title level={4} style={{ textAlign: "center", color: "white" }}>
        Criar Grupo - Step 1
      </Title>
      <Form name="create_team" onFinish={handleCreateTeam} layout="vertical">
        {/* Campos do formulário */}
        <Form.Item
          name="firstname"
          
          label="Primeiro Nome"
          rules={[{ required: true, message: "Por favor insira o seu primeiro nome!" }]}
        >
          <Input placeholder="Insira seu primeiro nome"/>
        </Form.Item>
        <Form.Item
          name="secondname"
        
          label="Segundo Nome"
          rules={[{ required: true, message: "Por favor insira o seu segundo nome!" }]}
        >
          <Input placeholder="Insira seu segundo nome"/>
        </Form.Item>
        <Form.Item
          name="email"
         
          label="Email"
          rules={[
            { required: true, message: "Por favor insira o seu email!" },
            { type: "email", message: "Email inválido!" },
          ]}
        >
          <Input placeholder="Insira seu email"/>
        </Form.Item>
        <Form.Item>

          <Space style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/">
              <Button type="default"  block>
                Cancelar
              </Button>
            </Link>
            <Button type="primary" htmlType="submit" loading={loading}>
              Avançar <ArrowRightOutlined/>
            </Button>
          </Space>
        </Form.Item>
      </Form>
      </div>
    </Flex>
    </Flex>
  );
};

export default CreateTeam;
