import React, { useState, useEffect } from "react";
import AvatarEditor from "react-avatar-edit";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Modal,
  Avatar,
  Upload,
  Spin,
  Dropdown,
  Menu,
  Space,
} from "antd";
import {
  EyeOutlined,
  UploadOutlined,
  UserOutlined,
  SaveOutlined,
  LockOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "./services/teamService";
import { getUserById } from "./services/projectService";
import axios from "axios";
import sanitizeFileName from "../utils/sanitizeFileName";
import { supabase } from "../utils/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const { Title } = Typography;

const ProfilePage = () => {

  const [isImageUpdate, setIsImageUpdate] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [newUpdateUser, setNewUpdateUser] = useState({});
  const { user, login, logout } = useAuth();
  const [form] = Form.useForm();
  const [preview, setPreview] = useState(null); // Para visualizar a imagem recortada
  const [file, setFile] = useState(null); // Para manter o arquivo original
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false); // Modal para visualizar a imagem
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const { isDarkTheme } = useTheme(); // Obtendo o estado do tema

  const fetchDashboardData = async () => {
    try {
      const userData = await getUserById(user.id);
      form.setFieldsValue(userData);

      setNewUpdateUser(null)
      setUserData(userData);
    } catch (error) {
      message.error("Erro ao carregar dados do Usuário.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id, form]);


  useEffect(() => {

    // console.log(newUpdateUser);
    // console.log(preview);

  }, [newUpdateUser, preview])
  const handlePasswordChangeToggle = () => setChangePassword(!changePassword);

  const onClose = () => setPreview(null);

    const onCrop = (croppedImage) => {
    setPreview(croppedImage);
  } // Atualiza a visualização do corte

  const beforeUpload = (file) => {

    const maxFileSize = 1024 * 1024; // 1MB

    // Verifica o tamanho do arquivo
    if (file.size > maxFileSize) {
      message.error("A imagem excede o limite de 1MB");
      return;
    }

    setFile(file); // Define o arquivo original para edição
    setIsModalVisible(true);
    return false; // Evita o upload automático
  };
  // Opções do menu do Avatar
  const menu = (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => setIsViewModalVisible(true)} // Abre o modal para visualização
      >
        Ver Imagem
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        <Upload
          accept={["image/png", "image/jpg", "image/jpeg"]}
          beforeUpload={beforeUpload}
          showUploadList={false} // Desativa a lista padrão
        >
          Alterar Imagem
        </Upload>
      </Menu.Item>
    </Menu>
  );

  const uploadProfileImage = async () => {
    if (preview) {
      setIsImageUpdate(true)
      try {
        // Converte a imagem cortada para Blob
        const response = await fetch(preview);
        const blob = await response.blob();

        // Cria um nome único para armazenar no Supabase
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileName = `${Date.now()}-${sanitizedFileName}`;
        const bucketName = "joaoquinto"; // Substitua pelo nome do bucket

        if (user?.profileImage) {
          // Extrai o caminho do arquivo antigo no Supabase a partir da URL pública
          const filePath = user.profileImage.split(`${bucketName}/`)[1];

          if (filePath) {
            // Remove o arquivo antigo do Supabase
            const { error: deleteError } = await supabase.storage
              .from(bucketName)
              .remove([filePath]);

            if (deleteError) {
              console.warn("Erro ao deletar a imagem antiga:", deleteError.message);
            }
          }
        }

        // Faz upload da nova imagem para o Supabase
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, blob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }
        
        message.success("Foto de perfil alterada com sucesso.");

        // Obtém a URL pública do arquivo
        const { data: publicURL } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        const imageUrl = publicURL.publicUrl;
        
        return imageUrl

      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        message.error("Erro ao fazer upload da imagem.");
      }finally{

        setIsImageUpdate(false)
      }
    }
    setIsImageUpdate(false)
  }
  const handleUpdateProfile = async () => {
  
    if (
      changePassword &&
      (!newUpdateUser.currentPassword || !newUpdateUser.newPassword)
    ) {
      message.error("Preencha ambas as senhas!");
      setLoading(false);
      return;
    }
    if (newUpdateUser == null && preview ==null) {
      return
    }
    try {

      setLoading(true);
      const imageUrl = await uploadProfileImage();

      // Atualiza o usuário no banco de dados com a URL da imagem, se existir
      const updateResponse = await updateUser(user.id, {
        ...newUpdateUser,
        ...(imageUrl && { profileImage: imageUrl }),
        teamId: userData.teamId,
      });

      // Atualiza o estado do usuário após a resposta do serviço
      const updatedUser = updateResponse.data.updatedUser;

      login({
        email: updatedUser.email,
        id: updatedUser._id,
        role: updatedUser.role,
        teamId: updatedUser.teamId,
        username: updatedUser.username,
        profileImage: updatedUser.profileImage,
      });

      message.success("Perfil editado com sucesso.");

      // Limpa e oculta os campos de senha, se necessário
      if (changePassword) {
        setNewUpdateUser((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));       
        setChangePassword(false);
        form.resetFields(["currentPassword", "newPassword"]);       
      }

    } catch (error) {
      message.error(error.response?.data.message);
      console.error("Erro ao atualizar perfil:", error.response?.data.message);
    } finally {
      setLoading(false);
      setPreview(null);    
      setNewUpdateUser(null)  
      setFile(null)
      fetchDashboardData();
    }
  };

  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px' }}>
      <Title level={4}>
        <UserOutlined /> Meu Perfil
      </Title><br />
      <Card>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>

          {/* Avatar com menu dropdown */}
          <Spin spinning={isImageUpdate}>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Avatar
                size={100}
                icon={<UserOutlined />}                    
                src={preview ? preview : user.profileImage} // Mostra a imagem salva ou um placeholder
                style={{ cursor: "pointer" }}
              />
            </Dropdown>
          </Spin>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            label="Primeiro Nome"
            name="firstName"
            rules={[{ required: true, message: "Por favor, insira seu nome!" }]}
          >
            <Input
              name="firstName"
              onChange={(e) =>
                setNewUpdateUser({ ...newUpdateUser, firstName: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Segundo Nome"
            name="secondName"
            rules={[{ required: true, message: "Por favor, insira seu nome!" }]}
          >
            <Input
              name="secondName"
              onChange={(e) =>
                setNewUpdateUser({ ...newUpdateUser, secondName: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Nome de usuário"
            name="secondUserName"
            rules={[{ required: true, message: "Por favor, insira seu nome!" }]}
          >
            <Input
              disabled
              name="secondUserName"
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email inválido!" },
            ]}
          >
            <Input
              name="email"
              onChange={(e) =>
                setNewUpdateUser({ ...newUpdateUser, email: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              color="default"
              style={{ background: isDarkTheme? "#223146": '' }}
              variant="filled"
              icon={<LockOutlined />}
              onClick={handlePasswordChangeToggle}
            >
              {changePassword ? "Cancelar Alteração de Senha" : "Alterar Senha"}
            </Button>
          </Form.Item>
          {changePassword && (
            <>
              <Form.Item
                label="Senha Atual"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Por favor, insira sua senha atual!",
                  },
                  {
                    min: 6,
                    message: "A senha deve ter pelo menos 6 caracteres!",
                  },
                ]}
              >
                <Input.Password
                  name="currentPassword"
                  onChange={(e) =>
                    setNewUpdateUser({
                      ...newUpdateUser,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item
                label="Nova Senha"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Por favor, insira a nova senha!",
                  },
                  {
                    min: 6,
                    message: "A senha deve ter pelo menos 6 caracteres!",
                  },
                ]}
              >
                <Input.Password
                  name="newPassword"
                  onChange={(e) =>
                    setNewUpdateUser({
                      ...newUpdateUser,
                      newPassword: e.target.value,
                    })
                  }
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
            <Button   
              icon={<StopOutlined/>}           
              type="default"  
              htmlType="reset"                         
              disabled={true ? preview == null  && newUpdateUser == null: false }   
              onClick={() =>{
                fetchDashboardData()
                setChangePassword(false)
                setPreview(null)
              }}

            >
              Cancelar
            </Button>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={true ? preview == null  && newUpdateUser == null: false }              
            >
              Atualizar Perfil
            </Button>
            </Space>
          </Form.Item>
          
        </Form>
      </Card>

      {/* Modal para edição de imagem */}
      <Modal
        title="Editar Foto de Perfil"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFile(null); // Redefine o arquivo ao fechar o modal
          setPreview(null); // Redefine o preview ao fechar o modal
        }}
        footer={null}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {file && (
            <div>
              {/* Adiciona uma chave única ao AvatarEditor para forçar a desmontagem/remontagem */}
              <AvatarEditor
                key={file.name || Date.now()}
                width={250}
                height={250}
                onClose={onClose}
                onCrop={onCrop}
                src={URL.createObjectURL(file)}
              />
            </div>
          )}

          {preview && (
            <div>
              <img
                src={preview}
                alt="Pré-visualização"
                style={{ width: "100%", maxWidth: "150px" }}
              />{" "}
              <br />
              <Button
                type="primary"
                style={{ marginTop: 10, marginLeft: "20px" }}
                onClick={() => {
                  setIsModalVisible(false)

                }}
              >
                Cortar Imagem
              </Button>
            </div>
          )}
        </div>
      </Modal>


      {/* Modal para visualizar a imagem */}
      <Modal
        title="Visualizar Foto de Perfil"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        centered
        styles={{
          body: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }
        }}
        style={{
          maxWidth: "400px",
        }}
      >
        {userData.profileImage ? (
          <img
            src={userData.profileImage}
            alt="Foto de Perfil"
            style={{
              maxWidth: "100%",
              maxHeight: "250px",
            }}
          />
        ) : (
          <p style={{ textAlign: "center" }}>Nenhuma imagem disponível.</p>
        )}
      </Modal>

    </div>
  );
};

export default ProfilePage;
