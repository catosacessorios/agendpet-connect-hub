
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, DollarSign, Users, Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <AdminLayout title="Painel de Administração">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link to="/admin/servicos" className="flex flex-col items-center">
              <Scissors className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-center">Gerenciar Serviços</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Adicione, edite ou remova serviços oferecidos pelo petshop
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link to="/admin/horarios" className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-center">Gerenciar Horários</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Configure os horários disponíveis para agendamento
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link to="/admin/precos" className="flex flex-col items-center">
              <DollarSign className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-center">Gerenciar Preços</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Configure preços e promoções para os serviços
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link to="/admin/clientes" className="flex flex-col items-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-center">Gerenciar Clientes</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Visualize e gerencie os clientes cadastrados
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link to="/admin/agendamentos" className="flex flex-col items-center">
              <CalendarDays className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-center">Ver Agendamentos</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Visualize e gerencie todos os agendamentos
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
