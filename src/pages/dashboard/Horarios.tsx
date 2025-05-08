
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2, Clock } from "lucide-react";

type AvailableSlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const Horarios = () => {
  const { petshopProfile } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchAvailableSlots();
    }
  }, [petshopProfile]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("available_slots")
        .select("*")
        .eq("petshop_id", petshopProfile?.id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: "",
      start_time: "",
      end_time: ""
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    try {
      if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
        toast.error("Preencha todos os campos");
        return;
      }

      // Validate time range
      if (formData.start_time >= formData.end_time) {
        toast.error("O horário de início deve ser anterior ao horário de término");
        return;
      }

      const slotData = {
        day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        petshop_id: petshopProfile?.id
      };

      // Check for overlapping slots
      const isOverlapping = availableSlots.some(slot => 
        slot.day_of_week === parseInt(formData.day_of_week) &&
        ((formData.start_time >= slot.start_time && formData.start_time < slot.end_time) ||
         (formData.end_time > slot.start_time && formData.end_time <= slot.end_time) ||
         (formData.start_time <= slot.start_time && formData.end_time >= slot.end_time))
      );

      if (isOverlapping) {
        toast.error("Este horário se sobrepõe a um horário existente");
        return;
      }

      console.log("Salvando horário:", slotData);
      const { error } = await supabase
        .from("available_slots")
        .insert([slotData]);
      
      if (error) {
        console.error("Erro na inserção:", error);
        throw error;
      }
      
      toast.success("Horário adicionado com sucesso!");
      
      // Refresh slots list
      fetchAvailableSlots();
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar horário");
      console.error("Error saving slot:", error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("available_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      toast.success("Horário removido com sucesso!");
      
      // Refresh slots list
      fetchAvailableSlots();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir horário");
      console.error("Error deleting slot:", error);
    }
  };

  // Format time (HH:MM)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Get day name in Portuguese
  const getDayName = (dayIndex: number) => {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[dayIndex];
  };

  // Group slots by day of week
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const day = slot.day_of_week;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(slot);
    return groups;
  }, {} as Record<number, AvailableSlot[]>);

  return (
    <DashboardLayout title="Horários Disponíveis">
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Configure os horários em que seu petshop está disponível para agendamentos
            </p>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Horário
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando horários...</p>
        </div>
      ) : Object.keys(groupedSlots).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum horário configurado. Adicione horários para começar.</p>
            <Button className="mt-6" onClick={openCreateDialog}>Adicionar Horário</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
            <Card key={dayIndex}>
              <CardHeader className="pb-2">
                <CardTitle>{getDayName(dayIndex)}</CardTitle>
              </CardHeader>
              <CardContent>
                {!groupedSlots[dayIndex] || groupedSlots[dayIndex].length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>Fechado</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {groupedSlots[dayIndex]?.map(slot => (
                      <li key={slot.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50">
                        <span>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Time Slot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adicionar Horário Disponível</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dia da Semana</label>
              <Select 
                value={formData.day_of_week} 
                onValueChange={(value) => setFormData({...formData, day_of_week: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda-feira</SelectItem>
                  <SelectItem value="2">Terça-feira</SelectItem>
                  <SelectItem value="3">Quarta-feira</SelectItem>
                  <SelectItem value="4">Quinta-feira</SelectItem>
                  <SelectItem value="5">Sexta-feira</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário de Início</label>
                <Input 
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Horário de Término</label>
                <Input 
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveSlot}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Horarios;
