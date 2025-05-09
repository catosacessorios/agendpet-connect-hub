
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useClients, type Client } from "@/hooks/use-clients";
import { ClientForm } from "@/components/clients/ClientForm";
import { PetForm } from "@/components/clients/PetForm";
import { DeleteDialog } from "@/components/clients/DeleteDialog";
import { ClientCard } from "@/components/clients/ClientCard";
import { SearchBar } from "@/components/clients/SearchBar";

const Clientes = () => {
  const { 
    clients, 
    pets, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    saveClient, 
    savePet, 
    deleteItem 
  } = useClients();
  
  // Client Dialog
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  // Pet Dialog
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [currentClientForPet, setCurrentClientForPet] = useState<Client | null>(null);

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'client' | 'pet', id: string, name: string } | null>(null);

  // Client Form Handlers
  const openCreateClientDialog = () => {
    setCurrentClient(null);
    setIsClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setCurrentClient(client);
    setIsClientDialogOpen(true);
  };

  const handleSaveClient = async (clientData: { name: string; email: string; phone: string }) => {
    return await saveClient(clientData, currentClient);
  };

  // Pet Form Handlers
  const openAddPetDialog = (client: Client) => {
    setCurrentClientForPet(client);
    setIsPetDialogOpen(true);
  };

  const handleSavePet = async (petData: {
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    notes: string;
  }) => {
    if (!currentClientForPet) return false;
    return await savePet(petData, currentClientForPet.id);
  };

  // Delete Handlers
  const openDeleteDialog = (type: 'client' | 'pet', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    const success = await deleteItem(itemToDelete.type, itemToDelete.id);
    
    if (success) {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <DashboardLayout title="Clientes">
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onAddClient={openCreateClientDialog} 
      />

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Nenhum cliente encontrado.</p>
            <Button onClick={openCreateClientDialog}>Adicionar Cliente</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              pets={pets[client.id] || []}
              onEdit={() => openEditClientDialog(client)}
              onDelete={() => openDeleteDialog('client', client.id, client.name)}
              onAddPet={() => openAddPetDialog(client)}
              onDeletePet={(petId, petName) => openDeleteDialog('pet', petId, petName)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ClientForm
        isOpen={isClientDialogOpen}
        onClose={() => setIsClientDialogOpen(false)}
        onSave={handleSaveClient}
        initialData={currentClient}
      />

      <PetForm
        isOpen={isPetDialogOpen}
        onClose={() => setIsPetDialogOpen(false)}
        onSave={handleSavePet}
        client={currentClientForPet}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemType={itemToDelete?.type || 'client'}
        itemName={itemToDelete?.name}
      />
    </DashboardLayout>
  );
};

export default Clientes;
