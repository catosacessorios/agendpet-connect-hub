
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

const AdminConfiguracoes = () => {
  return (
    <AdminLayout title="Configurações do Administrador">
      <Card>
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-medium mb-2">Configurações do Administrador</h2>
          <p className="text-gray-500">
            Esta página permite configurar as opções avançadas do sistema.
            Esta funcionalidade está em desenvolvimento e será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminConfiguracoes;
