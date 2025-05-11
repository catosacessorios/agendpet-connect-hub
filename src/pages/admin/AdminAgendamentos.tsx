
import { useState } from "react";
import { Calendar } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const mockAppointments = [
  { 
    id: "1", 
    cliente: "Maria Silva", 
    petNome: "Rex", 
    data: "15/05/2025", 
    hora: "14:30", 
    servico: "Banho e Tosa", 
    status: "Confirmado" 
  },
  { 
    id: "2", 
    cliente: "João Pereira", 
    petNome: "Nina", 
    data: "16/05/2025", 
    hora: "10:00", 
    servico: "Consulta Veterinária", 
    status: "Pendente" 
  },
  { 
    id: "3", 
    cliente: "Ana Oliveira", 
    petNome: "Bolinha", 
    data: "17/05/2025", 
    hora: "16:15", 
    servico: "Banho", 
    status: "Confirmado" 
  }
];

const AdminAgendamentos = () => {
  const [appointments] = useState(mockAppointments);
  
  return (
    <AdminLayout title="Gerenciar Agendamentos">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Visualize e gerencie todos os agendamentos do pet shop
            </p>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.cliente}</TableCell>
                  <TableCell>{appointment.petNome}</TableCell>
                  <TableCell>{appointment.data}</TableCell>
                  <TableCell>{appointment.hora}</TableCell>
                  <TableCell>{appointment.servico}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "Confirmado" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm" className="text-red-500">Cancelar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAgendamentos;
