
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle } from "lucide-react";
import { ServiceList } from "@/components/services/ServiceList";
import { ServiceFormDialog, DeleteServiceDialog } from "@/components/services/ServiceDialogs";
import { useServices, Service } from "@/hooks/use-services";
import type { ServiceFormData } from "@/components/services/ServiceForm";

const Servicos = () => {
  const { petshopProfile } = useAuth();
  const { 
    filteredServices, 
    loading, 
    searchQuery, 
    setSearchQuery,
    createService,
    updateService,
    deleteService
  } = useServices();
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const openCreateDialog = () => {
    setCurrentService(null);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    if (!petshopProfile?.id) return false;

    const serviceData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      active: formData.active,
      petshop_id: petshopProfile.id
    };

    if (currentService) {
      return updateService(currentService.id, serviceData);
    } else {
      return createService(serviceData);
    }
  };

  const handleDeleteService = async () => {
    if (!currentService) return;
    
    await deleteService(currentService.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <DashboardLayout title="Serviços">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="search"
                placeholder="Buscar serviços"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {filteredServices.length} serviços encontrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceList 
            services={filteredServices}
            isLoading={loading}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        </CardContent>
      </Card>

      <ServiceFormDialog 
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={handleSaveService}
        currentService={currentService}
      />

      <DeleteServiceDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteService}
        serviceName={currentService?.name || null}
      />
    </DashboardLayout>
  );
};

export default Servicos;
