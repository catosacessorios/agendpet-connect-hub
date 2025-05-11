
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileSidebarTrigger from "./MobileSidebarTrigger";
import { adminNavItems } from "./adminNavItems";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { petshopProfile, signOut } = useAuth();
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
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      {isMobile && (
        <MobileSidebarTrigger menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
          <Sidebar 
            navItems={adminNavItems} 
            petshopProfile={petshopProfile} 
            handleLogout={handleLogout} 
            setMenuOpen={setMenuOpen}
            isMobile={isMobile}
          />
        </MobileSidebarTrigger>
      )}

      {/* Sidebar */}
      {(!isMobile || menuOpen) && (
        <div className={`
          w-64 bg-white shadow-md p-4 flex flex-col
          ${isMobile ? "fixed left-0 top-0 bottom-0 z-30" : "h-screen sticky top-0"}
        `}>
          <Sidebar 
            navItems={adminNavItems} 
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Modo Administrador
            </span>
          </div>
        </header>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
