
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/use-user-type";
import { toast } from "sonner";

type ProtectedClienteRouteProps = {
  children: React.ReactNode;
};

const ProtectedClienteRoute: React.FC<ProtectedClienteRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { userType, loading: typeLoading } = useUserType();
  
  if (authLoading || typeLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!user) {
    toast.error("Você precisa estar logado para acessar essa página");
    return <Navigate to="/cliente/login" />;
  }

  if (userType !== 'cliente') {
    toast.error("Você não tem permissão para acessar essa página");
    return <Navigate to="/cliente/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedClienteRoute;
