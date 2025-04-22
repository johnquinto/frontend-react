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
import { getTeamInfo, joinTeam } from "../services/teamService"; // Importando o serviço
import { useAuth } from "../../context/AuthContext";

const { Title } = Typography;

const JoinTeamFinal = () => {
  const { teamId, firstname, secondname, email } = useParams();
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fecthData = async () => {
      try {
        const res = await getTeamInfo(teamId);
        setTeam(res);
      } catch (error) {
        console.log(error);
        message.error(error.response?.data.message);
      }
    };

    fecthData();
  }, [teamId]);

  const handleJoinTeam = async (values) => {
    setLoading(true);

    try {
      const response = await joinTeam({
        ...values,
        firstName: firstname,
        secondName: secondname,
        email,
        teamId,
      }); // Usando o serviço
      login(response.data.user);

      message.success(response.data.message);
      navigate("/home");
    } catch (error) {
      console.error("Erro ao unir-se ao time:", error);
      message.error(error.response?.data.message || "Erro ao unir-se ao time.");
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
            {team.name} - Step 2
          </Title>
          <br />
          <br />
          <Form name="join_team" onFinish={handleJoinTeam} layout="vertical">
            <Form.Item
              name="secondUserName"
              
              label="Nome de Usuário"
              rules={[
                {
                  required: true,
                  message: "Por favor insira um nome de usuário!",
                },
              ]}
            >
              <Input placeholder="Insira um nome de usuário"/>
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
                <Link to={`/join-team-next/${teamId}`}>
                  <Button type="default" block>
                    Voltar
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit" block>
                  Unir-se ao Grupo
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Flex>
    </Flex>
  );
};

export default JoinTeamFinal;
