import { DeleteOutlined, LinkOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Space,
} from "antd";
import React, { useEffect, useState } from "react";
import ClipBoard from "../icons/ClipBoard";
import {
  createLinkProject,
  updateLinkProject,
} from "../../pages/services/linkService";
import { getProjectById } from "../../pages/services/projectService";
import { useAuth } from "../../context/AuthContext";

const ProjectLinkModal = ({
  projectId,
  isModalLinkVisible,
  setIsModalLinkVisible,
}) => {
  const { user } = useAuth();
  const [linkPasted, setLinkPasted] = useState("");
  const [isLink, setIsLink] = useState(false);
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(false);

  const fecthData = async () => {
    try {
      const project = await getProjectById(projectId);
      setProject(project);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  useEffect(() => {
    fecthData();
  }, [project]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      const newtext = checkText(text);

      handleWrite(newtext);
    } catch (error) {
      message.error("Erro ao colar o link.");
    }
  };
  const checkText = (text) => {
    if (text == "http:/") {
      setIsLink(false);
      setLinkPasted("");
      return;
    }

    const isHttp = text.toLocaleLowerCase().slice(0, 7) == "http://";
    const isHttps = text.toLocaleLowerCase().slice(0, 8) == "https://";

    if (isHttp || isHttps) {
      return text;
    } else {
      const newText = `http://${text}`;

      return newText;
    }
  };
  const handleWrite = (text) => {
    if (text == "") {
      setIsLink(false);
      setLinkPasted(text);
      return;
    }

    setIsLink(true);
    const newtext = checkText(text);

    setLinkPasted(newtext);
  };

  const saveLink = async (key) => {
    if (!key || key == "Enter") {
      if (linkPasted == "") {
        return;
      }

      try {
        setLoading(true);
        const res = await createLinkProject({
          projectId: projectId,
          link: linkPasted,
        });

        


        message.success("Link adicionado com sucesso");
      } catch (error) {
        console.log(error.response?.data.message || "Erro ao salvar link");
        message.error(error.response?.data.message || "Erro ao salvar link");
      } finally {
        setIsLink(false);
        setLinkPasted("");
        setLoading(false);
      }
    }
  };
  const handleDeleteLink = async (linkId) => {
    try {
      setLoading(true);
      const currentTask = await getProjectById(projectId);

      const updatedLinks = currentTask.links.filter(
        (link) => link._id !== linkId
      );

      const updatedTask = { ...currentTask, links: updatedLinks };

      await updateLinkProject(projectId, updatedTask);

      message.success("Link excluído com sucesso!");

      setProject(updatedTask);
    } catch (error) {
      console.log(error.response?.data.message || "Erro ao excluír link");
      message.error(error.response?.data.message || "Erro ao excluír link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LinkOutlined />
            <span>Link</span>
          </div>
        }
        open={isModalLinkVisible}
        onCancel={() => setIsModalLinkVisible(false)}
        footer={null}
      >
        {user.role !== "Usuário" && (
          <Row gutter={10}>
            <Row style={{ width: "91%" }}>
              <Col style={{}}>
                <Button
                  disabled
                  style={{
                    color: "rgba(241, 241, 241, 0.52)",
                    border: "none",
                    borderBottomRightRadius: "1px",
                    borderTopRightRadius: "1px",
                  }}
                >
                  http://
                </Button>
              </Col>
              <Col flex={1}>
                <Input
                  style={{
                    borderBottomLeftRadius: "1px",
                    borderTopLeftRadius: "1px",
                  }}
                  value={linkPasted}
                  placeholder="Insira ou cola o link aqui"
                  onChange={(e) => handleWrite(e.target.value)}
                  onKeyDown={(e) => saveLink(e.key)}
                />
              </Col>
            </Row>
            <Col>
              <Button
                icon={
                  isLink ? (
                    <SaveOutlined />
                  ) : (
                    <ClipBoard
                      height={24}
                      width={24}
                      color="rgba(241, 241, 241, 0.84)"
                    />
                  )
                }
                title={isLink ? "Salvar" : "Colar"}
                onClick={() => {
                  isLink ? saveLink() : handlePaste();
                }}
              />
            </Col>
          </Row>
        )}
        <List
          loading={loading}
          style={{
            marginTop: "10px",
            maxHeight: "250px",
            overflowY: "scroll",
          }}
          className="custom-scrollbar"
          bordered
          dataSource={project.links}
          renderItem={(item) => (
            <List.Item>
              <a href={item.link} target="_blank">
                {item.link}
              </a>
              {
                user.role !== "Usuário" && 
              <Button
                onClick={() => handleDeleteLink(item._id)}
                icon={<DeleteOutlined />}
              />
              }
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default ProjectLinkModal;
