
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
          const [clientsResult, appointmentsResult, servicesResult, pendingAppointmentsResult] = await Promise.all([
            supabase.from("clients").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("appointments").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("services").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId),
            supabase.from("appointments").select("id", { count: 'exact', head: true }).eq("petshop_id", petshopId).eq("status", "pending")
          ]);
          
          setStats({
            totalClients: clientsResult.count || 0,
            totalAppointments: appointmentsResult.count || 0,
            totalServices: servicesResult.count || 0,
            pendingAppointments: pendingAppointmentsResult.count || 0
          });
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
          icon={<Users className="h-6 w-6 text-blue-600" />}
          description="Clientes cadastrados"
        />
        <StatsCard 
          title="Total de Agendamentos" 
          value={stats.totalAppointments} 
          icon={<CalendarDays className="h-6 w-6 text-purple-600" />}
          description="Agendamentos realizados"
        />
        <StatsCard 
          title="Serviços Disponíveis" 
          value={stats.totalServices} 
          icon={<Scissors className="h-6 w-6 text-green-600" />}
          description="Serviços oferecidos"
        />
        <StatsCard 
          title="Agendamentos Pendentes" 
          value={stats.pendingAppointments} 
          icon={<Clock className="h-6 w-6 text-amber-600" />} 
          description="Aguardando atendimento"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentAppointments />
            </CardContent>
          </Card>
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
