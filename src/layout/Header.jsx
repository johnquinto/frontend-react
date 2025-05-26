import React, { useState, useRef, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Button,
  AutoComplete,
  Layout,
  Dropdown,
  message,
  Input,
  Avatar,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getProjects, getUserById } from "../pages/services/projectService";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;

const CustomHeader = ({ collapsed, setCollapsed }) => {
  const { isDarkTheme , toggleHomeTheme} = useTheme();
  const { user, logout } = useAuth();
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          // Verifique se o `user` está disponível
          const userData = await getUserById(user.id);
          setUserData(userData);
          // console.log(userData);

        }
      } catch (error) {
        console.log("Erro ao buscar dados do user", error);
      }
    };

    fetchUserData();
  }, [user]); // Inclua `user` como dependência

  const handleSearch = async (value) => {
    setInputValue(value);
  
    if (!value) {
      setOptions([]);
      return;
    }
  
    try {
      const projects = await getProjects(user.teamId);
      const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(value.toLowerCase())
      );
  
      setOptions(
        filteredProjects.map((project) => ({
          label: (
            <div
              onClick={() => {
                 if(project.permissions == 'all' && user.role !== 'Administrador'){
                    return message.info("Apenas os administradores podem vizualizar esse projecto.")
                  } 
                
                navigate(`/projects/${project._id}`)
              }
              
              } // Redireciona ao clicar em qualquer lugar da opção
              style={{ cursor: "pointer", padding: "5px 10px" }}
            >
              {project.name}
            </div>
          ),
          value: project.name, // Define o valor para fins de exibição
        }))
      );
    } catch (error) {
      message.error("Erro ao buscar projetos.");
    }
  };
  

  const handleSelect = () => {
    setOptions([]);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const items = [
    {
      key: "user-profile-link",
      label: <Link to="/profile">Perfil</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "user-settings-link",
      label: <Link to="/settings">Definições</Link>,
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "user-logout-link",
      label: "Sair", 
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {        
        message.loading("A Sair...")
        setTimeout(() => {
          navigate("/");
          logout();
        }, 4000);
      },
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        background: isDarkTheme ? "#001529" : "#fff",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <AutoComplete
        style={{
          width: 400,
          textAlign: "center",
        }}
        onSearch={handleSearch}
        onSelect={handleSelect}
        value={inputValue}
        options={options}
      >
        <Input.Search
          allowClear
          ref={inputRef}
          style={{ textAlign: "center" }}
          placeholder="Buscar Projetos"
          onClear={() => {
            setInputValue("");
            setOptions([]);
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }}
        />
      </AutoComplete>
      <Dropdown menu={{ items }} trigger={["click"]}>
        <Avatar
          src={userData.profileImage}
          icon={<UserOutlined />}
          alt="user profile"
          size={40}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "50px",
            cursor: "pointer",
          }}
        />
      </Dropdown>
    </Header>
  );
};

export default CustomHeader;
