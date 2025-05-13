
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserType } from "@/hooks/use-user-type";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, User } from "lucide-react";
import { useCliente } from "@/hooks/use-cliente";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const PainelCliente = () => {
  const navigate = useNavigate();
  const { userType, loading: typeLoading } = useUserType();
  const { cliente, loading: clienteLoading, pets } = useCliente();

  // Redirect if not cliente type
  useEffect(() => {
    if (!typeLoading && userType !== 'cliente') {
      toast.error("Você não tem acesso ao painel de cliente");
      navigate('/cliente/login');
    }
  }, [userType, typeLoading, navigate]);

  if (typeLoading || clienteLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <ClienteLayout title="Painel do Cliente">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">Você precisa completar seu cadastro para continuar</p>
            <Button onClick={() => navigate("/cliente/perfil")}>
              Completar Cadastro
            </Button>
          </CardContent>
        </Card>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout title="Painel do Cliente">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Meu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Nome</h3>
                <p className="text-gray-600">{cliente.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">{cliente.email || "Não informado"}</p>
              </div>
              <div>
                <h3 className="font-medium">Telefone</h3>
                <p className="text-gray-600">{cliente.phone}</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cliente/perfil">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" /> Meus Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Visualize e gerencie todos os seus agendamentos de serviços para seus pets.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cliente/agendamentos">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Ver Agendamentos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pets.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {pets.map(pet => (
                      <div key={pet.id} className="border rounded-lg p-3">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-gray-600">
                          {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/cliente/perfil">
                      Gerenciar Pets
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Você ainda não cadastrou nenhum pet.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/cliente/perfil">
                      Adicionar Pet
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Serviços Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Veja os serviços disponíveis e faça um agendamento para seu pet.
          </p>
          <div className="flex justify-center">
            <Button className="w-full md:w-auto" asChild>
              <Link to="/cliente/servicos">
                Ver Serviços Disponíveis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </ClienteLayout>
  );
};

export default PainelCliente;
