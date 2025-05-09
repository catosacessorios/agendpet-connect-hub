
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AvailableSlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export const useTimeSlots = () => {
  const { petshopProfile } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.log("Fetching available slots for petshop:", petshopProfile?.id);
      
      const { data, error } = await supabase
        .from("available_slots")
        .select("*")
        .eq("petshop_id", petshopProfile?.id)
        .order("day_of_week")
        .order("start_time");

      if (error) {
        console.error("Error fetching slots:", error);
        throw error;
      }
      
      console.log("Fetched slots:", data);
      setAvailableSlots(data || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Erro ao carregar horários");
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

  const saveSlot = async () => {
    try {
      if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
        toast.error("Preencha todos os campos");
        return false;
      }

      // Validate time range
      if (formData.start_time >= formData.end_time) {
        toast.error("O horário de início deve ser anterior ao horário de término");
        return false;
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
        return false;
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
      
      // Reset form
      resetForm();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar horário");
      console.error("Error saving slot:", error);
      return false;
    }
  };

  const deleteSlot = async (slotId: string) => {
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

  // Group slots by day of week
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const day = slot.day_of_week;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(slot);
    return groups;
  }, {} as Record<number, AvailableSlot[]>);

  // Get day name in Portuguese
  const getDayName = (dayIndex: number) => {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[dayIndex];
  };

  return {
    availableSlots,
    loading,
    groupedSlots,
    formData,
    setFormData,
    saveSlot,
    deleteSlot,
    resetForm,
    getDayName,
  };
};
