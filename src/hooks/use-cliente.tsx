
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Cliente = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  user_id: string;
  created_at: string;
};

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  client_id: string;
};

export const useCliente = () => {
  const { user } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClienteData();
    } else {
      setCliente(null);
      setPets([]);
      setLoading(false);
    }
  }, [user]);

  const fetchClienteData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (clienteError) throw clienteError;
      
      if (clienteData) {
        const clienteObj: Cliente = {
          id: clienteData.id,
          name: clienteData.name,
          email: clienteData.email,
          phone: clienteData.phone,
          user_id: user!.id,
          created_at: clienteData.created_at
        };
        
        setCliente(clienteObj);

        // Buscar pets do cliente
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select("*")
          .eq("client_id", clienteData.id);

        if (petsError) throw petsError;
        
        setPets(petsData || []);
      }
    } catch (error: any) {
      console.error("Erro ao buscar dados do cliente:", error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Omit<Pet, "id" | "client_id">) => {
    if (!cliente) {
      toast.error("Você precisa estar logado para adicionar um pet");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("pets")
        .insert([
          {
            ...petData,
            client_id: cliente.id
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setPets([...pets, data[0]]);
        toast.success("Pet adicionado com sucesso!");
      }
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar pet:", error);
      toast.error(error.message || "Erro ao adicionar pet");
      return false;
    }
  };

  const updateClienteProfile = async (profileData: Partial<Cliente>) => {
    if (!cliente) {
      toast.error("Você precisa estar logado para atualizar o perfil");
      return false;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .update(profileData)
        .eq("id", cliente.id);

      if (error) throw error;

      setCliente({
        ...cliente,
        ...profileData
      });

      toast.success("Perfil atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
      return false;
    }
  };

  return {
    cliente,
    pets,
    loading,
    addPet,
    updateClienteProfile,
    refreshData: fetchClienteData
  };
};
