// src/layout/ContentArea.jsx

import React from 'react';
import { Layout } from 'antd';
import { useTheme } from '../context/ThemeContext'; // Importa o contexto do tema
import Title from 'antd/es/typography/Title';

const { Content } = Layout;

const ContentArea = ({ children }) => {
  const { isDarkTheme } = useTheme(); // Obtém o estado do tema

  return (
    <>     
    <Content
      style={{
        margin: '24px 16px',
        padding: 24,
        minHeight: 280,
        background: isDarkTheme ? '#001529' : '#fff', // Altera a cor de fundo
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 112px)',
      }}
      className="custom-scrollbar" // classe para estilização da scrollbar
    > 
      {children}
    </Content>
    </>
  );
};

export default ContentArea;
