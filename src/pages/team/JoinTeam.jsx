import React, { useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { checkTeamCode, joinTeam } from "../services/teamService"; // Importando o serviço
import { useAuth } from "../../context/AuthContext";
import { ArrowRightOutlined } from "@ant-design/icons";
import _ from "lodash";
const { Title } = Typography;

const JoinTeam = () => {
  const [loading, setLoading] = useState(false);
  const [teamCode, setTeamCode] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleJoinTeam = async (values) => {
    if (!teamCode) {
      return message.error("Por favor insira o ID do grupo ");
    }

    if (teamCode.length < 11) {
      return message.error(
        "ID do grupo inválido. O ID deve conter 11 alfanumérico. "
      );
    }
    try {
      const res = await checkTeamCode(teamCode);

      if (res) {
        setLoading(true);
        const timer = setTimeout(() => {
          message.success("Olá seja bem vindo")
          setLoading(false);
          navigate(`/join-team-next/${res._id}/`);
        }, 1000);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.log(error);
      message.error(error.response?.data.message);
    }
  };

  const handleTeamCodeChange = (e) => {
    // Obter o valor digitado
    let value = e.target.value;

    // Remove todos os caracteres que não sejam letras ou números (mantém apenas alfanumérico)
    value = value.replace(/[^a-zA-Z0-9]/g, "");

    // Insere traços após cada 3 caracteres
    if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7) + "-" + value.slice(7);

    // Atualiza o estado do código formatado
    setTeamCode(value.toUpperCase());
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
            Unir-se a um Grupo
          </Title>
          <Form
            name="join_team"
            onFinish={handleJoinTeam}
            layout="vertical"
            initialValues={{ teamCode }}
          >
            <Form.Item
              label="ID do Grupo"
              rules={[
                { required: true, message: "Por favor, insira o ID do Grupo!" },
              ]}
            >
              <Input
                maxLength={11}
                placeholder="ID do Grupo"
                value={teamCode}
                onChange={handleTeamCodeChange}
              />
            </Form.Item>
            <Form.Item>
              <Space
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Link to="/">
                  <Button type="default" block>
                    Cancelar
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

export default JoinTeam;
