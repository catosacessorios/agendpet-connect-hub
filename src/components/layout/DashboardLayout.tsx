
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import Sidebar from "./Sidebar";
import MobileSidebarTrigger from "./MobileSidebarTrigger";
import { dashboardNavItems } from "./dashboardNavItems";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { petshopProfile, signOut } = useAuth();
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
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      {isMobile && (
        <MobileSidebarTrigger menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
          <Sidebar 
            navItems={dashboardNavItems} 
            petshopProfile={petshopProfile} 
            handleLogout={handleLogout} 
            setMenuOpen={setMenuOpen}
            isMobile={isMobile}
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
            navItems={dashboardNavItems} 
            petshopProfile={petshopProfile} 
            handleLogout={handleLogout}
            setMenuOpen={setMenuOpen}
            isMobile={isMobile}
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

export default DashboardLayout;
