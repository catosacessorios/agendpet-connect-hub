
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  client: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
  };
  pet?: {
    id: string;
    name: string;
  };
};

const Agendamentos = () => {
  const { petshopProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);

  // New appointment form state
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    pet_id: "",
    service_id: "",
    appointment_date: new Date(),
    start_time: "",
    notes: ""
  });
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchAppointments();
      fetchClients();
      fetchServices();
    }
  }, [petshopProfile]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, dateFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedClientId) {
      fetchPetsByClient(selectedClientId);
    } else {
      setPets([]);
    }
  }, [selectedClientId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          notes,
          clients (id, name),
          services (id, name, price),
          pets (id, name)
        `)
        .eq("petshop_id", petshopProfile?.id)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        appointment_date: item.appointment_date,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        notes: item.notes,
        client: item.clients,
        service: item.services,
        pet: item.pets
      })) || [];

      setAppointments(formattedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("petshop_id", petshopProfile?.id)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration")
        .eq("petshop_id", petshopProfile?.id)
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchPetsByClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("id, name")
        .eq("client_id", clientId)
        .order("name");

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    // Filter by date
    if (dateFilter) {
      const filterDateStr = format(dateFilter, "yyyy-MM-dd");
      filtered = filtered.filter(app => app.appointment_date === filterDateStr);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Search by client name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app => app.client?.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);
        
      if (error) throw error;
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      // Get selected service to calculate end time
      const selectedService = services.find(service => service.id === formData.service_id);
      if (!selectedService) throw new Error("Serviço não encontrado");
      
      const appointmentDate = format(formData.appointment_date, "yyyy-MM-dd");
      const startTime = formData.start_time;
      
      // Calculate end time by adding service duration to start time
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const totalStartMinutes = startHours * 60 + startMinutes;
      const totalEndMinutes = totalStartMinutes + selectedService.duration;
      const endHours = Math.floor(totalEndMinutes / 60);
      const endMinutes = totalEndMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
      
      const { error } = await supabase
        .from("appointments")
        .insert({
          petshop_id: petshopProfile?.id,
          client_id: formData.client_id,
          pet_id: formData.pet_id || null,
          service_id: formData.service_id,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          notes: formData.notes,
          status: "pending"
        });
        
      if (error) throw error;
      
      // Refresh appointments
      fetchAppointments();
      
      // Reset form and close dialog
      setFormData({
        client_id: "",
        pet_id: "",
        service_id: "",
        appointment_date: new Date(),
        start_time: "",
        notes: ""
      });
      setSelectedClientId("");
      setIsNewAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  // Format date to local format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Format time (HH:MM)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Format currency to BRL
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  return (
    <DashboardLayout title="Agendamentos">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? (
                      format(dateFilter, "PPP", { locale: ptBR })
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Input
                type="search"
                placeholder="Buscar por cliente"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-auto">
              <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Novo Agendamento</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente</label>
                      <Select 
                        value={formData.client_id} 
                        onValueChange={(value) => {
                          setFormData({...formData, client_id: value});
                          setSelectedClientId(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pet (opcional)</label>
                      <Select 
                        value={formData.pet_id} 
                        onValueChange={(value) => setFormData({...formData, pet_id: value})}
                        disabled={!selectedClientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o pet" />
                        </SelectTrigger>
                        <SelectContent>
                          {pets.map(pet => (
                            <SelectItem key={pet.id} value={pet.id}>
                              {pet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Serviço</label>
                      <Select 
                        value={formData.service_id} 
                        onValueChange={(value) => setFormData({...formData, service_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map(service => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.price)} ({service.duration}min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.appointment_date ? (
                              format(formData.appointment_date, "PPP", { locale: ptBR })
                            ) : (
                              "Selecione uma data"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.appointment_date}
                            onSelect={(date) => date && setFormData({...formData, appointment_date: date})}
                            locale={ptBR}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Horário</label>
                      <Input 
                        type="time" 
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observações</label>
                      <Input 
                        placeholder="Observações (opcional)"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsNewAppointmentDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateAppointment}
                        disabled={!formData.client_id || !formData.service_id || !formData.start_time}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {filteredAppointments.length} agendamentos{" "}
            {dateFilter ? `para ${format(dateFilter, "dd/MM/yyyy")}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando agendamentos...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p>Nenhum agendamento encontrado.</p>
            </div>
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
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{appointment.client?.name || "N/A"}</td>
                      <td className="py-3 px-4">{appointment.service?.name || "N/A"}</td>
                      <td className="py-3 px-4">{formatDate(appointment.appointment_date)}</td>
                      <td className="py-3 px-4">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </td>
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
                        {formatCurrency(appointment.service?.price || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => handleUpdateStatus(appointment.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Mudar status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="confirmed">Confirmar</SelectItem>
                              <SelectItem value="completed">Concluir</SelectItem>
                              <SelectItem value="cancelled">Cancelar</SelectItem>
                            </SelectContent>
                          </Select>
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
    </DashboardLayout>
  );
};

export default Agendamentos;
