
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  petshop_id: string;
  created_at?: string;
  updated_at?: string;
};

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { petshopProfile } = useAuth();

  // Filtrar serviços com base na pesquisa
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Se não estiver logado como petshop, apenas buscar serviços ativos
      let query = supabase.from("services").select("*");
      
      if (petshopProfile?.id) {
        // Se estiver logado como petshop, buscar todos os serviços desse petshop
        query = query.eq("petshop_id", petshopProfile.id);
      } else {
        // Se não estiver logado como petshop, apenas buscar serviços ativos
        query = query.eq("active", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Erro ao buscar serviços");
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, "id">) => {
    try {
      if (!petshopProfile?.id) {
        toast.error("Você precisa estar logado para criar um serviço");
        return false;
      }
      
      const dataWithPetshopId = {
        ...serviceData,
        petshop_id: petshopProfile.id
      };
      
      const { error } = await supabase.from("services").insert(dataWithPetshopId);
      
      if (error) throw error;
      
      toast.success("Serviço criado com sucesso!");
      fetchServices();
      return true;
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Erro ao criar serviço");
      return false;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Serviço atualizado com sucesso!");
      fetchServices();
      return true;
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Erro ao atualizar serviço");
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      
      if (error) throw error;
      
      toast.success("Serviço excluído com sucesso!");
      fetchServices();
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Erro ao excluir serviço");
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
    deleteService
  };
};
