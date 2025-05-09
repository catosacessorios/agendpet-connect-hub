
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, DollarSign, Users } from "lucide-react";

import StatsCard from "@/components/dashboard/StatsCard";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import QuickActions from "@/components/dashboard/QuickActions";
import { useDashboard } from "@/hooks/use-dashboard";

const Dashboard = () => {
  const { petshopProfile } = useAuth();
  const { 
    stats, 
    recentAppointments, 
    loading, 
    formatDate, 
    formatTime, 
    formatCurrency 
  } = useDashboard();

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
            <StatsCard
              title="Total de Agendamentos"
              value={stats.totalAppointments}
              icon={CalendarDays}
            />
            <StatsCard
              title="Agendamentos Hoje"
              value={stats.todayAppointments}
              icon={Clock}
            />
            <StatsCard
              title="Total de Clientes"
              value={stats.totalClients}
              icon={Users}
            />
            <StatsCard
              title="Faturamento Total"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
            />
          </div>

          {/* Recent appointments */}
          <RecentAppointments 
            appointments={recentAppointments}
            formatDate={formatDate}
            formatTime={formatTime}
            formatCurrency={formatCurrency}
          />

          {/* Quick actions */}
          <QuickActions />
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
