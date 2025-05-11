
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Precos from "./pages/Precos";
import Recursos from "./pages/Recursos";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/dashboard/Agendamentos";
import Servicos from "./pages/dashboard/Servicos";
import Horarios from "./pages/dashboard/Horarios";
import Clientes from "./pages/dashboard/Clientes";
import Configuracoes from "./pages/dashboard/Configuracoes";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

// Admin pages
import AdminDashboard from "./pages/admin/Admin";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminPrecos from "./pages/admin/AdminPrecos";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Auth provider wrapper for routes
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/precos" element={<Precos />} />
    <Route path="/recursos" element={<Recursos />} />
    
    {/* Dashboard protected routes */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dashboard/agendamentos" element={<ProtectedRoute><Agendamentos /></ProtectedRoute>} />
    <Route path="/dashboard/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
    <Route path="/dashboard/horarios" element={<ProtectedRoute><Horarios /></ProtectedRoute>} />
    <Route path="/dashboard/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
    <Route path="/dashboard/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
    
    {/* Admin protected routes */}
    <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
    <Route path="/admin/servicos" element={<ProtectedAdminRoute><AdminServicos /></ProtectedAdminRoute>} />
    <Route path="/admin/horarios" element={<ProtectedAdminRoute><AdminHorarios /></ProtectedAdminRoute>} />
    <Route path="/admin/precos" element={<ProtectedAdminRoute><AdminPrecos /></ProtectedAdminRoute>} />
    <Route path="/admin/clientes" element={<ProtectedAdminRoute><AdminClientes /></ProtectedAdminRoute>} />
    <Route path="/admin/agendamentos" element={<ProtectedAdminRoute><AdminAgendamentos /></ProtectedAdminRoute>} />
    <Route path="/admin/configuracoes" element={<ProtectedAdminRoute><AdminConfiguracoes /></ProtectedAdminRoute>} />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
