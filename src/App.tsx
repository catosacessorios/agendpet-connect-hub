
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRouteWrapper from "./components/ProtectedRouteWrapper";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Precos from "./pages/Precos";
import Recursos from "./pages/Recursos";
import NotFound from "./pages/NotFound";

// Admin pages
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/dashboard/Agendamentos";
import Servicos from "./pages/dashboard/Servicos";
import Horarios from "./pages/dashboard/Horarios";
import Clientes from "./pages/dashboard/Clientes";
import Configuracoes from "./pages/dashboard/Configuracoes";
import AdminDashboard from "./pages/admin/Admin";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminPrecos from "./pages/admin/AdminPrecos";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";

// New admin panel
import PainelAdministrador from "./pages/painel-administrador";

// Cliente pages
import ClienteLogin from "./pages/cliente/ClienteLogin";
import ClienteCadastro from "./pages/cliente/ClienteCadastro";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteServicos from "./pages/cliente/ClienteServicos";
import ClienteAgendar from "./pages/cliente/ClienteAgendar";
import ClienteAgendamentos from "./pages/cliente/ClienteAgendamentos";
import ClientePerfil from "./pages/cliente/ClientePerfil";

// New client panel
import PainelCliente from "./pages/painel-cliente";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/precos" element={<Precos />} />
              <Route path="/recursos" element={<Recursos />} />
              
              {/* Admin routes - require login and admin role */}
              <Route 
                path="/painel-administrador" 
                element={
                  <ProtectedRouteWrapper requiredUserType="admin">
                    <PainelAdministrador />
                  </ProtectedRouteWrapper>
                } 
              />
              
              {/* Client routes - require login and client role */}
              <Route 
                path="/painel-cliente" 
                element={
                  <ProtectedRouteWrapper requiredUserType="cliente">
                    <PainelCliente />
                  </ProtectedRouteWrapper>
                } 
              />
              
              {/* Legacy routes */}
              <Route path="/dashboard" element={<ProtectedRouteWrapper><Dashboard /></ProtectedRouteWrapper>} />
              <Route path="/dashboard/agendamentos" element={<ProtectedRouteWrapper><Agendamentos /></ProtectedRouteWrapper>} />
              <Route path="/dashboard/servicos" element={<ProtectedRouteWrapper><Servicos /></ProtectedRouteWrapper>} />
              <Route path="/dashboard/horarios" element={<ProtectedRouteWrapper><Horarios /></ProtectedRouteWrapper>} />
              <Route path="/dashboard/clientes" element={<ProtectedRouteWrapper><Clientes /></ProtectedRouteWrapper>} />
              <Route path="/dashboard/configuracoes" element={<ProtectedRouteWrapper><Configuracoes /></ProtectedRouteWrapper>} />
              
              <Route path="/admin" element={<ProtectedRouteWrapper><AdminDashboard /></ProtectedRouteWrapper>} />
              <Route path="/admin/servicos" element={<ProtectedRouteWrapper><AdminServicos /></ProtectedRouteWrapper>} />
              <Route path="/admin/horarios" element={<ProtectedRouteWrapper><AdminHorarios /></ProtectedRouteWrapper>} />
              <Route path="/admin/precos" element={<ProtectedRouteWrapper><AdminPrecos /></ProtectedRouteWrapper>} />
              <Route path="/admin/clientes" element={<ProtectedRouteWrapper><AdminClientes /></ProtectedRouteWrapper>} />
              <Route path="/admin/agendamentos" element={<ProtectedRouteWrapper><AdminAgendamentos /></ProtectedRouteWrapper>} />
              <Route path="/admin/configuracoes" element={<ProtectedRouteWrapper><AdminConfiguracoes /></ProtectedRouteWrapper>} />
              
              <Route path="/cliente/login" element={<ClienteLogin />} />
              <Route path="/cliente/cadastro" element={<ClienteCadastro />} />
              <Route path="/cliente/dashboard" element={<ProtectedRouteWrapper><ClienteDashboard /></ProtectedRouteWrapper>} />
              <Route path="/cliente/servicos" element={<ProtectedRouteWrapper><ClienteServicos /></ProtectedRouteWrapper>} />
              <Route path="/cliente/agendar/:serviceId" element={<ProtectedRouteWrapper><ClienteAgendar /></ProtectedRouteWrapper>} />
              <Route path="/cliente/agendamentos" element={<ProtectedRouteWrapper><ClienteAgendamentos /></ProtectedRouteWrapper>} />
              <Route path="/cliente/perfil" element={<ProtectedRouteWrapper><ClientePerfil /></ProtectedRouteWrapper>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
