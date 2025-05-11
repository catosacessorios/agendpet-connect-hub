
import { CalendarDays, Users, Clock, Scissors, Settings, Home, DollarSign } from "lucide-react";

export const adminNavItems = [
  { 
    label: "Painel Admin", 
    icon: <Home size={20} />, 
    href: "/admin" 
  },
  { 
    label: "Gerenciar Serviços", 
    icon: <Scissors size={20} />, 
    href: "/admin/servicos" 
  },
  { 
    label: "Gerenciar Horários", 
    icon: <Clock size={20} />, 
    href: "/admin/horarios" 
  },
  { 
    label: "Gerenciar Preços", 
    icon: <DollarSign size={20} />, 
    href: "/admin/precos" 
  },
  { 
    label: "Clientes", 
    icon: <Users size={20} />, 
    href: "/admin/clientes" 
  },
  { 
    label: "Configurações", 
    icon: <Settings size={20} />, 
    href: "/admin/configuracoes" 
  }
];
