
import { CalendarDays, Users, Shopping, Scissors, Settings, Home } from "lucide-react";

export const dashboardNavItems = [
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
    label: "Serviços Disponíveis", 
    icon: <Scissors size={20} />, 
    href: "/dashboard/servicos" 
  },
  { 
    label: "Meus Pets", 
    icon: <Users size={20} />, 
    href: "/dashboard/clientes" 
  },
  { 
    label: "Configurações", 
    icon: <Settings size={20} />, 
    href: "/dashboard/configuracoes" 
  }
];
