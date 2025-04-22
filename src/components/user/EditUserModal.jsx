import React from "react";
import { Modal, Form, Input, Select, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Option } = Select;

const EditUserModal = ({
  visible,
  onOk,
  onCancel,
  form,
  user,
  currentUser,
}) => (
  <Modal title="Editar" open={visible} onOk={onOk} onCancel={onCancel}>
    <Form form={form} layout="vertical">
      {/* <Form.Item
        label="Palavra-Passe"
        name="password"
        rules={[
          { message: "Por favor, insira a palavra-Passe!" },
          { min: 6, message: "A senha deve ter pelo menos 6 caracteres!" },
        ]}
      >
        <Input.Password />
      </Form.Item> */}

      <Form.Item
        label="Permissão"
        name="role"
        rules={[{ message: "Por favor, selecione a permissão!" }]}
      >
        <Select
          placeholder="Selecione uma permissão"
          disabled={
            (currentUser?._id === user?._id && currentUser?.isHighLevelAdmin) ||
            (currentUser?.role === "Administrador" &&
              !currentUser?.isHighLevelAdmin &&
              user?.role === "Administrador")
          }
        >
          <Option value="Administrador">Administrador/a</Option>
          <Option value="Usuário">Funcionário/a</Option>
        </Select>
      </Form.Item>          
      {/* <Form.Item label="Imagem Atual">
        <Space>
          <Avatar
            size={64}
            src={user?.profileImage}
            icon={!user?.profileImage && <UserOutlined />}
            alt="Imagem do usuário"
          />
        </Space>
      </Form.Item> */}
    </Form>
  </Modal>
);

export default EditUserModal;
