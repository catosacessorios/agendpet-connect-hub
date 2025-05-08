
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
};

const Servicos = () => {
  const { petshopProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    active: true
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchServices();
    }
  }, [petshopProfile]);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("petshop_id", petshopProfile?.id)
        .order("name");

      if (error) throw error;
      
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchQuery) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(query) || 
      (service.description?.toLowerCase().includes(query) ?? false)
    );
    
    setFilteredServices(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      active: true
    });
    setCurrentService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      active: service.active
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveService = async () => {
    try {
      if (!formData.name || !formData.price || !formData.duration) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        active: formData.active,
        petshop_id: petshopProfile?.id
      };

      let error;

      if (currentService) {
        // Update existing service
        const { error: updateError } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", currentService.id);
        error = updateError;
        
        if (!error) {
          toast.success("Serviço atualizado com sucesso!");
        }
      } else {
        // Create new service
        const { error: insertError } = await supabase
          .from("services")
          .insert([serviceData]);
        error = insertError;
        
        if (!error) {
          toast.success("Serviço criado com sucesso!");
        }
      }

      if (error) throw error;

      // Refresh services list
      fetchServices();
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar serviço");
      console.error("Error saving service:", error);
    }
  };

  const handleDeleteService = async () => {
    try {
      if (!currentService) return;

      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", currentService.id);

      if (error) throw error;

      toast.success("Serviço excluído com sucesso!");
      
      // Refresh services list
      fetchServices();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setCurrentService(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir serviço");
      console.error("Error deleting service:", error);
    }
  };

  // Format currency to BRL
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
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
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando serviços...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p>Nenhum serviço encontrado. Adicione um novo serviço para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Serviço</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Descrição</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Duração</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Preço</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{service.name}</td>
                      <td className="py-3 px-4">
                        {service.description || "Sem descrição"}
                      </td>
                      <td className="py-3 px-4 text-center">{service.duration} min</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          service.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {service.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog(service)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Serviço *</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Banho para Cães Pequenos"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes sobre o serviço"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço (R$) *</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="50.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duração (minutos) *</label>
                <Input 
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              />
              <label className="text-sm font-medium">Serviço ativo</label>
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveService}>
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
            <p>Tem certeza que deseja excluir o serviço "{currentService?.name}"?</p>
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
                onClick={handleDeleteService}
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

export default Servicos;
