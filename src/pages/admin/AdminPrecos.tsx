import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useServices, Service } from "@/hooks/use-services";
import { useAuth } from "@/contexts/AuthContext";
import { ServiceFormDialog, DeleteServiceDialog } from "@/components/services/ServiceDialogs";
import type { ServiceFormData } from "@/components/services/ServiceForm";
import { SearchBar } from "@/components/clients/SearchBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminPrecos = () => {
  const { petshopProfile } = useAuth();
  const { 
    filteredServices, 
    loading, 
    searchQuery, 
    setSearchQuery,
    updateService,
    deleteService
  } = useServices();
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    if (!petshopProfile?.id || !currentService) return false;

    const serviceData = {
      price: parseFloat(formData.price),
      // Only update the price, keep other fields the same
      name: currentService.name,
      description: currentService.description,
      duration: currentService.duration,
      active: currentService.active
    };

    return updateService(currentService.id, serviceData);
  };

  const handleDeleteService = async () => {
    if (!currentService) return;
    
    await deleteService(currentService.id);
    setIsDeleteDialogOpen(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <AdminLayout title="Gerenciar Preços">
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClient={() => {}}
        buttonLabel=""
        placeholder="Buscar serviços"
        showAddButton={false}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Preços</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando serviços...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description || "-"}</TableCell>
                    <TableCell>{formatPrice(service.price)}</TableCell>
                    <TableCell>{service.duration} minutos</TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Preço
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhum serviço encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog 
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={handleSaveService}
        currentService={currentService}
        priceOnly={true}
      />

      <DeleteServiceDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteService}
        serviceName={currentService?.name || null}
      />
    </AdminLayout>
  );
};

export default AdminPrecos;
