
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Book } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente } from "@/hooks/use-cliente";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

type Agendamento = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  services: {
    name: string;
    price: number;
  } | null;
};

const ClienteDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { cliente, loading: clienteLoading } = useCliente();
  const navigate = useNavigate();
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
    } else if (user && cliente) {
      fetchDashboardData();
    }
  }, [user, cliente, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!cliente) return;
    
    try {
      setLoading(true);
      
      // Buscar próximos agendamentos
      const today = new Date().toISOString().split('T')[0];
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          services (name, price)
        `)
        .eq("client_id", cliente.id)
        .gte("appointment_date", today)
        .order("appointment_date")
        .order("start_time")
        .limit(3);

      if (agendamentosError) throw agendamentosError;
      
      setProximosAgendamentos(agendamentos || []);

      // Contar serviços disponíveis
      const { count, error: servicosError } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("active", true);

      if (servicosError) throw servicosError;
      
      setServicosDisponiveis(count || 0);
    } catch (error: any) {
      console.error("Erro ao buscar dados do dashboard:", error);
      toast.error("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || authLoading || clienteLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  return (
    <ClienteLayout title={`Bem-vindo, ${cliente?.name || ""}`}>
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{proximosAgendamentos.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" 
              onClick={() => navigate("/cliente/agendamentos")}>
              <Calendar className="mr-2 h-4 w-4" />
              Ver Agendamentos
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Serviços Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{servicosDisponiveis}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" 
              onClick={() => navigate("/cliente/servicos")}>
              <Book className="mr-2 h-4 w-4" />
              Ver Serviços
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fazer Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Agende um novo serviço para seu pet
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" 
              onClick={() => navigate("/cliente/servicos")}>
              <Clock className="mr-2 h-4 w-4" />
              Agendar Agora
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Próximos agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {proximosAgendamentos.length > 0 ? (
            <div className="space-y-4">
              {proximosAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{agendamento.services?.name || "Serviço"}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(agendamento.appointment_date)} • {formatTime(agendamento.start_time)} - {formatTime(agendamento.end_time)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                      {formatStatus(agendamento.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">
              Você não tem agendamentos próximos.
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t bg-gray-50">
          <Button variant="outline" className="w-full" onClick={() => navigate("/cliente/agendamentos")}>
            Ver todos os agendamentos
          </Button>
        </CardFooter>
      </Card>
    </ClienteLayout>
  );
};

export default ClienteDashboard;
