
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
    filteredClients,
    selectedClient,
    pets,
    searchQuery,
    setSearchQuery,
    setSelectedClient,
    isClientFormOpen,
    isPetFormOpen,
    isDeleteDialogOpen,
    itemToDelete,
    handleAddClient,
    handleSelectClient,
    handleSaveClient,
    handleCloseClientForm,
    handleAddPet,
    handleSavePet,
    handleClosePetForm,
    handleDeletePet,
    handleDeleteClient,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog
  } = useClients();

  return (
    <AdminLayout title="Gerenciar Clientes">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClient={handleAddClient}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <ClientCard 
            key={client.id}
            client={client}
            onSelect={() => handleSelectClient(client.id)}
            onEdit={() => handleAddClient(client)}
            onDelete={() => handleOpenDeleteDialog('client', client)}
          />
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum cliente encontrado</p>
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
                pets={pets}
                onDelete={handleOpenDeleteDialog}
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
      />

      {/* Pet Form Dialog */}
      <PetForm 
        isOpen={isPetFormOpen}
        onClose={handleClosePetForm}
        onSave={handleSavePet}
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
