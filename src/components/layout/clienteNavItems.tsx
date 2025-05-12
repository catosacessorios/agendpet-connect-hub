
import { Home, Calendar, Settings, Book } from "lucide-react";

export const clienteNavItems = [
  {
    label: "Dashboard",
    href: "/cliente/dashboard",
    icon: Home
  },
  {
    label: "Serviços",
    href: "/cliente/servicos",
    icon: Book
  },
  {
    label: "Meus Agendamentos",
    href: "/cliente/agendamentos",
    icon: Calendar
  },
  {
    label: "Meu Perfil",
    href: "/cliente/perfil",
    icon: Settings
  }
];
