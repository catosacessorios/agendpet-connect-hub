
import { CalendarDays, Users, Clock, Scissors, Settings, Home } from "lucide-react";

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
