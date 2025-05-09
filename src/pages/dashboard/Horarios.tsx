
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Clock } from "lucide-react";

import TimeSlotCard from "@/components/horarios/TimeSlotCard";
import AddTimeSlotDialog from "@/components/horarios/AddTimeSlotDialog";
import { useTimeSlots } from "@/hooks/use-time-slots";

const Horarios = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    loading,
    groupedSlots,
    formData,
    setFormData,
    saveSlot,
    deleteSlot,
    getDayName,
  } = useTimeSlots();

  const openCreateDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    const success = await saveSlot();
    if (success) {
      setIsDialogOpen(false);
    }
  };

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
            <TimeSlotCard
              key={dayIndex}
              dayName={getDayName(dayIndex)}
              slots={groupedSlots[dayIndex] || []}
              onDelete={deleteSlot}
            />
          ))}
        </div>
      )}

      {/* Add Time Slot Dialog */}
      <AddTimeSlotDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveSlot}
        formData={formData}
        setFormData={setFormData}
      />
    </DashboardLayout>
  );
};

export default Horarios;
