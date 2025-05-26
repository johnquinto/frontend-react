import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Form, Typography, notification, Space, List, Select, DatePicker, message } from 'antd';
import { DeleteOutlined, SaveOutlined, LeftOutlined, SearchOutlined } from '@ant-design/icons';
import { getProjectById, updateProject, deleteProject, getUserById, getUsers } from '../../pages/services/projectService';
import { useAuth } from '../../context/AuthContext';
import io from "socket.io-client";
import _ from 'lodash';

const { Title } = Typography;
const { Option } = Select;

const socket = io("https://backend-express-8anj.onrender.com"); 

const EditProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user.id 
  const [defaulProj, setDefaulProj ] = useState({})
  const [project, setProject] = useState({
    name: '',
    description: '',
    status: '',
    permissions: '',
    dueDate: null,
    members: [], // Apenas os IDs dos membros
  });
  const [membersData, setMembersData] = useState([]); // Dados completos dos membros (nome, username)
  const [availableMembers, setAvailableMembers] = useState([]); // Membros disponíveis para adicionar
  const [filterText, setFilterText] = useState('');
  const [toggle, setToggle] = useState(false);

  const [removUsers, setRemovUsers] = useState([])
  const [addUsers, setAddUsers] = useState([])

  const projectStatuses = [        
    'Em andamento',
    'Concluído',
    'Revisão',
    'Suspenso',    
    'Cancelado',
  ];

  // Fetch do projeto e dos membros
  const fetchProjectData = async () => {
    try {
      const data = await getProjectById(projectId);

      
      const projectMembers = await Promise.all(
        data.members.map(async (memberId) => {
          const memberData = await getUserById(memberId);
          return { id: memberId, username: memberData.username }; // Apenas o ID e o username
        })
      );
      setDefaulProj({
        ...data,
        members: projectMembers.map((member) => member.id), // Armazenar apenas os IDs
      })
      setProject({
        ...data,
        members: projectMembers.map((member) => member.id), // Armazenar apenas os IDs
      });
      setMembersData(projectMembers); // Armazenar os dados completos
    } catch {
      notification.error({ message: 'Erro ao carregar projeto', description: 'Não foi possível carregar os dados do projeto.' });
      navigate(-1);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, navigate]);

  // Fetch dos membros disponíveis
  const fetchAvailableMembers = async () => {
    try {
      const teamMembers = await getUsers(user.teamId);
      const projectMemberIds = project.members; // Agora é apenas uma lista de IDs      
      setAvailableMembers(teamMembers.filter((member) => !projectMemberIds.includes(member._id)));
    } catch {
      notification.error({ message: 'Erro ao carregar membros do time' });
    }
  };

  useEffect(() => {
    fetchAvailableMembers();
  }, [project.members, user.teamId]);

  // Atualiza `toggle` com base no número de membros filtrados
  useEffect(() => {
    const filtered = membersData.filter((member) =>
      member.username.toLowerCase().includes(filterText.toLowerCase())
    );
    setToggle(filtered.length <= 1);
  }, [membersData, filterText]);

  // useEffect(() => {
  //   console.log("addUsers:", addUsers);
  //   console.log("removUsers:", removUsers);
  // }, [addUsers, removUsers]);
  

  // Função para salvar alterações
  const handleSaveChanges = async () => {

    if(_.isEqual(defaulProj, project)){
       message.info('Nenhuma alteração feita.');
      return 
    }
    try {              
      const res =  await updateProject(projectId, { ...project, userName: user.id, teamId: user.teamId });                  
  

      if(addUsers.length == 0 && removUsers.length == 0){
        const filterUsers = res.members.filter((user) => user !== currentUserId )
        // console.log(filterUsers);
        const notificationData = {
          users: filterUsers,
          notification: `O projecto "${res.name}" foi atualizado as informações, visualize para saber mais.`,
          project: res._id,
          teamId: user.teamId,
        }
            
        // Enviar a notificação para o servidor
        socket.emit("sendNotification", notificationData); 
      } 

      console.log(addUsers);
      if(addUsers.length > 0){
        console.log(1);

        const notificationData = {
          users: addUsers,
          notification: `Foste adicionado como membro no projecto "${res.name}".`,
          project: res._id,
          teamId: user.teamId,
        }
            
        // Enviar a notificação para o servidor
        socket.emit("sendNotification", notificationData); 

      }else if(removUsers.length > 0){
        console.log(0);
        const notificationData = {
          users: removUsers,
          notification: `Foste removido como membro do projecto "${res.name}".`,
          project: res._id,
          teamId: user.teamId,
        }
            
        // Enviar a notificação para o servidor
        socket.emit("sendNotification", notificationData); 
      }
      message.success( "As alterações foram salvas com sucesso!");
      navigate(-1);
    } catch(err) {
      console.log(err);
      message.error( err.response?.data.message || "Não foi possível salvar as alterações do projeto.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    const updatedMembers = project.members.filter((id) => id !== memberId);
    const removedMember = membersData.find((member) => member.id === memberId);
  
    // Atualizar addUsers e removUsers
    if (addUsers.includes(memberId)) {
      setAddUsers((prev) => prev.filter((id) => id !== memberId));
      setRemovUsers((prev) => [...prev, memberId]);
    } else if (!removUsers.includes(memberId)) {
      setRemovUsers((prev) => [...prev, memberId]);
    }
  
    // Atualizar estados do projeto e membros
    setProject((prev) => ({ ...prev, members: updatedMembers }));
    setMembersData((prev) => prev.filter((member) => member.id !== memberId));
    setAvailableMembers((prev) => [...prev, removedMember]);
  };
  
  const handleAddMember = async (memberId) => {
    const memberToAdd = availableMembers.find((member) => member._id === memberId);
  
    if (!memberToAdd) {
      message.error("Membro não encontrado.");
      return;
    }
  
    // Atualizar o estado do projeto e membros
    setProject((prev) => ({
      ...prev,
      members: [...prev.members, memberToAdd._id], // Adicionar o ID ao estado
    }));
  
    setMembersData((prev) => [
      ...prev,
      { id: memberToAdd._id, username: memberToAdd.username },
    ]);
  
    setAvailableMembers((prev) => prev.filter((member) => member._id !== memberId));
  
    // Atualizar addUsers e removUsers
    if (removUsers.includes(memberId)) {
      setRemovUsers((prev) => prev.filter((id) => id !== memberId));
      setAddUsers((prev) => [...prev, memberId]);
    } else if (!addUsers.includes(memberId)) {
      setAddUsers((prev) => [...prev, memberId]);
    }
  };
  
  const filteredMembers = membersData.filter((member) =>
    member.username.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ paddingLeft: '65px', paddingRight: '65px' }}>
      <Title level={4}>Editar Projeto</Title>
      <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} type="default" style={{ marginBottom: '20px' }}>
        Voltar
      </Button>

      <Card>
        <Form layout="vertical">
          <>
            <Form.Item label="Nome do Projeto">
              <Input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
            </Form.Item>
            <Form.Item label="Descrição">
              <Input.TextArea value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} />
            </Form.Item>
            <Form.Item label="Status">
              <Select
                value={project.status}
                onChange={(value) => setProject({ ...project, status: value })}
              >
                {projectStatuses.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Data de Término">
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: '100%' }}
                value={project.dueDate}
                onChange={(date) => setProject({ ...project, dueDate: date })}
              />
            </Form.Item>
            <Form.Item label="Permissões de Acesso">
              <Select
                placeholder="Selecione o nível de acesso"
                value={project.permissions}
                onChange={(value) => setProject({ ...project, permissions: value })}
              >
                {/* <Option value="all">Acesso Total (Admin)</Option> */}
                <Option value="team">Acesso do Grupo</Option>
                <Option value="read">Acesso Somente Leitura</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Membros">
              <Select
                mode="multiple"
                placeholder="Adicionar novo membro"
                onSelect={handleAddMember}
                style={{ width: '100%' }}
              >
                {availableMembers.map((member) => (
                  <Option key={member._id} value={member._id}>
                    {member.username}
                  </Option>
                ))}
              </Select>

              <Input
                prefix={<SearchOutlined />}
                placeholder="Pesquisar Membros"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ marginTop: '20px', marginBottom: '16px' }}
              />

              <List
                style={{
                  overflowY: toggle ? '' : 'scroll',
                  height: toggle ? '' : '115px',
                }}
                bordered
                dataSource={filteredMembers}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMember(item.id)}
                        type="link"
                      />,
                    ]}
                  >
                    {item.username}
                  </List.Item>
                )}
              />
            </Form.Item>
          </>
          <Space style={{ width: '100%', justifyContent: 'end' }}>
            <Button icon={<SaveOutlined />} type="primary" onClick={handleSaveChanges}>
              Salvar alterações
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EditProjectPage;
