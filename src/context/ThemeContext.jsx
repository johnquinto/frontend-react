// src/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? JSON.parse(savedTheme) : true; // false é o padrão (modo claro)
  });

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      localStorage.setItem("theme", JSON.stringify(newTheme)); // Salva o novo estado no localStorage
      return newTheme;
    });
  };

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkTheme)); // Atualiza o estado no localStorage
  }, [isDarkTheme]);

  return (
    <ConfigProvider
      theme={{
        components:{
          Select:{        
            optionActiveBg : isDarkTheme ? "#223146" : "#f4f4f4",
            optionSelectedBg: isDarkTheme ? "#223146" : "#f4f4f4",
          },          
        },
        token: {          
          // Cores de fundo e texto
          colorBgBase: isDarkTheme ? " #0c1b2e" : " #f4f4f4", // Fundo escuro #0c1b2e ou fundo claro
          colorTextBase: isDarkTheme ? " #d1d1d1" : " #333333", // Texto claro ou escuro
          // colorTextBase: isDarkTheme ? "#007bff" : "#333333", // Texto claro ou escuro
          colorText: isDarkTheme ? " #d1d1d1" : " #222222", // Cor do texto principal
          colorTextSecondary: isDarkTheme ? " #b0b0b0" : " #666666", // Texto secundário
          colorTextPlaceholder: isDarkTheme ? " #808080" : " #d9d9d9", // Texto placeholder

          // Bordas e contornos
          colorBorderSecondary: isDarkTheme ? "#2a3d4d" : "#d9d9d9", // Borda secundária
          colorBorder: isDarkTheme ? "#2a3d4d" : "#d9d9d9", // Cor da borda padrão
          controlOutline:  null, // Contorno de inputs e controles

          // Cores principais
          colorPrimary: isDarkTheme ? "#007bff" : "#0050b3", // Azul mais forte para links e botões principais
          colorPrimaryActive: isDarkTheme ? "#0056b3" : "#0040a0", // Azul para quando o link ou botão está ativo
          colorLink: isDarkTheme ? "#d1d1d1" : "#0066cc", // Azul mais claro para links                 

          // Cores de estado (erro, sucesso, advertência)
          colorError: "#ff4d4f", // Cor de erro (vermelho)
          colorWarning: "#faad14", // Cor de advertência (amarelo)
          colorSuccess: "#52c41a", // Cor de sucesso (verde)
          colorInfo: "#1890ff", // Cor de informação (azul)

          // Cores de fundo e bordas de containers
          colorBgContainer: isDarkTheme ? "#1a2636" : "#ffffff", // Fundo de containers como painéis
          colorBgBase: isDarkTheme ? "#0c1b2e" : "#ffffff", // Fundo base para o tema
          colorLinkHover: isDarkTheme ? "#ddd" : "#3d7bcc", // Cor do link no hover

   
        },
      }}
    >
      <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export const useTheme = () => useContext(ThemeContext);
