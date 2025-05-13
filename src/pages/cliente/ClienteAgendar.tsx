import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import ClienteLayout from "@/components/layout/ClienteLayout";
import { useCliente } from "@/hooks/use-cliente";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos
type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  petshop_id: string;
};

type TimeSlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Pet = {
  id: string;
  name: string;
  species: string;
};

// Esquema de validação
const formSchema = z.object({
  pet_id: z.string({
    required_error: "Selecione um pet",
  }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
  time_slot: z.string({
    required_error: "Selecione um horário",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ClienteAgendar = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { cliente, pets, loading: clienteLoading } = useCliente();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pet_id: "",
      notes: "",
    },
  });
  
  // Fetch service data
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        
        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("id", serviceId)
          .single();
          
        if (serviceError) throw serviceError;
        
        if (!serviceData) {
          toast.error("Serviço não encontrado");
          navigate("/cliente/servicos");
          return;
        }
        
        setService(serviceData);
        
        // Fetch available time slots
        const { data: slotsData, error: slotsError } = await supabase
          .from("available_slots")
          .select("*")
          .eq("petshop_id", serviceData.petshop_id)
          .order("day_of_week")
          .order("start_time");
          
        if (slotsError) throw slotsError;
        
        // Generate available dates (next 30 days)
        const dates = generateAvailableDates(slotsData || []);
        setAvailableDates(dates);
        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar informações do serviço");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceData();
  }, [serviceId, navigate]);
  
  // Generate available dates (next 30 days)
  const generateAvailableDates = (slots: any[]) => {
    const today = new Date();
    const dates: Date[] = [];
    const daysOfWeek = [...new Set(slots.map(slot => slot.day_of_week))];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      if (daysOfWeek.includes(date.getDay())) {
        dates.push(date);
      }
    }
    
    return dates;
  };
  
  // Handle date selection
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !service) return;
    
    setSelectedDate(date);
    form.setValue("date", date);
    
    try {
      // Get day of week for selected date
      const dayOfWeek = date.getDay();
      
      // Fetch available slots for this day
      const { data: slotsData, error: slotsError } = await supabase
        .from("available_slots")
        .select("*")
        .eq("petshop_id", service.petshop_id)
        .eq("day_of_week", dayOfWeek)
        .order("start_time");
        
      if (slotsError) throw slotsError;
      
      // Check for existing appointments on this date to filter out booked slots
      const dateString = format(date, "yyyy-MM-dd");
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("appointment_date", dateString)
        .eq("petshop_id", service.petshop_id);
        
      if (appointmentsError) throw appointmentsError;
      
      // Filter out unavailable slots
      const bookedSlots = appointmentsData || [];
      const availableTimeSlots = (slotsData || []).filter(slot => {
        const slotStart = slot.start_time;
        const slotEnd = calculateEndTime(slotStart, service.duration);
        
        // Check if this slot overlaps with any booked slot
        return !bookedSlots.some(booked => {
          return (
            (slotStart >= booked.start_time && slotStart < booked.end_time) ||
            (slotEnd > booked.start_time && slotEnd <= booked.end_time) ||
            (slotStart <= booked.start_time && slotEnd >= booked.end_time)
          );
        });
      });
      
      setAvailableSlots(availableTimeSlots);
      
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      toast.error("Erro ao carregar horários disponíveis");
    }
  };
  
  // Calculate end time based on start time and service duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const timeFormat = "HH:mm:ss";
    const date = parse(startTime, timeFormat, new Date());
    const endDate = addMinutes(date, durationMinutes);
    return format(endDate, timeFormat);
  };
  
  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!service || !cliente || !selectedDate) {
      toast.error("Informações incompletas para agendamento");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get selected time slot
      const selectedSlot = availableSlots.find(slot => 
        slot.start_time === data.time_slot
      );
      
      if (!selectedSlot) {
        toast.error("Horário inválido ou não disponível");
        return;
      }
      
      const startTime = selectedSlot.start_time;
      const endTime = calculateEndTime(startTime, service.duration);
      const formattedDate = format(data.date, "yyyy-MM-dd");
      
      // Create appointment data
      const appointmentData = {
        client_id: cliente.id,
        service_id: service.id,
        pet_id: data.pet_id,
        appointment_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        notes: data.notes || null,
        petshop_id: service.petshop_id
      };
      
      const { error } = await supabase
        .from("appointments")
        .insert(appointmentData);
        
      if (error) throw error;
      
      toast.success("Agendamento realizado com sucesso!");
      navigate("/cliente/agendamentos");
      
    } catch (error: any) {
      console.error("Erro ao realizar agendamento:", error);
      toast.error(error.message || "Erro ao realizar agendamento");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading || clienteLoading) {
    return (
      <ClienteLayout title="Agendar Serviço">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </ClienteLayout>
    );
  }
  
  if (!service) {
    return (
      <ClienteLayout title="Serviço não encontrado">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">O serviço solicitado não foi encontrado.</p>
            <Button onClick={() => navigate("/cliente/servicos")}>
              Voltar para serviços
            </Button>
          </CardContent>
        </Card>
      </ClienteLayout>
    );
  }
  
  if (pets.length === 0) {
    return (
      <ClienteLayout title={`Agendar ${service.name}`}>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Você precisa cadastrar um pet antes de agendar um serviço.</p>
            <Button onClick={() => navigate("/cliente/perfil")}>
              Cadastrar pet
            </Button>
          </CardContent>
        </Card>
      </ClienteLayout>
    );
  }
  
  return (
    <ClienteLayout title={`Agendar ${service.name}`}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-gray-600">{service.description}</p>
            )}
            <p className="text-sm">
              <span className="font-medium">Duração:</span> {service.duration} minutos
            </p>
            <p className="text-sm">
              <span className="font-medium">Preço:</span> {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Agendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pet_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione o pet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um pet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pets.map(pet => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => handleDateSelect(date)}
                          disabled={(date) => {
                            // Disable dates that aren't in the available dates list
                            return !availableDates.some(
                              availableDate =>
                                availableDate.getDate() === date.getDate() &&
                                availableDate.getMonth() === date.getMonth() &&
                                availableDate.getFullYear() === date.getFullYear()
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedDate && availableSlots.length > 0 && (
                <FormField
                  control={form.control}
                  name="time_slot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.start_time}>
                              {formatTime(slot.start_time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {selectedDate && availableSlots.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-amber-600">Não há horários disponíveis para esta data</p>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione informações relevantes para este agendamento"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ClienteLayout>
  );
};

export default ClienteAgendar;
