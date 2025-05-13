
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, Users, Clock, Scissors, Settings, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SidebarProps = {
  navItems: {
    label: string;
    icon: React.ReactNode;
    href: string;
  }[];
  petshopProfile: { name: string; logo_url?: string | null } | null;
  handleLogout: () => void;
  setMenuOpen?: (open: boolean) => void;
  isMobile?: boolean;
  userName?: string; // Added userName as an optional prop
};

const Sidebar: React.FC<SidebarProps> = ({ 
  navItems, 
  petshopProfile, 
  handleLogout, 
  setMenuOpen,
  isMobile,
  userName 
}) => {
  const closeMenu = () => {
    if (isMobile && setMenuOpen) {
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
        {userName && (
          <div className="mt-2 text-sm font-medium">
            Olá, {userName}
          </div>
        )}
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

export default Sidebar;
