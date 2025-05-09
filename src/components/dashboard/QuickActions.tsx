
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Users } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <Button 
        className="h-auto py-6 flex flex-col gap-2" 
        onClick={() => navigate("/dashboard/agendamentos")}
      >
        <CalendarDays className="h-6 w-6" />
        <span>Novo Agendamento</span>
      </Button>
      
      <Button 
        className="h-auto py-6 flex flex-col gap-2"
        variant="outline"
        onClick={() => navigate("/dashboard/servicos")}
      >
        <Clock className="h-6 w-6" />
        <span>Gerenciar Serviços</span>
      </Button>
      
      <Button 
        className="h-auto py-6 flex flex-col gap-2"
        variant="outline"
        onClick={() => navigate("/dashboard/clientes")}
      >
        <Users className="h-6 w-6" />
        <span>Cadastrar Cliente</span>
      </Button>
    </div>
  );
};

export default QuickActions;
