// src/layout/SimpleLayout.js
import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

const SimpleLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}> {/* Adicionado overflow: 'hidden' */}
      <Content style={{ padding: '0', background: '#fff', height: '100vh' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default SimpleLayout;
