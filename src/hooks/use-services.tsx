
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
};

export const useServices = () => {
  const { petshopProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchServices();
    }
  }, [petshopProfile]);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("petshop_id", petshopProfile?.id)
        .order("name");

      if (error) throw error;
      
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchQuery) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(query) || 
      (service.description?.toLowerCase().includes(query) ?? false)
    );
    
    setFilteredServices(filtered);
  };

  const createService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const { error } = await supabase
        .from("services")
        .insert([serviceData]);
      
      if (error) throw error;
      
      toast.success("Serviço criado com sucesso!");
      await fetchServices();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar serviço");
      console.error("Error creating service:", error);
      return false;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Omit<Service, 'id'>>) => {
    try {
      const { error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Serviço atualizado com sucesso!");
      await fetchServices();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar serviço");
      console.error("Error updating service:", error);
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Serviço excluído com sucesso!");
      await fetchServices();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir serviço");
      console.error("Error deleting service:", error);
      return false;
    }
  };

  return {
    services,
    filteredServices,
    loading,
    searchQuery,
    setSearchQuery,
    createService,
    updateService,
    deleteService,
  };
};
