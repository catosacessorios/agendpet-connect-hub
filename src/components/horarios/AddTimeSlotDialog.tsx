
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTimeSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: () => void;
  formData: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  };
  setFormData: (data: any) => void;
}

const AddTimeSlotDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  formData,
  setFormData,
}: AddTimeSlotDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Horário Disponível</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dia da Semana</label>
            <Select
              value={formData.day_of_week}
              onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
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
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Horário de Término</label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimeSlotDialog;
