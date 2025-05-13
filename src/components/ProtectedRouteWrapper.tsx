
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/use-user-type';
import { toast } from 'sonner';

type ProtectedRouteWrapperProps = {
  children: React.ReactNode;
  requiredUserType?: 'admin' | 'cliente';
};

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userType, loading: typeLoading } = useUserType();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && !typeLoading) {
      if (!user) {
        toast.error("Você precisa estar logado para acessar esta página");
        setIsAuthorized(false);
        return;
      }

      if (requiredUserType && userType !== requiredUserType) {
        toast.error("Você não tem permissão para acessar esta página");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, userType, authLoading, typeLoading, requiredUserType]);

  if (authLoading || typeLoading || isAuthorized === null) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!isAuthorized) {
    // Redirect to appropriate login page based on current path
    if (location.pathname.startsWith('/painel-cliente')) {
      return <Navigate to="/cliente/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRouteWrapper;
