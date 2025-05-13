
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/use-user-type";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, Scissors, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string; price: number } | null;
};

const PainelAdministrador = () => {
  const { user } = useAuth();
  const { userType, loading: typeLoading } = useUserType();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAppointments: 0,
    totalServices: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        
        // Get petshop ID
        const { data: petshopData, error: petshopError } = await supabase
          .from("petshops")
          .select("id")
          .eq("user_id", user.id)
          .single();
          
        if (petshopError) throw petshopError;
        
        if (petshopData) {
          const petshopId = petshopData.id;
          
          // Get stats
          const [clientsResult, appointmentsResult, servicesResult, pendingAppointmentsResult, recentAppointmentsResult] = await Promise.all([
            supabase.from("clients").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("appointments").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("services").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("appointments").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId).eq("status", "pending"),
            supabase.from("appointments").select(`
              id, 
              appointment_date, 
              start_time, 
              status,
              clients (name),
              services (name, price)
            `).eq("petshop_id", petshopId).order('appointment_date', { ascending: false }).limit(5)
          ]);
          
          setStats({
            totalClients: clientsResult.count || 0,
            totalAppointments: appointmentsResult.count || 0,
            totalServices: servicesResult.count || 0,
            pendingAppointments: pendingAppointmentsResult.count || 0
          });
          
          if (recentAppointmentsResult.data) {
            setRecentAppointments(recentAppointmentsResult.data as unknown as Appointment[]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Helper functions for formatting data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Redirect if not admin type
  useEffect(() => {
    if (!typeLoading && userType !== 'admin') {
      toast.error("Você não tem permissão para acessar o painel administrativo");
      navigate('/login');
    }
  }, [userType, typeLoading, navigate]);

  if (loading || typeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout title="Painel Administrativo">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total de Clientes" 
          value={stats.totalClients} 
          icon={Users} 
          description="Clientes cadastrados"
        />
        <StatsCard 
          title="Total de Agendamentos" 
          value={stats.totalAppointments} 
          icon={CalendarDays} 
          description="Agendamentos realizados"
        />
        <StatsCard 
          title="Serviços Disponíveis" 
          value={stats.totalServices} 
          icon={Scissors} 
          description="Serviços oferecidos"
        />
        <StatsCard 
          title="Agendamentos Pendentes" 
          value={stats.pendingAppointments} 
          icon={Clock} 
          description="Aguardando atendimento"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentAppointments 
            appointments={recentAppointments}
            formatDate={formatDate}
            formatTime={formatTime}
            formatCurrency={formatCurrency}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/dashboard/agendamentos">
                  <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <CalendarDays className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center">Agendamentos</span>
                  </div>
                </Link>
                <Link to="/dashboard/servicos">
                  <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Scissors className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center">Serviços</span>
                  </div>
                </Link>
                <Link to="/dashboard/clientes">
                  <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center">Clientes</span>
                  </div>
                </Link>
                <Link to="/dashboard/configuracoes">
                  <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center">Configurações</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PainelAdministrador;
