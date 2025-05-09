
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types for the dashboard
type AppointmentData = {
  id: string; 
  appointment_date: string;
  start_time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string; price: number } | null;
};

type StatsData = {
  totalAppointments: number;
  todayAppointments: number;
  totalClients: number;
  totalRevenue: number;
};

export const useDashboard = () => {
  const { user, petshopProfile } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [petshopProfile]);

  return {
    stats,
    recentAppointments,
    loading,
    formatDate,
    formatTime,
    formatCurrency
  };
};
