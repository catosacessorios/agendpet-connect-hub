
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente } from "@/hooks/use-cliente";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parse, isAfter, addMinutes } from "date-fns";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
};

type AvailableSlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type AvailableTime = {
  time: string;
  formattedTime: string;
};

const ClienteAgendar = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { cliente, pets, loading: clienteLoading } = useCliente();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([]);
  const [petshopId, setPetshopId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
      return;
    }
    
    fetchData();
  }, [user, authLoading, serviceId, navigate]);

  const fetchData = async () => {
    if (!serviceId) return;
    
    try {
      setLoading(true);
      
      // Buscar detalhes do serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .eq("active", true)
        .single();

      if (serviceError) throw serviceError;
      
      if (!serviceData) {
        toast.error("Serviço não encontrado ou não disponível");
        navigate("/cliente/servicos");
        return;
      }

      setService(serviceData);
      setPetshopId(serviceData.petshop_id);

      // Buscar slots disponíveis para o petshop
      const { data: slotsData, error: slotsError } = await supabase
        .from("available_slots")
        .select("day_of_week, start_time, end_time")
        .eq("petshop_id", serviceData.petshop_id);

      if (slotsError) throw slotsError;
      
      setAvailableSlots(slotsData || []);
    } catch (error: any) {
      console.error("Erro ao buscar dados para agendamento:", error);
      toast.error("Erro ao carregar informações do serviço");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && service) {
      generateAvailableTimes();
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
    }
  }, [selectedDate, service]);

  const generateAvailableTimes = async () => {
    if (!selectedDate || !service || !petshopId) return;
    
    const dayOfWeek = selectedDate.getDay();
    
    // Filtrar slots disponíveis para o dia da semana selecionado
    const slotsForDay = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    if (slotsForDay.length === 0) {
      setAvailableTimes([]);
      return;
    }

    // Verificar agendamentos existentes para o dia selecionado
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const { data: existingAppointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("appointment_date", formattedDate)
      .eq("petshop_id", petshopId);

    if (error) {
      console.error("Erro ao buscar agendamentos existentes:", error);
      toast.error("Erro ao verificar disponibilidade");
      return;
    }

    // Criar lista de horários disponíveis
    const times: AvailableTime[] = [];
    
    for (const slot of slotsForDay) {
      const startTime = parse(slot.start_time, "HH:mm:ss", new Date());
      const endTime = parse(slot.end_time, "HH:mm:ss", new Date());
      
      // Criar intervalos de acordo com a duração do serviço
      let currentTime = startTime;
      
      while (addMinutes(currentTime, service.duration) <= endTime) {
        const timeString = format(currentTime, "HH:mm:ss");
        
        // Verificar se o horário já está agendado
        const isBooked = existingAppointments?.some(appointment => {
          const appointmentStart = appointment.start_time;
          const appointmentEnd = appointment.end_time;
          
          const serviceEndTime = format(
            addMinutes(currentTime, service.duration),
            "HH:mm:ss"
          );
          
          return (
            (timeString >= appointmentStart && timeString < appointmentEnd) ||
            (serviceEndTime > appointmentStart && serviceEndTime <= appointmentEnd)
          );
        });
        
        if (!isBooked) {
          times.push({
            time: timeString,
            formattedTime: format(currentTime, "HH:mm")
          });
        }
        
        // Avançar para o próximo horário possível (de 30 em 30 minutos)
        currentTime = addMinutes(currentTime, 30);
      }
    }
    
    setAvailableTimes(times);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedPet || !service || !cliente) {
      toast.error("Preencha todos os campos para agendar");
      return;
    }
    
    try {
      setLoading(true);
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const endTimeDate = parse(selectedTime, "HH:mm:ss", new Date());
      const endTime = format(addMinutes(endTimeDate, service.duration), "HH:mm:ss");
      
      const { data, error } = await supabase
        .from("appointments")
        .insert([
          {
            client_id: cliente.id,
            pet_id: selectedPet,
            service_id: service.id,
            petshop_id: petshopId,
            appointment_date: formattedDate,
            start_time: selectedTime,
            end_time: endTime,
            status: "pending"
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Agendamento realizado com sucesso!");
      navigate("/cliente/agendamentos");
    } catch (error: any) {
      console.error("Erro ao realizar agendamento:", error);
      toast.error(error.message || "Erro ao realizar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hasSlotForDay = availableSlots.some(slot => slot.day_of_week === dayOfWeek);
    const isInPast = !isAfter(date, new Date());
    
    return !hasSlotForDay || isInPast;
  };

  if (loading || authLoading || clienteLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  if (!service) {
    return (
      <ClienteLayout title="Agendar Serviço">
        <Card>
          <CardContent className="py-6">
            <p className="text-center">Serviço não encontrado.</p>
          </CardContent>
        </Card>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout title="Agendar Serviço">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
          <CardDescription>
            {service.description || "Agende seu horário para este serviço"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <p className="font-medium mb-1">Preço:</p>
              <p>{service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">Duração:</p>
              <p>{service.duration} minutos</p>
            </div>
            
            <div className="space-y-2">
              <label className="font-medium">Selecione seu pet:</label>
              {pets.length > 0 ? (
                <Select
                  value={selectedPet}
                  onValueChange={setSelectedPet}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-red-500 text-sm">
                  Você não tem nenhum pet cadastrado.
                  <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate("/cliente/perfil")}>
                    Cadastrar pet
                  </Button>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium">Selecione a data:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="font-medium">Selecione o horário:</label>
              {selectedDate ? (
                availableTimes.length > 0 ? (
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map(timeSlot => (
                        <SelectItem key={timeSlot.time} value={timeSlot.time}>
                          {timeSlot.formattedTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-yellow-600">Não há horários disponíveis para esta data.</p>
                )
              ) : (
                <p className="text-gray-500">Selecione uma data para ver os horários disponíveis.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/cliente/servicos")}>
              Cancelar
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || !selectedPet || loading}
            >
              {loading ? "Processando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ClienteLayout>
  );
};

export default ClienteAgendar;
