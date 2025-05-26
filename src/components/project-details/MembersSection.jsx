import React, { useState, useEffect } from 'react';
import { Button, Modal, List, Input, Table, notification, Upload, Row, Col, message, Spin } from 'antd';
import { TeamOutlined, SearchOutlined, InfoCircleOutlined, PaperClipOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { deleteProject, getUserById, updateProject, addDocs, getProjectById } from '../../pages/services/projectService';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs'
import axios from 'axios';
import io from "socket.io-client";

import { supabase } from '../../utils/supabaseClient';
import sanitizeFileName from '../../utils/sanitizeFileName';
import ProjectLinkModal from './ProjectLinkModal';

const socket = io("https://backend-express-8anj.onrender.com");

const MembersSection = ({ memberIds, project, projectId }) => { // Recebe apenas os IDs
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalMembersVisible, setIsModalMembersVisible] = useState(false);
  const [isModalUploadVisible, setIsModalUploadVisible] = useState(false);
  const [isModalMoreDetailsVisible, setIsModalMoreDetailsVisible] = useState(false);
  const [isModalLinkVisible, setIsModalLinkVisible] = useState(false);
  const [members, setMembers] = useState([]); // Armazena os dados completos dos membros
  const [projectInfo, setProjectInfo] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadList, setShowUploadList] = useState(true);


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersData = await Promise.all(
          memberIds.map(id => getUserById(id)) // Busca cada membro pelo ID
        );

        const projectInfo = await getProjectById(projectId)


        setProjectInfo(projectInfo)

        setMembers(membersData);
      } catch (error) {
        console.error("Erro ao carregar os membros:", error);
      }
    };

    fetchMembers();
  }, [memberIds, projectInfo]);

  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(filterText.toLowerCase())
  );

  // Configuração das colunas e dados para o modal "Mais Detalhes"
  const columns = [
    {
      title: "Atributo",
      dataIndex: "attribute",
      key: "attribute",
    },
    {
      title: "Valor",
      dataIndex: "value",
      key: "value",
    },
  ];

  const data = () => {

    return [
      { key: "1", attribute: "Nome", value: project.name },
      { key: "2", attribute: "Descrição", value: project.description },
      {
        key: "3", attribute: "Data de Início", value: project.startDate
          ? dayjs(project.startDate).format("DD/MM/YYYY")
          : "N/A"
      },
      {
        key: "4", attribute: "Data de Término", value: project.dueDate
          ? dayjs(project.dueDate).format("DD/MM/YYYY")
          : "N/A"
      },
      { key: "5", attribute: "Área", value: project.area },
      { key: "6", attribute: "Status", value: project.status },
      { key: "7", attribute: "Progresso", value: `${project.progress}%` },

      {
        key: "12", attribute: "Permissões", value:
          project.permissions === 'team' ? 'Acesso do Grupo' :
            project.permissions === 'read' ? 'Acesso Somente Leitura' :
              project.permissions === 'all' ? 'Acesso Total (Admin)' : 'Desconhecido'
      },
      {
        key: "13", attribute: "Criado em", value: project.createdAt
          ? dayjs(project.createdAt).format("DD/MM/YYYY")
          : "N/A"
      },
      {
        key: "14", attribute: "Atualizado em", value: project.updatedAt
          ? dayjs(project.updatedAt).format("DD/MM/YYYY")
          : "N/A"
      },
    ];

  };

  // Função para excluir o projeto
  const handleDeleteProject = () => {
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: 'Tem certeza que deseja excluir este projeto?',
      onOk: async () => {                
        try {

         
          const project = await getProjectById(projectId)

          // Obter os handles dos arquivos no campo 'documents'
          const documents = project.documents; // Array de objetos
          const fileHandles = documents.map((doc) => doc.handle);

          // Deletar os arquivos do Supabase
          for (const handle of fileHandles) {
            const { error } = await supabase.storage
              .from("joaoquinto") // Substitua "bucket-name" pelo nome do bucket no Supabase
              .remove([handle]);

            if (error) {
              console.error(`Erro ao excluir o arquivo com handle: ${handle}`, error);
              return res.status(500).json({ message: "Erro ao excluir arquivos do Supabase", error });
            }
          }                              
          await deleteProject(projectId, user.id, user.teamId);
          const filterUsers = members.map((memb)=> memb._id)
          const avaUser = filterUsers.filter((u)=> u !== user.id)

          const notificationData = {
            users: avaUser,
            notification: `O projecto "${project.name} foi eliminado."`,
            project: null,
            teamId: user.teamId,
          }
              
          // Enviar a notificação para o servidor
          socket.emit("sendNotification", notificationData); 

          message.success("Projeto eliminado com sucesso ");
          navigate('/projects');
        } catch (err) {
          console.log(err);
          message.error("Não foi possível excluir o projeto.");
        }
      },
    });
  };

  const handleUpload = async () => {    
    if (fileList.length === 0) {
      message.error("Nenhum arquivo selecionado.");
      return;
    }

    const file = fileList[0];
    const maxFileSize = 1024 * 1024; // 1MB

    // Verifica o tamanho do arquivo
    if (file.size > maxFileSize) {
      message.error("O arquivo excede o limite de 1MB");
      return;
    }

    // Cria um nome único para armazenar no Supabase
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueName = `${Date.now()}-${sanitizedFileName}`;

    setLoading(true);
    setFileList([])

    try {
      // Cria um novo arquivo Blob com o tipo forçado para "application/octet-stream"
      const blob = new Blob([file], { type: "application/octet-stream" });

      // Upload para o Supabase
      const { data, error } = await supabase.storage
        .from("joaoquinto") // Nome do bucket
        .upload(uniqueName, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log(data);

      if (error) {
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      // Gera a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from("joaoquinto")
        .getPublicUrl(uniqueName);

      // Recupera o projeto atualizado diretamente do banco de dados
      const currentProject = await getProjectById(projectId); // Busca o estado mais atualizado

      // Atualiza a lista de documentos sem sobrescrever os existentes
      const updatedProject = {
        ...currentProject,
        documents: [
          ...currentProject.documents, // Documentos atuais
          {
            name: file.name,
            url: publicUrlData.publicUrl,
            handle: uniqueName, // Nome único para gerenciar exclusões
          },
        ],
      };

      // Salva as alterações no banco de dados
      await updateProject(projectId, updatedProject);

      const filterUsers = members.map((memb)=> memb._id)
      const avaUser = filterUsers.filter((u)=> u !== user.id)

      const notificationData = {
        users: avaUser,
        notification: `Novo anexo adicionado ao projecto "${project.name}."`,
        project: project._id,
        teamId: user.teamId,
      }
          
      // Enviar a notificação para o servidor
      socket.emit("sendNotification", notificationData); 

      message.success("Arquivo enviado e anexado com sucesso!");
      setFileList([]); // Limpa o estado do upload
      setProjectInfo(updatedProject); // Atualiza os documentos na interface
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao fazer upload.");
    } finally {
      setLoading(false);
      setShowUploadList(true)
      setFileList([])
    }
  };

  const handleDeleteProjectDocs = async (documentId, handle) => {
    try {
      setLoading(true);

      // Exclui o arquivo do Supabase
      const { error } = await supabase.storage.from("joaoquinto").remove([handle]);

      if (error) {
        throw new Error(`Erro ao excluir arquivo: ${error.message}`);
      }

      // Recupera o projeto atualizado diretamente do banco de dados
      const currentProject = await getProjectById(projectId);

      // Filtra os documentos para excluir o desejado
      const updatedDocuments = currentProject.documents.filter((doc) => doc._id !== documentId);

      // Atualiza o projeto com a lista de documentos modificada
      const updatedProject = { ...currentProject, documents: updatedDocuments };

      // Envia a atualização para o banco de dados
      await updateProject(projectId, updatedProject);

      message.success("Arquivo excluído com sucesso!");
      setProjectInfo(updatedProject); // Atualiza a interface com os dados atualizados
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao excluir o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentData) => {
    try {
      const { name, ext, handle } = documentData;

      // Gera uma URL assinada para garantir download
      const { data, error } = await supabase.storage
        .from("joaoquinto")
        .createSignedUrl(handle, 60); // URL válida por 60 segundos

      if (error) {
        throw new Error(`Erro ao gerar URL para download: ${error.message}`);
      }

      // Cria um link "forçado" para download
      const downloadLink = document.createElement("a");
      downloadLink.href = data.signedUrl;

      downloadLink.download = `${name}.${ext}`; // Nome original do arquivo
      downloadLink.click();

      message.success("Download iniciado com sucesso!");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao iniciar o download.");
    }
  };


  return (
    <>
      <div>
        {/* Botão para abrir o modal de membros */}
        <Button
          title="Membros"
          type="default"
          onClick={() => setIsModalMembersVisible(true)}
          icon={<TeamOutlined />}
          style={{ marginRight: '10px' }}
        />

        {/* Botão para abrir o modal de documentos */}
        <Button
          title="Documentos"
          type="default"
          onClick={() => setIsModalUploadVisible(true)}
          style={{ marginRight: '10px' }}
          icon={<PaperClipOutlined />}
        />

        <Button
          title="Link"
          type="default"
          onClick={() => setIsModalLinkVisible(true)}
          style={{ marginRight: '10px' }}
          icon={<LinkOutlined />}
        />

        {/* Botão para abrir o modal de Informação geral do projeto */}
        <Button
          title="Mais Detalhes"
          type="default"
          style={{ marginRight: '10px' }}
          onClick={() => setIsModalMoreDetailsVisible(true)}
          icon={<InfoCircleOutlined />}
        />

        {user.role !== 'Usuário' &&
          <Button
            title="Eliminar Projecto"
            type="default"
            style={{ marginRight: '10px' }}
            onClick={handleDeleteProject}
            icon={<DeleteOutlined />}
          />}
      </div>

      {/* Modal de Membros */}
      <Modal
        title="Membros do Projeto"
        open={isModalMembersVisible}
        onCancel={() => setIsModalMembersVisible(false)}
        footer={null}
      >
        <Input
          prefix={<SearchOutlined />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Pesquisar Membros"
          style={{ marginBottom: '16px' }}
        />
        <List
          style={{
            height: 'auto',
            overflowY: 'scroll',
          }}
          className="custom-scrollbar"
          bordered
          dataSource={filteredMembers}
          renderItem={(member) => (
            <List.Item>{member.username}</List.Item>
          )}
        />
      </Modal>

      <Modal
        title="Anexos do Projeto"
        open={isModalUploadVisible}
        onCancel={() => setIsModalUploadVisible(false)}
        footer={null}
      >
        <Row gutter={16}>
          {user.role !== 'Usuário' && (
            <>
              <Col>
                <Upload
                  showUploadList={showUploadList}
                  fileList={fileList}
                  beforeUpload={(file) => {
                    setFileList([file]);
                    return false; // Evita upload automático
                  }}
                  onRemove={() => setFileList([])}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Selecionar Arquivo</Button>
                </Upload>


                <Button
                  style={{
                    marginTop: '10px',
                  }}
                  type="primary"
                  onClick={handleUpload}
                  disabled={fileList.length === 0}
                >
                  Salvar anexo
                </Button>
              </Col>
            </>)}
        </Row><br />
        <Spin spinning={loading}>
          <List
            style={{
              maxHeight: "250px",
              overflowY: "scroll",
            }}
            className="custom-scrollbar"
            bordered
            dataSource={projectInfo.documents}
            renderItem={(document) => (
              <List.Item>
                <Button
                  type="link"
                  onClick={() => handleDownload(document)}
                >
                  <PaperClipOutlined style={{
                    fontSize: '20px'
                  }} />
                  {document.name}
                </Button>
                {user.role !== "Usuário" && (
                  <Button
                    onClick={() => handleDeleteProjectDocs(document._id, document.handle)}
                    icon={<DeleteOutlined />}
                  />
                )}
              </List.Item>
            )}
          />
        </Spin>
      </Modal>

      {/* Modal de Mais Detalhes */}
      <Modal
        title="Detalhes do Projecto"
        open={isModalMoreDetailsVisible}
        onCancel={() => setIsModalMoreDetailsVisible(false)}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={data()}
          pagination={false} // Desativa a paginação
        />
      </Modal>

      <ProjectLinkModal
          projectId={projectId}          
          isModalLinkVisible={isModalLinkVisible}
          setIsModalLinkVisible={setIsModalLinkVisible}    
        />
    </>
  );
};

export default MembersSection;
