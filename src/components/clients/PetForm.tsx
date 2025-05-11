
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Client, Pet } from "@/hooks/use-clients";

type PetFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (petData: {
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    notes: string;
  }) => Promise<boolean>;
  client: Client | null;
  initialData?: Pet | null;
};

export const PetForm: React.FC<PetFormProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          species: initialData.species,
          breed: initialData.breed || "",
          age: initialData.age ? initialData.age.toString() : "",
          weight: initialData.weight ? initialData.weight.toString() : "",
          notes: initialData.notes || ""
        });
      } else {
        // Reset form when dialog opens
        setFormData({
          name: "",
          species: "dog",
          breed: "",
          age: "",
          weight: "",
          notes: ""
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Pet" : `Adicionar Pet para ${client?.name || ""}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome *</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome do pet"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Espécie *</label>
            <Select 
              value={formData.species} 
              onValueChange={(value) => setFormData({...formData, species: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="bird">Ave</SelectItem>
                <SelectItem value="rodent">Roedor</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Raça</label>
            <Input 
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
              placeholder="Raça (opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Idade (anos)</label>
              <Input 
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="Idade"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg)</label>
              <Input 
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="Peso"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Input 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações (opcional)"
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
