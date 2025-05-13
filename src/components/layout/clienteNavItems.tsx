
import { Home, Calendar, Settings, Book } from "lucide-react";
import { ReactNode } from "react";

// Definindo o tipo correto para os itens de navegação
export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export const clienteNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/cliente/dashboard",
    icon: <Home />
  },
  {
    label: "Serviços",
    href: "/cliente/servicos",
    icon: <Book />
  },
  {
    label: "Meus Agendamentos",
    href: "/cliente/agendamentos",
    icon: <Calendar />
  },
  {
    label: "Meu Perfil",
    href: "/cliente/perfil",
    icon: <Settings />
  }
];
