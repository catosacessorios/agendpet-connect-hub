
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRouteWrapper from "./components/ProtectedRouteWrapper";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ProtectedClienteRoute from "./components/cliente/ProtectedClienteRoute";

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
import PainelAdministrador from "./pages/painel-administrador";

// Cliente pages
import ClienteLogin from "./pages/cliente/ClienteLogin";
import ClienteCadastro from "./pages/cliente/ClienteCadastro";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteServicos from "./pages/cliente/ClienteServicos";
import ClienteAgendar from "./pages/cliente/ClienteAgendar";
import ClienteAgendamentos from "./pages/cliente/ClienteAgendamentos";
import ClientePerfil from "./pages/cliente/ClientePerfil";
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
              <Route path="/admin" element={<ProtectedAdminRoute><PainelAdministrador /></ProtectedAdminRoute>} />
              <Route path="/admin/servicos" element={<ProtectedAdminRoute><Servicos /></ProtectedAdminRoute>} />
              <Route path="/admin/horarios" element={<ProtectedAdminRoute><Horarios /></ProtectedAdminRoute>} />
              <Route path="/admin/precos" element={<ProtectedAdminRoute><Servicos /></ProtectedAdminRoute>} />
              <Route path="/admin/clientes" element={<ProtectedAdminRoute><Clientes /></ProtectedAdminRoute>} />
              <Route path="/admin/agendamentos" element={<ProtectedAdminRoute><Agendamentos /></ProtectedAdminRoute>} />
              <Route path="/admin/configuracoes" element={<ProtectedAdminRoute><Configuracoes /></ProtectedAdminRoute>} />
              
              {/* Cliente routes - require login and cliente role */}
              <Route path="/cliente/login" element={<ClienteLogin />} />
              <Route path="/cliente/cadastro" element={<ClienteCadastro />} />
              <Route path="/cliente" element={<ProtectedClienteRoute><PainelCliente /></ProtectedClienteRoute>} />
              <Route path="/cliente/dashboard" element={<ProtectedClienteRoute><ClienteDashboard /></ProtectedClienteRoute>} />
              <Route path="/cliente/servicos" element={<ProtectedClienteRoute><ClienteServicos /></ProtectedClienteRoute>} />
              <Route path="/cliente/agendar/:serviceId" element={<ProtectedClienteRoute><ClienteAgendar /></ProtectedClienteRoute>} />
              <Route path="/cliente/agendamentos" element={<ProtectedClienteRoute><ClienteAgendamentos /></ProtectedClienteRoute>} />
              <Route path="/cliente/perfil" element={<ProtectedClienteRoute><ClientePerfil /></ProtectedClienteRoute>} />
              
              {/* Legacy routes - will be deprecated */}
              <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/dashboard/agendamentos" element={<Navigate to="/admin/agendamentos" replace />} />
              <Route path="/dashboard/servicos" element={<Navigate to="/admin/servicos" replace />} />
              <Route path="/dashboard/horarios" element={<Navigate to="/admin/horarios" replace />} />
              <Route path="/dashboard/clientes" element={<Navigate to="/admin/clientes" replace />} />
              <Route path="/dashboard/configuracoes" element={<Navigate to="/admin/configuracoes" replace />} />
              
              {/* Painel routes - redirect to appropriate dashboard */}
              <Route path="/painel-administrador" element={<Navigate to="/admin" replace />} />
              <Route path="/painel-cliente" element={<Navigate to="/cliente" replace />} />
              
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
