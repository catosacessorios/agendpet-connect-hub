
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminConfiguracoes = () => {
  const { petshopProfile } = useAuth();
  const [petshopName, setPetshopName] = useState(petshopProfile?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simular uma chamada de API para salvar as configurações
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <AdminLayout title="Configurações do Administrador">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pet Shop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="petshop-name">Nome do Pet Shop</Label>
              <Input
                id="petshop-name"
                value={petshopName}
                onChange={(e) => setPetshopName(e.target.value)}
                placeholder="Nome do seu pet shop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="petshop-address">Endereço</Label>
              <Input
                id="petshop-address"
                placeholder="Endereço do pet shop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="petshop-phone">Telefone</Label>
              <Input
                id="petshop-phone"
                placeholder="(00) 00000-0000"
              />
            </div>

            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="mt-4"
            >
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Configure as opções avançadas do sistema de agendamento.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por Email</h3>
                  <p className="text-sm text-gray-500">
                    Enviar emails de confirmação para clientes
                  </p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por SMS</h3>
                  <p className="text-sm text-gray-500">
                    Enviar SMS para lembrar clientes sobre agendamentos
                  </p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminConfiguracoes;
