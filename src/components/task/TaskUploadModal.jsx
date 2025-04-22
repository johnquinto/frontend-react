import { Button, Col, List, message, Modal, Row, Spin, Upload } from "antd";
import React, { useEffect, useState } from "react";
import {
  getTask,
  updateTask,
  updateTaskDocs,
} from "../../pages/services/taskService";
import { useAuth } from "../../context/AuthContext";
import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import sanitizeFileName from "../../utils/sanitizeFileName";
import { supabase } from "../../utils/supabaseClient";
import Typography from "antd/es/typography/Typography";

function TaskUploadModal({
  taskId,
  projectId,
  isModalUploadVisible,
  setIsModalUploadVisible,
}) {
  const { user } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [showUploadList, setShowUploadList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [taskInfo, setTaskInfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTask(projectId, taskId);

        setTaskInfo(data);
      } catch (error) {
        console.error("Erro ao carregar tarefa:", error);
      }
    };

    fetchData();
  }, [projectId, taskInfo]);

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
    setFileList([]);

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

      if (error) {
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      // Gera a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from("joaoquinto")
        .getPublicUrl(uniqueName);

      // Recupera a tarefa atualizado diretamente do banco de dados
      const currentTask = await getTask(projectId, taskId); // Busca o estado mais atualizado

      // Atualiza a lista de documentos sem sobrescrever os existentes
      const updatedTask = {
        ...currentTask,
        documents: [
          ...currentTask.documents, // Documentos atuais
          {
            name: file.name,
            url: publicUrlData.publicUrl,
            handle: uniqueName, // Nome único para gerenciar exclusões
          },
        ],
      };

      // Salva as alterações no banco de dados
      await updateTaskDocs(taskId, updatedTask);

      message.success("Arquivo enviado e anexado com sucesso!");
      setFileList([]); // Limpa o estado do upload
      setTaskInfo(updatedTask); // Atualiza os documentos na interface
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao fazer upload.");
    } finally {
      setLoading(false);
      setShowUploadList(true);
      setFileList([]);
    }
  };

  const handleDelete = async (documentId, handle) => {
    try {
      setLoading(true);

      // Exclui o arquivo do Supabase
      const { error } = await supabase.storage
        .from("joaoquinto")
        .remove([handle]);

      if (error) {
        throw new Error(`Erro ao excluir arquivo: ${error.message}`);
      }

      // Recupera o projeto atualizado diretamente do banco de dados
      const currentTask = await getTask(projectId, taskId);

      // Filtra os documentos para excluir o desejado
      const updatedDocuments = currentTask.documents.filter(
        (doc) => doc._id !== documentId
      );

      // Atualiza o projeto com a lista de documentos modificada
      const updatedTask = { ...currentTask, documents: updatedDocuments };

      // Envia a atualização para o banco de dados
      await updateTaskDocs(taskId, updatedTask);

      message.success("Arquivo excluído com sucesso!");
      setTaskInfo(updatedTask); // Atualiza a interface com os dados atualizados
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
    <div>
      <Modal
        title={
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <PaperClipOutlined/>
              <span>Anexos</span>
          </div>
          }
        open={isModalUploadVisible}
        onCancel={() => setIsModalUploadVisible(false)}
        footer={null}
      >
        {taskInfo.status == 'Cancelada' && user.role !== 'Usuário' ? (
          <div>
            <Row gutter={16}>

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
                      marginTop: "10px",
                    }}
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                  >
                    Salvar anexo
                  </Button>
                </Col>
              </>

            </Row>
            <br />
            <Spin spinning={loading}>
              <List
                style={{
                  maxHeight: "250px",
                  overflowY: "scroll",
                }}
                className="custom-scrollbar"
                bordered
                dataSource={taskInfo.documents}
                renderItem={(document) => (
                  <List.Item>
                    <Button
                      type="link"
                      onClick={() => handleDownload(document)}
                    ><PaperClipOutlined style={{
                      fontSize: '20px'
                    }} />
                      {document.name}
                    </Button>
                    <Button
                      onClick={() => handleDelete(document._id, document.handle)}
                      icon={<DeleteOutlined />}
                    />

                  </List.Item>
                )}
              />
            </Spin>
          </div>
        ) : taskInfo.status == 'Cancelada' && user.role == 'Usuário' ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Typography.Text type="secondary">
              Esta tarefa foi cancelada
            </Typography.Text>
          </div>
        ) : (
          <div>
            <Row gutter={16}>

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
                      marginTop: "10px",
                    }}
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                  >
                    Salvar anexo
                  </Button>
                </Col>
              </>

            </Row>
            <br />
            <Spin spinning={loading}>
              <List
                style={{
                  maxHeight: "250px",
                  overflowY: "scroll",
                }}
                className="custom-scrollbar"
                bordered
                dataSource={taskInfo.documents}
                renderItem={(document) => (
                  <List.Item>
                    <Button
                      type="link"
                      onClick={() => handleDownload(document)}
                    ><PaperClipOutlined style={{
                      fontSize: '20px'
                    }} />
                      {document.name}
                    </Button>
                    <Button
                      onClick={() => handleDelete(document._id, document.handle)}
                      icon={<DeleteOutlined />}
                    />

                  </List.Item>
                )}
              />
            </Spin>
          </div>
        )
        }

      </Modal>

    </div>
  );
}

export default TaskUploadModal;
