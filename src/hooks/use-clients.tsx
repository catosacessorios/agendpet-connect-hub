
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
};

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  notes: string | null;
  client_id: string;
};

export const useClients = () => {
  const { petshopProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Record<string, Pet[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchClients();
    }
  }, [petshopProfile]);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("petshop_id", petshopProfile?.id)
        .order("name");

      if (error) throw error;
      
      setClients(data || []);
      
      // Fetch pets for each client
      if (data) {
        await Promise.all(data.map(client => fetchPetsByClientId(client.id)));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetsByClientId = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("client_id", clientId)
        .order("name");

      if (error) throw error;
      
      setPets(prev => ({
        ...prev,
        [clientId]: data || []
      }));
      
      return data;
    } catch (error) {
      console.error(`Error fetching pets for client ${clientId}:`, error);
      return [];
    }
  };

  const filterClients = () => {
    if (!searchQuery) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(query) || 
      (client.email?.toLowerCase().includes(query) ?? false) ||
      client.phone.includes(query)
    );
    
    setFilteredClients(filtered);
  };

  const saveClient = async (
    clientData: { name: string; email: string; phone: string },
    currentClient: Client | null
  ) => {
    try {
      if (!clientData.name || !clientData.phone) {
        toast.error("Nome e telefone são obrigatórios");
        return false;
      }

      const dataToSave = {
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone,
        petshop_id: petshopProfile?.id
      };

      let error;

      if (currentClient) {
        // Update existing client
        const { error: updateError } = await supabase
          .from("clients")
          .update(dataToSave)
          .eq("id", currentClient.id);
        error = updateError;
        
        if (!error) {
          toast.success("Cliente atualizado com sucesso!");
        }
      } else {
        // Create new client
        const { error: insertError } = await supabase
          .from("clients")
          .insert([dataToSave]);
        error = insertError;
        
        if (!error) {
          toast.success("Cliente criado com sucesso!");
        }
      }

      if (error) throw error;

      // Refresh clients list
      fetchClients();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cliente");
      console.error("Error saving client:", error);
      return false;
    }
  };

  const savePet = async (
    petData: { 
      name: string; 
      species: string; 
      breed: string; 
      age: string;
      weight: string;
      notes: string;
    }, 
    clientId: string
  ) => {
    try {
      if (!petData.name || !petData.species) {
        toast.error("Nome e espécie são obrigatórios");
        return false;
      }

      const dataToSave = {
        name: petData.name,
        species: petData.species,
        breed: petData.breed || null,
        age: petData.age ? parseInt(petData.age) : null,
        weight: petData.weight ? parseFloat(petData.weight) : null,
        notes: petData.notes || null,
        client_id: clientId
      };

      const { error } = await supabase
        .from("pets")
        .insert([dataToSave]);
      
      if (error) throw error;
      
      toast.success("Pet adicionado com sucesso!");
      
      // Refresh pets for this client
      await fetchPetsByClientId(clientId);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar pet");
      console.error("Error saving pet:", error);
      return false;
    }
  };

  const deleteItem = async (type: 'client' | 'pet', id: string) => {
    try {
      if (type === 'client') {
        const { error } = await supabase
          .from("clients")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Cliente excluído com sucesso!");
        
        // Refresh clients list
        fetchClients();
      } else {
        const { error } = await supabase
          .from("pets")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Pet excluído com sucesso!");
        
        // Find which client this pet belongs to
        for (const clientId in pets) {
          if (pets[clientId].some(pet => pet.id === id)) {
            fetchPetsByClientId(clientId);
            break;
          }
        }
      }
      
      return true;
    } catch (error: any) {
      toast.error(error.message || `Erro ao excluir ${type === 'client' ? 'cliente' : 'pet'}`);
      console.error(`Error deleting ${type}:`, error);
      return false;
    }
  };

  return {
    clients: filteredClients,
    pets,
    loading,
    searchQuery,
    setSearchQuery,
    saveClient,
    savePet,
    deleteItem,
  };
};
