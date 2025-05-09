
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Client } from "@/hooks/use-clients";

type ClientFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: { name: string; email: string; phone: string }) => Promise<boolean>;
  initialData: Client | null;
};

export const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email || "",
        phone: initialData.phone
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: ""
      });
    }
  }, [initialData, isOpen]);

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
            {initialData ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome *</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone *</label>
            <Input 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(99) 99999-9999"
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
