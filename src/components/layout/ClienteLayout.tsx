
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCliente } from "@/hooks/use-cliente";

import Sidebar from "./Sidebar";
import MobileSidebarTrigger from "./MobileSidebarTrigger";
import { clienteNavItems } from "./clienteNavItems";

type ClienteLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const ClienteLayout: React.FC<ClienteLayoutProps> = ({ children, title }) => {
  const { user, signOut } = useAuth();
  const { cliente } = useCliente();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da sua conta");
    navigate("/cliente/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      {isMobile && (
        <MobileSidebarTrigger menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
          <Sidebar 
            navItems={clienteNavItems} 
            petshopProfile={{
              name: "Portal do Cliente",
              logo_url: null
            }} 
            handleLogout={handleLogout} 
            setMenuOpen={setMenuOpen}
            isMobile={isMobile}
            userName={cliente?.name || "Cliente"}
          />
        </MobileSidebarTrigger>
      )}

      {/* Sidebar */}
      {(!isMobile || menuOpen) && (
        <div className={cn(
          "w-64 bg-white shadow-md p-4 flex flex-col",
          isMobile ? "fixed left-0 top-0 bottom-0 z-30" : "h-screen sticky top-0"
        )}>
          <Sidebar 
            navItems={clienteNavItems} 
            petshopProfile={{
              name: "Portal do Cliente",
              logo_url: null
            }} 
            handleLogout={handleLogout}
            setMenuOpen={setMenuOpen}
            isMobile={isMobile}
            userName={cliente?.name || "Cliente"}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </header>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClienteLayout;
