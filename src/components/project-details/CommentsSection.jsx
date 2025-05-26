import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Input, List, Button, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import {
  createComment,
  editComment,
  getComments,
  deleteComment
} from "../../pages/services/commentService";

const CommentsSection = ({ projectId, memberIds, project}) => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCommentId, setCurrentCommentId] = useState(null);
  const [refreshComments, setRefreshComments] = useState(false);
  const { user } = useAuth();
  const teamId = user.teamId;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await getComments(projectId, teamId);
        setComments(response.data);
      } catch (error) {
        message.error("Erro ao buscar comentários");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [projectId, refreshComments]);

  const handleCommentSubmit = async (values) => {
    const content = values.comment;
    try {
      setLoading(true);
      if (isEditing && currentCommentId) {
        const updatedComment = await editComment(
          user.id,
          currentCommentId,
          content
        );
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === updatedComment._id ? updatedComment : comment
          )
        );
        message.success("Comentário editado com sucesso!");

      } else {
        await createComment(user.id, projectId, teamId, content);
        // message.success("Comentário adicionado com sucesso!");
      }

      setIsEditing(false);
      setCurrentCommentId(null);
      setRefreshComments((prev) => !prev);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (commentId, commentContent) => {
    if (isEditing && currentCommentId === commentId) {
      // Desativa a edição se já estiver editando o mesmo comentário
      setIsEditing(false);
      setCurrentCommentId(null);
      form.resetFields();
    } else {
      // Ativa a edição para o comentário selecionado
      setIsEditing(true);
      setCurrentCommentId(commentId);
      form.setFieldsValue({ comment: commentContent });
      inputRef.current.resizableTextArea.textArea.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setLoading(true);
      await deleteComment(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
      message.success("Comentário excluído com sucesso!");
    } catch (error) {
      message.error("Erro ao excluir comentário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Comentários" style={{ marginTop: "20px" }}>
      <Form layout="vertical" form={form} onFinish={handleCommentSubmit}>
        <Form.Item
          label="Adicionar um Comentário"
          name="comment"
          rules={[{ required: true, message: "Por favor, escreva um comentário!" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Escreva seu comentário aqui"
            ref={inputRef}
            disabled ={
              !memberIds.includes(user.id) && user.role !== 'Administrador'? true : false || 
              project == 'read'  && user.role !== 'Administrador' ? true : false
            }
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={!isEditing ? <PlusOutlined /> : <EditOutlined />}
          disabled ={
            !memberIds.includes(user.id) && user.role !== 'Administrador'? true : false || 
            project == 'read'  && user.role !== 'Administrador' ? true : false

          }            
          >
           
            {isEditing ? "Editar Comentário" : "Adicionar Comentário"}
          </Button>
        </Form.Item>
      </Form>
      <List
      
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item
            actions={
              comment.author._id !== user.id && user.role !== "Administrador"? [] :
              [
              <Button
                onClick={() => handleEditComment(comment._id, comment.content)}              
              >
                {isEditing && currentCommentId === comment._id ? "Cancelar" : "Editar"}
              </Button>,
              <Button
                danger
                ghost
                onClick={() => handleDeleteComment(comment._id)}              
              >
                Excluir
              </Button>
            ]}
          >
            <List.Item.Meta
           
              title={comment.author.username}
              description={comment.content}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CommentsSection;
