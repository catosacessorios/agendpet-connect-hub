
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente } from "@/hooks/use-cliente";
import { useServices } from "@/hooks/use-services";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search } from "lucide-react";

const ClienteServicos = () => {
  const { user, loading: authLoading } = useAuth();
  const { cliente, loading: clienteLoading } = useCliente();
  const { services, loading: servicesLoading } = useServices();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
    }
  }, [user, authLoading, navigate]);

  const filteredServices = services.filter(service => 
    service.active && (
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (authLoading || clienteLoading || servicesLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  return (
    <ClienteLayout title="Serviços Disponíveis">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
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
                onClick={() => navigate(`/cliente/agendar/${service.id}`)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Serviço
              </Button>
            </CardFooter>
          </Card>
        ))}
          
        {filteredServices.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum serviço disponível encontrado</p>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
};

export default ClienteServicos;
