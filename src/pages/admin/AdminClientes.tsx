
import AdminLayout from "@/components/layout/AdminLayout";
import { useClients } from "@/hooks/use-clients";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/clients/SearchBar";
import { ClientCard } from "@/components/clients/ClientCard";
import { DeleteDialog } from "@/components/clients/DeleteDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/ClientForm";
import { PetForm } from "@/components/clients/PetForm";
import { PetsList } from "@/components/clients/PetsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminClientes = () => {
  const {
    clients,
    loading,
    pets,
    searchQuery,
    setSearchQuery,
    saveClient,
    savePet,
    deleteItem
  } = useClients();
  
  // Estados locais adicionais necessários para a página de admin
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isPetFormOpen, setIsPetFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'client' | 'pet';
    id: string;
    name: string;
  } | null>(null);
  const [currentClient, setCurrentClient] = useState<any | null>(null);
  const [currentPet, setCurrentPet] = useState<any | null>(null);

  // Handlers específicos para esta página
  const handleAddClient = (client?: any) => {
    setCurrentClient(client || null);
    setIsClientFormOpen(true);
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
    }
  };

  const handleCloseClientForm = () => {
    setIsClientFormOpen(false);
    setCurrentClient(null);
  };

  const handleSaveClient = async (clientData: any) => {
    const success = await saveClient(clientData, currentClient);
    if (success) {
      handleCloseClientForm();
    }
    return success;
  };

  const handleAddPet = (pet?: any, client?: any) => {
    setCurrentPet(pet || null);
    setCurrentClient(client || selectedClient);
    setIsPetFormOpen(true);
  };

  const handleClosePetForm = () => {
    setIsPetFormOpen(false);
    setCurrentPet(null);
  };

  const handleSavePet = async (petData: any) => {
    if (!currentClient?.id) return false;
    const success = await savePet(petData, currentClient.id);
    if (success) {
      handleClosePetForm();
    }
    return success;
  };

  const handleDeleteClient = async () => {
    if (!itemToDelete || itemToDelete.type !== 'client') return;
    await deleteItem(itemToDelete.type, itemToDelete.id);
    setIsDeleteDialogOpen(false);
    if (selectedClient?.id === itemToDelete.id) {
      setSelectedClient(null);
    }
  };

  const handleDeletePet = async () => {
    if (!itemToDelete || itemToDelete.type !== 'pet') return;
    await deleteItem(itemToDelete.type, itemToDelete.id);
    setIsDeleteDialogOpen(false);
  };

  const handleOpenDeleteDialog = (type: 'client' | 'pet', item: any) => {
    setItemToDelete({
      type,
      id: item.id,
      name: type === 'client' ? item.name : item.nome
    });
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <AdminLayout title="Gerenciar Clientes">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClient={handleAddClient}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.filter(client => 
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(client => (
          <ClientCard 
            key={client.id}
            client={client}
            onSelect={() => handleSelectClient(client.id)}
            onEdit={() => handleAddClient(client)}
            onDelete={() => handleOpenDeleteDialog('client', client)}
          />
        ))}
        
        {clients.length === 0 && !loading && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        )}
        
        {loading && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        )}
      </div>

      {/* Client details dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedClient.name}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-2 mb-6">
                <p><span className="font-medium">Email:</span> {selectedClient.email || "Não informado"}</p>
                <p><span className="font-medium">Telefone:</span> {selectedClient.phone}</p>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Pets</h3>
                <Button size="sm" onClick={() => handleAddPet()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Pet
                </Button>
              </div>

              <PetsList
                pets={pets[selectedClient.id] || []}
                onEdit={(pet) => handleAddPet(pet)}
                onDelete={(pet) => handleOpenDeleteDialog('pet', pet)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Form Dialog */}
      <ClientForm
        isOpen={isClientFormOpen}
        onClose={handleCloseClientForm}
        onSave={handleSaveClient}
        initialData={currentClient}
      />

      {/* Pet Form Dialog */}
      <PetForm 
        isOpen={isPetFormOpen}
        onClose={handleClosePetForm}
        onSave={handleSavePet}
        initialData={currentPet}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={itemToDelete?.type === 'client' ? handleDeleteClient : handleDeletePet}
        itemType={itemToDelete?.type || 'client'}
        itemName={itemToDelete?.name || null}
      />
    </AdminLayout>
  );
};

export default AdminClientes;
