
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, Users, Clock, Scissors, Settings, LogOut, Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const navItems = [
    { 
      label: "Dashboard", 
      icon: <Home size={20} />, 
      href: "/dashboard" 
    },
    { 
      label: "Agendamentos", 
      icon: <CalendarDays size={20} />, 
      href: "/dashboard/agendamentos" 
    },
    { 
      label: "Serviços", 
      icon: <Scissors size={20} />, 
      href: "/dashboard/servicos" 
    },
    { 
      label: "Horários", 
      icon: <Clock size={20} />, 
      href: "/dashboard/horarios" 
    },
    { 
      label: "Clientes", 
      icon: <Users size={20} />, 
      href: "/dashboard/clientes" 
    },
    { 
      label: "Configurações", 
      icon: <Settings size={20} />, 
      href: "/dashboard/configuracoes" 
    }
  ];

  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da sua conta");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-40">
          <Collapsible open={menuOpen} onOpenChange={setMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="fixed top-16 left-0 z-30 w-64 shadow-lg bg-white">
              <Sidebar 
                navItems={navItems} 
                petshopProfile={petshopProfile} 
                handleLogout={handleLogout} 
                setMenuOpen={setMenuOpen}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Sidebar */}
      {(!isMobile || menuOpen) && (
        <div className={cn(
          "w-64 bg-white shadow-md p-4 flex flex-col",
          isMobile ? "fixed left-0 top-0 bottom-0 z-30" : "h-screen sticky top-0"
        )}>
          <Sidebar 
            navItems={navItems} 
            petshopProfile={petshopProfile} 
            handleLogout={handleLogout}
            setMenuOpen={setMenuOpen}
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

type SidebarProps = {
  navItems: {
    label: string;
    icon: React.ReactNode;
    href: string;
  }[];
  petshopProfile: { name: string; logo_url?: string | null } | null;
  handleLogout: () => void;
  setMenuOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ navItems, petshopProfile, handleLogout, setMenuOpen }) => {
  const isMobile = useIsMobile();
  
  const closeMenu = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };
  
  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        <Link to="/dashboard" className="text-xl font-bold text-primary mb-2">
          AgendPet
        </Link>
        <div className="text-sm text-gray-600 text-center">
          {petshopProfile?.name}
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors",
                    isActive && "bg-primary/10 text-primary font-medium"
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </>
  );
};

export default DashboardLayout;
