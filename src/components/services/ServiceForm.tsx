
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Service } from "@/hooks/use-services";

type ServiceFormProps = {
  onSave: (formData: ServiceFormData) => Promise<boolean>;
  onCancel: () => void;
  initialData?: Service | null;
};

export type ServiceFormData = {
  name: string;
  description: string;
  price: string;
  duration: string;
  active: boolean;
};

export const ServiceForm: React.FC<ServiceFormProps> = ({ 
  onSave, 
  onCancel, 
  initialData 
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
    duration: "",
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price.toString(),
        duration: initialData.duration.toString(),
        active: initialData.active
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Serviço *</label>
        <Input 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Banho para Cães Pequenos"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição (opcional)</label>
        <Textarea 
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Detalhes sobre o serviço"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço (R$) *</label>
          <Input 
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="50.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duração (minutos) *</label>
          <Input 
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="60"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.active}
          onCheckedChange={handleSwitchChange}
        />
        <label className="text-sm font-medium">Serviço ativo</label>
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
};
