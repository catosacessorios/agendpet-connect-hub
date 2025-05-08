
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, DollarSign, Users } from "lucide-react";

const Dashboard = () => {
  const { user, petshopProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!petshopProfile?.id) return;

      try {
        setLoading(true);
        
        // Get total appointments
        const { count: totalAppointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: false })
          .eq("petshop_id", petshopProfile.id);
          
        if (appointmentsError) throw appointmentsError;

        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAppointments, error: todayAppError } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: false })
          .eq("petshop_id", petshopProfile.id)
          .eq("appointment_date", today);
          
        if (todayAppError) throw todayAppError;

        // Get total clients
        const { count: totalClients, error: clientsError } = await supabase
          .from("clients")
          .select("id", { count: "exact", head: false })
          .eq("petshop_id", petshopProfile.id);
          
        if (clientsError) throw clientsError;

        // Get recent appointments
        const { data: recent, error: recentError } = await supabase
          .from("appointments")
          .select(`
            id, 
            appointment_date, 
            start_time, 
            status, 
            clients(name),
            services(name, price)
          `)
          .eq("petshop_id", petshopProfile.id)
          .order("appointment_date", { ascending: false })
          .order("start_time", { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;

        // Calculate total revenue from completed appointments
        const { data: revenue, error: revenueError } = await supabase
          .from("appointments")
          .select(`
            services(price)
          `)
          .eq("petshop_id", petshopProfile.id)
          .eq("status", "completed");
          
        if (revenueError) throw revenueError;
        
        const totalRevenue = revenue?.reduce((sum, app) => 
          sum + (app.services?.price || 0)
        , 0) || 0;

        setStats({
          totalAppointments: totalAppointments || 0,
          todayAppointments: todayAppointments || 0,
          totalClients: totalClients || 0,
          totalRevenue
        });
        
        setRecentAppointments(recent || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [petshopProfile]);

  // Format date to local format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Format time (HH:MM)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Format currency to BRL
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  return (
    <DashboardLayout title={`Bem-vindo, ${petshopProfile?.name || 'Carregando...'}`}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600">Carregando informações...</p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CalendarDays className="h-8 w-8 text-primary mr-3" />
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Agendamentos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-primary mr-3" />
                  <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary mr-3" />
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Faturamento Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-primary mr-3" />
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent appointments */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Agendamentos Recentes</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/agendamentos")}
                >
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <p className="text-center py-6 text-gray-500">
                  Nenhum agendamento encontrado. Comece a adicionar agendamentos na seção "Agendamentos".
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Serviço</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Horário</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{appointment.clients?.name || "N/A"}</td>
                          <td className="py-3 px-4">{appointment.services?.name || "N/A"}</td>
                          <td className="py-3 px-4">{formatDate(appointment.appointment_date)}</td>
                          <td className="py-3 px-4">{formatTime(appointment.start_time)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                              appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                              appointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {appointment.status === "confirmed" ? "Confirmado" :
                               appointment.status === "cancelled" ? "Cancelado" :
                               appointment.status === "completed" ? "Concluído" :
                               "Pendente"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(appointment.services?.price || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
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
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
