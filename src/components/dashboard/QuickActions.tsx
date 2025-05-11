
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Scissors, Settings } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const QuickActions = () => {
  const { isAdmin } = useAdmin();
  
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-lg font-medium mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/agendamentos/novo">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <CalendarDays className="h-6 w-6" />
              <span>Novo Agendamento</span>
            </Button>
          </Link>
          
          <Link to="/dashboard/clientes">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Meus Pets</span>
            </Button>
          </Link>
          
          <Link to="/dashboard/servicos">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Scissors className="h-6 w-6" />
              <span>Ver Serviços</span>
            </Button>
          </Link>
          
          <Link to="/dashboard/configuracoes">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Configurações</span>
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin" className="col-span-2 md:col-span-4">
              <Button variant="default" className="w-full h-12 flex items-center justify-center gap-2">
                <Settings className="h-5 w-5" />
                <span>Acessar Painel de Administração</span>
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
