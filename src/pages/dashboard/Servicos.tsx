
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const Servicos = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    filteredServices, 
    loading, 
    searchQuery, 
    setSearchQuery
  } = useServices();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  const handleAgendarServico = (serviceId: string) => {
    navigate(`/dashboard/agendamentos/novo?service=${serviceId}`);
  };

  const formatCurrency = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <DashboardLayout title="Serviços Disponíveis">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar serviços"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando serviços disponíveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices
            .filter(service => service.active)
            .map(service => (
              <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      {service.description && (
                        <CardDescription className="mt-2">{service.description}</CardDescription>
                      )}
                    </div>
                    <Badge>{formatCurrency(service.price)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    <p>Duração: {service.duration} minutos</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleAgendarServico(service.id)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Serviço
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
          {filteredServices.filter(service => service.active).length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Nenhum serviço disponível encontrado</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Servicos;
