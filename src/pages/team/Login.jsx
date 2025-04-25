import React, { useState } from 'react';
import { Button, Typography, Space, Form, Input, message, Flex, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AlertOutlined, InfoCircleOutlined ,SmileOutlined, ToolOutlined} from '@ant-design/icons';
const { Title, Text } = Typography;
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); // Novo estado

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
      const response = await loginService({ ...values, accessCode: accessCode });
      login(response.data.user);

      setTimeout(() => {
        navigate('/home');
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      message.error(error.response?.data.message || 'Erro ao fazer login.');
      if (error.response?.data.message === "Foste removido do Grupo.") {
        setModalVisible(true);
        const timer = setTimeout(() => {
          setModalVisible(false);
          navigate("/");
        }, 10000);
      }
      setLoading(false);
    }
  };

  const handleAccessCodeChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7) + "-" + value.slice(7);
    setAccessCode(value.toUpperCase());
  };

  return (
    <Flex style={{ height: '100vh' }}>
      <Flex style={{ width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2636' }}>
        <div style={{ width: '80%', maxWidth: 400 }}>
          <Form name="join-team" layout="vertical" onFinish={handleLogin} initialValues={{ accessCode }}>
            <Title level={4} style={{ textAlign: 'center' }}>Login</Title>

            <Form.Item label="Nome de Usuário" name="secondUserName"
              rules={[{ required: true, message: 'Por favor, insira seu nome de usuário!' }]}>
              <Input placeholder="Insira o seu nome de usuário" />
            </Form.Item>

            <Form.Item label="Palavra-Passe" name="password"
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}>
              <Input.Password placeholder="Insira a palavra-passe" />
            </Form.Item>

            <Form.Item label="Código de Acesso"
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
                {/* BOTÃO CRIAR GRUPO (AGORA ABRE MODAL) */}
                <Button type="default" onClick={() => setShowCreateGroupModal(true)}>
                  Criar Grupo
                </Button>

                <Link to="/join-team">
                  <Button type="default">Unir-se</Button>
                </Link>
              </Space>
              <Button type="primary" htmlType="submit" loading={loading}>Login</Button>
            </Space>
          </Form>

          {/* MODAL DE AVISO AO MUGINGA 😄 */}
          <Modal
            open={showCreateGroupModal}
            footer={null}
            centered
            onCancel={() => setShowCreateGroupModal(false)}
            styles={{ body: { textAlign: "center", padding: "30px" } }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <SmileOutlined style={{ fontSize: "48px", color: "#faad14" }} />
              <Title level={4}>Hey Muginga! 😄</Title>
              <Text>
                Desativei temporariamente o botão de <b>criar grupo</b> pra fazer uns testes técnicos 🔧.
              </Text>
              <Text type="secondary">
                Relaxa que já já tá tudo de volta! Enquanto isso, experimenta o botão de <b>Unir-se</b> 👇🏽
              </Text>
              <ToolOutlined style={{ fontSize: "28px", color: "#1890ff" }} />
            </Space>
          </Modal>

          {/* MODAL DE REMOÇÃO DO GRUPO */}
          <Modal
            open={modalVisible}
            closable={false}
            footer={null}
            centered
            styles={{ body: { textAlign: "center", padding: "30px" } }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <AlertOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
              <Title level={4} style={{ color: "#ff4d4f" }}>
                Você foi removido do grupo!
              </Title>
              <Text>
                Infelizmente, você foi removido do grupo pelos administradores.
              </Text>
              <Text type="secondary">
                Se acredita que foi um engano, entre em contato com os administradores.
              </Text>
              <InfoCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            </Space>
          </Modal>
        </div>
      </Flex>
    </Flex>
  );
};

export default Login;
