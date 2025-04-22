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
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title } = Typography;

const JoinTeamNext = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


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
    const {firstname , secondname , email} = values

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      navigate(`/join-team-final/${teamId}/${firstname}/${secondname}/${email}`)
    }, 1000);

    return () => clearTimeout(timer);

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
            {team.name} - Step 1
          </Title>
          <br />
          <br />
          <Form name="join_team" onFinish={handleJoinTeam} layout="vertical">
            <Form.Item
              name="firstname"
              
              label="Primeiro Nome"
              rules={[
                {
                  required: true,
                  message: "Por favor insira o seu primeiro nome!",
                },
              ]}
            >
              <Input placeholder="Insira o seu primeiro nome"/>
            </Form.Item>
            <Form.Item
              name="secondname"
              
              label="Segundo Nome"
              rules={[
                {
                  required: true,
                  message: "Por favor insira o seu segundo nome!",
                },
              ]}
            >
              <Input placeholder="Insira o seu segundo nome"/>
            </Form.Item>
            <Form.Item
              name="email"
              
              label="Email"
              rules={[
                { required: true, message: "Por favor insira o seu email!" },
                { type: "email", message: "Email inválido!" },
              ]}
            >
              <Input placeholder="Insira o seu email"/>
            </Form.Item>
            <Form.Item>
              <Space
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Link to="/join-team">
                  <Button type="default" block>
                    Voltar
                  </Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  Avançar <ArrowRightOutlined />
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Flex>
    </Flex>
  );
};

export default JoinTeamNext;
