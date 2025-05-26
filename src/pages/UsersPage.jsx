import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Form,
  Modal,
  Spin,
  Input,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  SearchOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import EditUserModal from "../components/user/EditUserModal";
import { useAuth } from "../context/AuthContext"; // Para pegar o ID do time do usuário autenticado
import { getUserById, getUsers } from "../pages/services/projectService";
import { deleteUser, getTeamInfo, updateUser, removeUserTeam } from "./services/teamService";
import io from "socket.io-client";

const { Title } = Typography;

const socket = io("https://backend-express-8anj.onrender.com");

const UsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Pegando o usuário autenticado e o teamId
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteUser, setIsDeleteUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [form] = Form.useForm();

  // Função para buscar os usuários do time
  const fetchUsers = async () => {
    try {
      const users = await getUsers(user.teamId); // Passando o teamId do usuário
      const currentUser = await getUserById(user.id);
      const teamInfo = await getTeamInfo(currentUser.teamId);

      // Desestruturando o objeto e removendo a senha
      const usersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user; // Removendo a senha
        return { ...rest, password: "****" }; // Retornando os usuários sem a senha
      });
      const newDataUsers = usersWithoutPassword.filter((user) => {
        return user.spam !== true
      })

      setCurrentUser(currentUser);
      setTeamInfo(teamInfo);
      setUsersData(newDataUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentUser.teamId, isDeleteUser]);

  const fetchColumns = () => {
    if (user.role !== "Usuário") {
      return [
        { title: "Nome", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Função", dataIndex: "role", key: "role" ,
          render: (role) => (
          <Space>
              <span>{role == 'Usuário'? 'Funcionário/a' : 'Administrador/a'}</span>
          </Space>
          )
        },
        {
          title: "Ações",
          key: "action",
          render: (_, record) => (
            <Space>
              {user.isHighLevelAdmin === true && (
                <>
                  <Button
                    disabled={
                      user.isHighLevelAdmin === true
                        ? record.isHighLevelAdmin &&
                        record.role === "Administrador"
                        : false
                    }
                    style={{
                      display:
                        user.isHighLevelAdmin === true
                          ? record.isHighLevelAdmin &&
                          record.role === "Administrador" &&
                          "none"
                          : "flex",
                    }}
                    type="primary"
                    onClick={() => handleEditUser(record)}
                    icon={<EditOutlined />}
                  >
                    Editar
                  </Button>
                  <Button
                    disabled={
                      user.isHighLevelAdmin === true
                        ? record.isHighLevelAdmin &&
                        record.role === "Administrador"
                        : false
                    }
                    style={{
                      display:
                        user.isHighLevelAdmin === true
                          ? record.isHighLevelAdmin &&
                          record.role === "Administrador" &&
                          "none"
                          : "flex",
                    }}
                    onClick={() => handleDeleteUser(record._id, record)}
                    icon={<DeleteOutlined />}
                  >
                    Remover do Grupo
                  </Button>
                </>
              )}
              {user.isHighLevelAdmin === false &&
                user.role === "Administrador" && (
                  <>
                    <Button
                      disabled={
                        record.isHighLevelAdmin === true ||
                          record.isHighLevelAdmin === false &&
                          record.role === "Administrador"
                          ? true
                          : false
                      }
                      style={{
                        display:
                          user.isHighLevelAdmin === true
                            ? record.isHighLevelAdmin &&
                            record.role === "Administrador" &&
                            "none"
                            : "flex",
                      }}
                      type="primary"
                      onClick={() => handleEditUser(record)}
                      icon={<EditOutlined />}
                    >
                      Editar
                    </Button>

                    <Button
                      disabled={
                        record.isHighLevelAdmin === true ||
                          record.isHighLevelAdmin === false &&
                          record.role === "Administrador"
                          ? true
                          : false
                      }
                      style={{
                        display:
                          user.isHighLevelAdmin === true
                            ? record.isHighLevelAdmin &&
                            record.role === "Administrador" &&
                            "none"
                            : "flex",
                      }}
                      onClick={() => handleDeleteUser(record._id, record)}
                      icon={<DeleteOutlined />}
                    >
                      Remover do Grupo
                    </Button>
                  </>
                )}
            </Space>
          ),
        },
      ];
    } else {
      return [
        { title: "Nome", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Função", dataIndex: "role", key: "role" ,
          render: (role) => (
          <Space>
              <span>{role == 'Usuário'? 'Funcionário/a' : 'Administrador/a'}</span>
          </Space>
          )},
      ];
    }
  };
  const columns = fetchColumns();

  const handleEditUser = (user) => {
    if (
      currentUser.role === "Administrador" &&
      !currentUser.isHighLevelAdmin &&
      user.role === "Administrador"
    ) {
      // Se o administrador atual não for de alto nível, ele não pode editar outros administradores
      Modal.warning({
        title: "Permissão negada",
        content: "Você não tem permissão para editar outros administradores.",
      });
      return;
    }

    setEditingUser(user);
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handleDeleteUser = (userId, user) => {
    if (
      currentUser.role === "Administrador" &&
      !currentUser.isHighLevelAdmin &&
      user.role === "Administrador"
    ) {
      // Se o administrador atual não for de alto nível, ele não pode editar outros administradores
      Modal.warning({
        title: "Permissão negada",
        content: "Você não tem permissão para Eliminar outros administradores.",
      });
      return;
    }

    Modal.confirm({
      title: "Você tem certeza que deseja remover este usuário?",
      onOk: async () => {
        try {
          // const response = await deleteUser(userId);
          await removeUserTeam(userId, currentUser._id)

          socket.emit("sendUserRemoved", userId)
          
          socket.emit('joinTeam', currentUser.teamId);

          setIsDeleteUser((prev) => !prev);
        } catch (error) {
          console.error("Erro ao eliminar usuário:", error);
        }
        console.log(`Usuário com ID ${userId} eliminado.`);
      },
    });
  };

  const save = async (values) => {
    const response = await updateUser(editingUser._id, values);

    console.log("Usuário editado:", response);

    setIsDeleteUser((prev) => !prev);
    setIsEditModalVisible(false);
    setEditingUser(null);
  };

  const handleEditOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        // if (values.password) {
        //   await save(values);
        // }
        if (values.role && values.role !== editingUser.role) {
          await save(values);
        }

        message.success("Usuário editado com sucesso");
      })
      .catch((info) => {
        message.error("Erro ao editar usuário");
        console.log("Validação falhou:", info);
      });
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setEditingUser(null);
  };

  const filteredUsers = usersData.filter((user) =>
    user.username.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ paddingLeft: "65px", paddingRight: "65px" }}>
      <Title level={4}>
        <TeamOutlined /> Pessoal
      </Title>
      <Space
        style={{
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "16px",
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          type="default"
          icon={<LeftOutlined />}
        >
          Voltar
        </Button>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Pesquisar Usuários"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{}}
        />
      </Space>
      <Card className="custom-scrollbar">
        <Table
          style={{
            overflowY: "scroll",
            height: '330px'
          }}
          className="custom-scrollbar"
          dataSource={filteredUsers}
          columns={columns}
          pagination={false}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <EditUserModal
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleCancel}
        form={form}
        user={editingUser}
        team={teamInfo}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UsersPage;
