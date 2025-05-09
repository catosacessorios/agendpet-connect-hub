
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string; price: number } | null;
};

interface RecentAppointmentsProps {
  appointments: Appointment[];
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  formatCurrency: (value: number) => string;
}

const RecentAppointments = ({
  appointments,
  formatDate,
  formatTime,
  formatCurrency,
}: RecentAppointmentsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Agendamentos Recentes</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard/agendamentos")}
          >
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            Nenhum agendamento encontrado. Comece a adicionar agendamentos na seção "Agendamentos".
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Serviço</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Horário</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{appointment.clients?.name || "N/A"}</td>
                    <td className="py-3 px-4">{appointment.services?.name || "N/A"}</td>
                    <td className="py-3 px-4">{formatDate(appointment.appointment_date)}</td>
                    <td className="py-3 px-4">{formatTime(appointment.start_time)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                        appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                        appointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.status === "confirmed" ? "Confirmado" :
                         appointment.status === "cancelled" ? "Cancelado" :
                         appointment.status === "completed" ? "Concluído" :
                         "Pendente"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(appointment.services?.price || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAppointments;
