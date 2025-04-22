import React, { useState, useEffect } from "react";
import {
  Card,
  Switch,
  Form,
  Typography,
  Input,
  Button,
  message,
  Splitter,
  Modal,
} from "antd";
import { useTheme } from "../context/ThemeContext";
import { ConfigProvider } from "antd";
import {
  SettingOutlined,
  EditOutlined,
  UnlockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  deleteTeam,
  getTeamInfo,
  updateTeam,
} from "../pages/services/teamService";
import { useAuth } from "../context/AuthContext";
import Paragraph from "antd/es/typography/Paragraph";
import { deleteAllProjects } from "./services/projectService";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const SettingsPage = () => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamAccessCode, setTeamAccessCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const { name, teamCode , accessCode} = await getTeamInfo(user.teamId);
        setTeamName(name);
        setNewTeamName(name);
        setTeamCode(teamCode);
        setTeamAccessCode(accessCode)
      } catch (error) {
        console.error("Erro ao carregar informações do Grupo:", error);
      }
    };

    fetchTeamInfo();
  }, [user.teamId]);

  const handleNameChange = async () => {
    setLoading(true);

    if (isEditingName) {
      setTeamName(newTeamName);

      try {
        await updateTeam(user.teamId, newTeamName);
        message.success("Nome do Grupo atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar o Grupo:", error);
        message.error(
          error.response?.data.message || "Erro ao atualizar o Grupo."
        );
      } finally {
        setLoading(false);
      }
    }

    setIsEditingName(!isEditingName);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      message.success("Código do Grupo copiado para a área de transferência!");
    } catch (error) {
      message.error("Erro ao copiar o código.");
    }
  };
  const copyAccessCodeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(teamAccessCode);
      message.success("Código de Acesso copiado para a área de transferência!");
    } catch (error) {
      message.error("Erro ao copiar o código.");
    }
  };

  const handleDelAllProj = () => {
    Modal.confirm({
      title: "Dejesa eliminar todos os projectos? ",
      content:
        "Está operação é irreversível, todos os arquivos, links, tarefas serão eliminadas!",
      onOk: async () => {
        await deleteAllProjects(user.id, user.teamId);
        message.success("Projectos eliminados com sucesso.");

        try {
        } catch (error) {
          console.error("Erro ao eliminar projectos:", error);
        }
      },
    });
  };

  const handleDelTeam = () => {
    Modal.confirm({
      title: "Dejesa eliminar o Grupo? ",
      content: "Está operação é irreversível, toda informação será eliminada!",
      onOk: async () => {
        await deleteTeam(user.teamId);
        navigate("/");

        try {
        } catch (error) {
          console.error("Erro ao eliminar Grupo:", error);
        }
      },
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: isDarkTheme ? "#001529" : "#fff",
          colorTextBase: isDarkTheme ? "#fff" : "#000",
        },
      }}
    >
      <div style={{ paddingLeft: "65px", paddingRight: "65px" }}>
        <Title level={4}>
          <SettingOutlined /> Configurações
        </Title>
        <br />

        <Card title="Informações do Grupo" style={{ marginBottom: "20px" }}>
          <Form layout="vertical">
            <Form.Item label="Nome do Grupo">
              {isEditingName ? (
                <>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    style={{ width: "70%", marginRight: "8px" }}
                  />
                  <Button
                    type="primary"
                    onClick={handleNameChange}
                    icon={<EditOutlined />}
                    disabled={user.role !== "Usuário" ? false : true}
                  >
                    {isEditingName ? "Salvar" : "Trocar"}
                  </Button>

                  {isEditingName && (
                    <Button
                      color="default"
                      variant="filled"
                      onClick={() => {
                        setIsEditingName(false);
                        setLoading(false);
                      }}
                      style={{ marginLeft: "8px" }}
                      icon={<UnlockOutlined />}
                    >
                      Cancelar
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <span>{teamName}</span>
                  <Button
                    type="primary"
                    onClick={handleNameChange}
                    icon={<EditOutlined />}
                    style={{ marginLeft: "8px" }}
                    loading={loading}
                  >
                    Trocar
                  </Button>
                </>
              )}

              {isEditingName && user.role == "Usuário" && (
                <div
                  style={{
                    borderRadius: "10px",
                    margin: "10px",
                    padding: "5px",
                    width: "50%",
                    border: "1px solid #2a3d4d",
                    background: " #6d1b1b",
                  }}
                >
                  <Paragraph>
                    Apenas os Administradores têm a permissão para alterar o
                    nome do grupo.
                  </Paragraph>
                </div>
              )}
            </Form.Item>

            {user.role !== "Usuário" && (
              <Form.Item label="Código do Grupo">
                <div>
                  <>
                    {showCode ? teamCode : "***-***-***"}

                    <Button
                      type="link"
                      onClick={() => setShowCode(!showCode)}
                      style={{ marginLeft: "8px" }}
                      icon={
                        showCode ? <EyeInvisibleOutlined /> : <EyeOutlined />
                      }
                    >
                      {showCode ? "Ocultar" : "Mostrar"}
                    </Button>

                    <Button
                      type="link"
                      onClick={copyToClipboard}
                      icon={<CopyOutlined />}
                      style={{ marginLeft: "8px" }}
                    >
                      Copiar
                    </Button>
                  </>
                </div>
              </Form.Item>
            )}

            <Form.Item label="Código de Acesso">
              <div>
                <>
                  {showAccessCode ? teamAccessCode : "***-***-***"}

                  <Button
                    type="link"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    style={{ marginLeft: "8px" }}
                    icon={showAccessCode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  >
                    {showAccessCode ? "Ocultar" : "Mostrar"}
                  </Button>

                  <Button
                    type="link"
                    onClick={copyAccessCodeToClipboard}
                    icon={<CopyOutlined />}
                    style={{ marginLeft: "8px" }}
                  >
                    Copiar
                  </Button>
                </>
              </div>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Configurações Gerais">
          <Form layout="vertical">
            {/* <Form.Item label="Notificações de E-mail">
              <Switch defaultChecked />
            </Form.Item> */}
            <Form.Item label="Tema Escuro">
              <Switch checked={isDarkTheme} onChange={toggleTheme} />
            </Form.Item>
            {/* <Form.Item label="Atualizações Automáticas">
              <Switch defaultChecked />
            </Form.Item> */}
          </Form>
        </Card>
        <br />

        {user.role === "Administrador" && user.isHighLevelAdmin === true && (
          <Card title="Grupo">
            <Form layout="vertical">
              <Form.Item>
                <Button
                  ghost
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelAllProj}
                >
                  Eliminar todos os projectos
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  ghost
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelTeam}
                >
                  Eliminar Grupo
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
};

export default SettingsPage;
