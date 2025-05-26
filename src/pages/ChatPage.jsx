import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Typography, Avatar, Row, Col } from "antd";
import { SendOutlined, DownOutlined, UserOutlined, PaperClipOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import moment from "moment"; // Para formatar a hora
const { Paragraph } = Typography;

const socket = io("https://backend-express-8anj.onrender.com"); // Endereço do seu servidor de WebSocket

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Contador de mensagens não lidas
  const messagesEndRef = useRef(null);
    const [loadedMessages, setLoadedMessages] = useState([]);
  const chatRef = useRef(null);
  const { user } = useAuth();
  const {
    messages,
    resetMessageNotification,
    hasNewMessage,            
  } = useNotification();

  const { isDarkTheme } = useTheme(); // Obtendo o estado do tema
  const teamId = user.teamId;
  const currentUserId = user.id;


  const updateIsBottom = () => {

    if (isAtBottom) {
      // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
      resetMessageNotification(); // Resetar notificação quando estiver no final
      setUnreadCount(0);      
    }
    if (!isAtBottom) {

      if (hasNewMessage == true) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    }
  }

  useEffect(() => {
    updateIsBottom()
    
    // socket.emit('joinTeam', user.teamId);
    // socket.on("loadMessages", (loadedMessages) => {
    //   setLoadedMessages(loadedMessages);
    // });

  }, [messages,  isAtBottom, resetMessageNotification]);


  const handleScroll = () => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;

      setIsAtBottom(scrollHeight - scrollTop === clientHeight);
    }
  };

  const handleSendMessage = async () => {

    if (newMessage.trim()) {

      resetMessageNotification(); // Resetar notificação quando estiver no final
      const messageData = {
        user: currentUserId, // ID do usuário atual
        message: newMessage,
        teamId: teamId,
      };

      // Enviar a mensagem para o servidor
      socket.emit("sendMessage", messageData);
      setNewMessage("");
      updateIsBottom()

      setIsAtBottom(true);


    }
  };

  const scrollToBottomHandler = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
    setIsAtBottom(scrollHeight - scrollTop === clientHeight);
  };



  return (
    <div style={{ paddingLeft: "65px", paddingRight: '65px' }}>
      <Row
        gutter={10}
      >
        <Col
          style={{
            width: '100%',
            height: '65vh',
            // border:'1px solid red'
          }}
        >
          <div
            style={{
              height: "100%",
            }}
          >
            <Card
              ref={chatRef}
              className="custom-scrollbar"
              style={{
                height: "86%",
                overflowY: "scroll",
                marginBottom: "20px",

                padding: "50px",
                backgroundColor: isDarkTheme ? "#2a3d4d" : "#ffffff", // Fundo do chat conforme tema
                color: isDarkTheme ? "#d1d1d1" : "#333333", // Cor do texto conforme tema
              }}
              onScroll={handleScroll}
            >

              {/* Se não houver mensagens, mostrar um aviso */}
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Typography.Text type="secondary">
                    Ainda não há mensagens
                  </Typography.Text>
                </div>
                // <div></div>
              ) : (
                
                // Renderizando as mensagens de forma personalizada
                messages.map((item, index) => {
                  // Verificar se a mensagem anterior foi do mesmo usuário
                  const isSameUserAsPrevious =
                    index > 0 && messages[index - 1].user._id === item.user._id;

                  return (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent:
                          item.user._id === currentUserId ? "flex-end" : "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <Card
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor:
                            item.user._id === currentUserId
                              ? isDarkTheme
                                ? "#142d4e" // Cor para o usuário atual no modo escuro
                                : "#c5dbf8" // Cor para o usuário atual no modo claro
                              : isDarkTheme
                                ? "#3a4757" // Cor para outras mensagens no modo escuro
                                : "#f5f5f5", // Cor para outras mensagens no modo claro
                          borderRadius: "5px",
                          maxWidth: "20%", // Máxima largura para a mensagem
                          minWidth: "10%", // Largura mínima para mensagens curtas
                        }}
                      >
                        {/* Avatar e nome só aparecem se não for do mesmo usuário da mensagem anterior */}
                        {!isSameUserAsPrevious && (
                          <>
                            <Avatar
                              size={25}
                              icon={<UserOutlined />}
                              src={item.user.profileImage}
                              style={{ marginRight: "8px" }}
                            />
                            <Typography.Text strong style={{ marginRight: "8px" }}>
                              {item.user.username}
                            </Typography.Text>
                          </>
                        )}
                        <div>
                          <Paragraph style={{ marginBottom: "5px" }}>{item.message}</Paragraph>
                          {/* Exibindo a hora de envio da mensagem */}
                          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                            {moment(item.timestamp).format("HH:mm")}{" "}
                          </Typography.Text>
                        </div>
                      </Card>
                    </div>
                  );
                })

              )}
              <div ref={messagesEndRef} />

              {/* Botão combinado de rolagem e contador de mensagens */}
              {!isAtBottom && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DownOutlined />}
                  onClick={scrollToBottomHandler}
                  style={{
                    position: "sticky",
                    bottom: "10px",
                    right: "10px",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDarkTheme ? "#142d4e" : "#caccca", // Cor do botão conforme tema
                    color: isDarkTheme ? "white" : " #142d4e",
                    width: "50px",
                    height: "50px",
                  }}
                >
                  {/* Contador de mensagens não lidas */}
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        backgroundColor: "red",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "50%",
                        fontSize: "12px",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Button>
              )}
            </Card>
            <Card>
              
              <Input.Search

                placeholder="Digite uma mensagem..."
                enterButton={
                  <span>
                    <SendOutlined />
                  </span>

                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSearch={handleSendMessage}
                style={{
                  borderRadius: '10px',
                  backgroundColor: isDarkTheme ? "#333333" : "#ffffff", // Cor de fundo do input conforme tema
                  color: isDarkTheme ? "#d1d1d1" : "", // Cor do texto do input conforme tema
                }}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ChatPage;
