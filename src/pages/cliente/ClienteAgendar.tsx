
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente } from "@/hooks/use-cliente";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { addDays, isAfter, isBefore, parseISO, addMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

// Tipos
type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
};

type TimeSlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Pet = {
  id: string;
  name: string;
};

// Esquema de validação
const agendamentoSchema = z.object({
  date: z.date({
    required_error: "Selecione uma data para o agendamento",
  }),
  time: z.string({
    required_error: "Selecione um horário disponível",
  }),
  pet_id: z.string({
    required_error: "Selecione um pet para o agendamento",
  }),
  notes: z.string().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

const ClienteAgendar = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cliente, pets, loading: clienteLoading } = useCliente();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      notes: "",
    },
  });

  const selectedDate = form.watch("date");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
      return;
    }

    if (serviceId) {
      fetchServiceData();
    } else {
      toast.error("Serviço não especificado");
      navigate("/cliente/servicos");
    }
  }, [user, authLoading, serviceId, navigate]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);

      // Buscar dados do serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Buscar slots de horários disponíveis
      const { data: slotsData, error: slotsError } = await supabase
        .from("available_slots")
        .select("*");

      if (slotsError) throw slotsError;
      setTimeSlots(slotsData || []);
    } catch (error) {
      console.error("Erro ao buscar dados do serviço:", error);
      toast.error("Erro ao carregar dados do serviço");
      navigate("/cliente/servicos");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimeSlots = async () => {
    if (!selectedDate || !service) return;

    try {
      const dayOfWeek = selectedDate.getDay();
      
      // Filtrar slots disponíveis para o dia da semana selecionado
      const availableSlots = timeSlots.filter(
        (slot) => slot.day_of_week === dayOfWeek
      );

      // Formatar para array de horários
      const formattedSlots: string[] = [];
      const dateString = format(selectedDate, "yyyy-MM-dd");

      for (const slot of availableSlots) {
        // Dividir o horário em intervalos com base na duração do serviço
        let startTime = parseISO(`${dateString}T${slot.start_time}`);
        const endTime = parseISO(`${dateString}T${slot.end_time}`);
        
        while (isBefore(addMinutes(startTime, service.duration), endTime)) {
          const timeString = format(startTime, "HH:mm");
          
          // Verificar se já existe um agendamento neste horário
          const { data: existingAppointments, error: appointmentError } = await supabase
            .from("appointments")
            .select("*")
            .eq("appointment_date", dateString)
            .eq("start_time", timeString)
            .eq("service_id", service.id);
            
          if (appointmentError) throw appointmentError;
          
          if (!existingAppointments || existingAppointments.length === 0) {
            formattedSlots.push(timeString);
          }
          
          startTime = addMinutes(startTime, service.duration);
        }
      }

      setAvailableTimeSlots(formattedSlots);
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      toast.error("Erro ao carregar horários disponíveis");
    }
  };

  const handleSubmit = async (data: AgendamentoFormData) => {
    if (!service || !cliente) return;
    
    try {
      setSaving(true);
      
      // Calcular horário de término
      const startDate = new Date(`${format(data.date, "yyyy-MM-dd")}T${data.time}`);
      const endDate = addMinutes(startDate, service.duration);
      const endTime = format(endDate, "HH:mm");
      
      const appointmentData = {
        client_id: cliente.id,
        service_id: service.id,
        pet_id: data.pet_id,
        appointment_date: format(data.date, "yyyy-MM-dd"),
        start_time: data.time,
        end_time: endTime,
        status: "pending",
        notes: data.notes || null,
      };
      
      const { error } = await supabase
        .from("appointments")
        .insert([appointmentData]);
        
      if (error) throw error;
      
      toast.success("Agendamento realizado com sucesso!");
      navigate("/cliente/agendamentos");
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      toast.error(error.message || "Erro ao realizar agendamento");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading || clienteLoading) {
    return (
      <ClienteLayout title="Agendamento de Serviço">
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </ClienteLayout>
    );
  }

  if (!service) {
    return (
      <ClienteLayout title="Serviço não encontrado">
        <div className="text-center">
          <p className="mb-4">O serviço solicitado não foi encontrado.</p>
          <Button onClick={() => navigate("/cliente/servicos")}>
            Ver Serviços Disponíveis
          </Button>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout title="Agendar Serviço">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agendar Serviço</CardTitle>
              <CardDescription>Selecione a data, horário e pet para o agendamento</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="space-y-6">
                  {/* Data */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <div className="flex items-center p-1">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          <div className="text-sm">
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              "Selecione uma data"
                            )}
                          </div>
                        </div>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date.getDay() === 0 || // Domingo
                              date.getDay() === 6 || // Sábado (se necessário desabilitar)
                              isBefore(date, addDays(new Date(), 0)) // Data no passado
                            }
                            className="border rounded-md p-3"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Horário */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário Disponível</FormLabel>
                        <div className="flex items-center mb-2">
                          <Clock className="mr-2 h-4 w-4 opacity-50" />
                          <div className="text-sm">
                            {field.value ? field.value : "Selecione um horário"}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time) => (
                              <Button
                                type="button"
                                key={time}
                                variant={field.value === time ? "default" : "outline"}
                                className="h-9"
                                onClick={() => field.onChange(time)}
                              >
                                {time}
                              </Button>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">
                              {selectedDate ? "Nenhum horário disponível nesta data" : "Selecione uma data primeiro"}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pet */}
                  <FormField
                    control={form.control}
                    name="pet_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um pet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pets.length > 0 ? (
                              pets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id}>
                                  {pet.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                Nenhum pet cadastrado
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {pets.length === 0 && (
                          <div className="mt-2">
                            <Button 
                              type="button" 
                              variant="link" 
                              className="p-0"
                              onClick={() => navigate("/cliente/perfil")}
                            >
                              Cadastrar um pet
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Observações */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <textarea
                            className={cn(
                              "flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            placeholder="Adicione informações relevantes para o atendimento..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={saving || pets.length === 0}
                  >
                    {saving ? "Agendando..." : "Confirmar Agendamento"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Preço:</span>
                <Badge variant="outline" className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(service.price)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duração:</span>
                <span>{service.duration} minutos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClienteLayout>
  );
};

export default ClienteAgendar;
