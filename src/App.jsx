import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import { ConnectionProvider } from "./context/ConnectionContext";
import ConnectionModal from "./components/connection/ConnectionModal";

import Sidebar from "./layout/SideBar";
import CustomHeader from "./layout/Header";
import Home from "./pages/team/Login"; // Página inicial
import CreateTeam from "./pages/team/CreateTeam"; // Página para criar team
import JoinTeam from "./pages/team/JoinTeam"; // Página para unir-se a um team
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ContentArea from "./layout/ContentArea";
import SimpleLayout from "./layout/SimpleLayout"; // Novo layout simples
import Test from "./pages/Test";
import ProjectDetailsPage from "./pages/projects/ProjectDetailsPage";
import EditProjectPage from "./pages/projects/EditProjectPage";
import EditTaskPage from "./pages/tasks/EditTaskPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import UsersPage from "./pages/UsersPage";
import TaskListPage from "./pages/tasks/TaskListPage";
import TaskManagementPage from "./pages/tasks/TaskManagementPage";
import "./index.css";
import Notification from "./pages/Notification";
import Alarm from "./pages/Alarm";
import ModalUserRemoved from "./components/others/ModalUserRemoved";
import CreateTeamNext from "./pages/team/CreateTeamNext";
import JoinTeamNext from "./pages/team/JoinTeamNext";
import JoinTeamFinal from "./pages/team/JoinTeamFinal";


const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConnectionProvider>
      <ConnectionModal />
      <AuthProvider>
        <Router>
          <NotificationProvider>
            <ModalUserRemoved />
            <Routes>
              {/* Rotas com layout simples */}
              <Route
                path="/"
                element={
                  <SimpleLayout>
                    <Home />
                  </SimpleLayout>
                }
              />
              <Route
                path="/create-team"
                element={
                  <SimpleLayout>
                    <CreateTeam />
                  </SimpleLayout>
                }
              />
              <Route
                path="/create-team-next/:firstname/:secondname/:email"
                element={
                  <SimpleLayout>
                    <CreateTeamNext />
                  </SimpleLayout>
                }
              />
              <Route
                path="/join-team"
                element={
                  <SimpleLayout>
                    <JoinTeam />
                  </SimpleLayout>
                }
              />
              <Route
                path="/join-team-next/:teamId"
                element={
                  <SimpleLayout>
                    <JoinTeamNext />
                  </SimpleLayout>
                }
              />
              <Route
                path="/join-team-final/:teamId/:firstname/:secondname/:email"
                element={
                  <SimpleLayout>
                    <JoinTeamFinal />
                  </SimpleLayout>
                }
              />
              <Route path="/test" element={<Test />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* Rotas com layout padrão */}
              <Route
                path="/home"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <HomePage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/projects"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <ProjectsPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/projects/create"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <CreateProjectPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <ProjectDetailsPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/projects/:projectId/edit"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <EditProjectPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/projects/:projectId/tasks/:taskId/edit"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <EditTaskPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/tasks-management"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <TaskManagementPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/tasks-management/:projectId/:taskId/"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <TaskManagementPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/tasks-list/:projectId"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <TaskListPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/chat"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <ChatPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/notification"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <Notification />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />

              <Route
                path="/alarm"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <Alarm />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />

              <Route
                path="/profile"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <ProfilePage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <SettingsPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
              <Route
                path="/users"
                element={
                  <Layout
                    style={{ minHeight: "100vh" }}
                    className="custom-scrollbar"
                  >
                    <Sidebar collapsed={collapsed} />
                    <Layout>
                      <CustomHeader
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                      />
                      <ContentArea>
                        <UsersPage />
                      </ContentArea>
                    </Layout>
                  </Layout>
                }
              />
            </Routes>
          </NotificationProvider>
        </Router>
      </AuthProvider>
    </ConnectionProvider>
  );
};

export default App;
