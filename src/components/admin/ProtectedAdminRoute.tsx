
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

type ProtectedAdminRouteProps = {
  children: React.ReactNode;
};

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  if (authLoading || adminLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!user) {
    toast.error("Você precisa estar logado para acessar essa página");
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    toast.error("Você não tem permissão para acessar essa página");
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default ProtectedAdminRoute;
