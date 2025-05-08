
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Search, PlusIcon } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
};

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  notes: string | null;
};

const Clientes = () => {
  const { petshopProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Record<string, Pet[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Client Dialog
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Pet Dialog
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [currentClientForPet, setCurrentClientForPet] = useState<Client | null>(null);
  const [petFormData, setPetFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    notes: ""
  });

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'client' | 'pet', id: string, name: string } | null>(null);

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
    } catch (error) {
      console.error(`Error fetching pets for client ${clientId}:`, error);
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

  // Client Form Handlers
  const resetClientForm = () => {
    setClientFormData({
      name: "",
      email: "",
      phone: ""
    });
    setCurrentClient(null);
  };

  const openCreateClientDialog = () => {
    resetClientForm();
    setIsClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setCurrentClient(client);
    setClientFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone
    });
    setIsClientDialogOpen(true);
  };

  const handleSaveClient = async () => {
    try {
      if (!clientFormData.name || !clientFormData.phone) {
        toast.error("Nome e telefone são obrigatórios");
        return;
      }

      const clientData = {
        name: clientFormData.name,
        email: clientFormData.email || null,
        phone: clientFormData.phone,
        petshop_id: petshopProfile?.id
      };

      let error;

      if (currentClient) {
        // Update existing client
        const { error: updateError } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", currentClient.id);
        error = updateError;
        
        if (!error) {
          toast.success("Cliente atualizado com sucesso!");
        }
      } else {
        // Create new client
        const { error: insertError } = await supabase
          .from("clients")
          .insert([clientData]);
        error = insertError;
        
        if (!error) {
          toast.success("Cliente criado com sucesso!");
        }
      }

      if (error) throw error;

      // Refresh clients list
      fetchClients();
      
      // Close dialog and reset form
      setIsClientDialogOpen(false);
      resetClientForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cliente");
      console.error("Error saving client:", error);
    }
  };

  // Pet Form Handlers
  const resetPetForm = () => {
    setPetFormData({
      name: "",
      species: "dog",
      breed: "",
      age: "",
      weight: "",
      notes: ""
    });
  };

  const openAddPetDialog = (client: Client) => {
    setCurrentClientForPet(client);
    resetPetForm();
    setIsPetDialogOpen(true);
  };

  const handleSavePet = async () => {
    try {
      if (!petFormData.name || !petFormData.species) {
        toast.error("Nome e espécie são obrigatórios");
        return;
      }

      if (!currentClientForPet) {
        toast.error("Cliente não selecionado");
        return;
      }

      const petData = {
        name: petFormData.name,
        species: petFormData.species,
        breed: petFormData.breed || null,
        age: petFormData.age ? parseInt(petFormData.age) : null,
        weight: petFormData.weight ? parseFloat(petFormData.weight) : null,
        notes: petFormData.notes || null,
        client_id: currentClientForPet.id
      };

      const { error } = await supabase
        .from("pets")
        .insert([petData]);
      
      if (error) throw error;
      
      toast.success("Pet adicionado com sucesso!");
      
      // Refresh pets for this client
      fetchPetsByClientId(currentClientForPet.id);
      
      // Close dialog and reset form
      setIsPetDialogOpen(false);
      resetPetForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar pet");
      console.error("Error saving pet:", error);
    }
  };

  // Delete Handlers
  const openDeleteDialog = (type: 'client' | 'pet', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { type, id } = itemToDelete;
      
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
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(error.message || `Erro ao excluir ${itemToDelete.type === 'client' ? 'cliente' : 'pet'}`);
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    }
  };

  return (
    <DashboardLayout title="Clientes">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex-1 min-w-[200px] relative">
              <Input
                type="search"
                placeholder="Buscar clientes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            <Button onClick={openCreateClientDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Nenhum cliente encontrado.</p>
            <Button onClick={openCreateClientDialog}>Adicionar Cliente</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditClientDialog(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteDialog('client', client.id, client.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone</p>
                    <p>{client.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{client.email || "Não informado"}</p>
                  </div>
                </div>

                <Tabs defaultValue="pets">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pets">Pets</TabsTrigger>
                    <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pets">
                    {pets[client.id]?.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-4 font-medium text-gray-600">Nome</th>
                              <th className="text-left py-2 px-4 font-medium text-gray-600">Espécie</th>
                              <th className="text-left py-2 px-4 font-medium text-gray-600">Raça</th>
                              <th className="text-right py-2 px-4 font-medium text-gray-600">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pets[client.id].map((pet) => (
                              <tr key={pet.id} className="border-t hover:bg-gray-50">
                                <td className="py-3 px-4">{pet.name}</td>
                                <td className="py-3 px-4">{
                                  pet.species === "dog" ? "Cachorro" : 
                                  pet.species === "cat" ? "Gato" : 
                                  pet.species
                                }</td>
                                <td className="py-3 px-4">{pet.breed || "Não informado"}</td>
                                <td className="py-3 px-4 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openDeleteDialog('pet', pet.id, pet.name)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">Nenhum pet cadastrado</p>
                    )}
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => openAddPetDialog(client)}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Adicionar Pet
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="appointments">
                    <p className="text-center py-4 text-gray-500">Histórico de agendamentos em breve</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input 
                value={clientFormData.name}
                onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone *</label>
              <Input 
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                placeholder="(99) 99999-9999"
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsClientDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveClient}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pet Dialog */}
      <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Adicionar Pet para {currentClientForPet?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input 
                value={petFormData.name}
                onChange={(e) => setPetFormData({...petFormData, name: e.target.value})}
                placeholder="Nome do pet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Espécie *</label>
              <Select 
                value={petFormData.species} 
                onValueChange={(value) => setPetFormData({...petFormData, species: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="bird">Ave</SelectItem>
                  <SelectItem value="rodent">Roedor</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Raça</label>
              <Input 
                value={petFormData.breed}
                onChange={(e) => setPetFormData({...petFormData, breed: e.target.value})}
                placeholder="Raça (opcional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Idade (anos)</label>
                <Input 
                  type="number"
                  min="0"
                  value={petFormData.age}
                  onChange={(e) => setPetFormData({...petFormData, age: e.target.value})}
                  placeholder="Idade"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Peso (kg)</label>
                <Input 
                  type="number"
                  min="0"
                  step="0.1"
                  value={petFormData.weight}
                  onChange={(e) => setPetFormData({...petFormData, weight: e.target.value})}
                  placeholder="Peso"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Input 
                value={petFormData.notes}
                onChange={(e) => setPetFormData({...petFormData, notes: e.target.value})}
                placeholder="Observações (opcional)"
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPetDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSavePet}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir {itemToDelete?.type === 'client' ? 'o cliente' : 'o pet'} "{itemToDelete?.name}"?</p>
            {itemToDelete?.type === 'client' && (
              <p className="text-red-500 text-sm mt-2">Essa ação também excluirá todos os pets associados a este cliente.</p>
            )}
            <p className="text-gray-500 text-sm mt-2">Esta ação não pode ser desfeita.</p>
            
            <div className="pt-6 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clientes;
