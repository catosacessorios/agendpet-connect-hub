
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminAgendamentos = () => {
  return (
    <AdminLayout title="Gerenciar Agendamentos">
      <Card>
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-medium mb-2">Gerenciamento de Agendamentos</h2>
          <p className="text-gray-500">
            Esta funcionalidade está em desenvolvimento e será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAgendamentos;
