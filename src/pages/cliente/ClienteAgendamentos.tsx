
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente } from "@/hooks/use-cliente";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  pets: {
    name: string;
    species: string;
  } | null;
};

const ClienteAgendamentos = () => {
  const { user, loading: authLoading } = useAuth();
  const { cliente, loading: clienteLoading } = useCliente();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [activeTab, setActiveTab] = useState("proximos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
    } else if (user && cliente) {
      fetchAgendamentos();
    }
  }, [user, cliente, authLoading, navigate]);

  const fetchAgendamentos = async () => {
    if (!cliente) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          services (name, price),
          pets (name, species)
        `)
        .eq("client_id", cliente.id)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      
      setAgendamentos(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const cancelarAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Agendamento cancelado com sucesso");
      fetchAgendamentos();
    } catch (error: any) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento");
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

  const isAgendamentoFuturo = (dateString: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dateString);
    return data >= hoje;
  };

  const agendamentosProximos = agendamentos.filter(a => 
    isAgendamentoFuturo(a.appointment_date) && a.status !== "cancelled"
  );
  
  const agendamentosAnteriores = agendamentos.filter(a => 
    !isAgendamentoFuturo(a.appointment_date) || a.status === "cancelled"
  );

  if (loading || authLoading || clienteLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  const renderAgendamentosList = (lista: Agendamento[]) => {
    if (lista.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum agendamento encontrado.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lista.map((agendamento) => (
          <Card key={agendamento.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{agendamento.services?.name || "Serviço"}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Pet: {agendamento.pets?.name || "N/A"} ({agendamento.pets?.species || "N/A"})
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(agendamento.appointment_date)} • {formatTime(agendamento.start_time)} - {formatTime(agendamento.end_time)}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Valor: {agendamento.services?.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "N/A"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                    {formatStatus(agendamento.status)}
                  </span>
                  
                  {agendamento.status !== "cancelled" && agendamento.status !== "completed" && isAgendamentoFuturo(agendamento.appointment_date) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 mt-2"
                      onClick={() => cancelarAgendamento(agendamento.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <ClienteLayout title="Meus Agendamentos">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="proximos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="proximos">Próximos</TabsTrigger>
              <TabsTrigger value="anteriores">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="proximos">
              {renderAgendamentosList(agendamentosProximos)}
            </TabsContent>
            
            <TabsContent value="anteriores">
              {renderAgendamentosList(agendamentosAnteriores)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ClienteLayout>
  );
};

export default ClienteAgendamentos;
