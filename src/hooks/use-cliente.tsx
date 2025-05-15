
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interfaces
export interface Cliente {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  petshop_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  notes: string | null;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export const useCliente = () => {
  const { user } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCliente();
    } else {
      setLoading(false);
      setCliente(null);
      setPets([]);
    }
  }, [user]);

  const fetchCliente = async () => {
    try {
      setLoading(true);
      
      // Usando a sintaxe genérica correta do Supabase v2
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Cliente não encontrado para este usuário');
        } else {
          console.error('Erro ao buscar cliente:', error);
          toast.error('Erro ao carregar dados do cliente');
        }
        setCliente(null);
        setPets([]);
      } else if (data) {
        // Usando type assertion com unknown como intermediário para evitar o erro TS2589
        const clientData = data as unknown as Cliente;
        setCliente(clientData);
        await fetchPets(clientData.id);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('client_id', clienteId);

      if (error) {
        throw error;
      }

      // Usando type assertion com unknown como intermediário
      const petData = data as unknown as Pet[];
      setPets(petData || []);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      toast.error('Erro ao carregar dados dos pets');
    }
  };

  const addPet = async (petData: Omit<Pet, "id" | "client_id" | "created_at" | "updated_at">) => {
    if (!cliente) {
      toast.error("Você precisa estar logado para adicionar um pet");
      return false;
    }

    try {
      const { error } = await supabase
        .from('pets')
        .insert([
          {
            client_id: cliente.id,
            ...petData
          }
        ]);

      if (error) {
        throw error;
      }

      toast.success("Pet adicionado com sucesso!");
      await fetchPets(cliente.id);
      return true;
    } catch (error) {
      console.error("Erro ao adicionar pet:", error);
      toast.error("Erro ao adicionar pet");
      return false;
    }
  };

  const updateCliente = async (clienteData: Partial<Cliente>) => {
    if (!cliente) {
      toast.error("Você precisa estar logado para atualizar o perfil");
      return false;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update(clienteData)
        .eq('id', cliente.id);

      if (error) {
        throw error;
      }

      toast.success("Perfil atualizado com sucesso!");
      await fetchCliente();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
      return false;
    }
  };

  return {
    cliente,
    pets,
    loading,
    addPet,
    updateCliente,
    reloadCliente: fetchCliente
  };
};
