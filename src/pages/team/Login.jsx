import React, { useState } from 'react';
import { Button, Typography, Space, Form, Input, message, Flex, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AlertOutlined, InfoCircleOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;


const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const handleLogin = async (values) => {
    if (!accessCode) {
      return message.error("Por favor insira o Código de Acesso do grupo ");
    }

    if (accessCode.length < 11) {
      return message.error(
        "Código de Acesso do grupo inválido. O Código de Acesso deve conter 11 alfanumérico. "
      );
    }

    setLoading(true);

    try {
      // Realiza o login usando o serviço de autenticação
      const response = await loginService({ ...values, accessCode: accessCode });
      console.log(response);

      // Define o usuário no contexto
      login(response.data.user);

      // message.success(response.data.message);

      // navigate('/home');

      setTimeout(() => {
        navigate('/home');
        setLoading(false);
        // message.success(response.data.message);
      }, 1000);

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      message.error(error.response?.data.message || 'Erro ao fazer login.');
      if (error.response?.data.message == "Foste removido do Grupo.") {
        setModalVisible(true);
        const timer = setTimeout(() => {
          setModalVisible(false);
          navigate("/"); // Redireciona o usuário após 10 segundos
        }, 10000);
      }
      setLoading(false); // Para o carregamento imediatamente em caso de erro
    }
  };

  const handleAccessCodeChange = (e) => {
    // Obter o valor digitado
    let value = e.target.value;
    // Remove todos os caracteres que não sejam letras ou números (mantém apenas alfanumérico)
    value = value.replace(/[^a-zA-Z0-9]/g, "");
    // Insere traços após cada 3 caracteres
    if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7) + "-" + value.slice(7);

    // Atualiza o estado do código formatado
    setAccessCode(value.toUpperCase());
  };


  return (
    <Flex style={{ height: '100vh' }}>
      <Flex style={{ width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2636' }}>
        <div style={{ width: '80%', maxWidth: 400, }}>
          <Form name="join-team" layout="vertical" onFinish={handleLogin} initialValues={{ accessCode }}>
            <Typography.Title level={4} style={{ textAlign: 'center' }}>Login</Typography.Title>
            <Form.Item              
              label="Nome de Usuário"
              name="secondUserName"
              rules={[{ required: true, message: 'Por favor, insira seu nome de usuário!' }]}>

              <Input placeholder="Insira o seu nome de usuário" />
            </Form.Item>
            <Form.Item
              label="Palavra-Passe"
              name="password"
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}>
              <Input.Password placeholder="Insira a palavra-passe" />
            </Form.Item>
            <Form.Item
              label="Código de Acesso"
              rules={[{ required: true, message: 'Por favor, insira o codigo de acesso!' }]}>

              <Input
                value={accessCode}
                maxLength={11}
                placeholder="Código de Acesso"
                onChange={handleAccessCodeChange}
              />
            </Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Link to="/create-team">
                  <Button type="default">Criar Grupo</Button>
                </Link>
                <Link to="/join-team">
                  <Button type="default">Unir-se</Button>
                </Link>
              </Space>
              <Button type="primary" htmlType="submit" loading={loading}>Login</Button>
            </Space>
          </Form>
          <Modal
            open={modalVisible}
            closable={false} // Impede o fechamento manual do modal
            footer={null} // Remove os botões de ação
            centered // Centraliza o modal
            styles={{
              body: {
                textAlign: "center",
                padding: "30px",
              }
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Ícone de alerta */}
              <AlertOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />

              {/* Título principal */}
              <Title level={4} style={{ color: "#ff4d4f" }}>
                Você foi removido do grupo!
              </Title>

              {/* Explicação detalhada */}
              <Text>
                Infelizmente, você foi removido do grupo pelos administradores. Isso pode acontecer por diversas razões, como mudanças na equipe ou ajustes no projeto.
              </Text>

              <Text type="secondary">
                Se você acredita que isso foi um engano, entre em contato com os administradores para obter mais informações.
              </Text>

              {/* Ícone informativo adicional */}
              <InfoCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            </Space>
          </Modal>
        </div>
      </Flex>
    </Flex>


  );
};

export default Login;
